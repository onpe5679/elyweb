import type { ReactNode } from 'react';

type Props = {
  id: string;
  number: number;
  kicker: string;
  title: string;
  latin?: string;
  aside?: ReactNode;
  as?: 'h1' | 'h2';
};

// Section opener used across Elysian pages: a vermilion seal with the chapter number,
// the chapter title in serif and its Latin name in italics, closed by an ink rule.
export default function ChapterHeading({ id, number, kicker, title, latin, aside, as: Tag = 'h2' }: Props) {
  return (
    <header className="flex flex-col gap-6 border-b border-ink pb-6 md:flex-row md:items-end md:justify-between">
      <div className="flex items-start gap-4 md:gap-5">
        <span aria-hidden="true" className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center bg-accent font-mono text-sm text-accent-ink md:h-12 md:w-12">
          {String(number).padStart(2, '0')}
        </span>
        <div>
          <p className="label text-ink-mute">{kicker}</p>
          <Tag id={id} tabIndex={-1} className="mt-1 font-serif text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.02em] outline-none md:text-[3.25rem]">
            {title}
            {latin && latin !== title && (
              <span className="ml-3 font-latin text-[0.55em] font-medium italic tracking-normal text-ink-mute">{latin}</span>
            )}
          </Tag>
        </div>
      </div>
      {aside && <div className="max-w-md text-[0.9375rem] leading-relaxed text-ink-soft md:text-right">{aside}</div>}
    </header>
  );
}
