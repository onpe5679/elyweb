'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import Experience from './Experience';
import './habom.css';

type Props = {
  slug: string;
  title: string;
  /** 키아트(배경으로 어둡게 깔린다). 없으면 색 면으로 대체한다. */
  image?: string;
  variant?: 'primary' | 'ghost' | 'card';
  className?: string;
  /** 버튼 문구를 바꾸고 싶을 때(기본: 번역된 "대사·선택지 체험하기") */
  label?: string;
};

/**
 * 같은 페이지에 런처가 여러 개 있어도 `?play=1` 자동 열기는 한 곳에서만 일어나게 한다.
 * (모듈 단위 표식: 먼저 효과가 실행된 런처가 가져가고, 닫히거나 사라지면 놓는다)
 */
let autoOpenOwner: symbol | null = null;

function stripPlayParam() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('play')) return;
    url.searchParams.delete('play');
    // 기존 history.state 를 그대로 넘겨 Next 라우터의 상태를 보존한다
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  } catch {}
}

/**
 * 하봄 게임의 "대사·선택지 체험" 여는 버튼. 열림 상태를 직접 갖고, URL 에 `?play=1` 이 있으면 자동으로 연다.
 * 하봄 소속 게임에서만 쓴다(엘리시안 화면에 두지 않는다). 하봄 토큰이 켜진 영역([data-brand="habom"]) 안에 두면 색이 맞는다.
 */
export default function ExperienceLauncher({ slug, title, image, variant = 'primary', className = '', label }: Props) {
  const t = useTranslations('Experience');
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useRef(Symbol('habom-launcher'));

  // ?play=1 → 자동 열기 (useSearchParams 대신 window.location 을 직접 읽어 정적 내보내기에서도 안전하다)
  useEffect(() => {
    const me = id.current;
    if (new URLSearchParams(window.location.search).get('play') === '1' && !autoOpenOwner) {
      autoOpenOwner = me;
      setOpen(true);
    }
    return () => {
      if (autoOpenOwner === me) autoOpenOwner = null;
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    stripPlayParam();
    if (autoOpenOwner === id.current) autoOpenOwner = null;
    // 자동으로 열린 경우엔 포커스를 돌려줄 이전 요소가 없으므로 이 버튼으로 돌려준다
    window.requestAnimationFrame(() => {
      const el = triggerRef.current;
      if (el && (!document.activeElement || document.activeElement === document.body)) el.focus();
    });
  }, []);

  const text = label ?? t('launcher.label');

  return (
    <>
      {variant === 'card' ? (
        <button
          ref={triggerRef}
          type="button"
          data-brand="habom"
          data-testid="experience-launcher"
          aria-haspopup="dialog"
          className={`exp-launch-card group ${className}`}
          onClick={() => setOpen(true)}
        >
          <span className="sticker !text-[13px] [--r:-3deg]">{t('launcher.badge')}</span>
          <span className="kr-keep font-display text-[clamp(22px,2.6vw,30px)] leading-tight">{label ?? t('launcher.cardTitle')}</span>
          <span className="kr-keep text-[15px] leading-7 text-ink-2">{t('launcher.cardBody')}</span>
          <span className="font-mono text-[11px] tracking-wide text-ink-3">{t('launcher.cardMeta')}</span>
          <span aria-hidden className="exp-launch-card__go">
            ▶
          </span>
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          data-brand="habom"
          data-testid="experience-launcher"
          aria-haspopup="dialog"
          className={`btn exp-launch ${variant === 'ghost' ? 'btn--ghost' : 'btn--accent'} ${className}`}
          onClick={() => setOpen(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
          </svg>
          <span>{text}</span>
        </button>
      )}
      {open && createPortal(<Experience game={{ slug, title, image }} onClose={close} />, document.body)}
    </>
  );
}
