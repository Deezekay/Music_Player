import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const googleAuthSchema = z.object({
    idToken: z.string().min(1, 'ID token is required'),
});

// Track schemas
export const createTrackSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    artistId: z.string().min(1, 'Artist ID is required'),
    genres: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    releaseDate: z.string().datetime().optional(),
    explicit: z.boolean().optional(),
});

export const updateTrackSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    genres: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    releaseDate: z.string().datetime().optional(),
    explicit: z.boolean().optional(),
});

export const searchTracksSchema = z.object({
    query: z.string().optional(),
    genre: z.string().optional(),
    artistId: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
    sortBy: z.enum(['plays', 'createdAt', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Playlist schemas
export const createPlaylistSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional(),
});

export const updatePlaylistSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional(),
    collaborative: z.boolean().optional(),
});

export const addTrackToPlaylistSchema = z.object({
    trackId: z.string().min(1, 'Track ID is required'),
});

export const reorderTracksSchema = z.object({
    trackOrders: z.array(
        z.object({
            trackId: z.string(),
            order: z.number(),
        })
    ),
});

// Upload schemas
export const presignedUploadSchema = z.object({
    contentType: z.string().min(1, 'Content type is required'),
});

export const completeUploadSchema = z.object({
    uploadId: z.string().min(1, 'Upload ID is required'),
});

// User schemas
export const updateProfileSchema = z.object({
    displayName: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
});

// Common param schemas
export const idParamSchema = z.object({
    id: z.string().min(1, 'ID is required'),
});

export const trackIdParamSchema = z.object({
    trackId: z.string().min(1, 'Track ID is required'),
});

export const playlistIdParamSchema = z.object({
    playlistId: z.string().min(1, 'Playlist ID is required'),
});
