import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        error: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Stricter limiter for auth endpoints (prevent brute force)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
        error: 'Too many authentication attempts, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

/**
 * Limiter for upload endpoints
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: {
        error: 'Upload limit reached, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Limiter for streaming endpoints
 */
export const streamLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: {
        error: 'Too many streaming requests',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default { apiLimiter, authLimiter, uploadLimiter, streamLimiter };
