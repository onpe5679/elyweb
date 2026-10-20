import { getSetting, getLocalizedSettingValue } from "@/lib/supabase";
import { EditorialPageHeader } from "@/components/editorial/EditorialPageHeader";
import styles from "@/components/editorial/EditorialPages.module.css";

export const revalidate = 10;

export default async function PrivacyPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const setting = await getSetting("privacy_policy");
  const body = getLocalizedSettingValue(setting, locale);
  const labels =
    locale === "en"
      ? {
          title: "Privacy policy",
          empty: "The privacy policy has not been published yet.",
        }
      : locale === "ja"
        ? {
            title: "プライバシーポリシー",
            empty: "プライバシーポリシーはまだ掲載されていません。",
          }
        : {
            title: "개인정보처리방침",
            empty: "개인정보처리방침이 아직 등록되지 않았습니다.",
          };

  return (
    <div className={styles.page}>
      <div className="editorial-container">
        <EditorialPageHeader index="07" title="Privacy." label={labels.title} />
        {body ? (
          <div className={styles.policyBody}>{body}</div>
        ) : (
          <p className={styles.empty}>{labels.empty}</p>
        )}
      </div>
    </div>
  );
}
