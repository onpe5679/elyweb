import { BaseEntity } from './common';

export interface PressKit extends BaseEntity {
  title_ko: string;
  title_en?: string;
  title_ja?: string;
  description_ko?: string;
  description_en?: string;
  description_ja?: string;
  file_url?: string;
  game_id?: string;
  display_order: number;
  is_published: boolean;
}
