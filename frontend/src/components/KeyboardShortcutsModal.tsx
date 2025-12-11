import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
    if (!isOpen) return null;

    const formatKey = (key: string, shift?: boolean) => {
        let display = key;
        if (key === ' ') display = 'Space';
        if (key === 'ArrowRight') display = '→';
        if (key === 'ArrowLeft') display = '←';
        if (key === 'ArrowUp') display = '↑';
        if (key === 'ArrowDown') display = '↓';

        if (shift) {
            return `Shift + ${display}`;
        }
        return display;
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="glass-dark rounded-2xl p-6 w-full max-w-md mx-4 border border-white/10 shadow-2xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3">
                    {KEYBOARD_SHORTCUTS.map((shortcut, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                            <span className="text-surface-300">{shortcut.description}</span>
                            <kbd className="px-3 py-1.5 bg-surface-700 rounded-lg text-sm font-mono border border-white/10">
                                {formatKey(shortcut.key, shortcut.shift)}
                            </kbd>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                    <p className="text-sm text-surface-400">
                        Press <kbd className="px-2 py-0.5 bg-surface-700 rounded text-xs">?</kbd> anytime to show this help
                    </p>
                </div>
            </div>
        </div>
    );
}
