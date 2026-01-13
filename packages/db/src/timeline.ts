import type { TimelineEvent } from '@repo/types';
import { createClient } from './client';

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: false });

  if (error) throw error;
  return data as TimelineEvent[];
}
