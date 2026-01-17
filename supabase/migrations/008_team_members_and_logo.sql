-- Migration 008: Team Members table and Logo settings
-- This migration adds:
-- 1. team_members table for managing team/staff information
-- 2. logo_image and logo_icon settings for customizable branding

-- =====================================================
-- TEAM MEMBERS TABLE (similar pattern to games)
-- =====================================================

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    
    -- Basic info (multi-language)
    name_ko TEXT NOT NULL,
    name_en TEXT,
    name_ja TEXT,
    
    -- Role/Position (multi-language)
    role_ko TEXT,
    role_en TEXT,
    role_ja TEXT,
    
    -- Bio/Description (multi-language)
    bio_ko TEXT,
    bio_en TEXT,
    bio_ja TEXT,
    
    -- Images
    profile_image TEXT,
    
    -- Social links
    twitter_url TEXT,
    instagram_url TEXT,
    website_url TEXT,
    
    -- Display settings
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for team_members
CREATE INDEX idx_team_members_slug ON team_members(slug);
CREATE INDEX idx_team_members_is_active ON team_members(is_active);
CREATE INDEX idx_team_members_display_order ON team_members(display_order);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Public can read active team members" ON team_members 
    FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage team members" ON team_members 
    FOR ALL USING (auth.role() = 'authenticated');

-- Updated_at trigger for team_members
CREATE TRIGGER update_team_members_updated_at 
    BEFORE UPDATE ON team_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- LOGO AND BRANDING SETTINGS
-- =====================================================

-- Add logo settings to company_settings
INSERT INTO company_settings (key, value_ko, value_en, value_ja)
VALUES 
    ('logo_image', NULL, NULL, NULL),
    ('logo_icon', 'fa-solid fa-book-open', 'fa-solid fa-book-open', 'fa-solid fa-book-open'),
    ('favicon', NULL, NULL, NULL)
ON CONFLICT (key) DO NOTHING;
