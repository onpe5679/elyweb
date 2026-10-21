'use client';

import { useEffect } from 'react';
import { LAST_KEY } from '@/components/home/Cover';

/** 작품 상세를 열면 "이어 읽기" 메뉴가 이 작품으로 돌아오도록 기억한다(브라우저 localStorage 만 사용). */
export default function RememberGame({ slug, title }: { slug: string; title: string }) {
  useEffect(() => {
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify({ href: `/games/${slug}`, title }));
    } catch {}
  }, [slug, title]);
  return null;
}
