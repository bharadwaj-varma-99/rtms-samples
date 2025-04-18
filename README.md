# Zoom RTMS Sample Projects

This repository contains sample projects demonstrating different use cases of the Zoom Real-Time Media Streaming (RTMS). The samples are organized into two main categories:

1. **Native Samples** - Direct implementation examples using raw RTMS API
2. **SDK Samples** - Examples using the RTMS SDK for simplified integration

## Sample Categories

### Native Samples
- **Audio** - Process raw audio streams from Zoom meetings
- **Transcripts** - Access real-time transcription data
- **Convert incoming audio to wav format** - Transform raw audio to WAV files

### SDK Samples
- **printAudio** - Display incoming audio data in console
- **saveAudio** - Save meeting audio to disk
- **printTranscripts** - Display real-time meeting transcripts

## Prerequisites [Common Steps]

### 1. Setup ngrok

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

### 2. Create an App with RTMS Scopes

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

### 3. Install FFmpeg (Required for Audio Projects)

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


## Support

For more information about RTMS and these sample projects, please refer to the individual project README files or visit the [Zoom Developer Documentation](https://marketplace.zoom.us/docs/guides/rtms/overview).

## License

MIT License

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