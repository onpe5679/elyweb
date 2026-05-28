import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Game = {
  id: string;
  slug: string;
  title_ko: string;
  title_en?: string;
  title_ja?: string;
  description_ko?: string;
  description_en?: string;
  description_ja?: string;
  series_ko?: string;
  series_en?: string;
  series_ja?: string;
  genre_ko?: string[];
  genre_en?: string[];
  genre_ja?: string[];
  status: string;
  cover_image?: string;
  thumbnail_image?: string;
  banner_image?: string;
  steam_url?: string;
  official_url?: string;
  platforms?: string[];
  is_featured: boolean;
  created_at: string;
};

export type News = {
  id: string;
  slug: string;
  title_ko: string;
  title_en?: string;
  title_ja?: string;
  content_ko?: string;
  content_en?: string;
  content_ja?: string;
  cover_image?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  display_order?: number;
};

export type TimelineEvent = {
  id: string;
  date: string;
  date_label?: string;
  title_ko: string;
  title_en?: string;
  title_ja?: string;
  description?: string;
  is_active?: boolean;
  show_on_home?: boolean;
  display_order?: number;
  created_at: string;
};

export function getLocalizedField<T extends Record<string, unknown>>(
  item: T,
  field: string,
  locale: string
): string {
  const localizedField = `${field}_${locale}`;
  const koField = `${field}_ko`;
  return (item[localizedField] as string) || (item[koField] as string) || '';
}

export function getLocalizedArray<T extends Record<string, unknown>>(
  item: T,
  field: string,
  locale: string
): string[] {
  const localizedField = `${field}_${locale}`;
  const koField = `${field}_ko`;
  return (item[localizedField] as string[]) || (item[koField] as string[]) || [];
}

export async function getGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching games:', error);
    return [];
  }

  return data || [];
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching game:', error);
    return null;
  }

  return data;
}

export async function getFeaturedGame(): Promise<Game | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('is_featured', true)
    .single();

  if (error) {
    console.error('Error fetching featured game:', error);
    return null;
  }

  return data;
}

export async function getNews(publishedOnly = true): Promise<News[]> {
  let query = supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false });

  if (publishedOnly) {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  return data || [];
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .order('display_order', { ascending: false });

  if (error) {
    console.error('Error fetching timeline events:', error);
    return [];
  }

  return (data || []).map(event => ({
    ...event,
    date: event.date_label || event.date || ''
  }));
}

export async function getHomeTimelineEvents(): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('show_on_home', true)
    .order('display_order', { ascending: false });

  if (error) {
    console.error('Error fetching home timeline events:', error);
    return [];
  }

  return (data || []).map(event => ({
    ...event,
    date: event.date_label || event.date || ''
  }));
}

export function getStatusTagColor(status: string): string {
  const colorMap: Record<string, string> = {
    released: 'bg-primary/90',
    coming_soon: 'bg-primary/90',
    in_development: 'bg-primary/90',
    publishing: 'bg-pink-500',
  };
  return colorMap[status] || 'bg-gray-500';
}

export function getStatusText(status: string, locale: string): string {
  const textMap: Record<string, Record<string, string>> = {
    released: { ko: 'Now Available', en: 'Now Available', ja: '発売中' },
    coming_soon: { ko: 'Coming Soon', en: 'Coming Soon', ja: '近日公開' },
    in_development: { ko: 'In Development', en: 'In Development', ja: '開発中' },
    publishing: { ko: 'Publishing', en: 'Publishing', ja: 'パブリッシング' },
  };
  return textMap[status]?.[locale] || status;
}

export type SectionType = 'text' | 'gallery' | 'video' | 'store' | 'credits' | 'timeline' | 'custom';

// DB schema matching game_sections table from 004_game_sections.sql
export type GameSectionDB = {
  id: string;
  game_id: string;
  section_type: SectionType;
  title_ko?: string;
  title_en?: string;
  title_ja?: string;
  content_ko?: string;
  content_en?: string;
  content_ja?: string;
  images?: string[];
  video_url?: string;
  store_links?: { name: string; url: string; icon?: string }[];
  credits?: { role: string; name: string }[];
  timeline_items?: { date: string; event_ko?: string; event_en?: string; event_ja?: string }[];
  display_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
};

// Legacy type for backward compatibility with existing SectionRenderer
export type GameSection = {
  id: string;
  game_id: string;
  type: SectionType | 'info' | 'synopsis'; // include legacy types
  title_ko?: string;
  title_en?: string;
  title_ja?: string;
  content: Record<string, unknown>;
  display_order: number;
  is_active: boolean;
};

