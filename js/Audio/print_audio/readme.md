# Audio Processing Project

A Node.js implementation demonstrating Zoom's Real-Time Media Streams (RTMS) for capturing meeting audio data.

## Setup

Required env vars in `.env`:
```
ZOOM_SECRET_TOKEN=your_token
ZM_CLIENT_ID=your_client_id
ZM_CLIENT_SECRET=your_client_secret
```

## RTMS Flow

### 1. Connection Establishment
```javascript
// 1. Zoom sends webhook with server URLs
{
    "event": "meeting.rtms_started",
    "payload": {
        "meeting_uuid": "uuid",
        "rtms_stream_id": "stream_id", 
        "server_urls": "wss://..."
    }
}

// 2. Connect to signaling server with auth
const signature = HMAC_SHA256(`${clientId},${meetingUuid},${streamId}`, SECRET);
{
    msg_type: 1, // SIGNALING_HAND_SHAKE_REQ
    meeting_uuid: meetingUuid,
    rtms_stream_id: streamId,
    signature: signature
}

// 3. Server responds with media endpoint
{
    msg_type: 2, // SIGNALING_HAND_SHAKE_RESP 
    status_code: 0,
    media_server: {
        server_urls: {
            all: "wss://media-server"
        }
    }
}

// 4. Connect to media server
{
    msg_type: 3, // DATA_HAND_SHAKE_REQ
    meeting_uuid: meetingUuid,
    rtms_stream_id: streamId,
    signature: signature,
    media_type: 1, // AUDIO
    payload_encryption: false
}
```

### 2. Data Flow

```javascript
// Signaling Connection
- Handles authentication & session management
- Manages keep-alive (15s intervals)
- Controls media stream state

// Media Connection  
- Receives raw audio packets
- Format: 16kHz mono PCM
- Data comes as binary WebSocket messages
- Outputs as hex for debugging
```

### 3. Connection Management

```javascript
// Track active connections per meeting
const activeConnections = new Map();
// Structure:
{
    [meetingUuid]: {
        signaling: WebSocket,
        media: WebSocket
    }
}

// Cleanup on meeting end
meeting.rtms_stopped -> close all sockets -> remove from map
```

## Message Types & Flow

```
Signaling Messages:
1 -> SIGNALING_HAND_SHAKE_REQ  // Initial auth
2 <- SIGNALING_HAND_SHAKE_RESP // Get media URL
12 <- KEEP_ALIVE_REQ          // Every 15s
13 -> KEEP_ALIVE_RESP         // Must respond

Media Messages:
3 -> DATA_HAND_SHAKE_REQ     // Media auth
4 <- DATA_HAND_SHAKE_RESP    // Start streaming
7 -> CLIENT_READY_ACK        // Ready for data
<- Binary audio packets      // Raw PCM data
```

## Implementation Notes

- Uses separate WebSocket connections for signaling and media
- Signaling connection must stay alive for media flow
- 3 failed keep-alives = connection termination
- Audio data comes as raw PCM, displayed as hex
- No persistent storage, just console output
- Error handling focuses on connection recovery

## Quick Start

```bash
node rtms.js
# Server starts on 3000
# Webhook endpoint: /webhook
# Handles: url_validation, rtms_started, rtms_stopped
```

## Code Structure

```javascript
// Main components:
1. Webhook Handler (/webhook)
   - URL validation
   - RTMS lifecycle events

2. Signaling Connection
   - Authentication
   - Session management
   - Keep-alive handling

3. Media Connection
   - Audio stream handling
   - Binary data processing
   - Connection monitoring

4. Connection Management
   - Meeting-based tracking
   - Automatic cleanup
   - Error recovery
```
