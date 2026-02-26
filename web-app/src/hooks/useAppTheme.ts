import { useEffect, useState, useCallback } from 'react';
import { useMantineColorScheme } from '@mantine/core';

export function useAppTheme() {
    const { setColorScheme } = useMantineColorScheme();
    const [theme, setThemeState] = useState<'light' | 'dark'>(
        (localStorage.getItem('app-theme') as 'light' | 'dark') || 'light'
    );

    // Only sync to DOM and localStorage when theme changes
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('app-theme', theme);
        setColorScheme(theme);
    }, [theme]); // Only depend on theme

    const setTheme = useCallback((newTheme: 'light' | 'dark') => {
        setThemeState(newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    return {
        theme,
        setTheme,
        toggleTheme,
    };
}
