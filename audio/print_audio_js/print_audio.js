import os
import json
import hmac
import hashlib
import asyncio
import websockets
import uvicorn
from fastapi import FastAPI, Request, WebSocket
from dotenv import load_dotenv

# Load environment variables from .env file
print("Loading environment variables...")
load_dotenv()

app = FastAPI()
port = 3000

# Environment variables
ZOOM_SECRET_TOKEN = os.getenv("ZOOM_SECRET_TOKEN")
CLIENT_ID = os.getenv("ZM_CLIENT_ID")
CLIENT_SECRET = os.getenv("ZM_CLIENT_SECRET")

# Dictionary to manage active WebSocket connections
active_connections = {}

def generate_signature(client_id, meeting_uuid, stream_id, client_secret):
    """Generate signature for authentication."""
    print(f"Generating signature for client_id: {client_id}, meeting_uuid: {meeting_uuid}, stream_id: {stream_id}")
    message = f"{client_id},{meeting_uuid},{stream_id}"
    signature = hmac.new(
        client_secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    print(f"Generated signature: {signature}")
    return signature

@app.post("/webhook")
async def webhook(request: Request):
    """Handle webhook events."""
    body = await request.json()
    print("RTMS Webhook received:", json.dumps(body, indent=2))

    event = body.get("event")
    payload = body.get("payload", {})

    # URL validation event
    if event == "endpoint.url_validation" and payload.get("plainToken"):
        hash_obj = hmac.new(
            ZOOM_SECRET_TOKEN.encode(),
            payload["plainToken"].encode(),
            hashlib.sha256
        )
        print("Responding to URL validation challenge")
        return {
            "plainToken": payload["plainToken"],
            "encryptedToken": hash_obj.hexdigest()
        }

    # RTMS started event
    if event == "meeting.rtms_started":
        print("RTMS Started event received")
        meeting_uuid = payload.get("meeting_uuid")
        rtms_stream_id = payload.get("rtms_stream_id")
        server_urls = payload.get("server_urls")
        if meeting_uuid and rtms_stream_id and server_urls:
            asyncio.create_task(
                connect_to_signaling_websocket(meeting_uuid, rtms_stream_id, server_urls)
            )

    # RTMS stopped event
    if event == "meeting.rtms_stopped":
        print("RTMS Stopped event received")
        meeting_uuid = payload.get("meeting_uuid")
        if meeting_uuid in active_connections:
            connections = active_connections[meeting_uuid]
            for conn in connections.values():
                if conn and hasattr(conn, "close"):
                    await conn.close()
            active_connections.pop(meeting_uuid, None)

    return {"status": "ok"}

async def connect_to_signaling_websocket(meeting_uuid, stream_id, server_url):
    """Connect to the signaling WebSocket server."""
    print(f"Connecting to signaling WebSocket for meeting {meeting_uuid}")
    try:
        async with websockets.connect(server_url) as ws:
            if meeting_uuid not in active_connections:
                active_connections[meeting_uuid] = {}
            active_connections[meeting_uuid]["signaling"] = ws

            signature = generate_signature(CLIENT_ID, meeting_uuid, stream_id, CLIENT_SECRET)

            # Handshake message
            handshake = {
                "msg_type": 1,
                "protocol_version": 1,
                "meeting_uuid": meeting_uuid,
                "rtms_stream_id": stream_id,
                "sequence": int(asyncio.get_event_loop().time() * 1e9),
                "signature": signature
            }
            await ws.send(json.dumps(handshake))
            print("Sent handshake to signaling server")

            while True:
                try:
                    data = await ws.recv()
                    print("Raw Signaling Data:", data)
                    msg = json.loads(data)
                    print("Signaling Message:", json.dumps(msg, indent=2))

                    if msg.get("msg_type") == 2 and msg.get("status_code") == 0:
                        media_url = msg.get("media_server", {}).get("server_urls", {}).get("all")
                        if media_url:
                            asyncio.create_task(
                                connect_to_media_websocket(media_url, meeting_uuid, stream_id, ws)
                            )

                    if msg.get("msg_type") == 12:
                        response = {
                            "msg_type": 13,
                            "timestamp": msg.get("timestamp")
                        }
                        await ws.send(json.dumps(response))
                        print("Sent KEEP_ALIVE_RESP")
                except Exception as e:
                    print(f"Error in signaling WebSocket: {e}")
                    break
    except Exception as e:
        print(f"Signaling WebSocket error: {e}")
    finally:
        print("Signaling WebSocket closed")
        if meeting_uuid in active_connections:
            active_connections[meeting_uuid].pop("signaling", None)

async def connect_to_media_websocket(media_url, meeting_uuid, stream_id, signaling_socket):
    """Connect to the media WebSocket server."""
    print(f"Connecting to media WebSocket at {media_url}")
    try:
        async with websockets.connect(media_url, ssl=False) as media_ws:
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
            print("Media WebSocket handshake sent")

            while True:
                try:
                    data = await media_ws.recv()
                    print("Received media data:", data)
                    try:
                        msg = json.loads(data)
                        print("Media Message:", json.dumps(msg, indent=2))

                        if msg.get("msg_type") == 4 and msg.get("status_code") == 0:
                            await signaling_socket.send(json.dumps({
                                "msg_type": 7,
                                "rtms_stream_id": stream_id
                            }))
                            print("Sent start streaming request")

                        if msg.get("msg_type") == 12:
                            await media_ws.send(json.dumps({
                                "msg_type": 13,
                                "timestamp": msg.get("timestamp")
                            }))
                    except json.JSONDecodeError:
                        print("Raw audio data:", data.hex())
                except Exception as e:
                    print(f"Media WebSocket error: {e}")
                    break
    except Exception as e:
        print(f"Error connecting to media WebSocket: {e}")

if __name__ == "__main__":
    print(f"Server running at http://0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
