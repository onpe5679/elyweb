import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import GameDetailView from '@/components/detail/GameDetailView';
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
    title: getLocalizedField(game, 'title', locale),
    description: getLocalizedField(game, 'description', locale),
    openGraph: { images: game.banner_image ? [game.banner_image] : undefined },
  };
}

export default async function GameDetailPage({ params: { locale, slug } }: Props) {
  const game = await getGameBySlug(slug);
  if (!game) notFound();

  // Games from another studio label live under that label's own pages and theme.
  const label = getGameLabel(game);
  if (label !== 'elysian') redirect(`/${locale}${LABELS[label].gamesBase}/${slug}`);

  const [sections, games] = await Promise.all([getGameSections(slug), getGames()]);
  const spec = buildGameSpec(game, sections, locale);
  const more = games
    .filter((g) => g.slug !== slug && getGameLabel(g) === 'elysian')
    .map((g) => toWorkSummary(g, locale))
    .sort((a, b) => Number(b.series === spec.series) - Number(a.series === spec.series))
    .slice(0, 4);

  return <GameDetailView spec={spec} locale={locale} variant="elysian" more={more} />;
}

export async function generateStaticParams() {
  const games = await getGames();
  return games.filter((g) => getGameLabel(g) === 'elysian').map((game) => ({ slug: game.slug }));
}
