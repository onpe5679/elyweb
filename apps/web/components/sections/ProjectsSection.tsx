'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import FeaturedGame from '@/components/games/FeaturedGame';
import GameCard from '@/components/games/GameCard';
import { Game, getLocalizedField, getStatusTagColor, getStatusText } from '@/lib/supabase';

interface ProjectsSectionProps {
  games: Game[];
  featuredGame: Game | null;
  locale: string;
}

const ALL_LABEL: Record<string, string> = {
  ko: '전체 시리즈',
  en: 'All Series',
  ja: 'すべてのシリーズ',
};

export default function ProjectsSection({ games, featuredGame, locale }: ProjectsSectionProps) {
  const t = useTranslations('Projects');

  const seriesList = useMemo(
    () => Array.from(new Set(games.map((g) => getLocalizedField(g, 'series', locale)).filter(Boolean))),
    [games, locale]
  );
  const [selected, setSelected] = useState('');

  const filteredGames = selected
    ? games.filter((g) => getLocalizedField(g, 'series', locale) === selected)
    : games;
  const showFeatured =
    featuredGame && (!selected || getLocalizedField(featuredGame, 'series', locale) === selected);

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300" id="projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h4 className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">
            {t('label')}
          </h4>
          <h2 className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white uppercase tracking-tight">
            {t('title')}
          </h2>
        </div>

        {showFeatured && <FeaturedGame game={featuredGame!} locale={locale} />}

        {seriesList.length > 0 && (
          <div className="flex justify-end mb-8">
            <select
              data-testid="series-filter"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{ALL_LABEL[locale] || ALL_LABEL.en}</option>
              {seriesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGames.map((game) => (
            <GameCard
              key={game.slug}
              game={{
                slug: game.slug,
                tag: getStatusText(game.status, locale),
                overlay: getLocalizedField(game, 'description', locale),
                series: getLocalizedField(game, 'series', locale),
                title: getLocalizedField(game, 'title', locale),
                desc: getLocalizedField(game, 'description', locale),
                image: game.thumbnail_image || game.cover_image || '',
                tagColor: getStatusTagColor(game.status),
              }}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
