'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

const LOCALES = [
  { id: 'ko', label: 'KO', native: '한국어' },
  { id: 'en', label: 'EN', native: 'English' },
  { id: 'ja', label: 'JA', native: '日本語' },
] as const;

type Props = {
  className?: string;
  /** menu = 모바일 메뉴 안의 큰 버튼(손가락으로 누르기 쉬운 44px 이상), tone 은 브랜드 색 */
  variant?: 'inline' | 'menu';
  tone?: 'elysian' | 'habom';
};

export default function LanguageSwitcher({ className = '', variant = 'inline', tone = 'elysian' }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('Common');

  if (variant === 'menu') {
    const on = tone === 'habom' ? 'bg-plum text-cream ring-plum' : 'border-ink bg-ink text-paper';
    const off = tone === 'habom' ? 'bg-white text-plum ring-plum/15' : 'border-ink/30 text-ink';
    const base = tone === 'habom' ? 'rounded-lg ring-1 font-round' : 'border font-display';
    return (
      <div role="group" aria-label={t('language')} className={`grid grid-cols-3 gap-2 ${className}`} data-testid="language-menu">
        {LOCALES.map((l) => (
          <Link
            key={l.id}
            href={pathname}
            locale={l.id}
            lang={l.id}
            aria-current={locale === l.id ? 'true' : undefined}
            className={`flex min-h-[48px] items-center justify-center px-2 text-[15px] font-bold ${base} ${locale === l.id ? on : off}`}
          >
            {l.native}
          </Link>
        ))}
      </div>
    );
  }

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
