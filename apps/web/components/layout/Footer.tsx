'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';

interface FooterProps {
  settings: {
    contactEmail: string;
    twitterUrl: string;
    youtubeUrl: string;
    instagramUrl: string;
    logoImage?: string | null;
    logoIcon?: string | null;
  };
}

export default function Footer({settings}: FooterProps) {
  const t = useTranslations('Footer');
  const mark = settings.logoImage || settings.logoIcon;

  const socials = [
    {href: settings.twitterUrl, icon: 'fa-brands fa-x-twitter', label: 'X'},
    {href: settings.youtubeUrl, icon: 'fa-brands fa-youtube', label: 'YouTube'},
    {href: settings.instagramUrl, icon: 'fa-brands fa-instagram', label: 'Instagram'},
  ].filter((s) => s.href);

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="flex items-center gap-3">
              {mark ? (
                <img src={mark} alt="" className="h-10 w-10 object-contain invert" />
              ) : null}
              <span className="font-display text-2xl font-semibold uppercase tracking-[0.2em]">Studio Elysian</span>
            </div>
            <p className="mt-6 max-w-md whitespace-pre-line text-sm leading-relaxed text-paper/70">
              {t('desc')}
            </p>
            {(socials.length > 0 || settings.contactEmail) && (
              <ul className="mt-8 flex gap-6 text-paper/80" aria-label="SNS">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="inline-flex h-10 w-10 items-center justify-center border border-paper/20 transition-colors hover:border-paper hover:text-white"
                    >
                      <i className={`${s.icon} text-base`} aria-hidden="true" />
                    </a>
                  </li>
                ))}
                {settings.contactEmail && (
                  <li>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      aria-label="Email"
                      className="inline-flex h-10 w-10 items-center justify-center border border-paper/20 transition-colors hover:border-paper hover:text-white"
                    >
                      <i className="fa-solid fa-envelope text-base" aria-hidden="true" />
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>

          <div className="md:col-span-3">
            <h2 className="eyebrow !text-paper/60">{t('quickLinks')}</h2>
            <ul className="mt-5 space-y-3 text-sm text-paper/85">
              <li><Link className="transition-colors hover:text-white" href="/about">{t('links.about')}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/games">{t('links.projects')}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/news">{t('links.news')}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/hobom">{t('hobom')}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="eyebrow !text-paper/60">{t('contact')}</h2>
            <ul className="mt-5 space-y-3 text-sm text-paper/85">
              <li><Link className="transition-colors hover:text-white" href="/contact">{t('contactLinks.inquiry')}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/press">PRESS</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 space-y-1 border-t border-paper/15 pt-8 text-xs leading-relaxed text-paper/55">
          <p>상호(법인명) : 주식회사 스튜디오엘리시안 | 사업자 등록번호 : 373-81-03729 | 대표자 : 우현제</p>
          <p>주소 : 경기도 성남시 분당구 대왕판교로645번길 12, 6층 27호(삼평동, 경기창조경제혁신센터)</p>
          <p>연락처 : 010-5344-0783 | 이메일 : stdelysian@gmail.com</p>
        </div>
        <div className="mt-6 flex flex-col items-start justify-between gap-4 text-xs text-paper/60 md:flex-row md:items-center">
          <p>{t('rights')}</p>
          <Link className="underline underline-offset-4 transition-colors hover:text-white" href="/privacy">
            {t('privacy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
