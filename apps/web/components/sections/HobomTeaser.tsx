'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';

// Moves visitors from the Elysian home into the brighter Studio Habom space.
export default function HobomTeaser() {
  const t = useTranslations('Hobom');

  return (
    <section className="bg-paper px-4 pb-28 sm:px-6 md:pb-36 lg:px-8">
      <Link
        href="/hobom"
        className="group relative mx-auto flex max-w-7xl overflow-hidden rounded-[2rem] bg-hb-pink-soft px-8 py-16 text-hb-ink focus-visible:outline-offset-8 md:px-16 md:py-24"
      >
        <span
          aria-hidden="true"
          className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-hb-pink transition-transform duration-700 group-hover:scale-110 md:h-96 md:w-96"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-12 left-[46%] hidden h-16 w-16 rounded-full bg-hb-yellow md:block"
        />
        <span className="relative flex w-full flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <span>
            <span className="font-hobom block text-sm font-bold tracking-wide text-hb-pink-deep">{t('eyebrow')}</span>
            <span className="font-hobom mt-4 block text-4xl font-bold leading-tight md:text-6xl">{t('title')}</span>
            <span className="font-hobom mt-5 block max-w-md text-base leading-relaxed text-hb-ink/80">{t('lead')}</span>
          </span>
          <span className="font-hobom inline-flex w-fit items-center gap-3 rounded-full bg-hb-ink px-7 py-4 text-sm font-bold text-hb-cream transition-colors group-hover:bg-hb-pink-deep">
            {t('visit')}
            <span aria-hidden="true">→</span>
          </span>
        </span>
      </Link>
    </section>
  );
}
