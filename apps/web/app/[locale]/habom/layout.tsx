import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import Icon from '@/components/ui/Icon';
import HabomWordmark from '@/components/habom/HabomWordmark';
import { COMPANY_LINES } from '@/components/elysian/SiteFooter';
import { LABELS } from '@/lib/labels';

// Habom Studio has its own chrome and theme. It lives under /habom so it could later be
// served from its own sub-domain with a middleware rewrite, without touching these pages.
export default async function HabomLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  setRequestLocale(locale);
  const [t, ts, tf] = await Promise.all([getTranslations('Habom'), getTranslations('Site'), getTranslations('Footer')]);
  const localName = LABELS.habom.localName[locale] || LABELS.habom.name;

  return (
    <div className="theme-habom flex min-h-screen flex-col bg-cream text-plum">
      <a href="#main" className="sr-only z-50 rounded-full bg-plum px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {ts('skip')}
      </a>
      <header className="fixed inset-x-0 top-0 z-40 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-page items-center gap-4 px-4 md:px-10">
          <Link href="/habom" aria-label={`${localName} — ${ts('home')}`}>
            <HabomWordmark localName={localName} />
          </Link>
          <nav aria-label={ts('mainNav')} className="ml-auto hidden md:block">
            <ul className="flex items-center gap-1 text-[0.875rem] font-semibold">
              <li><Link href="/habom#works" className="rounded-full px-4 py-2 hover:bg-blush">{t('navWorks')}</Link></li>
              <li><Link href="/habom#about" className="rounded-full px-4 py-2 hover:bg-blush">{t('navAbout')}</Link></li>
            </ul>
          </nav>
          <Link href="/" className="ml-auto inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-white px-3.5 text-[0.8125rem] font-semibold ring-1 ring-plum/10 hover:ring-plum/30 md:ml-0">
            <Icon name="arrowLeft" size={14} /> <span className="hidden sm:inline">{t('back')}</span><span className="sm:hidden">Elysian</span>
          </Link>
          <LanguageSwitch className="hidden sm:flex" />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <footer className="relative overflow-hidden bg-plum text-cream">
        <span aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-rose/30" />
        <div className="relative mx-auto max-w-page px-5 pb-10 pt-16 md:px-10">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="font-round-latin text-2xl font-extrabold">habom studio</p>
              <p className="mt-1 font-round text-lg text-on-night-mute">{localName}</p>
              <p className="mt-4 max-w-sm text-[0.875rem] leading-relaxed text-on-night-mute">{t('rights')}</p>
              <p className="mt-2 text-[0.75rem] text-on-night-mute/80">※ {t('wordmarkNote')}</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Link href="/" className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-cream px-5 text-[0.9375rem] font-semibold text-plum">
                <Icon name="arrowLeft" size={16} /> {t('backLong')}
              </Link>
              <div className="flex gap-2">
                <Link href="/contact" className="rounded-full px-4 py-2 text-[0.875rem] ring-1 ring-cream/30 hover:ring-cream">{ts('contact')}</Link>
                <Link href="/privacy" className="rounded-full px-4 py-2 text-[0.875rem] ring-1 ring-cream/30 hover:ring-cream">{tf('privacy')}</Link>
              </div>
              <LanguageSwitch tone="night" className="mt-2 text-cream sm:hidden" />
            </div>
          </div>
          <p className="mt-12 border-t border-cream/15 pt-6 text-[0.75rem] leading-relaxed text-on-night-mute" lang="ko">
            {COMPANY_LINES.map(([k, v]) => `${k} ${v}`).join(' · ')}
          </p>
        </div>
      </footer>
    </div>
  );
}
