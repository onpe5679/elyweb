'use client';

import { useEffect, useRef, useState } from 'react';

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

    const poll = () => {
      if (cancelled) return;
      if (ref.current?.querySelector('iframe')) {
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
      if (!cancelled && !ref.current?.querySelector('iframe')) setStatus('failed');
    }, 8000);

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
        className="block max-w-xl mx-auto bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl p-10 text-center hover:border-primary/40 transition-colors"
      >
        <i className="fa-brands fa-x-twitter text-4xl text-gray-900 dark:text-white mb-4"></i>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">@{clean}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          X(트위터)에서 스튜디오 엘리시안의 최신 소식을 확인하세요.
        </p>
        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm">
          X에서 보기 <i className="fa-solid fa-arrow-right"></i>
        </span>
      </a>
    );
  }

  return (
    <div ref={ref} className="relative min-h-[160px] max-w-xl mx-auto">
      <a className="twitter-timeline" data-theme="dark" data-height={height} href={`https://twitter.com/${clean}`}>
        @{clean}
      </a>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-light dark:bg-background-dark">
          <i className="fa-solid fa-spinner fa-spin text-primary text-2xl"></i>
        </div>
      )}
    </div>
  );
}
