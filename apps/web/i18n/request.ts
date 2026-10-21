import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

// 메시지는 영역별 파일(messages/<locale>/<area>.json)로 나누어 한 객체로 합친다.
export const MESSAGE_AREAS = ['common', 'home', 'works', 'habom', 'pages'] as const;

export async function loadMessages(locale: string) {
  const parts = await Promise.all(
    MESSAGE_AREAS.map(async (area) => (await import(`../messages/${locale}/${area}.json`)).default)
  );
  return Object.assign({}, ...parts);
}

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await loadMessages(locale)
  };
});
