import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError } from '../store/slices/authSlice';

export default function Login() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginAttempted, setLoginAttempted] = useState(false);

    // Redirect to home after successful login
    useEffect(() => {
        if (loginAttempted && !isLoading && isAuthenticated) {
            console.log('Redirecting to home page...');
            navigate('/');
        }
    }, [isLoading, isAuthenticated, loginAttempted, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login button clicked!', { email, password: '***' });
        setLoginAttempted(true);
        dispatch(login({ email, password }));
        console.log('Login action dispatched');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
                        🎵 MusicPlayer
                    </h1>
                    <p className="text-surface-400">Sign in to continue</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-white/10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-surface-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-surface-800 border border-white/10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-lg bg-primary-500 hover:bg-primary-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-surface-900 text-surface-400">or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full py-3 rounded-lg border border-white/20 hover:bg-white/5 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <span>🔵</span> Continue with Google
                    </button>
                </form>

                {/* Sign up link */}
                <p className="text-center mt-6 text-surface-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
