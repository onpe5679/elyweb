'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/Icon';
import { IS_STATIC_PREVIEW } from '@/lib/preview';

export function YouTubeFrame({ id, title, autoplay = true }: { id: string; title: string; autoplay?: boolean }) {
  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${id}?rel=0${autoplay ? '&autoplay=1' : ''}`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="h-full w-full"
    />
  );
}

export default function TrailerButton({ youtubeId, title, className }: { youtubeId: string; title: string; className: string }) {
  const t = useTranslations('Detail');
  const [open, setOpen] = useState(false);

  if (IS_STATIC_PREVIEW) {
    return (
      <a href={`https://www.youtube.com/watch?v=${youtubeId}`} target="_blank" rel="noopener noreferrer" className={className}>
        <Icon name="play" size={18} /> {t('watch')} <Icon name="arrowUpRight" size={14} />
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={className}>
        <Icon name="play" size={18} /> {t('watch')}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} label={`${t('player')} — ${title}`}>
        <div className="flex h-full w-full flex-col items-center justify-center p-4 md:p-10">
          <div className="flex w-full max-w-5xl justify-end pb-3">
            <button type="button" onClick={() => setOpen(false)} className="flex min-h-[44px] items-center gap-2 text-sm text-white" data-autofocus>
              {t('close')} <Icon name="close" size={22} />
            </button>
          </div>
          <div className="aspect-video w-full max-w-5xl bg-black">
            <YouTubeFrame id={youtubeId} title={title} />
          </div>
        </div>
      </Modal>
    </>
  );
}
