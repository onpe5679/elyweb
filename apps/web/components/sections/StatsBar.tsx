'use client';

import {useTranslations} from 'next-intl';

export default function StatsBar() {
  const t = useTranslations('Stats');

  return (
    <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="p-4">
                    <div className="text-4xl font-display font-black mb-2">2022</div>
                    <div className="text-sm font-medium opacity-80 uppercase tracking-wide">{t('year')}</div>
                </div>
                <div className="p-4">
                    <div className="text-4xl font-display font-black mb-2">3+</div>
                    <div className="text-sm font-medium opacity-80 uppercase tracking-wide">{t('projects')}</div>
                </div>
                <div className="p-4">
                    <div className="text-4xl font-display font-black mb-2">296%</div>
                    <div className="text-sm font-medium opacity-80 uppercase tracking-wide">{t('funding')}</div>
                </div>
                <div className="p-4">
                    <div className="text-4xl font-display font-black mb-2">Global</div>
                    <div className="text-sm font-medium opacity-80 uppercase tracking-wide">{t('global')}</div>
                </div>
            </div>
        </div>
    </section>
  );
}
