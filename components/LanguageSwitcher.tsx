import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          i18n.language === 'en'
            ? 'bg-[var(--accent)] text-white'
            : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('de')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          i18n.language === 'de'
            ? 'bg-[var(--accent)] text-white'
            : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
        }`}
      >
        DE
      </button>
    </div>
  );
}

