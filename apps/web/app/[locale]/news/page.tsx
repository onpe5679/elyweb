import { getTranslations } from 'next-intl/server';
import { getNews, getLocalizedField, getSetting, getLocalizedSettingValue } from '@/lib/supabase';
import { Link } from '@/i18n/routing';
import XTimeline from '@/components/news/XTimeline';

export const revalidate = 10;

const DEFAULT_NEWS_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVHPTFZPasBZtcFBFsRlZf4vhSmH0uyRPHid_2dtW6N7nVFHK8qMryYJvTPiapEcHt3v__ZGBVm0pq9Ksh-4PNTtSOeIa2biWszDq-Vy1yAkc_QJKfml8I4kAhrKW_WXbHpZmFcWdKPw9ehmpkc6YkK9DBZaN_6DYjmUnwbjc9eOVDfDt1JR0eb5raAdiIelbQWh9ifO-cPkPWFf4ifVhmOI6IGXOrmlJK8cMuMKCkUDJg4L6Ziv-mYRjLAOvB_c2f6hnmdxTlyvQ';

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default async function NewsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [t, tPage, modeSetting, handleSetting, newsItems] = await Promise.all([
    getTranslations('Navigation'),
    getTranslations('NewsPage'),
    getSetting('news_display_mode'),
    getSetting('news_widget_x_handle'),
    getNews(true),
  ]);

  const displayMode = getLocalizedSettingValue(modeSetting, locale) || 'manual';
  const xHandle = getLocalizedSettingValue(handleSetting, locale);
  const showWidget = (displayMode === 'widget' || displayMode === 'both') && !!xHandle;
  const showManual = displayMode === 'manual' || displayMode === 'both';
  const isEmpty = !showWidget && (!showManual || newsItems.length === 0);

  return (
    <div className="min-h-screen bg-paper pb-32 pt-36 md:pt-44">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="border-b border-ink pb-16">
          <p className="eyebrow">{tPage('eyebrow')}</p>
          <h1 className="font-display mt-6 text-6xl leading-none text-ink md:text-8xl">{t('news')}</h1>
        </header>

        {showWidget && (
          <section aria-labelledby="news-widget-heading" className="mt-20 grid gap-10 md:grid-cols-12">
            <h2 id="news-widget-heading" className="eyebrow md:col-span-3">
              {tPage('widgetTitle')}
            </h2>
            <div className="md:col-span-8 md:col-start-5">
              <XTimeline handle={xHandle} />
            </div>
          </section>
        )}

        {showManual && newsItems.length > 0 && (
          <ul className="mt-20 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <li key={item.id}>
                <Link href={`/news/${item.slug}`} className="group block">
                  <article>
                    <div className="aspect-[16/10] overflow-hidden bg-paper-alt">
                      <img
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        src={item.cover_image || DEFAULT_NEWS_IMAGE}
                      />
                    </div>
                    <div className="mt-6 border-t border-rule pt-6">
                      <p className="text-xs font-bold tabular-nums tracking-[0.16em] text-seal">
                        {formatDate(item.published_at)}
                      </p>
                      <h3 className="font-display mt-3 text-2xl leading-snug text-ink transition-colors group-hover:text-seal">
                        {getLocalizedField(item, 'title', locale)}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-2">
                        {getLocalizedField(item, 'excerpt', locale) || getLocalizedField(item, 'content', locale)}
                      </p>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {isEmpty && <p className="mt-20 border-t border-rule pt-10 text-ink-3">{tPage('empty')}</p>}
      </div>
    </div>
  );
}
