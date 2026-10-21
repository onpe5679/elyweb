// 코드에서 쓰는 번역 키가 ko/en/ja 에 모두 있는지, 세 로케일의 키 집합이 같은지 확인한다.
//   node scripts/check-i18n.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../apps/web');
const AREAS = ['common', 'home', 'works', 'habom', 'pages'];
const LOCALES = ['ko', 'en', 'ja'];

const messages = Object.fromEntries(
  LOCALES.map((l) => [l, Object.assign({}, ...AREAS.map((a) => JSON.parse(fs.readFileSync(path.join(root, 'messages', l, `${a}.json`), 'utf8'))))])
);

const flatten = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? flatten(v, p + k + '.') : [p + k]));
const keys = Object.fromEntries(LOCALES.map((l) => [l, new Set(flatten(messages[l]))]));

let errors = 0;
// 1) 로케일 간 키 일치
for (const a of LOCALES) for (const b of LOCALES) {
  if (a === b) continue;
  for (const k of keys[a]) if (!keys[b].has(k)) { console.error(`✗ ${b} 에 없음: ${k} (${a} 에는 있음)`); errors++; }
}

// 2) 코드에서 쓰는 키
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (f.name === 'node_modules' || f.name === '.next') continue;
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(f.name)) files.push(p);
  }
})(path.join(root));

let used = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const re = /const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*(?:\{\s*[^}]*namespace:\s*)?['"]([\w.]+)['"]/g;
  let m;
  while ((m = re.exec(src))) {
    const [, v, ns] = m;
    const call = new RegExp(`(?<![\\w.])${v}\\(\\s*(['"\`])([^'"\`]+)\\1`, 'g');
    let c;
    while ((c = call.exec(src))) {
      const key = c[2];
      if (key.includes('${')) continue; // 동적 키는 건너뜀
      used++;
      const full = `${ns}.${key}`;
      for (const l of LOCALES) {
        if (!keys[l].has(full)) { console.error(`✗ ${path.relative(root, file)}: ${full} 가 ${l} 에 없음`); errors++; }
      }
    }
  }
}
console.log(`${used}개 키 확인, 로케일 ${LOCALES.join('/')} · 오류 ${errors}개`);
process.exit(errors ? 1 : 0);
