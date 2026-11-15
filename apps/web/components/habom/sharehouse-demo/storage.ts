// 설정·저장 슬롯(localStorage). 저장 공간을 못 쓰는 환경에서는 조용히 메모리로만 동작한다.
import type { ChapterId } from './types';

export type Settings = { bgm: number; voice: number; sfx: number; muted: boolean };
export type SaveRecord = { chapter: ChapterId; step: number; name: string; at: number };
export type Saves = { slots: (SaveRecord | null)[]; auto: SaveRecord | null };

const SETTINGS_KEY = 'sharehouse-demo:settings';
const SAVES_KEY = 'sharehouse-demo:saves';
export const SLOT_COUNT = 6;
export const DEFAULT_SETTINGS: Settings = { bgm: 0.6, voice: 1, sfx: 0.8, muted: false };

// localStorage 를 못 쓰면(차단·용량 초과) 이 페이지에 있는 동안만 메모리에 둔다
const memory = new Map<string, string>();

function read<T>(key: string): T | null {
  let v: string | null = null;
  try {
    v = window.localStorage.getItem(key);
  } catch {}
  v ??= memory.get(key) ?? null;
  try {
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
/** 저장 성공 여부(false = 메모리에만 저장됨) */
function write(key: string, value: unknown): boolean {
  const v = JSON.stringify(value);
  memory.set(key, v);
  try {
    window.localStorage.setItem(key, v);
    return true;
  } catch {
    return false;
  }
}

const clamp = (n: unknown, d: number) => (typeof n === 'number' && n >= 0 && n <= 1 ? n : d);

export function loadSettings(): Settings {
  const s = read<Partial<Settings>>(SETTINGS_KEY) || {};
  return {
    bgm: clamp(s.bgm, DEFAULT_SETTINGS.bgm),
    voice: clamp(s.voice, DEFAULT_SETTINGS.voice),
    sfx: clamp(s.sfx, DEFAULT_SETTINGS.sfx),
    muted: typeof s.muted === 'boolean' ? s.muted : false,
  };
}
export const saveSettings = (s: Settings) => write(SETTINGS_KEY, s);

const isRecord = (r: unknown): r is SaveRecord => {
  if (!r || typeof r !== 'object') return false;
  const x = r as SaveRecord;
  return (
    ['prologue', 'jihye', 'saeun'].includes(x.chapter) &&
    Number.isInteger(x.step) &&
    x.step >= 0 &&
    typeof x.name === 'string' &&
    x.name.length <= 40 &&
    Number.isFinite(x.at)
  );
};

export function loadSaves(): Saves {
  const s = read<Partial<Saves>>(SAVES_KEY) || {};
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => (isRecord(s.slots?.[i]) ? (s.slots![i] as SaveRecord) : null));
  return { slots, auto: isRecord(s.auto) ? s.auto : null };
}
export const writeSaves = (s: Saves): boolean => write(SAVES_KEY, s);
