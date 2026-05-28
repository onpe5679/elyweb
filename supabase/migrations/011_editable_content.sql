-- 011: Make hardcoded site content admin-editable + structural columns
-- - timeline_events.show_on_home: separate main-page "주요 연혁" from full about-page history
-- - games.thumbnail_image: list-card thumbnail separate from detail banner/cover
-- - seed NEW company_settings keys so they appear & are editable in the admin panel
--   (existing keys like vision_title/vision_description/twitter_url/instagram_url/
--    youtube_url/contact_email are left untouched here)

ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS show_on_home boolean NOT NULL DEFAULT false;
ALTER TABLE games ADD COLUMN IF NOT EXISTS thumbnail_image text;

INSERT INTO company_settings (key, value_ko, value_en, value_ja) VALUES
  ('stat_year_value', '2022', NULL, NULL),
  ('stat_year_label', '설립 연도', 'Founded', '設立年'),
  ('stat_projects_value', '3+', NULL, NULL),
  ('stat_projects_label', '진행 프로젝트', 'Projects', 'プロジェクト'),
  ('stat_released_value', '2', NULL, NULL),
  ('stat_released_label', '출시 프로젝트', 'Released Titles', 'リリースタイトル'),
  ('stat_global_value', 'Global', NULL, NULL),
  ('stat_global_label', '스팀 출시', 'Steam', 'Steam配信'),
  ('privacy_policy', NULL, NULL, NULL),
  ('news_display_mode', 'manual', NULL, NULL),
  ('news_widget_x_handle', '_StudioElysian', NULL, NULL)
ON CONFLICT (key) DO NOTHING;
