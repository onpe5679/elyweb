import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  getLocalizedField,
  getTimelineEvents,
  getSetting,
  getSettings,
  getLocalizedSettingValue,
  getTeamMembers,
} from "@/lib/supabase";
import { EditorialPageHeader } from "@/components/editorial/EditorialPageHeader";
import styles from "@/components/editorial/EditorialPages.module.css";

export default async function AboutPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const [
    t,
    navigation,
    timelineEvents,
    aboutImageSetting,
    teamMembers,
    siteSettings,
  ] = await Promise.all([
    getTranslations("Vision"),
    getTranslations("Navigation"),
    getTimelineEvents(),
    getSetting("about_image"),
    getTeamMembers(),
    getSettings(["vision_title", "vision_description"]),
  ]);

  const configuredAboutImage = getLocalizedSettingValue(
    aboutImageSetting,
    locale,
  );
  const aboutImage = configuredAboutImage.includes(
    "6fb9f596-30a8-418d-9621-4e97574e59ca.png",
  )
    ? "/images/editorial/about-studio.webp"
    : configuredAboutImage || "/images/editorial/interlude.webp";
  const visionTitle =
    getLocalizedSettingValue(siteSettings.vision_title, locale) || t("title");
  const visionBody = getLocalizedSettingValue(
    siteSettings.vision_description,
    locale,
  );
  const visionParagraphs = visionBody
    ? visionBody
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [t("p1"), t("p2"), t("p3")];
  const labels =
    locale === "en"
      ? {
          team: "The people behind our stories",
          history: "Our journey",
          empty: "Our history will be shared here.",
        }
      : locale === "ja"
        ? {
            team: "物語をつくる人たち",
            history: "これまでの歩み",
            empty: "これまでの歩みを準備しています。",
          }
        : {
            team: "이야기를 만드는 사람들",
            history: "우리가 걸어온 길",
            empty: "주요 연혁을 준비하고 있습니다.",
          };

  return (
    <div className={styles.page}>
      <div className="editorial-container">
        <EditorialPageHeader
          index="02"
          title="About us."
          label={navigation("about")}
        />

        <section
          className={styles.introduction}
          aria-labelledby="studio-vision"
        >
          <h2 id="studio-vision" className={styles.introTitle}>
            <small>FOR STORY-LOVERS, BY STORYTELLERS</small>
            {visionTitle}
          </h2>
          <div className={styles.bodyCopy}>
            {visionParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>

        <figure className={styles.aboutImage}>
          <img alt="Studio Elysian" src={aboutImage} />
          <figcaption>
            <span>STUDIO ELYSIAN</span>
            <span>STORIES, BEYOND THE FRAME.</span>
          </figcaption>
        </figure>

        <section className={styles.mission} aria-labelledby="studio-mission">
          <h2 id="studio-mission" className={styles.sectionLabel}>
            <span>01</span>
            {t("missionTitle")}
          </h2>
          <p>{t("missionBody")}</p>
        </section>

        {teamMembers.length > 0 && (
          <section className={styles.section} aria-labelledby="studio-team">
            <div className={styles.sectionHeading}>
              <h2 id="studio-team">Our people.</h2>
              <span>{labels.team}</span>
            </div>
            <div
              className={`${styles.teamGrid} ${teamMembers.every((member) => !member.profile_image) ? styles.teamRoster : ""}`}
            >
              {teamMembers.map((member, index) => {
                const name = getLocalizedField(member, "name", locale);
                const role = getLocalizedField(member, "role", locale);
                const bio = getLocalizedField(member, "bio", locale);
                return (
                  <Link
                    key={member.id}
                    href={`/${locale}/team/${member.slug}`}
                    className={styles.teamCard}
                  >
                    {member.profile_image ? (
                      <div className={styles.teamPortrait}>
                        <img
                          src={member.profile_image}
                          alt={name}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <span className={styles.teamIndex} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")} / ELYSIAN
                      </span>
                    )}
                    <div className={styles.teamInfo}>
                      <h3>{name}</h3>
                      <span aria-hidden="true">↗</span>
                      {role && <p className={styles.teamRole}>{role}</p>}
                      {bio && <p className={styles.teamBio}>{bio}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className={styles.section} aria-labelledby="studio-history">
          <div className={styles.sectionHeading}>
            <h2 id="studio-history">Our history.</h2>
            <span>{labels.history}</span>
          </div>
          {timelineEvents.length > 0 ? (
            <ol className={styles.timeline}>
              {timelineEvents.map((event) => (
                <li key={event.id}>
                  <time>{event.date}</time>
                  <div>
                    <h3>{getLocalizedField(event, "title", locale)}</h3>
                    {event.description && <p>{event.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>{labels.empty}</p>
          )}
        </section>
      </div>
    </div>
  );
}
