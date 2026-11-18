'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFocusTrap } from '@/components/ui/useFocusTrap';

type Variant = 'elysian' | 'habom';

/**
 * 작품 이미지 가로 캐러셀.
 * - 제목·캡션 없이 이미지만 한 줄로 놓고, 넘치면 좌우 버튼으로 넘긴다(마우스 사용자용).
 * - 캐러셀 위에서 세로 휠을 굴리면 가로로 넘어가고, 양 끝에 닿으면 다시 페이지가 스크롤된다.
 * - 이미지를 누르면 라이트박스(←/→ 이동, Esc 닫기, 포커스 트랩)로 크게 본다.
 */
export default function ImageCarousel({ images, title, variant = 'elysian' }: { images: string[]; title: string; variant?: Variant }) {
  const t = useTranslations('Game');
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ prev: false, next: false });
  const [open, setOpen] = useState<number | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(null), []);
  useFocusTrap(dialog, open !== null, close);
  const habom = variant === 'habom';

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ prev: el.scrollLeft > 2, next: el.scrollLeft < max - 2 });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.querySelectorAll('img').forEach((img) => img.addEventListener('load', measure));
    el.addEventListener('scroll', measure, { passive: true });

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // 트랙패드의 가로 제스처는 그대로 둔다
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 2) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      if ((dy < 0 && el.scrollLeft <= 0) || (dy > 0 && el.scrollLeft >= max - 1)) return; // 끝에서는 페이지 스크롤
      e.preventDefault();
      el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + dy));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', measure);
      el.removeEventListener('wheel', onWheel);
    };
  }, [measure, images.length]);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  const go = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length]
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

  const arrow = habom
    ? 'grid h-12 w-12 place-items-center rounded-full bg-white text-plum shadow-[0_10px_24px_-12px_rgba(74,43,56,.6)] ring-1 ring-plum/10 transition hover:bg-rose hover:text-white'
    : 'grid h-12 w-12 place-items-center border border-ink bg-paper-3 text-ink shadow-[0_6px_18px_-10px_rgba(17,19,26,.55)] transition hover:bg-ink hover:text-paper';

  const cur = open !== null ? images[open] : null;

  return (
    <div className="relative">
      <ul
        ref={track}
        className="no-scrollbar flex snap-x snap-proximity gap-4 overflow-x-auto overscroll-x-contain md:gap-5"
        aria-label={t('lightbox.listLabel', { title })}
      >
        {images.map((src, i) => (
          <li key={src + i} className="shrink-0 snap-start">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block"
              aria-haspopup="dialog"
              aria-label={`${t('lightbox.open')}: ${title} ${i + 1}`}
            >
              <span
                className={`block h-[clamp(190px,30vw,420px)] overflow-hidden ${
                  habom ? 'rounded-[22px] bg-blush' : 'bg-paper-3 p-1.5 shadow-[0_0_0_1px_rgb(var(--c-ink)/.16)]'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="zoom-img h-full w-auto max-w-none object-cover"
                />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {edges.prev && (
        <button type="button" onClick={() => page(-1)} aria-label={t('lightbox.prev')} className={`absolute left-2 top-1/2 z-10 -translate-y-1/2 md:-left-5 ${arrow}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m15 5-7 7 7 7" /></svg>
        </button>
      )}
      {edges.next && (
        <button type="button" onClick={() => page(1)} aria-label={t('lightbox.next')} className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 md:-right-5 ${arrow}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m9 5 7 7-7 7" /></svg>
        </button>
      )}

      {cur && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — ${t('lightbox.counter', { current: (open ?? 0) + 1, total: images.length })}`}
          className="on-dark fixed inset-0 z-[120] flex flex-col bg-[#07080d]/95 text-white"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="flex items-center justify-between px-5 py-4 font-mono text-[12px] tracking-wider [@media(max-height:500px)]:py-1">
            <span>{(open ?? 0) + 1} / {images.length}</span>
            <button type="button" onClick={close} data-autofocus className="grid h-11 w-11 place-items-center rounded-full border border-white/40 hover:bg-white hover:text-black" aria-label={t('lightbox.close')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 5l14 14M19 5 5 19" /></svg>
            </button>
          </div>
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8 [@media(max-height:500px)]:pb-2"
            onClick={(e) => e.target === e.currentTarget && close()}
            // 모바일: 좌우로 밀어 이전/다음 이미지
            onTouchStart={(e) => {
              const p = e.touches[0];
              swipe.current = { x: p.clientX, y: p.clientY };
            }}
            onTouchEnd={(e) => {
              const start = swipe.current;
              swipe.current = null;
              if (!start || images.length < 2) return;
              const p = e.changedTouches[0];
              const dx = p.clientX - start.x;
              const dy = p.clientY - start.y;
              if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
            }}
          >
            {images.length > 1 && (
              <button type="button" onClick={() => go(-1)} aria-label={t('lightbox.prev')} className="absolute left-3 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/40 bg-black/40 hover:bg-white hover:text-black">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m15 5-7 7 7 7" /></svg>
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur} alt={`${title} ${(open ?? 0) + 1}`} className="max-h-full max-w-full object-contain" />
            {images.length > 1 && (
              <button type="button" onClick={() => go(1)} aria-label={t('lightbox.next')} className="absolute right-3 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/40 bg-black/40 hover:bg-white hover:text-black">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m9 5 7 7-7 7" /></svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
