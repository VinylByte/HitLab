// hooks/useTheme.ts
import { useEffect, useState } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const initial = saved || 'light';
        setTheme(initial);
        updateTheme(initial);
    }, []);

    const updateTheme = (newTheme: 'light' | 'dark') => {
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
    };

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        updateTheme(next);
    };

    return { theme, setTheme: (t: 'light' | 'dark') => {
        setTheme(t);
        updateTheme(t);
    }, toggleTheme };
}