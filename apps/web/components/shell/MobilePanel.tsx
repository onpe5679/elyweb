'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { useFocusTrap } from '@/components/ui/useFocusTrap';

type Props = {
  id: string;
  open: boolean;
  onClose: () => void;
  label: string;
  className?: string;
  testId?: string;
  children: ReactNode;
};

/**
 * 모바일 메뉴 패널(헤더 아래 화면 전체).
 * body 로 portal 해서 그린다 — 헤더처럼 backdrop-filter/transform 이 걸린 부모 안에 두면
 * position: fixed 가 그 부모 기준이 되어 64px 띠 안에 갇히기 때문(2026-11 모바일 메뉴 버그).
 * 페이지/언어가 바뀌면 닫히고, 열려 있는 동안 포커스 트랩·스크롤 잠금·Esc 닫기.
 */
export default function MobilePanel({ id, open, onClose, label, className = '', testId, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  useEffect(() => setMounted(true), []);
  useFocusTrap(ref, open && mounted, onClose);

  // 이동(같은 레이아웃 안의 페이지 이동·언어 변경) 뒤에는 닫는다.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, locale]);

  if (!open || !mounted) return null;
  return createPortal(
    <div
      id={id}
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      data-testid={testId}
      className={`fixed inset-x-0 bottom-0 top-[var(--header-h)] z-[80] overflow-y-auto overscroll-contain ${className}`}
    >
      {children}
    </div>,
    document.body,
  );
}
