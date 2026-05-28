'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export type GamesGridItem = {
  slug: string;
  series: string;
  title: string;
  desc: string;
  image: string;
  statusText: string;
  statusColor: string;
};

type GamesGridProps = {
  items: GamesGridItem[];
  locale: string;
  allLabel: string;
};

export default function GamesGrid({ items, locale, allLabel }: GamesGridProps) {
  const seriesList = useMemo(
    () => Array.from(new Set(items.map((i) => i.series).filter(Boolean))),
    [items]
  );
  const [selected, setSelected] = useState('');
  const filtered = selected ? items.filter((i) => i.series === selected) : items;

  return (
    <>
      {seriesList.length > 0 && (
        <div className="flex justify-end mb-8">
          <select
            data-testid="series-filter"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{allLabel}</option>
            {seriesList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((game) => (
          <Link
            key={game.slug}
            href={`/${locale}/games/${game.slug}`}
            data-testid="game-card"
            className="card-hover group bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 transition-colors duration-300"
          >
            <div className="relative h-64 overflow-hidden">
              <div
                data-testid="game-status-badge"
                className={`absolute top-4 left-4 ${game.statusColor} text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider z-10`}
              >
                {game.statusText}
              </div>
              {game.image && (
                <img
                  alt={game.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  src={game.image}
                />
              )}
            </div>
            <div className="p-6">
              {game.series && (
                <div className="mb-1 text-primary font-medium text-xs uppercase">{game.series}</div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{game.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{game.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
