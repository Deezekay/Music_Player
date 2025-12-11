import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { Navigate } from 'react-router-dom';

export default function Profile() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.profile.displayName || '');
    const [bio, setBio] = useState(user?.profile.bio || '');
    const [isSaving, setIsSaving] = useState(false);

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // In a real app, this would call the API to update profile
            // await usersApi.updateProfile({ displayName, bio });
            console.log('Saving profile:', { displayName, bio });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const stats = [
        { label: 'Playlists', value: '5', icon: '📚' },
        { label: 'Following', value: '12', icon: '👥' },
        { label: 'Followers', value: '8', icon: '❤️' },
        { label: 'Liked Songs', value: '47', icon: '🎵' },
    ];

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="glass rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-5xl font-bold shadow-xl">
                            {user.profile.displayName?.[0] || user.username[0].toUpperCase()}
                        </div>
                        <button className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-2xl">📷</span>
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        {isEditing ? (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Display Name"
                                    className="w-full px-4 py-2 bg-surface-700 rounded-lg border border-white/10 focus:border-primary-500 outline-none"
                                />
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    rows={3}
                                    className="w-full px-4 py-2 bg-surface-700 rounded-lg border border-white/10 focus:border-primary-500 outline-none resize-none"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-surface-700 hover:bg-surface-600 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold mb-1">
                                    {user.profile.displayName || user.username}
                                </h1>
                                <p className="text-surface-400 mb-2">@{user.username}</p>
                                <p className="text-surface-300 mb-4">
                                    {user.profile.bio || 'No bio yet. Click edit to add one!'}
                                </p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 border border-white/20 hover:bg-white/5 rounded-lg font-medium transition-colors"
                                >
                                    Edit Profile
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center p-4 rounded-xl bg-white/5">
                            <span className="text-2xl">{stat.icon}</span>
                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            <p className="text-sm text-surface-400">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Account Info */}
            <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Account</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-surface-400">Email</span>
                        <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-surface-400">Member Since</span>
                        <span>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-surface-400">Account Type</span>
                        <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-sm font-medium">
                            {user.roles?.includes('artist') ? 'Artist' : 'Free'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                        <div>
                            <p className="font-medium">Public Profile</p>
                            <p className="text-sm text-surface-400">Allow others to see your listening activity</p>
                        </div>
                        <button className="w-12 h-6 bg-primary-500 rounded-full relative">
                            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-surface-400">Get updates about new releases from artists you follow</p>
                        </div>
                        <button className="w-12 h-6 bg-surface-600 rounded-full relative">
                            <span className="absolute left-1 top-1 w-4 h-4 bg-surface-400 rounded-full transition-all" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
