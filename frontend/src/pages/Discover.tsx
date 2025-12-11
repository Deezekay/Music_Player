import { useState, useEffect } from 'react';
import { tracksApi } from '../services/api';
import TrackCard from '../components/TrackCard';
import { Track } from '../store/slices/playerSlice';

const GENRES = [
    { id: 'electronic', name: 'Electronic', icon: '🎛️', color: 'from-purple-500 to-blue-500' },
    { id: 'rock', name: 'Rock', icon: '🎸', color: 'from-red-500 to-orange-500' },
    { id: 'jazz', name: 'Jazz', icon: '🎷', color: 'from-amber-500 to-yellow-500' },
    { id: 'classical', name: 'Classical', icon: '🎻', color: 'from-emerald-500 to-teal-500' },
    { id: 'hip-hop', name: 'Hip-Hop', icon: '🎤', color: 'from-pink-500 to-rose-500' },
    { id: 'ambient', name: 'Ambient', icon: '🌊', color: 'from-cyan-500 to-blue-500' },
    { id: 'pop', name: 'Pop', icon: '✨', color: 'from-fuchsia-500 to-pink-500' },
    { id: 'indie', name: 'Indie', icon: '🌙', color: 'from-indigo-500 to-purple-500' },
];

export default function Discover() {
    const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
    const [newReleases, setNewReleases] = useState<Track[]>([]);
    const [forYou, setForYou] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [genreTracks, setGenreTracks] = useState<Track[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch trending (most played)
                const trending = await tracksApi.search({
                    limit: 10,
                    // sortBy: 'plays', 
                    // sortOrder: 'desc' 
                });
                setTrendingTracks(trending.tracks);

                // New releases (latest)
                const releases = await tracksApi.search({
                    limit: 10,
                    // sortBy: 'createdAt',
                    // sortOrder: 'desc'
                });
                setNewReleases(releases.tracks);

                // For You - mix of genres (in real app, this would be personalized)
                const forYouData = await tracksApi.search({ limit: 8 });
                setForYou(forYouData.tracks);
            } catch (error) {
                console.error('Failed to fetch discover data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleGenreClick = async (genreId: string) => {
        if (selectedGenre === genreId) {
            setSelectedGenre(null);
            setGenreTracks([]);
            return;
        }

        setSelectedGenre(genreId);
        try {
            const result = await tracksApi.search({ genre: genreId, limit: 20 });
            setGenreTracks(result.tracks);
        } catch (error) {
            console.error('Failed to fetch genre tracks:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-8 w-48 bg-surface-700 rounded" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-32 bg-surface-700 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Discover</h1>
                <p className="text-surface-400">Find new music to love</p>
            </div>

            {/* Genre Grid */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Browse by Genre</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {GENRES.map((genre) => (
                        <button
                            key={genre.id}
                            onClick={() => handleGenreClick(genre.id)}
                            className={`relative h-24 rounded-xl bg-gradient-to-br ${genre.color} p-4 text-left overflow-hidden transition-all hover:scale-105 hover:shadow-lg ${selectedGenre === genre.id ? 'ring-2 ring-white' : ''
                                }`}
                        >
                            <span className="absolute right-2 bottom-2 text-4xl opacity-50">{genre.icon}</span>
                            <span className="font-bold text-lg">{genre.name}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Selected Genre Tracks */}
            {selectedGenre && genreTracks.length > 0 && (
                <section className="animate-fade-in">
                    <h2 className="text-xl font-semibold mb-4">
                        {GENRES.find(g => g.id === selectedGenre)?.name} Tracks
                    </h2>
                    <div className="glass rounded-xl divide-y divide-white/5">
                        {genreTracks.map((track, index) => (
                            <TrackCard key={track._id} track={track} tracks={genreTracks} index={index} />
                        ))}
                    </div>
                </section>
            )}

            {/* Trending Now */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🔥</span>
                    <h2 className="text-xl font-semibold">Trending Now</h2>
                </div>
                {trendingTracks.length > 0 ? (
                    <div className="glass rounded-xl divide-y divide-white/5">
                        {trendingTracks.slice(0, 5).map((track, index) => (
                            <TrackCard key={track._id} track={track} tracks={trendingTracks} index={index} />
                        ))}
                    </div>
                ) : (
                    <p className="text-surface-400">No trending tracks yet</p>
                )}
            </section>

            {/* New Releases */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🆕</span>
                    <h2 className="text-xl font-semibold">New Releases</h2>
                </div>
                {newReleases.length > 0 ? (
                    <div className="glass rounded-xl divide-y divide-white/5">
                        {newReleases.slice(0, 5).map((track, index) => (
                            <TrackCard key={track._id} track={track} tracks={newReleases} index={index} />
                        ))}
                    </div>
                ) : (
                    <p className="text-surface-400">No new releases</p>
                )}
            </section>

            {/* For You */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">💫</span>
                    <h2 className="text-xl font-semibold">For You</h2>
                </div>
                {forYou.length > 0 ? (
                    <div className="glass rounded-xl divide-y divide-white/5">
                        {forYou.map((track, index) => (
                            <TrackCard key={track._id} track={track} tracks={forYou} index={index} />
                        ))}
                    </div>
                ) : (
                    <p className="text-surface-400">Listen to some music to get personalized recommendations!</p>
                )}
            </section>
        </div>
    );
}
