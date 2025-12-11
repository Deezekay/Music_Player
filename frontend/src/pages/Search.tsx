import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tracksApi } from '../services/api';
import TrackCard from '../components/TrackCard';
import { Track } from '../store/slices/playerSlice';

const GENRES = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Indie'];

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const performSearch = useCallback(async () => {
        if (!query && !selectedGenre) {
            setTracks([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        try {
            const response = await tracksApi.search({
                query: query || undefined,
                genre: selectedGenre || undefined,
                limit: 50,
            });
            setTracks(response.tracks);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [query, selectedGenre]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            performSearch();

            // Update URL params
            const params: Record<string, string> = {};
            if (query) params.q = query;
            if (selectedGenre) params.genre = selectedGenre;
            setSearchParams(params, { replace: true });
        }, 300);

        return () => clearTimeout(debounce);
    }, [query, selectedGenre, performSearch, setSearchParams]);

    return (
        <div className="animate-fade-in">
            {/* Search input */}
            <div className="mb-6">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for tracks, artists..."
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-800 border border-white/10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-lg"
                    />
                </div>
            </div>

            {/* Genre filters */}
            <div className="mb-6">
                <h3 className="text-sm font-medium text-surface-400 mb-3">Browse by genre</h3>
                <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => (
                        <button
                            key={genre}
                            onClick={() => setSelectedGenre(selectedGenre === genre.toLowerCase() ? '' : genre.toLowerCase())}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGenre === genre.toLowerCase()
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white/5 hover:bg-white/10 text-surface-300'
                                }`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            <section>
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
                ) : hasSearched ? (
                    tracks.length > 0 ? (
                        <>
                            <h2 className="text-lg font-medium mb-4">
                                {tracks.length} result{tracks.length !== 1 ? 's' : ''}
                            </h2>
                            <div className="glass rounded-xl divide-y divide-white/5">
                                {tracks.map((track, index) => (
                                    <TrackCard key={track._id} track={track} tracks={tracks} index={index} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-surface-400">
                            <p className="text-4xl mb-4">🔍</p>
                            <p>No results found</p>
                            <p className="text-sm mt-2">Try a different search term or genre</p>
                        </div>
                    )
                ) : (
                    <div className="text-center py-12 text-surface-400">
                        <p className="text-4xl mb-4">🎧</p>
                        <p>Search for your favorite music</p>
                        <p className="text-sm mt-2">Or browse by genre above</p>
                    </div>
                )}
            </section>
        </div>
    );
}
