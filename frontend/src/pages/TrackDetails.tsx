import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { Track, setQueue } from '../store/slices/playerSlice';
import { tracksApi } from '../services/api';
import api from '../services/api';

interface ArtistData {
    _id: string;
    name: string;
    bio?: string;
    avatarUrl?: string;
    verified?: boolean;
    genres?: string[];
    monthlyListeners?: number;
}

export default function TrackDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [track, setTrack] = useState<Track | null>(null);
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const fetchTrackDetails = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                // Fetch track data
                const trackData = await tracksApi.getById(id);
                setTrack(trackData);
                setIsLiked(trackData.isLiked || false);

                // Fetch artist data if available
                if (trackData.artistId?._id) {
                    try {
                        const artistData = await api.get(`/artists/${trackData.artistId._id}`);
                        setArtist(artistData.data);
                    } catch (error) {
                        console.error('Failed to fetch artist:', error);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch track:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrackDetails();
    }, [id]);

    const handlePlay = () => {
        if (track) {
            dispatch(setQueue({ tracks: [track], startIndex: 0 }));
        }
    };

    const handleLike = async () => {
        if (!track) return;
        try {
            if (isLiked) {
                await tracksApi.unlike(track._id);
                setIsLiked(false);
            } else {
                await tracksApi.like(track._id);
                setIsLiked(true);
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

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-64 bg-surface-700 rounded-2xl" />
                <div className="h-8 w-48 bg-surface-700 rounded" />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-surface-700 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (!track) {
        return (
            <div className="text-center py-12">
                <span className="text-6xl">🎵</span>
                <h2 className="text-2xl font-bold mt-4">Track not found</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary-400 mt-2 inline-block hover:text-primary-300"
                >
                    ← Go back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors"
            >
                <span>←</span>
                <span>Back</span>
            </button>

            {/* Track Header */}
            <div
                className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500/20 to-accent-500/20"
                style={{
                    backgroundImage: track.coverArt ? `url(${track.coverArt})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-end gap-6">
                        {/* Cover Art */}
                        <div className="w-48 h-48 rounded-lg bg-surface-800 overflow-hidden flex-shrink-0 shadow-2xl">
                            {track.coverArt ? (
                                <img
                                    src={track.coverArt}
                                    alt={track.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">
                                    🎵
                                </div>
                            )}
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-surface-300 mb-2">Song</p>
                            <h1 className="text-5xl font-bold mb-4 truncate">{track.title}</h1>
                            <div className="flex items-center gap-3 flex-wrap">
                                {artist?.avatarUrl && (
                                    <img
                                        src={artist.avatarUrl}
                                        alt={artist.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                                <Link
                                    to={`/artist/${track.artistId?._id}`}
                                    className="text-lg font-medium hover:underline"
                                >
                                    {track.artistId?.name || track.artistName || 'Unknown Artist'}
                                </Link>
                                {artist?.verified && (
                                    <span className="text-primary-400" title="Verified Artist">
                                        ✓
                                    </span>
                                )}
                                {track.albumName && (
                                    <>
                                        <span className="text-surface-500">•</span>
                                        <span className="text-surface-300">{track.albumName}</span>
                                    </>
                                )}
                                {track.releaseDate && (
                                    <>
                                        <span className="text-surface-500">•</span>
                                        <span className="text-surface-300">
                                            {new Date(track.releaseDate).getFullYear()}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 mt-6">
                        <button
                            onClick={handlePlay}
                            className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center text-2xl transition-all hover:scale-105"
                        >
                            ▶️
                        </button>
                        <button
                            onClick={handleLike}
                            className={`w-12 h-12 rounded-full border-2 transition-all ${isLiked
                                    ? 'border-red-500 text-red-500'
                                    : 'border-surface-600 text-surface-400 hover:border-red-500 hover:text-red-500'
                                }`}
                        >
                            {isLiked ? '❤️' : '🤍'}
                        </button>
                        {track.explicit && (
                            <span className="px-3 py-1 rounded bg-surface-700 text-surface-300 text-sm">
                                🅴 Explicit
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Track Information */}
                    <div className="glass rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Track Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-surface-400 mb-1">Duration</p>
                                <p className="text-lg font-medium">{formatDuration(track.duration)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-surface-400 mb-1">Release Date</p>
                                <p className="text-lg font-medium">{formatDate(track.releaseDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-surface-400 mb-1">Bitrate</p>
                                <p className="text-lg font-medium">{formatBitrate(track.bitrate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-surface-400 mb-1">Sample Rate</p>
                                <p className="text-lg font-medium">{formatSampleRate(track.sampleRate)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Genres */}
                    {track.genres && track.genres.length > 0 && (
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">Genres</h2>
                            <div className="flex flex-wrap gap-2">
                                {track.genres.map((genre) => (
                                    <span
                                        key={genre}
                                        className="px-4 py-2 rounded-full bg-primary-500/20 text-primary-300 font-medium"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {track.tags && track.tags.length > 0 && (
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">Tags</h2>
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

                    {/* Statistics */}
                    <div className="glass rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4">Statistics</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-surface-800">
                                <p className="text-sm text-surface-400 mb-1">Total Plays</p>
                                <p className="text-3xl font-bold text-primary-400">
                                    {track.plays.toLocaleString()}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-surface-800">
                                <p className="text-sm text-surface-400 mb-1">Total Likes</p>
                                <p className="text-3xl font-bold text-red-400">
                                    {track.likes.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Artist Info */}
                <div className="space-y-6">
                    {artist && (
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">Artist</h2>
                            <Link
                                to={`/artist/${artist._id}`}
                                className="block group"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold overflow-hidden">
                                        {artist.avatarUrl ? (
                                            <img
                                                src={artist.avatarUrl}
                                                alt={artist.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            artist.name[0].toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg truncate group-hover:text-primary-400 transition-colors">
                                                {artist.name}
                                            </h3>
                                            {artist.verified && (
                                                <span className="text-primary-400" title="Verified">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        {artist.monthlyListeners !== undefined && (
                                            <p className="text-sm text-surface-400">
                                                {artist.monthlyListeners.toLocaleString()} monthly listeners
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {artist.bio && (
                                    <p className="text-sm text-surface-300 line-clamp-4 mb-4">
                                        {artist.bio}
                                    </p>
                                )}
                                <button className="w-full px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 font-medium transition-colors">
                                    View Artist Profile
                                </button>
                            </Link>
                        </div>
                    )}

                    {/* Artist Genres */}
                    {artist?.genres && artist.genres.length > 0 && (
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-lg font-bold mb-3">Artist Genres</h2>
                            <div className="flex flex-wrap gap-2">
                                {artist.genres.map((genre) => (
                                    <span
                                        key={genre}
                                        className="px-3 py-1 rounded-full bg-surface-700 text-surface-300 text-sm"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
