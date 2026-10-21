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
