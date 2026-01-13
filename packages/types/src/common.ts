export type Locale = 'ko' | 'en' | 'ja';

export interface LocalizedText {
  ko: string;
  en?: string;
  ja?: string;
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}
