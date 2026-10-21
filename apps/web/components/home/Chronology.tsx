import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function Chronology({ items }: { items: { date: string; title: string }[] }) {
  const t = await getTranslations('Home');
  if (!items.length) return null;
  return (
    <section aria-labelledby="chrono-title" className="border-t border-ink/15">
      <div className="mx-auto max-w-page px-5 py-20 md:px-10 md:py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <h2 id="chrono-title" className="t-display text-[clamp(26px,3.4vw,42px)]">{t('chronology.title')}</h2>
          <Link href="/about#history" className="link-u text-[15px] font-bold">{t('chronology.all')} →</Link>
        </div>
        <ol className="grid border-t border-ink md:grid-cols-3">
          {items.map((e, i) => (
            <li key={i} className="border-b border-ink/15 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
              <p className="font-display text-[44px] font-extrabold leading-none text-accent-text">{e.date}</p>
              <p className="mt-4 break-keep font-serif text-[17px] leading-8 text-ink-2">{e.title}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
