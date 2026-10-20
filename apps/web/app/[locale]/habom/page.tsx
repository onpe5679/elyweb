import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Icon from '@/components/ui/Icon';
import { LABELS } from '@/lib/labels';
import { getGames, getLocalizedField, getTeamMembers } from '@/lib/supabase';
import { toWorkSummary } from '@/lib/works';

export const revalidate = 10;

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return { title: { absolute: LABELS.habom.localName[locale] || LABELS.habom.name } };
}

export default async function HabomHome({ params: { locale } }: { params: { locale: string } }) {
  const [t, ts, tw, games, team] = await Promise.all([getTranslations('Habom'), getTranslations('Status'), getTranslations('Works'), getGames(), getTeamMembers()]);
  const works = games.map((g) => toWorkSummary(g, locale)).filter((w) => w.label === 'habom');
  const hero = works[0];
  // Team members whose role names the studio (e.g. 「하봄 스튜디오 팀장」)
  const leads = team.filter((m) => LABELS.habom.match.some((k) => [m.role_ko, m.role_en, m.role_ja].join(' ').toLowerCase().includes(k)));

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="habom-title" className="manuscript-grid--habom relative overflow-hidden pb-16 pt-24 md:pb-24 md:pt-32">
        <span aria-hidden="true" className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-blush" />
        <span aria-hidden="true" className="absolute right-[8%] top-28 h-24 w-24 rounded-full bg-butter-soft motion-safe:animate-float" />
        <span aria-hidden="true" className="absolute -bottom-24 right-[30%] h-64 w-64 rounded-full bg-butter-soft/70" />
        <div className="relative mx-auto grid max-w-page items-center gap-12 px-5 md:px-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-plum-soft ring-1 ring-blush">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-rose" /> {t('kicker')}
            </p>
            <h1 id="habom-title" className="mt-6 font-round text-[3.5rem] leading-[1.02] text-plum md:text-[5.5rem]">
              {t('title')}
            </h1>
            <p className="mt-2 font-round-latin text-xl font-extrabold text-rose md:text-2xl">habom studio</p>
            <p className="mt-6 max-w-md text-[1.125rem] leading-relaxed text-plum-soft">{t('copy')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#works" className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-rose px-6 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(201,65,109,.8)] transition-transform hover:-translate-y-0.5">
                {t('worksTitle')} <Icon name="chevronDown" size={16} />
              </a>
              <a href="#about" className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-white px-6 text-[0.9375rem] font-semibold ring-1 ring-plum/15 hover:ring-rose">
                {t('navAbout')}
              </a>
            </div>
          </div>
          {hero && (
            <div className="relative lg:col-span-7">
              <div className="overflow-hidden rounded-[36px] bg-blush shadow-[0_40px_80px_-40px_rgba(74,43,56,.45)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={hero.banner} alt="" className="aspect-[4/3] w-full object-cover md:aspect-[16/11]" />
              </div>
              <span aria-hidden="true" className="absolute -left-4 bottom-10 hidden rounded-[22px] rounded-bl-[6px] bg-white px-5 py-3 font-round text-xl text-plum shadow-lg md:block">
                {hero.title}
              </span>
              <span aria-hidden="true" className="absolute -right-3 -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-butter text-plum shadow-md">
                <Icon name="sparkle" size={22} />
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Works */}
      <section id="works" aria-labelledby="works-title" className="scroll-mt-20 bg-white/60 py-20 md:py-28">
        <div className="mx-auto max-w-page px-5 md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="works-title" className="font-round text-[2.5rem] leading-none md:text-[3.25rem]">{t('worksTitle')}</h2>
              <p className="mt-3 text-plum-soft">{t('worksLead')}</p>
            </div>
            <p className="text-sm font-bold text-rose">{tw('count', { count: works.length })}</p>
          </div>

          <ul className="mt-12 space-y-8">
            {works.map((w) => (
              <li key={w.slug}>
                <article className="grid gap-8 overflow-hidden rounded-[32px] bg-cream p-4 ring-1 ring-blush md:p-6 lg:grid-cols-12 lg:items-center lg:gap-12">
                  <Link href={w.href} data-testid="game-card" aria-label={w.title} className="group block overflow-hidden rounded-[24px] lg:col-span-7">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.cover} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  </Link>
                  <div className="px-2 pb-4 lg:col-span-5 lg:pb-0">
                    <p className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-butter px-3 py-1 font-semibold">{ts(w.status as 'released')}</span>
                      {w.genres.map((g) => <span key={g} className="rounded-full bg-white px-3 py-1 text-plum-soft ring-1 ring-blush">{g}</span>)}
                    </p>
                    <h3 className="mt-5 font-round text-[2.25rem] leading-tight md:text-[2.75rem]">
                      <Link href={w.href} className="hover:text-rose">{w.title}</Link>
                    </h3>
                    {w.altTitle && <p className="mt-1 font-round-latin text-lg font-bold text-plum-soft">{w.altTitle}</p>}
                    <p className="mt-4 whitespace-pre-line leading-relaxed text-plum-soft">{w.logline}</p>
                    <div className="mt-7 flex flex-wrap gap-2">
                      <Link href={w.href} className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-rose px-5 text-[0.9375rem] font-semibold text-white">
                        {t('detail')} <Icon name="arrowRight" size={16} />
                      </Link>
                      <Link href={`${w.href}#demo`} className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-butter px-5 text-[0.9375rem] font-semibold text-plum">
                        <Icon name="chat" size={16} /> {t('tryDemo')}
                      </Link>
                      {w.steamUrl && (
                        <a href={w.steamUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-5 text-[0.9375rem] font-semibold ring-1 ring-plum/15">
                          <Icon name="steam" size={16} /> Steam <Icon name="arrowUpRight" size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* About */}
      <section id="about" aria-labelledby="about-title" className="scroll-mt-20 py-20 md:py-28">
        <div className="mx-auto grid max-w-page gap-10 px-5 md:px-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="about-title" className="font-round text-[2.25rem] leading-tight md:text-[3rem]">{t('aboutTitle')}</h2>
            <p className="mt-4 max-w-xl text-[1.125rem] leading-relaxed text-plum-soft">{t('aboutBody')}</p>
            <Link href="/" className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-5 font-semibold ring-1 ring-plum/15 hover:ring-rose">
              <Icon name="arrowLeft" size={16} /> {t('backLong')}
            </Link>
          </div>
          {leads.length > 0 && (
            <ul className="space-y-3 lg:col-span-5">
              {leads.map((m) => (
                <li key={m.id}>
                  <Link href={`/team/${m.slug}`} className="flex items-center gap-4 rounded-[24px] bg-white p-5 ring-1 ring-blush transition hover:ring-rose">
                    <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blush font-round text-2xl text-rose">
                      {getLocalizedField(m, 'name', locale).slice(0, 1)}
                    </span>
                    <span>
                      <span className="block text-xs font-semibold text-plum-soft">{t('lead')}</span>
                      <span className="block font-round text-xl">{getLocalizedField(m, 'name', locale)}</span>
                      <span className="block text-[0.875rem] text-plum-soft">{getLocalizedField(m, 'role', locale)}</span>
                    </span>
                    <Icon name="arrowRight" size={18} className="ml-auto text-rose" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
