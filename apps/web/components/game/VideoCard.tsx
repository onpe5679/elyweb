'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * 영상 카드: 처음에는 작품 이미지 위의 재생 버튼만 그려 페이지를 가볍게 하고,
 * 누르면 youtube-nocookie 임베드로 바뀐다. 임베드가 막힌 환경을 위해 YouTube 링크를 항상 함께 둔다.
 */
export default function VideoCard({
  id, title, youtubeId, url, poster, large,
}: { id: string; title: string; youtubeId: string; url: string; poster: string; large?: boolean }) {
  const t = useTranslations('Game');
  const [playing, setPlaying] = useState(false);

  return (
    <figure id={id} className={large ? 'sm:col-span-2' : ''}>
      <div className="plate">
        <div className="relative aspect-video overflow-hidden bg-black" style={{ borderRadius: 'calc(var(--radius-card) - 8px)' }}>
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 block w-full" aria-label={`${t('videos.play')}: ${title}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={poster} alt="" loading="lazy" className="zoom-img h-full w-full object-cover object-[50%_30%] brightness-[.55]" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-black shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
      <figcaption className="mt-3 flex items-center justify-between gap-4">
        <span className="font-display text-[19px] font-extrabold">{title}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="link-u shrink-0 font-mono text-[12px] uppercase tracking-wider text-ink-2">
          {t('videos.youtube')} ↗
        </a>
      </figcaption>
    </figure>
  );
}
