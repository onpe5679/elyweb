'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import {TimelineEvent, getLocalizedField} from '@/lib/supabase';

interface TimelineSectionProps {
  events: TimelineEvent[];
  locale: string;
}

export default function TimelineSection({events, locale}: TimelineSectionProps) {
  const t = useTranslations('Timeline');

  return (
    <section className="bg-paper py-28 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 md:grid-cols-12 lg:px-8">
        <div className="md:col-span-4">
          <p className="eyebrow">Timeline</p>
          <h2 className="font-display mt-6 text-4xl leading-tight text-ink md:text-5xl">{t('title')}</h2>
          <Link
            href="/about"
            className="mt-10 inline-flex items-center gap-3 border-b border-ink pb-1 text-sm font-bold text-ink transition-colors hover:border-seal hover:text-seal"
          >
            {t('viewAll')}
          </Link>
        </div>

        <ol className="md:col-span-7 md:col-start-6 border-t border-ink">
          {events.map((event) => (
            <li
              key={event.id}
              className="grid grid-cols-[6.5rem_1fr] gap-6 border-b border-rule py-7 md:grid-cols-[8rem_1fr] md:py-9"
            >
              <time className="font-display text-2xl tabular-nums text-seal md:text-3xl">{event.date}</time>
              <p className="text-base leading-relaxed text-ink md:text-lg">
                {getLocalizedField(event, 'title', locale)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
