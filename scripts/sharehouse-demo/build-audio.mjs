// 웹 데모 소리 변환기: 원본 WAV/MP3 → MP3(ffmpeg + libmp3lame). build-script.mjs 를 먼저 돌린 뒤 실행.
//
//   node scripts/sharehouse-demo/build-audio.mjs            (저장소 루트에서)
//
// MP3 를 고른 이유: Chrome·Firefox·Safari(데스크톱·모바일)와 Playwright 의 Chromium 까지 모두 재생된다.
// (AAC/m4a 는 오픈소스 Chromium 빌드에서 재생되지 않는다.)
//   BGM  : 스테레오 128kbps, 앞뒤 무음 제거 없이 그대로(루프 재생)
//   음성 : 모노 64kbps, 앞뒤 무음 정리, 음량 맞춤(EBU R128 -16 LUFS)
//   효과음: 모노 96kbps
// 출력: apps/web/public/habom/sharehouse-demo/audio/{bgm,voice,sfx}/*.mp3
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { AUDIO } from './staging.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const SRC = process.env.SHAREHOUSE_SRC || path.resolve(repo, '../elyweb/sharehouse');
const OUT = path.join(repo, 'apps/web/public/habom/sharehouse-demo/audio');
const used = JSON.parse(fs.readFileSync(path.join(here, 'used-assets.json'), 'utf8'));

const PRESET = {
  bgm: ['-ac', '2', '-ar', '44100', '-b:a', '128k'],
  voice: ['-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5', '-ac', '1', '-ar', '44100', '-b:a', '64k'],
  sfx: ['-ac', '1', '-ar', '44100', '-b:a', '96k'],
};

const written = [];
for (const kind of ['bgm', 'voice', 'sfx']) {
  for (const id of used[kind]) {
    const src = path.join(SRC, AUDIO[kind][id]);
    if (!fs.existsSync(src)) throw new Error(`원본 없음: ${src}`);
    const out = path.join(OUT, kind, `${id}.mp3`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-map_metadata', '-1', ...PRESET[kind], '-codec:a', 'libmp3lame', out]);
    written.push([path.relative(OUT, out), Math.round(fs.statSync(out).size / 1024)]);
  }
}

const keep = new Set(written.map(([r]) => r));
(function walk(d) {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (!keep.has(path.relative(OUT, p))) fs.rmSync(p);
  }
})(OUT);

for (const [r, k] of written) console.log(`  ${String(k).padStart(5)} KB  ${r}`);
console.log(`✓ ${written.length}개, 합계 ${(written.reduce((s, [, k]) => s + k, 0) / 1024).toFixed(2)} MB → ${OUT}`);
