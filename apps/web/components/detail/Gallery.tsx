'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/Icon';
import type { GalleryImage } from '@/lib/game-spec';

export default function Gallery({ images, title, variant }: { images: GalleryImage[]; title: string; variant: 'elysian' | 'habom' }) {
  const t = useTranslations('Detail');
  const [index, setIndex] = useState<number | null>(null);
  const habom = variant === 'habom';
  const total = images.length;

  const go = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + total) % total)), [total]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go]);

  const portraitFirst = images[0]?.kind === 'cover';
  return (
    <>
      <ul className={`grid gap-3 md:gap-4 ${total === 1 ? '' : total === 2 ? 'grid-cols-[2fr_1fr]' : 'grid-cols-2 md:grid-cols-3'}`}>
        {images.map((img, i) => (
          <li key={img.src} className={total === 2 && portraitFirst && i === 0 ? 'order-2' : ''}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t('galleryOpen', { n: i + 1 })}
              className={`group relative block h-full w-full overflow-hidden ${habom ? 'rounded-[20px]' : ''} bg-night`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt=""
                loading="lazy"
                className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${img.kind === 'cover' ? 'aspect-[3/4]' : 'aspect-video'} ${total === 2 ? 'md:h-[28rem]' : ''}`}
              />
            </button>
          </li>
        ))}
      </ul>

      <Modal open={index !== null} onClose={() => setIndex(null)} label={`${title} — ${t('galleryTitle')}`}>
        {index !== null && (
          <div className="relative flex h-full w-full flex-col p-3 text-white md:p-8">
            <div className="flex items-center justify-between pb-3">
              <p className="font-mono text-xs tracking-[0.14em]">{t('galleryCount', { n: index + 1, total })}</p>
              <button type="button" onClick={() => setIndex(null)} className="flex min-h-[44px] items-center gap-2 text-sm" data-autofocus>
                {t('close')} <Icon name="close" size={22} />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[index].src} alt={`${title} ${index + 1}`} className="max-h-full max-w-full object-contain" />
              {total > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label={t('galleryPrev')} className="absolute left-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-black/50 hover:bg-black/70">
                    <Icon name="chevronLeft" size={24} />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label={t('galleryNext')} className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-black/50 hover:bg-black/70">
                    <Icon name="chevronRight" size={24} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
