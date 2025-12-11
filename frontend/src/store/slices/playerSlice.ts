import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Track {
    _id: string;
    title: string;
    artistId: {
        _id: string;
        name: string;
        avatarUrl?: string;
    };
    artistName?: string; // For demo tracks where artistId may not be populated
    albumId?: string;
    albumName?: string;
    duration: number;
    coverArt?: string;
    streamUrl?: string;
    waveformUrl?: string;
    plays: number;
    likes: number;
    isLiked?: boolean;
    genres?: string[];
    tags?: string[];
    releaseDate?: string;
    explicit?: boolean;
    bitrate?: number;
    sampleRate?: number;
    status?: string;
}

interface PlayerState {
    currentTrack: Track | null;
    queue: Track[];
    queueIndex: number;
    isPlaying: boolean;
    volume: number;
    isMuted: boolean;
    progress: number;
    duration: number;
    isLoading: boolean;
    repeat: 'off' | 'one' | 'all';
    shuffle: boolean;
    waveformData: number[];
}

const initialState: PlayerState = {
    currentTrack: null,
    queue: [],
    queueIndex: 0,
    isPlaying: false,
    volume: parseFloat(localStorage.getItem('playerVolume') || '0.7'),
    isMuted: false,
    progress: 0,
    duration: 0,
    isLoading: false,
    repeat: 'off',
    shuffle: false,
    waveformData: [],
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setCurrentTrack: (state, action: PayloadAction<Track>) => {
            state.currentTrack = action.payload;
            state.progress = 0;
            state.duration = action.payload.duration;
            state.isLoading = true;
        },

        setQueue: (state, action: PayloadAction<{ tracks: Track[]; startIndex?: number }>) => {
            state.queue = action.payload.tracks;
            state.queueIndex = action.payload.startIndex || 0;
            if (action.payload.tracks.length > 0) {
                state.currentTrack = action.payload.tracks[state.queueIndex];
                state.progress = 0;
                state.duration = state.currentTrack.duration;
                state.isLoading = true;
            }
        },

        addToQueue: (state, action: PayloadAction<Track>) => {
            state.queue.push(action.payload);
        },

        removeFromQueue: (state, action: PayloadAction<number>) => {
            state.queue.splice(action.payload, 1);
            if (action.payload < state.queueIndex) {
                state.queueIndex--;
            }
        },

        playNext: (state) => {
            if (state.queue.length === 0) return;

            let nextIndex: number;
            if (state.shuffle) {
                nextIndex = Math.floor(Math.random() * state.queue.length);
            } else if (state.queueIndex < state.queue.length - 1) {
                nextIndex = state.queueIndex + 1;
            } else if (state.repeat === 'all') {
                nextIndex = 0;
            } else {
                state.isPlaying = false;
                return;
            }

            state.queueIndex = nextIndex;
            state.currentTrack = state.queue[nextIndex];
            state.progress = 0;
            state.duration = state.currentTrack.duration;
            state.isLoading = true;
        },

        playPrevious: (state) => {
            if (state.queue.length === 0) return;

            // If more than 3 seconds in, restart current track
            if (state.progress > 3) {
                state.progress = 0;
                return;
            }

            const prevIndex = state.queueIndex > 0 ? state.queueIndex - 1 : state.queue.length - 1;
            state.queueIndex = prevIndex;
            state.currentTrack = state.queue[prevIndex];
            state.progress = 0;
            state.duration = state.currentTrack.duration;
            state.isLoading = true;
        },

        togglePlay: (state) => {
            state.isPlaying = !state.isPlaying;
        },

        setPlaying: (state, action: PayloadAction<boolean>) => {
            state.isPlaying = action.payload;
        },

        setVolume: (state, action: PayloadAction<number>) => {
            state.volume = action.payload;
            state.isMuted = action.payload === 0;
            localStorage.setItem('playerVolume', action.payload.toString());
        },

        toggleMute: (state) => {
            state.isMuted = !state.isMuted;
        },

        setProgress: (state, action: PayloadAction<number>) => {
            state.progress = action.payload;
        },

        setDuration: (state, action: PayloadAction<number>) => {
            state.duration = action.payload;
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        toggleRepeat: (state) => {
            const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
            const currentIndex = modes.indexOf(state.repeat);
            state.repeat = modes[(currentIndex + 1) % modes.length];
        },

        toggleShuffle: (state) => {
            state.shuffle = !state.shuffle;
        },

        setWaveformData: (state, action: PayloadAction<number[]>) => {
            state.waveformData = action.payload;
        },

        clearPlayer: (state) => {
            state.currentTrack = null;
            state.queue = [];
            state.queueIndex = 0;
            state.isPlaying = false;
            state.progress = 0;
            state.duration = 0;
            state.waveformData = [];
        },
    },
});

export const {
    setCurrentTrack,
    setQueue,
    addToQueue,
    removeFromQueue,
    playNext,
    playPrevious,
    togglePlay,
    setPlaying,
    setVolume,
    toggleMute,
    setProgress,
    setDuration,
    setLoading,
    toggleRepeat,
    toggleShuffle,
    setWaveformData,
    clearPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
