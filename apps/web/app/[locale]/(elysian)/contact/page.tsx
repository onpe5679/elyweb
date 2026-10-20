import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PageHeader from '@/components/elysian/PageHeader';
import { SocialLinks } from '@/components/elysian/SiteFooter';
import { ContactForm } from '@/components/contact/ContactForm';
import { getLocalizedSettingValue, getSettings, isSnapshotMode } from '@/lib/supabase';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Contact' });
  return { title: t('title') };
}

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [t, ts, settings] = await Promise.all([
    getTranslations('Contact'),
    getTranslations('Site'),
    getSettings(['contact_email', 'twitter_url', 'youtube_url', 'instagram_url']),
  ]);
  const sv = (key: string) => getLocalizedSettingValue(settings[key], locale);
  const contactEmail = sv('contact_email');

  return (
    <>
      <PageHeader kicker={ts('studioName')} title={t('title')} latin={t('latin')} lead={t('lead')} />
      <div className="mx-auto grid max-w-page gap-16 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ContactForm isPreview={isSnapshotMode} />
        </div>
        <aside className="space-y-12 lg:col-span-4 lg:col-start-9">
          {contactEmail && (
            <div className="border-t-2 border-ink pt-5">
              <h2 className="label text-ink-mute">{t('direct')}</h2>
              <a href={`mailto:${contactEmail}`} className="mt-3 block break-all font-serif text-xl font-semibold">
                <span className="link-underline">{contactEmail}</span>
              </a>
            </div>
          )}
          <div className="border-t-2 border-ink pt-5">
            <h2 className="label text-ink-mute">{t('follow')}</h2>
            <SocialLinks
              tone="ink"
              className="mt-4"
              settings={{ contactEmail: '', twitterUrl: sv('twitter_url'), youtubeUrl: sv('youtube_url'), instagramUrl: sv('instagram_url') }}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
