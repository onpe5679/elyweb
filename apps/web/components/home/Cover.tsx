'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Cells from '@/components/ui/Cells';
import StatusMarker from '@/components/ui/StatusMarker';

export type CoverWork = {
  slug: string;
  title: string;
  series: string;
  status: string;
  image: string;
};

export const LAST_KEY = 'se:last';

type Last = { href: string; title: string };

/**
 * 엘리시안 메인의 첫 화면 = 책 표지이자 게임 타이틀 화면.
 * 왼쪽: 원고지 칸 타이틀 + 게임 메뉴(목차). 오른쪽: 작품들이 한 장의 도판으로 겹쳐 있는 스트립.
 * 메뉴는 키보드(↑ ↓ Enter)로도 고를 수 있고, "이어 읽기"는 마지막으로 연 작품으로 돌아간다.
 */
export default function Cover({ works }: { works: CoverWork[] }) {
  const t = useTranslations('Home');
  const [active, setActive] = useState(() => 0);
  const [last, setLast] = useState<Last | null>(null);
  const [hint, setHint] = useState(false);
  const interacted = useRef(false);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_KEY);
      if (raw) setLast(JSON.parse(raw));
    } catch {}
  }, []);

  // 사용자가 건드리기 전까지 스트립을 천천히 순환
  useEffect(() => {
    if (works.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (!interacted.current) setActive((a) => (a + 1) % works.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [works.length]);

  // 포커스가 없을 때 ↓ 를 누르면 메뉴로 들어간다
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && document.activeElement === document.body) {
        e.preventDefault();
        menuRef.current?.querySelector<HTMLElement>('a,button')?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a,button') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  const pick = (i: number) => {
    interacted.current = true;
    setActive(i);
  };

  const rows: { key: string; href?: string; meta?: string; disabled?: boolean }[] = [
    { key: 'start', href: '/games', meta: t('menu.startMeta', { count: works.length }) },
    last
      ? { key: 'continue', href: last.href, meta: last.title }
      : { key: 'continue', disabled: true, meta: t('menu.continueEmpty') },
    { key: 'studio', href: '/about', meta: 'About' },
    { key: 'habom', href: '/habom', meta: 'Habom' },
    { key: 'news', href: '/news', meta: 'News' },
  ];

  return (
    <section aria-labelledby="cover-title" className="relative isolate overflow-hidden">
      <div aria-hidden className="ruled ruled-fade absolute inset-0 -z-10 opacity-60 [--step:36px]" />
      <div className="mx-auto grid max-w-page items-center gap-12 px-5 pb-14 pt-10 md:px-10 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:gap-14 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <p className="t-eyebrow reveal">{t('eyebrow')}</p>
          <h1 id="cover-title" className="mt-7">
            <span className="sr-only">{t('titleLine1')} {t('titleLine2')}</span>
            <span aria-hidden className="flex flex-col gap-0">
              <Cells text={t('titleLine1')} />
              <Cells text={t('titleLine2')} filled indent={1} delay={260} />
            </span>
          </h1>
          <p className="reveal mt-7 max-w-md break-keep font-serif text-[17px] leading-8 text-ink-2 [--d:900ms]">
            {t('tagline')}
          </p>

          <nav aria-label={t('menuLabel')} className="reveal mt-9 max-w-xl [--d:1100ms]">
            <ul ref={menuRef} onKeyDown={onMenuKey} className="title-menu border-t border-ink/15 pl-6">
              {rows.map((r, i) => {
                const inner = (
                  <>
                    <span className="font-mono text-[11px] text-current opacity-60">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="font-display text-[22px] font-extrabold leading-tight">{t(`menu.${r.key}`)}</span>
                      <span className="ml-3 font-mono text-[11px] uppercase tracking-[.14em] opacity-60">{t(`menu.${r.key}En`)}</span>
                    </span>
                    <span aria-hidden className="title-menu__dots" />
                    <span className="max-w-[11rem] truncate text-right font-mono text-[11px] opacity-70">{r.meta}</span>
                  </>
                );
                return (
                  <li key={r.key}>
                    {r.href ? (
                      <Link href={r.href} className="title-menu__item" data-testid={`menu-${r.key}`}>
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        aria-disabled="true"
                        className="title-menu__item w-full text-left"
                        data-testid={`menu-${r.key}`}
                        onClick={() => setHint(true)}
                        onBlur={() => setHint(false)}
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <p role="status" aria-live="polite" className="mt-3 min-h-[1.5rem] pl-6 font-serif text-[14px] text-ink-2">
              {hint ? t('menu.continueHint') : ''}
            </p>
            <p className="mt-2 hidden pl-6 font-mono text-[11px] tracking-wider text-ink-3 lg:block">{t('menu.keys')}</p>
          </nav>
        </div>

        <div className="min-w-0">
          <div
            className="reveal [--d:300ms]"
            onMouseLeave={() => undefined}
          >
            <ol
              aria-label={t('stripsLabel')}
              className="plate flex h-[58svh] min-h-[420px] flex-col gap-2 !p-2 lg:h-[min(72svh,680px)]"
            >
              {works.map((w, i) => {
                const on = i === active;
                return (
                  <li
                    key={w.slug}
                    className="relative min-h-0 overflow-hidden transition-[flex-grow] duration-700 ease-page"
                    style={{ flexGrow: on ? 7 : 1, flexBasis: 0 }}
                  >
                    <Link
                      href={`/games/${w.slug}`}
                      className="group absolute inset-0 block"
                      aria-label={`${w.title} — ${w.series}`}
                      onMouseEnter={() => pick(i)}
                      onFocus={() => pick(i)}
                      onClick={(e) => {
                        // 터치: 첫 탭은 펼치기, 펼쳐진 상태에서 탭하면 이동
                        if ((e.nativeEvent as PointerEvent).pointerType === 'touch' && !on) {
                          e.preventDefault();
                          pick(i);
                        }
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={w.image}
                        alt=""
                        loading={i < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                        className={`zoom-img h-full w-full object-cover object-[50%_28%] ${on ? '' : 'saturate-[.55] brightness-[.8]'}`}
                      />
                      <span
                        aria-hidden
                        className={`absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-0'}`}
                      />
                      <span className="absolute left-3 top-2 font-mono text-[11px] tracking-wider text-white/90 mix-blend-difference">
                        No.{String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 transition-all duration-500 ${on ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          <StatusMarker status={w.status} />
                          <span className="font-mono text-[11px] uppercase tracking-wider text-white/80">{w.series}</span>
                        </span>
                        <span className="font-display text-[clamp(22px,2.4vw,34px)] font-extrabold leading-tight text-white">
                          {w.title}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 flex justify-between font-mono text-[11px] uppercase tracking-[.14em] text-ink-3">
              <span>{t('plateCaption')}</span>
              <span>{String(active + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
