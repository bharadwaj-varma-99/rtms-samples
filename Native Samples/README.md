# Zoom RTMS Native Samples

This directory contains sample projects demonstrating direct implementation of the Zoom Real-Time Media Streams (RTMS) API without using the SDK. These samples showcase how to work with the RTMS API at a lower level for more control and customization.

## Sample Projects

### Audio
Process raw audio streams from Zoom meetings. This sample demonstrates how to:
- Capture real-time audio from Zoom meetings
- Process the audio data in real-time
- Handle different audio formats and configurations

### Transcripts
Access real-time transcription data from Zoom meetings. This sample demonstrates how to:
- Receive and process live transcription data
- Format and display transcripts in real-time
- Associate transcripts with specific participants

### Convert incoming audio to wav format
Transform raw audio data to standard WAV files. This sample demonstrates how to:
- Receive raw audio data from RTMS
- Buffer the audio data
- Convert the raw PCM data to standard WAV format using FFmpeg
- Save the resulting audio files

## Prerequisites

Before using these samples, make sure you have completed the common setup steps in the main README:
1. Setup ngrok
2. Create an App with RTMS Scopes
3. Install FFmpeg (required for audio processing)

## Getting Started

1. Clone this repository
2. Navigate to the project directory of your choice within the Native Samples folder
3. Install dependencies:
   ```bash
   npm install express crypto ws dotenv
   ```
4. Create a `.env` file with your Zoom credentials:
   ```
   ZOOM_SECRET_TOKEN=your_webhook_verification_token
   ZM_CLIENT_ID=your_client_id
   ZM_CLIENT_SECRET=your_client_secret
   ```
5. Start the application:
   ```bash
   node rtms.js
   ```

## Implementation Details

These native implementations directly handle:
- Webhook event processing
- Signaling handshake with the RTMS server
- Media data connection management
- Raw data processing

For each sample, you'll need to:
1. Listen for incoming webhook events
2. Process the webhook payload to extract connection information
3. Establish and manage WebSocket connections for signaling and data
4. Handle the incoming media data according to your application needs

## RTMS API Reference

### ENUM Types

#### RTMS_MESSAGE_TYPE
```javascript
enum RTMS_MESSAGE_TYPE {
    UNDEFINED = 0,
    SIGNALING_HAND_SHAKE_REQ = 1,     // Initializes the signaling connection
    SIGNALING_HAND_SHAKE_RESP = 2,    // Indicates the response of initialed signaling connection
    DATA_HAND_SHAKE_REQ = 3,          // Initializes the media data connection
    DATA_HAND_SHAKE_RESP = 4,         // Indicates the response of initialed media data connection
    EVENT_SUBSCRIPTION = 5,           // Indicates events to subscribe or unsubscribe to
    EVENT_UPDATE = 6,                 // Indicates that a specific event occurred, also refer to EventType
    CLIENT_READY_ACK = 7,             // Indicates readiness to receive media data on the client side
    STREAM_STATE_UPDATE = 8,          // Indicates that the stream state changed, e.g. active or terminated
    SESSION_STATE_UPDATE = 9,         // Indicates that the session state updated, e.g. started or paused/resumed
    SESSION_STATE_REQ = 10,           // Indicates querying the session state
    SESSION_STATE_RESP = 11,          // Indicates the response of the session state request
    KEEP_ALIVE_REQ = 12,              // Indicates that it is a keep-alive request message
    KEEP_ALIVE_RESP = 13,             // Indicates that it is a keep-alive response message
    MEDIA_DATA_AUDIO = 14,            // Indicates audio data is being transmitted
    MEDIA_DATA_VIDEO = 15,            // Indicates video data is being transmitted
    MEDIA_DATA_SHARE = 16,            // Indicates sharing data is being transmitted
    MEDIA_DATA_TRANSCRIPT = 17,       // Indicates the transcripts of meeting audio are being transmitted
    MEDIA_DATA_CHAT = 18              // Indicates the meeting chat messages are being transmitted
}
```

