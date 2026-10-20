import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Icon from '@/components/ui/Icon';
import { getLocalizedField, getNewsBySlug } from '@/lib/supabase';

type Props = {
  params: { locale: string; slug: string };
};

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
  const news = await getNewsBySlug(decodeURIComponent(slug));
  if (!news) notFound();

  const t = await getTranslations('News');
  const title = getLocalizedField(news, 'title', locale);
  const content = getLocalizedField(news, 'content', locale);

  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-40">
      <Link href="/news" className="inline-flex min-h-[44px] items-center gap-2 text-[0.875rem] text-ink-soft hover:text-ink">
        <Icon name="arrowLeft" size={16} /> {t('back')}
      </Link>
      <p className="mt-8 font-mono text-sm text-accent">{formatDate(news.published_at, locale)}</p>
      <h1 className="mt-3 font-serif text-[2.25rem] font-semibold leading-tight md:text-[3rem]">{title}</h1>
      {news.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={news.cover_image} alt="" className="mt-10 aspect-video w-full object-cover" />
      )}
      {content && (
        <div className="reading mt-10 font-serif text-[1.0625rem] leading-[1.95] text-ink-soft" dangerouslySetInnerHTML={{ __html: content }} />
      )}
    </article>
  );
}
