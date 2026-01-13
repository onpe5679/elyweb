import type { CompanySetting, SettingKey } from '@repo/types';
import { createClient } from './client';

export async function getSettings(): Promise<CompanySetting[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('company_settings')
    .select('*');

  if (error) throw error;
  return data as CompanySetting[];
}

export async function getSetting(key: SettingKey): Promise<CompanySetting | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .eq('key', key)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as CompanySetting;
}

export async function getSettingsMap(): Promise<Record<SettingKey, CompanySetting>> {
  const settings = await getSettings();
  return settings.reduce((acc, setting) => {
    acc[setting.key as SettingKey] = setting;
    return acc;
  }, {} as Record<SettingKey, CompanySetting>);
}
