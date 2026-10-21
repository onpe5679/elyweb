'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

const LOCALES = [
  { id: 'ko', label: 'KO' },
  { id: 'en', label: 'EN' },
  { id: 'ja', label: 'JA' },
] as const;

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('Common');

  return (
    <div role="group" aria-label={t('language')} className={`inline-flex items-center font-mono text-[12px] tracking-wider ${className}`}>
      {LOCALES.map((l, i) => (
        <span key={l.id} className="inline-flex items-center">
          {i > 0 && <span aria-hidden className="px-1 text-ink-3">/</span>}
          <Link
            href={pathname}
            locale={l.id}
            lang={l.id}
            aria-current={locale === l.id ? 'true' : undefined}
            className={`px-1 py-2 transition-colors ${locale === l.id ? 'text-ink underline decoration-accent-text decoration-2 underline-offset-[6px]' : 'text-ink-3 hover:text-ink'}`}
          >
            {l.label}
          </Link>
        </span>
      ))}
    </div>
  );
}
