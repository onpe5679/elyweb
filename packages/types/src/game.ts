import { BaseEntity } from './common';

export type GameStatus = 'released' | 'coming_soon' | 'in_development' | 'publishing';

export interface GameProjectTimeline {
  date: string;
  title_ko: string;
  title_en?: string;
  title_ja?: string;
}

export interface Game extends BaseEntity {
  slug: string;
  title_ko: string;
  title_en?: string;
  title_ja?: string;
  series?: string;
  genre: string[];
  status: GameStatus;
  description_ko?: string;
  description_en?: string;
  description_ja?: string;
  synopsis_ko?: string;
  synopsis_en?: string;
  synopsis_ja?: string;
  cover_image?: string;
  banner_image?: string;
  gallery_images: string[];
  trailer_url?: string;
  steam_url?: string;
  platforms: string[];
  developer?: string;
  release_date?: string;
  project_timeline: GameProjectTimeline[];
  is_featured: boolean;
  display_order: number;
}
