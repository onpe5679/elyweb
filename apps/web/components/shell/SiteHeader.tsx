'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LogoMark } from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { useFocusTrap } from '@/components/ui/useFocusTrap';

type NavItem = { href: string; key: string };

/** 엘리시안 상단 메뉴: 스튜디오 소개 · 작품 · 새 소식 · 문의 · 프레스. 하봄은 오른쪽 아래 플로팅 버튼으로 뺐다. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/about', key: 'studio' },
  { href: '/games', key: 'works' },
  { href: '/news', key: 'news' },
  { href: '/contact', key: 'contact' },
  { href: '/press', key: 'press' },
];

export default function SiteHeader({ logoSrc }: { logoSrc?: string | null }) {
  const t = useTranslations('Nav');
  const tc = useTranslations('Common');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open, () => setOpen(false));

  const isActive = (it: NavItem) => pathname === it.href || pathname.startsWith(it.href + '/');

  return (
    <header className="site-header">
      <div className="mx-auto flex h-full max-w-page items-center justify-between gap-6 px-5 md:px-10">
        <Link href="/" className="flex items-center gap-3 text-ink" aria-label="Studio Elysian">
          <LogoMark src={logoSrc} className="h-7 w-10" />
          <span className="font-display text-[15px] font-extrabold uppercase tracking-[.12em]">Studio Elysian</span>
        </Link>

        <nav aria-label={tc('mainNav')} className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((it) => (
            <Link key={it.key} href={it.href} className="nav-link" aria-current={isActive(it) ? 'page' : undefined}>
              {t(it.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-ui border border-ink/30 lg:hidden"
            aria-label={open ? tc('closeMenu') : tc('openMenu')}
            aria-expanded={open}
            aria-controls="mobile-menu"
            data-testid="mobile-menu-button"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {open ? <path d="M5 5l14 14M19 5 5 19" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={tc('mainNav')}
          data-testid="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-50 overflow-y-auto bg-paper px-6 pb-10 pt-6 lg:hidden"
        >
          <ul className="border-t border-ink/15">
            {[...NAV_ITEMS, { href: '/habom', key: 'habom' }].map((it) => (
              <li key={it.key}>
                <Link
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-ink/15 py-4 font-myeongjo text-[24px] font-medium text-ink"
                >
                  {t(it.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
