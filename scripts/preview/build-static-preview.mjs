// 정적 미리보기 빌드: 서버·DB 없이 어디서든 열어 볼 수 있는 사이트 묶음을 만든다.
//   node scripts/preview/build-static-preview.mjs
// 결과: .preview-build/site  (루트 index.html → /ko/)
//
// 하는 일
//  1) apps/web 을 .preview-build/web 으로 복사(api 라우트·업로드 이미지 제외) → next build (output: export)
//  2) `_next` 폴더 이름을 `nx` 로 바꾼다(일부 호스팅은 `_` 로 시작하는 경로를 예약함)
//  3) 링크 클릭을 명시적 `…/index.html` 이동으로 바꾸는 preview-nav.js 를 모든 페이지에 넣는다
// 운영 배포·DB 변경과 무관하며, 스냅샷 데이터(환경변수 없음)로만 빌드한다.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const work = path.join(root, '.preview-build');
const src = path.join(root, 'apps/web');
const web = path.join(work, 'web');
const site = path.join(work, 'site');

const run = (cmd, args, opts = {}) =>
  new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
    p.on('exit', (c) => (c === 0 ? res() : rej(new Error(`${cmd} ${args.join(' ')} → ${c}`))));
  });

await fs.rm(work, { recursive: true, force: true });
await fs.mkdir(work, { recursive: true });

const skip = new Set(['node_modules', 'tsconfig.tsbuildinfo']);
await fs.cp(src, web, {
  recursive: true,
  filter: (p) => {
    const rel = path.relative(src, p);
    if (!rel) return true;
    const top = rel.split(path.sep)[0];
    if (skip.has(top) || top.startsWith('.next')) return false;
    if (rel === path.join('app', 'api') || rel.startsWith(path.join('app', 'api') + path.sep)) return false;
    if (rel === path.join('public', 'uploads') || rel.startsWith(path.join('public', 'uploads') + path.sep)) return false;
    return true;
  },
});
await fs.symlink(path.join(src, 'node_modules'), path.join(web, 'node_modules'), 'dir');

await run(path.join(src, 'node_modules/.bin/next'), ['build'], {
  cwd: web,
  env: {
    ...process.env,
    PREVIEW_EXPORT: '1',
    NEXT_PUBLIC_STATIC_PREVIEW: '1',
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_PUBLIC_SUPABASE_URL: '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
  },
});

// ---- 후처리 ----
await fs.cp(path.join(web, 'out'), site, { recursive: true });
await fs.rename(path.join(site, '_next'), path.join(site, 'nx'));
await fs.rm(path.join(site, '_not-found'), { recursive: true, force: true });

const walk = async (d) =>
  (await fs.readdir(d, { withFileTypes: true })).flatMap((e) => (e.isDirectory() ? [] : [path.join(d, e.name)]).concat([]));
async function* files(d) {
  for (const e of await fs.readdir(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) yield* files(p);
    else yield p;
  }
}
void walk;

const HUB = `
/* 시안 허브로 돌아가는 작은 버튼(정적 미리보기에서만) */
(function () {
  function add() {
    if (document.getElementById('preview-hub-pill')) return;
    var a = document.createElement('a');
    a.id = 'preview-hub-pill';
    a.href = '/index.html';
    a.textContent = '← 시안 허브';
    a.setAttribute('aria-label', 'Studio Elysian 시안 허브로 돌아가기');
    a.style.cssText = 'position:fixed;left:max(12px,env(safe-area-inset-left,0px));bottom:max(12px,env(safe-area-inset-bottom,0px));z-index:70;padding:8px 14px;font:700 12px/1 system-ui,sans-serif;letter-spacing:.02em;color:#fff;background:rgba(17,19,26,.86);border:1px solid rgba(255,255,255,.35);border-radius:999px;text-decoration:none;backdrop-filter:blur(6px)';
    document.body.appendChild(a);
  }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
`;

const NAV = `/* 정적 미리보기용: 내부 링크를 명시적 index.html 이동으로 바꿔 어느 호스팅에서도 열리게 한다. */
(function () {
  function target(a) {
    var u = new URL(a.getAttribute('href'), location.href);
    if (u.origin !== location.origin) return null;
    if (/\\.[a-z0-9]+$/i.test(u.pathname) && !/\\.html$/i.test(u.pathname)) return null;
    var p = u.pathname.replace(/index\\.html$/, '');
    if (!/\\.html$/i.test(p)) p = p.replace(/\\/?$/, '/') + 'index.html';
    return p + u.search + u.hash;
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|https?:\\/\\/)/.test(href) && new URL(href).origin !== location.origin) return;
    var t = target(a);
    if (!t) return;
    var cur = new URL(t, location.href);
    if (cur.pathname === location.pathname && cur.search === location.search) {
      // 같은 문서 안의 해시 이동은 브라우저에 맡긴다
      if (cur.hash) return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    location.href = t;
  }, true);
})();
`;
await fs.writeFile(path.join(site, 'preview-nav.js'), NAV + HUB);

// 대괄호가 든 경로 조각([locale] 등)은 일부 호스팅에서 문제가 되므로 이름을 바꾼다.
const bracket = new Map();
for await (const f of files(site)) {
  for (const seg of path.relative(site, f).split(path.sep)) {
    const m = seg.match(/^\[(\.\.\.)?([^\]]+)\]$/);
    if (m) bracket.set(seg, m[2]);
  }
}
const renameBrackets = async (dir) => {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    let p = path.join(dir, e.name);
    const m = e.name.match(/^\[(\.\.\.)?([^\]]+)\]$/);
    if (m) {
      const np = path.join(dir, m[2]);
      await fs.rename(p, np);
      p = np;
    }
    if (e.isDirectory()) await renameBrackets(p);
  }
};
await renameBrackets(site);

let count = 0, bytes = 0;
for await (const f of files(site)) {
  const ext = path.extname(f);
  const st = await fs.stat(f);
  count++; bytes += st.size;
  if (!['.html', '.js', '.css', '.txt', '.json', '.map', '.svg'].includes(ext)) continue;
  let text = await fs.readFile(f, 'utf8');
  const before = text;
  text = text.replaceAll('/_next/', '/nx/');
  // 일부 호스팅은 U+FFFD(대체 문자)가 든 텍스트 파일을 거부한다(폴리필 청크에 리터럴로 들어 있음) → 같은 뜻의 이스케이프로 바꾼다.
  if (ext === '.js' && text.includes('\uFFFD')) text = text.replaceAll('\uFFFD', '\\uFFFD');
  for (const [seg, name] of bracket) {
    text = text.replaceAll(seg, name).replaceAll(encodeURIComponent(seg), name);
  }
  if (ext === '.html') {
    text = text.replace('</head>', '<script src="/preview-nav.js"></script></head>');
  }
  if (text !== before) await fs.writeFile(f, text);
}

// 루트: 한국어 홈으로
await fs.writeFile(
  path.join(site, 'index.html'),
  '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=ko/index.html"><title>Studio Elysian</title></head><body><a href="ko/index.html">Studio Elysian</a></body></html>'
);
console.log(`\n정적 미리보기: ${count}개 파일, ${(bytes / 1024 / 1024).toFixed(1)}MB → ${path.relative(root, site)}`);
