'use client';

import {useMemo, useState} from 'react';
import GameCard, {WorkCardData} from './GameCard';

type GamesGridProps = {
  items: WorkCardData[];
  allLabel: string;
  filterLabel: string;
};

export default function GamesGrid({items, allLabel, filterLabel}: GamesGridProps) {
  const seriesList = useMemo(
    () => Array.from(new Set(items.map((i) => i.series).filter(Boolean))),
    [items]
  );
  const [selected, setSelected] = useState('');
  const filtered = selected ? items.filter((i) => i.series === selected) : items;

  return (
    <>
      {seriesList.length > 0 && (
        <div className="mb-16 flex justify-end">
          <label htmlFor="series-filter-works" className="sr-only">{filterLabel}</label>
          <select
            id="series-filter-works"
            data-testid="series-filter"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="border-0 border-b border-ink bg-transparent py-2 pr-8 text-sm text-ink focus:border-seal focus:ring-0"
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

      <div className="grid grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((game, index) => (
          <GameCard key={game.slug} game={game} offset={index % 3 === 1} variant={game.hobom ? 'hobom' : 'paper'} />
        ))}
      </div>
    </>
  );
}
