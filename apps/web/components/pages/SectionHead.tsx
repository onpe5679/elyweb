type Props = {
  id: string;
  eyebrow: string;
  title: string;
  /** 데스크톱에서 본문 옆에 붙어 따라오게 한다 */
  sticky?: boolean;
  inverse?: boolean;
  /** 12칸 그리드에서 차지하는 칸 수(기본 4) */
  span?: 4 | 5;
  children?: React.ReactNode;
};

/** 섹션의 왼쪽 열: 영문 소제목 + h2 (+ 짧은 설명). */
export default function SectionHead({ id, eyebrow, title, sticky, inverse, span = 4, children }: Props) {
  return (
    <div className={`${span === 5 ? 'md:col-span-5' : 'md:col-span-4'} ${sticky ? 'md:sticky md:top-[calc(var(--header-h)+32px)] md:self-start' : ''}`}>
      <p className={`t-eyebrow ${inverse ? '!text-paper/60' : ''}`}>{eyebrow}</p>
      <h2 id={id} className="t-display mt-4 break-keep text-[clamp(26px,3.4vw,42px)]">
        {title}
      </h2>
      {children && <div className={`mt-5 max-w-sm break-keep font-serif text-[16px] leading-8 ${inverse ? 'text-paper/75' : 'text-ink-2'}`}>{children}</div>}
    </div>
  );
}
