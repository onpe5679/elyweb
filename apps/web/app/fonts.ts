import { Cormorant_Garamond, IBM_Plex_Mono } from 'next/font/google';

// Latin display/mono faces are self-hosted by next/font. Korean and Japanese faces load from
// Google Fonts CSS (see googleFontsHref) so browsers fetch only the unicode-range slices a page uses.
export const latin = Cormorant_Garamond({ weight: ['500', '600'], style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-latin', display: 'swap' });
export const mono = IBM_Plex_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const fontVariables = [latin.variable, mono.variable].join(' ');

const FAMILIES = {
  base: [
    'Noto+Serif+KR:wght@400;600;700',
    'IBM+Plex+Sans+KR:wght@400;500;600',
    'Jua',
    'M+PLUS+Rounded+1c:wght@500;700;800',
  ],
  ja: ['Noto+Serif+JP:wght@400;600;700', 'Noto+Sans+JP:wght@400;500;700'],
};

export function googleFontsHref(locale: string): string {
  const families = locale === 'ja' ? [...FAMILIES.base, ...FAMILIES.ja] : FAMILIES.base;
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join('&')}&display=swap`;
}
