import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { playlistsApi, tracksApi } from '../services/api';
import TrackCard from '../components/TrackCard';
import { Track } from '../store/slices/playerSlice';

interface Playlist {
    _id: string;
    name: string;
    trackCount: number;
    coverArt?: string;
}

export default function Library() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState<'playlists' | 'liked'>('playlists');
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [likedTracks, setLikedTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [playlistsData, likedData] = await Promise.all([
                    playlistsApi.getMyPlaylists(),
                    tracksApi.search({ limit: 50 }), // Would be liked tracks endpoint
                ]);
                setPlaylists(playlistsData);
                setLikedTracks(likedData.tracks);
            } catch (error) {
                console.error('Failed to fetch library:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, navigate]);

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) return;

        setIsCreating(true);
        try {
            const playlist = await playlistsApi.create(newPlaylistName.trim());
            setPlaylists([playlist, ...playlists]);
            setNewPlaylistName('');
        } catch (error) {
            console.error('Failed to create playlist:', error);
        } finally {
            setIsCreating(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Your Library</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('playlists')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${activeTab === 'playlists'
                            ? 'bg-white text-black'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                >
                    Playlists
                </button>
                <button
                    onClick={() => setActiveTab('liked')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${activeTab === 'liked'
                            ? 'bg-white text-black'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                >
                    Liked Songs
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-lg bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : activeTab === 'playlists' ? (
                <div>
                    {/* Create playlist form */}
                    <form onSubmit={handleCreatePlaylist} className="mb-6 flex gap-2">
                        <input
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="New playlist name..."
                            className="flex-1 px-4 py-2 rounded-lg bg-surface-800 border border-white/10 focus:border-primary-500 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isCreating || !newPlaylistName.trim()}
                            className="px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 font-medium disabled:opacity-50 transition-colors"
                        >
                            {isCreating ? 'Creating...' : 'Create'}
                        </button>
                    </form>

                    {/* Playlists grid */}
                    {playlists.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {playlists.map((playlist) => (
                                <Link
                                    key={playlist._id}
                                    to={`/playlist/${playlist._id}`}
                                    className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    <div className="aspect-square rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 mb-3 flex items-center justify-center text-4xl">
                                        🎵
                                    </div>
                                    <h3 className="font-medium truncate group-hover:text-primary-400 transition-colors">
                                        {playlist.name}
                                    </h3>
                                    <p className="text-sm text-surface-400">
                                        {playlist.trackCount} tracks
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-surface-400">
                            <p className="text-4xl mb-4">📚</p>
                            <p>No playlists yet</p>
                            <p className="text-sm mt-2">Create one above to get started!</p>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {likedTracks.length > 0 ? (
                        <div className="glass rounded-xl divide-y divide-white/5">
                            {likedTracks.map((track, index) => (
                                <TrackCard key={track._id} track={track} tracks={likedTracks} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-surface-400">
                            <p className="text-4xl mb-4">❤️</p>
                            <p>No liked songs yet</p>
                            <p className="text-sm mt-2">Like songs to see them here</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
