import { Job } from 'bullmq';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import ffmpeg from 'fluent-ffmpeg';
import mongoose from 'mongoose';

// S3 Configuration
const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin123',
    },
    forcePathStyle: process.env.S3_USE_PATH_STYLE === 'true',
});

const S3_BUCKET = process.env.S3_BUCKET || 'music-player';

// Track model (simplified for worker)
const TrackSchema = new mongoose.Schema({
    files: Object,
    duration: Number,
    bitrate: Number,
    sampleRate: Number,
    status: String,
    processingError: String,
});

const Track = mongoose.models.Track || mongoose.model('Track', TrackSchema);

interface TranscodeJobData {
    trackId: string;
    sourceKey: string;
    contentType: string;
}

interface AudioMetadata {
    duration: number;
    bitrate: number;
    sampleRate: number;
}

/**
 * Main transcoding job processor
 */
export async function processTranscodeJob(job: Job<TranscodeJobData>): Promise<void> {
    const { trackId, sourceKey } = job.data;
    const tempDir = path.join(os.tmpdir(), `transcode-${trackId}`);

    try {
        // Create temp directory
        await fs.mkdir(tempDir, { recursive: true });

        // Update progress
        await job.updateProgress(10);

        // Download source file
        const inputPath = path.join(tempDir, 'input');
        await downloadFromS3(sourceKey, inputPath);
        await job.updateProgress(20);

        // Extract metadata
        const metadata = await extractMetadata(inputPath);
        await job.updateProgress(30);

        // Transcode to MP3 320k
        const mp3_320_path = path.join(tempDir, 'audio_320.mp3');
        await transcodeToMp3(inputPath, mp3_320_path, 320);
        await job.updateProgress(50);

        // Transcode to MP3 128k
        const mp3_128_path = path.join(tempDir, 'audio_128.mp3');
        await transcodeToMp3(inputPath, mp3_128_path, 128);
        await job.updateProgress(70);

        // Generate waveform
        const waveformPath = path.join(tempDir, 'waveform.json');
        await generateWaveform(inputPath, waveformPath);
        await job.updateProgress(85);

        // Upload processed files to S3
        const mp3_320_key = `tracks/${trackId}/audio_320.mp3`;
        const mp3_128_key = `tracks/${trackId}/audio_128.mp3`;
        const waveform_key = `tracks/${trackId}/waveform.json`;

        await Promise.all([
            uploadToS3(mp3_320_path, mp3_320_key, 'audio/mpeg'),
            uploadToS3(mp3_128_path, mp3_128_key, 'audio/mpeg'),
            uploadToS3(waveformPath, waveform_key, 'application/json'),
        ]);
        await job.updateProgress(95);

        // Update track document
        await Track.findByIdAndUpdate(trackId, {
            $set: {
                'files.mp3_320': mp3_320_key,
                'files.mp3_128': mp3_128_key,
                'files.waveformJson': waveform_key,
                duration: Math.round(metadata.duration),
                bitrate: metadata.bitrate,
                sampleRate: metadata.sampleRate,
                status: 'ready',
            },
        });

        await job.updateProgress(100);
        console.log(`✅ Track ${trackId} processed successfully`);

    } catch (error: any) {
        console.error(`❌ Failed to process track ${trackId}:`, error);

        // Update track with error
        await Track.findByIdAndUpdate(trackId, {
            $set: {
                status: 'rejected',
                processingError: error.message || 'Unknown error',
            },
        });

        throw error;
    } finally {
        // Cleanup temp files
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch {
            // Ignore cleanup errors
        }
    }
}

/**
 * Download file from S3
 */
async function downloadFromS3(key: string, outputPath: string): Promise<void> {
    const response = await s3Client.send(
        new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
        })
    );

    const body = response.Body as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];

    for await (const chunk of body) {
        chunks.push(chunk as Buffer);
    }

    await fs.writeFile(outputPath, Buffer.concat(chunks));
}

/**
 * Upload file to S3
 */
async function uploadToS3(filePath: string, key: string, contentType: string): Promise<void> {
    const fileContent = await fs.readFile(filePath);

    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: S3_BUCKET,
            Key: key,
            Body: fileContent,
            ContentType: contentType,
        },
    });

    await upload.done();
}

/**
 * Extract audio metadata using FFmpeg
 */
function extractMetadata(inputPath: string): Promise<AudioMetadata> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            const audioStream = data.streams.find((s) => s.codec_type === 'audio');

            resolve({
                duration: data.format.duration || 0,
                bitrate: Math.round((data.format.bit_rate || 0) / 1000),
                sampleRate: audioStream?.sample_rate ? parseInt(audioStream.sample_rate) : 44100,
            });
        });
    });
}

/**
 * Transcode audio to MP3
 */
function transcodeToMp3(inputPath: string, outputPath: string, bitrate: number): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioCodec('libmp3lame')
            .audioBitrate(bitrate)
            .audioFrequency(44100)
            .audioChannels(2)
            .format('mp3')
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
}

/**
 * Generate waveform data
 */
async function generateWaveform(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const samples: number[] = [];

        ffmpeg(inputPath)
            .audioFilters('aresample=8000,asetnsamples=n=1024')
            .format('s16le')
            .audioCodec('pcm_s16le')
            .on('error', reject)
            .pipe()
            .on('data', (chunk: Buffer) => {
                // Process PCM data to extract peaks
                for (let i = 0; i < chunk.length; i += 2) {
                    const sample = chunk.readInt16LE(i);
                    samples.push(Math.abs(sample) / 32768);
                }
            })
            .on('end', async () => {
                // Downsample to ~200 points
                const targetLength = 200;
                const bucketSize = Math.ceil(samples.length / targetLength);
                const waveform: number[] = [];

                for (let i = 0; i < targetLength; i++) {
                    const start = i * bucketSize;
                    const end = Math.min(start + bucketSize, samples.length);
                    let max = 0;

                    for (let j = start; j < end; j++) {
                        if (samples[j] > max) max = samples[j];
                    }

                    waveform.push(Math.round(max * 100) / 100);
                }

                await fs.writeFile(outputPath, JSON.stringify({ waveform }));
                resolve();
            })
            .on('error', reject);
    });
}
