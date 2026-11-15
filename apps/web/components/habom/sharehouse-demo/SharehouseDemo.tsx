'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Icon from '../Icon';
import StoreIcon from '@/components/game/StoreIcon';
import s from './demo.module.css';
import { DEMO_LOGO_IMAGE, DEMO_TITLE_IMAGE, demoDataUrl } from './meta';
import { DemoAudio } from './audio';
import { loadSaves, loadSettings, saveSettings, writeSaves, type SaveRecord, type Saves, type Settings } from './storage';
import type { ChapterId, DemoData, DemoStep } from './types';

type Mode = 'title' | 'name' | 'play' | 'choice' | 'end';
type Overlay = null | 'menu' | 'save' | 'load' | 'settings' | 'log';
type Props = { steamUrl?: string };

const TYPE_MS = 30;
const AUTO_BASE_MS = 1100;
const AUTO_PER_CHAR_MS = 38;
const SKIP_MS = 35;
const PRELOAD_AHEAD = 6;
const NAME_MAX = 10;
const PLAYER_TAG = '#191919';
/** 프롤로그가 끝나면 고르는 장면(게임의 히로인별 시나리오) */
const EPISODES: ChapterId[] = ['jihye', 'saeun'];

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
 * 화면 구성·연출은 실제 게임 플레이 영상을 따른다: 타이틀 → 이름 → 프롤로그 → 장면 선택 → 대사 → 엔딩.
 * 대본 JSON 은 구역이 화면 가까이 오면, 소리는 "새 게임/이어하기" 를 누른 뒤 필요할 때만 받는다.
 */
