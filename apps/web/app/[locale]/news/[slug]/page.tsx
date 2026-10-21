import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getLocalizedField, getNews, supabase, type News } from '@/lib/supabase';
import Shell from '@/components/shell/Shell';
import NewsArticle from '@/components/pages/NewsArticle';
import { stripTags } from '@/components/pages/text';

export const revalidate = 10;

type Props = {
  params: { locale: string; slug: string };
};

/** 게시된 소식 한 건. Supabase 가 없으면 스냅샷의 소식에서 찾고, 없으면 null(→ 404). */
async function getNewsBySlug(slug: string): Promise<News | null> {
  if (!supabase) return (await getNews(true)).find((n) => n.slug === slug) ?? null;
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) return null;
  return data;
}

function decodeSlug(slug: string): string | null {
  try {
    return decodeURIComponent(slug);
  } catch {
    return null; // 깨진 주소는 404 로
  }
}

/**
 * 정적 내보내기(output: 'export')를 위해 게시된 소식의 slug 를 미리 알려 준다.
 * 내보내기는 동적 경로에 경로가 하나도 없으면(스냅샷처럼 소식이 0건) 빌드가 실패하므로,
 * 그때는 자리표시 slug 하나를 둔다 — 이 경로는 아래에서 notFound() 로 끝나 페이지가 만들어지지 않는다.
 */
export async function generateStaticParams() {
  const items = await getNews(true);
  return items.length ? items.map((n) => ({ slug: n.slug })) : [{ slug: '_' }];
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const decoded = decodeSlug(slug);
  const news = decoded ? await getNewsBySlug(decoded) : null;
  if (!news) return {};
  const title = getLocalizedField(news, 'title', locale);
  const description = stripTags(getLocalizedField(news, 'content', locale)).slice(0, 140);
  return { title, description: description || undefined };
}

export default async function NewsDetailPage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  const decoded = decodeSlug(slug);
  const news = decoded ? await getNewsBySlug(decoded) : null;
  if (!news) notFound();

  return (
    <Shell locale={locale}>
      <NewsArticle news={news} locale={locale} />
    </Shell>
  );
}
