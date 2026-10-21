/**
 * 어드민에서 입력한 본문(HTML 또는 일반 텍스트)을 읽기 좋은 글자판으로 보여 준다.
 * 별도의 typography 플러그인이 없으므로 자주 쓰는 태그만 여기서 직접 스타일한다.
 */
const HAS_TAGS = /<\/?[a-z][\s\S]*?>/i;

const STYLE = [
  't-prose break-keep',
  '[&_a]:text-accent-text [&_a]:underline [&_a]:underline-offset-4',
  '[&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-[1.5em] [&_h2]:font-extrabold [&_h2]:leading-snug [&_h2]:text-ink',
  '[&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:font-display [&_h3]:text-[1.25em] [&_h3]:font-extrabold [&_h3]:leading-snug [&_h3]:text-ink',
  '[&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full',
  '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1',
  '[&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-ink [&_blockquote]:pl-5 [&_blockquote]:text-ink',
  '[&_hr]:my-10 [&_hr]:border-ink/20',
  '[&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full',
  '[&_p+p]:mt-[1.2em]',
].join(' ');

export default function RichText({ html, className = '' }: { html: string; className?: string }) {
  if (!html) return null;
  if (!HAS_TAGS.test(html)) {
    const paragraphs = html.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    return (
      <div className={`t-prose break-keep ${className}`}>
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
      </div>
    );
  }
  // 어드민이 작성한 신뢰된 HTML — 기존 페이지와 같은 방식으로 그대로 렌더링한다.
  return <div className={`${STYLE} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
