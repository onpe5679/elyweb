'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

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
export default function XTimeline({ handle, height = 600 }: XTimelineProps) {
  const t = useTranslations('XTimeline');
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'rendered' | 'failed'>('loading');

  useEffect(() => {
    if (!handle) {
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
      <a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-full border border-rule bg-paper-raised p-8 text-center transition-colors hover:border-ink md:p-10"
      >
        <i className="fa-brands fa-x-twitter text-4xl text-ink" aria-hidden="true"></i>
        <h3 className="font-display mt-6 text-3xl leading-tight text-ink">@{clean}</h3>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink-2">{t('fallback')}</p>
        <span className="btn-ink mt-8 group-hover:bg-seal">
          {t('cta')}
          <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </span>
      </a>
    );
  }

  return (
    <div ref={ref} className="relative min-h-[160px] max-w-xl">
      <a className="twitter-timeline" data-theme="dark" data-height={height} href={`https://twitter.com/${clean}`}>
        @{clean}
      </a>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-seal" aria-hidden="true"></i>
        </div>
      )}
    </div>
  );
}
