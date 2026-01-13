'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Game, getLocalizedField, getLocalizedArray, getStatusText, getStatusTagColor } from '@/lib/supabase';

interface FeaturedGameProps {
  game: Game;
  locale: string;
}

export default function FeaturedGame({ game, locale }: FeaturedGameProps) {
  const t = useTranslations('Projects.memorialCircuit');
  const genres = getLocalizedArray(game, 'genre', locale);

  return (
    <div
      data-testid="featured-game"
      className="mb-16 card-hover bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative h-64 lg:h-auto overflow-hidden">
          <div
            data-testid="game-status-badge"
            className={`absolute top-4 left-4 ${getStatusTagColor(game.status)} text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider z-10`}
          >
            {getStatusText(game.status, locale)}
          </div>
          {game.cover_image && (
            <img
              alt={getLocalizedField(game, 'title', locale)}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              src={game.cover_image}
            />
          )}
        </div>

        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-2 text-primary font-semibold text-sm uppercase tracking-wide">
            {getLocalizedField(game, 'series', locale)}
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {getLocalizedField(game, 'title', locale)}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed whitespace-pre-line">
            {getLocalizedField(game, 'description', locale)}
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {genres.map((genre, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {game.steam_url && (
              <a
                href={game.steam_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <i className="fa-brands fa-steam"></i> {t('steam')}
              </a>
            )}
            <Link
              href={`/${locale}/games/${game.slug}`}
              className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary font-medium transition-colors"
            >
              {t('details')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
