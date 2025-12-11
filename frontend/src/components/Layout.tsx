import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Player from './Player/Player';
import { useAppSelector } from '../store/hooks';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

export default function Layout() {
    const { currentTrack } = useAppSelector((state) => state.player);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Initialize keyboard shortcuts
    useKeyboardShortcuts({
        onShowHelp: () => setShowShortcuts(true),
    });

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto pb-24">
                {/* Mobile header */}
                <div className="sticky top-0 z-30 lg:hidden glass border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Open menu"
                        >
                            <span className="text-xl">☰</span>
                        </button>
                        <h1 className="text-lg font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                            🎵 MusicPlayer
                        </h1>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-6">
                    <Outlet />
                </div>
            </main>

            {/* Player bar */}
            {currentTrack && <Player />}

            {/* Keyboard shortcuts modal */}
            <KeyboardShortcutsModal
                isOpen={showShortcuts}
                onClose={() => setShowShortcuts(false)}
            />
        </div>
    );
}
