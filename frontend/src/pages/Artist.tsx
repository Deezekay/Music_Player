import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import TrackCard from '../components/TrackCard';
import { Track } from '../store/slices/playerSlice';
import api from '../services/api';

interface ArtistData {
    _id: string;
    name: string;
    bio?: string;
    avatarUrl?: string;
    headerImage?: string;
    verified?: boolean;
    monthlyListeners?: number;
    followerCount?: number;
    isFollowing?: boolean;
    socialLinks?: {
        spotify?: string;
        instagram?: string;
        twitter?: string;
    };
}

export default function Artist() {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [topTracks, setTopTracks] = useState<Track[]>([]);
    const [allTracks, setAllTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState<'top' | 'all'>('top');

    useEffect(() => {
        const fetchArtist = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const [artistData, topData, allData] = await Promise.all([
                    api.get(`/artists/${id}`),
                    api.get(`/artists/${id}/top`),
                    api.get(`/artists/${id}/tracks`),
                ]);
                setArtist(artistData.data);
                setTopTracks(topData.data);
                setAllTracks(allData.data.tracks);
                setIsFollowing(artistData.data.isFollowing || false);
            } catch (error) {
                console.error('Failed to fetch artist:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtist();
    }, [id]);

    const handleFollow = async () => {
        if (!isAuthenticated || !id) return;
        try {
            if (isFollowing) {
                await api.delete(`/artists/${id}/follow`);
                setIsFollowing(false);
            } else {
                await api.post(`/artists/${id}/follow`);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Failed to follow/unfollow:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-64 bg-surface-700 rounded-2xl mb-8" />
                <div className="h-8 w-48 bg-surface-700 rounded mb-4" />
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-surface-700 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="text-center py-12">
                <span className="text-6xl">🎸</span>
                <h2 className="text-2xl font-bold mt-4">Artist not found</h2>
                <Link to="/" className="text-primary-400 mt-2 inline-block">
                    Go back home
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Artist Header */}
            <div
                className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500/20 to-accent-500/20"
                style={{
                    backgroundImage: artist.headerImage ? `url(${artist.headerImage})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-4xl md:text-6xl font-bold shadow-xl border-4 border-surface-900 flex-shrink-0">
                        {artist.avatarUrl ? (
                            <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            artist.name[0].toUpperCase()
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {artist.verified && (
                                <span className="text-primary-400 text-lg" title="Verified Artist">✓</span>
                            )}
                            <span className="text-sm text-surface-300">Artist</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold truncate">{artist.name}</h1>
                        <p className="text-surface-400 mt-1">
                            {(artist.monthlyListeners || 0).toLocaleString()} monthly listeners
                            {artist.followerCount !== undefined && ` • ${artist.followerCount.toLocaleString()} followers`}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 flex-shrink-0">
                        {isAuthenticated && (
                            <button
                                onClick={handleFollow}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${isFollowing
                                        ? 'border border-white/20 hover:bg-white/5'
                                        : 'bg-primary-500 hover:bg-primary-600'
                                    }`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bio */}
            {artist.bio && (
                <div className="glass rounded-xl p-6">
                    <h2 className="font-semibold mb-2">About</h2>
                    <p className="text-surface-300">{artist.bio}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('top')}
                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'top'
                            ? 'text-white border-b-2 border-primary-500'
                            : 'text-surface-400 hover:text-white'
                        }`}
                >
                    Top Tracks
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'all'
                            ? 'text-white border-b-2 border-primary-500'
                            : 'text-surface-400 hover:text-white'
                        }`}
                >
                    All Tracks
                </button>
            </div>

            {/* Tracks */}
            <div className="glass rounded-xl divide-y divide-white/5">
                {(activeTab === 'top' ? topTracks : allTracks).length > 0 ? (
                    (activeTab === 'top' ? topTracks : allTracks).map((track, index) => (
                        <div key={track._id} className="flex items-center">
                            <span className="w-8 text-center text-lg font-bold text-surface-500">
                                {index + 1}
                            </span>
                            <div className="flex-1">
                                <TrackCard
                                    track={track}
                                    tracks={activeTab === 'top' ? topTracks : allTracks}
                                    index={index}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-surface-400">
                        <span className="text-4xl">🎵</span>
                        <p className="mt-2">No tracks available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
