import { Types } from 'mongoose';
import { Playlist, IPlaylist, Track } from '../models/index.js';
import { ApiError } from '../middleware/errorHandler.js';
import { getPresignedDownloadUrl } from '../config/s3.js';

/**
 * Create a new playlist
 */
export async function createPlaylist(
    userId: string,
    data: { name: string; description?: string; isPublic?: boolean }
): Promise<IPlaylist> {
    const playlist = await Playlist.create({
        name: data.name,
        description: data.description,
        isPublic: data.isPublic ?? false,
        ownerId: new Types.ObjectId(userId),
        tracks: [],
    });

    return playlist;
}

/**
 * Get playlist by ID
 */
export async function getPlaylistById(
    playlistId: string,
    userId?: string
): Promise<IPlaylist | null> {
    const playlist = await Playlist.findById(playlistId)
        .populate('ownerId', 'username profile.displayName profile.avatarUrl')
        .populate({
            path: 'tracks.trackId',
            populate: { path: 'artistId', select: 'name avatarUrl' },
        });

    if (!playlist) return null;

    // Check access
    if (!playlist.isPublic && (!userId || playlist.ownerId._id.toString() !== userId)) {
        throw ApiError.forbidden('Playlist is private');
    }

    return playlist;
}

/**
 * Get user's playlists
 */
export async function getUserPlaylists(
    userId: string,
    includePrivate: boolean = true
): Promise<IPlaylist[]> {
    const filter: any = { ownerId: new Types.ObjectId(userId) };
    if (!includePrivate) {
        filter.isPublic = true;
    }

    return Playlist.find(filter)
        .sort({ updatedAt: -1 })
        .select('-tracks'); // Don't include full track list in listing
}

/**
 * Update playlist
 */
export async function updatePlaylist(
    playlistId: string,
    userId: string,
    updates: Partial<Pick<IPlaylist, 'name' | 'description' | 'isPublic' | 'collaborative'>>
): Promise<IPlaylist> {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw ApiError.notFound('Playlist not found');
    }

    if (playlist.ownerId.toString() !== userId) {
        throw ApiError.forbidden('Not authorized');
    }

    Object.assign(playlist, updates);
    await playlist.save();

    return playlist;
}

/**
 * Delete playlist
 */
export async function deletePlaylist(playlistId: string, userId: string): Promise<void> {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw ApiError.notFound('Playlist not found');
    }

    if (playlist.ownerId.toString() !== userId) {
        throw ApiError.forbidden('Not authorized');
    }

    await playlist.deleteOne();
}

/**
 * Add track to playlist
 */
export async function addTrackToPlaylist(
    playlistId: string,
    trackId: string,
    userId: string
): Promise<IPlaylist> {
    const [playlist, track] = await Promise.all([
        Playlist.findById(playlistId),
        Track.findById(trackId),
    ]);

    if (!playlist) {
        throw ApiError.notFound('Playlist not found');
    }
    if (!track) {
        throw ApiError.notFound('Track not found');
    }

    // Check authorization
    const isOwner = playlist.ownerId.toString() === userId;
    const isCollaborator = playlist.collaborators.some((c) => c.toString() === userId);

    if (!isOwner && !(playlist.collaborative && isCollaborator)) {
        throw ApiError.forbidden('Not authorized to modify this playlist');
    }

    // Check if track already exists
    const exists = playlist.tracks.some((t) => t.trackId.toString() === trackId);
    if (exists) {
        throw ApiError.conflict('Track already in playlist');
    }

    // Add track
    const maxOrder = playlist.tracks.reduce((max, t) => Math.max(max, t.order), 0);
    playlist.tracks.push({
        trackId: new Types.ObjectId(trackId),
        addedAt: new Date(),
        addedBy: new Types.ObjectId(userId),
        order: maxOrder + 1,
    });

    // Update total duration
    playlist.totalDuration += track.duration || 0;

    await playlist.save();
    return playlist;
}

/**
 * Remove track from playlist
 */
export async function removeTrackFromPlaylist(
    playlistId: string,
    trackId: string,
    userId: string
): Promise<IPlaylist> {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw ApiError.notFound('Playlist not found');
    }

    const isOwner = playlist.ownerId.toString() === userId;
    const isCollaborator = playlist.collaborators.some((c) => c.toString() === userId);

    if (!isOwner && !(playlist.collaborative && isCollaborator)) {
        throw ApiError.forbidden('Not authorized');
    }

    const trackIndex = playlist.tracks.findIndex((t) => t.trackId.toString() === trackId);
    if (trackIndex === -1) {
        throw ApiError.notFound('Track not in playlist');
    }

    // Get track duration to update total
    const track = await Track.findById(trackId);
    if (track) {
        playlist.totalDuration -= track.duration || 0;
    }

    playlist.tracks.splice(trackIndex, 1);
    await playlist.save();

    return playlist;
}

/**
 * Reorder tracks in playlist
 */
export async function reorderPlaylistTracks(
    playlistId: string,
    trackOrders: { trackId: string; order: number }[],
    userId: string
): Promise<IPlaylist> {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw ApiError.notFound('Playlist not found');
    }

    if (playlist.ownerId.toString() !== userId) {
        throw ApiError.forbidden('Not authorized');
    }

    // Update track orders
    for (const { trackId, order } of trackOrders) {
        const track = playlist.tracks.find((t) => t.trackId.toString() === trackId);
        if (track) {
            track.order = order;
        }
    }

    // Sort by order
    playlist.tracks.sort((a, b) => a.order - b.order);

    await playlist.save();
    return playlist;
}

/**
 * Add collaborator to playlist
 */
export async function addCollaborator(
    playlistId: string,
    collaboratorId: string,
    userId: string
): Promise<IPlaylist> {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw ApiError.notFound('Playlist not found');
    }

    if (playlist.ownerId.toString() !== userId) {
        throw ApiError.forbidden('Only the owner can add collaborators');
    }

    if (!playlist.collaborative) {
        throw ApiError.badRequest('Playlist is not collaborative');
    }

    if (playlist.collaborators.some((c) => c.toString() === collaboratorId)) {
        throw ApiError.conflict('User is already a collaborator');
    }

    playlist.collaborators.push(new Types.ObjectId(collaboratorId));
    await playlist.save();

    return playlist;
}

export default {
    createPlaylist,
    getPlaylistById,
    getUserPlaylists,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    reorderPlaylistTracks,
    addCollaborator,
};
