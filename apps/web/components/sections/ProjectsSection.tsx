'use client';

import { useTranslations } from 'next-intl';
import FeaturedGame from '@/components/games/FeaturedGame';
import GameCard from '@/components/games/GameCard';
import { Game, getLocalizedField, getStatusTagColor, getStatusText } from '@/lib/supabase';

interface ProjectsSectionProps {
  games: Game[];
  featuredGame: Game | null;
  locale: string;
}

export default function ProjectsSection({ games, featuredGame, locale }: ProjectsSectionProps) {
  const t = useTranslations('Projects');

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

        {featuredGame && (
          <FeaturedGame game={featuredGame} locale={locale} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
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
