import type { StoreKind } from '@/lib/game-model';

/** 스토어 로고(단색). 색은 currentColor 를 따른다. */
export default function StoreIcon({ kind, size = 18, className }: { kind: StoreKind; size?: number; className?: string }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false, className } as const;
  if (kind === 'steam') {
    return (
      <svg {...common} fill="currentColor">
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.387 3.387 0 0 1 1.912-.59c.063 0 .125.004.188.006l2.861-4.142V8.91a4.528 4.528 0 0 1 4.524-4.524c2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375a2.55 2.55 0 0 0 .005-1.949 2.546 2.546 0 0 0-1.377-1.383 2.537 2.537 0 0 0-1.878-.03l1.523.63a1.869 1.869 0 0 1 1.009 2.455 1.874 1.874 0 0 1-2.455 1.012zm11.415-9.303a3.019 3.019 0 0 0-3.015-3.015 3.019 3.019 0 0 0-3.015 3.015 3.019 3.019 0 0 0 3.015 3.015 3.019 3.019 0 0 0 3.015-3.015zm-5.273-.005a2.265 2.265 0 0 1 2.265-2.266 2.266 2.266 0 0 1 2.266 2.266 2.265 2.265 0 0 1-2.266 2.265 2.265 2.265 0 0 1-2.265-2.265z" />
      </svg>
    );
  }
  if (kind === 'stove') {
    // STOVE 는 공식 단색 로고 파일이 저장소에 없어 둥근 사각형 안의 S 로 대신한다.
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <path d="M15.5 8.6c-.5-1-1.7-1.6-3.3-1.6-1.9 0-3.2 1-3.2 2.4 0 3.3 6.8 1.9 6.8 5.1 0 1.5-1.4 2.5-3.5 2.5-1.7 0-3-.7-3.5-1.8" />
      </svg>
    );
  }
  if (kind === 'itch') {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5 5.5 5h13L20 9.5M4 9.5c0 1.2 1 2 2 2s2-.8 2-2c0 1.2 1 2 2 2s2-.8 2-2c0 1.2 1 2 2 2s2-.8 2-2c0 1.2 1 2 2 2s2-.8 2-2M5.5 11.3V19h13v-7.7M10 19v-3.5h4V19" />
      </svg>
    );
  }
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}
