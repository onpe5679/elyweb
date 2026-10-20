'use client';

import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import ElysianMark from './ElysianMark';
import { altTitleClass } from '@/lib/works';

export type TitleStrip = { slug: string; href: string; title: string; altTitle: string; image: string; series: string };

type Props = {
  tagline: string;
  description: string;
  year: string;
  strips: TitleStrip[];
  startTarget: string;
};

const TITLE_ROWS: Record<string, [string, string]> = {
  ko: ['스튜디오', '엘리시안'],
  en: ['STUDIO', 'ELYSIAN'],
  ja: ['スタジオ', 'エリシアン'],
};

type MenuItem = { key: 'start' | 'works' | 'studio' | 'news' | 'habom' | 'contact'; latin: string; href?: string };
const MENU: MenuItem[] = [
  { key: 'start', latin: 'Start' },
  { key: 'works', latin: 'Works', href: '/games' },
  { key: 'studio', latin: 'Studio', href: '/about' },
  { key: 'news', latin: 'News', href: '/news' },
  { key: 'habom', latin: 'Habom', href: '/habom' },
  { key: 'contact', latin: 'Contact', href: '/contact' },
];

// The home page opens like a game's title screen: the studio name set in manuscript cells,
// a column of key-art strips (one per work) and a START / menu list driven by mouse,
// touch or the arrow keys. It is the top of the page, not a gate: scrolling skips it.
export default function TitleScreen({ tagline, description, year, strips, startTarget }: Props) {
  const t = useTranslations('Title');
  const locale = useLocale();
  const [active, setActive] = useState(0);
  const [stripActive, setStripActive] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);
  const rows = TITLE_ROWS[locale] || TITLE_ROWS.en;
  // Cell size follows the longest row so 「스튜디오 / 엘리시안」 and "STUDIO / ELYSIAN" both fill the column.
  const longest = Math.max(...rows.map((r) => Array.from(r).length));
  const cellClass =
    longest <= 4
      ? '[--cell-size:3.9rem] sm:[--cell-size:5rem] xl:[--cell-size:6rem]'
      : longest <= 5
        ? '[--cell-size:3.6rem] sm:[--cell-size:4.5rem] xl:[--cell-size:5.25rem]'
        : '[--cell-size:2.75rem] sm:[--cell-size:3.75rem] xl:[--cell-size:4.5rem]';

  const focusItem = useCallback((i: number) => {
    const next = (i + MENU.length) % MENU.length;
    setActive(next);
    itemRefs.current[next]?.focus();
  }, []);

  const onMenuKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      focusItem(active + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      focusItem(active - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusItem(MENU.length - 1);
    }
  };

  const start = () => {
    const el = document.getElementById(startTarget);
    if (!el) return;
    el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => el.focus({ preventScroll: true }), 450);
  };

  let cellIndex = 0;

  return (
    <section aria-labelledby="title-heading" className="paper-grain manuscript-grid relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* top bar */}
      <div className="relative z-10 mx-auto flex w-full max-w-page items-center justify-between px-5 pt-5 md:px-10 md:pt-7">
        <div className="flex items-center gap-3">
          <ElysianMark className="h-8 w-8" />
          <span className="label text-ink-soft">{t('est', { year })}</span>
        </div>
        <LanguageSwitch />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-page flex-1 grid-cols-1 gap-10 px-5 pb-10 pt-8 md:px-10 lg:grid-cols-12 lg:gap-12 lg:pb-12 lg:pt-6">
        {/* Title + menu */}
        <div className="flex flex-col lg:col-span-5 lg:justify-center">
          <h1 id="title-heading" aria-label={rows.join(' ')} className={cellClass}>
            {rows.map((row, r) => (
              <span key={row} aria-hidden="true" className={`flex ${r === 1 ? 'mt-[-1px]' : ''}`}>
                {Array.from(row).map((ch, i) => {
                  const delay = 80 + cellIndex++ * 70;
                  return (
                    <span
                      key={`${ch}-${i}`}
                      className={`ms-cell animate-cell-in font-semibold ${r === 1 ? 'ms-cell--filled' : 'bg-paper/70'} ${r === 1 && i === 0 ? 'ms-cell--accent' : ''}`}
                      style={{ animationDelay: `${delay}ms` }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <p className="mt-7 animate-rise-in font-latin text-[1.625rem] italic leading-tight text-ink [animation-delay:700ms] sm:text-[1.875rem]">{tagline}</p>
          <p className="mt-3 max-w-md animate-rise-in whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-soft [animation-delay:800ms]">{description}</p>

          <nav aria-label={t('menuLabel')} className="mt-9 animate-rise-in [animation-delay:900ms]">
            <ul className="border-t border-ink/80" onKeyDown={onMenuKeyDown}>
              {MENU.map((item, i) => {
                const isActive = active === i;
                const inner = (
                  <>
                    <span aria-hidden="true" className={`w-3 text-accent ${isActive ? 'opacity-100 motion-safe:animate-blink' : 'opacity-0'}`}>▶</span>
                    <span aria-hidden="true" className="w-6 font-mono text-[0.6875rem] text-ink-mute">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`font-serif text-[1.1875rem] transition-transform duration-300 sm:text-[1.3125rem] ${isActive ? 'translate-x-1' : ''}`}>
                      {t(item.key)}
                    </span>
                    {item.key === 'habom' && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-petal ring-2 ring-butter/70" />}
                    <span aria-hidden="true" className="ml-auto font-latin text-base italic text-ink-mute">{item.latin}</span>
                  </>
                );
                const cls = `group flex w-full items-center gap-3 border-b border-ink/15 py-2.5 text-left outline-offset-[-2px] ${isActive ? 'bg-ink/[0.04]' : ''}`;
                return (
                  <li key={item.key}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        ref={(el) => { itemRefs.current[i] = el; }}
                        className={cls}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        ref={(el) => { itemRefs.current[i] = el; }}
                        className={cls}
                        onClick={start}
                        onMouseEnter={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        aria-describedby="title-keys"
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <p id="title-keys" className="mt-3 hidden font-mono text-[0.6875rem] tracking-wide text-ink-mute [@media(hover:hover)]:block">{t('keys')}</p>
          </nav>
        </div>

        {/* Key-art strips: one per Elysian work, so the title belongs to the studio, not to one game */}
        <div className="lg:col-span-7 lg:flex lg:flex-col lg:justify-center">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="label text-ink-mute">{t('strips')}</p>
            <p aria-hidden="true" className="font-mono text-[0.6875rem] text-ink-mute">{String(strips.length).padStart(2, '0')}</p>
          </div>
          <ul aria-label={t('stripsLabel')} className="flex h-[26rem] flex-col gap-2 sm:h-[30rem] lg:h-[min(36rem,68svh)]" onMouseLeave={() => setStripActive(null)}>
            {strips.map((s, i) => {
              const grow = stripActive === null ? 1 : stripActive === i ? 2.6 : 0.7;
              return (
                <li key={s.slug} className="min-h-0 transition-[flex-grow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]" style={{ flexGrow: grow, flexBasis: 0 }}>
                  <Link
                    href={s.href}
                    onMouseEnter={() => setStripActive(i)}
                    onFocus={() => setStripActive(i)}
                    onBlur={() => setStripActive(null)}
                    className="group relative flex h-full animate-rise-in overflow-hidden bg-night outline-offset-2"
                    style={{ animationDelay: `${450 + i * 110}ms` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100 group-focus-visible:opacity-100"
                      style={{ objectPosition: '50% 30%' }}
                      loading={i < 2 ? 'eager' : 'lazy'}
                    />
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/45 to-night/0" />
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night/80 to-transparent" />
                    <span className="relative z-10 flex w-full items-end justify-between gap-4 p-4 text-on-night md:p-5">
                      <span className="flex items-baseline gap-3">
                        <span aria-hidden="true" className="font-mono text-[0.6875rem] text-accent-night">{String(i + 1).padStart(2, '0')}</span>
                        <span className="font-serif text-lg font-semibold leading-tight md:text-xl">{s.title}</span>
                        {s.altTitle && <span className={`hidden text-base text-on-night/75 sm:inline ${altTitleClass(s.altTitle)}`}>{s.altTitle}</span>}
                      </span>
                      <span aria-hidden="true" className="hidden font-mono text-[0.625rem] uppercase tracking-[0.16em] text-on-night/70 md:inline">{s.series}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div aria-hidden="true" className="relative z-10 mx-auto hidden w-full max-w-page items-center justify-between px-10 pb-6 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ink-mute lg:flex">
        <span>For Story-Lovers, By Storytellers</span>
        <span className="flex items-center gap-2">{t('scroll')} <span className="inline-block h-6 w-px bg-ink/40" /></span>
      </div>
    </section>
  );
}
