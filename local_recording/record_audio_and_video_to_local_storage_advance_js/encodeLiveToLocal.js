

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { config } from 'dotenv';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

config(); // Load environment variables

// Load configuration from .env
const streamName = process.env.STREAM_NAME;

// Ensure the recordings folder exists
const recordingsFolder = path.join(__dirname, 'recordings');
if (!fs.existsSync(recordingsFolder)) {
    fs.mkdirSync(recordingsFolder);
    console.log('[DEBUG] Created "recordings" folder.');
} else {
    console.log('[DEBUG] "recordings" folder already exists.');
}

// Event emitter to handle incoming buffers and metadata
const streamEmitter = new EventEmitter();
let ffmpegProcess;
let fileStream;  // Stream to save a local copy

// Start FFmpeg for real-time muxing and saving to local file
function startFFmpeg() {
    console.log('[DEBUG] Starting FFmpeg...');
    ffmpegProcess = spawn('ffmpeg', [
        '-loglevel', 'error',                    // Suppress unnecessary logs
        '-re',                                   // Real-time input
        '-f', 'h264', '-framerate', '25', '-i', 'pipe:3',       // Video input (H.264, 25 FPS)
        '-f', 's16le', '-ar', '16000', '-ac', '1', '-i', 'pipe:4',  // Audio input (PCM, 16 kHz, mono)
        '-c:v', 'libx264',                       // Re-encode to H.264
        '-crf', '23',                            // Quality control for H.264 encoding
        '-preset', 'veryfast',                   // Encoding speed
        '-vf', 'format=yuv420p',                 // Ensure color format compatibility
        '-c:a', 'aac', '-b:a', '64k',            // Convert PCM to AAC audio
        '-ac', '1',                              // Set audio to mono
        '-bsf:v', 'h264_mp4toannexb',            // Ensure H.264 Annex B format
        '-f', 'matroska', 'pipe:1'               // Mux to MKV format
    ], {
        stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe']
    });

    ffmpegProcess.stdout.on('data', (data) => {
        console.log('[DEBUG] Muxed data received:', data.length);
        
        // Write the muxed data to the local file in real-time
        if (!fileStream) {
            // Create a new file stream if it doesn't exist yet
            const filePath = path.join(recordingsFolder, `${streamName}-${Date.now()}.mkv`);
            fileStream = fs.createWriteStream(filePath, { flags: 'a' });
            console.log(`[INFO] Saving stream locally to: ${filePath}`);
        }

        fileStream.write(data, (err) => {
            if (err) {
                console.error('[ERROR] Failed to write to file:', err.message);
            }
        });
    });

    ffmpegProcess.stderr.on('data', (data) => {
        console.error('[FFmpeg Error]:', data.toString());
    });

    ffmpegProcess.on('close', (code) => {
        console.log(`[FFmpeg] Process closed with code: ${code}`);
    });

    console.log('[DEBUG] FFmpeg started successfully.');
}

// Initialize the video and audio streaming connections (without AWS KVS)
async function initializeStreams() {
    try {
        console.log('[DEBUG] Initializing video and audio streams...');
        startFFmpeg();

        streamEmitter.on('videoBuffer', (buffer) => {
            try {
                ffmpegProcess.stdio[3].write(buffer);
                console.log('[Video] Sent to FFmpeg');
            } catch (err) {
                console.error('[Video] Error writing to FFmpeg:', err);
            }
        });

        streamEmitter.on('audioBuffer', (buffer) => {
            try {
                ffmpegProcess.stdio[4].write(buffer);
                console.log('[Audio] Sent to FFmpeg');
            } catch (err) {
                console.error('[Audio] Error writing to FFmpeg:', err);
            }
        });

        console.log('[INFO] Video and audio streams initialized successfully.');
    } catch (err) {
        console.error('[ERROR] Failed to initialize streams:', err);
    }
}

export { streamEmitter, initializeStreams };
