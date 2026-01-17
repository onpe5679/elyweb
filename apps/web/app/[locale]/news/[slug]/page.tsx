import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocalizedField, supabase } from '@/lib/supabase';

type Props = {
  params: { locale: string; slug: string };
};

async function getNewsBySlug(slug: string) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) return null;
  return data;
}

function formatDate(dateString: string | undefined, locale: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function NewsDetailPage({ params }: Props) {
  const { locale, slug } = params;
  const decodedSlug = decodeURIComponent(slug);
  const news = await getNewsBySlug(decodedSlug);

  if (!news) {
    notFound();
  }

  const title = getLocalizedField(news, 'title', locale);
  const content = getLocalizedField(news, 'content', locale);

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/news`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-8 transition-colors"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Back to News
        </Link>

        <article className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg overflow-hidden">
          {news.cover_image && (
            <div className="aspect-video relative overflow-hidden">
              <img
                src={news.cover_image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="text-sm text-primary font-bold mb-4">
              {formatDate(news.published_at, locale)}
            </div>

            <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-8">
              {title}
            </h1>

            {content && (
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
