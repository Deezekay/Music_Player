import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
    togglePlay,
    setPlaying,
    setProgress,
    setDuration,
    setLoading,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
    setWaveformData,
} from '../../store/slices/playerSlice';
import { streamApi, tracksApi } from '../../services/api';
import Waveform from './Waveform';
import QueuePanel from '../QueuePanel';

export default function Player() {
    const dispatch = useAppDispatch();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showQueue, setShowQueue] = useState(false);

    const {
        currentTrack,
        isPlaying,
        volume,
        isMuted,
        progress,
        duration,
        isLoading,
        repeat,
        shuffle,
    } = useAppSelector((state) => state.player);

    // Load track audio
    useEffect(() => {
        if (!currentTrack || !audioRef.current) return;

        const loadAudio = async () => {
            try {
                dispatch(setLoading(true));

                // Get stream URL
                console.log('Fetching stream URL for track:', currentTrack._id);
                const { url } = await streamApi.getStreamUrl(currentTrack._id);
                console.log('Got stream URL:', url);

                const audio = audioRef.current!;

                // Set up event listeners before loading
                const playPromise = new Promise<void>((resolve, reject) => {
                    const onCanPlay = () => {
                        console.log('Audio can play now');
                        audio.removeEventListener('canplaythrough', onCanPlay);
                        audio.removeEventListener('error', onError);
                        resolve();
                    };
                    const onError = (e: Event) => {
                        console.error('Audio error event:', e);
                        audio.removeEventListener('canplaythrough', onCanPlay);
                        audio.removeEventListener('error', onError);
                        reject(new Error('Failed to load audio'));
                    };
                    audio.addEventListener('canplaythrough', onCanPlay);
                    audio.addEventListener('error', onError);
                });

                // Set source and load
                audio.src = url;
                audio.load();

                // Wait for audio to be ready
                await playPromise;

                // Load waveform (optional, don't block playback)
                streamApi.getWaveform(currentTrack._id)
                    .then(async (response) => {
                        const waveformResponse = await fetch(response.url);
                        const { waveform } = await waveformResponse.json();
                        dispatch(setWaveformData(waveform));
                    })
                    .catch(() => dispatch(setWaveformData([])));

                // Record play
                tracksApi.recordPlay(currentTrack._id);

                // Start playing
                console.log('Starting playback...');
                await audio.play();
                console.log('Playback started successfully');
                dispatch(setPlaying(true));
            } catch (error) {
                console.error('Failed to load audio:', error);
                dispatch(setPlaying(false));
            } finally {
                dispatch(setLoading(false));
            }
        };

        loadAudio();
    }, [currentTrack?._id, dispatch]);

    // Handle play/pause
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch(() => {
                dispatch(setPlaying(false));
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, dispatch]);

    // Handle volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Audio event handlers
    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current) {
            const currentTime = audioRef.current.currentTime;
            // Safeguard against NaN or Infinity values
            if (!isNaN(currentTime) && isFinite(currentTime)) {
                dispatch(setProgress(currentTime));
            }
        }
    }, [dispatch]);

    const handleLoadedMetadata = useCallback(() => {
        if (audioRef.current) {
            const actualDuration = audioRef.current.duration;
            // Safeguard against NaN or Infinity values
            if (!isNaN(actualDuration) && isFinite(actualDuration) && actualDuration > 0) {
                dispatch(setDuration(actualDuration));
                // Log if there's a mismatch between backend and actual duration
                if (currentTrack && Math.abs(currentTrack.duration - actualDuration) > 1) {
                    console.warn(
                        `Duration mismatch: Backend=${currentTrack.duration}s, Actual=${actualDuration}s`
                    );
                }
            } else if (currentTrack) {
                // Fallback to backend duration if metadata is invalid
                dispatch(setDuration(currentTrack.duration));
            }
        }
    }, [dispatch, currentTrack]);

    const handleEnded = useCallback(() => {
        if (repeat === 'one') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
        } else {
            dispatch(playNext());
        }
    }, [repeat, dispatch]);

    const handleSeek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            dispatch(setProgress(time));
        }
    }, [dispatch]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
                            />
                        ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl">
            🎵
        </div>
    )
}
                    </div >
    <div className="min-w-0">
        <p className="font-medium truncate">{currentTrack.title}</p>
        <p className="text-sm text-surface-400 truncate">
            {currentTrack.artistId?.name || currentTrack.artistName || 'Unknown Artist'}
        </p>
        {currentTrack.albumName && (
            <p className="text-xs text-surface-500 truncate">
                {currentTrack.albumName}
            </p>
        )}
    </span>
                    </div >
                </div >

    {/* Volume */ }
    < div className = "flex items-center gap-2 w-32" >
                    <button
                        onClick={() => dispatch(toggleMute())}
                        title={isMuted ? "Unmute" : "Mute"}
                        className="p-2 text-surface-400 hover:text-white transition-colors"
                    >
                        {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
                        className="flex-1"
                    />
                </div >

    {/* Queue button */ }
    < button
onClick = {() => setShowQueue(!showQueue)}
title = "Queue"
className = "p-2 text-surface-400 hover:text-white transition-colors"
    >
                    📋
                </button >
            </div >

    {/* Queue Panel */ }
    < QueuePanel isOpen = { showQueue } onClose = {() => setShowQueue(false)} />
        </div >
    );
}
