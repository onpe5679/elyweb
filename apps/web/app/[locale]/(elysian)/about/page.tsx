import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import PageHeader from '@/components/elysian/PageHeader';
import { COMPANY_LINES } from '@/components/elysian/SiteFooter';
import Icon from '@/components/ui/Icon';
import { LABELS } from '@/lib/labels';
import { getLocalizedField, getLocalizedSettingValue, getSettings, getTeamMembers, getTimelineEvents } from '@/lib/supabase';

export const revalidate = 10;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('About');
  return { title: t('title') };
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  const [t, tv, ts, timeline, team, settings] = await Promise.all([
    getTranslations('About'),
    getTranslations('Vision'),
    getTranslations('Site'),
    getTimelineEvents(),
    getTeamMembers(),
    getSettings([
      'about_image', 'vision_title', 'vision_description', 'funding_percentage',
      'stat_year_value', 'stat_year_label', 'stat_projects_value', 'stat_projects_label',
      'stat_released_value', 'stat_released_label', 'stat_global_value', 'stat_global_label',
    ]),
  ]);
  const sv = (key: string) => getLocalizedSettingValue(settings[key], locale);
  const visionParagraphs = (sv('vision_description') || [tv('p1'), tv('p2'), tv('p3')].join('\n\n'))
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const facts = [
    { label: sv('stat_year_label'), value: sv('stat_year_value') },
    { label: sv('stat_projects_label'), value: sv('stat_projects_value') },
    { label: sv('stat_released_label'), value: sv('stat_released_value') },
    { label: t('funding'), value: sv('funding_percentage') },
    { label: sv('stat_global_label'), value: sv('stat_global_value') },
  ].filter((f) => f.value && f.label);

  // Group the chronicle by year; non-dated rows (e.g. "AND NOW...") close the list.
  const years = new Map<string, typeof timeline>();
  for (const e of timeline) {
    const y = /^\d{4}/.test(e.date) ? e.date.slice(0, 4) : '';
    years.set(y, [...(years.get(y) || []), e]);
  }

  return (
    <>
      <PageHeader kicker={ts('studioName')} title={t('title')} latin={t('latin')} />

      {/* Vision */}
      <section aria-labelledby="vision-title" className="mx-auto grid max-w-page gap-14 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label text-accent">{t('visionLabel')}</p>
          <h2 id="vision-title" className="mt-3 font-serif text-[2rem] font-semibold leading-snug md:text-[2.75rem]">{sv('vision_title') || tv('title')}</h2>
          <div className="reading mt-8 font-serif text-[1.0625rem] leading-[1.95] text-ink-soft">
            {visionParagraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
        {sv('about_image') && (
          <figure className="lg:col-span-5">
            <div className="crop-marks">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sv('about_image')} alt="" className="aspect-[4/5] w-full object-cover" />
            </div>
          </figure>
        )}
      </section>

      {/* Mission */}
      <section aria-labelledby="mission-title" className="on-night bg-night text-on-night">
        <div className="mx-auto max-w-page px-5 py-20 md:px-10 md:py-28">
          <p className="label text-accent-night">{t('missionLabel')}</p>
          <h2 id="mission-title" className="sr-only">{tv('missionTitle')}</h2>
          <p className="mt-6 max-w-4xl font-serif text-[1.625rem] leading-[1.6] md:text-[2.25rem]">{tv('missionBody')}</p>
        </div>
      </section>

      {/* Facts */}
      {facts.length > 0 && (
        <section aria-labelledby="facts-title" className="mx-auto max-w-page px-5 py-20 md:px-10 md:py-24">
          <h2 id="facts-title" className="label text-ink-mute">{t('facts')}</h2>
          <dl className="mt-6 grid grid-cols-2 border-l border-t border-ink md:grid-cols-5">
            {facts.map((f) => (
              <div key={f.label} className="border-b border-r border-ink px-5 py-6 md:py-8">
                <dt className="label text-ink-mute">{f.label}</dt>
                <dd className="mt-3 font-latin text-[2.5rem] font-semibold leading-none md:text-[3rem]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* People */}
      {team.length > 0 && (
        <section aria-labelledby="people-title" className="border-t border-ink/15">
          <div className="mx-auto max-w-page px-5 py-20 md:px-10 md:py-24">
            <h2 id="people-title" className="font-serif text-[2rem] font-semibold md:text-[2.5rem]">
              {t('people')} <span className="font-latin text-[0.55em] italic text-ink-mute">{t('peopleLatin')}</span>
            </h2>
            <ul className="mt-10 grid gap-px bg-ink/20 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((m) => {
                const name = getLocalizedField(m, 'name', locale);
                return (
                  <li key={m.id} className="bg-paper">
                    <Link href={`/team/${m.slug}`} className="group flex h-full flex-col p-6">
                      {m.profile_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.profile_image} alt="" className="aspect-square w-full object-cover" />
                      ) : (
                        <span aria-hidden="true" className="ms-cell self-start font-semibold [--cell-size:4rem] group-hover:bg-ink group-hover:text-paper">{name.slice(0, 1)}</span>
                      )}
                      <span className="mt-6 font-serif text-xl font-semibold">{name}</span>
                      <span className="mt-1 text-[0.875rem] text-ink-soft">{getLocalizedField(m, 'role', locale)}</span>
                      <span className="mt-auto flex items-center gap-1.5 pt-6 text-[0.8125rem] text-ink-mute group-hover:text-ink">
                        <span className="link-underline">{t('profile')}</span> <Icon name="arrowRight" size={14} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Studios */}
      <section aria-labelledby="labels-title" className="border-t border-ink/15">
        <div className="mx-auto grid max-w-page gap-6 px-5 py-16 md:grid-cols-[1fr_2fr] md:px-10">
          <h2 id="labels-title" className="font-serif text-2xl font-semibold">{t('labels')}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="flex min-h-[64px] items-center justify-between border border-ink px-5">
              <span className="font-latin text-lg font-semibold uppercase tracking-[0.12em]">{LABELS.elysian.name}</span>
              <span className="label text-ink-mute">{LABELS.elysian.localName[locale]}</span>
            </li>
            <li>
              <Link href="/habom" className="flex min-h-[64px] items-center justify-between rounded-full bg-cream px-6 text-plum ring-1 ring-blush transition hover:ring-rose">
                <span className="font-round text-lg">{LABELS.habom.localName[locale]}</span>
                <Icon name="arrowRight" size={16} className="text-rose" />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* History */}
      <section id="history" aria-labelledby="history-title" className="scroll-mt-20 border-t border-ink/15 bg-paper-deep/60">
        <div className="mx-auto max-w-page px-5 py-20 md:px-10 md:py-28">
          <h2 id="history-title" className="font-serif text-[2rem] font-semibold md:text-[2.5rem]">
            {t('history')} <span className="font-latin text-[0.55em] italic text-ink-mute">{t('historyLatin')}</span>
          </h2>
          <div className="mt-12 border-t border-ink">
            {Array.from(years.entries()).map(([year, events]) => (
              <div key={year || 'now'} className="grid gap-4 border-b border-ink/20 py-8 md:grid-cols-12">
                <p className={`font-latin text-[2.75rem] font-semibold leading-none md:col-span-3 md:text-[3.5rem] ${year ? '' : 'italic text-accent'}`}>{year || '…'}</p>
                <ol className="space-y-4 md:col-span-9">
                  {events.map((e) => (
                    <li key={e.id} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-6">
                      <span className="font-mono text-sm text-accent">{e.date}</span>
                      <span className="font-serif text-[1.0625rem] leading-relaxed">{getLocalizedField(e, 'title', locale).replace(/🎮/g, '').trim()}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company */}
      <section aria-labelledby="company-title" className="mx-auto max-w-page px-5 py-20 md:px-10">
        <h2 id="company-title" className="label text-ink-mute">{t('company')}</h2>
        <dl className="mt-6 border-t border-ink text-[0.9375rem]" lang="ko">
          {COMPANY_LINES.map(([k, v]) => (
            <div key={k} className="grid gap-1 border-b border-ink/15 py-4 sm:grid-cols-[12rem_1fr]">
              <dt className="text-ink-mute">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
