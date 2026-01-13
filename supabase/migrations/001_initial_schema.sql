-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title_ko TEXT NOT NULL,
    title_en TEXT,
    title_ja TEXT,
    series TEXT,
    genre TEXT[] DEFAULT '{}',
    status TEXT CHECK (status IN ('released', 'coming_soon', 'in_development', 'publishing')) DEFAULT 'in_development',
    description_ko TEXT,
    description_en TEXT,
    description_ja TEXT,
    synopsis_ko TEXT,
    synopsis_en TEXT,
    synopsis_ja TEXT,
    cover_image TEXT,
    banner_image TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    trailer_url TEXT,
    steam_url TEXT,
    platforms TEXT[] DEFAULT '{}',
    developer TEXT,
    release_date DATE,
    project_timeline JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- News table
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title_ko TEXT NOT NULL,
    title_en TEXT,
    title_ja TEXT,
    content_ko TEXT,
    content_en TEXT,
    content_ja TEXT,
    excerpt_ko TEXT,
    excerpt_en TEXT,
    excerpt_ja TEXT,
    cover_image TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline events table
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_label TEXT NOT NULL,
    title_ko TEXT NOT NULL,
    title_en TEXT,
    title_ja TEXT,
    description_ko TEXT,
    description_en TEXT,
    description_ja TEXT,
    icon TEXT DEFAULT 'flag',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company settings table
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value_ko TEXT,
    value_en TEXT,
    value_ja TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_games_slug ON games(slug);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_is_featured ON games(is_featured);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_is_published ON news(is_published);
CREATE INDEX idx_news_published_at ON news(published_at);
CREATE INDEX idx_timeline_is_active ON timeline_events(is_active);
CREATE INDEX idx_settings_key ON company_settings(key);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read games" ON games FOR SELECT USING (true);
CREATE POLICY "Public can read published news" ON news FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read active timeline" ON timeline_events FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read settings" ON company_settings FOR SELECT USING (true);

-- Authenticated users can do everything (for admin)
CREATE POLICY "Authenticated users can manage games" ON games FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage news" ON news FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage timeline" ON timeline_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage settings" ON company_settings FOR ALL USING (auth.role() = 'authenticated');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
