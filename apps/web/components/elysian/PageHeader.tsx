import type { ReactNode } from 'react';

// Opening of a secondary Elysian page: a strip of manuscript cells behind the title,
// a mono kicker, the serif title with its Latin name, and an optional lead.
export default function PageHeader({ kicker, title, latin, lead, children }: { kicker: string; title: string; latin?: string; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="paper-grain manuscript-grid border-b border-ink/15">
      <div className="mx-auto max-w-page px-5 pb-12 pt-32 md:px-10 md:pb-16 md:pt-40">
        <p className="label text-ink-mute">{kicker}</p>
        <h1 className="mt-3 font-serif text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.02em] md:text-[4.5rem]">
          {title}
          {latin && latin !== title && <span className="ml-4 font-latin text-[0.5em] font-medium italic tracking-normal text-ink-mute">{latin}</span>}
        </h1>
        {lead && <div className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-ink-soft">{lead}</div>}
        {children}
      </div>
    </header>
  );
}
