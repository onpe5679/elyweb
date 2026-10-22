'use client';

import {useTranslations} from 'next-intl';

export type StatsBarProps = {
  yearValue?: string;
  yearLabel?: string;
  projectsValue?: string;
  projectsLabel?: string;
  releasedValue?: string;
  releasedLabel?: string;
  globalValue?: string;
  globalLabel?: string;
};

export default function StatsBar(props: StatsBarProps) {
  const t = useTranslations('Stats');

  const items = [
    {value: props.yearValue || '2022', label: props.yearLabel || t('year')},
    {value: props.projectsValue || '3+', label: props.projectsLabel || t('projects')},
    {value: props.releasedValue || '2', label: props.releasedLabel || t('released')},
    {value: props.globalValue || 'Global', label: props.globalLabel || t('global')},
  ];

  return (
    <section className="border-y border-rule bg-paper-alt" aria-label={t('year')}>
      <dl className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={i}
            className={[
              'px-6 py-12 md:py-16',
              i % 2 === 1 ? 'border-l border-rule' : '',
              i >= 2 ? 'border-t border-rule md:border-t-0' : '',
              i >= 1 ? 'md:border-l md:border-rule' : '',
              i === 0 ? 'md:border-l-0' : '',
            ].join(' ')}
          >
            <dd className="font-display text-5xl tabular-nums leading-none text-ink md:text-6xl">{item.value}</dd>
            <dt className="eyebrow mt-4 !text-ink-3">{item.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
