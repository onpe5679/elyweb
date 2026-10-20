import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Icon from '@/components/ui/Icon';
import { YouTubeFrame } from '@/components/detail/TrailerButton';
import { youtubeId } from '@/lib/game-spec';
import { getLocalizedField, getTeamMemberBySlug, getTeamMembers, getTeamMemberSections, type TeamMemberSection } from '@/lib/supabase';

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const member = await getTeamMemberBySlug(slug);
  return member ? { title: getLocalizedField(member, 'name', locale) } : {};
}

export async function generateStaticParams() {
  const members = await getTeamMembers();
  return members.map((member) => ({ slug: member.slug }));
}

export default async function TeamMemberPage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  const [member, sections] = await Promise.all([getTeamMemberBySlug(slug), getTeamMemberSections(slug)]);
  if (!member) notFound();

  const t = await getTranslations('Team');
  const name = getLocalizedField(member, 'name', locale);
  const role = getLocalizedField(member, 'role', locale);
  const bio = getLocalizedField(member, 'bio', locale);

  return (
    <article>
      <header className="paper-grain manuscript-grid border-b border-ink/15">
        <div className="mx-auto max-w-page px-5 pb-12 pt-28 md:px-10 md:pb-16 md:pt-36">
          <Link href="/about" className="inline-flex min-h-[44px] items-center gap-2 text-[0.875rem] text-ink-soft hover:text-ink">
            <Icon name="arrowLeft" size={16} /> {t('back')}
          </Link>
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end">
            {member.profile_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.profile_image} alt="" className="h-40 w-40 object-cover" />
            ) : (
              <span aria-hidden="true" className="ms-cell ms-cell--filled font-semibold [--cell-size:6rem]">{name.slice(0, 1)}</span>
            )}
            <div>
              <h1 className="font-serif text-[2.75rem] font-semibold leading-tight md:text-[4rem]">{name}</h1>
              {role && <p className="mt-2 text-lg text-accent">{role}</p>}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-14 px-5 py-16 md:py-24">
        {bio && <p className="whitespace-pre-line font-serif text-[1.25rem] leading-relaxed">{bio}</p>}
        {sections.length === 0 && !bio && <p className="text-ink-soft">{t('empty')}</p>}
        {sections.map((section) => (
          <MemberSection key={section.id} section={section} locale={locale} linksLabel={t('links')} />
        ))}
      </div>
    </article>
  );
}

function MemberSection({ section, locale, linksLabel }: { section: TeamMemberSection; locale: string; linksLabel: string }) {
  const title = getLocalizedField(section, 'title', locale);
  const content = getLocalizedField(section, 'content', locale);
  const heading = title && <h2 className="border-b border-ink pb-3 font-serif text-xl font-semibold">{title}</h2>;

  switch (section.section_type) {
    case 'text':
    case 'custom':
      return content ? (
        <section>
          {heading}
          <div className="mt-6 whitespace-pre-line font-serif text-[1.0625rem] leading-[1.95] text-ink-soft">{content}</div>
        </section>
      ) : null;
    case 'links':
      return section.links?.length ? (
        <section>
          {title ? heading : <h2 className="border-b border-ink pb-3 font-serif text-xl font-semibold">{linksLabel}</h2>}
          <ul className="mt-6 flex flex-wrap gap-3">
            {section.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 border border-ink/30 px-4 text-[0.9375rem] hover:border-ink">
                  {l.name} <Icon name="arrowUpRight" size={14} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null;
    case 'gallery':
      return section.images?.length ? (
        <section>
          {heading}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {section.images.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
            ))}
          </div>
        </section>
      ) : null;
    case 'video': {
      const id = youtubeId(section.video_url);
      return id ? (
        <section>
          {heading}
          <div className="mt-6 aspect-video bg-black"><YouTubeFrame id={id} title={title || 'Video'} autoplay={false} /></div>
        </section>
      ) : null;
    }
    case 'timeline':
      return section.timeline_items?.length ? (
        <section>
          {heading}
          <ol className="mt-6">
            {section.timeline_items.map((it, i) => (
              <li key={i} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-ink/15 py-3">
                <span className="font-mono text-sm text-accent">{it.date}</span>
                <span className="font-serif">{getLocalizedField(it as Record<string, unknown>, 'event', locale)}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null;
    case 'projects':
      return section.projects?.length ? (
        <section>
          {heading}
          <ul className="mt-6 space-y-4">
            {section.projects.map((p, i) => (
              <li key={i} className="border-b border-ink/15 pb-4">
                <p className="font-serif text-lg font-semibold">{getLocalizedField(p as Record<string, unknown>, 'title', locale)}</p>
                <p className="mt-1 text-ink-soft">{getLocalizedField(p as Record<string, unknown>, 'description', locale)}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null;
    case 'skills':
      return section.skills?.length ? (
        <section>
          {heading}
          <ul className="mt-6 flex flex-wrap gap-2">
            {section.skills.map((s, i) => (
              <li key={i} className="border border-ink/30 px-3 py-1 text-[0.875rem]">{getLocalizedField(s as Record<string, unknown>, 'name', locale)}</li>
            ))}
          </ul>
        </section>
      ) : null;
    default:
      return null;
  }
}
