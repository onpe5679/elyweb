import Link from "next/link";
import { getPressKits, getLocalizedField } from "@/lib/supabase";
import { getLocale } from "next-intl/server";
import { EditorialPageHeader } from "@/components/editorial/EditorialPageHeader";
import styles from "@/components/editorial/EditorialPages.module.css";

export default async function PressPage() {
  const [locale, pressKits] = await Promise.all([getLocale(), getPressKits()]);
  const labels =
    locale === "en"
      ? {
          label: "Media resources",
          description: "Press materials for Studio Elysian and our games.",
          download: "DOWNLOAD",
          pending: "COMING SOON",
          fallback: "Press materials",
          empty: "Press materials are being prepared.",
          note: "For press inquiries or additional materials, please contact us.",
          contact: "Contact us",
        }
      : locale === "ja"
        ? {
            label: "メディア向け資料",
            description:
              "スタジオエリシアンと作品のプレス資料をご覧いただけます。",
            download: "ダウンロード",
            pending: "準備中",
            fallback: "プレス資料",
            empty: "プレス資料を準備しています。",
            note: "取材や資料に関するご相談は、お問い合わせください。",
            contact: "お問い合わせ",
          }
        : {
            label: "프레스 자료",
            description:
              "스튜디오 엘리시안과 작품을 소개하는 자료를 모았습니다.",
            download: "다운로드",
            pending: "준비 중",
            fallback: "작품 소개 및 미디어 자료",
            empty: "프레스 자료를 준비하고 있습니다.",
            note: "취재 및 추가 자료가 필요하신 경우 문의해 주세요.",
            contact: "문의하기",
          };

  return (
    <div className={styles.page}>
      <div className="editorial-container">
        <EditorialPageHeader
          index="06"
          title="Press & media."
          label={labels.label}
          description={labels.description}
        />
        <div className={styles.pressList}>
          {pressKits.length === 0 ? (
            <p className={styles.empty}>{labels.empty}</p>
          ) : (
            pressKits.map((kit, index) => {
              const fileUrl =
                kit.file_url &&
                !/^https?:\/\/(?:www\.)?example\.(?:com|org|net)(?:\/|$)/i.test(
                  kit.file_url,
                )
                  ? kit.file_url
                  : null;
              const contents = (
                <>
                  <span className={styles.pressNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2>{getLocalizedField(kit, "title", locale)}</h2>
                    <p>
                      {getLocalizedField(kit, "description", locale) ||
                        labels.fallback}
                    </p>
                  </div>
                  <div className={styles.download}>
                    {fileUrl ? labels.download : labels.pending}
                    <span aria-hidden="true">{fileUrl ? "↓" : "—"}</span>
                  </div>
                </>
              );
              return fileUrl ? (
                <a
                  key={kit.id}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.pressRow}
                >
                  {contents}
                </a>
              ) : (
                <article
                  key={kit.id}
                  className={styles.pressRow}
                  aria-disabled="true"
                >
                  {contents}
                </article>
              );
            })
          )}
        </div>
        <div className={styles.pressNote}>
          <p>{labels.note}</p>
          <Link href={`/${locale}/contact`} className="text-link">
            {labels.contact} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
