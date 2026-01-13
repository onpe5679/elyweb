import { BaseEntity } from './common';

export interface News extends BaseEntity {
  slug: string;
  title_ko: string;
  title_en?: string;
  title_ja?: string;
  content_ko?: string;
  content_en?: string;
  content_ja?: string;
  excerpt_ko?: string;
  excerpt_en?: string;
  excerpt_ja?: string;
  cover_image?: string;
  is_published: boolean;
  published_at?: string;
}
