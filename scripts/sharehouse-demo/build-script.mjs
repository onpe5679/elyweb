// "어서오세요, 셰어하우스에!" 웹 데모 대본 변환기.
//
//   node scripts/sharehouse-demo/build-script.mjs            (저장소 루트에서)
//   SHAREHOUSE_SRC=/path/to/sharehouse node scripts/sharehouse-demo/build-script.mjs
//
// 입력(읽기 전용 원본):
//   - 한국어·영어: `20260221 백업 _ 20260126 데모 분량 시나리오 번역 내보내기 공간 작업용.xlsx` 의 "(수정 완)" 시트
//     (260126 CSV 보다 새 판본. 영어가 다듬어져 있고 3020 은 한·영 줄이 맞음)
//   - 일본어: 260126 데모 분량 시나리오 CSV (Text_Jp). 3020 은 staging.mjs 의 jaMap 으로 다시 맞춘다.
//   - 연출: staging.mjs (손으로 정한 배경·스탠딩·표정·CG)
// 출력: apps/web/public/habom/sharehouse-demo/data/{ko,en,ja}.json — 장면 상태를 줄마다 풀어 둔 형태라
//       플레이어는 아무 줄로나 바로 건너뛸 수 있다(백로그·다시 하기·미리 불러오기에 씀).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readXlsx, readCsv } from './lib/xlsx.mjs';
import { ASSETS, SPEAKERS, CHAPTERS, JA_DRAFT } from './staging.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const SRC = process.env.SHAREHOUSE_SRC || path.resolve(repo, '../elyweb/sharehouse');
const SCN = path.join(SRC, '01 기획/02 시나리오/00 메인 시나리오');
const XLSX = path.join(SCN, '20260221 백업 _ 20260126 데모 분량 시나리오 번역 내보내기 공간 작업용.xlsx');
const CSV_DIR = path.join(SCN, '260126 데모 분량 시나리오 CSV');
const OUT = path.join(repo, 'apps/web/public/habom/sharehouse-demo/data');
const IMG_BASE = '/habom/sharehouse-demo/img';
const LOCALES = ['ko', 'en', 'ja'];

const warnings = [];
const warn = (s) => warnings.push(s);

/** 원본 문자열 정리: <br> → 줄바꿈, 앞뒤 공백, 이름이 빠져 남은 ", ," 정리, 일본어판에 남은 한국어 이름 표기 */
function clean(text, locale) {
  let t = (text || '').replace(/<br\s*\/?>/gi, '\n').replace(/\r/g, '').trim();
  if (t === '<Blank>') return '';
  t = t.replace(/,\s*,/g, ',').replace(/[ \t]+\n/g, '\n');
  if (locale === 'ja') t = t.replace(/ホン・「セウン」/g, '紗夜').replace(/「セウン」/g, '紗夜');
  return t;
}

const imgUrl = {
  bg: (id) => `${IMG_BASE}/bg/${id}.webp`,
  ecg: (id) => `${IMG_BASE}/ecg/${id}.webp`,
  stand: (char, face) => `${IMG_BASE}/stand/${char}-${face}.webp`,
};

