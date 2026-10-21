'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUpRightIcon, XIcon } from '@/components/pages/Icons';

declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: HTMLElement | null) => void } };
  }
}

type XTimelineProps = {
  handle: string;
  height?: number;
};

/**
 * 공식 X(트위터) 프로필 타임라인 임베드.
 * X 의 syndication 서버는 가끔 429 로 막히거나, 네트워크/광고 차단으로 스크립트가 아예 못 뜨는 환경이 있다.
 * 그래서 임베드가 실제로 높이를 갖고 그려졌을 때만 "rendered" 로 보고, 그 전(불러오는 중)과
 * 실패했을 때는 같은 모양의 "X 프로필 카드" 를 보여 준다 — 어느 쪽이든 페이지가 깨져 보이거나 막다른 길이 되지 않는다.
 */
export default function XTimeline({ handle, height = 600 }: XTimelineProps) {
  const t = useTranslations('News.x');
  const tp = useTranslations('Pages');
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'rendered' | 'failed'>('loading');
  const [night, setNight] = useState(false);

  useEffect(() => {
    if (!handle) {
      setStatus('failed');
      return;
    }
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout>;
    let deadline: ReturnType<typeof setTimeout>;

    // 사이트 테마(종이/밤)에 맞춰 임베드 테마를 정한다.
    const isNight = document.documentElement.getAttribute('data-theme') === 'night';
    setNight(isNight);
    ref.current?.querySelector('a.twitter-timeline')?.setAttribute('data-theme', isNight ? 'dark' : 'light');

    // X 는 항상 0x0 "rufous-sandbox" iframe 을 넣고, 실패(429)하면 높이 0 의 타임라인 iframe 을 남긴다.
    // 실제 높이가 있을 때만 그려진 것으로 본다.
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
    }, 8000);

    const SCRIPT_ID = 'twitter-widgets-js';
    if (window.twttr?.widgets) {
      run();
    } else {
      const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', run);
        existing.addEventListener('error', () => !cancelled && setStatus('failed'));
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

  // 불러오는 중 / 실패: 같은 카드. 불러오는 중에는 위쪽에 진행 안내만 더한다.
  const card = (loading: boolean) => (
    <div className="relative bg-paper-3 p-6 sm:p-10" data-testid="x-fallback" aria-busy={loading}>
      <div aria-hidden className="ruled absolute inset-0 opacity-30" />
      <div className="relative">
        <div className="flex items-center gap-3 text-ink">
          <span className="grid h-12 w-12 place-items-center border border-ink bg-paper-3">
            <XIcon className="h-5 w-5" />
          </span>
          <p className="font-mono text-[12px] uppercase tracking-[.14em] text-ink-3">
            {loading ? <span role="status">{t('loading')}</span> : t('frame')}
          </p>
        </div>
        <p className="mt-6 break-all font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-tight">@{clean}</p>
        <p className="mt-4 max-w-md break-keep font-serif text-[16px] leading-8 text-ink-2">{t('fallbackBody')}</p>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--accent mt-8"
        >
          {t('open')}
          <ArrowUpRightIcon />
          <span className="sr-only">{tp('external')}</span>
        </a>
      </div>
    </div>
  );

  if (status === 'failed') return <div className="plate !p-0 sm:!p-2">{card(false)}</div>;

  const rendered = status === 'rendered';
  return (
    <div className="plate !p-0 sm:!p-2">
      <div ref={ref} className={rendered ? 'bg-paper-3' : 'relative min-h-[320px]'}>
        {/* 위젯이 이 링크를 타임라인 iframe 으로 바꿔 넣는다. 그려지기 전에는 보이지 않게 두고 카드가 자리를 채운다. */}
        <div className={rendered ? '' : 'invisible absolute inset-x-0 top-0 h-0 overflow-hidden'}>
          <a
            className="twitter-timeline"
            data-theme={night ? 'dark' : 'light'}
            data-height={height}
            data-chrome="transparent"
            href={`https://twitter.com/${clean}`}
          >
            @{clean}
          </a>
        </div>
        {status === 'loading' && card(true)}
      </div>
    </div>
  );
}
