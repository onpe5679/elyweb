-- Add site image settings for customizable page images
INSERT INTO company_settings (key, value_ko, value_en, value_ja)
VALUES 
  ('hero_image', NULL, NULL, NULL),
  ('about_image', NULL, NULL, NULL),
  ('vision_image', NULL, NULL, NULL)
ON CONFLICT (key) DO NOTHING;
