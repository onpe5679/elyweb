import { getTranslations } from 'next-intl/server';
import { getGames, getLocalizedField, getStatusText } from '@/lib/supabase';
import { isHobomGame } from '@/lib/studios';
import GamesGrid from '@/components/games/GamesGrid';

const ALL_LABEL: Record<string, string> = {
  ko: '전체 시리즈',
  en: 'All Series',
  ja: 'すべてのシリーズ',
};

export default async function GamesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const tGames = await getTranslations('GamesPage');
  const games = await getGames();

  const items = games.map((game) => ({
    slug: game.slug,
    series: getLocalizedField(game, 'series', locale),
    title: getLocalizedField(game, 'title', locale),
    desc: getLocalizedField(game, 'description', locale),
    image: game.thumbnail_image || game.cover_image || '',
    statusText: getStatusText(game.status, locale),
    hobom: isHobomGame(game),
  }));

  return (
    <div className="min-h-screen bg-paper pb-32 pt-36 md:pt-44">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="grid gap-10 border-b border-ink pb-16 lg:grid-cols-12 lg:items-end">
          <h1 className="font-display text-6xl leading-none text-ink md:text-8xl lg:vertical-accent lg:col-span-2 lg:h-64 lg:text-7xl">
            {tGames('title')}
          </h1>
          <div className="lg:col-span-8 lg:col-start-4">
            <p className="eyebrow">{tGames('subtitle')}</p>
            <p className="mt-8 max-w-xl text-base leading-loose text-ink-2 md:text-lg">{tGames('intro')}</p>
          </div>
        </header>

        <div className="mt-20">
          <GamesGrid
            items={items}
            allLabel={ALL_LABEL[locale] || ALL_LABEL.en}
            filterLabel={ALL_LABEL[locale] || ALL_LABEL.en}
          />
        </div>
      </div>
    </div>
  );
}
