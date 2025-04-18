# Audio Processing Project

This project demonstrates real-time audio processing using the Zoom RTMS API. It focuses on capturing and processing audio data from Zoom meetings.

## Implementation Details

The application:
1. Listens for `meeting.rtms_started` events
2. Establishes WebSocket connections for signaling and media data
3. Processes incoming audio data in real-time
4. Outputs audio data in base64 encoded format to the terminal

## Running the Application

1. Start the server:
   ```bash
   node rtms.js
   ```

2. Start a Zoom meeting. The application will:
   - Receive the `meeting.rtms_started` event
   - Establish WebSocket connections
   - Begin processing audio data
   - Output audio data to the terminal

## Project-Specific Features

- Real-time audio data processing
- WebSocket connection management
- Base64 encoded audio output
- Meeting event handling

## Project-Specific Notes

- The application processes audio data at 16kHz sample rate
- Audio data is output in base64 encoded format
- No file storage or conversion is performed