#### RTMS_EVENT_TYPE
```javascript
enum RTMS_EVENT_TYPE {
    UNDEFINED = 0,
    FIRST_PACKET_TIMESTAMP = 1, // Indicates the first packet capture timestamp
    ACTIVE_SPEAKER_CHANGE = 2,  // Indicates who the most recent active speaker is
    PARTICIPANT_JOIN = 3,       // Indicates a new participant joined this meeting
    PARTICIPANT_LEAVE = 4       // Indicates a participant is leaving this meeting
}
```

#### RTMS_STATUS_CODE
```javascript
enum RTMS_STATUS_CODE {
    STATUS_OK = 0,
    STATUS_CONNECTION_TIMEOUT = 1,
    STATUS_INVALID_JSON_MSG_SIZE = 2,
    STATUS_INVALID_JSON_MSG = 3,
    STATUS_INVALID_MESSAGE_TYPE = 4,
    STATUS_MSG_TYPE_NOT_EXIST = 5,
    STATUS_MSG_TYPE_NOT_UINT = 6,
    STATUS_MEETING_UUID_NOT_EXIST = 7,
    STATUS_MEETING_UUID_NOT_STRING = 8,
    STATUS_MEETING_UUID_IS_EMPTY = 9,
    STATUS_RTMS_STREAM_ID_NOT_EXIST = 10,
    STATUS_RTMS_STREAM_ID_NOT_STRING = 11,
    STATUS_RTMS_STREAM_ID_IS_EMPTY = 12,
    STATUS_SESSION_NOT_FOUND = 13,
    STATUS_SIGNATURE_NOT_EXIST = 14,
    STATUS_INVALID_SIGNATURE = 15,
    STATUS_INVALID_MEETING_OR_STREAM_ID = 16,
    STATUS_DUPLICATE_SIGNAL_REQUEST = 17,
    STATUS_EVENTS_NOT_EXIST = 18,
    STATUS_EVENTS_VALUE_NOT_ARRAY = 19,
    STATUS_EVENT_TYPE_NOT_EXIST = 20,
    STATUS_EVENT_TYPE_VALUE_NOT_UINT = 21,
    STATUS_MEDIA_TYPE_NOT_EXIST = 22,
    STATUS_MEDIA_TYPE_NOT_UINT = 23,
    STATUS_MEDIA_TYPE_AUDIO_NOT_SUPPORT = 24,
    STATUS_MEDIA_TYPE_VIDEO_NOT_SUPPORT = 25,
    STATUS_MEDIA_TYPE_DESKSHARE_NOT_SUPPORT = 26,
    STATUS_MEDIA_TYPE_TRANSCRIPT_NOT_SUPPORT = 27,
    STATUS_MEDIA_TYPE_CHAT_NOT_SUPPORT = 28,
    STATUS_MEDIA_TYPE_INVALID_VALUE = 29,
    STATUS_MEDIA_DATA_ALL_CONNECTION_EXIST = 30,
    STATUS_DUPLICATE_MEDIA_DATA_CONNECTION = 31,
    STATUS_MEDIA_PARAMS_NOT_EXIST = 32,
    STATUS_INVALID_MEDIA_PARAMS = 33,
    STATUS_NO_MEDIA_TYPE_SPECIFIED = 34,
    STATUS_INVALID_MEDIA_AUDIO_PARAMS = 35,
    STATUS_MEDIA_AUDIO_CONTENT_TYPE_NOT_UINT = 36,
    STATUS_INVALID_MEDIA_AUDIO_CONTENT_TYPE = 37,
    STATUS_MEDIA_AUDIO_SAMPLE_RATE_NOT_UINT = 38,
    STATUS_INVALID_MEDIA_AUDIO_SAMPLE_RATE = 39,
    STATUS_MEDIA_AUDIO_CHANNEL_NOT_UINT = 40,
    STATUS_INVALID_MEDIA_AUDIO_CHANNEL = 41,
    STATUS_MEDIA_AUDIO_CODEC_NOT_UINT = 42,
    STATUS_INVALID_MEDIA_AUDIO_CODEC = 43,
    STATUS_MEDIA_AUDIO_DATA_OPT_NOT_UINT = 44,
    STATUS_INVALID_MEDIA_AUDIO_DATA_OPT = 45,
    STATUS_MEDIA_AUDIO_SEND_RATE_NOT_UINT = 46,
    STATUS_MEDIA_AUDIO_FRAME_SIZE_NOT_UINT = 47,
    STATUS_INVALID_MEDIA_VIDEO_PARAMS = 48,
    STATUS_INVALID_MEDIA_VIDEO_CONTENT_TYPE = 49,
    STATUS_MEDIA_VIDEO_CONTENT_TYPE_NOT_UINT = 50,
    STATUS_INVALID_MEDIA_VIDEO_CODEC = 51,
    STATUS_MEDIA_VIDEO_CODEC_NOT_UINT = 52,
    STATUS_INVALID_MEDIA_VIDEO_RESOLUTION = 53,
    STATUS_MEDIA_VIDEO_RESOLUTION_NOT_UINT = 54,
    STATUS_INVALID_MEDIA_VIDEO_DATA_OPT = 55,
    STATUS_MEDIA_VIDEO_DATA_OPT_NOT_UINT = 56,
    STATUS_MEDIA_VIDEO_FPS_NOT_UINT = 57,
    STATUS_INVALID_MEDIA_SHARE_PARAMS = 58,
    STATUS_INVALID_AUDIO_DATA_BUFFER = 59,
    STATUS_INVALID_VIDEO_DATA_BUFFER = 60,
    STATUS_POST_FIRST_PACKET_FAILURE = 61,
    STATUS_RTMS_SESSION_NOT_FOUND = 62
}
```

