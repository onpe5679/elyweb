import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  getLocalizedField,
  getTeamMemberBySlug,
  getTeamMembers,
  getTeamMemberSections,
  type TeamMemberSection,
} from '@/lib/supabase';
import { resolveBrand } from '@/lib/brands';
import Shell from '@/components/shell/Shell';
import Cells from '@/components/ui/Cells';
import CellTitle from '@/components/pages/CellTitle';
import RichText from '@/components/pages/RichText';
import { ArrowLeftIcon, ArrowUpRightIcon, SocialIcon } from '@/components/pages/Icons';
import { handleOf, safeUrl, toEmbedUrl } from '@/components/pages/text';

export const revalidate = 10;

type Props = {
  params: { locale: string; slug: string };
};

export async function generateStaticParams() {
  const members = await getTeamMembers();
  return members.map((member) => ({
    slug: member.slug,
  }));
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const member = await getTeamMemberBySlug(slug);
  if (!member) return {};
  return { title: getLocalizedField(member, 'name', locale) };
}

export default async function TeamMemberPage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  const [member, sections, t, tp] = await Promise.all([
    getTeamMemberBySlug(slug),
    getTeamMemberSections(slug),
    getTranslations('Team'),
    getTranslations('Pages'),
  ]);
  if (!member) notFound();

  const name = getLocalizedField(member, 'name', locale);
  const role = getLocalizedField(member, 'role', locale);
  const bio = getLocalizedField(member, 'bio', locale);
  const habom = resolveBrand({ developer: [member.role_ko, member.role_en, member.role_ja].filter(Boolean).join(' ') }) === 'habom';

  const links = [
    { id: 'x', label: 'X', url: safeUrl(member.twitter_url) },
    { id: 'instagram', label: 'Instagram', url: safeUrl(member.instagram_url) },
    { id: 'website', label: t('website'), url: safeUrl(member.website_url) },
  ].filter((l): l is { id: string; label: string; url: string } => !!l.url);

  return (
    <Shell locale={locale}>
      <div className="relative isolate overflow-hidden">
        <div aria-hidden className="ruled ruled-fade absolute inset-0 -z-10 opacity-40" />
        <div className="mx-auto max-w-page px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-14">
          <Link href="/about" className="link-u inline-flex min-h-[44px] items-center gap-2 text-[14px] font-bold">
            <ArrowLeftIcon />
            {t('back')}
          </Link>

          <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-12">
            {/* 프로필 도판: 사진이 없으면 원고지 칸 한 글자로 대신한다 */}
            <div className="md:col-span-4">
              <div className="plate max-w-[240px] md:max-w-sm">
                <div className="aspect-[4/5] overflow-hidden bg-paper-2">
                  {member.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.profile_image} alt={name} className="plate__img" />
                  ) : (
                    <div aria-hidden className="ruled grid h-full w-full place-items-center">
                      <Cells text={Array.from(name)[0] || '·'} size="lg" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-8 md:pt-4">
              <p className="t-eyebrow">{t('eyebrow')}</p>
              <h1 aria-label={name} className="mt-5">
                <CellTitle text={name} />
              </h1>

              {role && (
                <p className="mt-6 flex items-center gap-3">
                  <span className="marker marker--outline">{role}</span>
                  {habom && (
                    <span data-brand="habom" aria-hidden className="inline-flex">
                      <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                    </span>
                  )}
                </p>
              )}

              {bio && <p className="t-prose mt-8 whitespace-pre-line break-keep">{bio}</p>}

              {links.length > 0 && (
                <div className="mt-10">
                  <h2 className="t-eyebrow">{t('social')}</h2>
                  <ul className="mt-3 flex flex-wrap gap-3">
                    {links.map((l) => (
                      <li key={l.id}>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                          <SocialIcon id={l.id} className="h-4 w-4" />
                          {l.label}
                          <span className="font-mono text-[12px] font-normal opacity-70">{l.id === 'website' ? '' : handleOf(l.url)}</span>
                          <span className="sr-only">{tp('external')}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} locale={locale} projectLabel={t('project')} levelLabel={(n) => t('skillLevel', { level: n })} />
      ))}
    </Shell>
  );
}

