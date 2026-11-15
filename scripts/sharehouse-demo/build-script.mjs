// "어서오세요, 셰어하우스에!" 웹 데모 대본 변환기.
//
//   node scripts/sharehouse-demo/build-script.mjs            (저장소 루트에서)
//   SHAREHOUSE_SRC=/path/to/sharehouse node scripts/sharehouse-demo/build-script.mjs
//
// 입력(읽기 전용 원본):
//   - 대본: `20260221 백업 _ 20260126 데모 분량 시나리오 번역 내보내기 공간 작업용.xlsx` 의 "(수정 완)" 시트
//     (9000 프롤로그는 한/영/일 모두 이 시트, 1000·3020 의 일본어는 260126 CSV — 3020 은 jaMap 으로 줄 맞춤)
//   - 음성 id: 녹음 대본 `250622 오디오 CSV용/비교 본.xlsx` (장 코드 + 대사 → 00_voice_001 같은 파일명)
//   - 연출·소리 배정: staging.mjs
// 출력: apps/web/public/habom/sharehouse-demo/data/{ko,en,ja}.json, scripts/sharehouse-demo/used-assets.json
//       줄마다 장면 상태(배경·캐릭터·CG·BGM)를 풀어 둔 형태라 아무 줄에서나 시작할 수 있다(저장/불러오기·백로그).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readXlsx, readCsv } from './lib/xlsx.mjs';
import { ASSETS, CAST, AUDIO, VOICE_SCRIPT, SPEAKERS, CHAPTERS, JA_DRAFT } from './staging.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const SRC = process.env.SHAREHOUSE_SRC || path.resolve(repo, '../elyweb/sharehouse');
const SCN = path.join(SRC, '01 기획/02 시나리오/00 메인 시나리오');
const XLSX = path.join(SCN, '20260221 백업 _ 20260126 데모 분량 시나리오 번역 내보내기 공간 작업용.xlsx');
const CSV_DIR = path.join(SCN, '260126 데모 분량 시나리오 CSV');
const OUT = path.join(repo, 'apps/web/public/habom/sharehouse-demo/data');
const BASE = '/habom/sharehouse-demo';
const LOCALES = ['ko', 'en', 'ja'];
const HEROINES = new Set(['jihye', 'saeun', 'yunha']);

const warnings = [];
const warn = (s) => warnings.push(s);

/** 원본 문자열 정리: <br> → 줄바꿈, 앞뒤 공백, 일본어판에 남은 한국어 이름 표기 */
function clean(text, locale) {
  let t = (text || '').replace(/<br\s*\/?>/gi, '\n').replace(/\r/g, '').trim();
  if (t === '<Blank>') return '';
  t = t.replace(/,\s*,/g, ',').replace(/[ \t]+\n/g, '\n');
  if (locale === 'ja') t = t.replace(/ホン・「セウン」/g, '紗夜').replace(/「セウン」/g, '紗夜');
  return t;
}

