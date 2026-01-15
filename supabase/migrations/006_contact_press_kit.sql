-- Contact Submissions table (for inquiry form)
CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('new', 'read', 'replied', 'archived')) DEFAULT 'new',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Press Kits table
CREATE TABLE press_kits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ko TEXT NOT NULL,
    title_en TEXT,
    title_ja TEXT,
    description_ko TEXT,
    description_en TEXT,
    description_ja TEXT,
    file_url TEXT,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX idx_press_kits_is_published ON press_kits(is_published);
CREATE INDEX idx_press_kits_display_order ON press_kits(display_order);
CREATE INDEX idx_press_kits_game_id ON press_kits(game_id);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_kits ENABLE ROW LEVEL SECURITY;

-- Contact submissions: Public can insert (submit), only authenticated can read/manage
CREATE POLICY "Public can submit contact" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can manage contacts" ON contact_submissions FOR ALL USING (auth.role() = 'authenticated');

-- Press kits: Public can read published, authenticated can manage all
CREATE POLICY "Public can read published press kits" ON press_kits FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated users can manage press kits" ON press_kits FOR ALL USING (auth.role() = 'authenticated');

-- Apply updated_at trigger
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_press_kits_updated_at BEFORE UPDATE ON press_kits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
