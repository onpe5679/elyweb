import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { BrandId } from '@/lib/brands';
import { HabomWordmark, LogoMark } from './Logo';

type Props = {
  brand: BrandId;
  logoSrc?: string | null;
  contactEmail?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
};

/** 푸터는 책의 판권지(colophon)처럼 읽힌다. */
export default async function SiteFooter({ brand, logoSrc, contactEmail, twitterUrl, youtubeUrl, instagramUrl }: Props) {
  const t = await getTranslations('Footer');
  const tn = await getTranslations('Nav');

  const social = [
    { label: 'X', url: twitterUrl },
    { label: 'YouTube', url: youtubeUrl },
    { label: 'Instagram', url: instagramUrl },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-ink/20 bg-paper-2">
      <div className="mx-auto max-w-page px-5 py-14 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            {brand === 'habom' ? (
              <HabomWordmark />
            ) : (
              <div className="flex items-center gap-3 text-ink">
                <LogoMark src={logoSrc} className="h-9 w-9" />
                <span className="font-display text-lg font-extrabold uppercase tracking-[.12em]">Studio Elysian</span>
              </div>
            )}
            <p className="mt-6 max-w-sm whitespace-pre-line break-keep text-[15px] leading-8 text-ink-2">
              {brand === 'habom' ? t('habomTagline') : t('tagline')}
            </p>
            {social.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12px] uppercase tracking-wider">
                {social.map((s) => (
                  <li key={s.label}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-u text-ink-2 hover:text-ink">
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label={t('sitemap')} className="md:col-span-4">
            <h2 className="t-eyebrow mb-4">{t('sitemap')}</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[15px]">
              <li><Link href="/games" className="link-u">{tn('works')}</Link></li>
              <li><Link href="/about" className="link-u">{tn('studio')}</Link></li>
              <li><Link href="/news" className="link-u">{tn('news')}</Link></li>
              <li><Link href="/habom" className="link-u">{tn('habom')}</Link></li>
              <li><Link href="/contact" className="link-u">{tn('contact')}</Link></li>
              <li><Link href="/press" className="link-u">{tn('press')}</Link></li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="t-eyebrow mb-4">{t('contactTitle')}</h2>
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="link-u break-all text-[15px]">
                {contactEmail}
              </a>
            )}
            <p className="mt-3 text-[13px] leading-6 text-ink-3">{t('contactNote')}</p>
          </div>
        </div>

        <div className="mt-14 border-t border-ink/15 pt-6 text-[12px] leading-6 text-ink-3">
          <p className="mb-1 font-mono uppercase tracking-wider">{t('colophon')}</p>
          <p>{t('legalName')} · {t('legalReg')} · {t('legalCeo')}</p>
          <p>{t('legalAddress')}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} Studio Elysian. All rights reserved.</p>
            <Link href="/privacy" className="link-u hover:text-ink">{t('privacy')}</Link>
          </div>
          {brand === 'habom' && <p className="mt-4 max-w-2xl text-ink-3">{t('habomNote')}</p>}
        </div>
      </div>
    </footer>
  );
}
