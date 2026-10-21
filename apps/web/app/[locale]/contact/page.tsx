import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getLocalizedSettingValue, getSettings } from '@/lib/supabase';
import Shell from '@/components/shell/Shell';
import { ContactForm } from '@/components/contact/ContactForm';
import PageHeader from '@/components/pages/PageHeader';
import { ArrowUpRightIcon, SocialIcon } from '@/components/pages/Icons';
import { handleOf, safeUrl } from '@/components/pages/text';

export const revalidate = 10;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const tm = await getTranslations({ locale, namespace: 'Contact' });
  return { title: tm('metaTitle') };
}

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [t, tp, s] = await Promise.all([
    getTranslations('Contact'),
    getTranslations('Pages'),
    getSettings(['contact_email', 'twitter_url', 'youtube_url', 'instagram_url']),
  ]);

  const email = getLocalizedSettingValue(s.contact_email, locale);
  const social = [
    { id: 'x', label: 'X', url: safeUrl(getLocalizedSettingValue(s.twitter_url, locale)) },
    { id: 'youtube', label: 'YouTube', url: safeUrl(getLocalizedSettingValue(s.youtube_url, locale)) },
    { id: 'instagram', label: 'Instagram', url: safeUrl(getLocalizedSettingValue(s.instagram_url, locale)) },
  ].filter((x): x is { id: string; label: string; url: string } => !!x.url);

  return (
    <Shell locale={locale}>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} />

      <section aria-labelledby="form-title" className="border-t border-ink/15">
        <div className="mx-auto grid max-w-page gap-14 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
          <div className="md:col-span-7">
            <h2 id="form-title" className="t-display mb-10 text-[clamp(26px,3.4vw,42px)]">{t('form.title')}</h2>
            <ContactForm contactEmail={email || undefined} />
          </div>

          <aside aria-labelledby="info-title" className="md:col-span-4 md:col-start-9">
            <p className="t-eyebrow">{t('info.eyebrow')}</p>
            <h2 id="info-title" className="t-display mt-4 text-[clamp(22px,2.4vw,30px)]">{t('info.title')}</h2>

            {email && (
              <dl className="mt-8 border-t border-ink">
                <div className="border-b border-ink/15 py-5">
                  <dt className="t-eyebrow">{t('info.email')}</dt>
                  <dd className="mt-2">
                    <a href={`mailto:${email}`} className="link-u break-all font-display text-[clamp(20px,2vw,26px)] font-extrabold">{email}</a>
                  </dd>
                </div>
              </dl>
            )}

            {social.length > 0 && (
              <div className={email ? 'mt-8' : 'mt-8 border-t border-ink pt-5'}>
                <h3 className="t-eyebrow">{t('info.follow')}</h3>
                <ul className="mt-3 border-t border-ink/15">
                  {social.map((x) => (
                    <li key={x.id} className="border-b border-ink/15">
                      <a
                        href={x.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-[56px] items-center gap-4 py-2 transition-colors hover:text-accent-text"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center border border-ink/60 transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                          <SocialIcon id={x.id} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-bold leading-5">{x.label}</span>
                          <span className="block break-all font-mono text-[12px] leading-5 text-ink-3">{handleOf(x.url)}</span>
                        </span>
                        <ArrowUpRightIcon className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        <span className="sr-only">{tp('external')}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </Shell>
  );
}
