import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getTeamMemberBySlug,
  getLocalizedField,
  getTeamMembers,
  getTeamMemberSections,
  TeamMemberSection,
} from "@/lib/supabase";
import styles from "@/components/editorial/EditorialPages.module.css";

type Props = { params: { locale: string; slug: string } };

export async function generateStaticParams() {
  const members = await getTeamMembers();
  return members.map((member) => ({ slug: member.slug }));
}

export default async function TeamMemberPage({ params }: Props) {
  const { locale, slug } = params;
  const [member, sections] = await Promise.all([
    getTeamMemberBySlug(slug),
    getTeamMemberSections(slug),
  ]);
  if (!member) notFound();

  const name = getLocalizedField(member, "name", locale);
  const role = getLocalizedField(member, "role", locale);
  const bio = getLocalizedField(member, "bio", locale);
  const back =
    locale === "ko"
      ? "스튜디오 소개"
      : locale === "ja"
        ? "スタジオ紹介"
        : "Back to the studio";
  const socials = [
    { name: "X / Twitter", url: member.twitter_url },
    { name: "Instagram", url: member.instagram_url },
    { name: "Website", url: member.website_url },
  ].filter((link) => link.url);

  return (
    <div className={styles.page}>
      <div className="editorial-container">
        <div className={styles.memberBack}>
          <Link href={`/${locale}/about`} className={styles.backLink}>
            <span aria-hidden="true">←</span>
            {back}
          </Link>
        </div>
        <header
          className={`${styles.memberHeader} ${member.profile_image ? styles.memberWithPortrait : ""}`}
        >
          <div>
            <span className="eyebrow">OUR PEOPLE / STUDIO ELYSIAN</span>
            <h1>{name}</h1>
            {role && <p className={styles.memberRole}>{role}</p>}
            {bio && <p className={styles.memberBio}>{bio}</p>}
            {socials.length > 0 && (
              <div className={styles.memberLinks}>
                {socials.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    {link.name} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
          {member.profile_image && (
            <img
              src={member.profile_image}
              alt={name}
              className={styles.memberPortrait}
            />
          )}
        </header>
        {sections.map((section) => (
          <SectionRenderer key={section.id} section={section} locale={locale} />
        ))}
      </div>
    </div>
  );
}

function SectionRenderer({
  section,
  locale,
}: {
  section: TeamMemberSection;
  locale: string;
}) {
  const title = getLocalizedField(section, "title", locale);
  const content = getLocalizedField(section, "content", locale);
  const viewProject =
    locale === "ko"
      ? "작품 보기"
      : locale === "ja"
        ? "作品を見る"
        : "View project";

  return (
    <section className={styles.memberSection}>
      {title && <h2>{title}</h2>}
      {section.section_type === "text" && content && (
        <div className={styles.bodyCopy}>
          <p className={styles.preserveLines}>{content}</p>
        </div>
      )}
      {section.section_type === "gallery" &&
        section.images &&
        section.images.length > 0 && (
          <div className={styles.memberGallery}>
            {section.images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={title ? `${title} ${index + 1}` : ""}
                loading="lazy"
              />
            ))}
          </div>
        )}
      {section.section_type === "video" && section.video_url && (
        <div className={styles.memberVideo}>
          <iframe
            src={section.video_url}
            title={title || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {section.section_type === "links" &&
        section.links &&
        section.links.length > 0 && (
          <div className={styles.memberLinks}>
            {section.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                {link.name} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
      {section.section_type === "projects" &&
        section.projects &&
        section.projects.length > 0 && (
          <div className={styles.memberProjects}>
            {section.projects.map((project, index) => {
              const projectTitle = getLocalizedField(project, "title", locale);
              const description = getLocalizedField(
                project,
                "description",
                locale,
              );
              return (
                <article key={index}>
                  {project.image && (
                    <img
                      src={project.image}
                      alt={projectTitle}
                      loading="lazy"
                    />
                  )}
                  {projectTitle && <h3>{projectTitle}</h3>}
                  {description && <p>{description}</p>}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link"
                    >
                      {viewProject} <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      {section.section_type === "skills" &&
        section.skills &&
        section.skills.length > 0 && (
          <div className={styles.memberSkills}>
            {section.skills.map((skill, index) => (
              <div key={index}>
                <div>
                  <span>{getLocalizedField(skill, "name", locale)}</span>
                  <span>{skill.level ?? 0} / 5</span>
                </div>
                <meter
                  min={0}
                  max={5}
                  value={skill.level ?? 0}
                  aria-label={getLocalizedField(skill, "name", locale)}
                />
              </div>
            ))}
          </div>
        )}
      {section.section_type === "timeline" &&
        section.timeline_items &&
        section.timeline_items.length > 0 && (
          <ol className={styles.timeline}>
            {section.timeline_items.map((item, index) => (
              <li key={index}>
                <time>{item.date}</time>
                <h3>{getLocalizedField(item, "event", locale)}</h3>
              </li>
            ))}
          </ol>
        )}
      {section.section_type === "custom" && content && (
        <div
          className={styles.articleBody}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </section>
  );
}
