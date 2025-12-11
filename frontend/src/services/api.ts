import axios from 'axios';

const API_BASE = '/api';

// Create axios instance with interceptors
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        return data;
    },

    register: async (email: string, username: string, password: string) => {
        const { data } = await api.post('/auth/register', { email, username, password });
        return data;
    },

    logout: async (refreshToken: string) => {
        await api.post('/auth/logout', { refreshToken });
    },

    getCurrentUser: async () => {
        const { data } = await api.get('/users/me');
        return data;
    },

    googleAuth: async (idToken: string) => {
        const { data } = await api.post('/auth/oauth/google', { idToken });
        return data;
    },
};

// Tracks API
export const tracksApi = {
    search: async (params: {
        query?: string;
        genre?: string;
        limit?: number;
        offset?: number;
    }) => {
        const { data } = await api.get('/tracks', { params });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get(`/tracks/${id}`);
        return data;
    },

    like: async (id: string) => {
        const { data } = await api.post(`/tracks/${id}/like`);
        return data;
    },

    unlike: async (id: string) => {
        const { data } = await api.delete(`/tracks/${id}/like`);
        return data;
    },

    recordPlay: async (id: string) => {
        await api.post(`/tracks/${id}/play`);
    },
};

// Stream API
export const streamApi = {
    getStreamUrl: async (trackId: string, quality: 'high' | 'medium' = 'high') => {
        const { data } = await api.get(`/stream/${trackId}`, { params: { quality } });
        return data;
    },

    getWaveform: async (trackId: string) => {
        const { data } = await api.get(`/stream/${trackId}/waveform`);
        return data;
    },
};

// Playlists API
export const playlistsApi = {
    getMyPlaylists: async () => {
        const { data } = await api.get('/playlists');
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get(`/playlists/${id}`);
        return data;
    },

    create: async (name: string, description?: string, isPublic?: boolean) => {
        const { data } = await api.post('/playlists', { name, description, isPublic });
        return data;
    },

    update: async (id: string, updates: { name?: string; description?: string; isPublic?: boolean }) => {
        const { data } = await api.patch(`/playlists/${id}`, updates);
        return data;
    },

    delete: async (id: string) => {
        await api.delete(`/playlists/${id}`);
    },

    addTrack: async (playlistId: string, trackId: string) => {
        const { data } = await api.post(`/playlists/${playlistId}/tracks`, { trackId });
        return data;
    },

    removeTrack: async (playlistId: string, trackId: string) => {
        const { data } = await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
        return data;
    },
};

export default api;