/** 대사 비교용: 공백·문장부호·말줄임 제거 */
const norm = (s) => (s || '').replace(/<br\s*\/?>/gi, '').replace(/[\s.,!?~⋯…·"'“”‘’\-ㅡ()]/g, '');
function dice(a, b) {
  if (!a || !b) return 0;
  const grams = (s) => {
    const m = new Map();
    for (let i = 0; i < s.length - 1; i++) m.set(s.slice(i, i + 2), (m.get(s.slice(i, i + 2)) || 0) + 1);
    return m;
  };
  const A = grams(a), B = grams(b);
  let hit = 0;
  for (const [g, n] of A) hit += Math.min(n, B.get(g) || 0);
  return (2 * hit) / Math.max(1, a.length - 1 + b.length - 1);
}

const url = {
  bg: (id) => `${BASE}/img/bg/${id}.webp`,
  ecg: (id) => `${BASE}/img/ecg/${id}.webp`,
  stand: (c, f) => `${BASE}/img/stand/${c}-${f}.webp`,
  bgm: (id) => `${BASE}/audio/bgm/${id}.mp3`,
  voice: (id) => `${BASE}/audio/voice/${id}.mp3`,
  sfx: (id) => `${BASE}/audio/sfx/${id}.mp3`,
};

/** 녹음 대본: 장 코드 → [{ text, file }] (대본 순서) */
function readVoiceScript() {
  const book = readXlsx(path.join(SRC, VOICE_SCRIPT.file));
  const rows = book[VOICE_SCRIPT.sheet].slice(2).filter(Boolean);
  const byCode = {};
  for (const r of rows) {
    if (!r.B || !r.I) continue;
    (byCode[r.B] ||= []).push({ text: norm(r.F || r.G), file: r.I.trim(), used: false });
  }
  return byCode;
}

/** 대본 순서대로 다음 녹음 줄을 찾는다(같은 대사가 두 번 나와도 순서로 구분) */
function matchVoice(list, ptr, text) {
  const t = norm(text);
  if (!t || !list) return null;
  for (let i = ptr.i; i < Math.min(list.length, ptr.i + 25); i++) {
    if (!list[i].used && list[i].text === t) return take(list, ptr, i);
  }
  let best = null;
  for (let i = ptr.i; i < Math.min(list.length, ptr.i + 25); i++) {
    if (list[i].used) continue;
    const d = dice(list[i].text, t);
    if (d >= 0.72 && (!best || d > best.d)) best = { i, d };
  }
  return best ? take(list, ptr, best.i) : null;
}
function take(list, ptr, i) {
  list[i].used = true;
  ptr.i = i + 1;
  return list[i].file;
}

/** 지시어를 현재 장면 상태에 적용 */
function applyStage(state, d, where) {
  if ('bg' in d) state.bg = d.bg;
  if ('ecg' in d) state.ecg = d.ecg;
  if ('bgm' in d) state.bgm = d.bgm;
  if ('stand' in d) {
    state.chars = new Map();
    if (d.stand) {
      const [c, f] = d.stand.split('/');
      state.chars.set(c, { face: f, x: null });
    }
  }
  if (d.hide === 'all') state.chars = new Map();
  else if (Array.isArray(d.hide)) for (const c of d.hide) state.chars.delete(c);
  if (d.show) for (const [c, f] of Object.entries(d.show)) state.chars.set(c, { face: f, x: state.chars.get(c)?.x ?? null });
  if (typeof d.face === 'string') {
    if (state.chars.size !== 1) throw new Error(`${where}: face 문자열은 혼자 서 있을 때만`);
    const [c] = state.chars.keys();
    state.chars.get(c).face = d.face;
  } else if (d.face) {
    for (const [c, f] of Object.entries(d.face)) {
      if (!state.chars.has(c)) throw new Error(`${where}: 서 있지 않은 ${c} 의 표정 지정`);
      state.chars.get(c).face = f;
    }
  }
  if (d.at) for (const [c, x] of Object.entries(d.at)) {
    if (!state.chars.has(c)) throw new Error(`${where}: 서 있지 않은 ${c} 의 위치 지정`);
    state.chars.get(c).x = x;
  }
  if (state.bg && state.bg !== 'black' && !ASSETS.bg[state.bg]) throw new Error(`${where}: 알 수 없는 bg ${state.bg}`);
  if (state.ecg && !ASSETS.ecg[state.ecg]) throw new Error(`${where}: 알 수 없는 ecg ${state.ecg}`);
  if (state.bgm && !AUDIO.bgm[state.bgm]) throw new Error(`${where}: 알 수 없는 bgm ${state.bgm}`);
  for (const [c, { face }] of state.chars) {
    if (!CAST[c] || !(face in CAST[c].faces)) throw new Error(`${where}: 알 수 없는 스탠딩 ${c}/${face}`);
  }
}

/** 지금 서 있는 캐릭터들 → [{ id, face, x }] (x 를 정하지 않았으면 혼자면 가운데, 여럿이면 각자 자리) */
function layout(chars) {
  const list = [...chars].map(([id, v]) => ({ id, face: v.face, x: v.x ?? (chars.size === 1 ? 0.5 : CAST[id].slot) }));
  return list.sort((a, b) => a.x - b.x);
}

function build() {
  const book = readXlsx(XLSX);
  const voiceScript = readVoiceScript();
  const used = { bg: new Set(), ecg: new Set(), stand: new Set(), bgm: new Set([AUDIO.titleBgm]), voice: new Set(), sfx: new Set(['touch']) };
  const out = Object.fromEntries(LOCALES.map((l) => [l, { version: 2, locale: l, speakers: {}, chapters: [] }]));
  const voiceStats = [];

  for (const sp of Object.values(SPEAKERS)) {
    if (sp.id === 'player') continue;
    for (const l of LOCALES) out[l].speakers[sp.id] = { name: sp.name[l], color: sp.color };
  }

  for (const ch of CHAPTERS) {
    const sheet = book[ch.sheet];
    if (!sheet) throw new Error(`시트 없음: ${ch.sheet}`);
    const rows = sheet.slice(2).map((r) => r || {}); // 1행 = 머리글
    const csv = ch.csv ? readCsv(path.join(CSV_DIR, ch.csv)).slice(1) : null;
    if (csv && !ch.jaMap) {
      rows.forEach((r, n) => {
        if (clean(r.F, 'ko') !== clean(csv[n]?.[5], 'ko')) warn(`${ch.id} #${n}: 수정본 한국어가 CSV 와 다름 — 일본어 확인 필요`);
      });
    }

    const state = { bg: null, ecg: null, bgm: null, chars: new Map() };
    const steps = Object.fromEntries(LOCALES.map((l) => [l, []]));
    const vlist = voiceScript[ch.voiceCode];
    const ptr = { i: 0 };
    let heroLines = 0, voiced = 0, matched = 0;
    const pending = {}; // 빈 행의 일회성 지시를 다음 대사로 넘김

    rows.forEach((r, n) => {
      const d = { ...(ch.stage[n] || {}) };
      const carry = pending.fx || pending.sfx ? { ...pending } : null;
      applyStage(state, d, `${ch.id} #${n}`);
      const ko = clean(r.F, 'ko');
      if (!ko) {
        if (d.fx) pending.fx = d.fx;
        if (d.sfx) pending.sfx = d.sfx;
        return;
      }
      const fx = d.fx || carry?.fx;
      const sfx = d.sfx || carry?.sfx;
      delete pending.fx;
      delete pending.sfx;

      const speakerKey = (r.C || '').trim();
      const sp = speakerKey ? SPEAKERS[speakerKey] : null;
      if (speakerKey && !sp) throw new Error(`${ch.id} #${n}: 모르는 화자 ${speakerKey}`);

      // 음성: 화자가 히로인이거나 ??? 인 줄을 녹음 대본과 맞춘다
      let voice = null;
      if (sp && (HEROINES.has(sp.id) || sp.id === 'unknown')) {
        voice = matchVoice(vlist, ptr, r.F);
        if (HEROINES.has(sp.id)) heroLines++;
        if (voice) {
          matched++;
          if (AUDIO.voice[voice]) voiced++, used.voice.add(voice);
        }
      }

      let jaText;
      let draft = false;
      if (ch.ja === 'sheet') jaText = r.H;
      else if (ch.jaMap) {
        const m = ch.jaMap[n];
        if (typeof m === 'string') jaText = m;
        else if (typeof m === 'number') jaText = csv[m]?.[7];
        if (!clean(jaText, 'ja') && JA_DRAFT[ch.id]?.[n]) {
          jaText = JA_DRAFT[ch.id][n];
          draft = true;
        }
      } else jaText = csv[n]?.[7];
      const texts = { ko, en: clean(r.G, 'en'), ja: clean(jaText, 'ja') };
      // 영어판에서 이름 자리가 지워진 줄 되살리기("I'm ." → "I'm <PlayerName>.")
      if (ko.includes('<PlayerName>') && texts.en && !texts.en.includes('<PlayerName>')) {
        texts.en = texts.en.replace(/\bI'm\s*\./, "I'm <PlayerName>.");
        if (!texts.en.includes('<PlayerName>')) warn(`${ch.id} #${n} en: <PlayerName> 자리 없음`);
      }

      if (state.bg && state.bg !== 'black') used.bg.add(state.bg);
      if (state.ecg) used.ecg.add(state.ecg);
      if (state.bgm) used.bgm.add(state.bgm);
      if (sfx && AUDIO.sfx[sfx]) used.sfx.add(sfx);
      const chars = state.ecg ? [] : layout(state.chars);
      for (const c of chars) used.stand.add(`${c.id}/${c.face}`);

      for (const l of LOCALES) {
        let text = texts[l];
        if (!text) {
          warn(`${ch.id} #${n} ${l}: 번역 없음 → ${texts.en ? 'en' : 'ko'} 로 대체`);
          text = texts.en || ko;
        }
        const step = { n, text };
        if (sp) step.who = sp.id;
        step.bg = state.bg || 'black';
        if (chars.length) step.chars = chars;
        if (state.ecg) step.ecg = state.ecg;
        step.bgm = state.bgm;
        if (voice) step.voice = voice;
        if (fx) step.fx = fx;
        if (sfx) step.sfx = sfx;
        if (l === 'ja' && draft) step.draft = true;
        steps[l].push(step);
      }
    });
    for (const l of LOCALES) out[l].chapters.push({ id: ch.id, source: ch.sheet, steps: steps[l] });
    voiceStats.push({ id: ch.id, lines: steps.ko.length, heroLines, matched, voiced });
  }

  const images = {
    bg: Object.fromEntries([...used.bg].sort().map((id) => [id, url.bg(id)])),
    ecg: Object.fromEntries([...used.ecg].sort().map((id) => [id, url.ecg(id)])),
    stand: Object.fromEntries([...used.stand].sort().map((s) => [s, url.stand(...s.split('/'))])),
  };
  const cast = Object.fromEntries(
    Object.entries(CAST).map(([id, c]) => [id, { scale: c.scale, top: c.top, crop: cropOf(c) }]),
  );
  const audio = {
    titleBgm: AUDIO.titleBgm,
    bgm: Object.fromEntries([...used.bgm].sort().map((id) => [id, url.bgm(id)])),
    voice: Object.fromEntries([...used.voice].sort().map((id) => [id, url.voice(id)])),
    sfx: Object.fromEntries([...used.sfx].sort().map((id) => [id, url.sfx(id)])),
  };
  fs.mkdirSync(OUT, { recursive: true });
  for (const l of LOCALES) {
    Object.assign(out[l], { images, cast, audio });
    fs.writeFileSync(path.join(OUT, `${l}.json`), JSON.stringify(out[l]) + '\n');
  }
  fs.writeFileSync(
    path.join(here, 'used-assets.json'),
    JSON.stringify({ bg: [...used.bg].sort(), ecg: [...used.ecg].sort(), stand: [...used.stand].sort(), bgm: [...used.bgm].sort(), voice: [...used.voice].sort(), sfx: [...used.sfx].sort() }, null, 2) + '\n',
  );
  // 음성 연결 현황(문서·보고용)
  const missing = [];
  for (const ch of out.ko.chapters) for (const s of ch.steps) if (s.voice && !AUDIO.voice[s.voice]) missing.push(s.voice);
  fs.writeFileSync(path.join(here, 'voice-missing.txt'), missing.join('\n') + '\n');

  console.log(`✓ ${OUT}`);
  for (const v of voiceStats) console.log(`  ${v.id}: 대사 ${v.lines}줄 · 히로인 ${v.heroLines}줄 · 음성 id ${v.matched}개 · 파일 있음 ${v.voiced}개`);
  console.log(`  일본어 임시 번역 ${out.ja.chapters.flatMap((c) => c.steps).filter((s) => s.draft).length}줄`);
  console.log(`  이미지: 배경 ${used.bg.size} · CG ${used.ecg.size} · 스탠딩 ${used.stand.size} / 소리: BGM ${used.bgm.size} · 음성 ${used.voice.size} · 효과음 ${used.sfx.size}`);
  console.log(`  파일이 없는 음성 id ${missing.length}개 → scripts/sharehouse-demo/voice-missing.txt`);
  if (warnings.length) {
    console.log(`\n주의 ${warnings.length}건:`);
    for (const w of warnings) console.log('  - ' + w);
  }
}

/** 스탠딩은 화면에 보이는 위쪽만 잘라 내보낸다: (1 - top) / scale 에 여유 2% */
export function cropOf(c) {
  return Math.min(1, Math.round(((1 - c.top) / c.scale + 0.02) * 1000) / 1000);
}

if (import.meta.url === `file://${process.argv[1]}`) build();
