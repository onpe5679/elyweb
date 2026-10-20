'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/Icon';
import type { DemoScript } from '@/lib/habom/demo-script';

export const DEMO_OPEN_EVENT = 'habom-demo:open';

type Props = { script: DemoScript; background: string; steamUrl?: string; title: string };

// Habom-only mini demo: advance lines, pick a reply, reach a short ending, restart or close.
// The bundled script is a clearly labelled mock-up sample, not game content.
export default function DialogueDemo({ script, background, steamUrl, title }: Props) {
  const t = useTranslations('Demo');
  const [open, setOpen] = useState(false);
  const first = script.nodes[script.start].lines[0];

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(DEMO_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(DEMO_OPEN_EVENT, onOpen);
  }, []);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-butter text-plum">
          <Icon name="chat" size={18} />
        </span>
        <h2 id="demo-title" className="font-round text-[2rem] leading-none md:text-[2.5rem]">{t('title')}</h2>
        <SampleBadge />
      </div>

      <div className="mt-10 grid items-center gap-8 lg:grid-cols-12">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="group relative block overflow-hidden rounded-[28px] text-left lg:col-span-8"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={background} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-plum/50 via-transparent to-transparent" />
          <span className="absolute inset-x-3 bottom-3 rounded-[20px] bg-white/95 p-4 text-plum shadow-lg md:inset-x-6 md:bottom-6 md:p-5">
            <span className="block text-[0.9375rem] leading-relaxed md:text-[1.0625rem]">{first.text}</span>
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose px-4 py-2 text-sm font-semibold text-white">
              <Icon name="play" size={14} /> {t('start')}
            </span>
          </span>
        </button>
        <div className="lg:col-span-4">
          <p className="text-[1.0625rem] leading-relaxed text-plum">{t('lead')}</p>
          <p className="mt-4 rounded-[18px] bg-butter-soft p-4 text-[0.875rem] leading-relaxed text-plum-soft">
            <strong className="font-semibold text-plum">{t('badgeLong')}</strong> — {t('note')}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className="mt-6 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-rose px-6 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(201,65,109,.8)] transition-transform hover:-translate-y-0.5"
          >
            <Icon name="chat" size={18} /> {t('start')}
          </button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} label={`${title} — ${t('dialog')}`}>
        <DemoStage script={script} background={background} steamUrl={steamUrl} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function SampleBadge() {
  const t = useTranslations('Demo');
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-plum px-3 py-1 text-xs font-semibold text-cream">
      <span className="font-round-latin font-extrabold tracking-[0.14em] text-butter">{t('badge')}</span>
      {t('badgeLong')}
    </span>
  );
}

type Position = { node: string; line: number };

