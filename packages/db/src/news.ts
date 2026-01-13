import type { News } from '@repo/types';
import { createClient } from './client';

export async function getPublishedNews(): Promise<News[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data as News[];
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as News;
}

export async function getLatestNews(limit: number = 5): Promise<News[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as News[];
}
