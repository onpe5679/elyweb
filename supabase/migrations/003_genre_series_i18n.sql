ALTER TABLE games ADD COLUMN genre_ko TEXT[] DEFAULT '{}';
ALTER TABLE games ADD COLUMN genre_en TEXT[] DEFAULT '{}';
ALTER TABLE games ADD COLUMN genre_ja TEXT[] DEFAULT '{}';

ALTER TABLE games ADD COLUMN series_ko TEXT;
ALTER TABLE games ADD COLUMN series_en TEXT;
ALTER TABLE games ADD COLUMN series_ja TEXT;

UPDATE games SET genre_ko = genre WHERE genre IS NOT NULL;
UPDATE games SET series_ko = series WHERE series IS NOT NULL;

ALTER TABLE games DROP COLUMN genre;
ALTER TABLE games DROP COLUMN series;
