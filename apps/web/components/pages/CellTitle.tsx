import Cells from '@/components/ui/Cells';

type Props = {
  text: string;
  size?: 'lg' | 'md' | 'sm';
  filled?: boolean;
  className?: string;
};

/**
 * 원고지 칸 제목. 단어 단위로 묶어 줄이 바뀔 때 단어 중간이 잘리지 않게 한다.
 * (Cells 는 글자마다 칸이라 영문/긴 한글 제목이 글자 단위로 꺾이기 때문)
 * 등장 애니메이션은 단어를 가로질러 이어지도록 지연값을 누적한다.
 */
export default function CellTitle({ text, size = 'md', filled, className = '' }: Props) {
  const words = text.split(/\s+/).filter(Boolean);
  let offset = 0;
  return (
    <span className={`flex flex-wrap gap-x-4 md:gap-x-6 ${className}`}>
      {words.map((w, i) => {
        const delay = offset * 55;
        offset += Array.from(w).length;
        return <Cells key={i} text={w} size={size} filled={filled} delay={delay} />;
      })}
    </span>
  );
}
