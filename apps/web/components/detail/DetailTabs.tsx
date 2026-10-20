'use client';

import { useEffect, useRef, useState } from 'react';

type Tab = { id: string; label: string };

// In-page section index under the hero (like a streaming title's tabs). Every section stays on
// the page for reading and search; the bar only jumps and highlights the one in view.
export default function DetailTabs({ tabs, label, variant }: { tabs: Tab[]; label: string; variant: 'elysian' | 'habom' }) {
  const [current, setCurrent] = useState(tabs[0]?.id);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = tabs.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [tabs]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-tab="${current}"]`);
    if (el && listRef.current) {
      const list = listRef.current;
      const left = el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2;
      list.scrollTo({ left, behavior: 'smooth' });
    }
  }, [current]);

  if (tabs.length < 2) return null;

  const habom = variant === 'habom';
  return (
    <nav aria-label={label} className={`sticky top-16 z-30 ${habom ? 'bg-cream/90' : 'border-b border-ink/15 bg-paper/90'} backdrop-blur-md`}>
      <ul ref={listRef} className={`no-scrollbar mx-auto flex max-w-page gap-1 overflow-x-auto px-5 md:px-10 ${habom ? 'py-3' : ''}`}>
        {tabs.map((t) => {
          const active = current === t.id;
          return (
            <li key={t.id} data-tab={t.id} className="shrink-0">
              <a
                href={`#${t.id}`}
                aria-current={active ? 'location' : undefined}
                onClick={() => setCurrent(t.id)}
                className={
                  habom
                    ? `flex min-h-[40px] items-center rounded-full px-4 text-[0.875rem] font-semibold transition-colors ${active ? 'bg-rose text-white' : 'text-plum-soft hover:bg-blush'}`
                    : `relative flex min-h-[52px] items-center px-3 text-[0.875rem] transition-colors md:px-4 ${active ? 'text-ink' : 'text-ink-mute hover:text-ink'}`
                }
              >
                {t.label}
                {!habom && <span aria-hidden="true" className={`absolute inset-x-3 bottom-0 h-0.5 bg-accent transition-transform md:inset-x-4 ${active ? 'scale-x-100' : 'scale-x-0'}`} />}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
