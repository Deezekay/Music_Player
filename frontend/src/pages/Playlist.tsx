import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { playlistsApi } from '../services/api';
import TrackCard from '../components/TrackCard';
import AddSongsModal from '../components/AddSongsModal';
import { Track, setQueue } from '../store/slices/playerSlice';
import { useAppDispatch } from '../store/hooks';

interface PlaylistData {
    _id: string;
    name: string;
    description?: string;
    isPublic: boolean;
    tracks: { trackId: Track }[];
    ownerId: { username: string };
    trackCount: number;
    totalDuration: number;
}

export default function Playlist() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();
    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddSongs, setShowAddSongs] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchPlaylist = async () => {
            try {
                const data = await playlistsApi.getById(id);
                setPlaylist(data);
            } catch (error) {
                console.error('Failed to fetch playlist:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylist();
    }, [id]);

    const handlePlayAll = () => {
        if (!playlist || !playlist.tracks) return;
        const tracks = playlist.tracks
            .map((t) => t?.trackId)
            .filter((track): track is Track => track != null);
        if (tracks.length === 0) return;
        dispatch(setQueue({ tracks, startIndex: 0 }));
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        }
        return `${minutes} min`;
    };

    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="flex gap-6 mb-8">
                    <div className="w-48 h-48 rounded-xl bg-surface-700" />
                    <div className="flex-1">
                        <div className="h-8 w-64 bg-surface-700 rounded mb-4" />
                        <div className="h-4 w-48 bg-surface-700 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="text-center py-12">
                <p className="text-4xl mb-4">🚫</p>
                <p className="text-surface-400">Playlist not found</p>
            </div>
        );
    }

    const tracks = playlist.tracks
        ?.map((t) => t?.trackId)
        .filter((track): track is Track => track != null) || [];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex gap-6 mb-8">
                <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-6xl shadow-lg">
                    🎵
                </div>
                <div className="flex flex-col justify-end">
                    <span className="text-sm text-surface-400 uppercase tracking-wide">Playlist</span>
                    <h1 className="text-4xl font-bold mt-2 mb-4">{playlist.name}</h1>
                    {playlist.description && (
                        <p className="text-surface-400 mb-2">{playlist.description}</p>
                    )}
                    <div className="text-sm text-surface-400">
                        <span>{playlist.ownerId.username}</span>
                        <span className="mx-2">•</span>
                        <span>{playlist.trackCount} songs</span>
                        <span className="mx-2">•</span>
                        <span>{formatDuration(playlist.totalDuration)}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={handlePlayAll}
                    disabled={tracks.length === 0}
                    title="Play all tracks"
                    className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-400 hover:scale-105 flex items-center justify-center text-2xl transition-all disabled:opacity-50"
                >
                    ▶️
                </button>
                <button
                    onClick={() => setShowAddSongs(true)}
                    title="Add songs to playlist"
                    className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 font-medium transition-colors flex items-center gap-2"
                >
                    <span className="text-xl">+</span>
                    Add Songs
                </button>
            </div>

            {/* Tracks */}
            {tracks.length > 0 ? (
                <div className="glass rounded-xl divide-y divide-white/5">
                    {tracks.map((track, index) => (
                        <TrackCard key={track._id} track={track} tracks={tracks} index={index} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-surface-400">
                    <p className="text-4xl mb-4">📭</p>
                    <p>This playlist is empty</p>
                    <p className="text-sm mt-2">Add some tracks to get started</p>
                </div>
            )}

            {/* Add Songs Modal */}
            {showAddSongs && playlist && (
                <AddSongsModal
                    playlistId={playlist._id}
                    existingTrackIds={tracks.map(t => t._id)}
                    onClose={() => setShowAddSongs(false)}
                    onTrackAdded={() => {
                        // Refresh playlist to show newly added track
                        if (id) {
                            playlistsApi.getById(id).then(data => setPlaylist(data));
                        }
                    }}
                />
            )}
        </div>
    );
}
