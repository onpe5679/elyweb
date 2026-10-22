'use client';

import {KeyboardEvent, ReactNode, useRef} from 'react';
import {useTranslations} from 'next-intl';
import Image from 'next/image';
import {Link} from '@/i18n/routing';

type HeroProps = {
  heroImage?: string;
  heroTitle?: string;
  heroDescription?: string;
};

const MENU_KEYS = ['games', 'about', 'news', 'hobom', 'contact'] as const;

// Settings may wrap a phrase in **double asterisks** to mark it as the accent line.
function parseAccentText(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className="italic font-normal text-seal-soft">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

function TitleMenu({label, items}: {label: string; items: {key: string; href: string; text: string}[]}) {
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Arrow keys move between menu entries; Tab still works as usual.
  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const current = refs.current.findIndex((el) => el === document.activeElement);
    if (current === -1) return;
    const count = items.length;
    let next = -1;
    if (event.key === 'ArrowDown') next = (current + 1) % count;
    if (event.key === 'ArrowUp') next = (current - 1 + count) % count;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = count - 1;
    if (next === -1) return;
    event.preventDefault();
    refs.current[next]?.focus();
  };

  return (
    <nav aria-label={label}>
      <ul onKeyDown={onKeyDown} className="divide-y divide-moon/15 border-y border-moon/15">
        {items.map((item, index) => (
          <li key={item.key}>
            <Link
              href={item.href}
              ref={(el: HTMLAnchorElement | null) => {
                refs.current[index] = el;
              }}
              className="group flex items-center gap-5 py-4 outline-none md:py-5"
            >
              <span className="font-display w-7 shrink-0 text-sm tabular-nums text-moon-2">
                0{index + 1}
              </span>
              <span className="font-display text-3xl text-moon transition-transform duration-300 group-hover:translate-x-2 group-focus-visible:translate-x-2 md:text-4xl">
                {item.text}
              </span>
              <span
                aria-hidden="true"
                className="ml-auto h-px w-0 bg-seal-soft transition-all duration-300 group-hover:w-14 group-focus-visible:w-14"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Hero({heroImage, heroTitle, heroDescription}: HeroProps) {
  const t = useTranslations('Hero');
  const tNav = useTranslations('Navigation');

  const menuItems = MENU_KEYS.map((key) => ({
    key,
    href: key === 'games' ? '/games' : `/${key}`,
    text: tNav(key),
  }));

  return (
    <section className="on-night relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night text-moon">
      {heroImage && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroImage}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-40"
          />
        </div>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-night/30 via-night/75 to-night"
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-10 pt-32 sm:px-6 lg:px-8">
        <div className="grid flex-1 items-end gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p
              className="eyebrow !text-moon-2 animate-fade-in-up"
              style={{animationDelay: '0.05s'}}
            >
              {t('eyebrow')} · {t('label')}
            </p>
            <h1
              className="font-display mt-6 text-[clamp(2.75rem,6vw,6rem)] md:whitespace-nowrap font-normal leading-[0.92] tracking-tight text-moon animate-fade-in-up"
              style={{animationDelay: '0.15s'}}
            >
              {heroTitle ? (
                parseAccentText(heroTitle)
              ) : (
                <>
                  {t('title1_prefix')}
                  <span className="italic font-normal text-seal-soft">{t('title1_highlight')}</span>
                  {t('title1_suffix')}
                  <br />
                  {t('title2')}
                </>
              )}
            </h1>
            <p
              className="mt-8 max-w-md whitespace-pre-line text-base leading-relaxed text-moon-2 animate-fade-in-up md:text-lg"
              style={{animationDelay: '0.3s'}}
            >
              {heroDescription || t('description')}
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <a
                href="#projects"
                className="inline-flex items-center gap-2 bg-moon px-6 py-3.5 text-sm font-bold tracking-wide text-night transition-colors hover:bg-seal-soft"
              >
                {t('viewProjects')}
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-moon/60 px-6 py-3.5 text-sm font-bold tracking-wide text-moon transition-colors hover:border-moon hover:bg-moon/10"
              >
                {t('contact')}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9 animate-fade-in-up" style={{animationDelay: '0.45s'}}>
            <TitleMenu label={t('menuLabel')} items={menuItems} />
          </div>
        </div>

        <a
          href="#intro"
          className="mt-14 inline-flex items-center gap-4 self-start text-xs font-medium uppercase tracking-[0.22em] text-moon-2 transition-colors hover:text-moon"
        >
          <span className="relative block h-12 w-px overflow-hidden bg-moon/20" aria-hidden="true">
            <span className="cue-line absolute inset-x-0 top-0 h-1/2 bg-moon" />
          </span>
          {t('scroll')}
        </a>
      </div>
    </section>
  );
}
