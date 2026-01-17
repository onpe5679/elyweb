import type { TeamMember } from '@repo/types';
import { createClient } from './client';

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as TeamMember[];
}

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as TeamMember[];
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as TeamMember;
}
