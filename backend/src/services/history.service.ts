import { Types } from 'mongoose';
import { ListenHistory } from '../models/ListenHistory.js';
import { Track } from '../models/Track.js';

interface ListenEvent {
    userId: string;
    trackId: string;
    duration: number;
    completed: boolean;
}

/**
 * Record a listen event
 */
export async function recordListen(event: ListenEvent): Promise<void> {
    await ListenHistory.create({
        userId: new Types.ObjectId(event.userId),
        trackId: new Types.ObjectId(event.trackId),
        playedAt: new Date(),
        duration: event.duration,
        completed: event.completed,
    });
}

/**
 * Get recently played tracks for a user
 */
export async function getRecentlyPlayed(
    userId: string,
    limit: number = 20
): Promise<any[]> {
    const history = await ListenHistory.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        { $sort: { playedAt: -1 } },
        // Group by track to remove duplicates, keep most recent
        {
            $group: {
                _id: '$trackId',
                playedAt: { $first: '$playedAt' },
                duration: { $first: '$duration' },
            },
        },
        { $sort: { playedAt: -1 } },
        { $limit: limit },
        // Lookup track details
        {
            $lookup: {
                from: 'tracks',
                localField: '_id',
                foreignField: '_id',
                as: 'track',
            },
        },
        { $unwind: '$track' },
        // Lookup artist details
        {
            $lookup: {
                from: 'artists',
                localField: 'track.artistId',
                foreignField: '_id',
                as: 'track.artistId',
            },
        },
        {
            $unwind: {
                path: '$track.artistId',
                preserveNullAndEmptyArrays: true,
            },
        },
    ]);

    return history.map((h) => ({
        ...h.track,
        lastPlayedAt: h.playedAt,
    }));
}

/**
 * Get listening stats for a user
 */
export async function getListeningStats(
    userId: string,
    period: 'week' | 'month' | 'all' = 'month'
): Promise<{
    totalListeningTime: number;
    tracksPlayed: number;
    uniqueTracks: number;
    topTracks: any[];
    topGenres: { genre: string; count: number }[];
}> {
    const userObjId = new Types.ObjectId(userId);

    // Calculate date filter
    let dateFilter: Date | null = null;
    const now = new Date();
    if (period === 'week') {
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchStage: any = { userId: userObjId };
    if (dateFilter) {
        matchStage.playedAt = { $gte: dateFilter };
    }

    // Get basic stats
    const basicStats = await ListenHistory.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalListeningTime: { $sum: '$duration' },
                tracksPlayed: { $sum: 1 },
                uniqueTracks: { $addToSet: '$trackId' },
            },
        },
    ]);

    // Get top tracks
    const topTracks = await ListenHistory.aggregate([
        { $match: matchStage },
        { $group: { _id: '$trackId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'tracks',
                localField: '_id',
                foreignField: '_id',
                as: 'track',
            },
        },
        { $unwind: '$track' },
        {
            $lookup: {
                from: 'artists',
                localField: 'track.artistId',
                foreignField: '_id',
                as: 'track.artistId',
            },
        },
        {
            $unwind: {
                path: '$track.artistId',
                preserveNullAndEmptyArrays: true,
            },
        },
    ]);

    // Get top genres
    const topGenres = await ListenHistory.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: 'tracks',
                localField: 'trackId',
                foreignField: '_id',
                as: 'track',
            },
        },
        { $unwind: '$track' },
        { $unwind: '$track.genres' },
        { $group: { _id: '$track.genres', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
    ]);

    const stats = basicStats[0] || {
        totalListeningTime: 0,
        tracksPlayed: 0,
        uniqueTracks: [],
    };

    return {
        totalListeningTime: stats.totalListeningTime,
        tracksPlayed: stats.tracksPlayed,
        uniqueTracks: stats.uniqueTracks?.length || 0,
        topTracks: topTracks.map((t) => ({
            ...t.track,
            playCount: t.count,
        })),
        topGenres: topGenres.map((g) => ({
            genre: g._id,
            count: g.count,
        })),
    };
}

export default {
    recordListen,
    getRecentlyPlayed,
    getListeningStats,
};
