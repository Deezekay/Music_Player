import { v4 as uuidv4 } from 'uuid';
import { getPresignedUploadUrl, getPresignedDownloadUrl, S3Keys } from '../config/s3.js';
import { Track } from '../models/index.js';
import { ApiError } from '../middleware/errorHandler.js';
import { getRedisClient } from '../config/redis.js';
import { Queue } from 'bullmq';

// Initialize transcoding queue
let transcodeQueue: Queue | null = null;

function getTranscodeQueue(): Queue {
    if (!transcodeQueue) {
        transcodeQueue = new Queue('transcode', {
            connection: getRedisClient(),
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: 100,
                removeOnFail: 50,
            },
        });
    }
    return transcodeQueue;
}

interface PresignedUploadResponse {
    uploadUrl: string;
    uploadId: string;
    key: string;
    expiresIn: number;
}

const ALLOWED_AUDIO_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/flac',
    'audio/ogg',
    'audio/aac',
    'audio/m4a',
    'audio/x-m4a',
];

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
];

/**
 * Generate presigned URL for audio upload
 */
export async function getAudioUploadUrl(
    trackId: string,
    contentType: string,
    userId: string
): Promise<PresignedUploadResponse> {
    // Validate content type
    if (!ALLOWED_AUDIO_TYPES.includes(contentType)) {
        throw ApiError.badRequest(`Invalid audio type. Allowed: ${ALLOWED_AUDIO_TYPES.join(', ')}`);
    }

    // Verify track exists and user owns it
    const track = await Track.findById(trackId);
    if (!track) {
        throw ApiError.notFound('Track not found');
    }
    if (track.createdByUserId.toString() !== userId) {
        throw ApiError.forbidden('Not authorized');
    }

    const ext = getExtensionFromMimeType(contentType);
    const key = S3Keys.original(trackId, ext);
    const uploadId = uuidv4();

    const uploadUrl = await getPresignedUploadUrl(key, contentType);

    // Store upload ID in Redis for verification (expires in 1 hour)
    const redis = getRedisClient();
    await redis.setex(`upload:${uploadId}`, 3600, JSON.stringify({
        trackId,
        userId,
        key,
        contentType,
    }));

    return {
        uploadUrl,
        uploadId,
        key,
        expiresIn: 900, // 15 minutes
    };
}

/**
 * Generate presigned URL for cover art upload
 */
export async function getCoverUploadUrl(
    trackId: string,
    contentType: string,
    userId: string
): Promise<PresignedUploadResponse> {
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
        throw ApiError.badRequest(`Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
    }

    const track = await Track.findById(trackId);
    if (!track) {
        throw ApiError.notFound('Track not found');
    }
    if (track.createdByUserId.toString() !== userId) {
        throw ApiError.forbidden('Not authorized');
    }

    const ext = getExtensionFromMimeType(contentType);
    const key = S3Keys.coverArt(trackId, ext);
    const uploadId = uuidv4();

    const uploadUrl = await getPresignedUploadUrl(key, contentType);

    const redis = getRedisClient();
    await redis.setex(`upload:${uploadId}`, 3600, JSON.stringify({
        trackId,
        userId,
        key,
        contentType,
        type: 'cover',
    }));

    return {
        uploadUrl,
        uploadId,
        key,
        expiresIn: 900,
    };
}

/**
 * Complete upload and trigger processing
 */
export async function completeUpload(
    uploadId: string,
    userId: string
): Promise<{ trackId: string; status: string }> {
    const redis = getRedisClient();
    const uploadData = await redis.get(`upload:${uploadId}`);

    if (!uploadData) {
        throw ApiError.badRequest('Upload session expired or invalid');
    }

    const { trackId, userId: uploadUserId, key, contentType, type } = JSON.parse(uploadData);

    if (uploadUserId !== userId) {
        throw ApiError.forbidden('Not authorized');
    }

    // Clean up Redis
    await redis.del(`upload:${uploadId}`);

    if (type === 'cover') {
        // Update track with cover art
        await Track.findByIdAndUpdate(trackId, {
            $set: { coverArt: key },
        });
        return { trackId, status: 'cover_uploaded' };
    }

    // Update track status and queue transcoding
    await Track.findByIdAndUpdate(trackId, {
        $set: {
            'files.original': key,
            mimeType: contentType,
            status: 'processing',
        },
    });

    // Queue transcoding job
    const queue = getTranscodeQueue();
    await queue.add('transcode', {
        trackId,
        sourceKey: key,
        contentType,
    }, {
        jobId: `transcode-${trackId}`,
    });

    return { trackId, status: 'processing' };
}

/**
 * Get streaming URL for a track
 */
export async function getStreamUrl(
    trackId: string,
    quality: 'high' | 'medium' = 'high'
): Promise<{ url: string; format: string }> {
    const track = await Track.findById(trackId);
    if (!track) {
        throw ApiError.notFound('Track not found');
    }

    if (track.status !== 'ready') {
        throw ApiError.badRequest('Track is not ready for streaming');
    }

    // Check for external URL first (for demo tracks)
    if (track.externalStreamUrl) {
        return { url: track.externalStreamUrl, format: 'external' };
    }

    let key: string | undefined;
    let format: string;

    if (quality === 'high' && track.files.mp3_320) {
        key = track.files.mp3_320;
        format = 'mp3_320';
    } else if (track.files.mp3_128) {
        key = track.files.mp3_128;
        format = 'mp3_128';
    } else if (track.files.original) {
        key = track.files.original;
        format = 'original';
    }

    if (!key) {
        throw ApiError.notFound('No audio file available');
    }

    const url = await getPresignedDownloadUrl(key);
    return { url, format };
}

/**
 * Get waveform data for a track
 */
export async function getWaveformUrl(trackId: string): Promise<string | null> {
    const track = await Track.findById(trackId);
    if (!track || !track.files.waveformJson) {
        return null;
    }

    return getPresignedDownloadUrl(track.files.waveformJson);
}

function getExtensionFromMimeType(mimeType: string): string {
    const map: Record<string, string> = {
        'audio/mpeg': 'mp3',
        'audio/mp3': 'mp3',
        'audio/wav': 'wav',
        'audio/wave': 'wav',
        'audio/x-wav': 'wav',
        'audio/flac': 'flac',
        'audio/ogg': 'ogg',
        'audio/aac': 'aac',
        'audio/m4a': 'm4a',
        'audio/x-m4a': 'm4a',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
    };
    return map[mimeType] || 'bin';
}

export default {
    getAudioUploadUrl,
    getCoverUploadUrl,
    completeUpload,
    getStreamUrl,
    getWaveformUrl,
};
