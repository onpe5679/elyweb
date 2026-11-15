'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Icon from '../Icon';
import StoreIcon from '@/components/game/StoreIcon';
import s from './demo.module.css';
import { DEMO_LOGO_IMAGE, DEMO_TITLE_IMAGE, SFX, demoDataUrl } from './meta';
import type { DemoData, DemoStep } from './types';

type Mode = 'title' | 'choose' | 'play' | 'end';
type Props = { steamUrl?: string };

const TYPE_MS = 28;
const AUTO_BASE_MS = 1100;
const AUTO_PER_CHAR_MS = 38;
const SKIP_MS = 60;
const PRELOAD_AHEAD = 6;
const NAME_MAX = 10;

// 같은 페이지 안에서는 한 번만 받는다(언어별)
const dataCache = new Map<string, Promise<DemoData>>();
function loadData(locale: string) {
  const url = demoDataUrl(locale);
  let p = dataCache.get(url);
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<DemoData>;
    });
    p.catch(() => dataCache.delete(url));
    dataCache.set(url, p);
  }
  return p;
}

const preloaded = new Set<string>();
function preload(src?: string) {
  if (!src || preloaded.has(src) || typeof window === 'undefined') return;
  preloaded.add(src);
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduce;
}

/**
 * "어서오세요, 셰어하우스에!" 웹 데모. 페이지 본문(#demo) 안에서 바로 플레이한다(모달·새 창 없음).
 * 타이틀 → 장면 고르기(선택지) → 대사 진행 → 엔딩 카드. 데이터·이미지는 구역이 화면 가까이 오면 불러온다.
 */
