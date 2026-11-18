import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getLocalizedSettingValue, getSettings } from '@/lib/supabase';
import LanguageSwitcher from '@/components/shell/LanguageSwitcher';
import HabomMobileMenu from './HabomMobileMenu';
import HabomWordmark from './HabomWordmark';
import Icon from './Icon';

/**
 * 하봄 스튜디오 화면의 틀(시안 C): 크림 배경 + 둥근 알약 메뉴 + 플럼색 푸터.
 * 엘리시안의 Shell 과 따로 두어, 나중에 하봄을 별도 도메인으로 떼어 내도 이 틀만 옮기면 된다.
 * data-brand="habom" 은 공용 부품(언어 전환·포커스 링 등)의 색 토큰을 하봄 색으로 바꾼다.
 */
export default async function HabomShell({ locale, children }: { locale: string; children: React.ReactNode }) {
  const [t, tf, tc, tn, settings] = await Promise.all([
    getTranslations('Habom'),
    getTranslations('Footer'),
    getTranslations('Common'),
    getTranslations('Nav'),
    getSettings(['contact_email']),
  ]);
  const email = getLocalizedSettingValue(settings.contact_email, locale);
  const legal = [tf('legalName'), tf('legalReg'), tf('legalCeo'), tf('legalAddress')];

  return (
    <div data-brand="habom" className="flex min-h-screen flex-col bg-cream text-plum">
      <a href="#main" className="skip-link">{t('skip')}</a>

      <header className="habom-header sticky top-0 z-40 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-page items-center gap-3 px-4 md:gap-4 md:px-10">
          <Link href="/habom" aria-label={`${t('name')} — ${t('home')}`} className="shrink-0">
            <HabomWordmark localName={t('name')} />
          </Link>
          <nav aria-label={tc('mainNav')} className="ml-auto hidden sm:block">
            <ul className="flex items-center gap-1 text-[0.875rem] font-semibold">
              <li><Link href="/habom#works" className="rounded-full px-4 py-2 hover:bg-blush">{t('navWorks')}</Link></li>
              <li><Link href="/habom#about" className="rounded-full px-4 py-2 hover:bg-blush">{t('navAbout')}</Link></li>
            </ul>
          </nav>
          <Link
            href="/"
            data-testid="habom-to-elysian"
            aria-label={t('backLong')}
            className="ml-auto inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-3 text-[0.8125rem] font-semibold ring-1 ring-plum/10 hover:ring-plum/30 sm:ml-0 sm:px-3.5"
          >
            {/* 좁은 화면에서는 줄여서 보여 준다: 화살표만(400px 미만) → "엘리시안"(640px 미만) → "스튜디오 엘리시안" */}
            <Icon name="arrowLeft" size={14} />
            <span className="hidden min-[400px]:inline sm:hidden">{t('backShort')}</span>
            <span className="hidden sm:inline">{t('back')}</span>
          </Link>
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <HabomMobileMenu
            labels={{ works: t('navWorks'), about: t('navAbout'), open: tc('openMenu'), close: tc('closeMenu'), nav: tc('mainNav'), language: tc('language') }}
          />
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
              <p className="mt-1 font-round text-lg text-cream/75">{t('name')}</p>
              <p className="mt-4 max-w-sm text-[0.875rem] leading-relaxed text-cream/75">{t('rights')}</p>
              <p className="mt-2 text-[0.75rem] text-cream/60">※ {t('wordmarkNote')}</p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Link href="/" className="inline-flex min-h-[48px] items-center gap-2 self-start rounded-full bg-cream px-5 text-[0.9375rem] font-semibold text-plum md:self-auto">
                <Icon name="arrowLeft" size={16} /> {t('backLong')}
              </Link>
              <div className="flex flex-wrap gap-2">
                <Link href="/contact" className="rounded-full px-4 py-2 text-[0.875rem] ring-1 ring-cream/30 hover:ring-cream">{tn('contact')}</Link>
                <Link href="/privacy" className="rounded-full px-4 py-2 text-[0.875rem] ring-1 ring-cream/30 hover:ring-cream">{tf('privacy')}</Link>
              </div>
              {email && (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-[0.875rem] text-cream/80 hover:text-cream">
                  <Icon name="mail" size={16} /> {email}
                </a>
              )}
              <div className="mt-1 rounded-full bg-cream px-3 md:hidden">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          <p className="mt-12 border-t border-cream/15 pt-6 text-[0.75rem] leading-relaxed text-cream/60">
            {legal.join(' · ')}
          </p>
        </div>
      </footer>
    </div>
  );
}
