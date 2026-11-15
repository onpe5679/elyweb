import type { CreditGroup } from '@/lib/game-model';

type Variant = 'elysian' | 'habom';

/** 묶음을 순서대로, 지금까지 가장 짧은 단에 넣는다(높이는 줄 수로 어림). */
function distribute(groups: CreditGroup[], cols: number): CreditGroup[][] {
  const out: CreditGroup[][] = Array.from({ length: cols }, () => []);
  const heights = new Array(cols).fill(0);
  for (const g of groups) {
    const i = heights.indexOf(Math.min(...heights));
    out[i].push(g);
    heights[i] += g.rows.length + 2.5; // 제목·여백 몫
  }
  return out.filter((c) => c.length);
}

/**
 * 제작진 크레딧(시안 C 하봄 스타일: 카드 + 점선 리더).
 * 짧은 묶음(OST 등)이 긴 묶음 옆 단의 빈자리를 채우도록 단마다 쌓는다.
 * 모바일은 1단, md 2단, xl 3단.
 */
export default function CreditsGrid({ groups, variant = 'elysian' }: { groups: CreditGroup[]; variant?: Variant }) {
  const habom = variant === 'habom';

  const Card = ({ g }: { g: CreditGroup }) => (
    <section
      className={`p-6 ${habom ? 'rounded-[24px] bg-white ring-1 ring-blush' : 'bg-paper-3 shadow-[0_0_0_1px_rgb(var(--c-ink)/.14)]'}`}
    >
      <h3 className={habom ? 'font-round text-lg text-rose' : 'font-display text-[17px] font-extrabold text-accent-text'}>{g.title}</h3>
      <dl className="mt-3 text-[15px]">
        {g.rows.map((r, i) => (
          <div key={i} className="leader py-1.5">
            <dt className={habom ? 'shrink-0 text-plum-soft' : 'shrink-0 text-ink-3'}>{r.role}</dt>
            <dd className={`text-right font-medium ${habom ? 'text-plum' : 'text-ink'}`}>{r.name}</dd>
          </div>
        ))}
      </dl>
    </section>
  );

  const Columns = ({ cols, className }: { cols: number; className: string }) => {
    const columns = distribute(groups, cols);
    return (
      <div className={`${className} items-start gap-6`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-6">
            {col.map((g) => <Card key={g.id} g={g} />)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div data-testid="credits">
      <div className="flex flex-col gap-6 md:hidden">
        {groups.map((g) => <Card key={g.id} g={g} />)}
      </div>
      <Columns cols={Math.min(2, groups.length)} className={`hidden md:grid ${groups.length > 2 ? 'xl:hidden' : ''}`} />
      {groups.length > 2 && <Columns cols={3} className="hidden xl:grid" />}
    </div>
  );
}
