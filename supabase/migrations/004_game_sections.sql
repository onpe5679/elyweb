-- 004_game_sections.sql
-- Custom sections system for game detail pages
-- Allows unlimited, flexible content sections per game

CREATE TABLE IF NOT EXISTS game_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  
  -- Section type determines rendering component
  -- text: Rich text content
  -- gallery: Image gallery
  -- video: Embedded video (YouTube, etc.)
  -- store: Store links with icons
  -- credits: Staff/Cast credits
  -- timeline: Project history/milestones
  -- custom: Fully custom HTML content
  section_type TEXT NOT NULL DEFAULT 'text',
  
  -- Section title (multi-language)
  title_ko TEXT,
  title_en TEXT,
  title_ja TEXT,
  
  -- Text content for 'text' and 'custom' types (multi-language)
  content_ko TEXT,
  content_en TEXT,
  content_ja TEXT,
  
  -- For 'gallery' type - array of image URLs
  images TEXT[] DEFAULT '{}',
  
  -- For 'video' type - video embed URL
  video_url TEXT,
  
  -- For 'store' type - array of store link objects
  -- Example: [{"name": "Steam", "url": "https://...", "icon": "steam"}, ...]
  store_links JSONB DEFAULT '[]',
  
  -- For 'credits' type - array of credit entries
  -- Example: [{"role": "Director", "name": "John Doe"}, {"role": "Artist", "names": ["A", "B"]}]
  credits JSONB DEFAULT '[]',
  
  -- For 'timeline' type - array of timeline events
  -- Example: [{"date": "2024-01-01", "event_ko": "출시", "event_en": "Release"}, ...]
  timeline_items JSONB DEFAULT '[]',
  
  -- Display ordering (lower number = higher priority)
  display_order INTEGER DEFAULT 0,
  
  -- Visibility toggle
  is_visible BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_sections_game_id ON game_sections(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sections_order ON game_sections(game_id, display_order);
CREATE INDEX IF NOT EXISTS idx_game_sections_type ON game_sections(section_type);

-- Enable RLS (Row Level Security)
ALTER TABLE game_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access
CREATE POLICY "Public can view visible game sections" ON game_sections
  FOR SELECT USING (is_visible = true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "Authenticated users can manage game sections" ON game_sections
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_game_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER game_sections_updated_at
  BEFORE UPDATE ON game_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_game_sections_updated_at();
