import { BaseEntity } from './common';

export interface CompanySetting extends BaseEntity {
  key: string;
  value_ko?: string;
  value_en?: string;
  value_ja?: string;
}

export type SettingKey = 
  | 'vision_title'
  | 'vision_description'
  | 'founded_year'
  | 'projects_count'
  | 'funding_percentage'
  | 'footer_tagline'
  | 'contact_email'
  | 'twitter_url'
  | 'youtube_url'
  | 'instagram_url'
  | 'hero_image'
  | 'about_image'
  | 'vision_image'
  | 'logo_image'
  | 'logo_icon'
  | 'favicon';
