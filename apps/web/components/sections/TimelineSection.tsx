'use client';

import { useTranslations } from 'next-intl';

export default function TimelineSection() {
  const t = useTranslations('Timeline');

  const timelineItems = [
    { icon: 'fa-rocket', date: t('items.item1.date'), text: t('items.item1.text') },
    { icon: 'fa-trophy', date: t('items.item2.date'), text: t('items.item2.text') },
    { icon: 'fa-flag', date: t('items.item3.date'), text: t('items.item3.text') },
  ];

  return (
    <section className="py-20 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-center font-display font-bold text-3xl text-gray-900 dark:text-white mb-12">
          {t('title')}
        </h2>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
          {timelineItems.map((item, index) => (
            <div
              key={index}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <i className={`fa-solid ${item.icon} text-sm`}></i>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{item.date}</div>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">{item.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="#"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary underline"
          >
            {t('viewAll')}
          </a>
        </div>
      </div>
    </section>
  );
}
