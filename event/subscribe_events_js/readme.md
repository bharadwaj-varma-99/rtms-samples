# Zoom RTMS events project

This project demonstrates the events captured by Zoom RTMS .This prints out the different user and meeting events on the console log.

## Prerequisites

Before running the application, ensure you have the following environment variables set in a `.env` file:
- `ZOOM_SECRET_TOKEN`: Secret token for URL validation
- `ZM_CLIENT_ID`: Zoom client ID
- `ZM_CLIENT_SECRET`: Zoom client secret

### Additional Environment Variables:
- `PORT`: The port on which the Express server runs (default: 3000)

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
   - Request events from signaling server
   - Sends media handshake with authentication
   - Begins receiving all media data type (Audio, Video, Deskshare, Transcript, Chat etc...)
5. During the meeting:  
   - Maintains WebSocket connections with keep-alive messages
   - Receives events from signaling server
   - Handles any connection errors
6. When a meeting ends:  
   - Receives `meeting.rtms_stopped` event
   - Closes all active WebSocket connections

## Running the Application

1. Start the server:
   ```bash
   node index.js  
   ```

2. Start a Zoom meeting. The application will: 
   - Receive the `meeting.rtms_started` event
   - Establish WebSocket connections
   - Request and thereafter receive events from signaling server
   - Append the video chunks into .raw file every video stream data is received

## Project-Specific Features  

- Subscribes to events by sending a request payload to signaling server
- Prints out events received from the signaling server
- Keep-alive message handling
- Error handling for WebSocket connections
- URL validation handling

## Project-Specific Notes  

- Server runs on port 3000 by default, if PORT is not specificed in .env
- Webhook endpoint is available at `http://localhost:3000/webhook`

## Additional Setup Requirements  

1. **Node.js** (v14 or higher recommended)
32. **ngrok** for exposing your local server to the Internet
4. **Zoom App** configuration with RTMS scopes enabled

## Troubleshooting  

1. **General error encountered**:
   - Check that the Zoom app has the correct RTMS scopes
   - Ensure the webhook URL is correctly configured in the Zoom app

2. **Connection Issues**:
   - Verify ngrok is running and the tunnel is active
   - Check that the Zoom app credentials in `.env` are correct
   - Ensure the webhook endpoint is accessible from the internet

