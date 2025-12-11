import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'dark' | 'light';

interface ThemeState {
    theme: Theme;
}

const getInitialTheme = (): Theme => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) return saved;

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    return 'dark';
};

const initialState: ThemeState = {
    theme: getInitialTheme(),
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<Theme>) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
            // Apply to document
            if (action.payload === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        toggleTheme: (state) => {
            const newTheme = state.theme === 'dark' ? 'light' : 'dark';
            state.theme = newTheme;
            localStorage.setItem('theme', newTheme);
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
    },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
