/**
 * 인라인 SVG 아이콘(폰트 아이콘은 쓰지 않는다). 색은 currentColor.
 * 모두 장식이므로 aria-hidden — 의미는 옆의 텍스트가 전달한다.
 */
type P = { className?: string };

const base = { viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false } as const;

export function XIcon({ className = 'h-5 w-5' }: P) {
  return (
    <svg {...base} className={className} fill="currentColor">
      <path d="M17.75 3h3.1l-6.77 7.74L22 21h-6.24l-4.89-6.4L5.27 21H2.17l7.24-8.28L1.75 3h6.4l4.42 5.84L17.75 3Zm-1.09 16.14h1.72L7.17 4.76H5.33l11.33 14.38Z" />
    </svg>
  );
}

export function YouTubeIcon({ className = 'h-5 w-5' }: P) {
  return (
    <svg {...base} className={className} fill="currentColor">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.77-1.77C18.27 5 12 5 12 5s-6.27 0-7.83.43A2.5 2.5 0 0 0 2.4 7.2C2 8.77 2 12 2 12s0 3.23.4 4.8a2.5 2.5 0 0 0 1.77 1.77C5.73 19 12 19 12 19s6.27 0 7.83-.43a2.5 2.5 0 0 0 1.77-1.77C22 15.23 22 12 22 12s0-3.23-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  );
}

export function InstagramIcon({ className = 'h-5 w-5' }: P) {
  return (
    <svg {...base} className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GlobeIcon({ className = 'h-5 w-5' }: P) {
  return (
    <svg {...base} className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9S14.6 18.4 12 21c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3Z" />
    </svg>
  );
}

export function LinkIcon({ className = 'h-5 w-5' }: P) {
  return (
    <svg {...base} className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </svg>
  );
}

export function ArrowLeftIcon({ className = 'h-4 w-4' }: P) {
  return (
    <svg {...base} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className = 'h-4 w-4' }: P) {
  return (
    <svg {...base} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function CheckIcon({ className = 'h-6 w-6' }: P) {
  return (
    <svg {...base} className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function AlertIcon({ className = 'h-4 w-4' }: P) {
  return (
    <svg {...base} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.4v.1" />
    </svg>
  );
}

/** 이름 있는 SNS 링크용: id 로 아이콘 선택 */
export function SocialIcon({ id, className }: { id: 'x' | 'youtube' | 'instagram' | 'website' | 'link' | string; className?: string }) {
  switch (id) {
    case 'x':
    case 'twitter':
      return <XIcon className={className} />;
    case 'youtube':
      return <YouTubeIcon className={className} />;
    case 'instagram':
      return <InstagramIcon className={className} />;
    case 'website':
    case 'portfolio':
      return <GlobeIcon className={className} />;
    default:
      return <LinkIcon className={className} />;
  }
}