function DemoStage({ script, background, steamUrl, onClose }: { script: DemoScript; background: string; steamUrl?: string; onClose: () => void }) {
  const t = useTranslations('Demo');
  const [pos, setPos] = useState<Position>({ node: script.start, line: 0 });
  const [typed, setTyped] = useState(0);
  const [mode, setMode] = useState<'line' | 'choice' | 'end'>('line');
  const advanceRef = useRef<HTMLButtonElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const againRef = useRef<HTMLButtonElement>(null);

  const node = script.nodes[pos.node];
  const line = node.lines[pos.line];
  const full = line?.text ?? '';
  const done = typed >= full.length;

  // Typewriter effect (instant when the user prefers reduced motion)
  useEffect(() => {
    if (mode !== 'line') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(full.length);
      return;
    }
    setTyped(0);
    const id = window.setInterval(() => {
      setTyped((n) => {
        if (n >= full.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 32);
    return () => window.clearInterval(id);
  }, [full, mode]);

  useEffect(() => {
    if (mode === 'line') advanceRef.current?.focus();
    if (mode === 'choice') firstChoiceRef.current?.focus();
    if (mode === 'end') againRef.current?.focus();
  }, [mode]);

  const advance = useCallback(() => {
    if (!done) {
      setTyped(full.length);
      return;
    }
    if (pos.line < node.lines.length - 1) {
      setPos({ node: pos.node, line: pos.line + 1 });
    } else if (node.choices?.length) {
      setMode('choice');
    } else if (node.next) {
      setPos({ node: node.next, line: 0 });
    } else {
      setMode('end');
    }
  }, [done, full.length, node, pos]);

  const choose = (next: string) => {
    setPos({ node: next, line: 0 });
    setMode('line');
  };

  const restart = () => {
    setPos({ node: script.start, line: 0 });
    setMode('line');
    setTyped(0);
  };

  const speaker = line?.speaker ? script.speakers[line.speaker] : null;

  return (
    <div className="theme-habom flex h-full w-full items-center justify-center md:p-8">
      {/* Mobile: art on top, dialogue below (VN style). Desktop: dialogue over a 16:9 stage. */}
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-cream text-plum md:h-auto md:rounded-[32px] md:bg-plum md:[aspect-ratio:16/9]">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden sm:aspect-video md:absolute md:inset-0 md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={background} alt="" className={`h-full w-full object-cover transition-[filter,opacity] duration-500 ${mode === 'line' ? '' : 'opacity-80 blur-[2px]'}`} />
          <span aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-t from-plum/60 via-transparent to-plum/30 md:block" />
        </div>

        {/* top bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 md:p-5">
          <span className="inline-flex flex-col rounded-[16px] bg-butter px-3 py-2 text-[0.75rem] leading-tight text-plum shadow">
            <span className="font-round-latin font-extrabold tracking-[0.14em]">{t('badge')} · {t('badgeLong')}</span>
            <span className="hidden sm:block">{t('note')}</span>
          </span>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={restart} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full bg-white/90 px-3 text-sm font-semibold hover:bg-white sm:px-4">
              <Icon name="restart" size={16} /> <span className="sr-only sm:not-sr-only">{t('restart')}</span>
            </button>
            <button type="button" onClick={onClose} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full bg-white/90 px-3 text-sm font-semibold hover:bg-white sm:px-4">
              <Icon name="close" size={16} /> <span className="sr-only sm:not-sr-only">{t('close')}</span>
            </button>
          </div>
        </div>

        <div className="hidden flex-1 md:block" />

        {mode === 'line' && line && (
          <div className="relative z-10 flex flex-1 flex-col justify-start p-3 pt-6 md:flex-none md:p-6">
            {speaker && (
              <span className="relative z-10 ml-4 inline-block -translate-y-1/2 self-start rounded-full bg-rose px-5 py-1.5 font-round text-lg text-white shadow">{speaker}</span>
            )}
            <button
              ref={advanceRef}
              data-autofocus
              type="button"
              onClick={advance}
              aria-label={t('next')}
              className={`block w-full rounded-[24px] bg-white p-5 text-left shadow-xl ring-4 ring-blush/70 md:bg-white/95 md:p-7 ${speaker ? '-mt-5 pt-7 md:pt-8' : ''}`}
            >
              <span aria-hidden="true" className={`block min-h-[4.5rem] text-[1.0625rem] leading-relaxed md:text-[1.25rem] ${speaker ? '' : 'text-plum-soft'}`}>
                {!speaker && <span className="mr-2 text-rose">—</span>}
                {full.slice(0, typed)}
                {done && <span className="ml-1 inline-block animate-blink text-rose">▼</span>}
              </span>
              <span className="mt-3 block text-right text-[0.75rem] text-plum-soft">{t('advance')}</span>
            </button>
            <p aria-live="polite" className="sr-only">{speaker ? `${speaker}: ${full}` : `${t('narration')}: ${full}`}</p>
          </div>
        )}

        {mode === 'choice' && node.choices && (
          <div role="group" aria-label={t('choicePrompt')} className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3 p-4 md:absolute md:inset-0 md:p-5">
            <p className="mb-2 rounded-full bg-plum/85 px-5 py-2 font-round text-lg text-cream" aria-live="polite">{t('choicePrompt')}</p>
            {node.choices.map((c, i) => (
              <button
                key={c.next}
                ref={i === 0 ? firstChoiceRef : undefined}
                type="button"
                onClick={() => choose(c.next)}
                className="w-full max-w-xl rounded-full bg-white px-6 py-4 text-left text-[1rem] font-semibold shadow-lg ring-2 ring-blush transition hover:ring-rose focus-visible:ring-rose md:bg-white/95 md:text-[1.0625rem] md:ring-transparent"
              >
                <span aria-hidden="true" className="mr-3 font-round-latin text-rose">{String.fromCharCode(65 + i)}</span>
                {c.label}
              </button>
            ))}
          </div>
        )}

        {mode === 'end' && (
          <div className="relative z-10 flex flex-1 items-center justify-center p-4 md:absolute md:inset-0 md:p-5">
            <div className="w-full max-w-md rounded-[28px] bg-cream p-7 text-center shadow-2xl ring-4 ring-blush">
              <Icon name="sparkle" size={28} className="mx-auto text-rose" />
              <p className="mt-3 font-round text-3xl" aria-live="polite">{t('endTitle')}</p>
              <p className="mt-2 text-plum-soft">{t('endBody')}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button ref={againRef} type="button" onClick={restart} className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-rose px-5 font-semibold text-white">
                  <Icon name="restart" size={16} /> {t('again')}
                </button>
                {steamUrl && (
                  <a href={steamUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-5 font-semibold ring-1 ring-plum/15">
                    <Icon name="steam" size={16} /> {t('steam')} <Icon name="arrowUpRight" size={14} />
                  </a>
                )}
                <button type="button" onClick={onClose} className="inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 font-semibold text-plum-soft hover:bg-blush">
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DemoLauncher({ className }: { className: string }) {
  const t = useTranslations('Detail');
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(DEMO_OPEN_EVENT))} aria-haspopup="dialog" className={className}>
      <Icon name="chat" size={18} /> {t('demo')}
    </button>
  );
}
