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
    { value: props.yearValue || '2022', label: props.yearLabel || t('year') },
    { value: props.projectsValue || '3+', label: props.projectsLabel || t('projects') },
    { value: props.releasedValue || '1', label: props.releasedLabel || t('funding') },
    { value: props.globalValue || 'Global', label: props.globalLabel || t('global') },
  ];

  return (
    <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {items.map((item, i) => (
                    <div className="p-4" key={i}>
                        <div className="text-4xl font-display font-black mb-2">{item.value}</div>
                        <div className="text-sm font-medium opacity-80 uppercase tracking-wide">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
}
