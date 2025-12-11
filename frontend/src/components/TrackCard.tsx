import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Track, setQueue, addToQueue } from '../store/slices/playerSlice';
import { useAppDispatch } from '../store/hooks';
import { tracksApi } from '../services/api';
import AddToPlaylistMenu from './AddToPlaylistMenu';
import TrackDetailsModal from './TrackDetailsModal';

interface TrackCardProps {
    track: Track;
    tracks?: Track[];
    index?: number;
}

export default function TrackCard({ track, tracks, index }: TrackCardProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (tracks && index !== undefined) {
            dispatch(setQueue({ tracks, startIndex: index }));
        } else {
            dispatch(setQueue({ tracks: [track], startIndex: 0 }));
        }
    };

    const handleCardClick = () => {
        navigate(`/track/${track._id}`);
    };

    const handleAddToQueue = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(addToQueue(track));
    };

    const handleAddToPlaylist = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowPlaylistMenu(!showPlaylistMenu);
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (track.isLiked) {
                await tracksApi.unlike(track._id);
            } else {
                await tracksApi.like(track._id);
            }
        } catch (error) {
            console.error('Failed to like/unlike track:', error);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const artistId = track.artistId?._id;

    return (
        <div
            onClick={handleCardClick}
            className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
            {/* Cover art */}
            <div className="relative w-14 h-14 rounded-lg bg-surface-700 flex-shrink-0 overflow-hidden">
                {track.coverArt ? (
                    <img
                        src={track.coverArt}
                        alt={track.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20">
                        🎵
                    </div>
                )}

                {/* Play overlay */}
                <div
                    onClick={handlePlay}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <span className="text-2xl">▶️</span>
                </div>
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate group-hover:text-primary-400 transition-colors">
                        {track.title}
                    </p>
                    {track.explicit && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-surface-700 text-surface-300 flex-shrink-0" title="Explicit content">
                            🅴
                        </span>
                    )}
                </div>
                {/* Clickable artist name */}
                {artistId ? (
                    <Link
                        to={`/artist/${artistId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-surface-400 hover:text-white hover:underline truncate block w-fit"
                    >
                        {track.artistId?.name || track.artistName || 'Unknown Artist'}
                    </Link>
                ) : (
                    <p className="text-sm text-surface-400 truncate">
                        {track.artistName || 'Unknown Artist'}
                    </p>
                )}
                {track.albumName && (
                    <p className="text-xs text-surface-500 truncate">
                        {track.albumName}
                    </p>
                )}
                {track.genres && track.genres.length > 0 && (
                    <div className="flex gap-1 mt-1">
                        {track.genres.slice(0, 2).map((genre) => (
                            <span
                                key={genre}
                                className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400"
                            >
                                {genre}
                            </span>
                        ))}
                        {track.genres.length > 2 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-700 text-surface-400">
                                +{track.genres.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDetailsModal(true);
                    }}
                    className="p-2 text-surface-400 hover:text-white rounded-full transition-colors"
                    title="Track info"
                >
                    ℹ️
                </button>
                <button
                    onClick={handleLike}
                    className={`p-2 rounded-full transition-colors ${track.isLiked ? 'text-red-500' : 'text-surface-400 hover:text-white'
                        }`}
                    title={track.isLiked ? 'Unlike' : 'Like'}
                >
                    {track.isLiked ? '❤️' : '🤍'}
                </button>
                <button
                    onClick={handleAddToPlaylist}
                    className="p-2 text-surface-400 hover:text-white rounded-full transition-colors"
                    title="Add to playlist"
                >
                    📚
                </button>
                <button
                    onClick={handleAddToQueue}
                    className="p-2 text-surface-400 hover:text-white rounded-full transition-colors"
                    title="Add to queue"
                >
                    ➕
                </button>

                {/* Playlist dropdown */}
                {showPlaylistMenu && (
                    <AddToPlaylistMenu
                        trackId={track._id}
                        onClose={() => setShowPlaylistMenu(false)}
                    />
                )}
            </div>

            {/* Duration */}
            <span className="text-sm text-surface-400 w-12 text-right">
                {formatDuration(track.duration)}
            </span>

            {/* Play count */}
            <span className="text-xs text-surface-500 w-16 text-right">
                {track.plays.toLocaleString()} plays
            </span>

            {/* Track Details Modal */}
            {showDetailsModal && (
                <TrackDetailsModal
                    track={track}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}
        </div>
    );
}
