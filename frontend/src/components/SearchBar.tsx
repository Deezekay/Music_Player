import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tracksApi } from '../services/api';
import { Track } from '../store/slices/playerSlice';

export default function SearchBar() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(async () => {
            try {
                const data = await tracksApi.search({ query, limit: 5 });
                setResults(data.tracks);
                setShowDropdown(true);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [query]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setShowDropdown(false);
        }
    };

    const handleResultClick = (trackId: string) => {
        navigate(`/track/${trackId}`);
        setShowDropdown(false);
        setQuery('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for songs, artists..."
                    className="w-full md:w-96 px-4 py-2 pl-10 rounded-full bg-surface-800 border border-white/10 focus:border-primary-500 outline-none text-sm transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                    🔍
                </span>
                {isLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </span>
                )}
            </form>

            {/* Quick results dropdown */}
            {showDropdown && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full glass rounded-xl overflow-hidden shadow-xl z-30 max-h-96 overflow-y-auto">
                    {results.map((track) => (
                        <button
                            key={track._id}
                            onClick={() => handleResultClick(track._id)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded bg-surface-700 flex-shrink-0 overflow-hidden">
                                {track.coverArt ? (
                                    <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm">{track.title}</p>
                                <p className="text-xs text-surface-400 truncate">
                                    {track.artistId?.name || track.artistName || 'Unknown Artist'}
                                </p>
                            </div>
                        </button>
                    ))}
                    <button
                        onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                        className="w-full p-3 text-sm text-primary-400 hover:bg-white/10 transition-colors text-center border-t border-white/10"
                    >
                        See all results for "{query}"
                    </button>
                </div>
            )}
        </div>
    );
}
