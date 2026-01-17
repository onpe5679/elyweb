-- 009_team_member_sections.sql
-- Custom sections system for team member detail pages
-- Mirrors game_sections pattern for consistency

CREATE TABLE IF NOT EXISTS team_member_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  
  -- Section type determines rendering component
  -- text: Rich text content
  -- gallery: Image gallery
  -- video: Embedded video (YouTube, etc.)
  -- links: External links (portfolio, social, etc.)
  -- projects: Notable projects/works
  -- skills: Skills/expertise list
  -- timeline: Career history/milestones
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
  
  -- For 'links' type - array of link objects
  -- Example: [{"name": "Portfolio", "url": "https://...", "icon": "portfolio"}, ...]
  links JSONB DEFAULT '[]',
  
  -- For 'projects' type - array of project entries
  -- Example: [{"title_ko": "프로젝트", "title_en": "Project", "description_ko": "...", "image": "...", "url": "..."}, ...]
  projects JSONB DEFAULT '[]',
  
  -- For 'skills' type - array of skill entries
  -- Example: [{"name_ko": "Unity", "name_en": "Unity", "level": 5}, ...]
  skills JSONB DEFAULT '[]',
  
  -- For 'timeline' type - array of timeline events
  -- Example: [{"date": "2024-01-01", "event_ko": "입사", "event_en": "Joined"}, ...]
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
CREATE INDEX IF NOT EXISTS idx_team_member_sections_member_id ON team_member_sections(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_member_sections_order ON team_member_sections(team_member_id, display_order);
CREATE INDEX IF NOT EXISTS idx_team_member_sections_type ON team_member_sections(section_type);

-- Enable RLS (Row Level Security)
ALTER TABLE team_member_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access for visible sections
CREATE POLICY "Public can view visible team member sections" ON team_member_sections
  FOR SELECT USING (is_visible = true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "Authenticated users can manage team member sections" ON team_member_sections
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_member_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_member_sections_updated_at
  BEFORE UPDATE ON team_member_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_team_member_sections_updated_at();
