'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import StatusMarker from '@/components/ui/StatusMarker';

export type CoverWork = {
  slug: string;
  title: string;
  series: string;
  status: string;
  image: string;
  /** 출시 연도. 없으면 Coming Soon */
  year?: string;
};

/**
 * 엘리시안 메인의 첫 화면.
 * 왼쪽: 명조 타이틀 + 메뉴(스튜디오 소개 · 작품 · 새 소식 · 문의). 오른쪽: 작품들이 겹쳐 있는 이미지 띠.
 * 메뉴는 키보드(↑ ↓)로도 이동할 수 있다.
 */
export default function Cover({ works }: { works: CoverWork[] }) {
  const t = useTranslations('Home');
  const locale = useLocale();
  const [active, setActive] = useState(0);
  const tapOpen = useRef<boolean | null>(null);
  const interacted = useRef(false);
  const menuRef = useRef<HTMLUListElement>(null);

  // 사용자가 건드리기 전까지 띠를 천천히 순환
  useEffect(() => {
    if (works.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      if (!interacted.current) setActive((a) => (a + 1) % works.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [works.length]);

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a') ?? []);
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

  const rows: { key: string; href: string; meta?: string }[] = [
    { key: 'studio', href: '/about' },
    { key: 'works', href: '/games', meta: t('menu.worksMeta', { count: works.length }) },
    { key: 'news', href: '/news' },
    { key: 'contact', href: '/contact' },
  ];

  const [line1, ...rest] = t('title').split(' ');
  const titleFont =
    locale === 'en'
      ? 'font-latin font-medium tracking-[-0.01em] text-[clamp(52px,8.2vw,124px)]'
      : locale === 'ja'
        ? 'font-myeongjo font-medium tracking-[-0.02em] text-[clamp(42px,6.2vw,94px)]'
        : 'font-myeongjo font-medium tracking-[-0.04em] text-[clamp(52px,8.2vw,124px)]';

  return (
    <section aria-labelledby="cover-title" className="relative isolate overflow-hidden">
      <div aria-hidden className="ruled ruled-fade absolute inset-0 -z-10 opacity-45 [--step:36px]" />
      <div className="mx-auto grid max-w-page items-center gap-12 px-5 pb-14 pt-10 md:px-10 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:gap-14 lg:pb-12 lg:pt-8">
        <div className="min-w-0">
          <p className="t-eyebrow reveal">{t('eyebrow')}</p>
          <h1
            id="cover-title"
            className={`reveal mt-6 leading-[1.04] text-ink [--d:150ms] ${titleFont}`}
          >
            <span className="block whitespace-nowrap">{line1}</span>
            {rest.length > 0 && <span className="block whitespace-nowrap pl-[0.9em]">{rest.join(' ')}</span>}
          </h1>
          <p className="reveal mt-8 max-w-md whitespace-pre-line break-keep font-serif text-[17px] leading-8 text-ink-2 [--d:450ms]">
            {t('tagline')}
          </p>

          <nav aria-label={t('menuLabel')} className="reveal mt-10 max-w-xl [--d:650ms]">
            <ul ref={menuRef} onKeyDown={onMenuKey} className="title-menu title-menu--plain border-t border-ink/15 pl-6">
              {rows.map((r) => {
                const meta = r.meta ?? (locale === 'en' ? '' : t(`menu.${r.key}En`));
                return (
                  <li key={r.key}>
                    <Link href={r.href} className="title-menu__item" data-testid={`menu-${r.key}`}>
                      <span className="font-myeongjo text-[22px] font-medium leading-tight">{t(`menu.${r.key}`)}</span>
                      <span aria-hidden className="title-menu__dots" />
                      <span className="text-right font-mono text-[11px] uppercase tracking-[.12em] opacity-70">{meta}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="min-w-0">
          <div className="reveal [--d:300ms]">
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
                      onPointerDown={(e) => {
                        // 터치/펜: 누르는 순간 이 띠가 이미 펼쳐져 있었는지 기억한다.
                        // (탭하면 focus·mouseenter 가 click 보다 먼저 와서 띠를 펼쳐 버리므로 click 에서 판단하면 늘 '펼쳐짐'이 된다)
                        tapOpen.current = e.pointerType === 'mouse' ? null : on;
                      }}
                      onClick={(e) => {
                        // 터치: 접힌 띠의 첫 탭은 펼치기만, 펼쳐진 띠를 탭하면 이동
                        const wasOpen = tapOpen.current;
                        tapOpen.current = null;
                        if (wasOpen === false) {
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
                      <span className="absolute left-2 top-2 bg-black/55 px-1.5 py-0.5 font-mono text-[11px] tracking-wider text-white">
                        {w.year ?? t('works.comingSoon')}
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
            <p aria-hidden className="mt-3 text-right font-mono text-[11px] tracking-[.14em] text-ink-3">
              {String(active + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
