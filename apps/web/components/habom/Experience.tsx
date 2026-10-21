'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useFocusTrap } from '@/components/ui/useFocusTrap';
import {
  BEAT_MAP,
  ENDING_MAP,
  ENDINGS,
  ROOMMATES,
  SPEAKERS,
  START,
  TOTAL_CHOICES,
  TOTAL_STEPS,
  emptyTally,
  resolveEnding,
  type EndingId,
  type L10n,
  type Locale,
  type Tally,
  type Who,
} from './experience-script';
import './habom.css';

/**
 * 하봄 대사·선택지 체험 오버레이 (시안용 예시 대본 — 공식 게임 내용 아님).
 * 키아트를 어둡게 깐 비주얼 노벨풍 화면. 대사 → 선택지(3회) → 엔딩 카드.
 * 키보드: Enter/Space 다음(글자가 나오는 중이면 한 번에 표시) · 1 2 3 선택 · R 다시 하기 · Esc 닫기.
 * 소리는 없다.
 */

export type ExperienceGame = { slug: string; title: string; image?: string };

type Pick = { choiceId: string; optionId: string; points: Who };
type Phase = 'lines' | 'choice' | 'summary';
type State = { beatId: string; line: number; phase: Phase; picks: Pick[]; run: number };

const initial = (run = 0): State => ({ beatId: START, line: 0, phase: 'lines', picks: [], run });

const tallyOf = (picks: Pick[]): Tally => {
  const t = emptyTally();
  picks.forEach((p) => (t[p.points] += 1));
  return t;
};

