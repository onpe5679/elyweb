'use client';

import {Link, usePathname} from '@/i18n/routing';
import {useTranslations} from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import {useEffect, useState} from 'react';

interface NavigationProps {
  logoImage?: string | null;
  logoIcon?: string | null;
}

const LINKS = [
  {key: 'games', href: '/games'},
  {key: 'about', href: '/about'},
  {key: 'news', href: '/news'},
  {key: 'hobom', href: '/hobom'},
  {key: 'contact', href: '/contact'},
] as const;

function MobileMenu({items, t, onClose}: {items: readonly {key: string; href: string}[]; t: (key: string) => string; onClose: () => void}) {
  return (
    <div
      id="mobile-menu"
      data-testid="mobile-menu"
      className="fixed inset-x-0 bottom-0 top-20 z-40 flex flex-col overflow-y-auto bg-paper md:hidden"
    >
      <ul className="flex flex-col px-4 pt-6">
        {items.map((item) => (
          <li key={item.key} className="border-b border-rule">
            <Link
              href={item.href}
              onClick={onClose}
              className="font-display flex items-center justify-between py-5 text-3xl text-ink"
            >
              <span>{t(item.key)}</span>
              <span aria-hidden="true" className="text-xl text-seal">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Navigation({logoImage, logoIcon}: NavigationProps) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // The home title screen sits on night ink, so the bar stays transparent until the reader scrolls.
  const onNight = isHome && !scrolled && !isMenuOpen;
  const mark = logoImage || logoIcon;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  const linkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return [
      'relative text-sm tracking-wide transition-colors py-1',
      'after:absolute after:left-0 after:-bottom-0.5 after:h-px after:bg-current after:transition-all',
      active ? 'after:w-full' : 'after:w-0 hover:after:w-full',
      onNight ? 'text-moon hover:text-white' : 'text-ink-2 hover:text-seal',
    ].join(' ');
  };

  return (
    <>
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
        onNight ? 'bg-transparent' : 'bg-paper/95 backdrop-blur-sm border-b border-rule',
      ].join(' ')}
    >
      <nav aria-label="Main" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Studio Elysian">
          {mark ? (
            <img
              src={mark}
              alt=""
              className={['h-9 w-9 object-contain transition-[filter] duration-500', onNight ? 'invert' : ''].join(' ')}
            />
          ) : (
            <span className={['h-9 w-9 border', onNight ? 'border-moon' : 'border-ink'].join(' ')} aria-hidden="true" />
          )}
          <span
            className={[
              'font-display text-lg font-semibold uppercase tracking-[0.2em]',
              onNight ? 'text-moon' : 'text-ink',
            ].join(' ')}
          >
            Studio Elysian
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((item) => (
            <Link key={item.key} href={item.href} className={linkClass(item.href)}>
              {t(item.key)}
            </Link>
          ))}
          <Link
            href="/press"
            className={[
              'border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors',
              onNight
                ? 'border-moon text-moon hover:bg-moon hover:text-night'
                : 'border-ink text-ink hover:bg-ink hover:text-paper',
            ].join(' ')}
          >
            {t('press')}
          </Link>
          <LanguageSwitcher onNight={onNight} />
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <LanguageSwitcher onNight={onNight} />
          <button
            type="button"
            data-testid="mobile-menu-button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? t('close') : t('menu')}
            onClick={() => setIsMenuOpen((v) => !v)}
            className={['flex h-11 w-11 items-center justify-center', onNight ? 'text-moon' : 'text-ink'].join(' ')}
          >
            <span className="relative block h-3.5 w-6" aria-hidden="true">
              <span className={['absolute left-0 h-px w-6 bg-current transition-all', isMenuOpen ? 'top-1.5 rotate-45' : 'top-0'].join(' ')} />
              <span className={['absolute left-0 h-px w-6 bg-current transition-all', isMenuOpen ? 'top-1.5 -rotate-45' : 'top-3'].join(' ')} />
            </span>
          </button>
        </div>
      </nav>

    </header>
      {isMenuOpen && (
        <MobileMenu items={[{key: 'home', href: '/'}, ...LINKS, {key: 'press', href: '/press'}]} t={t} onClose={() => setIsMenuOpen(false)} />
      )}
    </>
  );
}
