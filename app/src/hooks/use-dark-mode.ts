import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'aria-r:theme';

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const toggle = useCallback(() => setDark((v) => !v), []);

  return { dark, toggle };
}
