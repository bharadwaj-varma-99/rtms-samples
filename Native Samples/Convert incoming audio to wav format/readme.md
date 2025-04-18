# Audio to WAV Conversion Project

This project demonstrates how to capture real-time audio from Zoom meetings and convert it to WAV format using Zoom RTMS.

## Implementation Details

The application:
1. Listens for `meeting.rtms_started` events
2. Establishes WebSocket connections for signaling and media data
3. Captures raw audio data from meetings
4. Converts the raw audio data to WAV format using FFmpeg
5. Saves the WAV files for each meeting

## Running the Application

1. Start the server:
   ```bash
   node rtms.js
   ```

2. Start a Zoom meeting. The application will:
   - Receive the `meeting.rtms_started` event
   - Establish WebSocket connections
   - Begin capturing audio data
   - Save the audio as a WAV file when the meeting ends

3. The audio recordings will be saved in the current directory with the naming format:
   ```
   recording_[meeting_id].wav
   ```

## Project-Specific Features

- Real-time audio capture
- WAV format conversion
- Meeting-based recording
- Automatic cleanup of temporary files

## Project-Specific Notes

- Requires FFmpeg to be installed and accessible in your PATH
- Audio is captured at 16kHz sample rate, mono channel
- Temporary raw audio files are automatically cleaned up after conversion
- Each meeting gets its own WAV file

## Prerequisites

1. **Setup ngrok**
2. **Create and configure an App with RTMS Scopes**
3. **Enable Auto-start for the app in the Zoom web**
4. **Install FFmpeg** (required for audio conversion)
5. **Install Node.js dependencies**

### Setup ngrok

Use ngrok or a similar tunneling software to expose your local port to the web.

1. **Download ngrok**
   - For MacOS: [ngrok for MacOS](https://ngrok.com/docs/getting-started/?os=macos)
   - For Windows: [ngrok for Windows](https://ngrok.com/docs/getting-started/?os=windows)
   - For Linux: [ngrok for Linux](https://ngrok.com/docs/getting-started/?os=linux)

2. **Sign up for an ngrok account** and copy your ngrok authtoken from your ngrok dashboard.

3. **Run the following command in your terminal:**
   ```bash
   ngrok config add-authtoken <TOKEN>
   ```

4. **Expose your tunnel:**
   ```bash
   ngrok http http://localhost:3000
   ```

### Create an App with RTMS Scopes

1. Navigate to [Zoom Marketplace](https://marketplace.zoom.us) and sign in with your RTMS beta-enabled account.
2. Select `Develop` → `Build App` → `General App` and click `Create`.
3. Select "User-Managed".
4. [Optional] In the basic information section, provide your OAuth Redirect URL. You can use the redirect URL generated from ngrok.
5. Navigate to `Features` → `Access` and enable Event Subscription.
6. Provide a subscription name and Event Notification URL, and choose an Authentication Header Option.
7. Select `Add Events`, search for "rtms", and select the RTMS Endpoints.
8. Navigate to `Features` → `Surface` and select `Meetings`.
9. [Optional] In the Home URL section, provide a URL to your app's home page and add it to the Domain allow list.
10. In the In-Client App Features, enable the Zoom App SDK.
11. [Optional] Click on `Add APIs` and add "startRTMS" and "stopRTMS" API permissions.
12. Navigate to `Scopes` and select `Add Scopes`. Search for "rtms" and add the scopes for both "Meetings" and "Rtms".
13. Navigate to `Add your app` → `Local Test` and select `Add App now`.
14. Complete the Authorization Flow.

### Install FFmpeg

The application uses FFmpeg to convert raw audio data to WAV format. Install FFmpeg based on your operating system:

- **macOS**:
  ```bash
  brew install ffmpeg
  ```

- **Ubuntu/Debian**:
  ```bash
  sudo apt-get install ffmpeg
  ```

- **Windows**:
  Download from [FFmpeg website](https://ffmpeg.org/download.html) and add to PATH

### Install Dependencies

1. Install Node.js dependencies:
   ```bash
   npm install express crypto ws dotenv
   ```

2. Create a `.env` file with your Zoom credentials:
   ```
   ZOOM_SECRET_TOKEN=your_webhook_verification_token
   ZM_CLIENT_ID=your_client_id
   ZM_CLIENT_SECRET=your_client_secret
   ```

## Features

- **Real-time Audio Capture**: Captures audio data from Zoom meetings in real-time
- **WAV Conversion**: Converts raw audio data to standard WAV format
- **Meeting-based Recording**: Creates separate recordings for each meeting
- **Automatic Cleanup**: Removes temporary raw audio files after conversion

## Troubleshooting

1. **No Audio Files Generated**:
   - Verify FFmpeg is installed and accessible in your PATH
   - Check that the Zoom app has the correct RTMS scopes
   - Ensure the webhook URL is correctly configured in the Zoom app

2. **Connection Issues**:
   - Verify ngrok is running and the tunnel is active
   - Check that the Zoom app credentials in `.env` are correct
   - Ensure the webhook endpoint is accessible from the internet

3. **Audio Quality Issues**:
   - The application captures audio at 16kHz sample rate, mono channel
   - If audio quality is poor, check your network connection and Zoom meeting settings
