import { getTranslations } from 'next-intl/server';
import { getGames, getLocalizedField, getStatusTagColor, getStatusText } from '@/lib/supabase';
import GamesGrid, { GamesGridItem } from '@/components/games/GamesGrid';

const ALL_LABEL: Record<string, string> = {
  ko: '전체 시리즈',
  en: 'All Series',
  ja: 'すべてのシリーズ',
};

export default async function GamesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const tGames = await getTranslations('GamesPage');
  const games = await getGames();

  const items: GamesGridItem[] = games.map((game) => ({
    slug: game.slug,
    series: getLocalizedField(game, 'series', locale),
    title: getLocalizedField(game, 'title', locale),
    desc: getLocalizedField(game, 'description', locale),
    image: game.thumbnail_image || game.cover_image || '',
    statusText: getStatusText(game.status, locale),
    statusColor: getStatusTagColor(game.status),
  }));

  return (
    <div className="pt-24 pb-16 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">
            {tGames('subtitle')}
          </h4>
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white uppercase tracking-tight">
            {tGames('title')}
          </h1>
        </div>

        <GamesGrid items={items} locale={locale} allLabel={ALL_LABEL[locale] || ALL_LABEL.en} />
      </div>
    </div>
  );
}
