'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: HTMLElement | null) => void } };
  }
}

type XTimelineProps = {
  handle: string;
  height?: number;
};

export default function XTimeline({ handle, height = 600 }: XTimelineProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SCRIPT_ID = 'twitter-widgets-js';
    const load = () => window.twttr?.widgets?.load(ref.current);

    if (window.twttr?.widgets) {
      load();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', load);
      return () => existing.removeEventListener('load', load);
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = load;
    document.body.appendChild(script);
  }, [handle]);

  if (!handle) return null;
  const clean = handle.replace(/^@/, '');

  return (
    <div ref={ref} className="max-w-xl mx-auto">
      <a
        className="twitter-timeline"
        data-theme="dark"
        data-height={height}
        href={`https://twitter.com/${clean}`}
      >
        Tweets by @{clean}
      </a>
    </div>
  );
}
