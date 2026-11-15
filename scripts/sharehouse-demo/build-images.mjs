// 웹 데모 이미지 변환기: 원본 PNG(4K) → WebP. build-script.mjs 를 먼저 돌려 used-assets.json 을 만든 뒤 실행.
//
//   node scripts/sharehouse-demo/build-images.mjs            (저장소 루트에서, sharp 는 apps/web 의 것을 씀)
//
// 출력: apps/web/public/habom/sharehouse-demo/img/{bg,ecg,stand}/*.webp, title.webp, logo.webp
//
// 스탠딩 배치(플레이 영상 프레임에 맞춰 잰 값, staging.mjs 의 CAST):
//   캔버스를 화면 높이의 scale 배로 키워 윗변을 top 에 둔다 → 화면에 보이는 위쪽 crop(= (1-top)/scale + 2%) 만 잘라 내보낸다.
//   웹에서는 높이 scale×crop, 윗변 top, 가로 중심 x 로 놓는다.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { ASSETS, CAST } from './staging.mjs';
import { cropOf } from './build-script.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const require = createRequire(path.join(repo, 'apps/web/package.json'));
const sharp = require('sharp');

const SRC = process.env.SHAREHOUSE_SRC || path.resolve(repo, '../elyweb/sharehouse');
const OUT = path.join(repo, 'apps/web/public/habom/sharehouse-demo/img');
const used = JSON.parse(fs.readFileSync(path.join(here, 'used-assets.json'), 'utf8'));

const BG_W = 1920;
const STAGE_PX = 1260; // 무대 높이 기준 픽셀(1120px 폭 무대 × 2배 밀도 ≈ 630 × 2)

/**
 * 원본에 밤 배경이 없을 때 쓰는 임시 톤 보정.
 *   tint: 밝기를 낮춘 뒤 푸른 단색조로 바꾸고(게임 UI 목업의 밤 거실 톤), 원래 색을 (1 - mix) 만큼 다시 섞는다.
 *   wash: 살짝 어둡게만(조명이 켜진 방)
 */
const TONES = {
  night: { brightness: 0.34, tint: { r: 110, g: 118, b: 200 }, mix: 0.85 },
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

const BG_H = Math.round((BG_W * 9) / 16);
const fit = (p) => sharp(src(p)).resize(BG_W, BG_H, { fit: 'cover' });

/** 낮 거실(임시 합성): 저녁 거실의 노을빛을 빼고, PV 거실(배경X)의 투명한 창 자리에 낮 하늘을 넣는다 */
async function dayLiving(def) {
  const PVL = '20 제출자료/250504 PV 리소스 전달용/배경 리소스/#1 아파트 거실/소스/#01-거실 (밤) 조명ON (배경X).png';
  const mask = await fit(PVL).extractChannel('alpha').toBuffer();
  const sky = await fit('02 그래픽/01 배경/#2 대학거리/#02-낮.png').removeAlpha().toBuffer();
  // modulate 와 joinChannel 을 한 파이프라인에 두면 순서가 바뀌어 알파가 사라진다 → 두 단계로
  const graded = await fit(def.src).removeAlpha().modulate({ brightness: 1.12, saturation: 0.62 }).png().toBuffer();
  const interior = await sharp(graded).joinChannel(mask).png().toBuffer();
  return sharp(sky).composite([{ input: interior }]);
}

async function background(id, def) {
  let img = fit(def.src);
  if (def.recipe === 'day-living') img = await dayLiving(def);
  else if (def.under) img = sharp(await fit(def.under).removeAlpha().toBuffer()).composite([{ input: await img.png().toBuffer() }]);
  else img = img.removeAlpha();
  const tone = def.tone && TONES[def.tone];
  if (tone?.tint) {
    const resized = await img.png().toBuffer();
    const toned = await sharp(resized).modulate({ brightness: tone.brightness }).tint(tone.tint).png().toBuffer();
    const original = await sharp(resized).modulate({ brightness: tone.brightness * 0.9, saturation: 0.5 }).ensureAlpha(1 - tone.mix).png().toBuffer();
    img = sharp(toned).composite([{ input: original }]).linear(1.08, -6);
  }
  await save(img, `bg/${id}.webp`, 84);
}

async function stand(key) {
  const [char, face] = key.split('/');
  const def = CAST[char];
  const { width, height } = await sharp(src(def.body)).metadata();
  const layers = def.faces[face] ? [{ input: src(def.faces[face]) }] : [];
  const full = await sharp(src(def.body)).composite(layers).png().toBuffer();
  const visible = Math.round(height * cropOf(def));
  const cropped = await sharp(full).extract({ left: 0, top: 0, width, height: visible }).toBuffer();
  const outH = Math.round(STAGE_PX * def.scale * cropOf(def));
  await save(sharp(cropped).resize({ height: outH }), `stand/${char}-${face}.webp`, 86, { alphaQuality: 90 });
}

for (const id of used.bg) await background(id, ASSETS.bg[id]);
for (const id of used.ecg) await save(fit(ASSETS.ecg[id].src).removeAlpha(), `ecg/${id}.webp`, 84);
for (const key of used.stand) await stand(key);
await save(sharp(src(ASSETS.title.src)).resize(BG_W, BG_H, { fit: 'cover', position: 'top' }).removeAlpha(), 'title.webp', 82);
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
