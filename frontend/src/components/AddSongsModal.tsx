import { useState, useEffect } from 'react';
import { tracksApi, playlistsApi } from '../services/api';
import { Track } from '../store/slices/playerSlice';

interface AddSongsModalProps {
    playlistId: string;
    existingTrackIds: string[];
    onClose: () => void;
    onTrackAdded: (track: Track) => void;
}

export default function AddSongsModal({ playlistId, existingTrackIds, onClose, onTrackAdded }: AddSongsModalProps) {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [addingTrackId, setAddingTrackId] = useState<string | null>(null);

    // Load tracks when modal opens
    useEffect(() => {
        const fetchTracks = async () => {
            setIsLoading(true);
            try {
                const data = await tracksApi.search({ limit: 50 });
                setTracks(data.tracks);
            } catch (error) {
                console.error('Failed to fetch tracks:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTracks();
    }, []);

    const handleAddTrack = async (track: Track) => {
        setAddingTrackId(track._id);
        try {
            await playlistsApi.addTrack(playlistId, track._id);
            onTrackAdded(track);
        } catch (error) {
            console.error('Failed to add track:', error);
        } finally {
            setAddingTrackId(null);
        }
    };

    const filteredTracks = searchQuery
        ? tracks.filter(track =>
            track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : tracks;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Add Songs</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search songs..."
                        className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-white/10 focus:border-primary-500 outline-none"
                    />
                </div>

                {/* Tracks list */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="text-center py-12 text-surface-400">
                            <p>Loading tracks...</p>
                        </div>
                    ) : filteredTracks.length === 0 ? (
                        <div className="text-center py-12 text-surface-400">
                            <p>No tracks found</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredTracks.map((track) => {
                                const isAdded = existingTrackIds.includes(track._id);
                                const isAdding = addingTrackId === track._id;

                                return (
                                    <div
                                        key={track._id}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded bg-surface-700 flex-shrink-0 overflow-hidden">
                                            {track.coverArt ? (
                                                <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">🎵</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{track.title}</p>
                                            <p className="text-sm text-surface-400 truncate">
                                                {track.artistId?.name || track.artistName || 'Unknown Artist'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleAddTrack(track)}
                                            disabled={isAdded || isAdding}
                                            className={`px-4 py-2 rounded-full font-medium transition-colors ${isAdded
                                                ? 'bg-white/10 text-surface-400 cursor-not-allowed'
                                                : 'bg-primary-500 hover:bg-primary-600'
                                                }`}
                                        >
                                            {isAdding ? '...' : isAdded ? '✓ Added' : '+ Add'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
