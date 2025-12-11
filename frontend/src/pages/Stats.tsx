import { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { tracksApi } from '../services/api';
import { Track } from '../store/slices/playerSlice';
import TrackCard from '../components/TrackCard';

type TimePeriod = 'week' | 'month' | 'all';

interface Stats {
    totalListeningTime: number;
    tracksPlayed: number;
    topTracks: Track[];
    topGenres: { genre: string; count: number }[];
}

export default function Stats() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [period, setPeriod] = useState<TimePeriod>('month');
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                // In a real app, this would fetch from a stats API
                // For now, we'll simulate with track data
                const tracksData = await tracksApi.search({ limit: 50 });

                // Simulate stats from the track data
                const tracks = tracksData.tracks;
                const totalTime = tracks.reduce((acc: number, t: Track) => acc + (t.plays * t.duration), 0);

                // Extract genres from tracks and count occurrences
                const genreCounts: Record<string, number> = {};
                tracks.forEach((track: any) => {
                    if (track.genres) {
                        track.genres.forEach((genre: string) => {
                            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                        });
                    }
                });

                const topGenres = Object.entries(genreCounts)
                    .map(([genre, count]) => ({ genre, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setStats({
                    totalListeningTime: totalTime,
                    tracksPlayed: tracks.reduce((acc: number, t: Track) => acc + t.plays, 0),
                    topTracks: tracks.slice(0, 5),
                    topGenres,
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchStats();
        } else {
            setIsLoading(false);
        }
    }, [period, isAuthenticated]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <span className="text-6xl mb-4">📊</span>
                <h1 className="text-2xl font-bold mb-2">Your Listening Stats</h1>
                <p className="text-surface-400 mb-6">Sign in to see your personalized listening statistics</p>
                <a
                    href="/login"
                    className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-medium transition-colors"
                >
                    Sign In
                </a>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-8 w-48 bg-surface-700 rounded" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-surface-700 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Your Stats</h1>
                    <p className="text-surface-400">See how you've been listening</p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 bg-surface-800 rounded-xl p-1">
                    {(['week', 'month', 'all'] as TimePeriod[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p
                                    ? 'bg-primary-500 text-white'
                                    : 'text-surface-400 hover:text-white'
                                }`}
                        >
                            {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-6">
                    <p className="text-surface-400 text-sm mb-1">Listening Time</p>
                    <p className="text-3xl font-bold">{formatTime(stats?.totalListeningTime || 0)}</p>
                </div>
                <div className="glass rounded-xl p-6">
                    <p className="text-surface-400 text-sm mb-1">Tracks Played</p>
                    <p className="text-3xl font-bold">{stats?.tracksPlayed.toLocaleString() || 0}</p>
                </div>
                <div className="glass rounded-xl p-6">
                    <p className="text-surface-400 text-sm mb-1">Top Genre</p>
                    <p className="text-3xl font-bold">{stats?.topGenres[0]?.genre || 'N/A'}</p>
                </div>
                <div className="glass rounded-xl p-6">
                    <p className="text-surface-400 text-sm mb-1">Unique Tracks</p>
                    <p className="text-3xl font-bold">{stats?.topTracks.length || 0}</p>
                </div>
            </div>

            {/* Top Tracks */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🎵</span>
                    <h2 className="text-xl font-semibold">Top Tracks</h2>
                </div>
                {stats?.topTracks && stats.topTracks.length > 0 ? (
                    <div className="glass rounded-xl divide-y divide-white/5">
                        {stats.topTracks.map((track, index) => (
                            <div key={track._id} className="flex items-center">
                                <span className="w-8 text-center text-xl font-bold text-primary-400">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <TrackCard track={track} tracks={stats.topTracks} index={index} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-surface-400">No tracks played yet</p>
                )}
            </section>

            {/* Top Genres */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🎭</span>
                    <h2 className="text-xl font-semibold">Top Genres</h2>
                </div>
                {stats?.topGenres && stats.topGenres.length > 0 ? (
                    <div className="space-y-3">
                        {stats.topGenres.map((genre, index) => (
                            <div key={genre.genre} className="glass rounded-xl p-4 flex items-center gap-4">
                                <span className="text-2xl font-bold text-primary-400 w-8">#{index + 1}</span>
                                <div className="flex-1">
                                    <p className="font-medium">{genre.genre}</p>
                                    <p className="text-sm text-surface-400">{genre.count} tracks</p>
                                </div>
                                <div className="w-32 h-2 bg-surface-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                                        style={{ width: `${(genre.count / (stats.topGenres[0]?.count || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-surface-400">No genre data yet</p>
                )}
            </section>
        </div>
    );
}
