import { getTranslations } from 'next-intl/server';
import { getSettings, getLocalizedSettingValue } from '@/lib/supabase';
import { getLocale } from 'next-intl/server';
import { ContactForm } from '@/components/contact/ContactForm';

export default async function ContactPage() {
  const t = await getTranslations('Footer');
  const tPage = await getTranslations('ContactPage');
  const locale = await getLocale();

  const settings = await getSettings(['contact_email', 'twitter_url', 'youtube_url', 'instagram_url']);
  const contactEmail = getLocalizedSettingValue(settings.contact_email, locale) || 'contact@studioelysian.com';
  const twitterUrl = getLocalizedSettingValue(settings.twitter_url, locale) || 'https://twitter.com/studioelysian';
  const youtubeUrl = getLocalizedSettingValue(settings.youtube_url, locale) || 'https://youtube.com/@studioelysian';
  const instagramUrl = getLocalizedSettingValue(settings.instagram_url, locale) || 'https://instagram.com/studioelysian';

  const socials = [
    { label: 'Twitter', href: twitterUrl, icon: 'fa-brands fa-twitter' },
    { label: 'YouTube', href: youtubeUrl, icon: 'fa-brands fa-youtube' },
    { label: 'Instagram', href: instagramUrl, icon: 'fa-brands fa-instagram' },
  ];

  return (
    <div className="min-h-screen bg-paper pb-32 pt-36 md:pt-44">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="border-b border-ink pb-16">
          <p className="eyebrow">{tPage('eyebrow')}</p>
          <h1 className="font-display mt-6 text-6xl leading-none text-ink md:text-8xl">{t('contact')}</h1>
        </header>

        <div className="mt-20 grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="border border-rule bg-paper-raised p-6 sm:p-10 lg:col-span-7">
            <ContactForm inquiryLabel={t('contactLinks.inquiry')} />
          </div>

          <aside className="space-y-14 lg:col-span-4 lg:col-start-9">
            <section aria-labelledby="contact-info-heading">
              <h2 id="contact-info-heading" className="eyebrow">
                {tPage('infoTitle')}
              </h2>
              <dl className="mt-6 border-t border-ink">
                <div className="border-b border-rule py-6">
                  <dt className="text-xs font-bold uppercase tracking-[0.16em] text-ink-3">{tPage('emailLabel')}</dt>
                  <dd className="mt-3 flex items-center gap-3 font-display text-2xl leading-snug text-ink">
                    <i className="fa-solid fa-envelope flex-none text-base text-seal" aria-hidden="true"></i>
                    <span className="min-w-0 break-all">{contactEmail}</span>
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="contact-follow-heading">
              <h2 id="contact-follow-heading" className="eyebrow">
                {tPage('followTitle')}
              </h2>
              <ul className="mt-6 flex flex-wrap gap-3">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-12 w-12 items-center justify-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
                    >
                      <i className={`${social.icon} text-lg`} aria-hidden="true"></i>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
