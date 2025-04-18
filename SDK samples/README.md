# Zoom RTMS SDK Samples

This directory contains sample projects demonstrating the use of the RTMS SDK for easy integration with Zoom Real-Time Media Streaming (RTMS). The SDK simplifies the process of connecting to and consuming RTMS data by handling many of the low-level details automatically.

## What is the RTMS SDK?

The RTMS SDK is a powerful wrapper around the Zoom RTMS API that dramatically simplifies the development process. While the native RTMS implementation requires developers to manually handle webhook events, establish websocket connections, manage handshakes, and process raw data formats, the SDK handles all these complex operations behind the scenes.

Key benefits of using the RTMS SDK include:

- **Simplified Integration**: Reduces hundreds of lines of complex code into just a few function calls
- **Automatic Connection Management**: Handles all the websocket connections, authentication, and session management
- **Event-Based Architecture**: Provides intuitive event listeners for different types of media data
- **Error Handling**: Built-in error handling and reconnection logic
- **Cross-Platform Compatibility**: Works consistently across different environments

The SDK is built on a C language core with Node.js bindings, offering both performance and ease of use.

## Sample Projects

### printAudio
Display incoming audio data from Zoom meetings in the console. This sample demonstrates how to:
- Listen for RTMS events
- Process real-time audio data
- Convert and display audio data in Base64 format

### saveAudio
Save meeting audio to disk as WAV files. This sample demonstrates how to:
- Capture and buffer audio data during a meeting
- Convert raw PCM audio to WAV format using FFmpeg
- Save recordings with meeting-specific filenames

### printTranscripts
Display real-time meeting transcripts in the console. This sample demonstrates how to:
- Subscribe to transcript events
- Process and format transcript data
- Associate transcripts with specific participants

## Prerequisites

Before using these samples, make sure you have completed the common setup steps in the main README:
1. Setup ngrok
2. Create an App with RTMS Scopes
3. Install FFmpeg (required for audio processing)
4. Install the Zoom Beta Client

## Getting Started

1. Clone this repository
2. Navigate to the SDK samples directory and the project of your choice
3. Install the RTMS SDK:
   ```bash
   npm install github:zoom/rtms
   ```
4. The Node.JS SDK is built on a C language SDK which requires prebuilt binaries:
   ```bash
   npm run fetch -- your-token-goes-here
   ```
   Your Zoom POC will provide you with the token.
5. Create a `.env` file with your Zoom credentials:
   ```
   # your Zoom OAuth Client ID here
   ZM_RTMS_CLIENT=

   # your Zoom OAuth Client Secret here
   ZM_RTMS_SECRET=

   # Optional settings
   # ZM_RTMS_CA=    # Location of Root CA Certificate if SDK can't find it
   # ZM_RTMS_PORT=8080  # TCP port for webhook events
   # ZM_RTMS_PATH=      # Path for webhook events
   ```
6. Run the application:
   ```bash
   npm start
   ```

## SDK Features and Capabilities

The RTMS SDK provides these key features:

- **Complete Webhook Handling**: Automatically sets up endpoint and processes incoming events
- **Signaling Connection Management**: Opens and maintains the signaling websocket with proper authentication
- **Signature Generation**: Securely generates and validates required signatures
- **Media Data Connection**: Establishes and manages the data websocket connection
- **Event-Driven API**: Simple listeners for different types of media data and events
- **Automatic Reconnection**: Handles connection interruptions gracefully
- **RTMS Protocol Implementation**: Manages all the low-level RTMS protocol details
- **Multiple Media Type Support**: Works with audio, transcripts, and other supported media types

Without the SDK, you would need to implement all these components manually, requiring deep knowledge of the RTMS protocol, websocket management, and binary data processing.

## Implementing an SDK Sample

Here's a basic implementation structure that demonstrates how simple it is to use the SDK:

```javascript
import rtms from "@zoom/rtms";

// Listen for webhook events
rtms.onWebhookEvent(({ event, payload }) => {
    console.log(`RTMS Event: ${event}`);
    
    // Handle the meeting.rtms_started event
    if (event === "meeting.rtms_started") {
        // Create client instance
        const client = new rtms.Client();
        
        // Register audio data handler
        client.onAudioData((data) => {
            // Process audio data here
            console.log("Received audio data");
        });
        
        // Join the RTMS session
        client.join(payload);
    }
    
    // Handle the meeting.rtms_stopped event
    if (event === "meeting.rtms_stopped") {
        // Clean up resources
        console.log("RTMS session stopped");
    }
});
```

Compare this to a native implementation that would require manually:
- Setting up an HTTP server for webhook events
- Parsing webhook payloads
- Opening websocket connections
- Managing connection authentication
- Handling binary media data formats
- Implementing reconnection logic
- Processing various RTMS protocol messages

## Enabling Auto-Start for the App

### For the Account:
1. Navigate to https://www.zoom.us/profile/setting?tab=zoomapps
2. Enable "Allow Apps to Access Meeting Content"
3. Click Edit and Toggle Auto-Start to ON

### For a Specific Group:
1. Navigate to https://zoom.us/account/group#/
2. Select the group you want to enable
3. Select the "Zoom Apps" Tab
4. Enable "Allow Apps to Access Meeting Content"
5. Click Edit and Toggle Auto-Start to ON

## Troubleshooting

1. **Connection Issues**:
   - Verify ngrok is running and the tunnel is active
   - Check your Zoom OAuth credentials in the `.env` file
   - Ensure your webhook URL is correctly configured

2. **SDK Installation Issues**:
   - Make sure you have the correct token for fetching prebuilt binaries
   - Check that you've installed the SDK correctly: `npm install github:zoom/rtms`

3. **No Audio Data**:
   - Verify that Auto-Start is enabled for your app in Zoom web settings
   - Check that your app has the correct RTMS scopes
   - Ensure you're properly handling the `meeting.rtms_started` webhook event

4. **WAV Conversion Issues**:
   - Verify FFmpeg is installed and accessible in your PATH
   - RTMS sends uncompressed raw audio data (L16 PCM) at 16kHz sample rate, mono channel
   - Use the correct FFmpeg parameters: `-f s16le -ar 16000 -ac 1` 