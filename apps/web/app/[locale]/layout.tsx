import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
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

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  if (!routing.locales.includes(locale as 'ko' | 'en' | 'ja')) {
    notFound();
  }

  const messages = await getMessages();
  const settings = await getSettings(['contact_email', 'twitter_url', 'youtube_url', 'instagram_url', 'favicon', 'logo_image', 'logo_icon']);
  
  const footerSettings = {
    contactEmail: getLocalizedSettingValue(settings.contact_email, locale) || 'contact@studioelysian.com',
    twitterUrl: getLocalizedSettingValue(settings.twitter_url, locale) || 'https://twitter.com/studioelysian',
    youtubeUrl: getLocalizedSettingValue(settings.youtube_url, locale) || 'https://youtube.com/@studioelysian',
    instagramUrl: getLocalizedSettingValue(settings.instagram_url, locale) || 'https://instagram.com/studioelysian',
    logoImage: settings.logo_image?.value_ko || null,
    logoIcon: settings.logo_icon?.value_ko || 'fa-solid fa-book-open',
  };
  
  const faviconUrl = settings.favicon?.value_ko;

  return (
    <html lang={locale} className="dark">
      <head>
        {faviconUrl && <link rel="icon" href={faviconUrl} />}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Montserrat:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-body transition-colors duration-300">
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Navigation logoImage={footerSettings.logoImage} logoIcon={footerSettings.logoIcon} />
            <main className="flex-grow">
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
