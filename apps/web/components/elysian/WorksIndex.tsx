'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Icon from '@/components/ui/Icon';
import { altTitleClass, type WorkSummary } from '@/lib/works';

// Home "chapter 1": an editorial index of works. Titles carry the page; the key art sits in a
// sticky plate on the right and follows whichever entry is hovered or focused.
export default function WorksIndex({ works }: { works: WorkSummary[] }) {
  const t = useTranslations('Works');
  const ts = useTranslations('Status');
  const [current, setCurrent] = useState(0);
  const active = works[current];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <ol className="lg:col-span-7">
        {works.map((w, i) => (
          <li key={w.slug} className="border-b border-ink/20 first:border-t-0">
            <Link
              href={w.href}
              data-testid="game-card"
              onMouseEnter={() => setCurrent(i)}
              onFocus={() => setCurrent(i)}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-start gap-x-4 py-6 md:grid-cols-[3.5rem_1fr_auto] md:py-8"
            >
              <span className={`pt-2 font-mono text-xs transition-colors ${current === i ? 'text-accent' : 'text-ink-mute'}`}>
                {t('no')} {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                {/* thumbnail inline on small screens, where the sticky plate is hidden */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.banner} alt="" loading="lazy" className="mb-4 aspect-[16/9] w-full object-cover lg:hidden" />
                <span className="block font-serif text-[1.75rem] font-semibold leading-tight tracking-[-0.01em] transition-transform duration-300 [text-wrap:balance] group-hover:translate-x-1 md:text-[2.5rem]">
                  {w.title}
                </span>
                {w.altTitle && <span className={`mt-1 block text-lg text-ink-mute md:text-xl ${altTitleClass(w.altTitle)}`}>{w.altTitle}</span>}
                <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-ink-soft">
                  {w.series && <span>{w.series}</span>}
                  {w.series && <span aria-hidden="true" className="h-3 w-px bg-ink/25" />}
                  <span data-testid="game-status-badge" className="label text-[0.625rem] text-accent">{ts(w.status as 'released')}</span>
                </span>
              </span>
              <span aria-hidden="true" className="mt-3 flex h-9 w-9 items-center justify-center border border-ink/30 transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                <Icon name="arrowRight" size={16} />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {active && (
        <div aria-hidden="true" className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-24">
            <div className="crop-marks bg-night">
              {works.map((w, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={w.slug}
                  src={w.banner}
                  alt=""
                  loading="lazy"
                  className={`aspect-[4/5] w-full object-cover transition-opacity duration-500 ${i === current ? 'relative opacity-100' : 'absolute inset-0 opacity-0'}`}
                />
              ))}
            </div>
            <div className="mt-5 flex items-baseline justify-between gap-6 border-t border-ink pt-4">
              <p className="font-serif text-lg font-semibold">{active.title}</p>
              <p className="font-mono text-[0.6875rem] text-ink-mute">{String(current + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}</p>
            </div>
            <p className="mt-2 whitespace-pre-line text-[0.875rem] leading-relaxed text-ink-soft">{active.logline}</p>
          </div>
        </div>
      )}
    </div>
  );
}
