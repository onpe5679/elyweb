import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getLocalizedSettingValue, getNews, getSettings } from '@/lib/supabase';
import Shell from '@/components/shell/Shell';
import PageHeader from '@/components/pages/PageHeader';
import NewsView from '@/components/pages/NewsView';

export const revalidate = 10;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const tm = await getTranslations({ locale, namespace: 'News' });
  return { title: tm('metaTitle') };
}

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [t, items, s] = await Promise.all([
    getTranslations('News'),
    getNews(true),
    getSettings(['news_display_mode', 'news_widget_x_handle', 'twitter_url']),
  ]);

  // 표시 방식은 어드민 설정(news_display_mode / news_widget_x_handle)을 따른다.
  const displayMode = getLocalizedSettingValue(s.news_display_mode, locale) || 'manual';
  const handle = getLocalizedSettingValue(s.news_widget_x_handle, locale).replace(/^@/, '');
  const showWidget = (displayMode === 'widget' || displayMode === 'both') && !!handle;
  const showManual = displayMode === 'manual' || displayMode === 'both';

  // 빈 화면에서 이어 줄 X 주소: 위젯 계정 → 공식 X 링크 설정
  const xUrl = handle ? `https://x.com/${handle}` : getLocalizedSettingValue(s.twitter_url, locale) || undefined;

  return (
    <Shell locale={locale}>
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} />
      <NewsView locale={locale} items={items} handle={handle} showWidget={showWidget} showManual={showManual} xUrl={xUrl} />
    </Shell>
  );
}
