import { useState, useEffect, useRef } from 'react';
import { playlistsApi } from '../services/api';
import { useAppSelector } from '../store/hooks';

interface Playlist {
    _id: string;
    name: string;
}

interface AddToPlaylistMenuProps {
    trackId: string;
    onClose: () => void;
}

export default function AddToPlaylistMenu({ trackId, onClose }: AddToPlaylistMenuProps) {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [adding, setAdding] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!isAuthenticated) {
                setIsLoading(false);
                return;
            }
            try {
                const data = await playlistsApi.getMyPlaylists();
                setPlaylists(data);
            } catch (error) {
                console.error('Failed to fetch playlists:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlaylists();
    }, [isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
        setAdding(playlistId);
        setMessage(null);
        try {
            await playlistsApi.addTrack(playlistId, trackId);
            setMessage({ type: 'success', text: `Added to "${playlistName}"` });
            setTimeout(onClose, 1000);
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to add'
            });
        } finally {
            setAdding(null);
        }
    };

    if (!isAuthenticated) {
        return (
            <div
                ref={menuRef}
                className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-surface-800 border border-white/10 shadow-xl z-50 p-3"
            >
                <p className="text-sm text-surface-400">Sign in to add to playlists</p>
            </div>
        );
    }

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-surface-800 border border-white/10 shadow-xl z-50 overflow-hidden"
        >
            <div className="p-2 border-b border-white/10">
                <p className="text-xs font-medium text-surface-400 px-2">Add to playlist</p>
            </div>

            {message && (
                <div className={`px-4 py-2 text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="max-h-64 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-surface-400">
                        <span className="animate-spin inline-block">⏳</span>
                    </div>
                ) : playlists.length > 0 ? (
                    playlists.map((playlist) => (
                        <button
                            key={playlist._id}
                            onClick={() => handleAddToPlaylist(playlist._id, playlist.name)}
                            disabled={adding === playlist._id}
                            className="w-full px-4 py-2 text-left hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="text-lg">📚</span>
                            <span className="truncate flex-1">{playlist.name}</span>
                            {adding === playlist._id && <span className="animate-spin">⏳</span>}
                        </button>
                    ))
                ) : (
                    <div className="p-4 text-center text-surface-400 text-sm">
                        <p>No playlists yet</p>
                        <p className="text-xs mt-1">Create one in Library</p>
                    </div>
                )}
            </div>
        </div>
    );
}
