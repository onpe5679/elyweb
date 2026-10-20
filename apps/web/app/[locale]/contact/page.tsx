import { getLocale, getTranslations } from "next-intl/server";
import { getSettings, getLocalizedSettingValue } from "@/lib/supabase";
import { ContactForm } from "@/components/contact/ContactForm";
import { EditorialPageHeader } from "@/components/editorial/EditorialPageHeader";
import styles from "@/components/editorial/EditorialPages.module.css";

export default async function ContactPage() {
  const [t, navigation, locale, settings] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Navigation"),
    getLocale(),
    getSettings([
      "contact_email",
      "twitter_url",
      "youtube_url",
      "instagram_url",
    ]),
  ]);
  const contactEmail =
    getLocalizedSettingValue(settings.contact_email, locale) ||
    "contact@studioelysian.com";
  const socialLinks = [
    {
      name: "X / Twitter",
      url:
        getLocalizedSettingValue(settings.twitter_url, locale) ||
        "https://twitter.com/studioelysian",
    },
    {
      name: "YouTube",
      url:
        getLocalizedSettingValue(settings.youtube_url, locale) ||
        "https://youtube.com/@studioelysian",
    },
    {
      name: "Instagram",
      url:
        getLocalizedSettingValue(settings.instagram_url, locale) ||
        "https://instagram.com/studioelysian",
    },
  ];
  const intro =
    locale === "en"
      ? "For questions about our works or working together, leave us a message."
      : locale === "ja"
        ? "作品やコラボレーションについて、お気軽にお問い合わせください。"
        : "작품과 협업에 관한 이야기를 기다립니다.";

  return (
    <div className={styles.page}>
      <div className="editorial-container">
        <EditorialPageHeader
          index="05"
          title="Contact."
          label={navigation("contact")}
        />
        <div className={styles.contactLayout}>
          <aside className={styles.contactAside}>
            <h2>{intro}</h2>
            <span className={styles.contactLabel}>Write to us</span>
            <a className={styles.email} href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            <div className={styles.socialLinks}>
              <span className={styles.contactLabel}>Find us elsewhere</span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.name}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </aside>
          <div className={styles.form}>
            <ContactForm inquiryLabel={t("contactLinks.inquiry")} />
          </div>
        </div>
      </div>
    </div>
  );
}
