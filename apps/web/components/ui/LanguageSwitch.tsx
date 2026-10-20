'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

const LOCALES = [
  { id: 'ko', short: 'KR', name: '한국어' },
  { id: 'en', short: 'EN', name: 'English' },
  { id: 'ja', short: 'JP', name: '日本語' },
] as const;

// Plain links (not buttons) so each language version is a real, crawlable URL.
export default function LanguageSwitch({ className = '', tone = 'ink' }: { className?: string; tone?: 'ink' | 'night' }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('Site');

  return (
    <nav aria-label={t('language')} data-testid="language-switcher" className={`flex items-center font-mono text-[0.6875rem] tracking-[0.12em] ${className}`}>
      {LOCALES.map((l, i) => {
        const active = l.id === locale;
        return (
          <span key={l.id} className="flex items-center">
            {i > 0 && <span aria-hidden="true" className="mx-1.5 opacity-30">/</span>}
            <Link
              href={pathname}
              locale={l.id}
              hrefLang={l.id}
              lang={l.id}
              data-locale={l.id}
              aria-label={l.name}
              aria-current={active ? 'true' : undefined}
              className={`flex min-h-[32px] min-w-[28px] items-center justify-center px-0.5 transition-opacity ${
                active
                  ? tone === 'night' ? 'text-on-night underline underline-offset-4' : 'text-ink underline underline-offset-4'
                  : 'opacity-55 hover:opacity-100'
              }`}
            >
              {l.short}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
