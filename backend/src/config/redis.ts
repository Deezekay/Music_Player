import { Redis } from 'ioredis';
import config from './index.js';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis(config.redisUrl, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            retryStrategy: (times) => {
                if (times > 3) {
                    console.error('Redis connection failed after 3 retries');
                    return null;
                }
                return Math.min(times * 200, 2000);
            },
        });

        redisClient.on('connect', () => {
            console.log('✅ Redis connected');
        });

        redisClient.on('error', (err) => {
            console.error('Redis error:', err);
        });

        redisClient.on('close', () => {
            console.warn('Redis connection closed');
        });
    }

    return redisClient;
}

export async function disconnectRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        console.log('Redis disconnected');
    }
}

export default { getRedisClient, disconnectRedis };
