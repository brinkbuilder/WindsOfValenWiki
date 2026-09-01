'use client';

type WikiTheme = 'light' | 'dark';

const STORAGE_KEY = 'valen-wiki-theme';

export function ThemeToggle() {
  function selectTheme() {
    const currentTheme: WikiTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const nextTheme: WikiTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
      onClick={selectTheme}
    >
      <span className="theme-toggle-icon theme-toggle-sun" aria-hidden="true">☀</span>
      <span className="theme-toggle-icon theme-toggle-moon" aria-hidden="true">☾</span>
      <span className="sr-only">Toggle light and dark theme</span>
    </button>
  );
}