const SEEN_KEY = 'habom:experience-sample:endings';
function readSeen(): EndingId[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is EndingId => id in ENDING_MAP) : [];
  } catch {
    return [];
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

const PAUSE_LONG = /[.!?…。！？]/;
const PAUSE_SHORT = /[,、，]/;
const charDelay = (locale: Locale, ch: string) => {
  const base = locale === 'en' ? 20 : locale === 'ja' ? 34 : 30;
  if (PAUSE_LONG.test(ch)) return base + 150;
  if (PAUSE_SHORT.test(ch)) return base + 70;
  return base;
};

export default function Experience({ game, onClose }: { game: ExperienceGame; onClose: () => void }) {
  const t = useTranslations('Experience');
  const rawLocale = useLocale();
  const locale: Locale = rawLocale === 'en' || rawLocale === 'ja' ? rawLocale : 'ko';
  const tx = useCallback((l: L10n) => l[locale] || l.ko, [locale]);
  const pathname = usePathname().replace(/\/+$/, '');
  const gameHref = `/games/${game.slug}`;
  const onGamePage = pathname === gameHref;
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  // 포커스 트랩(Esc → 닫기, Tab 순환, 스크롤 잠금, 닫히면 열었던 요소로 포커스 복귀)
  useFocusTrap(rootRef, true, () => closeRef.current());

  const titleId = useId();
  const promptId = useId();
  const endingTitleId = useId();

  const [state, setState] = useState<State>(() => initial());
  const stateRef = useRef(state);
  const commit = (next: State) => {
    stateRef.current = next;
    setState(next);
  };

  const beat = BEAT_MAP[state.beatId];
  const line = beat.lines[state.line];
  const lineText = tx(line.text);
  const chars = Array.from(lineText);
  const total = chars.length;
  const lineKey = `${state.run}:${state.beatId}:${state.line}`;

  // ---- 타자 효과: 글자 수 n 만 보여 준다. 줄이 바뀌면 key 가 달라져 자동으로 0 부터 시작 -----------------------------
  const [rev, setRev] = useState({ key: lineKey, n: 0 });
  const n = reduced ? total : rev.key === lineKey ? Math.min(rev.n, total) : 0;
  const done = n >= total;
  const doneRef = useRef(done);
  doneRef.current = done;
  const lineInfo = useRef({ key: lineKey, total });
  lineInfo.current = { key: lineKey, total };

  useEffect(() => {
    if (reduced || state.phase !== 'lines' || n >= total) return;
    const id = window.setTimeout(
      () => setRev((r) => ({ key: lineKey, n: (r.key === lineKey ? r.n : 0) + 1 })),
      n === 0 ? 160 : charDelay(locale, chars[n - 1])
    );
    return () => window.clearTimeout(id);
    // chars 는 lineText 에서 파생되므로 lineKey/locale 로 충분하다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, lineKey, total, reduced, state.phase, locale]);

  const completeLine = () => {
    const { key, total: tot } = lineInfo.current;
    doneRef.current = true;
    setRev({ key, n: tot });
  };

  // ---- 진행 ------------------------------------------------------------------------------------------------
  const advance = () => {
    const s = stateRef.current;
    if (s.phase !== 'lines') return;
    if (!doneRef.current) {
      completeLine(); // 글자가 나오는 중이면 한 번에 표시
      return;
    }
    const b = BEAT_MAP[s.beatId];
    if (s.line < b.lines.length - 1) {
      commit({ ...s, line: s.line + 1 });
      return;
    }
    const nx = b.next;
    if (nx.type === 'goto') commit({ ...s, beatId: nx.to, line: 0 });
    else if (nx.type === 'choice') commit({ ...s, phase: 'choice' });
    else if (nx.type === 'resolveEnding') commit({ ...s, beatId: ENDING_MAP[resolveEnding(tallyOf(s.picks))].beat, line: 0 });
    else commit({ ...s, phase: 'summary' });
  };

  const choose = (index: number) => {
    const s = stateRef.current;
    if (s.phase !== 'choice') return;
    const nx = BEAT_MAP[s.beatId].next;
    if (nx.type !== 'choice') return;
    const opt = nx.choice.options[index];
    if (!opt) return;
    commit({
      ...s,
      beatId: opt.to,
      line: 0,
      phase: 'lines',
      picks: [...s.picks, { choiceId: nx.choice.id, optionId: opt.id, points: opt.points }],
    });
  };

  const forceFocus = useRef(false);
  const restart = () => {
    forceFocus.current = true;
    commit(initial(stateRef.current.run + 1));
  };

  // 키보드(문서 전체): 포커스가 버튼·링크에 있으면 Enter/Space 는 그 요소의 기본 동작에 맡긴다.
  const handlers = useRef({ advance, choose, restart });
  handlers.current = { advance, choose, restart };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const onControl = !!target?.closest?.('button, a[href], [role="button"]');
      if (e.key === 'Enter' || e.key === ' ') {
        if (onControl || e.repeat) return;
        e.preventDefault();
        handlers.current.advance();
      } else if (/^[1-9]$/.test(e.key)) {
        if (stateRef.current.phase !== 'choice') return;
        e.preventDefault();
        handlers.current.choose(Number(e.key) - 1);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handlers.current.restart();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // 화면 아무 데나 눌러도 다음으로(버튼·링크 제외). 선택지/엔딩 단계에서는 아무 일도 없다.
  const onRootClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a[href], [data-no-advance]')) return;
    advance();
  };

  // 단계가 바뀌어 포커스를 잃으면 이 단계의 주 버튼(다음 / 첫 선택지 / 다시 하기)으로 옮긴다.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const active = document.activeElement;
    const lost = !active || active === document.body || active === root || !root.contains(active);
    if (lost || forceFocus.current) {
      forceFocus.current = false;
      root.querySelector<HTMLElement>('[data-primary]')?.focus({ preventScroll: true });
    }
  }, [state.phase, state.beatId, state.line, state.run]);

  // ---- 엔딩 수집(이 브라우저에서만 기억하는 편의 기능) ---------------------------------------------------------------
  const [seen, setSeen] = useState<EndingId[]>(readSeen);
  const endingId = beat.ending;
  useEffect(() => {
    if (state.phase === 'summary' && endingId) setSeen((prev) => (prev.includes(endingId) ? prev : [...prev, endingId]));
  }, [state.phase, endingId]);
  useEffect(() => {
    try {
      window.localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    } catch {}
  }, [seen]);

  // ---- 파생 값 --------------------------------------------------------------------------------------------
  const choiceNext = beat.next.type === 'choice' ? beat.next.choice : null;
  const speakerName = SPEAKERS[line.speaker].name;
  const isNarration = line.speaker === 'narrator';
  const lineFrac = state.phase === 'lines' ? (state.line + 1) / beat.lines.length : 1;
  const progress = state.phase === 'summary' ? 1 : Math.min(1, (beat.step + lineFrac) / TOTAL_STEPS);
  const pct = Math.round(progress * 100);
  const choicesDone = state.picks.length;
  const tally = tallyOf(state.picks);
  const ending = endingId ? ENDING_MAP[endingId] : null;
  const endingNo = ending ? ENDINGS.findIndex((e) => e.id === ending.id) + 1 : 0;
  const seenNow = ending && !seen.includes(ending.id) ? [...seen, ending.id] : seen;

  // 스크린 리더용 안내(보이는 글자는 타자 효과 때문에 aria-hidden)
  const liveText =
    state.phase === 'lines'
      ? `${speakerName ? tx(speakerName) + ': ' : ''}${lineText}`
      : state.phase === 'choice' && choiceNext
        ? tx(choiceNext.prompt)
        : ending
          ? t('endingAnnounce', { title: tx(ending.title) })
          : '';

  return (
    <div
      ref={rootRef}
      data-brand="habom"
      data-testid="habom-experience"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onClick={onRootClick}
      className="exp-root fixed inset-0 z-[120] flex flex-col overflow-hidden bg-paper-2 text-ink outline-none"
    >
      {/* 배경: 키아트(어둡게) */}
      <div aria-hidden className="absolute inset-0">
        {game.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.image} alt="" className="exp-art" draggable={false} />
        ) : (
          <>
            <span className="blob left-[-8%] top-[8%] h-72 w-72 bg-sub opacity-70" />
            <span className="blob bottom-[10%] right-[-6%] h-80 w-80 bg-accent opacity-50" />
          </>
        )}
        <div className="exp-dim absolute inset-0" />
      </div>

      {/* 상단 띠 + 헤더(항상 보임) */}
      <div data-no-advance className="relative z-10 border-b-2 border-ink bg-paper">
        <p className="exp-stripe px-4 py-1.5 text-center" data-testid="exp-draft-badge">
          {t('draftBadge')}
        </p>
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-2.5 sm:px-8">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="min-w-0">
              <span className="t-eyebrow block !text-[11px]">{t('eyebrow')}</span>
              <span className="block truncate font-display text-[18px] leading-tight sm:text-[21px]">{game.title}</span>
            </h2>
            <div className="mt-1.5 flex items-center gap-3">
              <div
                role="progressbar"
                aria-label={t('progress')}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                className="exp-bar"
                data-testid="exp-progress"
              >
                <i style={{ width: `${Math.max(pct, 4)}%` }} />
              </div>
              <span className="shrink-0 font-mono text-[11px] text-ink-2" data-testid="exp-choice-count">
                {t('choiceCount', { done: choicesDone, total: TOTAL_CHOICES })}
              </span>
            </div>
          </div>
          <button type="button" className="exp-pill" onClick={restart} aria-label={t('restartAria')} data-testid="exp-restart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
            <span className="hidden sm:inline">{t('restart')}</span>
          </button>
          <button type="button" className="exp-pill" onClick={() => onClose()} aria-label={t('closeAria')} data-testid="exp-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
            <span className="hidden sm:inline">{t('close')}</span>
          </button>
        </div>
      </div>

      {/* 무대: 선택지 또는 엔딩 카드 */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-3 pt-4 sm:px-8" data-stage>
        {state.phase === 'choice' && choiceNext && (
          <section aria-labelledby={promptId} className="mx-auto mt-auto w-full max-w-2xl" data-testid="exp-choices">
            <p className="sticker mb-2.5 !text-[14px] [--r:-2deg]">{t('choiceNow', { n: state.picks.length + 1, total: TOTAL_CHOICES })}</p>
            <h3 id={promptId} className="exp-prompt mb-3 kr-keep">
              {tx(choiceNext.prompt)}
            </h3>
            <ul className="grid gap-3 pb-1">
              {choiceNext.options.map((o, i) => (
                <li key={o.id}>
                  <button
                    type="button"
                    className="exp-choice kr-keep"
                    style={{ ['--i' as string]: i }}
                    data-primary={i === 0 ? '' : undefined}
                    data-testid="exp-choice"
                    onClick={() => choose(i)}
                  >
                    <span className="exp-key" aria-hidden>
                      {i + 1}
                    </span>
                    <span>
                      <span className="sr-only">{i + 1}. </span>
                      {tx(o.label)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {state.phase === 'summary' && ending && (
          <section aria-labelledby={endingTitleId} className="exp-card relative mx-auto my-auto w-full max-w-2xl px-5 py-6 sm:px-9 sm:py-8" data-testid="exp-summary" data-ending={ending.id}>
            <span className="sticker !text-[15px] [--r:-3deg]">{t('endingLabel', { n: endingNo, total: ENDINGS.length })}</span>
            <h3 id={endingTitleId} className="t-display kr-keep mt-4 text-[clamp(28px,5vw,42px)]" data-testid="exp-ending-title">
              {tx(ending.title)}
            </h3>
            <p className="kr-keep mt-3 font-serif text-[16px] leading-8 text-ink-2">{tx(ending.summary)}</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="t-eyebrow !text-[12px]">{t('yourChoices')}</h4>
                <ol className="mt-3 grid gap-3" data-testid="exp-picks">
                  {state.picks.map((p, i) => {
                    const choice = findChoice(p.choiceId);
                    const opt = choice?.options.find((o) => o.id === p.optionId);
                    if (!choice || !opt) return null;
                    return (
                      <li key={p.choiceId} className="flex gap-3">
                        <span className="exp-key !h-7 !w-7 !text-[14px]" aria-hidden>
                          {i + 1}
                        </span>
                        <span className="kr-keep min-w-0 text-[14.5px] leading-6">
                          <span className="block text-ink-3">{tx(choice.prompt)}</span>
                          <span className="block font-bold">{tx(opt.label)}</span>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="grid content-start gap-6">
                <div>
                  <h4 className="t-eyebrow !text-[12px]">{t('closeness')}</h4>
                  <ul className="mt-3 grid gap-2">
                    {ROOMMATES.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-3 text-[14.5px]" aria-label={t('closenessItem', { name: tx(r.name), count: tally[r.id], total: TOTAL_CHOICES })}>
                        <span aria-hidden className="font-bold">
                          {tx(r.name)}
                        </span>
                        <span aria-hidden className="inline-flex gap-1.5">
                          {Array.from({ length: TOTAL_CHOICES }, (_, k) => (
                            <i key={k} className="exp-dot" data-on={k < tally[r.id]} />
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="t-eyebrow !text-[12px]" data-testid="exp-collection">
                    {t('collection', { found: seenNow.length, total: ENDINGS.length })}
                  </h4>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {ENDINGS.map((e) => {
                      const found = seenNow.includes(e.id);
                      const current = e.id === ending.id;
                      return (
                        <li key={e.id} className="exp-chip" data-state={current ? 'current' : found ? 'found' : 'locked'} aria-label={found ? tx(e.title) : t('lockedLabel')}>
                          <span aria-hidden>{found ? tx(e.title) : t('locked')}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            <p className="kr-keep mt-6 rounded-[18px] bg-paper-2 px-4 py-3 text-[13px] leading-6 text-ink-2">
              {t('draftNote')} {t('replayHint')}
            </p>

            <div className="sticky -bottom-3 -mx-5 mt-4 flex flex-wrap gap-3 bg-paper-3 px-5 pb-4 pt-3 sm:-mx-9 sm:px-9">
              <button type="button" data-primary className="btn btn--accent" onClick={restart} data-testid="exp-summary-restart">
                {t('restart')} <span className="exp-kbd" aria-hidden>R</span>
              </button>
              {!onGamePage && (
                <Link href={gameHref} className="btn btn--ghost" data-testid="exp-to-game">
                  {t('toGame')}
                </Link>
              )}
              <button type="button" className="btn btn--ghost" onClick={() => onClose()} data-testid="exp-summary-close">
                {t('closeEnd')}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* 대사 상자 */}
      {state.phase !== 'summary' && (
        <div className="relative z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="exp-box mx-auto w-full max-w-4xl px-5 pb-4 pt-6 sm:px-8 sm:pb-5 sm:pt-7" data-testid="exp-box">
            {speakerName && (
              <span className="exp-tag" data-testid="exp-speaker">
                {tx(speakerName)}
              </span>
            )}
            <p className={`exp-text ${isNarration ? 'exp-text--narration' : ''}`} aria-hidden data-testid="exp-text" data-done={done}>
              <span>{chars.slice(0, n).join('')}</span>
              <span className="opacity-0">{chars.slice(n).join('')}</span>
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="hidden text-[12px] text-ink-3 md:block" data-testid="exp-keys">
                {t('keys')}
              </p>
              {state.phase === 'lines' ? (
                <button type="button" data-primary data-autofocus className="exp-next ml-auto" data-ready={done} data-testid="exp-next" onClick={advance}>
                  {t('next')}
                  <span aria-hidden className="exp-caret">
                    ▶
                  </span>
                </button>
              ) : (
                <p className="ml-auto text-[13px] font-bold text-accent-text">↑ {t('chooseHint')}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 스크린 리더 안내 */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveText}
      </div>
    </div>
  );
}

function findChoice(choiceId: string) {
  for (const b of Object.values(BEAT_MAP)) {
    if (b.next.type === 'choice' && b.next.choice.id === choiceId) return b.next.choice;
  }
  return null;
}
