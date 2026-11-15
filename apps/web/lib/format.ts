/** "2024.04" → locale 에 맞는 짧은 표기. 형식이 다르면 원문을 그대로 쓴다. */
export function fmtDate(date: string, locale: string): string {
  const m = date.match(/^(\d{4})[.\-/](\d{1,2})(?:[.\-/](\d{1,2}))?$/);
  if (!m) return date;
  const [, y, mo, d] = m;
  if (locale === 'ko') return d ? `${y}.${mo.padStart(2, '0')}.${d.padStart(2, '0')}` : `${y}.${mo.padStart(2, '0')}`;
  if (locale === 'ja') return d ? `${y}年${+mo}月${+d}日` : `${y}年${+mo}月`;
  const month = new Date(Date.UTC(+y, +mo - 1, 1)).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  return d ? `${month} ${+d}, ${y}` : `${month} ${y}`;
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

const EMOJI = /[\p{Extended_Pictographic}\uFE0F]/gu;
/** 연혁 문구에 섞인 이모지를 걷어내 서체 중심의 화면과 맞춘다. */
export const stripEmoji = (s: string) => s.replace(EMOJI, '').replace(/\s+/g, ' ').trim();

/** "2024.04" 같은 날짜 문자열 → 정렬용 숫자(인식할 수 없으면 0). */
export function dateKey(date: string): number {
  const m = date.match(/(\d{4})(?:[.\-/](\d{1,2}))?(?:[.\-/](\d{1,2}))?/);
  if (!m) return 0;
  return +m[1] * 10000 + (+(m[2] || 0)) * 100 + +(m[3] || 0);
}

/**
 * 연혁을 최신순으로. 날짜가 같으면 원래 순서를 뒤집고,
 * 날짜가 아닌 항목(예: "AND NOW…")은 '지금'이므로 맨 위에 둔다.
 */
export function newestFirst<T extends { date: string }>(items: T[]): T[] {
  const key = (d: string) => dateKey(d || '') || Number.MAX_SAFE_INTEGER;
  return items
    .map((it, i) => ({ it, i }))
    .sort((a, b) => key(b.it.date) - key(a.it.date) || b.i - a.i)
    .map(({ it }) => it);
}

/** 출시 연도 표기: 연도가 없으면(출시 전) fallback(예: "Coming Soon"). */
export const yearLabel = (year: string | undefined, fallback: string) => year ?? fallback;
