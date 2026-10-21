'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFocusTrap } from '@/components/ui/useFocusTrap';

export type GalleryItem = { src: string; caption?: string };

/** 도판/컷신 갤러리. 클릭하면 라이트박스(←/→ 이동, Esc 닫기, 포커스 트랩)로 열린다. */
export default function Gallery({ items, title }: { items: GalleryItem[]; title: string }) {
  const t = useTranslations('Game');
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(null), []);
  useFocusTrap(dialog, open !== null, close);

  const go = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, go]);

  const cur = open !== null ? items[open] : null;

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.src + i} className={i === 0 && items.length > 2 ? 'sm:col-span-2 lg:col-span-2' : ''}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full text-left"
              aria-haspopup="dialog"
              aria-label={`${t('lightbox.open')}: ${it.caption || title} ${i + 1}`}
            >
              <span className="plate block">
                <span className="block aspect-[16/10] overflow-hidden" style={{ borderRadius: 'calc(var(--radius-card) - 8px)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.src} alt="" loading="lazy" className="plate__img zoom-img" />
                </span>
              </span>
              {it.caption && <span className="mt-3 block font-mono text-[12px] uppercase tracking-[.12em] text-ink-3">{it.caption}</span>}
            </button>
          </li>
        ))}
      </ul>

      {cur && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — ${t('lightbox.counter', { current: (open ?? 0) + 1, total: items.length })}`}
          className="on-dark fixed inset-0 z-[120] flex flex-col bg-[#07080d]/95 text-white"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="flex items-center justify-between px-5 py-4 font-mono text-[12px] tracking-wider">
            <span>{(open ?? 0) + 1} / {items.length}</span>
            <button type="button" onClick={close} data-autofocus className="grid h-11 w-11 place-items-center rounded-full border border-white/40 hover:bg-white hover:text-black" aria-label={t('lightbox.close')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 5l14 14M19 5 5 19" /></svg>
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4" onClick={(e) => e.target === e.currentTarget && close()}>
            {items.length > 1 && (
              <button type="button" onClick={() => go(-1)} aria-label={t('lightbox.prev')} className="absolute left-3 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/40 bg-black/40 hover:bg-white hover:text-black">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m15 5-7 7 7 7" /></svg>
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.src} alt={cur.caption || title} className="max-h-full max-w-full object-contain" />
            {items.length > 1 && (
              <button type="button" onClick={() => go(1)} aria-label={t('lightbox.next')} className="absolute right-3 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/40 bg-black/40 hover:bg-white hover:text-black">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m9 5 7 7-7 7" /></svg>
              </button>
            )}
          </div>
          <p className="px-5 py-4 text-center text-[14px] text-white/80">{cur.caption}</p>
        </div>
      )}
    </>
  );
}