export default function SharehouseDemo({ steamUrl }: Props) {
  const t = useTranslations('HabomDemo');
  const locale = useLocale();
  const reduceMotion = usePrefersReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const advanceRef = useRef<HTMLButtonElement>(null);
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const endCardRef = useRef<HTMLDivElement>(null);
  const logCloseRef = useRef<HTMLButtonElement>(null);
  const logButtonRef = useRef<HTMLButtonElement>(null);
  const logListRef = useRef<HTMLOListElement>(null);
  const focusNext = useRef(false);
  const byUserRef = useRef(true);

  const [data, setData] = useState<DemoData | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [mode, setMode] = useState<Mode>('title');
  const [chapterIdx, setChapterIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  // 타자 위치는 줄 키에 묶는다: 줄이 바뀐 첫 렌더에서 이전 줄의 위치가 새 줄에 새어 나오지 않게
  const [typedState, setTypedState] = useState({ key: '', n: 0 });
  const [run, setRun] = useState(0);
  const [auto, setAuto] = useState(false);
  const [skip, setSkip] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [name, setName] = useState('');
  const [pendingStart, setPendingStart] = useState(false);

  const fetchData = useCallback(() => {
    if (data) return;
    setLoadState('loading');
    loadData(locale)
      .then((d) => {
        setData(d);
        setLoadState('idle');
      })
      .catch(() => setLoadState('error'));
  }, [data, locale]);

  // 구역이 화면 가까이 오면 대본을 받고 타이틀 그림을 미리 불러온다
  useEffect(() => {
    const el = rootRef.current;
    if (!el || data) return;
    if (!('IntersectionObserver' in window)) {
      fetchData();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          fetchData();
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [data, fetchData]);

  const chapter = data?.chapters[chapterIdx];
  const steps = chapter?.steps ?? [];
  const step: DemoStep | undefined = steps[stepIdx];
  const full = step?.text ?? '';
  const lineKey = `${run}:${chapterIdx}:${stepIdx}`;
  const typed = typedState.key === lineKey ? typedState.n : reduceMotion || skip ? full.length : 0;
  const done = typed >= full.length;
  const setTyped = useCallback((n: number | ((c: number) => number)) => {
    setTypedState((prev) => {
      const cur = prev.key === lineKey ? prev.n : 0;
      return { key: lineKey, n: typeof n === 'function' ? n(cur) : n };
    });
  }, [lineKey]);
  const playerName = name.trim() || t('defaultName');

  const speakerOf = useCallback(
    (st?: DemoStep) => {
      if (!st?.who) return null;
      if (st.who === 'player') return { name: playerName, color: '#F49AB5' };
      return data?.speakers[st.who] ?? null;
    },
    [data, playerName],
  );

  const imagesOf = useCallback(
    (st?: DemoStep) => {
      if (!st || !data) return [] as string[];
      return [st.bg && data.images.bg[st.bg], st.stand && data.images.stand[st.stand], st.ecg && data.images.ecg[st.ecg]].filter(Boolean) as string[];
    },
    [data],
  );

  // 장면 고르기 화면에서는 두 장면의 첫 그림을, 진행 중에는 다음 몇 줄의 그림을 미리 받는다
  useEffect(() => {
    if (!data) return;
    if (mode === 'choose' || mode === 'title') {
      data.chapters.forEach((c) => imagesOf(c.steps[0]).forEach(preload));
      return;
    }
    if (mode === 'play') for (let i = stepIdx; i <= stepIdx + PRELOAD_AHEAD; i++) imagesOf(steps[i]).forEach(preload);
  }, [data, mode, stepIdx, steps, imagesOf]);

  // 시작을 눌렀는데 아직 데이터가 없으면 받자마자 장면 고르기로
  useEffect(() => {
    if (pendingStart && data) {
      setPendingStart(false);
      focusNext.current = true;
      setMode('choose');
    }
  }, [pendingStart, data]);

  // 타자 효과(움직임 줄이기 · 빨리 넘기기면 한 번에)
  useEffect(() => {
    if (mode !== 'play') return;
    if (reduceMotion || skip) {
      setTyped(full.length);
      return;
    }
    // 같은 줄에서 다시 돌 때(빨리 넘기기·자동 해제 등)는 이어서, 새 줄이면 처음부터
    setTypedState((p) => (p.key === lineKey ? p : { key: lineKey, n: 0 }));
    const id = window.setInterval(() => {
      setTyped((c) => {
        if (c >= full.length) {
          window.clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, TYPE_MS);
    return () => window.clearInterval(id);
  }, [full, mode, reduceMotion, skip, setTyped, lineKey]);

  // 화면 흔들기 · 효과음 — 줄이 바뀔 때 한 번만(빨리 넘기기·움직임 설정은 ref 로 읽음)
  const fxState = useRef({ reduceMotion, skip });
  fxState.current = { reduceMotion, skip };
  useEffect(() => {
    if (mode !== 'play' || !step) return;
    const { reduceMotion, skip } = fxState.current;
    if (step.fx === 'shake' && !reduceMotion && !skip) {
      screenRef.current?.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-1.2%)' }, { transform: 'translateX(1%)' }, { transform: 'translateX(-0.6%)' }, { transform: 'translateX(0)' }],
        { duration: 360, easing: 'ease-out' },
      );
    }
    const src = step.sfx && SFX[step.sfx];
    if (src && !skip) new Audio(src).play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, lineKey]);

  const goEnd = useCallback((byUser: boolean) => {
    setAuto(false);
    setSkip(false);
    setLogOpen(false);
    const active = document.activeElement;
    focusNext.current = byUser || !active || active === document.body || !!rootRef.current?.contains(active);
    setMode('end');
  }, []);

  const advance = useCallback(() => {
    if (!done) {
      setTyped(full.length);
      return;
    }
    if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1);
    else goEnd(byUserRef.current);
  }, [done, full.length, stepIdx, steps.length, goEnd, setTyped]);

  // 자동 진행 · 빨리 넘기기
  useEffect(() => {
    if (mode !== 'play' || logOpen) return;
    if (skip) {
      const id = window.setTimeout(() => (stepIdx < steps.length - 1 ? setStepIdx(stepIdx + 1) : goEnd(false)), SKIP_MS);
      return () => window.clearTimeout(id);
    }
    if (auto && done) {
      const id = window.setTimeout(() => {
        byUserRef.current = false;
        advance();
        byUserRef.current = true;
      }, AUTO_BASE_MS + full.length * AUTO_PER_CHAR_MS);
      return () => window.clearTimeout(id);
    }
  }, [mode, logOpen, skip, auto, done, stepIdx, steps.length, advance, goEnd, full.length]);

  // 화면이 바뀌면 다음 할 일에 포커스(사용자가 누른 경우에만, 스크롤은 건드리지 않음)
  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    const opt = { preventScroll: true };
    if (mode === 'choose') firstChoiceRef.current?.focus(opt);
    else if (mode === 'play') advanceRef.current?.focus(opt);
    else if (mode === 'end') endCardRef.current?.focus(opt);
  }, [mode]);

  // 기록이 열려 있는 동안 Escape 로 닫기(포커스가 무대 밖에 있어도)
  useEffect(() => {
    if (!logOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setLogOpen(false);
        logButtonRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [logOpen]);

  useEffect(() => {
    if (logOpen) {
      logCloseRef.current?.focus({ preventScroll: true });
      const list = logListRef.current;
      if (list) list.scrollTop = list.scrollHeight;
    }
  }, [logOpen]);

  const start = () => {
    if (data) {
      focusNext.current = true;
      setMode('choose');
    } else {
      setPendingStart(true);
      fetchData();
    }
  };

  const choose = (idx: number) => {
    setChapterIdx(idx);
    setStepIdx(0);
    setRun((r) => r + 1);
    setAuto(false);
    setSkip(false);
    setLogOpen(false);
    focusNext.current = true;
    setMode('play');
  };

  const restart = () => choose(chapterIdx);
  const backToChoose = () => {
    setAuto(false);
    setSkip(false);
    setLogOpen(false);
    focusNext.current = true;
    setMode('choose');
  };
  const closeLog = () => {
    setLogOpen(false);
    logButtonRef.current?.focus({ preventScroll: true });
  };

  const onAdvanceClick = () => {
    if (skip) {
      setSkip(false);
      return;
    }
    advance();
  };

  const chapterLabel = (id?: string) => (id === 'saeun' ? t('chapterSaeun') : t('chapterJihye'));
  const chapterDesc = (id?: string) => (id === 'saeun' ? t('chapterSaeunDesc') : t('chapterJihyeDesc'));

  const speaker = speakerOf(step);
  const standChar = step?.stand?.split('/')[0];
  const bgSrc = (mode === 'play' || mode === 'end') && step?.bg ? data?.images.bg[step.bg] : undefined;
  // 배경이 바뀌면 새 그림이 페이드인하는 동안 이전 그림을 아래에 깔아 둔다(검은 번쩍임 방지)
  const [underBg, setUnderBg] = useState<string | undefined>(undefined);
  useEffect(() => {
    const id = window.setTimeout(() => setUnderBg(bgSrc), 480);
    return () => window.clearTimeout(id);
  }, [bgSrc]);
  const standSrc = step?.stand && data?.images.stand[step.stand];
  const ecgSrc = step?.ecg && data?.images.ecg[step.ecg];
  const progress = steps.length ? Math.round(((stepIdx + 1) / steps.length) * 100) : 0;
  const announce = mode === 'play' && step && !skip ? `${speaker ? speaker.name : t('narration')}: ${full}` : '';
  const logItems = useMemo(() => (logOpen ? steps.slice(0, stepIdx + 1) : []), [logOpen, steps, stepIdx]);
  const otherIdx = data && data.chapters.length > 1 ? (chapterIdx + 1) % data.chapters.length : -1;

  return (
    <div ref={rootRef}>
      <div
        className={s.frame}
        role="region"
        aria-label={t('stage')}
        data-testid="demo-stage"
        data-mode={mode}
      >
        <div ref={screenRef} className={s.screen}>
          {mode === 'title' || mode === 'choose' ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DEMO_TITLE_IMAGE} alt="" loading="lazy" decoding="async" className={s.layer} />
              {mode === 'title' && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={DEMO_LOGO_IMAGE} alt="" loading="lazy" decoding="async" className={s.logo} />
              )}
              {mode === 'choose' && <div className={s.dim} />}
            </>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {underBg && underBg !== bgSrc && <img key={`under-${underBg}`} src={underBg} alt="" className={s.layer} />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {bgSrc && <img key={bgSrc} src={bgSrc} alt="" className={`${s.layer} ${s.fade}`} />}
              {standSrc && standChar && (
                // key 를 캐릭터로: 표정만 바뀌면 그림만 갈아 끼우고, 캐릭터가 바뀌면 새로 페이드인
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={standChar}
                  src={standSrc}
                  alt=""
                  className={`${s.stand} ${s.fade} ${step?.who && step.who !== standChar ? s.standIdle : ''}`}
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {ecgSrc && <img key={ecgSrc} src={ecgSrc} alt="" className={`${s.layer} ${s.fade}`} />}
              {mode === 'play' && <div className={s.gradient} />}
              {mode === 'end' && <div className={s.dim} />}
            </>
          )}
        </div>

        {mode === 'title' && (
          <div className={s.titleBar}>
            <label className={s.field}>
              {t('nameLabel')}
              <input
                className={s.input}
                value={name}
                maxLength={NAME_MAX}
                placeholder={t('defaultName')}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  // IME 조합 확정 Enter 는 무시, 같은 Enter 가 다음 화면 버튼을 누르지 않게 기본 동작 막음
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    start();
                  }
                }}
                data-testid="demo-name"
                autoComplete="off"
              />
            </label>
            <button type="button" className={s.primary} onClick={start} data-testid="demo-start" aria-busy={pendingStart}>
              <Icon name="play" size={14} /> {pendingStart ? t('loading') : t('start')}
            </button>
          </div>
        )}

        {mode === 'choose' && data && (
          <div className={`${s.overlay} ${s.below}`} role="group" aria-labelledby="demo-choose-prompt">
            <p id="demo-choose-prompt" className={s.prompt}>
              {t('choosePrompt')}
            </p>
            {data.chapters.map((c, i) => (
              <button key={c.id} ref={i === 0 ? firstChoiceRef : undefined} type="button" className={s.choice} onClick={() => choose(i)} data-testid="demo-choice">
                <span className={s.choiceTitle}>{chapterLabel(c.id)}</span>
                <span className={s.choiceDesc}>{chapterDesc(c.id)}</span>
              </button>
            ))}
          </div>
        )}

        {mode === 'play' && step && (
          <>
            <div className={s.panel} aria-hidden="true" data-testid="demo-text">
              <span className={s.name} style={speaker ? { color: speaker.color } : undefined}>
                {speaker?.name ?? ''}
              </span>
              <span className={`${s.text} ${speaker ? '' : s.narration}`}>
                {full.slice(0, typed)}
                {done && <span className={s.caret}>▼</span>}
              </span>
            </div>
            <button
              ref={advanceRef}
              type="button"
              className={s.advance}
              onClick={onAdvanceClick}
              aria-label={t('next')}
              data-testid="demo-line"
              tabIndex={logOpen ? -1 : undefined}
              aria-hidden={logOpen || undefined}
            />
          </>
        )}

        {mode === 'end' && (
          <div className={`${s.overlay} ${s.below}`} data-testid="demo-end">
            <div ref={endCardRef} className={s.endCard} role="group" aria-labelledby="demo-end-title" tabIndex={-1}>
              <p id="demo-end-title" className={s.endTitle}>
                {t('endTitle')}
              </p>
              <p className={s.endBody}>{t('endBody')}</p>
              <div className={s.row}>
                {steamUrl ? (
                  <a href={steamUrl} target="_blank" rel="noopener noreferrer" className={s.primary}>
                    <StoreIcon kind="steam" size={18} /> {t('steam')} <Icon name="arrowUpRight" size={14} />
                  </a>
                ) : null}
                {otherIdx >= 0 && (
                  <button type="button" className={s.ghost} onClick={() => choose(otherIdx)}>
                    {t('other')}
                  </button>
                )}
                <button type="button" className={s.ghost} onClick={restart}>
                  <Icon name="restart" size={16} /> {t('again')}
                </button>
              </div>
            </div>
          </div>
        )}

        {logOpen && (
          <div className={s.log} role="region" aria-label={t('log')} data-testid="demo-log">
            <div className={s.logHead}>
              <span>{t('log')}</span>
              <button ref={logCloseRef} type="button" className={s.ghost} onClick={closeLog}>
                <Icon name="close" size={16} /> {t('logClose')}
              </button>
            </div>
            <ol ref={logListRef} className={s.logList}>
              {logItems.map((st, i) => {
                const sp = speakerOf(st);
                return (
                  <li key={i} className={s.logItem}>
                    {sp && <b style={{ color: sp.color }}>{sp.name}</b>}
                    {st.text}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {loadState === 'error' && (mode === 'title' || pendingStart) && (
          <div className={s.status} role="alert">
            {t('loadError')}
            <button
              type="button"
              className={s.primary}
              onClick={() => {
                setPendingStart(true);
                fetchData();
              }}
            >
              {t('retry')}
            </button>
          </div>
        )}

        <p aria-live="polite" className={s.srOnly} data-testid="demo-live">
          {announce}
        </p>
      </div>

      {/* 진행률 · 컨트롤(하봄 스타일) */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex min-w-[10rem] flex-1 items-center gap-3">
          <span className="shrink-0 text-[0.8125rem] font-semibold text-plum-soft">
            {mode === 'play' || mode === 'end' ? chapterLabel(chapter?.id) : t('progress')}
          </span>
          <div
            className={`${s.bar} flex-1`}
            role="progressbar"
            aria-label={t('progress')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={mode === 'end' ? 100 : mode === 'play' ? progress : 0}
            data-testid="demo-progress"
          >
            <div className={s.barFill} style={{ width: `${mode === 'end' ? 100 : mode === 'play' ? progress : 0}%` }} />
          </div>
          <span className="shrink-0 font-round-latin text-[0.8125rem] font-bold tabular-nums text-plum-soft">
            {mode === 'play' ? `${stepIdx + 1} / ${steps.length}` : mode === 'end' ? `${steps.length} / ${steps.length}` : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={s.ctl} aria-pressed={auto} disabled={mode !== 'play' || logOpen} onClick={() => { setSkip(false); setAuto((v) => !v); }}>
            {t('auto')}
          </button>
          <button type="button" className={s.ctl} aria-pressed={skip} disabled={mode !== 'play' || logOpen} onClick={() => { setAuto(false); setSkip((v) => !v); }} data-testid="demo-skip">
            {t('skip')}
          </button>
          <button
            ref={logButtonRef}
            type="button"
            className={s.ctl}
            aria-pressed={logOpen}
            disabled={mode !== 'play'}
            onClick={() => (logOpen ? closeLog() : (setSkip(false), setAuto(false), setLogOpen(true)))}
            data-testid="demo-log-button"
          >
            {t('log')}
          </button>
          <button type="button" className={s.ctl} disabled={(mode !== 'play' && mode !== 'end') || logOpen} onClick={restart} data-testid="demo-restart">
            <Icon name="restart" size={14} /> {t('restart')}
          </button>
          <button type="button" className={s.ctl} disabled={mode === 'title' || mode === 'choose' || logOpen} onClick={backToChoose}>
            {t('chooseAgain')}
          </button>
        </div>
      </div>
      <p className="mt-3 text-[0.8125rem] text-plum-soft">{t('keyHint')}</p>
    </div>
  );
}
