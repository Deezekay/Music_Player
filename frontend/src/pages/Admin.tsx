import { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { Navigate, Link } from 'react-router-dom';
import api from '../services/api';

interface DashboardStats {
    users: { total: number; newThisMonth: number };
    tracks: { total: number; pending: number };
    artists: { total: number };
    playlists: { total: number };
    plays: { total: number };
}

interface PendingTrack {
    _id: string;
    title: string;
    artistId: { name: string };
    createdByUserId: { username: string; email: string };
    createdAt: string;
}

export default function AdminDashboard() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [pendingTracks, setPendingTracks] = useState<PendingTrack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'users'>('overview');

    const isAdmin = user?.roles?.includes('admin');

    useEffect(() => {
        if (!isAdmin) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [dashboardRes, pendingRes] = await Promise.all([
                    api.get('/admin/dashboard'),
                    api.get('/admin/tracks/pending'),
                ]);
                setStats(dashboardRes.data);
                setPendingTracks(pendingRes.data.tracks);
            } catch (error) {
                console.error('Failed to fetch admin data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isAdmin]);

    const handleApproveTrack = async (trackId: string) => {
        try {
            await api.patch(`/admin/tracks/${trackId}/approve`);
            setPendingTracks(pendingTracks.filter(t => t._id !== trackId));
        } catch (error) {
            console.error('Failed to approve track:', error);
        }
    };

    const handleRejectTrack = async (trackId: string) => {
        try {
            await api.patch(`/admin/tracks/${trackId}/reject`, { reason: 'Does not meet quality standards' });
            setPendingTracks(pendingTracks.filter(t => t._id !== trackId));
        } catch (error) {
            console.error('Failed to reject track:', error);
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <span className="text-6xl mb-4">🔒</span>
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-surface-400 mb-6">You need admin privileges to access this page.</p>
                <Link to="/" className="text-primary-400 hover:underline">
                    Go back home
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-6">
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
            <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-surface-400">Platform management and moderation</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10">
                {(['overview', 'tracks', 'users'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-2 font-medium capitalize transition-colors ${activeTab === tab
                                ? 'text-white border-b-2 border-primary-500'
                                : 'text-surface-400 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard
                            icon="👥"
                            label="Total Users"
                            value={stats.users.total}
                            subValue={`+${stats.users.newThisMonth} this month`}
                        />
                        <StatCard
                            icon="🎵"
                            label="Total Tracks"
                            value={stats.tracks.total}
                            subValue={`${stats.tracks.pending} pending`}
                            highlight={stats.tracks.pending > 0}
                        />
                        <StatCard
                            icon="🎸"
                            label="Artists"
                            value={stats.artists.total}
                        />
                        <StatCard
                            icon="📚"
                            label="Playlists"
                            value={stats.playlists.total}
                        />
                        <StatCard
                            icon="▶️"
                            label="Total Plays"
                            value={stats.plays.total.toLocaleString()}
                        />
                    </div>

                    {/* Pending Tracks Alert */}
                    {stats.tracks.pending > 0 && (
                        <div className="glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/10">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div className="flex-1">
                                    <p className="font-medium">Pending Tracks</p>
                                    <p className="text-sm text-surface-400">
                                        {stats.tracks.pending} tracks awaiting approval
                                    </p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('tracks')}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium transition-colors"
                                >
                                    Review Now
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tracks Tab */}
            {activeTab === 'tracks' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Pending Tracks ({pendingTracks.length})</h2>

                    {pendingTracks.length > 0 ? (
                        <div className="glass rounded-xl divide-y divide-white/5">
                            {pendingTracks.map((track) => (
                                <div key={track._id} className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-surface-700 flex items-center justify-center text-xl">
                                        🎵
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{track.title}</p>
                                        <p className="text-sm text-surface-400">
                                            by {track.artistId?.name || 'Unknown'} •
                                            Uploaded by {track.createdByUserId?.username}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApproveTrack(track._id)}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectTrack(track._id)}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass rounded-xl p-8 text-center text-surface-400">
                            <span className="text-4xl">✅</span>
                            <p className="mt-2">No pending tracks to review</p>
                        </div>
                    )}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="glass rounded-xl p-8 text-center text-surface-400">
                    <span className="text-4xl">👥</span>
                    <p className="mt-2">User management coming soon</p>
                    <p className="text-sm mt-1">Search, filter, and manage user accounts</p>
                </div>
            )}
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    subValue,
    highlight
}: {
    icon: string;
    label: string;
    value: string | number;
    subValue?: string;
    highlight?: boolean;
}) {
    return (
        <div className={`glass rounded-xl p-4 ${highlight ? 'border border-amber-500/30' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <span className="text-sm text-surface-400">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {subValue && (
                <p className={`text-xs mt-1 ${highlight ? 'text-amber-400' : 'text-surface-500'}`}>
                    {subValue}
                </p>
            )}
        </div>
    );
}
