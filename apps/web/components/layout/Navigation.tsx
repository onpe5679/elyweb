'use client';

import {Link} from '@/i18n/routing';
import {useTranslations} from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import {useState} from 'react';

interface NavigationProps {
  logoImage?: string | null;
  logoIcon?: string;
}

export default function Navigation({ logoImage, logoIcon }: NavigationProps) {
  const t = useTranslations('Navigation');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
                <div className="flex-shrink-0 flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        {(logoImage || logoIcon) ? (
                            <img src={logoImage || logoIcon} alt="Logo" className="w-10 h-10 rounded-full object-cover shadow-lg" />
                        ) : (
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                <i className="fa-solid fa-gamepad"></i>
                            </div>
                        )}
                        <span className="font-display font-bold text-xl tracking-wider uppercase text-gray-900 dark:text-white">
                            Studio Elysian
                        </span>
                    </Link>
                </div>
                <div className="hidden md:flex space-x-8 items-center">
                    <Link className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" href="/">{t('home')}</Link>
                    <Link className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" href="/about">{t('about')}</Link>
                    <Link className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" href="/news">{t('news')}</Link>
                    <Link className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" href="/games">{t('games')}</Link>
                    <Link className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors" href="/contact">{t('contact')}</Link>
                    <Link className="px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-opacity-90 transition-all shadow-md" href="/press">{t('press')}</Link>
                    <LanguageSwitcher />
                </div>
                <div className="md:hidden flex items-center gap-4">
                    <LanguageSwitcher />
                    <button 
                        data-testid="mobile-menu-button"
                        className="text-gray-700 dark:text-gray-300 hover:text-primary focus:outline-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <i className="fa-solid fa-bars text-2xl"></i>
                    </button>
                </div>
            </div>
        </div>
        {isMobileMenuOpen && (
            <div data-testid="mobile-menu" className="md:hidden bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary" href="/" onClick={() => setIsMobileMenuOpen(false)}>{t('home')}</Link>
                    <Link className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary" href="/about" onClick={() => setIsMobileMenuOpen(false)}>{t('about')}</Link>
                    <Link className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary" href="/news" onClick={() => setIsMobileMenuOpen(false)}>{t('news')}</Link>
                    <Link className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary" href="/games" onClick={() => setIsMobileMenuOpen(false)}>{t('games')}</Link>
                    <Link className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary" href="/contact" onClick={() => setIsMobileMenuOpen(false)}>{t('contact')}</Link>
                    <Link className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary" href="/press" onClick={() => setIsMobileMenuOpen(false)}>{t('press')}</Link>
                </div>
            </div>
        )}
    </nav>
  );
}
