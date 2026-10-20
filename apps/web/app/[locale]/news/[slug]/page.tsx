import { notFound } from "next/navigation";
import Link from "next/link";
import { getLocalizedField, supabase } from "@/lib/supabase";
import styles from "@/components/editorial/EditorialPages.module.css";

type Props = {
  params: { locale: string; slug: string };
};

async function getNewsBySlug(slug: string) {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (error) return null;
  return data;
}

function formatDate(dateString: string | undefined, locale: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(
    locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

export default async function NewsDetailPage({ params }: Props) {
  const { locale, slug } = params;
  const news = await getNewsBySlug(decodeURIComponent(slug));
  if (!news) notFound();

  const title = getLocalizedField(news, "title", locale);
  const content = getLocalizedField(news, "content", locale);
  const back =
    locale === "ko"
      ? "새소식 목록"
      : locale === "ja"
        ? "お知らせ一覧"
        : "Back to journal";

  return (
    <div className={styles.page}>
      <div className={styles.articleContainer}>
        <Link href={`/${locale}/news`} className={styles.backLink}>
          <span aria-hidden="true">←</span>
          {back}
        </Link>
        <article>
          <header className={styles.articleHeader}>
            <time dateTime={news.published_at}>
              {formatDate(news.published_at, locale)}
            </time>
            <h1>{title}</h1>
          </header>
          {news.cover_image && (
            <img
              src={news.cover_image}
              alt={title}
              className={styles.articleImage}
            />
          )}
          {content && (
            <div
              className={styles.articleBody}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </article>
        <div className={styles.articleFooter}>
          <span>STUDIO ELYSIAN / JOURNAL</span>
          <Link href={`/${locale}/news`} className={styles.backLink}>
            {back}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
