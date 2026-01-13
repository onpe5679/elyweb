'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface GameCardProps {
  game: {
    slug: string;
    tag: string;
    overlay: string;
    series: string;
    title: string;
    desc: string;
    image: string;
    tagColor: string;
  };
  locale: string;
}

export default function GameCard({ game, locale }: GameCardProps) {
  const t = useTranslations('Projects');

  return (
    <Link
      href={`/${locale}/games/${game.slug}`}
      data-testid="game-card"
      className="card-hover group bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 transition-colors duration-300 flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden">
        <div
          data-testid="game-status-badge"
          className={`absolute top-4 left-4 ${game.tagColor} text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider z-10`}
        >
          {game.tag}
        </div>
        <img
          alt={game.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          src={game.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <p className="text-white text-sm font-medium">{game.overlay}</p>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-1 text-primary font-medium text-xs uppercase">{game.series}</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{game.title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-1">{game.desc}</p>
        <span className="text-sm font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wide self-start">
          View Project
        </span>
      </div>
    </Link>
  );
}
