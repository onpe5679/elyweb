'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import StatusMarker from '@/components/ui/StatusMarker';
import type { GameCardModel } from '@/lib/game-model';

/**
 * 작품 목록: 이미지와 글을 번갈아 배치한다. 순서는 어드민의 display_order(최신작 먼저) 그대로 두고,
 * 하봄 작품도 같은 목록 안에 출시 순서대로 넣되 하봄 팔레트(시안 C)로만 구분한다.
 * 번호(No.01) 대신 출시 연도(출시 전이면 Coming Soon)를 적는다.
 */
export default function WorksList({ items }: { items: GameCardModel[] }) {
  const t = useTranslations('Works');
  const series = useMemo(() => Array.from(new Set(items.map((i) => i.series).filter(Boolean))), [items]);
  const [selected, setSelected] = useState('');
  const shown = selected ? items.filter((i) => i.series === selected) : items;

  return (
    <>
      {series.length > 0 && (
        <div role="group" aria-label={t('filterLabel')} data-testid="series-filter" className="flex flex-wrap items-center gap-2">
          <span className="t-eyebrow mr-2">{t('filterLabel')}</span>
          {[{ id: '', label: t('filterAll') }, ...series.map((s) => ({ id: s, label: s }))].map((s) => (
            <button
              key={s.id || 'all'}
              type="button"
              aria-pressed={selected === s.id}
              onClick={() => setSelected(s.id)}
              className={`min-h-[40px] border px-4 text-[14px] font-medium transition-colors ${
                selected === s.id ? 'border-ink bg-ink text-paper' : 'border-ink/30 text-ink-2 hover:border-ink hover:text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
          <span className="ml-auto font-mono text-[12px] text-ink-3" aria-live="polite">{t('count', { count: shown.length })}</span>
        </div>
      )}

      <ol className="mt-10">
        {shown.map((g, i) => {
          const flip = i % 2 === 1;
          const habom = g.brand === 'habom';
          return (
            <li key={g.slug} className="border-t border-ink/20">
              <article data-testid="game-card" className="grid items-center gap-8 py-14 md:grid-cols-12 md:gap-12 md:py-20">
                <Link
                  href={`/games/${g.slug}`}
                  aria-label={g.title}
                  className={`group md:col-span-7 ${flip ? 'md:order-2' : ''}`}
                >
                  {habom ? (
                    <div className="overflow-hidden rounded-[28px] bg-blush shadow-[0_30px_60px_-34px_rgba(74,43,56,.5)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.wide} alt="" loading={i < 2 ? 'eager' : 'lazy'} className="zoom-img aspect-[16/10] w-full object-cover object-[50%_28%]" />
                    </div>
                  ) : (
                    <div className="plate">
                      <div className="aspect-[16/10] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={g.wide} alt="" loading={i < 2 ? 'eager' : 'lazy'} className="plate__img zoom-img object-[50%_28%]" />
                      </div>
                    </div>
                  )}
                </Link>
                <div className={`md:col-span-5 ${flip ? 'md:order-1' : ''}`}>
                  <p className="font-mono text-[13px] tracking-[.14em] text-ink-3" data-testid="work-year">{g.year ?? t('comingSoon')}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {habom ? (
                      <span className="rounded-full bg-rose px-3 py-1 font-round-latin text-[12px] font-bold uppercase tracking-[0.12em] text-white">habom studio</span>
                    ) : (
                      <span className="marker">{g.series}</span>
                    )}
                    <StatusMarker status={g.status} />
                  </div>
                  <h2 className={`mt-5 text-[clamp(30px,4vw,54px)] ${habom ? 'font-round leading-[1.15] text-plum' : 't-display'}`}>
                    <Link href={`/games/${g.slug}`} className="link-u">{g.title}</Link>
                  </h2>
                  <p className="t-prose mt-5 line-clamp-4 whitespace-pre-line break-keep !text-[16px] !leading-8">{g.desc}</p>
                  {g.genres.length > 0 && (
                    <p className="mt-5 font-mono text-[12px] uppercase tracking-[.12em] text-ink-3">{g.genres.join(' · ')}</p>
                  )}
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    {habom ? (
                      <>
                        <Link href={`/games/${g.slug}`} className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-rose px-6 text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5">
                          {t('open')}
                        </Link>
                        <Link href="/habom" className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-plum ring-1 ring-plum/15 hover:ring-rose">
                          {t('habom.title')} <span aria-hidden>→</span>
                        </Link>
                      </>
                    ) : (
                      <Link href={`/games/${g.slug}`} className="btn">{t('open')}</Link>
                    )}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </>
  );
}
