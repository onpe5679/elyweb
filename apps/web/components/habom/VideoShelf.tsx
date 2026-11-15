'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Icon from './Icon';
import { YouTubeFrame } from './TrailerButton';
import type { VideoItem } from '@/lib/game-model';

/** 영상: 큰 화면 하나 + (여러 편이면) 옆에 목록. YouTube 플레이어는 재생을 누를 때만 불러온다. */
export default function VideoShelf({ videos }: { videos: VideoItem[] }) {
  const t = useTranslations('HabomGame');
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const video = videos[current];
  const many = videos.length > 1;

  return (
    <div className={`grid gap-6 ${many ? 'lg:grid-cols-12' : ''}`}>
      <div className={many ? 'lg:col-span-8' : 'max-w-4xl'}>
        <div className="relative aspect-video overflow-hidden rounded-[24px] bg-plum">
          {playing ? (
            <YouTubeFrame key={video.youtubeId} id={video.youtubeId} title={video.title} />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={t('videosPlay', { title: video.title })}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-85 transition-opacity group-hover:opacity-100" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-rose text-white shadow-lg transition-transform group-hover:scale-105">
                  <Icon name="play" size={30} />
                </span>
              </span>
              <span className="absolute bottom-0 left-0 px-5 py-4 text-left text-sm font-semibold text-white [text-shadow:0_1px_8px_rgba(0,0,0,.6)]">{video.title}</span>
            </button>
          )}
        </div>
        <p className="mt-3 flex justify-between gap-4 text-[0.8125rem] text-plum-soft">
          <span className="font-semibold text-plum">{video.title}</span>
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-rose">
            {t('youtube')} <Icon name="arrowUpRight" size={13} />
          </a>
        </p>
      </div>

      {many && (
        <ol aria-label={t('videosList')} className="space-y-1 lg:col-span-4">
          {videos.map((v, i) => {
            const active = i === current;
            return (
              <li key={v.id + i}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrent(i);
                    setPlaying(true);
                  }}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full items-center gap-4 rounded-[18px] p-2.5 text-left transition-colors ${active ? 'bg-blush' : 'hover:bg-blush/60'}`}
                >
                  <span className="relative w-32 shrink-0 overflow-hidden rounded-[12px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-round-latin text-[0.75rem] font-bold text-rose">{String(i + 1).padStart(2, '0')}</span>
                    <span className="block truncate text-[0.9375rem] font-semibold">{v.title}</span>
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
