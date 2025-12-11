import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    togglePlay,
    playNext,
    playPrevious,
    setVolume,
    toggleMute,
    setProgress,
    toggleShuffle,
    toggleRepeat,
} from '../store/slices/playerSlice';

interface ShortcutHandler {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    action: () => void;
    description: string;
}

export const KEYBOARD_SHORTCUTS: Omit<ShortcutHandler, 'action'>[] = [
    { key: ' ', description: 'Play / Pause' },
    { key: 'ArrowRight', description: 'Seek forward 10s' },
    { key: 'ArrowLeft', description: 'Seek backward 10s' },
    { key: 'ArrowUp', description: 'Volume up' },
    { key: 'ArrowDown', description: 'Volume down' },
    { key: 'm', description: 'Mute / Unmute' },
    { key: 'n', description: 'Next track' },
    { key: 'p', description: 'Previous track' },
    { key: 's', description: 'Toggle shuffle' },
    { key: 'r', description: 'Toggle repeat mode' },
    { key: '?', shift: true, description: 'Show keyboard shortcuts' },
];

interface UseKeyboardShortcutsOptions {
    onShowHelp?: () => void;
}

export default function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
    const dispatch = useAppDispatch();
    const { currentTrack, progress, volume, duration } = useAppSelector((state) => state.player);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            // Handle shortcuts
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    if (currentTrack) {
                        dispatch(togglePlay());
                    }
                    break;

                case 'ArrowRight':
                    e.preventDefault();
                    if (currentTrack && duration > 0) {
                        const newProgress = Math.min(progress + 10, duration);
                        dispatch(setProgress(newProgress));
                        // Also seek the audio element
                        const audio = document.querySelector('audio');
                        if (audio) audio.currentTime = newProgress;
                    }
                    break;

                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentTrack) {
                        const newProgress = Math.max(progress - 10, 0);
                        dispatch(setProgress(newProgress));
                        const audio = document.querySelector('audio');
                        if (audio) audio.currentTime = newProgress;
                    }
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    dispatch(setVolume(Math.min(volume + 0.1, 1)));
                    break;

                case 'ArrowDown':
                    e.preventDefault();
                    dispatch(setVolume(Math.max(volume - 0.1, 0)));
                    break;

                case 'm':
                case 'M':
                    e.preventDefault();
                    dispatch(toggleMute());
                    break;

                case 'n':
                case 'N':
                    e.preventDefault();
                    dispatch(playNext());
                    break;

                case 'p':
                case 'P':
                    e.preventDefault();
                    dispatch(playPrevious());
                    break;

                case 's':
                case 'S':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        dispatch(toggleShuffle());
                    }
                    break;

                case 'r':
                case 'R':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        dispatch(toggleRepeat());
                    }
                    break;

                case '?':
                    e.preventDefault();
                    options.onShowHelp?.();
                    break;
            }
        },
        [currentTrack, progress, volume, duration, dispatch, options]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
