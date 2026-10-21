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

// 서체: 엘리시안(Hahmlet 명조 + Noto Sans + IBM Plex Mono) / 하봄(Jua + Gowun Dodum)
const FONT_CSS =
  'https://fonts.googleapis.com/css2' +
  '?family=Hahmlet:wght@400;600;800' +
  '&family=Shippori+Mincho:wght@500;800' +
  '&family=Noto+Sans+KR:wght@400;500;700' +
  '&family=Noto+Sans+JP:wght@400;500;700' +
  '&family=IBM+Plex+Mono:wght@400;500' +
  '&family=Jua&family=Gowun+Dodum&family=M+PLUS+Rounded+1c:wght@400;700' +
  '&display=swap';

// 첫 페인트 전에 저장된 테마(종이/밤)를 적용한다.
const THEME_INIT = `try{var t=localStorage.getItem('se-theme');if(t==='night')document.documentElement.setAttribute('data-theme','night')}catch(e){}`;

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
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
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
