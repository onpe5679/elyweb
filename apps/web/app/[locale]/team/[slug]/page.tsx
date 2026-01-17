import { notFound } from 'next/navigation';
import Link from 'next/link';
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

export async function generateStaticParams() {
  const members = await getTeamMembers();
  return members.map((member) => ({
    slug: member.slug,
  }));
}

export default async function TeamMemberPage({ params }: Props) {
  const { locale, slug } = params;
  const [member, sections] = await Promise.all([
    getTeamMemberBySlug(slug),
    getTeamMemberSections(slug)
  ]);

  if (!member) {
    notFound();
  }

  const name = getLocalizedField(member, 'name', locale);
  const role = getLocalizedField(member, 'role', locale);
  const bio = getLocalizedField(member, 'bio', locale);

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/about`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-primary mb-8 transition-colors"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Back to About
        </Link>

        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                {member.profile_image ? (
                  <img
                    src={member.profile_image}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fa-solid fa-user text-8xl text-gray-300 dark:text-gray-600"></i>
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-2/3 p-8">
              <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white">
                {name}
              </h1>
              
              {role && (
                <p className="text-xl text-primary font-medium mt-2">{role}</p>
              )}

              {bio && (
                <div className="mt-6 prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{bio}</p>
                </div>
              )}

              {(member.twitter_url || member.instagram_url || member.website_url) && (
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Connect
                  </h3>
                  <div className="flex gap-4">
                    {member.twitter_url && (
                      <a
                        href={member.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-all"
                      >
                        <i className="fa-brands fa-twitter"></i>
                      </a>
                    )}
                    {member.instagram_url && (
                      <a
                        href={member.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-all"
                      >
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                    )}
                    {member.website_url && (
                      <a
                        href={member.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-all"
                      >
                        <i className="fa-solid fa-globe"></i>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {sections.length > 0 && (
          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <SectionRenderer key={section.id} section={section} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionRenderer({ section, locale }: { section: TeamMemberSection; locale: string }) {
  const title = getLocalizedField(section, 'title', locale);
  const content = getLocalizedField(section, 'content', locale);

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg overflow-hidden p-8">
      {title && (
        <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6">
          {title}
        </h2>
      )}

      {section.section_type === 'text' && content && (
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{content}</p>
        </div>
      )}

      {section.section_type === 'gallery' && section.images && section.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {section.images.map((image, idx) => (
            <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {section.section_type === 'video' && section.video_url && (
        <div className="aspect-video rounded-lg overflow-hidden">
          <iframe
            src={section.video_url}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {section.section_type === 'links' && section.links && section.links.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {section.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition-all"
            >
              <i className={getLinkIcon(link.icon)}></i>
              {link.name}
            </a>
          ))}
        </div>
      )}

      {section.section_type === 'projects' && section.projects && section.projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {section.projects.map((project, idx) => {
            const projectTitle = locale === 'en' ? (project.title_en || project.title_ko) : project.title_ko;
            const projectDesc = locale === 'en' ? (project.description_en || project.description_ko) : project.description_ko;
            return (
              <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
                {project.image && (
                  <div className="aspect-video">
                    <img src={project.image} alt={projectTitle || ''} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  {projectTitle && (
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{projectTitle}</h3>
                  )}
                  {projectDesc && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{projectDesc}</p>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary text-sm mt-3 hover:underline"
                    >
                      View Project <i className="fa-solid fa-arrow-right text-xs"></i>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {section.section_type === 'skills' && section.skills && section.skills.length > 0 && (
        <div className="space-y-4">
          {section.skills.map((skill, idx) => {
            const skillName = locale === 'en' ? (skill.name_en || skill.name_ko) : skill.name_ko;
            return (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{skillName}</span>
                  <span className="text-gray-500 text-sm">{skill.level}/5</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${((skill.level || 0) / 5) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {section.section_type === 'timeline' && section.timeline_items && section.timeline_items.length > 0 && (
        <div className="space-y-4">
          {section.timeline_items.map((item, idx) => {
            const eventText = locale === 'ko' ? item.event_ko : (locale === 'ja' ? item.event_ja : item.event_en) || item.event_ko;
            return (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-primary">{item.date}</div>
                <div className="text-gray-600 dark:text-gray-300">{eventText}</div>
              </div>
            );
          })}
        </div>
      )}

      {section.section_type === 'custom' && content && (
        <div 
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
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
