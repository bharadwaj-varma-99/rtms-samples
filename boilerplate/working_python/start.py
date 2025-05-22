import os
import json
import hmac
import hashlib
import asyncio
import ssl
from fastapi import FastAPI, Request
from aiohttp import ClientSession, TCPConnector, WSMsgType
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

APP_PORT = int(os.getenv("PORT", "3000"))
WEBHOOK_PATH = os.getenv("WEBHOOK_PATH", "/webhook")
ZOOM_SECRET_TOKEN = os.getenv("ZOOM_SECRET_TOKEN")
CLIENT_ID = os.getenv("ZM_CLIENT_ID")
CLIENT_SECRET = os.getenv("ZM_CLIENT_SECRET")

active_connections = {}

def generate_signature(client_id, meeting_uuid, stream_id, client_secret):
    message = f"{client_id},{meeting_uuid},{stream_id}"
    return hmac.new(
        client_secret.encode(), message.encode(), hashlib.sha256
    ).hexdigest()

async def connect_to_signaling_websocket(meeting_uuid, stream_id, server_url):
    print(f"Connecting to signaling WebSocket: {server_url}")
    ssl_context = ssl._create_unverified_context()

    async with ClientSession(connector=TCPConnector(ssl=False)) as session:
        async with session.ws_connect(server_url, ssl=ssl_context) as ws:
            active_connections.setdefault(meeting_uuid, {})["signaling"] = ws

            signature = generate_signature(CLIENT_ID, meeting_uuid, stream_id, CLIENT_SECRET)
            handshake = {
                "msg_type": 1,
                "protocol_version": 1,
                "meeting_uuid": meeting_uuid,
                "rtms_stream_id": stream_id,
                "sequence": int(asyncio.get_event_loop().time() * 1e9),
                "signature": signature
            }

            await ws.send_json(handshake)
            print("Handshake sent to signaling server")

            async for msg in ws:
                if msg.type == WSMsgType.TEXT:
                    try:
                        data = json.loads(msg.data)
                        print("Signaling message:", json.dumps(data, indent=2))

                        if data["msg_type"] == 2 and data["status_code"] == 0:
                            media_url = data.get("media_server", {}).get("server_urls", {}).get("all")
                            if media_url:
                                asyncio.create_task(
                                    connect_to_media_websocket(media_url, meeting_uuid, stream_id, session, ws)
                                )

                        elif data["msg_type"] == 12:
                            await ws.send_json({
                                "msg_type": 13,
                                "timestamp": data["timestamp"]
                            })
                            print("Signaling KEEP_ALIVE_RESP sent")

                    except Exception as e:
                        print(f"Error parsing signaling message: {e}")

                elif msg.type == WSMsgType.CLOSED:
                    break
                elif msg.type == WSMsgType.ERROR:
                    print("WebSocket error:", msg.data)
                    break

async def connect_to_media_websocket(media_url, meeting_uuid, stream_id, session, signaling_ws):
    print(f"Connecting to media WebSocket: {media_url}")
    ssl_context = ssl._create_unverified_context()

    async with session.ws_connect(media_url, ssl=ssl_context) as ws:
        active_connections.setdefault(meeting_uuid, {})["media"] = ws

        signature = generate_signature(CLIENT_ID, meeting_uuid, stream_id, CLIENT_SECRET)
        handshake = {
            "msg_type": 3,
            "protocol_version": 1,
            "meeting_uuid": meeting_uuid,
            "rtms_stream_id": stream_id,
            "signature": signature,
            "media_type": 32,
            "payload_encryption": False,
            "media_params": {
                "audio": {
                    "content_type": 1,
                    "sample_rate": 1,
                    "channel": 1,
                    "codec": 1,
                    "data_opt": 1,
                    "send_rate": 100
                },
                "video": {
                    "codec": 7,
                    "resolution": 2,
                    "fps": 25
                }
            }
        }

        await ws.send_json(handshake)
        print("Media handshake sent")

        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                try:
                    data = json.loads(msg.data)
                    print("Media message:", json.dumps(data, indent=2))

                    if data["msg_type"] == 4 and data["status_code"] == 0:
                        await signaling_ws.send_json({
                            "msg_type": 7,
                            "rtms_stream_id": stream_id
                        })
                        print("CLIENT_READY_ACK sent")

                    elif data["msg_type"] == 12:
                        await ws.send_json({
                            "msg_type": 13,
                            "timestamp": data["timestamp"]
                        })
                        print("Media KEEP_ALIVE_RESP sent")

                except json.JSONDecodeError:
                    print("Binary or malformed data received")

            elif msg.type == WSMsgType.BINARY:
                print("Binary data received (audio/video)")

            elif msg.type == WSMsgType.CLOSED or msg.type == WSMsgType.ERROR:
                print("Media WebSocket closed")
                break

@app.post(WEBHOOK_PATH)
async def webhook(request: Request):
    body = await request.json()
    print("RTMS Webhook received:", json.dumps(body, indent=2))

    event = body.get("event")
    payload = body.get("payload", {})

    if event == "endpoint.url_validation" and payload.get("plainToken"):
        token = payload["plainToken"]
        encrypted_token = hmac.new(
            ZOOM_SECRET_TOKEN.encode(), token.encode(), hashlib.sha256
        ).hexdigest()
        return {"plainToken": token, "encryptedToken": encrypted_token}

    elif event == "meeting.rtms_started":
        print("RTMS started")
        meeting_uuid = payload.get("meeting_uuid")
        stream_id = payload.get("rtms_stream_id")
        server_url = payload.get("server_urls")
        if all([meeting_uuid, stream_id, server_url]):
            asyncio.create_task(connect_to_signaling_websocket(meeting_uuid, stream_id, server_url))

    elif event == "meeting.rtms_stopped":
        print("RTMS stopped")
        meeting_uuid = payload.get("meeting_uuid")
        if meeting_uuid in active_connections:
            for conn in active_connections[meeting_uuid].values():
                await conn.close()
            active_connections.pop(meeting_uuid, None)

    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    print(f"Server running at http://localhost:{APP_PORT}")
    print(f"Webhook endpoint available at http://localhost:{APP_PORT}{WEBHOOK_PATH}")
    uvicorn.run(app, host="0.0.0.0", port=APP_PORT)
