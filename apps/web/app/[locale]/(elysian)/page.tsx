import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import TitleScreen from '@/components/elysian/TitleScreen';
import WorksIndex from '@/components/elysian/WorksIndex';
import ChapterHeading from '@/components/elysian/ChapterHeading';
import Icon from '@/components/ui/Icon';
import { LABELS } from '@/lib/labels';
import {
  getGames,
  getHomeTimelineEvents,
  getLocalizedField,
  getLocalizedSettingValue,
  getSettings,
} from '@/lib/supabase';
import { stripEmphasis, toWorkSummary } from '@/lib/works';

export const revalidate = 10;

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const [t, tv, games, timeline, settings] = await Promise.all([
    getTranslations('Home'),
    getTranslations('Vision'),
    getGames(),
    getHomeTimelineEvents(),
    getSettings([
      'hero_title', 'hero_description', 'about_image', 'vision_title', 'vision_description',
      'stat_year_value', 'stat_year_label', 'stat_projects_value', 'stat_projects_label',
      'stat_released_value', 'stat_released_label', 'stat_global_value', 'stat_global_label',
      'news_widget_x_handle', 'twitter_url',
    ]),
  ]);
  const sv = (key: string) => getLocalizedSettingValue(settings[key], locale);

  const works = games.map((g) => toWorkSummary(g, locale));
  const elysianWorks = works.filter((w) => w.label === 'elysian');
  const habomWorks = works.filter((w) => w.label === 'habom');
  const seriesCount = new Set(elysianWorks.map((w) => w.series).filter(Boolean)).size;

  const tagline = stripEmphasis(sv('hero_title') || 'For Story-Lovers,\nBy Storytellers')
    .replace(/\s*\n\s*/g, ' ')
    .toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, p, c) => p + c.toUpperCase());
  const visionParagraphs = (sv('vision_description') || [tv('p1'), tv('p2'), tv('p3')].join('\n\n'))
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const stats = [
    ['stat_year_value', 'stat_year_label'],
    ['stat_projects_value', 'stat_projects_label'],
    ['stat_released_value', 'stat_released_label'],
    ['stat_global_value', 'stat_global_label'],
  ].map(([v, l]) => ({ value: sv(v), label: sv(l) })).filter((s) => s.value);
  const xHandle = sv('news_widget_x_handle').replace(/^@/, '');
  const xUrl = sv('twitter_url') || (xHandle ? `https://x.com/${xHandle}` : '');

  return (
    <>
      <TitleScreen
        tagline={tagline}
        description={sv('hero_description')}
        year={sv('stat_year_value') || '2022'}
        startTarget="chapter-works"
        strips={elysianWorks.map((w) => ({ slug: w.slug, href: w.href, title: w.title, altTitle: w.altTitle, image: w.banner, series: w.series }))}
      />

      {/* 1. Works */}
      <section aria-labelledby="chapter-works" className="mx-auto max-w-page px-5 py-24 md:px-10 md:py-32" id="projects">
        <ChapterHeading
          id="chapter-works"
          number={1}
          kicker={t('chapter', { n: 1 })}
          title={t('worksTitle')}
          latin={t('worksLatin')}
          aside={<p className="font-mono text-xs uppercase tracking-[0.14em]">{t('worksSummary', { works: elysianWorks.length, series: seriesCount })}</p>}
        />
        <div className="mt-4">
          <WorksIndex works={elysianWorks} />
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/games" className="group inline-flex min-h-[48px] items-center gap-3 bg-ink px-6 text-[0.9375rem] text-paper transition-colors hover:bg-accent">
            {t('worksAll')} <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* 2. Studio */}
      <section aria-labelledby="chapter-studio" className="border-y border-ink/15 bg-paper-deep/60">
        <div className="mx-auto max-w-page px-5 py-24 md:px-10 md:py-32">
          <ChapterHeading id="chapter-studio" number={2} kicker={t('chapter', { n: 2 })} title={t('studioTitle')} latin={t('studioLatin')} />
          <div className="mt-14 grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="font-serif text-[1.75rem] font-semibold leading-snug tracking-[-0.01em] md:text-[2.375rem]">{sv('vision_title') || tv('title')}</p>
              <div className="reading mt-8 max-w-2xl font-serif text-[1.0625rem] leading-[1.95] text-ink-soft">
                {visionParagraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <Link href="/about" className="group mt-10 inline-flex items-center gap-2 text-[0.9375rem] font-medium">
                <span className="link-underline">{t('studioMore')}</span>
                <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <figure className="lg:col-span-5">
              <div className="crop-marks">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sv('about_image')} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover grayscale-[15%]" />
              </div>
            </figure>
          </div>

          {stats.length > 0 && (
            <dl className="mt-20 grid grid-cols-2 border-l border-t border-ink md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="border-b border-r border-ink px-5 py-6 md:px-7 md:py-8">
                  <dt className="label text-ink-mute">{s.label}</dt>
                  <dd className="mt-3 font-latin text-[2.75rem] font-semibold leading-none md:text-[3.5rem]">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* 3. Chronicle */}
      {timeline.length > 0 && (
        <section aria-labelledby="chapter-chronicle" className="mx-auto max-w-page px-5 py-24 md:px-10 md:py-32">
          <ChapterHeading
            id="chapter-chronicle"
            number={3}
            kicker={t('chapter', { n: 3 })}
            title={t('chronicleTitle')}
            latin={t('chronicleLatin')}
            aside={
              <Link href="/about#history" className="group inline-flex items-center gap-2 text-ink">
                <span className="link-underline">{t('chronicleAll')}</span>
                <Icon name="arrowRight" size={16} />
              </Link>
            }
          />
          <ol className="mt-12 grid gap-px bg-ink/20 md:grid-cols-3">
            {timeline.map((e) => (
              <li key={e.id} className="bg-paper py-6 md:px-8 md:py-4 md:first:pl-0">
                <p className="font-latin text-[2.5rem] font-semibold leading-none text-accent">{e.date}</p>
                <p className="mt-4 font-serif text-[1.0625rem] leading-relaxed">{getLocalizedField(e, 'title', locale).replace(/🎮/g, '').trim()}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 4. Studios (labels) */}
      <section aria-labelledby="chapter-labels" className="mx-auto max-w-page px-5 pb-24 md:px-10 md:pb-32">
        <ChapterHeading id="chapter-labels" number={4} kicker={t('chapter', { n: 4 })} title={t('labelsTitle')} latin={t('labelsLatin')} aside={<p>{t('labelsLead')}</p>} />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-between border border-ink p-8 md:p-10">
            <div>
              <p className="label text-ink-mute">{t('labelsHere')}</p>
              <p className="mt-4 font-latin text-[2rem] font-semibold uppercase tracking-[0.12em]">{LABELS.elysian.name}</p>
              <p className="mt-1 font-serif text-lg">{LABELS.elysian.localName[locale]}</p>
            </div>
            <p className="mt-10 max-w-sm font-serif text-[0.9375rem] leading-relaxed text-ink-soft">{t('labelsElysianDesc')}</p>
          </div>

          <Link href="/habom" className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] bg-cream p-8 text-plum transition-transform duration-300 hover:-translate-y-1 md:p-10">
            <span aria-hidden="true" className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-blush" />
            <span aria-hidden="true" className="absolute -bottom-14 right-24 h-28 w-28 rounded-full bg-butter-soft" />
            <div className="relative">
              <p className="font-round-latin text-xs font-bold uppercase tracking-[0.14em] text-rose">{LABELS.habom.name}</p>
              <p className="mt-3 font-round text-[2.5rem] leading-none text-plum">{LABELS.habom.localName[locale]}</p>
            </div>
            <div className="relative mt-10 flex items-end justify-between gap-6">
              <div>
                <p className="max-w-xs text-[0.9375rem] leading-relaxed text-plum-soft">{t('labelsHabomDesc')}</p>
                {habomWorks.length > 0 && (
                  <p className="mt-3 font-round text-lg text-plum">{habomWorks.map((w) => w.title).join(' · ')}</p>
                )}
              </div>
              <span className="flex shrink-0 items-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-semibold text-white">
                {t('labelsVisit')} <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. News + contact */}
      <section aria-labelledby="chapter-news" className="border-t border-ink/15">
        <div className="mx-auto grid max-w-page gap-14 px-5 py-24 md:px-10 md:py-28 lg:grid-cols-2">
          <div>
            <p className="label text-ink-mute">{t('chapter', { n: 5 })}</p>
            <h2 id="chapter-news" className="mt-2 font-serif text-[2.25rem] font-semibold md:text-[2.75rem]">
              {t('newsTitle')} <span className="font-latin text-[0.55em] font-medium italic text-ink-mute">{t('newsLatin')}</span>
            </h2>
            <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">{t('newsBody')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/news" className="inline-flex min-h-[48px] items-center gap-2 border border-ink px-5 text-[0.9375rem] transition-colors hover:bg-ink hover:text-paper">
                {t('newsPage')} <Icon name="arrowRight" size={16} />
              </Link>
              {xUrl && (
                <a href={xUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center gap-2 px-2 text-[0.9375rem]">
                  <Icon name="x" size={16} /> <span className="link-underline">@{xHandle || 'X'}</span> <Icon name="arrowUpRight" size={14} />
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-between bg-night p-8 text-on-night md:p-10">
            <p className="font-serif text-[1.375rem] leading-relaxed md:text-[1.625rem]">{t('contactLead')}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex min-h-[48px] items-center gap-2 bg-on-night px-5 text-[0.9375rem] text-night transition-colors hover:bg-accent-night">
                {t('contactCta')} <Icon name="arrowRight" size={16} />
              </Link>
              <Link href="/press" className="inline-flex min-h-[48px] items-center gap-2 border border-on-night/40 px-5 text-[0.9375rem] transition-colors hover:border-on-night">
                {t('pressCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