function build() {
  const book = readXlsx(XLSX);
  const used = { bg: new Set(), ecg: new Set(), stand: new Set() };
  const out = Object.fromEntries(LOCALES.map((l) => [l, { version: 1, locale: l, speakers: {}, chapters: [] }]));

  for (const sp of Object.values(SPEAKERS)) {
    if (sp.id === 'player') continue;
    for (const l of LOCALES) out[l].speakers[sp.id] = { name: sp.name[l], color: sp.color };
  }

  for (const ch of CHAPTERS) {
    const sheet = book[ch.sheet];
    if (!sheet) throw new Error(`시트 없음: ${ch.sheet}`);
    const rows = sheet.slice(2).map((r) => r || {}); // 1행 = 머리글
    const csv = readCsv(path.join(CSV_DIR, ch.csv)).slice(1);

    // 수정본과 CSV 의 한국어가 같은 자리인지(=일본어를 행 순번 그대로 가져와도 되는지) 확인
    if (!ch.jaMap) {
      rows.forEach((r, n) => {
        const a = clean(r.F, 'ko');
        const b = clean(csv[n]?.[5], 'ko');
        if (a !== b) warn(`${ch.id} #${n}: 수정본 한국어가 CSV 와 다름 — 일본어 확인 필요 (${a.slice(0, 20)} / ${b.slice(0, 20)})`);
      });
    }

    const state = { bg: null, stand: null, ecg: null };
    const steps = Object.fromEntries(LOCALES.map((l) => [l, []]));
    rows.forEach((r, n) => {
      const d = ch.stage[n] || {};
      if ('bg' in d) state.bg = d.bg;
      if ('ecg' in d) state.ecg = d.ecg;
      if ('stand' in d) state.stand = d.stand;
      if ('face' in d) {
        if (!state.stand) throw new Error(`${ch.id} #${n}: 서 있는 캐릭터 없이 face 지정`);
        state.stand = `${state.stand.split('/')[0]}/${d.face}`;
      }
      for (const k of ['bg', 'ecg']) if (state[k] && !ASSETS[k][state[k]]) throw new Error(`${ch.id} #${n}: 알 수 없는 ${k} ${state[k]}`);
      if (state.stand) {
        const [c, f] = state.stand.split('/');
        if (!ASSETS.stand[c] || !(f in ASSETS.stand[c].faces)) throw new Error(`${ch.id} #${n}: 알 수 없는 스탠딩 ${state.stand}`);
      }

      const ko = clean(r.F, 'ko');
      if (!ko) {
        // 빈 행 = 연출 전용(전환 자리). 일회성 지시는 다음 대사로 넘긴다.
        if (d.fx || d.sfx) ch.stage[n + 1] = { ...(ch.stage[n + 1] || {}), ...(d.fx && { fx: d.fx }), ...(d.sfx && { sfx: d.sfx }) };
        return;
      }
      const speakerKey = (r.C || '').trim();
      const sp = speakerKey ? SPEAKERS[speakerKey] : null;
      if (speakerKey && !sp) throw new Error(`${ch.id} #${n}: 모르는 화자 ${speakerKey}`);

      let jaText;
      let draft = false;
      if (ch.jaMap) {
        const m = ch.jaMap[n];
        if (typeof m === 'string') jaText = m;
        else if (typeof m === 'number') jaText = csv[m]?.[7];
        if (!clean(jaText, 'ja') && JA_DRAFT[ch.id]?.[n]) {
          jaText = JA_DRAFT[ch.id][n];
          draft = true;
        }
      } else jaText = csv[n]?.[7];
      const texts = { ko, en: clean(r.G, 'en'), ja: clean(jaText, 'ja') };

      if (state.bg) used.bg.add(state.bg);
      if (state.ecg) used.ecg.add(state.ecg);
      if (state.stand) used.stand.add(state.stand);
      for (const l of LOCALES) {
        let text = texts[l];
        if (!text) {
          warn(`${ch.id} #${n} ${l}: 번역 없음 → ${texts.en ? 'en' : 'ko'} 로 대체`);
          text = texts.en || ko;
        }
        const step = { n, text };
        if (sp) step.who = sp.id;
        if (state.bg) step.bg = state.bg;
        if (state.stand && !state.ecg) step.stand = state.stand;
        if (state.ecg) step.ecg = state.ecg;
        if (d.fx) step.fx = d.fx;
        if (d.sfx) step.sfx = d.sfx;
        if (l === 'ja' && draft) step.draft = true;
        steps[l].push(step);
      }
    });
    for (const l of LOCALES) out[l].chapters.push({ id: ch.id, cast: ch.cast, source: ch.sheet, steps: steps[l] });
  }

  // 이미지 경로 표(쓰는 것만)
  const images = {
    bg: Object.fromEntries([...used.bg].sort().map((id) => [id, imgUrl.bg(id)])),
    ecg: Object.fromEntries([...used.ecg].sort().map((id) => [id, imgUrl.ecg(id)])),
    stand: Object.fromEntries([...used.stand].sort().map((s) => [s, imgUrl.stand(...s.split('/'))])),
  };
  fs.mkdirSync(OUT, { recursive: true });
  for (const l of LOCALES) {
    out[l].images = images;
    fs.writeFileSync(path.join(OUT, `${l}.json`), JSON.stringify(out[l]) + '\n');
  }
  // build-images.mjs 가 읽는 목록(사람이 보기 쉽게 들여쓰기)
  fs.writeFileSync(path.join(here, 'used-assets.json'), JSON.stringify({ bg: [...used.bg].sort(), ecg: [...used.ecg].sort(), stand: [...used.stand].sort() }, null, 2) + '\n');

  const ko = out.ko.chapters;
  console.log(`✓ ${OUT}`);
  for (const c of ko) console.log(`  ${c.id}: 대사 ${c.steps.length}줄`);
  console.log(`  일본어 임시 번역 ${out.ja.chapters.flatMap((c) => c.steps).filter((s) => s.draft).length}줄`);
  console.log(`  이미지: 배경 ${used.bg.size} · CG ${used.ecg.size} · 스탠딩 ${used.stand.size}`);
  if (warnings.length) {
    console.log(`\n주의 ${warnings.length}건:`);
    for (const w of warnings) console.log('  - ' + w);
  }
}

build();
