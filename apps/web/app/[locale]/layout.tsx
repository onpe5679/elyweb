import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getSetting } from '@/lib/supabase';
import { fontVariables, googleFontsHref } from '../fonts';
import '../globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const favicon = await getSetting('favicon');
  return {
    title: { default: 'Studio Elysian', template: '%s — Studio Elysian' },
    description: 'For Story-Lovers, By Storytellers',
    icons: favicon?.value_ko ? { icon: favicon.value_ko } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: '#F4F0E8',
};

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  setRequestLocale(locale);
  if (!routing.locales.includes(locale as 'ko' | 'en' | 'ja')) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html lang={locale} className={fontVariables}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={googleFontsHref(locale)} />
      </head>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
