'use client';

type WikiLanguage = 'en' | 'pl' | 'ru' | 'es';

const languages: Array<{ code: WikiLanguage; label: string; shortLabel: string }> = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'pl', label: 'Polski', shortLabel: 'PL' },
  { code: 'ru', label: 'Русский', shortLabel: 'RU' },
  { code: 'es', label: 'Español', shortLabel: 'ES' },
];

const STORAGE_KEY = 'valen-wiki-language';

function originalPageUrl() {
  const current = new URL(window.location.href);
  if (current.hostname.endsWith('translate.google.com')) {
    return current.searchParams.get('u') ?? 'https://valen-wiki-pi.vercel.app/';
  }
  return current.href;
}

export function LanguageSelector() {
  function selectLanguage(nextLanguage: WikiLanguage) {
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    const sourceUrl = originalPageUrl();
    if (nextLanguage === 'en') {
      if (sourceUrl !== window.location.href) window.location.assign(sourceUrl);
      return;
    }
    const translatedUrl = new URL('https://translate.google.com/translate');
    translatedUrl.searchParams.set('sl', 'en');
    translatedUrl.searchParams.set('tl', nextLanguage);
    translatedUrl.searchParams.set('u', sourceUrl);
    window.location.assign(translatedUrl.toString());
  }

  return (
    <label className="language-selector" title="Translate this page automatically">
      <span className="language-globe" aria-hidden="true">◎</span>
      <span className="sr-only">Language</span>
      <select
        aria-label="Translate page language"
        defaultValue="en"
        onChange={(event) => selectLanguage(event.target.value as WikiLanguage)}
      >
        {languages.map((option) => (
          <option value={option.code} key={option.code}>{option.shortLabel} · {option.label}</option>
        ))}
      </select>
    </label>
  );
}
