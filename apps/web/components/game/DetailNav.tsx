'use client';

import { useEffect, useState } from 'react';

type Item = { id: string; label: string };

/** 상세 페이지의 고정 탭. 스크롤 위치에 맞춰 현재 구역을 표시한다(앵커 이동이므로 JS 없이도 동작). */
export default function DetailNav({ items, label }: { items: Item[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="sticky top-[var(--header-h)] z-40 border-b border-ink/15 bg-paper/92 backdrop-blur-md">
      <ul className="mx-auto flex max-w-page gap-1 overflow-x-auto px-5 md:px-10 [scrollbar-width:none]">
        {items.map((i) => (
          <li key={i.id} className="shrink-0">
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? 'true' : undefined}
              className={`relative flex h-[52px] items-center px-4 text-[15px] font-bold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent-text after:transition-transform after:duration-300 ${
                active === i.id ? 'text-ink after:scale-x-100' : 'text-ink-3 hover:text-ink'
              }`}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
