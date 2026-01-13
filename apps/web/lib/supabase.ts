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
};

export type TimelineEvent = {
  id: string;
  date: string;
  title_ko: string;
  title_en?: string;
  title_ja?: string;
  description?: string;
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
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching timeline events:', error);
    return [];
  }

  return data || [];
}

export function getStatusTagColor(status: string): string {
  const colorMap: Record<string, string> = {
    released: 'bg-black/80',
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
