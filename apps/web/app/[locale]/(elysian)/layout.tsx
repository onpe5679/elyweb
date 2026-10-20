import { getTranslations, setRequestLocale } from 'next-intl/server';
import SiteHeader from '@/components/elysian/SiteHeader';
import SiteFooter from '@/components/elysian/SiteFooter';
import { getLocalizedSettingValue, getSettings } from '@/lib/supabase';

export default async function ElysianLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
  setRequestLocale(locale);
  const [t, settings] = await Promise.all([
    getTranslations('Site'),
    getSettings(['contact_email', 'twitter_url', 'youtube_url', 'instagram_url']),
  ]);

  return (
    <div className="theme-elysian flex min-h-screen flex-col bg-paper text-ink">
      <a href="#main" className="sr-only z-50 bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {t('skip')}
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter
        settings={{
          contactEmail: getLocalizedSettingValue(settings.contact_email, locale),
          twitterUrl: getLocalizedSettingValue(settings.twitter_url, locale),
          youtubeUrl: getLocalizedSettingValue(settings.youtube_url, locale),
          instagramUrl: getLocalizedSettingValue(settings.instagram_url, locale),
        }}
      />
    </div>
  );
}
