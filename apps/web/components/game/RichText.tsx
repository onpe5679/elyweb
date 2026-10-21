/**
 * 어드민의 긴 글(줄바꿈 텍스트)을 읽기 좋은 문단으로 바꾼다.
 *  - 빈 줄 → 문단 나눔
 *  - "[소제목]" 으로 시작하는 문단 → 소제목 + 본문
 *  - "• " / "- " 로 시작하는 줄들 → 목록
 * 줄바꿈이 의미 있는 글(시놉시스의 짧은 줄)은 whitespace-pre-line 으로 그대로 살린다.
 */
export default function RichText({ text }: { text: string }) {
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className="t-prose">
      {paras.map((p, i) => {
        const m = p.match(/^\[([^\]\n]{1,60})\]\s*\n?([\s\S]*)$/);
        const body = m ? m[2].trim() : p;
        const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
        const isList = lines.length > 0 && lines.every((l) => /^([•·\-*]|\d+\.)\s*/.test(l));
        return (
          <div key={i} className={i > 0 ? 'mt-8' : ''}>
            {m && <h3 className="mb-2 font-display text-[19px] font-extrabold text-ink">{m[1]}</h3>}
            {body &&
              (isList ? (
                <ul className="list-disc space-y-2 pl-5">
                  {lines.map((l, j) => (
                    <li key={j}>{l.replace(/^([•·\-*]|\d+\.)\s*/, '')}</li>
                  ))}
                </ul>
              ) : (
                <p className="whitespace-pre-line break-keep">{body}</p>
              ))}
          </div>
        );
      })}
    </div>
  );
}