// Transform DB record to legacy format for existing SectionRenderer
function transformSectionToLegacy(section: GameSectionDB): GameSection {
  const content: Record<string, unknown> = {};

  // Map content fields based on section_type
  switch (section.section_type) {
    case 'text':
      // Text content goes into content object with locale suffixes
      if (section.content_ko) content.p1_ko = section.content_ko;
      if (section.content_en) content.p1_en = section.content_en;
      if (section.content_ja) content.p1_ja = section.content_ja;
      break;

    case 'gallery':
      content.images = section.images || [];
      break;

    case 'video':
      // Extract YouTube ID from URL or use directly
      if (section.video_url) {
        const youtubeMatch = section.video_url.match(
          /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/
        );
        content.youtube_id = youtubeMatch ? youtubeMatch[1] : section.video_url;
      }
      break;

    case 'store':
      content.links = (section.store_links || []).map(link => ({
        label: link.name,
        url: link.url,
        icon: link.icon || 'fa-solid fa-store'
      }));
      break;

    case 'credits':
      content.credits = section.credits || [];
      break;

    case 'timeline':
      content.items = (section.timeline_items || []).map(item => ({
        date: item.date,
        text_ko: item.event_ko || '',
        text_en: item.event_en || '',
        text_ja: item.event_ja || ''
      }));
      break;

    case 'custom':
      // Custom sections use content fields directly
      if (section.content_ko) content.content_ko = section.content_ko;
      if (section.content_en) content.content_en = section.content_en;
      if (section.content_ja) content.content_ja = section.content_ja;
      if (section.images?.length) content.images = section.images;
      if (section.video_url) content.video_url = section.video_url;
      break;
  }

  return {
    id: section.id,
    game_id: section.game_id,
    type: section.section_type,
    title_ko: section.title_ko,
    title_en: section.title_en,
    title_ja: section.title_ja,
    content,
    display_order: section.display_order,
    is_active: section.is_visible
  };
}

// Site settings types
export type SiteSetting = {
  id: string;
  key: string;
  value_ko?: string;
  value_en?: string;
  value_ja?: string;
  updated_at?: string;
};

// Fetch a single setting by key
export async function getSetting(key: string): Promise<SiteSetting | null> {
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .eq('key', key)
    .single();

  if (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return null;
  }

  return data;
}

// Fetch multiple settings by keys
export async function getSettings(keys: string[]): Promise<Record<string, SiteSetting>> {
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .in('key', keys);

  if (error) {
    console.error('Error fetching settings:', error);
    return {};
  }

  const result: Record<string, SiteSetting> = {};
  (data || []).forEach(setting => {
    result[setting.key] = setting;
  });
  return result;
}

// Get localized setting value
export function getLocalizedSettingValue(
  setting: SiteSetting | null | undefined,
  locale: string
): string {
  if (!setting) return '';
  const localizedField = `value_${locale}` as keyof SiteSetting;
  return (setting[localizedField] as string) || setting.value_ko || '';
}

export type PressKit = {
  id: string;
  title_ko: string;
  title_en?: string;
  title_ja?: string;
  description_ko?: string;
  description_en?: string;
  description_ja?: string;
  file_url?: string;
  game_id?: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
};

export type TeamMember = {
  id: string;
  slug: string;
  name_ko: string;
  name_en?: string;
  name_ja?: string;
  role_ko?: string;
  role_en?: string;
  role_ja?: string;
  bio_ko?: string;
  bio_en?: string;
  bio_ja?: string;
  profile_image?: string;
  twitter_url?: string;
  instagram_url?: string;
  website_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  return data || [];
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching team member:', error);
    return null;
  }

  return data;
}

export type TeamMemberSectionType = 'text' | 'gallery' | 'video' | 'links' | 'projects' | 'skills' | 'timeline' | 'custom';

export type TeamMemberSection = {
  id: string;
  team_member_id: string;
  section_type: TeamMemberSectionType;
  title_ko?: string;
  title_en?: string;
  title_ja?: string;
  content_ko?: string;
  content_en?: string;
  content_ja?: string;
  images?: string[];
  video_url?: string;
  links?: { name: string; url: string; icon?: string }[];
  projects?: { title_ko?: string; title_en?: string; description_ko?: string; description_en?: string; image?: string; url?: string }[];
  skills?: { name_ko?: string; name_en?: string; level?: number }[];
  timeline_items?: { date: string; event_ko?: string; event_en?: string; event_ja?: string }[];
  display_order: number;
  is_visible: boolean;
};

export async function getTeamMemberSections(teamMemberIdOrSlug: string): Promise<TeamMemberSection[]> {
  const { data: member } = await supabase
    .from('team_members')
    .select('id')
    .eq('slug', teamMemberIdOrSlug)
    .single();

  const memberId = member?.id || teamMemberIdOrSlug;

  const { data, error } = await supabase
    .from('team_member_sections')
    .select('*')
    .eq('team_member_id', memberId)
    .eq('is_visible', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching team member sections:', error);
    return [];
  }

  return data || [];
}

export async function getPressKits(): Promise<PressKit[]> {
  const { data, error } = await supabase
    .from('press_kits')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching press kits:', error);
    return [];
  }

  return data || [];
}

// Fetch game sections from database
export async function getGameSections(gameIdOrSlug: string): Promise<GameSection[]> {
  // First, try to get game by slug to get its UUID
  const { data: game } = await supabase
    .from('games')
    .select('id')
    .eq('slug', gameIdOrSlug)
    .single();

  const gameId = game?.id || gameIdOrSlug;

  const { data, error } = await supabase
    .from('game_sections')
    .select('*')
    .eq('game_id', gameId)
    .eq('is_visible', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching game sections:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Transform DB records to legacy format
  return (data as GameSectionDB[]).map(transformSectionToLegacy);
}
