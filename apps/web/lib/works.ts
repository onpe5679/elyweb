import { gameHref, getGameLabel, type LabelId } from './labels';
import { getLocalizedArray, getLocalizedField, type Game } from './supabase';

export type WorkSummary = {
  id: string;
  slug: string;
  href: string;
  label: LabelId;
  title: string;
  altTitle: string;
  series: string;
  genres: string[];
  status: string;
  logline: string;
  banner: string;
  cover: string;
  platforms: string[];
  steamUrl: string;
};

export function toWorkSummary(game: Game, locale: string): WorkSummary {
  const title = getLocalizedField(game, 'title', locale);
  const alt = locale === 'en' ? game.title_ko : game.title_en || game.title_ko;
  const genres = getLocalizedArray(game, 'genre', locale);
  return {
    id: game.id,
    slug: game.slug,
    href: gameHref(game),
    label: getGameLabel(game),
    title,
    altTitle: alt && alt !== title ? alt : '',
    series: getLocalizedField(game, 'series', locale),
    genres: genres.length ? genres : getLocalizedArray(game, 'genre', 'ko'),
    status: game.status,
    logline: getLocalizedField(game, 'description', locale),
    banner: game.banner_image || game.cover_image || '',
    cover: game.cover_image || game.banner_image || '',
    platforms: game.platforms || [],
    steamUrl: game.steam_url || '',
  };
}

export function stripEmphasis(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1');
}

// Italic Latin display type only suits Latin text; Hangul/Kana titles keep the upright serif.
export function altTitleClass(text: string): string {
  return /[\u1100-\u11ff\u3040-\u30ff\u3130-\u318f\u3400-\u9fff\uac00-\ud7af\uff00-\uffef]/.test(text) ? 'font-serif' : 'font-latin italic';
}

// Long unspaced titles (e.g. Japanese katakana) step down a size so they break evenly.
export function titleScale(text: string, sizes: [string, string, string]): string {
  const len = Array.from(text.replace(/\s/g, '')).length;
  return len > 14 ? sizes[2] : len > 9 ? sizes[1] : sizes[0];
}