#### RTMS_SESSION_STATE
```javascript
enum RTMS_SESSION_STATE {
    INACTIVE = 0,  // Default state
    INITIALIZE = 1,   // A new session is initializing
    STARTED = 2,      // A new Session is started
    PAUSED = 3,       // A session is paused
    RESUMED = 4,      // A session is resumed
    STOPPED = 5       // A session is stopped
}
```

#### RTMS_STREAM_STATE
```javascript
enum RTMS_STREAM_STATE {
    INACTIVE = 0,      // Default state
    ACTIVE = 1,        // Media data has started to transmit, RTMS -> client
    INTERRUPTED = 2,   // Signal or any data connections of the stream encountered a problem
    TERMINATING = 3,   // Stream needs to be terminated, notify client to close sockets
    TERMINATED = 4     // Stream is terminated, e.g. all sessions are stopped, RTMS -> client
}
```

#### RTMS_STOP_REASON
```javascript
enum RTMS_STOP_REASON {
    UNDEFINED = 0,
    STOP_BC_HOST_TRIGGERED = 1,
    STOP_BC_USER_TRIGGERED = 2,
    STOP_BC_USER_LEFT = 3,
    STOP_BC_USER_EJECTED = 4,
    STOP_BC_APP_DISABLED_BY_HOST = 5,
    STOP_BC_MEETING_ENDED = 6,
    STOP_BC_STREAM_CANCELED = 7,
    STOP_BC_STREAM_REVOKED = 8,
    STOP_BC_ALL_APPS_DISABLED = 9,
    STOP_BC_INTERNAL_EXCEPTION = 10,
    STOP_BC_CONNECTION_TIMEOUT = 11,
    STOP_BC_MEETING_CONNECTION_INTERRUPTED = 12,
    STOP_BC_SIGNAL_CONNECTION_INTERRUPTED = 13,
    STOP_BC_DATA_CONNECTION_INTERRUPTED = 14,
    STOP_BC_SIGNAL_CONNECTION_CLOSED_ABNORMALLY = 15,
    STOP_BC_DATA_CONNECTION_CLOSED_ABNORMALLY = 16,
    STOP_BC_EXIT_SIGNAL = 17,
    STOP_BC_AUTHENTICATION_FAILURE = 18
}
```

