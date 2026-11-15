// 웹 데모 이미지 변환기: 원본 PNG(4K) → WebP. build-script.mjs 를 먼저 돌려 used-assets.json 을 만든 뒤 실행.
//
//   node scripts/sharehouse-demo/build-images.mjs            (저장소 루트에서, sharp 는 apps/web 의 것을 씀)
//
// 출력: apps/web/public/habom/sharehouse-demo/img/{bg,ecg,stand}/*.webp, title.webp, logo.webp
//
// 스탠딩 배치(게임 UI 목업 `UXUI/2024.09 Renewal/Text/00 Mergeimage_Dark_Off.png` 기준):
//   원본 캔버스(2393×4700)를 화면 높이의 160% 로 키우고 위쪽을 화면 위에 붙인다. → 캔버스 위쪽 1/1.6 만 보인다.
//   그래서 그 부분만 잘라 내보내고, 웹에서는 "높이 100%, 가운데" 로 놓으면 같은 구도가 된다.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { ASSETS } from './staging.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const require = createRequire(path.join(repo, 'apps/web/package.json'));
const sharp = require('sharp');

const SRC = path.join(process.env.SHAREHOUSE_SRC || path.resolve(repo, '../elyweb/sharehouse'), '02 그래픽');
const OUT = path.join(repo, 'apps/web/public/habom/sharehouse-demo/img');
const used = JSON.parse(fs.readFileSync(path.join(here, 'used-assets.json'), 'utf8'));

const BG_W = 1920;
const STAND_H = 1400; // 보이는 부분 기준 높이(px). 1120px 폭 무대 × 2배 밀도 ≈ 1260px
const STAND_SCALE = 1.6;

/**
 * 원본에 밤 배경이 없을 때 쓰는 임시 톤 보정.
 *   tint: 밝기를 낮춘 뒤 푸른 단색조로 바꾸고(게임 UI 목업의 밤 거실 톤), 원래 색을 (1 - mix) 만큼 다시 섞는다.
 *   wash: 살짝 어둡게만(조명이 켜진 방)
 */
const TONES = {
  night: { brightness: 0.34, tint: { r: 110, g: 118, b: 200 }, mix: 0.85 },
  'night-cool': { brightness: 0.5, tint: { r: 110, g: 118, b: 200 }, mix: 0.82 },
  dim: { brightness: 0.82, saturation: 0.9, wash: { r: 40, g: 40, b: 90, alpha: 0.12 } },
};

const src = (p) => {
  const f = path.join(SRC, p);
  if (!fs.existsSync(f)) throw new Error(`원본 없음: ${f}`);
  return f;
};
const kb = (f) => Math.round(fs.statSync(f).size / 1024);
const written = [];

async function save(img, rel, quality, opts = {}) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await img.webp({ quality, effort: 6, ...opts }).toFile(file);
  written.push([rel, kb(file)]);
}

async function background(id, def) {
  let img = sharp(src(def.src)).resize(BG_W, Math.round((BG_W * 9) / 16), { fit: 'cover' }).removeAlpha();
  const tone = def.tone && TONES[def.tone];
  if (tone?.tint) {
    const resized = await img.png().toBuffer();
    const toned = await sharp(resized).modulate({ brightness: tone.brightness }).tint(tone.tint).png().toBuffer();
    const original = await sharp(resized).modulate({ brightness: tone.brightness * 0.9, saturation: 0.5 }).ensureAlpha(1 - tone.mix).png().toBuffer();
    img = sharp(toned).composite([{ input: original }]).linear(1.08, -6);
  } else if (tone?.wash) {
    const base = await img.modulate({ brightness: tone.brightness, saturation: tone.saturation }).toBuffer();
    const { width, height } = await sharp(base).metadata();
    const wash = await sharp({ create: { width, height, channels: 4, background: tone.wash } }).png().toBuffer();
    img = sharp(base).composite([{ input: wash, blend: 'multiply' }]);
  }
  await save(img, `bg/${id}.webp`, 84);
}

async function stand(key) {
  const [char, face] = key.split('/');
  const def = ASSETS.stand[char];
  const body = sharp(src(def.body));
  const { width, height } = await body.metadata();
  const layers = def.faces[face] ? [{ input: src(def.faces[face]) }] : [];
  const full = await sharp(src(def.body)).composite(layers).png().toBuffer();
  const visible = Math.round(height / STAND_SCALE);
  const cropped = await sharp(full).extract({ left: 0, top: 0, width, height: visible }).toBuffer();
  await save(sharp(cropped).resize({ height: STAND_H }), `stand/${char}-${face}.webp`, 86, { alphaQuality: 90 });
}

for (const id of used.bg) await background(id, ASSETS.bg[id]);
for (const id of used.ecg) await save(sharp(src(ASSETS.ecg[id].src)).resize(BG_W, Math.round((BG_W * 9) / 16), { fit: 'cover' }).removeAlpha(), `ecg/${id}.webp`, 84);
for (const key of used.stand) await stand(key);
await save(sharp(src(ASSETS.title.src)).resize(BG_W, Math.round((BG_W * 9) / 16), { fit: 'cover', position: 'top' }).removeAlpha(), 'title.webp', 82);
await save(sharp(src(ASSETS.logo.src)).resize({ width: 550 }), 'logo.webp', 90, { alphaQuality: 100 });

// 더 이상 쓰지 않는 파일 정리
const keep = new Set(written.map(([r]) => r));
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (!keep.has(path.relative(OUT, p))) fs.rmSync(p);
  }
})(OUT);

const total = written.reduce((s, [, k]) => s + k, 0);
for (const [r, k] of written) console.log(`  ${String(k).padStart(5)} KB  ${r}`);
console.log(`✓ ${written.length}개, 합계 ${(total / 1024).toFixed(2)} MB → ${OUT}`);
