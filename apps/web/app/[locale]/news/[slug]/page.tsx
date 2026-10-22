import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
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
  const t = await getTranslations('NewsDetail');
  const news = await getNewsBySlug(decodedSlug);

  if (!news) {
    notFound();
  }

  const title = getLocalizedField(news, 'title', locale);
  const content = getLocalizedField(news, 'content', locale);

  return (
    <div className="min-h-screen bg-paper pb-32 pt-36 md:pt-44">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink-3 transition-colors hover:text-ink"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          {t('backToNews')}
        </Link>

        <article className="mt-14">
          <header className="border-b border-ink pb-12">
            <p className="eyebrow">{formatDate(news.published_at, locale)}</p>
            <h1 className="font-display mt-6 text-balance text-4xl leading-[1.1] text-ink md:text-6xl">
              {title}
            </h1>
          </header>

          {news.cover_image && (
            <div className="mt-12 aspect-video overflow-hidden bg-paper-alt">
              <img src={news.cover_image} alt={title} className="h-full w-full object-cover" />
            </div>
          )}

          {content && (
            <div
              className="prose prose-lg mt-14 max-w-none text-ink-2 prose-headings:font-display prose-headings:text-ink prose-p:text-ink-2 prose-strong:text-ink prose-a:text-seal prose-blockquote:border-seal prose-blockquote:text-ink prose-li:text-ink-2"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </article>
      </div>
    </div>
  );
}