export default function SharehouseDemo({ steamUrl }: Props) {
  const t = useTranslations('HabomDemo');
  const locale = useLocale();
  const reduceMotion = usePrefersReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const advanceRef = useRef<HTMLButtonElement>(null);
  const focusNext = useRef(false);
  const byUserRef = useRef(true);
  const audioRef = useRef<DemoAudio | null>(null);

  const [data, setData] = useState<DemoData | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [mode, setMode] = useState<Mode>('title');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [overlayFrom, setOverlayFrom] = useState<Mode>('play');
  const [uiHidden, setUiHidden] = useState(false);
  const [chapterId, setChapterId] = useState<ChapterId>('prologue');
  const [stepIdx, setStepIdx] = useState(0);
  const [run, setRun] = useState(0);
  const [typedState, setTypedState] = useState({ key: '', n: 0 });
  const [voiceDone, setVoiceDone] = useState('');
  const [auto, setAuto] = useState(false);
  const [skip, setSkip] = useState(false);
  const [name, setName] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saves, setSaves] = useState<Saves | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [toast, setToast] = useState('');
  const [pending, setPending] = useState<null | (() => void)>(null);
  const [suspended, setSuspended] = useState(false);

  // 저장된 설정·슬롯은 브라우저에서만 읽는다
  useEffect(() => {
    const st = loadSettings();
    setSettings(st);
    setSaves(loadSaves());
    audioRef.current = new DemoAudio(st);
    return () => audioRef.current?.destroy();
  }, []);

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

  // 구역이 화면 가까이 오면 대본을 받는다
  useEffect(() => {
    const el = rootRef.current;
    if (!el || data) return;
    if (!('IntersectionObserver' in window)) return fetchData();
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect();
          fetchData();
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [data, fetchData]);

  // 데이터가 없을 때 누른 동작은 받자마자 실행
  useEffect(() => {
    if (pending && data) {
      const fn = pending;
      setPending(null);
      fn();
    }
  }, [pending, data]);

  const chapter = data?.chapters.find((c) => c.id === chapterId);
  const steps = useMemo(() => chapter?.steps ?? [], [chapter]);
  const step: DemoStep | undefined = steps[stepIdx];
  const playerName = name.trim() || t('defaultName');
  const fill = useCallback((text: string) => text.replace(/<PlayerName>/g, () => playerName), [playerName]);
  const full = step ? fill(step.text) : '';
  const lineKey = `${run}:${chapterId}:${stepIdx}`;
  const typed = typedState.key === lineKey ? typedState.n : reduceMotion || skip ? full.length : 0;
  const done = typed >= full.length;
  const setTyped = useCallback(
    (n: number | ((c: number) => number)) =>
      setTypedState((prev) => {
        const cur = prev.key === lineKey ? prev.n : 0;
        return { key: lineKey, n: typeof n === 'function' ? n(cur) : n };
      }),
    [lineKey],
  );

  const speakerOf = useCallback(
    (st?: DemoStep) => {
      if (!st?.who) return null;
      if (st.who === 'player') return { name: playerName, color: PLAYER_TAG };
      return data?.speakers[st.who] ?? null;
    },
    [data, playerName],
  );

  const imagesOf = useCallback(
    (st?: DemoStep) => {
      if (!st || !data) return [] as string[];
      const list = [data.images.bg[st.bg], st.ecg && data.images.ecg[st.ecg], ...(st.chars ?? []).map((c) => data.images.stand[`${c.id}/${c.face}`])];
      return list.filter(Boolean) as string[];
    },
    [data],
  );

  // 다음 몇 줄의 그림을 미리 받는다(이름·장면 고르기 화면에서는 각 장의 첫 줄)
  useEffect(() => {
    if (!data) return;
    if (mode === 'choice' || mode === 'name') {
      data.chapters.forEach((c) => imagesOf(c.steps[0]).forEach(preload));
      return;
    }
    if (mode === 'play') for (let i = stepIdx; i <= stepIdx + PRELOAD_AHEAD; i++) imagesOf(steps[i]).forEach(preload);
  }, [data, mode, stepIdx, steps, imagesOf]);

  // ── 소리 ───────────────────────────────
  useEffect(() => {
    if (settings) audioRef.current?.setSettings(settings);
  }, [settings]);

  const wantedBgm = !data || !unlocked ? null : mode === 'play' ? step?.bgm ?? null : data.audio.titleBgm;
  useEffect(() => {
    audioRef.current?.bgm(wantedBgm && data ? data.audio.bgm[wantedBgm] ?? null : null);
  }, [wantedBgm, data, unlocked]);

  // 화면 밖이거나 탭이 숨겨지면 멈춤
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    let visible = true;
    const update = () => {
      const off = !visible || document.visibilityState === 'hidden';
      audioRef.current?.suspend(off);
      setSuspended(off);
    };
    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (es) => {
              visible = es[es.length - 1].intersectionRatio >= 0.25;
              update();
            },
            { threshold: [0, 0.25, 0.5] },
          )
        : null;
    io?.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => {
      io?.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  const touch = useCallback(() => audioRef.current?.sfx(data?.audio.sfx.touch ?? null), [data]);

  // 줄이 바뀔 때: 음성·효과음·흔들기(빨리 넘기기 중에는 생략)
  const fxState = useRef({ reduceMotion, skip });
  fxState.current = { reduceMotion, skip };
  useEffect(() => {
    if (mode !== 'play' || !step || !data) return;
    const { reduceMotion, skip } = fxState.current;
    const audio = audioRef.current;
    if (skip) {
      audio?.stopVoice();
      setVoiceDone(lineKey);
      return;
    }
    if (step.fx === 'shake' && !reduceMotion) {
      screenRef.current?.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-1.2%)' }, { transform: 'translateX(1%)' }, { transform: 'translateX(-0.6%)' }, { transform: 'translateX(0)' }],
        { duration: 360, easing: 'ease-out' },
      );
    }
    if (step.sfx) audio?.sfx(data.audio.sfx[step.sfx] ?? null);
    const v = step.voice ? data.audio.voice[step.voice] : undefined;
    if (!v || !audio) {
      audio?.stopVoice();
      setVoiceDone(lineKey);
      return;
    }
    setVoiceDone('');
    let alive = true;
    audio.voice(v).then(() => {
      if (alive) setVoiceDone(lineKey);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, lineKey, data]);

  // ── 타자 효과 ──────────────────────────
  useEffect(() => {
    if (mode !== 'play') return;
    if (reduceMotion || skip) {
      setTyped(full.length);
      return;
    }
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

  // ── 흐름 ───────────────────────────────
  /** 화면이 바뀐 뒤 포커스를 옮길지: 사용자가 조작했거나 포커스가 이미 무대 안(또는 아무 데도 없음)일 때만 */
  const markFocus = () => {
    const a = document.activeElement;
    focusNext.current = byUserRef.current || !a || a === document.body || !!rootRef.current?.contains(a);
  };

  const startChapter = useCallback((id: ChapterId, at = 0) => {
    setChapterId(id);
    setStepIdx(at);
    setRun((r) => r + 1);
    setAuto(false);
    setSkip(false);
    setOverlay(null);
    setUiHidden(false);
    markFocus();
    setMode('play');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishChapter = useCallback(() => {
    setAuto(false);
    setSkip(false);
    setOverlay(null);
    audioRef.current?.stopVoice();
    markFocus();
    setMode(chapterId === 'prologue' ? 'choice' : 'end');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  const advance = useCallback(() => {
    if (!done) {
      setTyped(full.length);
      return;
    }
    if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1);
    else finishChapter();
  }, [done, full.length, stepIdx, steps.length, finishChapter, setTyped]);

  // 자동 진행(음성이 끝날 때까지 기다림) · 빨리 넘기기
  useEffect(() => {
    // 무대가 화면 밖이거나 탭이 숨겨지면 자동·스킵도 멈춘다
    if (mode !== 'play' || overlay || suspended) return;
    if (skip) {
      const id = window.setTimeout(() => {
        byUserRef.current = false;
        if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1);
        else finishChapter();
        byUserRef.current = true;
      }, SKIP_MS);
      return () => window.clearTimeout(id);
    }
    if (auto && done && voiceDone === lineKey) {
      const hasVoice = !!(step?.voice && data?.audio.voice[step.voice]);
      const id = window.setTimeout(
        () => {
          byUserRef.current = false;
          advance();
          byUserRef.current = true;
        },
        hasVoice ? 500 : AUTO_BASE_MS + full.length * AUTO_PER_CHAR_MS,
      );
      return () => window.clearTimeout(id);
    }
  }, [mode, overlay, suspended, skip, auto, done, voiceDone, lineKey, stepIdx, steps.length, advance, finishChapter, full.length, step, data]);

  // 화면이 바뀌면 다음 할 일에 포커스(스크롤은 건드리지 않음)
  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    const opt = { preventScroll: true };
    const target = frameRef.current?.querySelector<HTMLElement>('[data-autofocus]:not(:disabled)');
    (target ?? (mode === 'play' && !overlay ? advanceRef.current : null))?.focus(opt);
  }, [mode, overlay]);

  // 저장된 줄 번호가 지금 대본보다 길면(대본이 바뀐 뒤의 저장 등) 마지막 줄로 보정
  useEffect(() => {
    if (mode === 'play' && steps.length && stepIdx >= steps.length) setStepIdx(steps.length - 1);
  }, [mode, steps.length, stepIdx]);

  // 자동 저장(줄마다 localStorage 에만 쓰고, 슬롯 화면은 열 때 다시 읽는다)
  useEffect(() => {
    if (mode !== 'play' || !saves || stepIdx >= steps.length) return;
    writeSaves({ ...loadSaves(), auto: { chapter: chapterId, step: stepIdx, name, at: Date.now() } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, chapterId, stepIdx]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(''), 1600);
    return () => window.clearTimeout(id);
  }, [toast]);

  // ── 조작 ───────────────────────────────
  const unlock = () => {
    audioRef.current?.unlock();
    setUnlocked(true);
  };
  const whenReady = (fn: () => void) => {
    if (data) fn();
    else {
      setPending(() => fn);
      fetchData();
    }
  };

  const newGame = () => {
    unlock();
    touch();
    whenReady(() => {
      setNameDraft(name);
      markFocus();
      setMode('name');
    });
  };
  const confirmName = () => {
    touch();
    setName(nameDraft.trim().slice(0, NAME_MAX));
    startChapter('prologue');
  };
  const latestSave = saves ? ([saves.auto, ...saves.slots].filter(Boolean) as SaveRecord[]).sort((a, b) => b.at - a.at)[0] ?? null : null;
  const loadRecord = (rec: SaveRecord) => {
    unlock();
    touch();
    whenReady(() => {
      setName(String(rec.name).slice(0, NAME_MAX));
      startChapter(rec.chapter, rec.step);
      setToast(t('loaded'));
    });
  };
  const saveTo = (i: number) => {
    touch();
    const cur = loadSaves();
    const slots = cur.slots.slice();
    slots[i] = { chapter: chapterId, step: stepIdx, name, at: Date.now() };
    const next = { ...cur, slots };
    setSaves(next);
    setToast(writeSaves(next) ? t('saved') : t('saveFailed'));
  };
  const openOverlay = (o: Overlay) => {
    touch();
    setAuto(false);
    setSkip(false);
    if (!overlay) setOverlayFrom(mode);
    if (o === 'save' || o === 'load') setSaves(loadSaves());
    markFocus();
    setOverlay(o);
  };
  const closeOverlay = () => {
    const sub = overlay === 'save' || overlay === 'load' || overlay === 'settings';
    setOverlay(sub && overlayFrom === 'play' ? 'menu' : null);
    markFocus();
  };
  const toTitle = () => {
    touch();
    setOverlay(null);
    setAuto(false);
    setSkip(false);
    audioRef.current?.stopVoice();
    setSaves(loadSaves());
    markFocus();
    setMode('title');
  };
  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...(prev ?? loadSettings()), ...patch };
      saveSettings(next);
      return next;
    });
  };
  const onAdvanceClick = () => {
    if (uiHidden) return setUiHidden(false);
    if (skip) return setSkip(false);
    advance();
  };

  // Ctrl 은 누르고 있는 동안만 스킵(게임과 같음). 다른 키와 함께 누르면(Ctrl+F 등) 스킵하지 않는다
  const ctrlHeld = useRef(false);
  const stopCtrlSkip = useCallback(() => {
    if (ctrlHeld.current) {
      ctrlHeld.current = false;
      setSkip(false);
    }
  }, []);
  useEffect(() => {
    window.addEventListener('blur', stopCtrlSkip);
    return () => window.removeEventListener('blur', stopCtrlSkip);
  }, [stopCtrlSkip]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      if (e.key === 'Escape' && overlay) closeOverlay();
      return;
    }
    // Enter/Space 를 누르고 있을 때 화면이 바뀌어 다음 버튼(선택지 등)까지 눌리지 않게
    if (e.repeat && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Escape') {
      if (overlay) {
        e.preventDefault();
        closeOverlay();
      } else if (mode === 'play') {
        e.preventDefault();
        openOverlay('menu');
      }
      return;
    }
    if (mode !== 'play' || overlay || e.repeat || e.altKey || e.metaKey) return;
    if (e.key === 'Control') {
      ctrlHeld.current = true;
      setAuto(false);
      setSkip(true);
      return;
    }
    if (e.ctrlKey) return stopCtrlSkip();
    // e.code: 한글 입력 상태(ㅁ/ㅣ/ㅗ)에서도 같은 키로 동작
    if (e.code === 'KeyA') {
      setSkip(false);
      setAuto((v) => !v);
    } else if (e.code === 'KeyL') openOverlay('log');
    else if (e.code === 'KeyH') setUiHidden((v) => !v);
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Control') stopCtrlSkip();
  };

  // ── 화면 ───────────────────────────────
  const chapterLabel = (id: ChapterId) => (id === 'saeun' ? t('chapterSaeun') : id === 'jihye' ? t('chapterJihye') : t('chapterPrologue'));
  const chapterDesc = (id: ChapterId) => (id === 'saeun' ? t('chapterSaeunDesc') : t('chapterJihyeDesc'));
  const prologue = data?.chapters.find((c) => c.id === 'prologue');
  const lastPrologue = prologue?.steps[prologue.steps.length - 1];
  const sceneStep = mode === 'play' || mode === 'end' ? step : mode === 'choice' ? lastPrologue : undefined;
  const bgSrc = sceneStep && data ? data.images.bg[sceneStep.bg] : undefined;
  const ecgSrc = sceneStep?.ecg && data ? data.images.ecg[sceneStep.ecg] : undefined;
  const chars = mode === 'play' || mode === 'end' ? sceneStep?.chars ?? [] : [];
  // 누가 말하는지: 지문이면 모두 밝게, ??? 는 혼자 서 있으면 그 캐릭터
  const who = mode === 'play' ? step?.who : undefined;
  const speaking = !who ? 'all' : who === 'unknown' ? (chars.length === 1 ? chars[0].id : 'all') : who;

  // 배경이 바뀌면 새 그림이 페이드인하는 동안 이전 그림을 아래에 깔아 둔다
  const [underBg, setUnderBg] = useState<string | undefined>(undefined);
  useEffect(() => {
    const id = window.setTimeout(() => setUnderBg(bgSrc), 480);
    return () => window.clearTimeout(id);
  }, [bgSrc]);

  const speaker = speakerOf(step);
  const progress = steps.length ? Math.round(((stepIdx + 1) / steps.length) * 100) : 0;
  const announce = mode === 'play' && step && !skip ? `${speaker ? speaker.name : t('narration')}: ${full}` : '';
  const logItems = useMemo(() => (overlay === 'log' ? steps.slice(0, stepIdx + 1) : []), [overlay, steps, stepIdx]);
  const otherEpisode = EPISODES.find((c) => c !== chapterId) ?? 'jihye';
  const fmtDate = (at: number) => new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(at);
  const slotInfo = (rec: SaveRecord | null) => {
    if (!rec || !data) return null;
    const st = data.chapters.find((c) => c.id === rec.chapter)?.steps[rec.step];
    return { title: `${chapterLabel(rec.chapter)} · ${rec.step + 1}`, line: st ? st.text.replace(/<PlayerName>/g, () => rec.name || t('defaultName')) : '', when: fmtDate(rec.at) };
  };
  const volPct = (v: number) => Math.round(v * 100);

  return (
    <div ref={rootRef}>
      <div ref={frameRef} className={s.frame} role="region" aria-label={t('stage')} data-testid="demo-stage" data-mode={mode} data-bgm={wantedBgm ?? ''} data-sound={!unlocked ? 'off' : suspended ? 'paused' : 'on'} onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
        <div ref={screenRef} className={s.screen}>
          {mode === 'title' || mode === 'name' ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DEMO_TITLE_IMAGE} alt="" loading="lazy" decoding="async" className={s.layer} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DEMO_LOGO_IMAGE} alt="" loading="lazy" decoding="async" className={s.logo} />
              {mode === 'name' && <div className={s.dim} />}
            </>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {underBg && underBg !== bgSrc && <img key={`under-${underBg}`} src={underBg} alt="" className={s.layer} />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {bgSrc && <img key={bgSrc} src={bgSrc} alt="" className={`${s.layer} ${s.fade}`} />}
              {data &&
                chars.map((c) => {
                  const cast = data.cast[c.id];
                  return (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={c.id}
                      src={data.images.stand[`${c.id}/${c.face}`]}
                      alt=""
                      data-char={c.id}
                      className={`${s.char} ${s.fade} ${speaking !== 'all' && speaking !== c.id ? s.charIdle : ''}`}
                      style={{ height: `${cast.scale * cast.crop * 100}%`, top: `${cast.top * 100}%`, left: `${c.x * 100}%` }}
                    />
                  );
                })}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {ecgSrc && <img key={ecgSrc} src={ecgSrc} alt="" className={`${s.layer} ${s.fade}`} />}
              {mode === 'play' && !uiHidden && <div className={s.vignette} />}
              {(mode === 'choice' || mode === 'end') && <div className={s.dim} />}
            </>
          )}
        </div>

        {/* 타이틀 메뉴 */}
        {mode === 'title' && !overlay && (
          <div className={`${s.titleMenu} ${s.below}`}>
            <button type="button" className={`${s.btn} ${s.btnStrong}`} onClick={newGame} data-testid="demo-new" aria-busy={!!pending} data-autofocus>
              <Icon name="play" size={14} /> {pending && !data ? t('loading') : t('menuNew')}
            </button>
            <button type="button" className={s.btn} onClick={() => latestSave && loadRecord(latestSave)} disabled={!latestSave} data-testid="demo-continue">
              {t('menuContinue')}
            </button>
            <button
              type="button"
              className={s.btn}
              onClick={() => {
                unlock();
                whenReady(() => openOverlay('load'));
              }}
              data-testid="demo-title-load"
            >
              {t('load')}
            </button>
            <button type="button" className={s.btn} onClick={() => openOverlay('settings')} data-testid="demo-title-settings">
              {t('menuSettings')}
            </button>
          </div>
        )}

        {/* 이름 입력 */}
        {mode === 'name' && (
          <div className={`${s.center} ${s.below}`}>
            <form
              className={s.panel}
              onSubmit={(e) => {
                e.preventDefault();
                confirmName();
              }}
            >
              <label className={s.panelTitle} htmlFor="demo-name-input">
                {t('namePrompt')}
              </label>
              <input
                id="demo-name-input"
                className={s.input}
                value={nameDraft}
                maxLength={NAME_MAX}
                placeholder={t('defaultName')}
                onChange={(e) => setNameDraft(e.target.value)}
                data-testid="demo-name"
                data-autofocus
                autoComplete="off"
              />
              <p className={s.panelBody}>{t('nameHelp')}</p>
              <div className={s.row}>
                <button type="submit" className={`${s.btn} ${s.btnStrong}`} data-testid="demo-name-ok">
                  {t('nameOk')}
                </button>
                <button type="button" className={s.btn} onClick={toTitle}>
                  {t('back')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 대사창 · 빠른 메뉴 */}
        {mode === 'play' && step && (
          <>
            {!uiHidden && (
              <div className={`${s.box} ${s.below}`} aria-hidden="true" data-testid="demo-text">
                {speaker && (
                  <span className={s.tag} style={{ background: speaker.color }}>
                    {speaker.name}
                  </span>
                )}
                <span className={`${s.text} ${full.length > 170 ? s.textLong2 : full.length > 110 ? s.textLong : ''}`}>
                  {full.slice(0, typed)}
                  {done && <span className={s.caret}>▼</span>}
                </span>
              </div>
            )}
            <button
              ref={advanceRef}
              type="button"
              className={s.advance}
              onClick={onAdvanceClick}
              aria-label={uiHidden ? t('showUi') : t('next')}
              data-testid="demo-line"
              tabIndex={overlay ? -1 : undefined}
              aria-hidden={overlay ? true : undefined}
            />
            {!uiHidden && (
              <div className={`${s.keys} ${s.below}`} role="toolbar" aria-label={t('quickMenu')}>
                <KeyButton cap="ESC" label={t('keyMenu')} onClick={() => openOverlay('menu')} testId="demo-menu" disabled={!!overlay} />
                <KeyButton
                  cap="A"
                  label={t('keyAuto')}
                  pressed={auto}
                  onClick={() => {
                    setSkip(false);
                    setAuto((v) => !v);
                  }}
                  testId="demo-auto"
                  disabled={!!overlay}
                />
                <KeyButton
                  cap="CTRL"
                  label={t('keySkip')}
                  pressed={skip}
                  onClick={() => {
                    setAuto(false);
                    setSkip((v) => !v);
                  }}
                  testId="demo-skip"
                  disabled={!!overlay}
                />
                <KeyButton cap="L" label={t('keyLog')} onClick={() => openOverlay('log')} testId="demo-log-button" disabled={!!overlay} />
                <KeyButton cap="H" label={t('keyHide')} onClick={() => setUiHidden(true)} testId="demo-hide" disabled={!!overlay} />
                <KeyButton cap="SPACE" label={t('keyNext')} onClick={onAdvanceClick} testId="demo-next" disabled={!!overlay} />
              </div>
            )}
          </>
        )}

        {/* 장면 선택 */}
        {mode === 'choice' && data && (
          <div className={`${s.choices} ${s.below}`} role="group" aria-labelledby="demo-choose-prompt">
            <p id="demo-choose-prompt" className={s.choicePrompt}>
              {t('choosePrompt')}
            </p>
            {EPISODES.map((id, i) => (
              <button
                key={id}
                type="button"
                className={s.choice}
                onClick={() => {
                  touch();
                  startChapter(id);
                }}
                data-testid="demo-choice"
                data-autofocus={i === 0 ? true : undefined}
              >
                <span className={s.choiceTitle}>{chapterLabel(id)}</span>
                <span className={s.choiceDesc}>{chapterDesc(id)}</span>
              </button>
            ))}
          </div>
        )}
        {mode === 'choice' && (
          <div className={`${s.box} ${s.choiceBox}`} aria-hidden="true">
            <span className={s.text}>{t('choosePrompt')}</span>
          </div>
        )}

        {/* 엔딩 */}
        {mode === 'end' && (
          <div className={`${s.center} ${s.below}`} data-testid="demo-end">
            <div className={s.panel} role="group" aria-labelledby="demo-end-title" tabIndex={-1} data-autofocus>
              <p id="demo-end-title" className={s.panelTitle}>
                {t('endTitle')}
              </p>
              <p className={s.panelBody}>{t('endBody')}</p>
              <div className={s.row}>
                {steamUrl && (
                  <a href={steamUrl} target="_blank" rel="noopener noreferrer" className={`${s.btn} ${s.btnStrong}`}>
                    <StoreIcon kind="steam" size={18} /> {t('steam')} <Icon name="arrowUpRight" size={14} />
                  </a>
                )}
                <button
                  type="button"
                  className={s.btn}
                  onClick={() => {
                    touch();
                    startChapter(otherEpisode);
                  }}
                >
                  {t('other')}
                </button>
                <button type="button" className={s.btn} onClick={toTitle}>
                  {t('toTitle')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 메뉴(ESC) */}
        {overlay === 'menu' && (
          <div className={s.center} data-testid="demo-menu-panel">
            <div className={s.panel} role="group" aria-labelledby="demo-menu-title">
              <p id="demo-menu-title" className={s.panelTitle}>
                {t('menuTitle')}
              </p>
              <button type="button" className={s.btn} onClick={() => openOverlay('save')} data-autofocus data-testid="demo-open-save">
                {t('save')}
              </button>
              <button type="button" className={s.btn} onClick={() => openOverlay('load')} data-testid="demo-open-load">
                {t('load')}
              </button>
              <button type="button" className={s.btn} onClick={() => openOverlay('settings')} data-testid="demo-open-settings">
                {t('menuSettings')}
              </button>
              <button
                type="button"
                className={s.btn}
                onClick={() => {
                  touch();
                  startChapter(chapterId);
                }}
                data-testid="demo-restart"
              >
                {t('restart')}
              </button>
              <button type="button" className={s.btn} onClick={toTitle} data-testid="demo-to-title">
                {t('toTitle')}
              </button>
              <button type="button" className={`${s.btn} ${s.btnStrong}`} onClick={closeOverlay}>
                {t('resume')}
              </button>
            </div>
          </div>
        )}

        {/* 저장 / 불러오기 */}
        {(overlay === 'save' || overlay === 'load') && saves && (
          <div className={`${s.center} ${mode === 'title' ? s.below : ''}`}>
            <div className={`${s.panel} ${s.panelWide}`} role="group" aria-labelledby="demo-slots-title">
              <p id="demo-slots-title" className={s.panelTitle}>
                {overlay === 'save' ? t('save') : t('load')}
              </p>
              <div className={s.slots}>
                {overlay === 'load' && (
                  <SlotButton
                    label={t('autoSlot')}
                    info={slotInfo(saves.auto)}
                    empty={t('emptySlot')}
                    onClick={() => saves.auto && loadRecord(saves.auto)}
                    disabled={!saves.auto}
                    testId="demo-load-slot"
                    autofocus
                  />
                )}
                {saves.slots.map((rec, i) =>
                  overlay === 'save' ? (
                    <SlotButton key={i} label={t('slot', { n: i + 1 })} info={slotInfo(rec)} empty={t('emptySlot')} onClick={() => saveTo(i)} testId="demo-save-slot" autofocus={i === 0} />
                  ) : (
                    <SlotButton key={i} label={t('slot', { n: i + 1 })} info={slotInfo(rec)} empty={t('emptySlot')} onClick={() => rec && loadRecord(rec)} disabled={!rec} testId="demo-load-slot" />
                  ),
                )}
              </div>
              <div className={s.row}>
                <button type="button" className={s.btn} onClick={closeOverlay}>
                  {t('back')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 설정 */}
        {overlay === 'settings' && settings && (
          <div className={`${s.center} ${mode === 'title' ? s.below : ''}`}>
            <div className={s.panel} role="group" aria-labelledby="demo-settings-title" data-testid="demo-settings">
              <p id="demo-settings-title" className={s.panelTitle}>
                {t('menuSettings')}
              </p>
              {(['bgm', 'voice', 'sfx'] as const).map((k, i) => (
                <label key={k} className={s.field}>
                  <span>{t(k === 'bgm' ? 'volBgm' : k === 'voice' ? 'volVoice' : 'volSfx')}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={volPct(settings[k])}
                    onChange={(e) => updateSettings({ [k]: Number(e.target.value) / 100 })}
                    className={s.range}
                    data-testid={`demo-vol-${k}`}
                    data-autofocus={i === 0 ? true : undefined}
                  />
                  <span aria-hidden="true">{volPct(settings[k])}</span>
                </label>
              ))}
              <label className={s.check}>
                <input type="checkbox" checked={settings.muted} onChange={(e) => updateSettings({ muted: e.target.checked })} data-testid="demo-mute-check" />
                {t('mute')}
              </label>
              <div className={s.row}>
                <button type="button" className={`${s.btn} ${s.btnStrong}`} onClick={closeOverlay}>
                  {t('back')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 백로그 */}
        {overlay === 'log' && (
          <div className={s.log} role="region" aria-label={t('keyLog')} data-testid="demo-log">
            <div className={s.logHead}>
              <span>{t('keyLog')}</span>
              <button type="button" className={s.ghost} onClick={closeOverlay} data-autofocus>
                <Icon name="close" size={16} /> {t('close')}
              </button>
            </div>
            <LogList
              items={logItems}
              speakerOf={speakerOf}
              fill={fill}
              voiceUrl={(id) => (id && data ? data.audio.voice[id] : undefined)}
              onVoice={(u) => audioRef.current?.voice(u)}
              replayLabel={t('replayVoice')}
            />
          </div>
        )}

        {toast && (
          <p className={s.toast} role="status">
            {toast}
          </p>
        )}

        {loadState === 'error' && (
          <div className={s.status} role="alert">
            {t('loadError')}
            <button type="button" className={`${s.btn} ${s.btnStrong}`} onClick={() => fetchData()}>
              {t('retry')}
            </button>
          </div>
        )}

        <p aria-live="polite" className={s.srOnly} data-testid="demo-live">
          {announce}
        </p>
      </div>

      {/* 진행률 · 소리(하봄 스타일) */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex min-w-[12rem] flex-1 items-center gap-3">
          <span className="shrink-0 text-[0.8125rem] font-semibold text-plum-soft">{mode === 'play' || mode === 'end' ? chapterLabel(chapterId) : t('progress')}</span>
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
          <span className="shrink-0 font-round-latin text-[0.8125rem] font-bold tabular-nums text-plum-soft" data-testid="demo-counter">
            {mode === 'play' ? `${stepIdx + 1} / ${steps.length}` : mode === 'end' ? `${steps.length} / ${steps.length}` : ''}
          </span>
        </div>
        {settings && (
          <button type="button" className={s.outBtn} aria-pressed={settings.muted} onClick={() => updateSettings({ muted: !settings.muted })} data-testid="demo-mute">
            {settings.muted ? t('unmute') : t('mute')}
          </button>
        )}
      </div>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-plum-soft">{t('keyHint')}</p>
    </div>
  );
}

function KeyButton({ cap, label, onClick, pressed, testId, disabled }: { cap: string; label: string; onClick: () => void; pressed?: boolean; testId: string; disabled?: boolean }) {
  return (
    <button type="button" className={s.key} onClick={onClick} aria-pressed={pressed} data-testid={testId} disabled={disabled}>
      <span className={s.cap} aria-hidden="true">
        {cap}
      </span>
      {label}
    </button>
  );
}

function SlotButton({
  label,
  info,
  empty,
  onClick,
  disabled,
  testId,
  autofocus,
}: {
  label: string;
  info: { title: string; line: string; when: string } | null;
  empty: string;
  onClick: () => void;
  disabled?: boolean;
  testId: string;
  autofocus?: boolean;
}) {
  return (
    <button type="button" className={s.slot} onClick={onClick} disabled={disabled} data-testid={testId} data-autofocus={autofocus ? true : undefined}>
      <b>
        {label}
        {info ? ` · ${info.when}` : ''}
      </b>
      <span>{info ? info.title : empty}</span>
      {info && <span>{info.line}</span>}
    </button>
  );
}

function LogList({
  items,
  speakerOf,
  fill,
  voiceUrl,
  onVoice,
  replayLabel,
}: {
  items: DemoStep[];
  speakerOf: (st?: DemoStep) => { name: string; color: string } | null;
  fill: (t: string) => string;
  voiceUrl: (id?: string) => string | undefined;
  onVoice: (url: string) => void;
  replayLabel: string;
}) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, []);
  return (
    <ol ref={ref} className={s.logList}>
      {items.map((st, i) => {
        const sp = speakerOf(st);
        const v = voiceUrl(st.voice);
        return (
          <li key={i} className={s.logItem}>
            <span>
              {sp && (
                <span className={s.logName} style={{ background: sp.color }}>
                  {sp.name}
                </span>
              )}
            </span>
            <span>{fill(st.text)}</span>
            <span>
              {v && (
                <button type="button" className={s.ghost} onClick={() => onVoice(v)} aria-label={replayLabel}>
                  <Icon name="play" size={12} />
                </button>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
