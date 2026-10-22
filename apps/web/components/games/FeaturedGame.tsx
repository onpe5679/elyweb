'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';
import {Game, getLocalizedField, getLocalizedArray, getStatusText} from '@/lib/supabase';
import {isHobomGame} from '@/lib/studios';

interface FeaturedGameProps {
  game: Game;
  locale: string;
}

export default function FeaturedGame({game, locale}: FeaturedGameProps) {
  const t = useTranslations('Projects');
  const tDetail = useTranslations('GameDetail');
  const genres = getLocalizedArray(game, 'genre', locale);
  const title = getLocalizedField(game, 'title', locale);
  const image = game.cover_image || game.banner_image || '';
  const hobom = isHobomGame(game);

  return (
    <article
      data-testid="featured-game"
      className="grid gap-12 border-y border-rule py-16 md:py-20 lg:grid-cols-12 lg:items-center"
    >
      <div className="relative min-w-0 lg:col-span-6">
        <Link href={`/games/${game.slug}`} className="group block focus-visible:outline-offset-8">
          <div className="relative aspect-[4/5] overflow-hidden bg-paper-alt">
            {image && (
              <img
                alt={title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                src={image}
              />
            )}
          </div>
        </Link>
        <span
          data-testid="game-status-badge"
          className="absolute -bottom-4 left-6 bg-ink px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-paper"
        >
          {getStatusText(game.status, locale)}
        </span>
      </div>

      <div className="min-w-0 lg:col-span-5 lg:col-start-8">
        <p className="eyebrow">
          {getLocalizedField(game, 'series', locale) || t('label')}
          {hobom && <span className="ml-3 text-ink-3">· {t('hobomTag')}</span>}
        </p>
        <h3 className="font-display mt-6 text-balance text-5xl leading-[1.05] text-ink md:text-6xl">{title}</h3>
        <p className="mt-8 whitespace-pre-line text-base leading-loose text-ink-2 md:text-lg">
          {getLocalizedField(game, 'description', locale)}
        </p>
        {genres.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-3">
            {genres.map((genre, index) => (
              <li key={index} className="before:mr-5 before:text-seal before:content-['/'] first:before:content-none">
                {genre}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <Link href={`/games/${game.slug}`} className="btn-ink">
            {t('viewWork')}
          </Link>
          {game.steam_url && (
            <a
              href={game.steam_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-ink underline-offset-4 hover:text-seal hover:underline"
            >
              {tDetail('steam')} ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
