type Props = {
  text: string;
  /** 칸을 잉크색으로 채운다(역상) */
  filled?: boolean;
  size?: 'lg' | 'md' | 'sm';
  /** 첫 줄 앞에 비워 둘 칸 수 */
  indent?: number;
  /** 등장 애니메이션 시작 지연(ms) */
  delay?: number;
  className?: string;
};

/**
 * 원고지 칸 타이포: 글자 한 자를 칸 하나에 넣는다.
 * 스크린 리더에는 전체 문구를 한 번만 읽히고 칸은 장식으로 둔다.
 */
export default function Cells({ text, filled, size = 'lg', indent = 0, delay = 0, className = '' }: Props) {
  const chars = Array.from(text);
  return (
    <span
      role="text"
      aria-label={text}
      className={`cells ${size === 'sm' ? 'cells--sm' : size === 'md' ? 'cells--md' : ''} ${filled ? 'cells--filled' : ''} ${className}`}
    >
      {indent > 0 && <span aria-hidden className="cells__indent" style={{ width: `calc(var(--cell) * ${indent})` }} />}
      {chars.map((c, i) =>
        c === ' ' ? (
          <span key={i} aria-hidden className="cells__gap" />
        ) : (
          <span key={i} aria-hidden className="cell" style={{ ['--i' as string]: i, ['--d' as string]: `${delay}ms` }}>
            {c}
          </span>
        )
      )}
    </span>
  );
}
