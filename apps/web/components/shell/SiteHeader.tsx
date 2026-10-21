'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import type { BrandId } from '@/lib/brands';
import { HabomWordmark, LogoMark } from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useFocusTrap } from '@/components/ui/useFocusTrap';

type NavItem = { href: string; key: string; exact?: boolean; badge?: string };

type Props = {
  brand: BrandId;
  logoSrc?: string | null;
  /** 하봄 화면에서 "체험하기" 가 가리킬 경로(하봄 소속 게임 중 첫 번째) */
  experienceHref?: string;
};

export default function SiteHeader({ brand, logoSrc, experienceHref }: Props) {
  const t = useTranslations('Nav');
  const tc = useTranslations('Common');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  useFocusTrap(panelRef, open, () => setOpen(false));

  const items: NavItem[] =
    brand === 'habom'
      ? [
          { href: '/habom', key: 'habomHome', exact: true },
          { href: '/habom#works', key: 'habomWorks' },
          ...(experienceHref ? [{ href: experienceHref, key: 'habomPlay' }] : []),
        ]
      : [
          { href: '/games', key: 'works' },
          { href: '/about', key: 'studio' },
          { href: '/news', key: 'news' },
          { href: '/habom', key: 'habom', badge: 'habom' },
          { href: '/contact', key: 'contact' },
        ];

  const isActive = (it: NavItem) => {
    const base = it.href.split(/[#?]/)[0];
    return it.exact ? pathname === base : pathname === base || pathname.startsWith(base + '/');
  };

  return (
    <header className="site-header">
      <div className="mx-auto flex h-full max-w-page items-center justify-between gap-6 px-5 md:px-10">
        <Link href={brand === 'habom' ? '/habom' : '/'} className="flex items-center gap-3 text-ink" aria-label={brand === 'habom' ? tc('habomName') : 'Studio Elysian'}>
          {brand === 'habom' ? (
            <HabomWordmark />
          ) : (
            <>
              <LogoMark src={logoSrc} className="h-8 w-8" />
              <span className="font-display text-[15px] font-extrabold uppercase tracking-[.12em]">Studio Elysian</span>
            </>
          )}
        </Link>

        <nav aria-label={tc('mainNav')} className="hidden items-center gap-7 lg:flex">
          {items.map((it) => (
            <Link key={it.key} href={it.href} className="nav-link" aria-current={isActive(it) ? 'page' : undefined}>
              {t(it.key)}
              {it.badge && <span aria-hidden className="ml-1.5 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-[#F78FAE]" />}
            </Link>
          ))}
          {brand === 'habom' && (
            <Link href="/" className="marker marker--outline !text-[13px] hover:!bg-ink hover:!text-paper">
              ← {tc('toElysian')}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <ThemeToggle className="hidden sm:inline-flex" />
          <button
            ref={menuBtn}
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
          <ul className="title-menu border-t border-ink/15">
            {[...items, ...(brand === 'elysian' ? [{ href: '/press', key: 'press' }] : [{ href: '/', key: 'toElysian' }])].map((it, i) => (
              <li key={it.key}>
                <Link
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 border-b border-ink/15 py-4 font-display text-[26px] font-extrabold text-ink"
                >
                  <span className="font-mono text-[12px] font-normal text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                  {t(it.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
