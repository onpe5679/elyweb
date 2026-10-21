import CellTitle from './CellTitle';

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  /** 제목 오른쪽 아래에 붙는 보조 영역(링크 등) */
  aside?: React.ReactNode;
};

/**
 * 보조 페이지 공통 머리말: 영문 소제목(mono) + 원고지 칸 제목(h1) + 짧은 안내문.
 * 배경은 원고지 모눈이 아래로 흐려진다. 가운데 정렬은 쓰지 않는다(8:4 비대칭).
 */
export default function PageHeader({ eyebrow, title, lead, aside }: Props) {
  return (
    <header className="relative isolate overflow-hidden">
      <div aria-hidden className="ruled ruled-fade absolute inset-0 -z-10 opacity-50" />
      <div className="mx-auto max-w-page px-5 pb-14 pt-14 md:px-10 md:pb-20 md:pt-20">
        <div className="grid gap-8 md:grid-cols-12 md:items-end md:gap-12">
          <div className="md:col-span-8">
            <p className="t-eyebrow">{eyebrow}</p>
            <h1 aria-label={title} className="mt-5">
              <CellTitle text={title} />
            </h1>
          </div>
          {(lead || aside) && (
            <div className="md:col-span-4">
              {lead && <p className="break-keep font-serif text-[16px] leading-8 text-ink-2 [text-wrap:pretty]">{lead}</p>}
              {aside && <div className="mt-5">{aside}</div>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
