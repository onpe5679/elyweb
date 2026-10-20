import { getTranslations } from "next-intl/server";
import {
  getNews,
  getLocalizedField,
  getSetting,
  getLocalizedSettingValue,
} from "@/lib/supabase";
import Link from "next/link";
import XTimeline from "@/components/news/XTimeline";
import { EditorialPageHeader } from "@/components/editorial/EditorialPageHeader";
import styles from "@/components/editorial/EditorialPages.module.css";

export const revalidate = 10;

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function plainText(content: string): string {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function NewsPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const [t, modeSetting, handleSetting, newsItems] = await Promise.all([
    getTranslations("Navigation"),
    getSetting("news_display_mode"),
    getSetting("news_widget_x_handle"),
    getNews(true),
  ]);
  const displayMode = getLocalizedSettingValue(modeSetting, locale) || "manual";
  const xHandle = getLocalizedSettingValue(handleSetting, locale);
  const showWidget =
    (displayMode === "widget" || displayMode === "both") && !!xHandle;
  const showManual = displayMode === "manual" || displayMode === "both";
  const hasManual = showManual && newsItems.length > 0;
  const isEmpty = !showWidget && !hasManual;
  const labels =
    locale === "en"
      ? {
          description: "Stories and updates from Studio Elysian.",
          empty: "New stories will be shared here soon.",
          social: "Follow our latest stories on our official X account.",
        }
      : locale === "ja"
        ? {
            description: "スタジオエリシアンの作品と日々の記録。",
            empty: "新しいお知らせを準備しています。",
            social: "公式Xアカウントで最新のお知らせをご覧ください。",
          }
        : {
            description: "작품의 안팎에서 전하는 엘리시안의 기록.",
            empty: "새로운 소식을 준비하고 있습니다.",
            social: "엘리시안의 새로운 이야기를 공식 X 계정에서 만나보세요.",
          };
  const cleanHandle = xHandle.replace(/^@/, "");

  return (
    <div className={styles.page}>
      <div className="editorial-container">
        <EditorialPageHeader
          index="04"
          title="Journal."
          label={t("news")}
          description={labels.description}
        />
        <div
          className={`${styles.newsLayout} ${showWidget && hasManual ? styles.newsWithWidget : ""}`}
        >
          {hasManual && (
            <div
              className={`${styles.newsList} ${showWidget ? styles.compactNews : ""}`}
            >
              {newsItems.map((item, index) => {
                const title = getLocalizedField(item, "title", locale);
                const excerpt = plainText(
                  getLocalizedField(item, "excerpt", locale) ||
                    getLocalizedField(item, "content", locale),
                );
                return (
                  <Link
                    key={item.id}
                    href={`/${locale}/news/${item.slug}`}
                    className={styles.newsRow}
                  >
                    <div className={styles.newsThumbnail}>
                      {item.cover_image ? (
                        <img alt="" src={item.cover_image} loading="lazy" />
                      ) : (
                        <div
                          className={styles.newsPlaceholder}
                          aria-hidden="true"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      )}
                    </div>
                    <div>
                      <time dateTime={item.published_at}>
                        {formatDate(item.published_at)}
                      </time>
                      <h2>{title}</h2>
                      {excerpt && <p>{excerpt}</p>}
                    </div>
                    <span aria-hidden="true">↗</span>
                  </Link>
                );
              })}
            </div>
          )}
          {showWidget && (
            <section
              className={`${styles.widgetSection} ${!hasManual ? styles.widgetOnly : ""}`}
              aria-label="Studio Elysian on X"
            >
              {!hasManual && (
                <div className={styles.widgetIntro}>
                  <h2>From the studio.</h2>
                  <p>{labels.social}</p>
                </div>
              )}
              <div>
                <div className={styles.widgetHeading}>
                  <span>STUDIO NOTES / X</span>
                  <a
                    href={`https://x.com/${cleanHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @{cleanHandle} ↗
                  </a>
                </div>
                <div className={styles.widgetFrame}>
                  <XTimeline handle={xHandle} />
                </div>
              </div>
            </section>
          )}
          {isEmpty && <p className={styles.empty}>{labels.empty}</p>}
        </div>
      </div>
    </div>
  );
}