#### MEDIA_CONTENT_TYPE
```javascript
enum MEDIA_CONTENT_TYPE {
    UNDEFINED = 0,
    RTP = 1,         // Real-time audio and video
    RAW_AUDIO = 2,   // Real-time audio
    RAW_VIDEO = 3,   // Real-time video
    FILE_STREAM = 4, // File stream
    TEXT = 5         // Media data is text based, such as Chat and Transcripts
}
```

#### MEDIA_PAYLOAD_TYPE
```javascript
enum MEDIA_PAYLOAD_TYPE {
    UNDEFINED = 0,
    L16 = 1,   // Audio, uncompressed raw data
    G711 = 2,  // Audio
    G722 = 3,  // Audio
    OPUS = 4,  // Audio
    JPG = 5,   // Video and Sharing, when fps <= 5
    PNG = 6,   // Video and Sharing, when fps <= 5
    H264 = 7   // Video and Sharing, when fps > 5
}
```

#### MEDIA_DATA_TYPE
```javascript
enum MEDIA_DATA_TYPE {
    UNDEFINED = 0,
    AUDIO = 1,
    VIDEO = 2,
    DESKSHARE = 4,
    TRANSCRIPT = 8,
    CHAT = 16,
    ALL = 32
}
```

#### MEDIA_DATA_OPTION
```javascript
enum MEDIA_DATA_OPTION {
    UNDEFINED = 0,
    AUDIO_MIXED_STREAM = 1,         // Data is mixed audio stream
    AUDIO_MULTI_STREAMS = 2,        // Data is multiple user audio streams
    VIDEO_SINGLE_ACTIVE_STREAM = 3, // Data is single video stream of active speaker
    VIDEO_MIXED_SPEAKER_VIEW = 4,   // Data is mixed video stream using speaker view
    VIDEO_MIXED_GALLERY_VIEW = 5    // Data is mixed video stream using gallery view
}
```

#### MEDIA_RESOLUTION
```javascript
enum MEDIA_RESOLUTION {
    SD = 1,   // 480p or 360p, 854x480 or 640x360
    HD = 2,   // 720p, 1280 x 720
    FHD = 3,  // 1080p, 1920 x 1080
    QHD = 4   // 2K, 2560 x 1440
}
```

#### AUDIO_SAMPLE_RATE
```javascript
enum AUDIO_SAMPLE_RATE {
    SR_8K = 0,
    SR_16K = 1,
    SR_32K = 2,
    SR_48K = 3
}
```

#### AUDIO_CHANNEL
```javascript
enum AUDIO_CHANNEL {
    MONO = 1,
    STEREO = 2
}
```

#### TRANSMISSION_PROTOCOL
```javascript
enum TRANSMISSION_PROTOCOL {
    WEBSOCKET = 1,
    RTMP = 2,
    UDP = 3,
    WEBRTC = 4
}
```

## Troubleshooting

1. **Connection Issues**:
   - Verify ngrok is running and the tunnel is active
   - Check that the Zoom app credentials in `.env` are correct
   - Ensure the webhook endpoint is accessible from the internet

2. **Audio Quality Issues**:
   - RTMS sends uncompressed raw audio data (L16 PCM) at 16kHz sample rate, mono channel
   - If audio quality is poor, check your network connection and Zoom meeting settings

3. **No Data Received**:
   - Verify FFmpeg is installed and accessible in your PATH (for audio projects)
   - Check that the Zoom app has the correct RTMS scopes
   - Ensure the webhook URL is correctly configured in the Zoom app 