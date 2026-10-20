'use client';

import { useEffect, useState } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/Icon';
import ElysianMark from './ElysianMark';
import { NAV_ITEMS } from './nav';

export default function SiteHeader() {
  const t = useTranslations('Site');
  // The active segment comes from the router tree, so it does not depend on how the page URL is hosted.
  const segment = useSelectedLayoutSegment();
  const isHome = segment === null;
  const [revealed, setRevealed] = useState(!isHome);
  const [menuOpen, setMenuOpen] = useState(false);

  // On the home page the title screen is the navigation, so the bar slides in after it.
  useEffect(() => {
    if (!isHome) {
      setRevealed(true);
      return;
    }
    const onScroll = () => setRevealed(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => setMenuOpen(false), [segment]);

  const isActive = (href: string) => segment !== null && href === `/${segment}`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b border-ink/15 bg-paper/90 backdrop-blur-md transition-[transform,visibility] duration-500 ${
          revealed ? 'visible translate-y-0' : 'invisible -translate-y-full'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-page items-center gap-6 px-5 md:px-10">
          <Link href="/" className="flex items-center gap-3" aria-label={`Studio Elysian — ${t('home')}`}>
            <ElysianMark className="h-7 w-7" />
            <span className="font-latin text-[1.0625rem] font-semibold uppercase tracking-[0.16em]">Studio Elysian</span>
          </Link>

          <nav aria-label={t('mainNav')} className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-7 text-[0.875rem]">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`group relative flex items-center gap-1.5 py-2 ${isActive(item.href) ? 'text-ink' : 'text-ink-soft hover:text-ink'}`}
                  >
                    <span aria-hidden="true" className={`h-1.5 w-1.5 bg-accent transition-opacity ${isActive(item.href) ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />
                    <span className="link-underline">{t(item.key)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href="/habom"
            className="hidden items-center gap-2 rounded-full border border-ink/20 px-3.5 py-1.5 text-[0.8125rem] text-ink-soft transition-colors hover:border-rose hover:text-ink lg:flex"
          >
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-petal ring-2 ring-butter/70" />
            {t('habom')}
          </Link>

          <LanguageSwitch className="hidden lg:flex" />

          <button
            type="button"
            data-testid="mobile-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="ml-auto flex min-h-[44px] items-center gap-2 px-1 text-[0.8125rem] lg:hidden"
          >
            <span className="label">{t('menu')}</span>
            <Icon name="menu" size={22} />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} isActive={isActive} />
    </>
  );
}

function MobileMenu({ open, onClose, isActive }: { open: boolean; onClose: () => void; isActive: (href: string) => boolean }) {
  const t = useTranslations('Site');
  const items = [{ href: '/', key: 'home', latin: 'Cover' }, ...NAV_ITEMS, { href: '/habom', key: 'habom', latin: 'Habom' }] as const;

  return (
    <Modal open={open} onClose={onClose} label={t('menu')}>
      <div data-testid="mobile-menu" className="theme-elysian paper-grain manuscript-grid flex min-h-full w-full flex-col bg-paper px-6 pb-8 pt-5 text-ink">
        <div className="flex items-center justify-between">
          <span className="label text-ink-mute">{t('contents')}</span>
          <button type="button" onClick={onClose} className="flex min-h-[44px] items-center gap-2" data-autofocus>
            <span className="label">{t('close')}</span>
            <Icon name="close" size={22} />
          </button>
        </div>
        <nav aria-label={t('mainNav')} className="mt-8 flex-1">
          <ol className="border-t border-ink">
            {items.map((item, i) => (
              <li key={item.href} className="border-b border-ink/20">
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive(item.href) && item.href !== '/' ? 'page' : undefined}
                  className="flex items-baseline gap-4 py-4"
                >
                  <span className="font-mono text-xs text-accent">{String(i).padStart(2, '0')}</span>
                  <span className={`font-serif text-[1.75rem] leading-tight ${item.key === 'habom' ? 'flex items-center gap-2' : ''}`}>
                    {t(item.key)}
                    {item.key === 'habom' && <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-petal ring-2 ring-butter/70" />}
                  </span>
                  <span className="ml-auto font-latin text-lg italic text-ink-mute">{item.latin}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <LanguageSwitch className="mt-8 text-sm" />
      </div>
    </Modal>
  );
}
