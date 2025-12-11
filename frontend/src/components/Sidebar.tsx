import { NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/search', label: 'Search', icon: '🔍' },
    { path: '/library', label: 'Library', icon: '📚' },
    { path: '/discover', label: 'Discover', icon: '✨' },
    { path: '/stats', label: 'Stats', icon: '📊' },
];

const adminNavItems = [
    { path: '/admin', label: 'Admin', icon: '⚙️' },
];

interface SidebarProps {
    onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const isAdmin = user?.roles?.includes('admin');

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        onClose?.();
    };

    const handleNavClick = () => {
        onClose?.();
    };

    // Combine nav items based on user role
    const allNavItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;

    return (
        <aside className="w-64 h-full glass-dark flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                    🎵 MusicPlayer
                </h1>
                {/* Mobile close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Quick Search Button */}
            <div className="p-4 border-b border-white/10">
                <button
                    onClick={() => {
                        navigate('/search');
                        onClose?.();
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-white/10 hover:border-primary-500 transition-colors flex items-center gap-2 text-surface-400 hover:text-white text-sm"
                >
                    <span>🔍</span>
                    <span>Search music...</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {allNavItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                onClick={handleNavClick}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-primary-500/20 text-primary-400'
                                        : 'text-surface-300 hover:bg-white/5 hover:text-white'
                                    }`
                                }
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-white/10">
                {isAuthenticated && user ? (
                    <div className="space-y-3">
                        <NavLink
                            to="/profile"
                            onClick={handleNavClick}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold">
                                {user.profile.displayName?.[0] || user.username[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                    {user.profile.displayName || user.username}
                                </p>
                                <p className="text-xs text-surface-400 truncate">{user.email}</p>
                            </div>
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-sm text-surface-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <NavLink
                            to="/login"
                            onClick={handleNavClick}
                            className="block w-full px-4 py-2 text-center font-medium rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors"
                        >
                            Sign In
                        </NavLink>
                        <NavLink
                            to="/register"
                            onClick={handleNavClick}
                            className="block w-full px-4 py-2 text-center font-medium rounded-lg border border-white/20 hover:bg-white/5 transition-colors"
                        >
                            Sign Up
                        </NavLink>
                    </div>
                )}
            </div>

            {/* Keyboard shortcut hint */}
            <div className="hidden lg:block px-4 pb-4">
                <p className="text-xs text-surface-500 text-center">
                    Press <kbd className="px-1.5 py-0.5 bg-surface-700 rounded text-[10px]">?</kbd> for shortcuts
                </p>
            </div>
        </aside>
    );
}
