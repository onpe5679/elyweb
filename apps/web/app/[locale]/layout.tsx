import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { getSettings, getLocalizedSettingValue } from '@/lib/supabase';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Studio Elysian',
  description: 'For Story-Lovers, By Storytellers',
};

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

const FONT_HREF =
  'https://fonts.googleapis.com/css2' +
  '?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500' +
  '&family=Noto+Serif+KR:wght@400;600;700;900' +
  '&family=Noto+Serif+JP:wght@400;700;900' +
  '&family=Noto+Sans+KR:wght@300;400;500;700' +
  '&family=Noto+Sans+JP:wght@400;500;700' +
  '&family=Gowun+Dodum' +
  '&family=M+PLUS+Rounded+1c:wght@400;700;800' +
  '&family=Nunito:wght@400;700;800' +
  '&display=swap';

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  if (!routing.locales.includes(locale as 'ko' | 'en' | 'ja')) {
    notFound();
  }

  const messages = await getMessages();
  const tNav = await getTranslations({ locale, namespace: 'Navigation' });
  const settings = await getSettings(['contact_email', 'twitter_url', 'youtube_url', 'instagram_url', 'favicon', 'logo_image', 'logo_icon']);

  const footerSettings = {
    contactEmail: getLocalizedSettingValue(settings.contact_email, locale),
    twitterUrl: getLocalizedSettingValue(settings.twitter_url, locale),
    youtubeUrl: getLocalizedSettingValue(settings.youtube_url, locale),
    instagramUrl: getLocalizedSettingValue(settings.instagram_url, locale),
    logoImage: settings.logo_image?.value_ko || null,
    logoIcon: settings.logo_icon?.value_ko || null,
  };

  const faviconUrl = settings.favicon?.value_ko;

  return (
    <html lang={locale}>
      <head>
        {faviconUrl && <link rel="icon" href={faviconUrl} />}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONT_HREF} rel="stylesheet" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <a href="#main" className="skip-link">{tNav('skip')}</a>
          <div className="min-h-screen flex flex-col">
            <Navigation logoImage={footerSettings.logoImage} logoIcon={footerSettings.logoIcon} />
            <main id="main" className="flex-grow">
              {children}
            </main>
            <Footer settings={footerSettings} />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
