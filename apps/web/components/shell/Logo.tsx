import { SITE_URL_DEFAULT_LOGO } from '@/lib/brands';

/** 로고(투명 PNG/WebP)를 마스크로 써서 테마 잉크색으로 칠한다. */
export function LogoMark({ src, className = 'h-7 w-7' }: { src?: string | null; className?: string }) {
  return (
    <span
      aria-hidden
      className={`logo-mask shrink-0 ${className}`}
      style={{ ['--logo' as string]: `url(${src || SITE_URL_DEFAULT_LOGO})` }}
    />
  );
}

/** 하봄: 공식 로고 파일을 찾지 못해 만든 시안용 워드마크(서체만 사용). */
export function HabomWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-[26px] leading-none text-ink ${className}`}>
      <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-accent text-[20px] text-accent-ink ring-2 ring-ink">
        봄
      </span>
      <span>하봄</span>
    </span>
  );
}
