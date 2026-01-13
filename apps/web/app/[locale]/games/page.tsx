import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getGames, getLocalizedField, getStatusTagColor, getStatusText } from '@/lib/supabase';

export default async function GamesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const tGames = await getTranslations('GamesPage');
  const games = await getGames();

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/${locale}/games/${game.slug}`}
              data-testid="game-card"
              className="card-hover group bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 transition-colors duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <div
                  data-testid="game-status-badge"
                  className={`absolute top-4 left-4 ${getStatusTagColor(game.status)} text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider z-10`}
                >
                  {getStatusText(game.status, locale)}
                </div>
                {game.cover_image && (
                  <img
                    alt={getLocalizedField(game, 'title', locale)}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    src={game.cover_image}
                  />
                )}
              </div>
              <div className="p-6">
                <div className="mb-1 text-primary font-medium text-xs uppercase">
                  {getLocalizedField(game, 'series', locale)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {getLocalizedField(game, 'title', locale)}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                  {getLocalizedField(game, 'description', locale)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
