import { useState, useEffect } from 'react';
import { tracksApi } from '../services/api';
import TrackCard from '../components/TrackCard';
import { Track } from '../store/slices/playerSlice';

export default function Home() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [recentTracks, setRecentTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await tracksApi.search({ limit: 20 });
                setTracks(response.tracks);

                // Get recent tracks for "Recently Played" section
                const recentResponse = await tracksApi.search({ limit: 5 });
                setRecentTracks(recentResponse.tracks);
            } catch (error) {
                console.error('Failed to fetch tracks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTracks();
    }, []);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="animate-fade-in space-y-8">
            {/* Hero section - Premium design */}
            <section className="mb-8">
                <div className="relative rounded-3xl overflow-hidden p-12 group">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 opacity-90"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    {/* Floating orbs */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                            {greeting()}
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                            Discover new music and rediscover your favorites in a whole new way
                        </p>
                    </div>
                </div>
            </section>

            {/* Recently Played */}
            {recentTracks.length > 0 && (
                <section className="mb-8 animate-slide-up">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span className="text-3xl">🎧</span>
                        Recently Played
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {recentTracks.map((track) => (
                            <div
                                key={track._id}
                                className="group relative p-4 rounded-2xl glass glass-hover cursor-pointer transition-all duration-300"
                            >
                                {/* Hover glow effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-fuchsia-500/0 group-hover:from-purple-500/10 group-hover:to-fuchsia-500/10 transition-all duration-300"></div>

                                <div className="relative">
                                    <div className="aspect-square rounded-xl bg-surface-700 mb-3 overflow-hidden shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                                        {track.coverArt ? (
                                            <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20">
                                                🎵
                                            </div>
                                        )}
                                        {/* Play button overlay */}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                                <span className="text-2xl text-black ml-1">▶</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-semibold truncate group-hover:text-purple-400 transition-colors">{track.title}</p>
                                    <p className="text-sm text-surface-400 truncate">
                                        {track.artistId?.name || track.artistName || 'Unknown Artist'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Popular tracks */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Popular Tracks</h2>

                {isLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 animate-pulse">
                                <div className="w-14 h-14 rounded-lg bg-surface-700" />
                                <div className="flex-1">
                                    <div className="h-4 w-48 bg-surface-700 rounded mb-2" />
                                    <div className="h-3 w-32 bg-surface-700 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : tracks.length > 0 ? (
                    <div className="glass rounded-xl divide-y divide-white/5">
                        {tracks.map((track, index) => (
                            <TrackCard key={track._id} track={track} tracks={tracks} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-surface-400">
                        <p className="text-4xl mb-4">🎵</p>
                        <p>No tracks available yet</p>
                        <p className="text-sm mt-2">Be the first to upload!</p>
                    </div>
                )}
            </section>
        </div>
    );
}
