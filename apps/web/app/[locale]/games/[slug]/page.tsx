import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryDetail from "@/components/games/StoryDetail";
import {
  getEditorialGame,
  getEditorialGames,
  getEditorialSections,
  isHabomGame,
} from "@/lib/editorial";
import { getLocalizedField } from "@/lib/supabase";

type PageProps = { params: { locale: string; slug: string } };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const game = await getEditorialGame(params.slug);
  if (!game) return {};
  return {
    title: `${getLocalizedField(game, "title", params.locale)} — Studio Elysian`,
    description:
      getLocalizedField(game, "description", params.locale) || undefined,
  };
}

export default async function GameDetailPage({ params }: PageProps) {
  const game = await getEditorialGame(params.slug);
  if (!game) notFound();

  const [sections, games] = await Promise.all([
    getEditorialSections(game.id),
    getEditorialGames(),
  ]);
  const relatedGames = games
    .filter(
      (item) => item.id !== game.id && isHabomGame(item) === isHabomGame(game),
    )
    .sort(
      (a, b) =>
        Number(b.series_ko === game.series_ko) -
        Number(a.series_ko === game.series_ko),
    )
    .slice(0, 3);

  return (
    <StoryDetail
      game={game}
      sections={sections}
      relatedGames={relatedGames}
      locale={params.locale}
    />
  );
}

export async function generateStaticParams() {
  const games = await getEditorialGames();
  return games.map((game) => ({ slug: game.slug }));
}
