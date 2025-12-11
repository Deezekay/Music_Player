import { Track } from '../store/slices/playerSlice';

interface TrackDetailsModalProps {
    track: Track;
    onClose: () => void;
}

export default function TrackDetailsModal({ track, onClose }: TrackDetailsModalProps) {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatBitrate = (bitrate?: number) => {
        if (!bitrate) return 'Unknown';
        return `${Math.round(bitrate / 1000)} kbps`;
    };

    const formatSampleRate = (sampleRate?: number) => {
        if (!sampleRate) return 'Unknown';
        return `${(sampleRate / 1000).toFixed(1)} kHz`;
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with cover art */}
                <div className="relative h-64 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-t-2xl overflow-hidden">
                    {track.coverArt ? (
                        <img
                            src={track.coverArt}
                            alt={track.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-8xl">
                            🎵
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full glass hover:bg-white/20 flex items-center justify-center text-xl transition-colors"
                    >
                        ✕
                    </button>

                    {/* Title and artist overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-3xl font-bold mb-2">{track.title}</h2>
                        <p className="text-lg text-surface-300">
                            {track.artistId?.name || track.artistName || 'Unknown Artist'}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Album Info */}
                    {track.albumName && (
                        <div>
                            <h3 className="text-sm font-semibold text-surface-400 uppercase mb-2">Album</h3>
                            <p className="text-lg">{track.albumName}</p>
                        </div>
                    )}

                    {/* Release Date */}
                    {track.releaseDate && (
                        <div>
                            <h3 className="text-sm font-semibold text-surface-400 uppercase mb-2">Release Date</h3>
                            <p className="text-lg">{formatDate(track.releaseDate)}</p>
                        </div>
                    )}

                    {/* Genres */}
                    {track.genres && track.genres.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-surface-400 uppercase mb-2">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                                {track.genres.map((genre) => (
                                    <span
                                        key={genre}
                                        className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-sm font-medium"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {track.tags && track.tags.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-surface-400 uppercase mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {track.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full bg-surface-700 text-surface-300 text-sm"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Audio Quality */}
                    <div>
                        <h3 className="text-sm font-semibold text-surface-400 uppercase mb-2">Audio Quality</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="glass p-3 rounded-lg">
                                <p className="text-xs text-surface-400 mb-1">Duration</p>
                                <p className="text-lg font-medium">{formatDuration(track.duration)}</p>
                            </div>
                            <div className="glass p-3 rounded-lg">
                                <p className="text-xs text-surface-400 mb-1">Bitrate</p>
                                <p className="text-lg font-medium">{formatBitrate(track.bitrate)}</p>
                            </div>
                            <div className="glass p-3 rounded-lg">
                                <p className="text-xs text-surface-400 mb-1">Sample Rate</p>
                                <p className="text-lg font-medium">{formatSampleRate(track.sampleRate)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div>
                        <h3 className="text-sm font-semibold text-surface-400 uppercase mb-2">Statistics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass p-3 rounded-lg">
                                <p className="text-xs text-surface-400 mb-1">Total Plays</p>
                                <p className="text-2xl font-bold text-primary-400">{track.plays.toLocaleString()}</p>
                            </div>
                            <div className="glass p-3 rounded-lg">
                                <p className="text-xs text-surface-400 mb-1">Total Likes</p>
                                <p className="text-2xl font-bold text-red-400">{track.likes.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Explicit Badge */}
                    {track.explicit && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-800 border border-surface-700">
                            <span className="text-2xl">🅴</span>
                            <span className="text-sm text-surface-300">This track contains explicit content</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
