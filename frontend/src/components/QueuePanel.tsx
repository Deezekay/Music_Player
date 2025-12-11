import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeFromQueue, setQueue, playNext, setCurrentTrack } from '../store/slices/playerSlice';

interface QueuePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function QueuePanel({ isOpen, onClose }: QueuePanelProps) {
    const dispatch = useAppDispatch();
    const { queue, queueIndex, currentTrack } = useAppSelector((state) => state.player);

    if (!isOpen) return null;

    const upNext = queue.slice(queueIndex + 1);

    const handleRemove = (index: number) => {
        // Remove track at global queue index
        const globalIndex = queueIndex + 1 + index;
        dispatch(removeFromQueue(globalIndex));
    };

    const handleClearQueue = () => {
        // Keep only current track
        if (currentTrack) {
            dispatch(setQueue({ tracks: [currentTrack], startIndex: 0 }));
        }
    };

    const handlePlayNow = (index: number) => {
        const globalIndex = queueIndex + 1 + index;
        const track = queue[globalIndex];
        if (track) {
            dispatch(setCurrentTrack(track));
            // Update queue index by playing next until we reach the track
            for (let i = 0; i < index; i++) {
                dispatch(playNext());
            }
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 w-96 glass-dark z-50 flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Queue</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    {upNext.length > 0 && (
                        <button
                            onClick={handleClearQueue}
                            className="text-sm text-surface-400 hover:text-white transition-colors"
                        >
                            Clear queue
                        </button>
                    )}
                </div>

                {/* Now Playing */}
                {currentTrack && (
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <p className="text-xs text-surface-400 mb-2">NOW PLAYING</p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-surface-700 flex-shrink-0 overflow-hidden">
                                {currentTrack.coverArt ? (
                                    <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xl">🎵</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-primary-400">{currentTrack.title}</p>
                                <p className="text-sm text-surface-400 truncate">
                                    {currentTrack.artistId?.name || currentTrack.artistName || 'Unknown Artist'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Up Next */}
                <div className="flex-1 overflow-y-auto p-4">
                    {upNext.length > 0 ? (
                        <>
                            <p className="text-xs text-surface-400 mb-3">UP NEXT ({upNext.length})</p>
                            <div className="space-y-2">
                                {upNext.map((track, index) => (
                                    <div
                                        key={`${track._id}-${index}`}
                                        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded bg-surface-700 flex-shrink-0 overflow-hidden">
                                            {track.coverArt ? (
                                                <img src={track.coverArt} alt={track.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-sm">🎵</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{track.title}</p>
                                            <p className="text-xs text-surface-400 truncate">
                                                {track.artistId?.name || track.artistName || 'Unknown'}
                                            </p>
                                        </div>
                                        <span className="text-xs text-surface-500">
                                            {formatDuration(track.duration)}
                                        </span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button
                                                onClick={() => handlePlayNow(index)}
                                                title="Play now"
                                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-sm"
                                            >
                                                ▶️
                                            </button>
                                            <button
                                                onClick={() => handleRemove(index)}
                                                title="Remove from queue"
                                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-sm"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-surface-400">
                            <p className="text-4xl mb-4">📭</p>
                            <p>Queue is empty</p>
                            <p className="text-sm mt-2">Play some tracks to see them here</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
