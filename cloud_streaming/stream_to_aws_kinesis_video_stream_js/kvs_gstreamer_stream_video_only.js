

process.env.GST_DEBUG = "3";
process.env.GST_DEBUG_FILE = "/tmp/gstreamer.log";
console.log("GStreamer debug logging enabled.");

const gstreamer = require('gstreamer-superficial');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

let pipeline = null;
let audioSrc = null;
let videoSrc = null;

function initPipeline() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.STREAM_NAME) {
    console.error("Missing required AWS environment variables. Check your .env file.");
    process.exit(1);
  }

const pipelineDesc = `
  appsrc name=videoSrc format=time is-live=true do-timestamp=true caps=video/x-h264,stream-format=byte-stream,alignment=au ! 
  h264parse ! avdec_h264 ! videoconvert ! x264enc tune=zerolatency bitrate=500 speed-preset=ultrafast key-int-max=25 ! h264parse ! 
  kvssink stream-name=${process.env.STREAM_NAME} aws-region=${process.env.AWS_REGION} 
  access-key=${process.env.AWS_ACCESS_KEY_ID} secret-key=${process.env.AWS_SECRET_ACCESS_KEY}
`;


  try {
    pipeline = new gstreamer.Pipeline(pipelineDesc);
    audioSrc = pipeline.findChild('audioSrc');
    videoSrc = pipeline.findChild('videoSrc');
    console.log("Pipeline initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize pipeline:", error);
    process.exit(1);
  }
}

function startStream() {
  if (!pipeline) {
    initPipeline();
  }
  pipeline.play();
  console.log("Stream started.");
}

function stopStream() {
  if (pipeline) {
    pipeline.stop();
    pipeline = null;
    audioSrc = null;
    videoSrc = null;
    console.log("Stream stopped.");
  }
}

function sendAudioBuffer(audioBuffer) {
  // if (!pipeline || !audioSrc) {
  //   initPipeline();
  // }
  // if (!(audioBuffer instanceof Buffer)) {
  //   audioBuffer = Buffer.from(audioBuffer);
  // }
  // try {
  //   audioSrc.push(audioBuffer);
  //   console.log(`Sent audio buffer: ${audioBuffer.length} bytes`);
  // } catch (error) {
  //   console.error("Error sending audio buffer:", error);
  // }
}

function sendVideoBuffer(videoBuffer) {
    if (!pipeline || !videoSrc) {
        console.error("Pipeline or videoSrc not initialized.");
        return;
    }

    try {
        // Ensure the data is already a raw buffer
        if (!Buffer.isBuffer(videoBuffer)) {
            console.error("Expected a raw buffer, received:", typeof videoBuffer);
            return;
        }

        // Identify NAL unit type from the video buffer (usually at position 4 after the start code)
        const nalUnitType = videoBuffer[4] & 0x1F;

        // Update the frame type count based on NAL unit type
        switch (nalUnitType) {
            case 1:
                frameCount.P++;
                break;
            case 5:
                frameCount.I++;
                break;
            case 2:
                frameCount.B++;
                break;
            case 6:
                frameCount.SEI++;
                break;
            case 7:
                frameCount.SPS++;
                break;
            case 8:
                frameCount.PPS++;
                break;
            default:
                frameCount.UNKNOWN++;
                break;
        }

        // Log frame count statistics every 100 frames
        const totalFrames = Object.values(frameCount).reduce((a, b) => a + b, 0);
        if (totalFrames % 100 === 0) {
            logFrameStats();
        }

        // If there are no I-Frames detected after 100 frames, trigger re-encoding
        if (totalFrames % 100 === 0 && frameCount.I === 0) {
            console.warn("No I-Frames detected, triggering re-encoding...");
            const pipelineDesc = `
                appsrc name=videoSrc format=time is-live=true do-timestamp=true caps=video/x-h264,stream-format=byte-stream,alignment=au ! 
                h264parse ! avdec_h264 ! videoconvert ! x264enc tune=zerolatency bitrate=500 speed-preset=ultrafast key-int-max=25 ! h264parse ! 
                kvssink stream-name=${process.env.STREAM_NAME} aws-region=${process.env.AWS_REGION} 
                access-key=${process.env.AWS_ACCESS_KEY_ID} secret-key=${process.env.AWS_SECRET_ACCESS_KEY}
            `;
            console.log("Re-initializing pipeline with re-encoding enabled.");
            pipeline = new gstreamer.Pipeline(pipelineDesc);
            videoSrc = pipeline.findChild('videoSrc');
            pipeline.play();
        }

        // Log the frame type and size
        //console.log(`Sending video buffer of size: ${videoBuffer.length} bytes, NAL Unit Type: ${nalUnitType}`);

        // Push the buffer directly to GStreamer appsrc
        videoSrc.push(videoBuffer);
        //console.log("Video buffer pushed successfully.");
    } catch (error) {
        console.error("Error sending video buffer:", error);
    }
}
// Frame type counters
const frameCount = {
    I: 0,  // Type 5 (I-Frame - Keyframe)
    P: 0,  // Type 1 (P-Frame - Predicted frame)
    B: 0,  // Type 2 (B-Frame - Bi-directional predicted frame)
    SPS: 0,  // Type 7 (Sequence Parameter Set)
    PPS: 0,  // Type 8 (Picture Parameter Set)
    SEI: 0,  // Type 6 (Supplemental Enhancement Information)
    UNKNOWN: 0 // Other types
};

function logFrameStats() {
    console.log(`Frame Type Counts: I-Frames: ${frameCount.I}, P-Frames: ${frameCount.P}, B-Frames: ${frameCount.B}, SPS: ${frameCount.SPS}, PPS: ${frameCount.PPS}, SEI: ${frameCount.SEI}, Unknown: ${frameCount.UNKNOWN}`);
}

module.exports = { startStream,sendAudioBuffer, sendVideoBuffer };