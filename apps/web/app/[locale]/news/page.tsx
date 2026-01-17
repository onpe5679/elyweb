import { getTranslations } from 'next-intl/server';
import { getNews, getLocalizedField } from '@/lib/supabase';
import Link from 'next/link';

const DEFAULT_NEWS_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVHPTFZPasBZtcFBFsRlZf4vhSmH0uyRPHid_2dtW6N7nVFHK8qMryYJvTPiapEcHt3v__ZGBVm0pq9Ksh-4PNTtSOeIa2biWszDq-Vy1yAkc_QJKfml8I4kAhrKW_WXbHpZmFcWdKPw9ehmpkc6YkK9DBZaN_6DYjmUnwbjc9eOVDfDt1JR0eb5raAdiIelbQWh9ifO-cPkPWFf4ifVhmOI6IGXOrmlJK8cMuMKCkUDJg4L6Ziv-mYRjLAOvB_c2f6hnmdxTlyvQ';

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default async function NewsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('Navigation');
  const newsItems = await getNews(true);

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">
            Latest Updates
          </h4>
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white">
            {t('news')}
          </h1>
        </div>

        {newsItems.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-16">
            아직 등록된 소식이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/news/${item.slug}`}
                className="group"
              >
                <article className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                  <div className="h-48 overflow-hidden">
                    <img
                      alt={getLocalizedField(item, 'title', locale)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={item.cover_image || DEFAULT_NEWS_IMAGE}
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-primary font-bold mb-2">
                      {formatDate(item.published_at)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      {getLocalizedField(item, 'title', locale)}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">
                      {getLocalizedField(item, 'excerpt', locale) || getLocalizedField(item, 'content', locale)}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
