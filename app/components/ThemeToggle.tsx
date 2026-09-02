'use client';

import { useEffect, useState } from 'react';

type WikiTheme = 'light' | 'dark';

const STORAGE_KEY = 'valen-wiki-theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<WikiTheme>('dark');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function selectTheme() {
    const currentTheme: WikiTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const nextTheme: WikiTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      onClick={selectTheme}
    >
      <span className="theme-toggle-icon theme-toggle-sun" aria-hidden="true">☀</span>
      <span className="theme-toggle-icon theme-toggle-moon" aria-hidden="true">☾</span>
      <span className="sr-only">Switch to {theme === 'dark' ? 'light' : 'dark'} theme</span>
    </button>
  );
}
