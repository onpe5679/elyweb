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
  display_order?: number;
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
    .order('display_order', { ascending: true })
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

export type SectionType = 'info' | 'synopsis' | 'video' | 'store' | 'timeline' | 'gallery' | 'custom';

export type GameSection = {
  id: string;
  game_id: string;
  type: SectionType;
  title_ko?: string;
  title_en?: string;
  title_ja?: string;
  content: any;
  display_order: number;
  is_active: boolean;
};

// Mock function until we have a real table
export async function getGameSections(slug: string): Promise<GameSection[]> {
  // In a real app, we would fetch from 'game_sections' table joined with 'games'
  // const { data } = await supabase.from('game_sections').select('*').eq('game_slug', slug)...

  const sections: GameSection[] = [];

  if (slug === 'sharehouse') {
    sections.push(
      {
        id: '1',
        game_id: 'sharehouse',
        type: 'timeline',
        title_en: 'Project History',
        title_ko: '프로젝트 연혁',
        content: {
          items: [
            { date: '2022.01', text_en: 'Project Started', text_ko: '프로젝트 시작' },
            { date: '2022.06', text_en: 'Alpha Test', text_ko: '알파 테스트' },
            { date: '2022.12', text_en: 'Beta Release', text_ko: '베타 출시' },
          ]
        },
        display_order: 1,
        is_active: true
      },
      {
        id: '2',
        game_id: 'sharehouse',
        type: 'info',
        title_en: 'Game Info',
        title_ko: '게임 정보',
        content: {
          lead_en: 'A heartwarming story of connection.',
          lead_ko: '따뜻한 연결의 이야기.',
          // Other info fields are usually pulled from the game record itself,
          // but valid to override here if needed.
        },
        display_order: 2,
        is_active: true
      },
      {
        id: '3',
        game_id: 'sharehouse',
        type: 'synopsis',
        title_en: 'Synopsis',
        title_ko: '시놉시스',
        content: {
          p1_en: 'In a bustling city, strangers become family...',
          p1_ko: '분주한 도시에서, 낯선 이들이 가족이 되어갑니다...',
          quote_en: '"Home is where the heart is."',
          quote_ko: '"마음이 머무는 곳이 집입니다."',
          characters: ['Protagonist', 'Love Interest A', 'Best Friend']
        },
        display_order: 3,
        is_active: true
      }
    );
  } else if (slug === 'memorial-circuit') {
    // Example for the specific game user mentioned
    sections.push(
      {
        id: 'mc-1',
        game_id: 'memorial-circuit',
        type: 'info',
        title_en: 'Game Info',
        title_ko: '게임 정보',
        content: {},
        display_order: 1,
        is_active: true
      },
      {
        id: 'mc-2',
        game_id: 'memorial-circuit',
        type: 'synopsis',
        title_en: 'Synopsis',
        title_ko: '시놉시스',
        content: {
          p1_en: 'Deep in the digital void...',
          p1_ko: '디지털 공허 깊은 곳에서...',
        },
        display_order: 2,
        is_active: true
      },
      {
        id: 'mc-3',
        game_id: 'memorial-circuit',
        type: 'video',
        title_en: 'Trailer',
        title_ko: '트레일러',
        content: {
          youtube_id: 'dQw4w9WgXcQ' // Example ID
        },
        display_order: 3,
        is_active: true
      },
      {
        id: 'mc-4',
        game_id: 'memorial-circuit',
        type: 'store',
        title_en: 'Store',
        title_ko: '스토어',
        content: {
          links: [
            { label: 'Steam', url: 'https://store.steampowered.com', icon: 'fa-brands fa-steam' },
            { label: 'Nintendo eShop', url: 'https://nintendo.com', icon: 'fa-solid fa-gamepad' }
          ]
        },
        display_order: 4,
        is_active: true
      }
    );
  } else {
    // Default fallback
    sections.push({
      id: 'default-1',
      game_id: slug,
      type: 'info',
      title_en: 'Game Info',
      title_ko: '게임 정보',
      content: {},
      display_order: 1,
      is_active: true
    });
  }

  return sections.sort((a, b) => a.display_order - b.display_order);
}
