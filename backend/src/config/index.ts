import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    // Server
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    // MongoDB
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/musicplayer',

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
    },

    // S3/MinIO
    s3: {
        endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
        bucket: process.env.S3_BUCKET || 'music-player',
        region: process.env.S3_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin123',
        usePathStyle: process.env.S3_USE_PATH_STYLE === 'true',
    },

    // CDN (optional)
    cdn: {
        domain: process.env.CDN_DOMAIN || '',
        keyPairId: process.env.CDN_KEY_PAIR_ID || '',
        privateKeyPath: process.env.CDN_PRIVATE_KEY_PATH || '',
    },

    // Google OAuth
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/oauth/google/callback',
    },

    // Presigned URLs
    presigned: {
        uploadExpiry: parseInt(process.env.PRESIGNED_UPLOAD_EXPIRY || '900', 10),
        downloadExpiry: parseInt(process.env.PRESIGNED_DOWNLOAD_EXPIRY || '300', 10),
    },

    // Rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
} as const;

// Validate required config in production
if (config.env === 'production') {
    const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];
    for (const key of required) {
        if (!process.env[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
}

export default config;
