'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

/** 종이(밝음) ↔ 밤(어두움). 선택은 localStorage 에 기억한다. */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const t = useTranslations('Common');
  const [night, setNight] = useState(false);

  useEffect(() => {
    setNight(document.documentElement.getAttribute('data-theme') === 'night');
  }, []);

  const toggle = () => {
    const next = !night;
    setNight(next);
    if (next) document.documentElement.setAttribute('data-theme', 'night');
    else document.documentElement.removeAttribute('data-theme');
    try {
      localStorage.setItem('se-theme', next ? 'night' : 'paper');
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={night}
      aria-label={t('theme')}
      title={t('theme')}
      className={`inline-flex h-9 items-center gap-2 rounded-ui border border-ink/30 px-3 text-[12px] font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {night ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
          </>
        )}
      </svg>
      <span>{night ? t('themeNight') : t('themePaper')}</span>
    </button>
  );
}
