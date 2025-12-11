import dotenv from 'dotenv';
import path from 'path';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import { processTranscodeJob } from './processors/transcode.js';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/musicplayer';
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '2', 10);

async function startWorker() {
    console.log('🔧 Starting transcoding worker...');

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create Redis connection
    const redis = new Redis(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });

    // Create worker
    const worker = new Worker(
        'transcode',
        async (job: Job) => {
            console.log(`📥 Processing job ${job.id}: ${job.name}`);

            try {
                await processTranscodeJob(job);
                console.log(`✅ Job ${job.id} completed successfully`);
            } catch (error) {
                console.error(`❌ Job ${job.id} failed:`, error);
                throw error;
            }
        },
        {
            connection: redis,
            concurrency: WORKER_CONCURRENCY,
        }
    );

    // Event handlers
    worker.on('completed', (job) => {
        console.log(`✅ Job ${job.id} has completed`);
    });

    worker.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id} has failed:`, err.message);
    });

    worker.on('error', (err) => {
        console.error('Worker error:', err);
    });

    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🔧 MERN Music Player - Transcoding Worker                ║
║                                                            ║
║   Queue:       transcode                                   ║
║   Concurrency: ${WORKER_CONCURRENCY.toString().padEnd(43)}║
║   Redis:       ${REDIS_URL.slice(0, 40).padEnd(43)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

    // Graceful shutdown
    const shutdown = async () => {
        console.log('Shutting down worker...');
        await worker.close();
        await mongoose.disconnect();
        redis.disconnect();
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

startWorker().catch((error) => {
    console.error('Failed to start worker:', error);
    process.exit(1);
});