/** 어드민에서 채우는 보조 섹션. 왼쪽 열 제목 + 오른쪽 열 내용(4:8). */
function SectionBlock({
  section,
  locale,
  projectLabel,
  levelLabel,
}: {
  section: TeamMemberSection;
  locale: string;
  projectLabel: string;
  levelLabel: (n: number) => string;
}) {
  const title = getLocalizedField(section, 'title', locale);
  const content = getLocalizedField(section, 'content', locale);
  const hid = `section-${section.id}`;

  let body: React.ReactNode = null;

  switch (section.section_type) {
    case 'text':
      body = content ? <p className="t-prose whitespace-pre-line break-keep">{content}</p> : null;
      break;

    case 'custom':
      body = content ? <RichText html={content} /> : null;
      break;

    case 'gallery':
      body = section.images?.length ? (
        <ul className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          {section.images.map((src, i) => (
            <li key={i} className="plate">
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" className="plate__img" />
              </div>
            </li>
          ))}
        </ul>
      ) : null;
      break;

    case 'video': {
      const src = safeUrl(section.video_url);
      body = src ? (
        <div className="plate">
          <div className="aspect-video overflow-hidden">
            <iframe
              src={toEmbedUrl(src)}
              title={title || 'video'}
              loading="lazy"
              className="h-full w-full"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : null;
      break;
    }

    case 'links': {
      const items = (section.links || []).filter((l) => safeUrl(l.url));
      body = items.length ? (
        <ul className="flex flex-wrap gap-3">
          {items.map((l, i) => (
            <li key={i}>
              <a href={safeUrl(l.url)} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
                <SocialIcon id={l.icon || ''} className="h-4 w-4" />
                {l.name}
                <ArrowUpRightIcon />
              </a>
            </li>
          ))}
        </ul>
      ) : null;
      break;
    }

    case 'projects':
      body = section.projects?.length ? (
        <ul className="grid gap-8 sm:grid-cols-2">
          {section.projects.map((p, i) => {
            const pt = getLocalizedField(p, 'title', locale);
            const pd = getLocalizedField(p, 'description', locale);
            const url = safeUrl(p.url);
            return (
              <li key={i}>
                {p.image && (
                  <div className="plate mb-4">
                    <div className="aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" loading="lazy" className="plate__img" />
                    </div>
                  </div>
                )}
                {pt && <h3 className="break-keep font-display text-[20px] font-extrabold leading-snug">{pt}</h3>}
                {pd && <p className="mt-2 break-keep font-serif text-[15px] leading-7 text-ink-2">{pd}</p>}
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="link-u mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-bold">
                    {projectLabel}
                    <ArrowUpRightIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      ) : null;
      break;

    case 'skills':
      body = section.skills?.length ? (
        <ul className="border-t border-ink">
          {section.skills.map((sk, i) => {
            const level = Math.max(0, Math.min(5, Math.round(sk.level || 0)));
            return (
              <li key={i} className="flex items-center justify-between gap-6 border-b border-ink/15 py-4">
                <span className="break-keep font-serif text-[17px]">{getLocalizedField(sk, 'name', locale)}</span>
                <span className="flex items-center gap-1.5" role="img" aria-label={levelLabel(level)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} aria-hidden className={`h-3 w-3 border border-ink ${n <= level ? 'bg-ink' : ''}`} />
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null;
      break;

    case 'timeline':
      body = section.timeline_items?.length ? (
        <ol className="border-t border-ink">
          {section.timeline_items.map((it, i) => (
            <li key={i} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-ink/15 py-4">
              <span className="font-mono text-[13px] leading-7 text-accent-text">{it.date}</span>
              <span className="break-keep font-serif text-[17px] leading-8">{getLocalizedField(it, 'event', locale)}</span>
            </li>
          ))}
        </ol>
      ) : null;
      break;
  }

  if (!body) return null;

  return (
    <section aria-labelledby={title ? hid : undefined} className="border-t border-ink/15 even:bg-paper-2">
      <div className="mx-auto grid max-w-page gap-8 px-5 py-14 md:grid-cols-12 md:gap-12 md:px-10 md:py-20">
        <div className="md:col-span-4">
          {title && (
            <h2 id={hid} className="t-display break-keep text-[clamp(24px,3vw,36px)]">
              {title}
            </h2>
          )}
        </div>
        <div className="min-w-0 md:col-span-8">{body}</div>
      </div>
    </section>
  );
}
