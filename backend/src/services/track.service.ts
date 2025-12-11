import { Types } from 'mongoose';
import { Track, ITrack, Artist, Like } from '../models/index.js';
import { getPresignedDownloadUrl, S3Keys, fileExists } from '../config/s3.js';
import { ApiError } from '../middleware/errorHandler.js';

interface SearchOptions {
    query?: string;
    genre?: string;
    artistId?: string;
    status?: 'pending' | 'processing' | 'ready' | 'rejected';
    limit?: number;
    offset?: number;
    sortBy?: 'plays' | 'createdAt' | 'title';
    sortOrder?: 'asc' | 'desc';
}

interface TrackWithUrls extends Omit<ITrack, 'files'> {
    streamUrl?: string;
    waveformUrl?: string;
    coverArtUrl?: string;
    isLiked?: boolean;
}

/**
 * Get track by ID with streaming URLs
 */
export async function getTrackById(
    trackId: string,
    userId?: string
): Promise<TrackWithUrls | null> {
    const track = await Track.findById(trackId).populate('artistId', 'name avatarUrl verified');

    if (!track) return null;

    const trackObj = track.toObject() as TrackWithUrls;

    // Generate streaming URLs
    if (track.files.mp3_320) {
        trackObj.streamUrl = await getPresignedDownloadUrl(track.files.mp3_320);
    } else if (track.files.mp3_128) {
        trackObj.streamUrl = await getPresignedDownloadUrl(track.files.mp3_128);
    }

    if (track.files.waveformJson) {
        trackObj.waveformUrl = await getPresignedDownloadUrl(track.files.waveformJson);
    }

    if (track.coverArt) {
        trackObj.coverArtUrl = await getPresignedDownloadUrl(track.coverArt);
    }

    // Check if user has liked this track
    if (userId) {
        const like = await Like.findOne({ userId, trackId: track._id });
        trackObj.isLiked = !!like;
    }

    return trackObj;
}

/**
 * Search and filter tracks
 */
export async function searchTracks(options: SearchOptions): Promise<{
    tracks: ITrack[];
    total: number;
    hasMore: boolean;
}> {
    const {
        query,
        genre,
        artistId,
        status = 'ready',
        limit = 20,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = options;

    const filter: any = { status };

    // Use regex for search (simpler than $text, works without text index)
    if (query) {
        const searchRegex = new RegExp(query, 'i'); // case-insensitive
        filter.$or = [
            { title: searchRegex },
            { artistName: searchRegex },
            { tags: searchRegex },
        ];
    }

    if (genre) {
        // Case-insensitive genre match
        filter.genres = new RegExp(genre, 'i');
    }

    if (artistId) {
        filter.artistId = new Types.ObjectId(artistId);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [tracks, total] = await Promise.all([
        Track.find(filter)
            .sort(sort)
            .skip(offset)
            .limit(limit)
            .populate('artistId', 'name avatarUrl verified'),
        Track.countDocuments(filter),
    ]);

    return {
        tracks,
        total,
        hasMore: offset + tracks.length < total,
    };
}

/**
 * Create a new track (metadata only, file upload is separate)
 */
export async function createTrack(
    data: {
        title: string;
        artistId: string;
        genres?: string[];
        tags?: string[];
        releaseDate?: Date;
        explicit?: boolean;
    },
    createdByUserId: string
): Promise<ITrack> {
    const artist = await Artist.findById(data.artistId);
    if (!artist) {
        throw ApiError.notFound('Artist not found');
    }

    const track = await Track.create({
        ...data,
        artistName: artist.name,
        createdByUserId: new Types.ObjectId(createdByUserId),
        status: 'pending',
    });

    return track;
}

/**
 * Update track metadata
 */
export async function updateTrack(
    trackId: string,
    userId: string,
    updates: Partial<Pick<ITrack, 'title' | 'genres' | 'tags' | 'releaseDate' | 'explicit'>>
): Promise<ITrack> {
    const track = await Track.findById(trackId);
    if (!track) {
        throw ApiError.notFound('Track not found');
    }

    // Check ownership
    if (track.createdByUserId.toString() !== userId) {
        throw ApiError.forbidden('Not authorized to update this track');
    }

    Object.assign(track, updates);
    await track.save();

    return track;
}

/**
 * Update track files after processing
 */
export async function updateTrackFiles(
    trackId: string,
    files: Partial<ITrack['files']>,
    metadata?: {
        duration?: number;
        bitrate?: number;
        sampleRate?: number;
    }
): Promise<ITrack> {
    const update: any = {
        $set: {
            status: 'ready',
        },
    };

    if (files) {
        for (const [key, value] of Object.entries(files)) {
            update.$set[`files.${key}`] = value;
        }
    }

    if (metadata) {
        Object.assign(update.$set, metadata);
    }

    const track = await Track.findByIdAndUpdate(trackId, update, { new: true });
    if (!track) {
        throw ApiError.notFound('Track not found');
    }

    return track;
}

/**
 * Increment play count
 */
export async function incrementPlayCount(trackId: string): Promise<void> {
    await Track.findByIdAndUpdate(trackId, { $inc: { plays: 1 } });
}

/**
 * Like a track
 */
export async function likeTrack(userId: string, trackId: string): Promise<boolean> {
    try {
        await Like.create({ userId, trackId });
        await Track.findByIdAndUpdate(trackId, { $inc: { likes: 1 } });
        return true;
    } catch (error: any) {
        if (error.code === 11000) {
            // Already liked
            return false;
        }
        throw error;
    }
}

/**
 * Unlike a track
 */
export async function unlikeTrack(userId: string, trackId: string): Promise<boolean> {
    const result = await Like.findOneAndDelete({ userId, trackId });
    if (result) {
        await Track.findByIdAndUpdate(trackId, { $inc: { likes: -1 } });
        return true;
    }
    return false;
}

/**
 * Get user's liked tracks
 */
export async function getLikedTracks(
    userId: string,
    limit: number = 50,
    offset: number = 0
): Promise<ITrack[]> {
    const likes = await Like.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate({
            path: 'trackId',
            populate: { path: 'artistId', select: 'name avatarUrl' },
        });

    return likes.map((like) => like.trackId as unknown as ITrack).filter(Boolean);
}

/**
 * Delete a track
 */
export async function deleteTrack(trackId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const track = await Track.findById(trackId);
    if (!track) {
        throw ApiError.notFound('Track not found');
    }

    if (!isAdmin && track.createdByUserId.toString() !== userId) {
        throw ApiError.forbidden('Not authorized to delete this track');
    }

    // Note: S3 files cleanup should be done via background job
    await Track.findByIdAndDelete(trackId);
    await Like.deleteMany({ trackId });
}

export default {
    getTrackById,
    searchTracks,
    createTrack,
    updateTrack,
    updateTrackFiles,
    incrementPlayCount,
    likeTrack,
    unlikeTrack,
    getLikedTracks,
    deleteTrack,
};
