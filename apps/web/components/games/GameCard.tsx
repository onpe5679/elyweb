'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';

export type WorkCardData = {
  slug: string;
  statusText: string;
  series: string;
  title: string;
  desc: string;
  image: string;
  hobom: boolean;
};

interface GameCardProps {
  game: WorkCardData;
  /** Offsets the card down on wide screens for a magazine-style rhythm. */
  offset?: boolean;
  /** Studio Habom titles get rounder corners and the Habom type treatment. */
  variant?: 'paper' | 'hobom';
}

export default function GameCard({game, offset = false, variant = 'paper'}: GameCardProps) {
  const t = useTranslations('Projects');
  const isHobom = variant === 'hobom';

  return (
    <Link
      href={`/games/${game.slug}`}
      data-testid="game-card"
      className={['group flex min-w-0 flex-col focus-visible:outline-offset-8', offset ? 'lg:mt-24' : '', isHobom ? 'font-hobom' : ''].join(' ')}
    >
      <div className={['relative aspect-[3/4] overflow-hidden bg-paper-alt', isHobom ? 'rounded-[1.75rem] bg-hb-pink-soft' : ''].join(' ')}>
        {game.image && (
          <img
            alt={game.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            src={game.image}
          />
        )}
        <span
          data-testid="game-status-badge"
          className="absolute left-4 top-4 bg-paper/95 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink"
        >
          {game.statusText}
        </span>
        {game.hobom && !isHobom && (
          <span className="absolute right-4 top-4 bg-hb-yellow px-3 py-1.5 text-[0.68rem] font-bold text-hb-ink">
            {t('hobomTag')}
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        {game.series && <p className="eyebrow !text-ink-3">{game.series}</p>}
        <h3
          className={[
            'mt-3 text-balance text-3xl leading-tight transition-colors md:text-4xl',
            isHobom ? 'font-hobom font-bold text-hb-ink group-hover:text-hb-pink-deep' : 'font-display text-ink group-hover:text-seal',
          ].join(' ')}
        >
          {game.title}
        </h3>
        <p className={['mt-4 line-clamp-2 text-sm leading-relaxed', isHobom ? 'text-hb-ink/75' : 'text-ink-2'].join(' ')}>{game.desc}</p>
        <span
          className={[
            'mt-6 inline-flex w-fit items-center gap-3 pb-1 text-xs font-bold uppercase tracking-[0.16em] transition-colors',
            isHobom ? 'text-hb-ink group-hover:text-hb-pink-deep' : 'border-b border-ink text-ink group-hover:border-seal group-hover:text-seal',
          ].join(' ')}
        >
          {t('viewWork')}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}
