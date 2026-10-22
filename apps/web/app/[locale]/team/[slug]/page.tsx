import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  getTeamMemberBySlug,
  getLocalizedField,
  getTeamMembers,
  getTeamMemberSections,
  TeamMemberSection
} from '@/lib/supabase';

type Props = {
  params: { locale: string; slug: string };
};

type SectionLabels = {
  viewProject: string;
  video: string;
};

export async function generateStaticParams() {
  const members = await getTeamMembers();
  return members.map((member) => ({
    slug: member.slug,
  }));
}

export default async function TeamMemberPage({ params }: Props) {
  const { locale, slug } = params;
  const [member, sections, t] = await Promise.all([
    getTeamMemberBySlug(slug),
    getTeamMemberSections(slug),
    getTranslations('TeamPage'),
  ]);

  if (!member) {
    notFound();
  }

  const name = getLocalizedField(member, 'name', locale);
  const role = getLocalizedField(member, 'role', locale);
  const bio = getLocalizedField(member, 'bio', locale);
  const labels: SectionLabels = { viewProject: t('viewProject'), video: t('videoTitle') };
  const hasLinks = !!(member.twitter_url || member.instagram_url || member.website_url);

  return (
    <div className="min-h-screen bg-paper pb-32 pt-36 md:pt-44">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink-3 transition-colors hover:text-ink"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          {t('backToAbout')}
        </Link>

        <div className="mt-14 grid gap-12 md:grid-cols-12 md:items-end lg:gap-16">
          <figure className="md:col-span-5 lg:col-span-4">
            <div className="aspect-[4/5] overflow-hidden bg-paper-alt">
              {member.profile_image ? (
                <img src={member.profile_image} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <i className="fa-solid fa-user text-8xl text-ink-3" aria-hidden="true"></i>
                </div>
              )}
            </div>
          </figure>

          <div className="md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-7">
            {role && <p className="eyebrow">{role}</p>}
            <h1 className="font-display mt-6 text-balance text-5xl leading-[1.02] text-ink md:text-7xl">{name}</h1>

            {bio && (
              <p className="mt-10 whitespace-pre-line text-base leading-loose text-ink-2 md:text-lg">{bio}</p>
            )}

            {hasLinks && (
              <section aria-labelledby="team-connect-heading" className="mt-12 border-t border-rule pt-8">
                <h2 id="team-connect-heading" className="eyebrow !text-ink-3">
                  {t('connect')}
                </h2>
                <ul className="mt-5 flex flex-wrap gap-3">
                  {member.twitter_url && (
                    <li>
                      <a
                        href={member.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitter"
                        className="flex h-12 w-12 items-center justify-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
                      >
                        <i className="fa-brands fa-twitter text-lg" aria-hidden="true"></i>
                      </a>
                    </li>
                  )}
                  {member.instagram_url && (
                    <li>
                      <a
                        href={member.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="flex h-12 w-12 items-center justify-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
                      >
                        <i className="fa-brands fa-instagram text-lg" aria-hidden="true"></i>
                      </a>
                    </li>
                  )}
                  {member.website_url && (
                    <li>
                      <a
                        href={member.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('website')}
                        className="flex h-12 w-12 items-center justify-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
                      >
                        <i className="fa-solid fa-globe text-lg" aria-hidden="true"></i>
                      </a>
                    </li>
                  )}
                </ul>
              </section>
            )}
          </div>
        </div>

        {sections.length > 0 && (
          <div className="mt-24 space-y-20">
            {sections.map((section) => (
              <SectionRenderer key={section.id} section={section} locale={locale} labels={labels} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionRenderer({
  section,
  locale,
  labels,
}: {
  section: TeamMemberSection;
  locale: string;
  labels: SectionLabels;
}) {
  const title = getLocalizedField(section, 'title', locale);
  const content = getLocalizedField(section, 'content', locale);
  const headingId = `team-section-${section.id}`;

  return (
    <section aria-labelledby={title ? headingId : undefined} className="border-t border-ink pt-12">
      {title && (
        <h2 id={headingId} className="font-display mb-12 text-3xl leading-tight text-ink md:text-4xl">
          {title}
        </h2>
      )}

      {section.section_type === 'text' && content && (
        <p className="whitespace-pre-line text-base leading-loose text-ink-2 md:text-lg">{content}</p>
      )}

      {section.section_type === 'gallery' && section.images && section.images.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {section.images.map((image, idx) => (
            <li key={idx} className="aspect-square overflow-hidden bg-paper-alt">
              <img src={image} alt={title ? `${title} ${idx + 1}` : ''} className="h-full w-full object-cover" />
            </li>
          ))}
        </ul>
      )}

      {section.section_type === 'video' && section.video_url && (
        <div className="aspect-video overflow-hidden bg-night">
          <iframe
            src={section.video_url}
            title={title || labels.video}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {section.section_type === 'links' && section.links && section.links.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {section.links.map((link, idx) => (
            <li key={idx}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border border-ink px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <i className={getLinkIcon(link.icon)} aria-hidden="true"></i>
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      )}

      {section.section_type === 'projects' && section.projects && section.projects.length > 0 && (
        <ul className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
          {section.projects.map((project, idx) => {
            const projectTitle = locale === 'en' ? (project.title_en || project.title_ko) : project.title_ko;
            const projectDesc = locale === 'en' ? (project.description_en || project.description_ko) : project.description_ko;
            return (
              <li key={idx}>
                {project.image && (
                  <div className="aspect-video overflow-hidden bg-paper-alt">
                    <img src={project.image} alt={projectTitle || ''} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className={project.image ? 'mt-6' : undefined}>
                  {projectTitle && (
                    <h3 className="font-display text-2xl leading-snug text-ink">{projectTitle}</h3>
                  )}
                  {projectDesc && (
                    <p className="mt-3 text-sm leading-relaxed text-ink-2">{projectDesc}</p>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm font-bold text-ink transition-colors hover:border-seal hover:text-seal"
                    >
                      {labels.viewProject}
                      <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {section.section_type === 'skills' && section.skills && section.skills.length > 0 && (
        <ul className="space-y-7">
          {section.skills.map((skill, idx) => {
            const skillName = locale === 'en' ? (skill.name_en || skill.name_ko) : skill.name_ko;
            return (
              <li key={idx}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-ink">{skillName}</span>
                  <span className="text-sm tabular-nums text-ink-3">{skill.level}/5</span>
                </div>
                <div aria-hidden="true" className="mt-3 h-[3px] overflow-hidden bg-rule">
                  <div
                    className="h-full bg-seal transition-[width]"
                    style={{ width: `${((skill.level || 0) / 5) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {section.section_type === 'timeline' && section.timeline_items && section.timeline_items.length > 0 && (
        <ol>
          {section.timeline_items.map((item, idx) => {
            const eventText = locale === 'ko' ? item.event_ko : (locale === 'ja' ? item.event_ja : item.event_en) || item.event_ko;
            return (
              <li key={idx} className="grid grid-cols-[6.5rem_1fr] gap-6 border-b border-rule py-5">
                <span className="font-display text-xl tabular-nums text-seal">{item.date}</span>
                <span className="text-ink-2">{eventText}</span>
              </li>
            );
          })}
        </ol>
      )}

      {section.section_type === 'custom' && content && (
        <div
          className="prose prose-lg max-w-none text-ink-2 prose-headings:font-display prose-headings:text-ink prose-strong:text-ink prose-a:text-seal"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </section>
  );
}

function getLinkIcon(icon?: string): string {
  const iconMap: Record<string, string> = {
    portfolio: 'fa-solid fa-briefcase',
    github: 'fa-brands fa-github',
    linkedin: 'fa-brands fa-linkedin',
    twitter: 'fa-brands fa-twitter',
    artstation: 'fa-brands fa-artstation',
    behance: 'fa-brands fa-behance',
  };
  return iconMap[icon || ''] || 'fa-solid fa-link';
}
