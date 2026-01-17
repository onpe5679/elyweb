import { BaseEntity } from './common';

export interface TeamMember extends BaseEntity {
  slug: string;
  name_ko: string;
  name_en?: string;
  name_ja?: string;
  role_ko?: string;
  role_en?: string;
  role_ja?: string;
  bio_ko?: string;
  bio_en?: string;
  bio_ja?: string;
  profile_image?: string;
  twitter_url?: string;
  instagram_url?: string;
  website_url?: string;
  is_active: boolean;
  display_order: number;
}
