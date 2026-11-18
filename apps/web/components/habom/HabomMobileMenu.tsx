'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import MobilePanel from '@/components/shell/MobilePanel';
import LanguageSwitcher from '@/components/shell/LanguageSwitcher';

type Labels = { works: string; about: string; open: string; close: string; nav: string; language: string };

/** 하봄 화면 모바일(640px 미만) 메뉴: 작품 · 소개 + 언어. 데스크톱에서는 헤더에 바로 보인다. */
export default function HabomMobileMenu({ labels }: { labels: Labels }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-plum/15 sm:hidden"
        aria-label={open ? labels.close : labels.open}
        aria-expanded={open}
        aria-controls="habom-mobile-menu"
        data-testid="habom-menu-button"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          {open ? <path d="M5 5l14 14M19 5 5 19" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
        </svg>
      </button>
      <MobilePanel
        id="habom-mobile-menu"
        open={open}
        onClose={() => setOpen(false)}
        label={labels.nav}
        testId="habom-mobile-menu"
        className="bg-cream px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 text-plum sm:hidden"
      >
        <ul className="border-t border-blush">
          {[
            { href: '/habom#works', label: labels.works },
            { href: '/habom#about', label: labels.about },
          ].map((it) => (
            <li key={it.href}>
              <Link href={it.href} onClick={() => setOpen(false)} className="block border-b border-blush py-4 font-round text-[24px]">
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[0.8125rem] font-semibold text-plum-soft">{labels.language}</p>
        <LanguageSwitcher variant="menu" tone="habom" className="mt-3" />
      </MobilePanel>
    </>
  );
}
