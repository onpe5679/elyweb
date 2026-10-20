'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Icon from '@/components/ui/Icon';
import type { VideoItem } from '@/lib/game-spec';
import { YouTubeFrame } from './TrailerButton';

// Videos are listed like episodes: a main screen plus a numbered list. The YouTube player is
// only loaded once someone presses play.
export default function VideoShelf({ videos, variant }: { videos: VideoItem[]; variant: 'elysian' | 'habom' }) {
  const t = useTranslations('Detail');
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const habom = variant === 'habom';
  const video = videos[current];

  const select = (i: number) => {
    setCurrent(i);
    setPlaying(true);
  };

  return (
    <div className={`grid gap-6 ${videos.length > 1 ? 'lg:grid-cols-12' : ''}`}>
      <div className={`${videos.length > 1 ? 'lg:col-span-8' : ''}`}>
        <div className={`relative aspect-video overflow-hidden bg-black ${habom ? 'rounded-[24px]' : ''}`}>
          {playing ? (
            <YouTubeFrame key={video.youtubeId} id={video.youtubeId} title={video.title} />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={t('videosPlay', { title: video.title })}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className={`flex h-20 w-20 items-center justify-center transition-transform group-hover:scale-105 ${habom ? 'rounded-full bg-rose text-white' : 'bg-paper text-ink'}`}>
                  <Icon name="play" size={30} />
                </span>
              </span>
              <span className={`absolute bottom-0 left-0 px-4 py-3 text-left text-sm text-white ${habom ? 'font-semibold' : 'font-mono tracking-wide'}`}>{video.title}</span>
            </button>
          )}
        </div>
      </div>

      {videos.length > 1 && (
        <ol aria-label={t('videosList')} className="lg:col-span-4">
          {videos.map((v, i) => {
            const active = i === current;
            return (
              <li key={v.id + i}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full items-center gap-4 p-2.5 text-left transition-colors ${
                    habom ? `rounded-[18px] ${active ? 'bg-blush' : 'hover:bg-blush/60'}` : `border-b border-ink/15 ${active ? 'bg-ink/[0.05]' : 'hover:bg-ink/[0.03]'}`
                  }`}
                >
                  <span className={`relative w-32 shrink-0 overflow-hidden ${habom ? 'rounded-[12px]' : ''}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className={`block font-mono text-[0.6875rem] ${habom ? 'text-rose' : 'text-accent'}`}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={`block truncate text-[0.9375rem] ${habom ? 'font-semibold' : 'font-serif'}`}>{v.title}</span>
                    {active && playing && <span className="mt-0.5 block text-[0.75rem] opacity-70">{t('videosNow')}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
