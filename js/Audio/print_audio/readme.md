# Audio Processing Project

This project demonstrates real-time audio processing using the Zoom RTMS API. It focuses on capturing and processing audio data from Zoom meetings.

## Prerequisites

Before running the application, ensure you have the following environment variables set in a `.env` file:
- `ZOOM_SECRET_TOKEN`: Secret token for URL validation
- `ZM_CLIENT_ID`: Zoom client ID
- `ZM_CLIENT_SECRET`: Zoom client secret

## Implementation Details

The application follows this sequence:

1. Starts an Express server on port 3000
2. Listens for webhook events at `/webhook` endpoint
3. Handles URL validation challenges from Zoom
4. When a meeting starts:
   - Receives `meeting.rtms_started` event
   - Establishes WebSocket connection to signaling server
   - Sends handshake with authentication signature
   - Receives media server URL from signaling server
   - Establishes WebSocket connection to media server
   - Sends media handshake with authentication
   - Begins receiving audio data
5. During the meeting:
   - Maintains WebSocket connections with keep-alive messages
   - Receives and logs raw audio data in hexadecimal format
   - Handles any connection errors
6. When a meeting ends:
   - Receives `meeting.rtms_stopped` event
   - Closes all active WebSocket connections
   - Cleans up connection resources

## Running the Application

1. Start the server:
   ```bash
   node rtms.js
   ```

2. Start a Zoom meeting. The application will:
   - Receive the `meeting.rtms_started` event
   - Establish WebSocket connections
   - Begin receiving audio data
   - Output audio data in hexadecimal format to the terminal

## Project-Specific Features

- Real-time audio data capture
- WebSocket connection management for both signaling and media servers
- Automatic connection cleanup on meeting end
- Keep-alive message handling
- Error handling for WebSocket connections
- URL validation handling

## Project-Specific Notes

- The application processes audio data at 16kHz sample rate
- Audio data is output in hexadecimal format
- No file storage or conversion is performed
- Server runs on port 3000
- Webhook endpoint is available at `http://localhost:3000/webhook`
