import type { Game } from '@repo/types';
import { createClient } from './client';

export async function getGames(): Promise<Game[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Game[];
}

export async function getFeaturedGames(): Promise<Game[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('is_featured', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Game[];
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Game;
}

export async function getReleasedGames(): Promise<Game[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'released')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Game[];
}
