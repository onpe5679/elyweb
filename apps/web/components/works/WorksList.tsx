'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import StatusMarker from '@/components/ui/StatusMarker';
import { pad2 } from '@/lib/format';
import type { GameCardModel } from '@/lib/game-model';

/**
 * 작품 목록: 잡지의 펼침면(spread)처럼 이미지와 글을 번갈아 배치한다.
 * 시리즈 필터는 URL 해시(#series-…)에 맞추지 않고 화면 상태로만 둔다.
 * 하봄 작품은 같은 목록 안에서도 하봄 토큰(핑크·둥근 모서리)으로 구분해 보인다.
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
            <li key={g.slug} {...(habom ? { 'data-brand': 'habom' } : {})} className="border-t border-ink/20">
              <article data-testid="game-card" className="grid items-center gap-8 py-14 md:grid-cols-12 md:gap-12 md:py-20">
                <Link
                  href={`/games/${g.slug}`}
                  aria-label={g.title}
                  className={`group md:col-span-7 ${flip ? 'md:order-2' : ''}`}
                >
                  <div className={`plate ${flip ? 'md:rotate-[.8deg]' : 'md:rotate-[-.8deg]'} transition-transform duration-700 ease-page group-hover:rotate-0`}>
                    <div className="aspect-[16/10] overflow-hidden" style={{ borderRadius: habom ? 'calc(var(--radius-card) - 8px)' : 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.wide} alt="" loading={i < 2 ? 'eager' : 'lazy'} className="plate__img zoom-img object-[50%_28%]" />
                    </div>
                  </div>
                </Link>
                <div className={`md:col-span-5 ${flip ? 'md:order-1' : ''}`}>
                  <p className="font-mono text-[13px] tracking-wider text-ink-3">
                    No.{pad2(items.indexOf(g) + 1)} <span aria-hidden>/</span> {pad2(items.length)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className={`marker ${habom ? 'marker--sub' : ''}`}>{g.series}</span>
                    <StatusMarker status={g.status} />
                  </div>
                  <h2 className="t-display mt-5 text-[clamp(30px,4vw,54px)]">
                    <Link href={`/games/${g.slug}`} className="link-u">{g.title}</Link>
                  </h2>
                  <p className="t-prose mt-5 line-clamp-4 whitespace-pre-line break-keep !text-[16px] !leading-8">{g.desc}</p>
                  {g.genres.length > 0 && (
                    <p className="mt-5 font-mono text-[12px] uppercase tracking-[.12em] text-ink-3">{g.genres.join(' · ')}</p>
                  )}
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link href={`/games/${g.slug}`} className={`btn ${habom ? 'btn--accent' : ''}`}>{t('open')}</Link>
                    {habom && <Link href="/habom" className="btn btn--ghost">{t('habomLink')}</Link>}
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
