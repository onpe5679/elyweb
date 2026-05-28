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
  | 'stat_year_value'
  | 'stat_year_label'
  | 'stat_projects_value'
  | 'stat_projects_label'
  | 'stat_released_value'
  | 'stat_released_label'
  | 'stat_global_value'
  | 'stat_global_label'
  | 'footer_tagline'
  | 'contact_email'
  | 'twitter_url'
  | 'youtube_url'
  | 'instagram_url'
  | 'privacy_policy'
  | 'news_display_mode'
  | 'news_widget_x_handle'
  | 'hero_image'
  | 'about_image'
  | 'vision_image'
  | 'logo_image'
  | 'logo_icon'
  | 'favicon';
