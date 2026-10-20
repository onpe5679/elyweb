import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import GameDetailView from '@/components/detail/GameDetailView';
import DialogueDemo, { DemoLauncher } from '@/components/habom/DialogueDemo';
import { DEMO_SCRIPTS } from '@/lib/habom/demo-script';
import { buildGameSpec } from '@/lib/game-spec';
import { getGameLabel, LABELS } from '@/lib/labels';
import { getGameBySlug, getGames, getGameSections, getLocalizedField } from '@/lib/supabase';
import { toWorkSummary } from '@/lib/works';

export const revalidate = 10;

type Props = { params: { locale: string; slug: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const game = await getGameBySlug(slug);
  if (!game) return {};
  return {
    title: { absolute: `${getLocalizedField(game, 'title', locale)} — ${LABELS.habom.localName[locale] || LABELS.habom.name}` },
    description: getLocalizedField(game, 'description', locale),
  };
}

export default async function HabomGamePage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  const game = await getGameBySlug(slug);
  if (!game) notFound();
  const label = getGameLabel(game);
  if (label !== 'habom') redirect(`/${locale}${LABELS[label].gamesBase}/${slug}`);

  const [t, sections, games] = await Promise.all([getTranslations('Detail'), getGameSections(slug), getGames()]);
  const spec = buildGameSpec(game, sections, locale);
  const more = games
    .filter((g) => g.slug !== slug && getGameLabel(g) === 'habom')
    .map((g) => toWorkSummary(g, locale))
    .slice(0, 4);

  // The dialogue/choice demo exists only on Habom game pages, and only when a script is provided.
  const script = DEMO_SCRIPTS[slug]?.[locale] || DEMO_SCRIPTS[slug]?.ko;
  const demo = script
    ? {
        label: t('tabDemo'),
        node: <DialogueDemo script={script} background={spec.banner} steamUrl={spec.steamUrl} title={spec.title} />,
      }
    : undefined;

  return (
    <GameDetailView
      spec={spec}
      locale={locale}
      variant="habom"
      more={more}
      demo={demo}
      heroExtra={
        script ? (
          <DemoLauncher className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-butter px-6 text-[0.9375rem] font-semibold text-plum transition-transform hover:-translate-y-0.5" />
        ) : undefined
      }
    />
  );
}

export async function generateStaticParams() {
  const games = await getGames();
  return games.filter((g) => getGameLabel(g) === 'habom').map((game) => ({ slug: game.slug }));
}
