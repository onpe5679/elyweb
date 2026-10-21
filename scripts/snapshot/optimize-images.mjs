// images.manifest.json 에 적힌 원본을 내려받아(또는 --cache 에서 찾아) 웹용 webp 로 변환한다.
//   node scripts/snapshot/optimize-images.mjs [--cache DIR]
// 결과: apps/web/public/snapshot/<folder>/<uuid>.webp  (원본 업로드 폴더는 건드리지 않는다)
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sharp = require(path.join(root, 'apps/web/node_modules/sharp'));

const cacheArg = process.argv.indexOf('--cache');
const cacheDir = cacheArg > -1 ? process.argv[cacheArg + 1] : null;
const manifest = JSON.parse(await fs.readFile(path.join(root, 'apps/web/lib/snapshot/images.manifest.json'), 'utf8'));
sharp.cache(false);

for (const [local, url] of Object.entries(manifest)) {
  const out = path.join(root, 'apps/web/public', local);
  await fs.mkdir(path.dirname(out), { recursive: true });
  const base = path.basename(url);
  let buf;
  const repoLocal = path.join(root, 'apps/web/public', url.replace(/^https?:\/\/[^/]+/, '').replace(/^\/storage\/v1\/object\/public/, ''));
  for (const cand of [cacheDir && path.join(cacheDir, base), repoLocal]) {
    if (!cand) continue;
    try { buf = await fs.readFile(cand); break; } catch {}
  }
  if (!buf) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
  }
  const meta = await sharp(buf, { limitInputPixels: false }).metadata();
  const isLogo = local.includes('/company_settings/') && (meta.width ?? 0) <= 2000 && meta.hasAlpha;
  const maxW = isLogo ? 640 : meta.height > meta.width ? 1100 : 1800;
  const pipeline = sharp(buf, { limitInputPixels: false }).rotate().resize({ width: maxW, withoutEnlargement: true });
  const info = await (isLogo ? pipeline.webp({ lossless: true }) : pipeline.webp({ quality: 80, effort: 5 })).toFile(out);
  console.log(local.padEnd(80), `${meta.width}x${meta.height}`.padEnd(11), '->', `${info.width}x${info.height}`.padEnd(11), `${Math.round(info.size / 1024)}KB`);
}
