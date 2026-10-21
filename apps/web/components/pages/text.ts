import { fmtDate } from '@/lib/format';

/** HTML 태그를 걷어낸 한 줄 요약용 텍스트(목록 미리보기용). */
export function stripTags(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>|<br\s*\/?>/gi, ' ') // 블록 경계만 공백으로
    .replace(/<[^>]*>/g, '') // 인라인 태그(strong, a …)는 글자 사이에 공백을 만들지 않는다
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** "2025-04-18T09:00:00Z" 같은 ISO 날짜를 locale 에 맞는 표기로. 파싱이 안 되면 빈 문자열. */
export function fmtIso(iso: string | undefined | null, locale: string): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  return fmtDate(`${m[1]}-${m[2]}-${m[3]}`, locale);
}

/** URL 에서 계정명을 뽑아 "@name" 형태로. 실패하면 호스트명. */
export function handleOf(url: string): string {
  try {
    const u = new URL(url);
    const first = u.pathname.split('/').filter(Boolean)[0];
    if (!first) return u.hostname.replace(/^www\./, '');
    return first.startsWith('@') ? first : `@${first}`;
  } catch {
    return url;
  }
}

/** 유튜브 주소(watch/youtu.be)는 iframe 에 넣을 수 있는 embed 주소로 바꾼다. */
export function toEmbedUrl(url: string): string {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

/** http(s) 가 아닌 주소(javascript: 등)가 링크로 쓰이지 않도록 걸러낸다. */
export function safeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  return /^https?:\/\//i.test(url) || url.startsWith('/') ? url : undefined;
}
