'use client';

import { useEffect, useRef, useState } from 'react';

type Tab = { id: string; label: string };

/** 히어로 아래 구역 바로가기(알약 탭). 지금 보고 있는 구역을 표시한다. */
export default function HabomTabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const [current, setCurrent] = useState(tabs[0]?.id);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = tabs.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length || !('IntersectionObserver' in window)) return;
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
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(`[data-tab="${current}"]`);
    if (el && list) list.scrollTo({ left: el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
  }, [current]);

  if (tabs.length < 2) return null;

  return (
    <nav aria-label={label} className="sticky top-16 z-30 bg-cream/90 backdrop-blur-md">
      <ul ref={listRef} className="no-scrollbar mx-auto flex max-w-page gap-1 overflow-x-auto px-5 py-3 md:px-10">
        {tabs.map((t) => {
          const active = current === t.id;
          return (
            <li key={t.id} data-tab={t.id} className="shrink-0">
              <a
                href={`#${t.id}`}
                aria-current={active ? 'location' : undefined}
                onClick={() => setCurrent(t.id)}
                className={`flex min-h-[40px] items-center rounded-full px-4 text-[0.875rem] font-semibold transition-colors ${active ? 'bg-rose text-white' : 'text-plum-soft hover:bg-blush'}`}
              >
                {t.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
