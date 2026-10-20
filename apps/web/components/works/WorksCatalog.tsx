'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Icon from '@/components/ui/Icon';
import type { LabelId } from '@/lib/labels';
import { altTitleClass, titleScale, type WorkSummary } from '@/lib/works';

type Props = { works: WorkSummary[]; labelNames: Record<LabelId, string> };

// The works index reads like a magazine: one spread per title, image and title both lead
// to the detail page. Works from other studios appear as a distinct "insert" in their own style.
export default function WorksCatalog({ works, labelNames }: Props) {
  const t = useTranslations('Works');
  const ts = useTranslations('Status');
  const td = useTranslations('Detail');
  const [label, setLabel] = useState<LabelId | ''>('');
  const [series, setSeries] = useState('');

  const labels = useMemo(() => Array.from(new Set(works.map((w) => w.label))), [works]);
  const seriesList = useMemo(
    // A label's own name is not a series (e.g. 「하봄 스튜디오」 stored in series_*), the label filter covers it.
    () => Array.from(new Set(works.filter((w) => !label || w.label === label).map((w) => w.series).filter((s) => s && !Object.values(labelNames).includes(s)))),
    [works, label, labelNames],
  );
  const filtered = works.filter((w) => (!label || w.label === label) && (!series || w.series === series));

  const chip = (active: boolean) =>
    `min-h-[40px] border px-4 text-[0.8125rem] transition-colors ${active ? 'border-ink bg-ink text-paper' : 'border-ink/25 text-ink-soft hover:border-ink hover:text-ink'}`;

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-ink/15 pb-8 lg:flex-row lg:items-center lg:justify-between">
        {labels.length > 1 && (
          <div role="group" aria-label={t('filterLabel')} className="flex flex-wrap items-center gap-2">
            <span className="label mr-2 text-ink-mute">{t('filterLabel')}</span>
            <button type="button" aria-pressed={!label} onClick={() => { setLabel(''); setSeries(''); }} className={chip(!label)}>{t('all')}</button>
            {labels.map((l) => (
              <button key={l} type="button" aria-pressed={label === l} onClick={() => { setLabel(l); setSeries(''); }} className={`${chip(label === l)} flex items-center gap-2`}>
                {l === 'habom' && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-petal ring-2 ring-butter/70" />}
                {labelNames[l]}
              </button>
            ))}
          </div>
        )}
        {seriesList.length > 1 && (
          <div role="group" aria-label={t('filterSeries')} data-testid="series-filter" className="flex flex-wrap items-center gap-2">
            <span className="label mr-2 text-ink-mute">{t('filterSeries')}</span>
            <button type="button" aria-pressed={!series} onClick={() => setSeries('')} className={chip(!series)}>{t('allSeries')}</button>
            {seriesList.map((s) => (
              <button key={s} type="button" aria-pressed={series === s} onClick={() => setSeries(s)} className={chip(series === s)}>{s}</button>
            ))}
          </div>
        )}
      </div>

      <p aria-live="polite" className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-ink-mute">{t('count', { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-ink-soft">{t('empty')}</p>
      ) : (
        <ol>
          {filtered.map((w, i) => {
            const n = works.indexOf(w) + 1;
            return w.label === 'habom' ? (
              <li key={w.slug} className="py-10 md:py-14">
                <HabomInsert work={w} n={n} labelName={labelNames.habom} guest={t('guest')} read={t('read')} status={ts(w.status as 'released')} genreLabel={td('infoGenre')} />
              </li>
            ) : (
              <li key={w.slug} className="border-b border-ink/15 py-14 md:py-20">
                <article className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
                  <Link
                    href={w.href}
                    data-testid="game-card"
                    aria-label={w.title}
                    className={`group relative block lg:col-span-7 ${i % 2 ? 'lg:order-2' : ''}`}
                  >
                    <div className="relative overflow-hidden bg-night">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={w.banner} alt="" loading={i < 2 ? 'eager' : 'lazy'} className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    </div>
                    {w.cover !== w.banner && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={w.cover}
                        alt=""
                        loading="lazy"
                        className={`absolute -bottom-6 hidden w-[24%] border-[6px] border-paper object-cover shadow-[0_18px_40px_-18px_rgba(0,0,0,.6)] md:block ${i % 2 ? '-left-6' : '-right-6'}`}
                      />
                    )}
                  </Link>
                  <div className={`lg:col-span-5 ${i % 2 ? 'lg:order-1' : ''}`}>
                    <p className="flex items-center gap-3 font-mono text-xs text-ink-mute">
                      <span className="text-accent">{t('no')} {String(n).padStart(2, '0')}</span>
                      {w.series && <><span aria-hidden="true" className="h-px w-6 bg-ink/30" /><span className="uppercase tracking-[0.12em]">{w.series}</span></>}
                    </p>
                    <h2 className={`mt-4 font-serif font-semibold leading-[1.1] tracking-[-0.02em] [text-wrap:balance] ${titleScale(w.title, ['text-[2.25rem] md:text-[3.25rem]', 'text-[2rem] md:text-[2.75rem]', 'text-[1.75rem] md:text-[2.25rem]'])}`}>
                      <Link href={w.href} className="link-underline">{w.title}</Link>
                    </h2>
                    {w.altTitle && <p className={`mt-2 text-xl text-ink-mute md:text-2xl ${altTitleClass(w.altTitle)}`}>{w.altTitle}</p>}
                    <p className="mt-6 whitespace-pre-line font-serif text-[1.0625rem] leading-[1.85] text-ink-soft">{w.logline}</p>
                    <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-ink/15 pt-5 text-[0.875rem]">
                      <dt className="label pt-0.5 text-ink-mute">{td('infoStatus')}</dt>
                      <dd data-testid="game-status-badge" className="text-accent">{ts(w.status as 'released')}</dd>
                      {w.genres.length > 0 && <><dt className="label pt-0.5 text-ink-mute">{td('infoGenre')}</dt><dd>{w.genres.join(' · ')}</dd></>}
                      {w.platforms.length > 0 && <><dt className="label pt-0.5 text-ink-mute">{td('infoPlatform')}</dt><dd>{w.platforms.join(' · ')}</dd></>}
                    </dl>
                    <Link href={w.href} className="group mt-8 inline-flex min-h-[48px] items-center gap-3 border border-ink px-5 text-[0.9375rem] transition-colors hover:bg-ink hover:text-paper">
                      {t('read')} <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function HabomInsert({ work: w, n, labelName, guest, read, status, genreLabel }: { work: WorkSummary; n: number; labelName: string; guest: string; read: string; status: string; genreLabel: string }) {
  return (
    <article className="theme-habom relative overflow-hidden rounded-[32px] bg-cream p-5 text-plum md:p-10">
      <span aria-hidden="true" className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-blush" />
      <span aria-hidden="true" className="absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-butter-soft" />
      <div className="relative grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <Link href={w.href} data-testid="game-card" aria-label={w.title} className="group block overflow-hidden rounded-[24px] lg:col-span-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={w.banner} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        </Link>
        <div className="lg:col-span-5">
          <p className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-rose px-3 py-1 font-round-latin font-bold uppercase tracking-[0.12em] text-white">{labelName}</span>
            <span className="font-round-latin font-bold text-plum-soft">{guest} · No.{String(n).padStart(2, '0')}</span>
          </p>
          <h2 className="mt-5 font-round text-[2.25rem] leading-[1.15] md:text-[3rem]">
            <Link href={w.href} className="hover:text-rose">{w.title}</Link>
          </h2>
          {w.altTitle && <p className="mt-2 font-round-latin text-lg font-bold text-plum-soft">{w.altTitle}</p>}
          <p className="mt-5 whitespace-pre-line text-[1rem] leading-relaxed text-plum-soft">{w.logline}</p>
          <p className="mt-5 flex flex-wrap gap-2 text-[0.8125rem]">
            <span data-testid="game-status-badge" className="rounded-full bg-butter px-3 py-1 font-semibold text-plum">{status}</span>
            <span className="sr-only">{genreLabel}:</span>
            {w.genres.map((g) => <span key={g} className="rounded-full bg-white px-3 py-1 text-plum-soft ring-1 ring-blush">{g}</span>)}
          </p>
          <Link href={w.href} className="mt-7 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-rose px-6 text-[0.9375rem] font-semibold text-white transition-transform hover:-translate-y-0.5">
            {read} <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
