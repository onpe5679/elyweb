import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getSettings } from '@/lib/supabase';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: 'Studio Elysian', template: '%s · Studio Elysian' },
  description: 'For Story-Lovers, By Storytellers',
};

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#F5F5F1' }],
};

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

// 서체: 엘리시안(Hahmlet + Noto Serif KR 명조 + Cormorant Garamond + Noto Sans + IBM Plex Mono)
//       하봄(Jua + M PLUS Rounded 1c + Gowun Dodum)
const FONT_CSS =
  'https://fonts.googleapis.com/css2' +
  '?family=Hahmlet:wght@400;600;800' +
  '&family=Noto+Serif+KR:wght@300;400;500;600' +
  '&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500' +
  '&family=Shippori+Mincho:wght@400;500;800' +
  '&family=Noto+Sans+KR:wght@400;500;700' +
  '&family=Noto+Sans+JP:wght@400;500;700' +
  '&family=IBM+Plex+Mono:wght@400;500' +
  '&family=Jua&family=Gowun+Dodum&family=M+PLUS+Rounded+1c:wght@400;500;700;800' +
  '&display=swap';

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  if (!routing.locales.includes(locale as 'ko' | 'en' | 'ja')) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();
  const settings = await getSettings(['favicon']);
  const faviconUrl = settings.favicon?.value_ko;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 종이(밝은) 테마 하나만 쓴다. Dark Reader 같은 확장이 색 변수(RGB 3값)를 잘못 읽어
            화면 전체를 붉은 갈색으로 칠하는 문제가 있어, 이 사이트에는 적용하지 않도록 잠근다. */}
        <meta name="darkreader-lock" />
        <link rel="icon" href={faviconUrl || '/favicon.svg'} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONT_CSS} rel="stylesheet" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
