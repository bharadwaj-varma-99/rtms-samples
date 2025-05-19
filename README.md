# Zoom RTMS Samples Repository

This repository contains sample projects demonstrating how to work with Zoom's Real-Time Media Streams (RTMS) in JavaScript, Python, and SDK implementations. 

## Repository Structure

```
.
├── audio/
│   ├── save_audio_python/     # Save audio using Python implementation
│   ├── print_audio_python/    # Print audio using Python implementation
│   ├── save_audio_sdk/        # Save audio using RTMS SDK
│   ├── print_audio_sdk/       # Print audio using RTMS SDK
│   ├── save_audio_js/         # Save audio using JavaScript implementation
│   └── print_audio_js/        # Print audio using JavaScript implementation
└── transcript/
    └── print_transcripts/
        ├── print_transcripts_sdk/       # Print transcripts using RTMS SDK
        ├── print_incoming_transcripts/   # Print transcripts using native implementation
        └── print_transcripts_python/     # Print transcripts using Python implementation
```

## What is RTMS?

Zoom Real-Time Media Streams (RTMS) allows developers to access real-time media data from Zoom meetings, including:
- Audio streams
- Video streams
- Meeting transcripts

## Implementation Approaches

### 1. SDK-Based Implementation
The RTMS SDK provides a simplified way to integrate with RTMS by handling many low-level details automatically. Benefits include:
- Simplified integration with just a few function calls
- Automatic connection management
- Built-in error handling and reconnection logic
- Cross-platform compatibility

### 2. Native Implementation
The native implementation gives you more control and customization options by working directly with RTMS. This approach requires:
- Manual webhook event handling
- Direct websocket connection management
- Custom error handling
- Raw data processing

## Creating an App in the Zoom Marketplace

To use these samples, you'll need to create an app in the Zoom Marketplace. Here's how:

1. **Sign in to the Zoom Marketplace**:
   - Go to https://marketplace.zoom.us/
   - Sign in with your RTMS beta-enabled account

2. **Create a New App**:
   - Select Develop → Build App → General App
   - Click Create
   - Select "User-Managed"

3. **Configure Basic Information**:
   - [Optional] In the basic information section, provide your OAuth Redirect URL
   - You can use the redirect URL generated from ngrok

4. **Configure Event Subscriptions**:
   - Navigate to Features → Access
   - Enable Event Subscription
   - Provide a subscription name and Event Notification URL
   - Choose an Authentication Header Option
   - Select Add Events
   - Search for "rtms" and select the RTMS Endpoints

5. **Configure Meeting Features**:
   - Navigate to Features → Surface
   - Select Meetings
   - [Optional] In the Home URL section, provide a URL to your app's home page
   - Add the URL to the Domain allow list
   - In the In-Client App Features, enable the Zoom App SDK
   - [Optional] Click on Add APIs and add "startRTMS" and "stopRTMS" API permissions

6. **Configure Scopes**:
   - Navigate to Scopes
   - Select Add Scopes
   - Search for "rtms"
   - Add the scopes for both "Meetings" and "Rtms"

7. **Complete Setup**:
   - Navigate to Add your app → Local Test
   - Select Add App now
   - Complete the Authorization Flow

8. **Get Your Credentials**:
   - After creating the app, you'll receive:
     - Client ID
     - Client Secret
     - Webhook verification token
   - Save these credentials securely - you'll need them for the samples

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

## License

This project is licensed under the MIT License.

Copyright (c) 2025 Zoom Video Communications, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 