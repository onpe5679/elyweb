'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Icon from '@/components/ui/Icon';
import { IS_STATIC_PREVIEW } from '@/lib/preview';

declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: HTMLElement | null) => void } };
  }
}

type XTimelineProps = {
  handle: string;
  height?: number;
};

// Renders the official X (Twitter) profile timeline embed. X's syndication
// endpoint intermittently rate-limits (429); when the widget fails to render
// within the deadline we show a graceful "View on X" fallback card instead of
// the bare placeholder link, so the page never looks broken.
export default function XTimeline({ handle, height = 640 }: XTimelineProps) {
  const t = useTranslations('News');
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'rendered' | 'failed'>(IS_STATIC_PREVIEW ? 'failed' : 'loading');

  useEffect(() => {
    if (!handle || IS_STATIC_PREVIEW) {
      setStatus('failed');
      return;
    }
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout>;
    let deadline: ReturnType<typeof setTimeout>;

    // X always injects a 0x0 "rufous-sandbox" iframe and, on failure (429),
    // a 0-height timeline iframe. Only treat it as rendered when the embed
    // iframe actually has real height.
    const isRendered = () => {
      const f = ref.current?.querySelector('iframe');
      return !!f && f.offsetHeight > 100;
    };

    const poll = () => {
      if (cancelled) return;
      if (isRendered()) {
        setStatus('rendered');
        clearTimeout(deadline);
        return;
      }
      pollTimer = setTimeout(poll, 500);
    };

    const run = () => {
      window.twttr?.widgets?.load(ref.current);
      poll();
    };

    deadline = setTimeout(() => {
      if (!cancelled && !isRendered()) setStatus('failed');
    }, 10000);

    const SCRIPT_ID = 'twitter-widgets-js';
    if (window.twttr?.widgets) {
      run();
    } else {
      const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', run);
      } else {
        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.onload = run;
        script.onerror = () => !cancelled && setStatus('failed');
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      clearTimeout(pollTimer);
      clearTimeout(deadline);
    };
  }, [handle]);

  if (!handle) return null;
  const clean = handle.replace(/^@/, '');
  const profileUrl = `https://x.com/${clean}`;

  if (status === 'failed') {
    return (
      <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-start border border-ink p-8 transition-colors hover:bg-ink hover:text-paper md:p-10">
        <Icon name="x" size={32} />
        <span className="mt-6 font-serif text-2xl font-semibold">{t('xFallbackTitle')}</span>
        <span className="mt-2 font-mono text-sm">@{clean}</span>
        <span className="mt-4 text-[0.9375rem] leading-relaxed opacity-80">{t('xFallbackBody')}</span>
        <span className="mt-8 inline-flex items-center gap-2 text-[0.9375rem]">
          <span className="link-underline">{t('xOpen')}</span> <Icon name="arrowUpRight" size={16} />
        </span>
      </a>
    );
  }

  return (
    <div ref={ref} className="relative min-h-[200px] border border-ink/20 bg-white/50">
      <a className="twitter-timeline" data-theme="light" data-chrome="noheader nofooter transparent" data-height={height} href={`https://twitter.com/${clean}`}>
        @{clean}
      </a>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper">
          <span className="label animate-pulse text-ink-mute">{t('loading')}</span>
        </div>
      )}
    </div>
  );
}
