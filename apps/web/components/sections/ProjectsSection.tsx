'use client';

import {useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import FeaturedGame from '@/components/games/FeaturedGame';
import GameCard from '@/components/games/GameCard';
import {Game, getLocalizedField, getStatusText} from '@/lib/supabase';
import {isHobomGame} from '@/lib/studios';

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

export default function ProjectsSection({games, featuredGame, locale}: ProjectsSectionProps) {
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
    <section id="projects" className="scroll-mt-20 bg-paper py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">{t('label')}</p>
            <h2 className="font-display mt-6 text-5xl leading-none text-ink md:text-7xl">{t('title')}</h2>
          </div>

          {seriesList.length > 0 && (
            <div>
              <label htmlFor="series-filter-home" className="sr-only">{ALL_LABEL[locale] || ALL_LABEL.en}</label>
              <select
                id="series-filter-home"
                data-testid="series-filter"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="border-0 border-b border-ink bg-transparent py-2 pr-8 text-sm text-ink focus:border-seal focus:ring-0"
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
        </div>

        {showFeatured && (
          <div className="mt-20">
            <FeaturedGame game={featuredGame!} locale={locale} />
          </div>
        )}

        <div className="mt-24 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game, index) => (
            <GameCard
              key={game.slug}
              offset={index % 3 === 1}
              game={{
                slug: game.slug,
                statusText: getStatusText(game.status, locale),
                series: getLocalizedField(game, 'series', locale),
                title: getLocalizedField(game, 'title', locale),
                desc: getLocalizedField(game, 'description', locale),
                image: game.thumbnail_image || game.cover_image || '',
                hobom: isHobomGame(game),
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
