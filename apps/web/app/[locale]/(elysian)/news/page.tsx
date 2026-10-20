import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import PageHeader from '@/components/elysian/PageHeader';
import XTimeline from '@/components/news/XTimeline';
import Icon from '@/components/ui/Icon';
import { getLocalizedField, getLocalizedSettingValue, getNews, getSetting } from '@/lib/supabase';

export const revalidate = 10;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('News');
  return { title: t('title') };
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  const [t, ts, modeSetting, handleSetting, newsItems] = await Promise.all([
    getTranslations('News'),
    getTranslations('Site'),
    getSetting('news_display_mode'),
    getSetting('news_widget_x_handle'),
    getNews(true),
  ]);

  const displayMode = getLocalizedSettingValue(modeSetting, locale) || 'manual';
  const xHandle = getLocalizedSettingValue(handleSetting, locale).replace(/^@/, '');
  const showWidget = (displayMode === 'widget' || displayMode === 'both') && !!xHandle;
  const showManual = displayMode === 'manual' || displayMode === 'both';
  const isEmpty = !showWidget && (!showManual || newsItems.length === 0);

  return (
    <>
      <PageHeader kicker={ts('studioName')} title={t('title')} latin={t('latin')} lead={showWidget ? t('lead') : undefined} />
      <div className="mx-auto max-w-page px-5 py-16 md:px-10 md:py-24">
        {showManual && newsItems.length > 0 && (
          <ol className="border-t border-ink">
            {newsItems.map((item) => (
              <li key={item.id} className="border-b border-ink/20">
                <Link href={`/news/${item.slug}`} className="group grid items-center gap-6 py-8 md:grid-cols-12">
                  <span className="font-mono text-sm text-accent md:col-span-2">{formatDate(item.published_at)}</span>
                  <span className="font-serif text-xl font-semibold leading-snug md:col-span-7 md:text-2xl">
                    <span className="link-underline">{getLocalizedField(item, 'title', locale)}</span>
                  </span>
                  {item.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.cover_image} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover md:col-span-3" />
                  ) : (
                    <Icon name="arrowRight" size={20} className="md:col-span-3 md:justify-self-end" />
                  )}
                </Link>
              </li>
            ))}
          </ol>
        )}

        {showWidget && (
          <div className={`grid gap-10 lg:grid-cols-12 ${showManual && newsItems.length ? 'mt-20' : ''}`}>
            <div className="lg:col-span-4">
              <p className="label text-ink-mute">X</p>
              <p className="mt-3 font-serif text-2xl font-semibold">@{xHandle}</p>
              <a href={`https://x.com/${xHandle}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-[48px] items-center gap-2 border border-ink px-5 text-[0.9375rem] transition-colors hover:bg-ink hover:text-paper">
                <Icon name="x" size={16} /> {t('xOpen')} <Icon name="arrowUpRight" size={14} />
              </a>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <XTimeline handle={xHandle} />
            </div>
          </div>
        )}

        {isEmpty && <p className="py-16 text-center text-ink-soft">{t('empty')}</p>}
      </div>
    </>
  );
}
