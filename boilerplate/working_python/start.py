import os
import json
import hmac
import hashlib
import asyncio
import websockets
import base64
import uvicorn
from fastapi import FastAPI, Request
from dotenv import load_dotenv
import subprocess

# Load environment variables from .env
load_dotenv()

# Get env vars
ZOOM_SECRET_TOKEN = os.getenv("ZOOM_SECRET_TOKEN")
CLIENT_ID = os.getenv("ZM_CLIENT_ID")
CLIENT_SECRET = os.getenv("ZM_CLIENT_SECRET")
PORT = int(os.getenv("PORT", 3000))
WEBHOOK_PATH = os.getenv("WEBHOOK_PATH", "/")

app = FastAPI()

# WebSocket and audio state
active_connections = {}


def generate_signature(client_id, meeting_uuid, stream_id, client_secret):
    message = f"{client_id},{meeting_uuid},{stream_id}"
    return hmac.new(
        client_secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

async def convert_raw_to_wav(input_file, output_file):
    try:
        command = [
            'ffmpeg', '-y',
            '-f', 's16le',
            '-ar', '16000',
            '-ac', '1',
            '-i', input_file,
            output_file
        ]
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await process.communicate()
        os.unlink(input_file)
        print(f"WAV saved: {output_file}")
    except Exception as e:
        print(f"Conversion error: {e}")

async def connect_to_signaling_websocket(meeting_uuid, stream_id, server_url):
    print(f"Connecting to signaling WebSocket for meeting {meeting_uuid}")
    try:
        async with websockets.connect(server_url) as ws:
            if meeting_uuid not in active_connections:
                active_connections[meeting_uuid] = {}
            active_connections[meeting_uuid]["signaling"] = ws

            signature = generate_signature(CLIENT_ID, meeting_uuid, stream_id, CLIENT_SECRET)
            handshake = {
                "msg_type": 1,
                "protocol_version": 1,
                "meeting_uuid": meeting_uuid,
                "rtms_stream_id": stream_id,
                "sequence": int(asyncio.get_event_loop().time() * 1e9),
                "signature": signature
            }
            await ws.send(json.dumps(handshake))
            print("Sent handshake")

            while True:
                try:
                    data = await ws.recv()
                    msg = json.loads(data)

                    if msg["msg_type"] == 2 and msg["status_code"] == 0:
                        media_url = msg.get("media_server", {}).get("server_urls", {}).get("all")
                        if media_url:
                            asyncio.create_task(
                                connect_to_media_websocket(media_url, meeting_uuid, stream_id, ws)
                            )

                    if msg["msg_type"] == 12:
                        await ws.send(json.dumps({
                            "msg_type": 13,
                            "timestamp": msg["timestamp"]
                        }))

                except websockets.exceptions.ConnectionClosed:
                    break
                except Exception as e:
                    print(f"Signaling error: {e}")
                    break
    except Exception as e:
        print(f"Signaling socket error: {e}")
    finally:
        print("Signaling socket closed")
        if meeting_uuid in active_connections:
            active_connections[meeting_uuid].pop("signaling", None)

async def connect_to_media_websocket(media_url, meeting_uuid, stream_id, signaling_socket):
    print(f"Connecting to media WebSocket at {media_url}")
    try:
        async with websockets.connect(media_url, ssl=False) as media_ws:
            if meeting_uuid in active_connections:
                active_connections[meeting_uuid]["media"] = media_ws

            audio_chunks[meeting_uuid] = []

            signature = generate_signature(CLIENT_ID, meeting_uuid, stream_id, CLIENT_SECRET)
            handshake = {
                "msg_type": 3,
                "protocol_version": 1,
                "meeting_uuid": meeting_uuid,
                "rtms_stream_id": stream_id,
                "signature": signature,
                "media_type": 1,
                "payload_encryption": False
            }
            await media_ws.send(json.dumps(handshake))

            while True:
                try:
                    data = await media_ws.recv()
                    try:
                        msg = json.loads(data)

                        if msg["msg_type"] == 4 and msg["status_code"] == 0:
                            await signaling_socket.send(json.dumps({
                                "msg_type": 7,
                                "rtms_stream_id": stream_id
                            }))

                        if msg["msg_type"] == 12:
                            await media_ws.send(json.dumps({
                                "msg_type": 13,
                                "timestamp": msg["timestamp"]
                            }))

                        if msg["msg_type"] == 14 and msg.get("content", {}).get("data"):
                            audio_data = base64.b64decode(msg["content"]["data"])
                            
                        if msg["msg_type"] == 15 and msg.get("content", {}).get("data"):
                            video_data = base64.b64decode(msg["content"]["data"])
                            
                        if msg["msg_type"] == 17 and msg.get("content", {}).get("data"):
                            transcript_data = base64.b64decode(msg["content"]["data"])                       
                    except json.JSONDecodeError:
                        pass

                except websockets.exceptions.ConnectionClosed:
                    break
                except Exception as e:
                    print(f"Media socket error: {e}")
                    break
    except Exception as e:
        print(f"Media socket error: {e}")
    finally:
        print("Media socket closed")
        if meeting_uuid in active_connections:
            active_connections[meeting_uuid].pop("media", None)

# Dynamically bind webhook endpoint from .env
@app.api_route(WEBHOOK_PATH, methods=["POST"])
async def webhook(request: Request):
    body = await request.json()
    print("RTMS Webhook received:", json.dumps(body, indent=2))
    event = body.get("event")
    payload = body.get("payload", {})

    if event == "endpoint.url_validation" and payload.get("plainToken"):
        token = payload["plainToken"]
        hashed = hmac.new(ZOOM_SECRET_TOKEN.encode(), token.encode(), hashlib.sha256).hexdigest()
        return {"plainToken": token, "encryptedToken": hashed}

    if event == "meeting.rtms_started":
        meeting_uuid = payload.get("meeting_uuid")
        stream_id = payload.get("rtms_stream_id")
        server_url = payload.get("server_urls")
        if all([meeting_uuid, stream_id, server_url]):
            asyncio.create_task(connect_to_signaling_websocket(meeting_uuid, stream_id, server_url))

    if event == "meeting.rtms_stopped":
        meeting_uuid = payload.get("meeting_uuid")
        if meeting_uuid in active_connections:
            for conn in active_connections[meeting_uuid].values():
                if conn and hasattr(conn, "close"):
                    await conn.close()
            active_connections.pop(meeting_uuid, None)

    return {"status": "ok"}

if __name__ == "__main__":
    print(f"Server running on port {PORT} with webhook path '{WEBHOOK_PATH}'")
    uvicorn.run("start:app", host="0.0.0.0", port=PORT, reload=False)
