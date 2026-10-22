'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/routing';
import {ChangeEvent, useTransition} from 'react';

type LanguageSwitcherProps = {
  onNight?: boolean;
};

export default function LanguageSwitcher({onNight = false}: LanguageSwitcherProps) {
  const locale = useLocale();
  const t = useTranslations('Navigation');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as 'ko' | 'en' | 'ja';
    startTransition(() => {
      router.replace(pathname, {locale: nextLocale});
    });
  }

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="language-select">{t('language')}</label>
      <select
        id="language-select"
        data-testid="language-switcher"
        value={locale}
        onChange={onSelectChange}
        disabled={isPending}
        className={[
          'appearance-none bg-transparent py-1 pl-2 pr-6 text-xs font-bold tracking-[0.15em] cursor-pointer',
          'border-b focus:outline-none transition-colors',
          onNight ? 'text-moon border-moon/50 hover:border-moon' : 'text-ink-2 border-ink/30 hover:border-ink',
        ].join(' ')}
      >
        <option value="ko" className="bg-paper text-ink">KR</option>
        <option value="en" className="bg-paper text-ink">EN</option>
        <option value="ja" className="bg-paper text-ink">JP</option>
      </select>
      <i
        aria-hidden="true"
        className={['pointer-events-none absolute inset-y-0 right-0 flex items-center text-[0.6rem]', onNight ? 'text-moon' : 'text-ink-2'].join(' ')}
      >
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className="mt-0.5">
          <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </i>
    </div>
  );
}
