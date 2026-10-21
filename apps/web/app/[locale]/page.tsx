import { Link } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getFeaturedGame,
  getGames,
  getHomeTimelineEvents,
  getLocalizedField,
  getLocalizedSettingValue,
  getSettings,
} from '@/lib/supabase';
import { toCard } from '@/lib/game-model';
import Shell from '@/components/shell/Shell';
import Cover from '@/components/home/Cover';
import WorksIndex from '@/components/home/WorksIndex';
import Statement from '@/components/home/Statement';
import HabomPortal from '@/components/home/HabomPortal';
import Chronology from '@/components/home/Chronology';
import { fmtDate, stripEmoji } from '@/lib/format';

export const revalidate = 10;

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const [t, games, featuredRow, events, s] = await Promise.all([
    getTranslations('Home'),
    getGames(),
    getFeaturedGame(),
    getHomeTimelineEvents(),
    getSettings([
      'hero_image', 'vision_title', 'vision_description',
      'stat_year_value', 'stat_projects_value', 'stat_released_value', 'stat_global_value',
    ]),
  ]);

  const cards = games.map((g) => toCard(g, locale));
  const elysian = cards.filter((c) => c.brand === 'elysian');
  const habom = cards.find((c) => c.brand === 'habom');

  // 대표작: 어드민에서 지정한 featured 가 엘리시안 작품이면 그것, 아니면 첫 번째 출시작
  const featuredCard = featuredRow ? cards.find((c) => c.slug === featuredRow.slug && c.brand === 'elysian') : undefined;
  const featured = featuredCard ?? elysian.find((c) => c.status === 'released') ?? elysian[0];
  const ordered = featured ? [featured, ...elysian.filter((c) => c.slug !== featured.slug)] : elysian;

  const visionTitle = getLocalizedSettingValue(s.vision_title, locale);
  const visionBody = getLocalizedSettingValue(s.vision_description, locale);
  const paragraphs = visionBody.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const sv = (k: string, fb: string) => getLocalizedSettingValue(s[k], locale) || fb;

  return (
    <Shell locale={locale}>
      <Cover
        works={ordered.map((c) => ({ slug: c.slug, title: c.title, series: c.series, status: c.status, image: c.wide }))}
      />
      <WorksIndex featured={featured} others={ordered.filter((c) => c.slug !== featured?.slug)} />
      <Statement
        title={visionTitle}
        paragraphs={paragraphs}
        image={s.hero_image?.value_ko}
        stats={[
          { value: sv('stat_year_value', '2022'), label: t('stats.year') },
          { value: sv('stat_projects_value', '3+'), label: t('stats.projects') },
          { value: sv('stat_released_value', '2'), label: t('stats.released') },
          { value: sv('stat_global_value', 'Global'), label: t('stats.global') },
        ]}
      />
      <HabomPortal game={habom} />
      <Chronology
        items={events.map((e) => ({ date: fmtDate(e.date, locale), title: stripEmoji(getLocalizedField(e, 'title', locale)) }))}
      />
      <section className="border-t border-ink/15 bg-ink text-paper">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-8 px-5 py-16 md:px-10">
          <div>
            <h2 className="t-display text-[clamp(26px,3.4vw,42px)]">{t('cta.title')}</h2>
            <p className="mt-3 text-[16px] opacity-75">{t('cta.body')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn !border-paper !bg-paper !text-ink">{t('cta.contact')}</Link>
            <Link href="/press" className="btn btn--ghost !border-paper/60 !text-paper hover:!bg-paper hover:!text-ink">{t('cta.press')}</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
