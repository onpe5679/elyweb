import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Icon from '@/components/ui/Icon';
import ElysianMark from './ElysianMark';
import { NAV_ITEMS } from './nav';

export type FooterSettings = {
  contactEmail: string;
  twitterUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
};

// Legal company details are published in Korean on every locale.
export const COMPANY_LINES = [
  ['상호', '주식회사 스튜디오엘리시안'],
  ['사업자등록번호', '373-81-03729'],
  ['대표자', '우현제'],
  ['주소', '경기도 성남시 분당구 대왕판교로645번길 12, 6층 27호 (삼평동, 경기창조경제혁신센터)'],
  ['연락처', '010-5344-0783'],
  ['이메일', 'stdelysian@gmail.com'],
] as const;

export function SocialLinks({ settings, className = '', tone = 'night' }: { settings: FooterSettings; className?: string; tone?: 'night' | 'ink' }) {
  const box = `flex h-11 w-11 items-center justify-center border transition-colors ${tone === 'night' ? 'border-on-night/25 hover:border-on-night hover:bg-on-night/5' : 'border-ink/25 hover:border-ink hover:bg-ink/5'}`;
  const t = useTranslations('Site');
  const links = [
    { href: settings.twitterUrl, icon: 'x' as const, label: 'X' },
    { href: settings.youtubeUrl, icon: 'youtube' as const, label: 'YouTube' },
    { href: settings.instagramUrl, icon: 'instagram' as const, label: 'Instagram' },
  ].filter((l) => l.href);
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((l) => (
        <li key={l.label}>
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${l.label} (${t('external')})`}
            className={box}
          >
            <Icon name={l.icon} size={18} />
          </a>
        </li>
      ))}
      {settings.contactEmail && (
        <li>
          <a href={`mailto:${settings.contactEmail}`} aria-label={settings.contactEmail} className={box}>
            <Icon name="mail" size={18} />
          </a>
        </li>
      )}
    </ul>
  );
}

export default function SiteFooter({ settings }: { settings: FooterSettings }) {
  const t = useTranslations('Footer');
  const ts = useTranslations('Site');

  return (
    <footer className="on-night bg-night text-on-night">
      <div className="mx-auto max-w-page px-5 pb-10 pt-20 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="flex items-center gap-3">
              <ElysianMark tone="paper" className="h-9 w-9" />
              <span className="font-latin text-xl font-semibold uppercase tracking-[0.16em]">Studio Elysian</span>
            </div>
            <p className="mt-6 max-w-sm whitespace-pre-line font-serif text-[0.9375rem] leading-relaxed text-on-night-mute">{t('desc')}</p>
            <SocialLinks settings={settings} className="mt-8" />
          </div>

          <nav aria-label={t('site')} className="md:col-span-3">
            <h2 className="label text-on-night-mute">{t('site')}</h2>
            <ul className="mt-5 space-y-2.5 text-[0.9375rem]">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline">{ts(item.key)}</Link>
                </li>
              ))}
              <li>
                <Link href="/habom" className="link-underline">{ts('habom')}</Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="label text-on-night-mute">{t('colophon')}</h2>
            <dl className="mt-5 space-y-2 text-[0.8125rem] leading-relaxed text-on-night-mute" lang="ko">
              {COMPANY_LINES.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-2">
                  <dt className="text-on-night-mute/80">{k}</dt>
                  <dd className="text-on-night">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-on-night/15 pt-6 text-[0.75rem] text-on-night-mute md:flex-row md:items-center md:justify-between">
          <p className="font-mono tracking-wide">{t('rights')}</p>
          <Link href="/privacy" className="link-underline self-start text-on-night md:self-auto">{t('privacy')}</Link>
        </div>
      </div>
    </footer>
  );
}
