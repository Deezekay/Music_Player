import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from './index.js';

// Create S3 client (compatible with MinIO)
export const s3Client = new S3Client({
    endpoint: config.s3.endpoint,
    region: config.s3.region,
    credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
    },
    forcePathStyle: config.s3.usePathStyle, // Required for MinIO
});

/**
 * Generate a presigned URL for uploading a file
 */
export async function getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = config.presigned.uploadExpiry
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: config.s3.bucket,
        Key: key,
        ContentType: contentType,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading/streaming a file
 */
export async function getPresignedDownloadUrl(
    key: string,
    expiresIn: number = config.presigned.downloadExpiry
): Promise<string> {
    // If CDN is configured, use CDN URL
    if (config.cdn.domain) {
        // For production: implement CloudFront signed URLs
        // For now, return direct CDN URL (requires public bucket or signed cookies)
        return `${config.cdn.domain}/${key}`;
    }

    const command = new GetObjectCommand({
        Bucket: config.s3.bucket,
        Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Check if a file exists in S3
 */
export async function fileExists(key: string): Promise<boolean> {
    try {
        await s3Client.send(
            new HeadObjectCommand({
                Bucket: config.s3.bucket,
                Key: key,
            })
        );
        return true;
    } catch {
        return false;
    }
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<void> {
    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: config.s3.bucket,
            Key: key,
        })
    );
}

/**
 * Generate S3 key for different file types
 */
export const S3Keys = {
    original: (trackId: string, ext: string) => `tracks/${trackId}/original.${ext}`,
    mp3_320: (trackId: string) => `tracks/${trackId}/audio_320.mp3`,
    mp3_128: (trackId: string) => `tracks/${trackId}/audio_128.mp3`,
    waveform: (trackId: string) => `tracks/${trackId}/waveform.json`,
    coverArt: (trackId: string, ext: string) => `tracks/${trackId}/cover.${ext}`,
    avatar: (userId: string, ext: string) => `avatars/${userId}.${ext}`,
    hlsMaster: (trackId: string) => `tracks/${trackId}/hls/master.m3u8`,
};

export default {
    s3Client,
    getPresignedUploadUrl,
    getPresignedDownloadUrl,
    fileExists,
    deleteFile,
    S3Keys,
};
