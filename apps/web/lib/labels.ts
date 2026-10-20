import type { Game } from './supabase';

// Studio labels (brands) that share this site. Each label owns its own landing page,
// theme and game-detail route, so a new sub-studio is one more entry here.
export type LabelId = 'elysian' | 'habom';

export type StudioLabel = {
  id: LabelId;
  name: string;
  localName: Record<string, string>;
  // Base path (without locale) of the label's landing page.
  home: string;
  // Base path (without locale) of the label's game detail pages.
  gamesBase: string;
  // Lowercase tokens matched against games.developer / games.series_* to infer the label.
  match: string[];
};

export const LABELS: Record<LabelId, StudioLabel> = {
  elysian: {
    id: 'elysian',
    name: 'Studio Elysian',
    localName: { ko: '스튜디오 엘리시안', en: 'Studio Elysian', ja: 'スタジオエリシアン' },
    home: '/',
    gamesBase: '/games',
    match: [],
  },
  habom: {
    id: 'habom',
    name: 'Habom Studio',
    localName: { ko: '하봄 스튜디오', en: 'Habom Studio', ja: 'ハボムスタジオ' },
    home: '/habom',
    gamesBase: '/habom/games',
    match: ['habom', '하봄', 'ハボム'],
  },
};

// The games table has no label column yet, so the label is inferred from the developer
// credit (first listed studio wins) and the series name. A `label` column would replace this.
export function getGameLabel(game: Pick<Game, 'developer' | 'series_ko' | 'series_en' | 'series_ja'>): LabelId {
  const lead = (game.developer || '').split('/')[0].toLowerCase();
  const series = [game.series_ko, game.series_en, game.series_ja].join(' ').toLowerCase();
  for (const label of Object.values(LABELS)) {
    if (label.match.some((token) => lead.includes(token) || series.includes(token))) return label.id;
  }
  return 'elysian';
}

export function gameHref(game: Parameters<typeof getGameLabel>[0] & { slug: string }): string {
  return `${LABELS[getGameLabel(game)].gamesBase}/${game.slug}`;
}
