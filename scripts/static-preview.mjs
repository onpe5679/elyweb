#!/usr/bin/env node
// Builds a static, relocatable copy of the web app for sharing the design preview on a static
// host that serves it under an unknown sub-path (e.g. a claude.ai artifact).
//
//   node scripts/static-preview.mjs            → apps/.static-preview/site
//
// It exports a copy of apps/web with `output: 'export'` (no middleware, no API routes), then
// rewrites every root-absolute URL to a page-relative one and adds a small click handler so
// internal links load the exported HTML files instead of going through the Next.js router.
// The real deployment is unaffected; nothing here runs in production.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'apps/web');
// Same depth as apps/web so the relative pnpm symlinks in node_modules still resolve.
const APP = path.join(ROOT, 'apps/.static-preview');
const SITE = path.join(APP, 'site');
const PREFIX = 'https://static-preview.invalid';

const run = (cmd, opts = {}) => execSync(cmd, { stdio: 'inherit', ...opts });

// 1. Copy the app without build output and the large legacy uploads folder
fs.rmSync(APP, { recursive: true, force: true });
run(`cp -a "${SRC}" "${APP}"`);
for (const p of ['.next', 'public/uploads', 'middleware.ts', 'app/api', 'app/[locale]/(elysian)/news/[slug]']) {
  fs.rmSync(path.join(APP, p), { recursive: true, force: true });
}
fs.writeFileSync(
  path.join(APP, 'next.config.mjs'),
  `import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();
export default withNextIntl({ output: 'export', trailingSlash: true, assetPrefix: '${PREFIX}', images: { unoptimized: true } });
`,
);

// 2. Export (without Supabase credentials, so the bundled content snapshot is used)
const env = { ...process.env, NEXT_PUBLIC_STATIC_PREVIEW: '1', NEXT_TELEMETRY_DISABLED: '1' };
delete env.NEXT_PUBLIC_SUPABASE_URL;
delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
run('npx next build', { cwd: APP, env });

// 3. Rewrite into a relocatable site
const OUT = path.join(APP, 'out');
fs.rmSync(SITE, { recursive: true, force: true });
run(`cp -a "${OUT}" "${SITE}"`);

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
const files = walk(SITE);

// Next's RSC payload files are only used for client-side navigation, which the preview does not use.
for (const f of files.filter((f) => f.endsWith('.txt'))) fs.rmSync(f);

const ASSET_DIRS = ['_next/', 'snapshot/', 'brand/'];
// Hosts may reserve top-level names starting with "_", so Next's "_next" folder ships as "assets".
const ASSETS = 'assets';

function pageHref(target) {
  let [p, hash = ''] = target.split('#');
  p = p.split('?')[0].replace(/^\//, '');
  if (!/\.[a-z0-9]+$/i.test(p)) p = (p && !p.endsWith('/') ? `${p}/` : p) + 'index.html';
  return p + (hash ? `#${hash}` : '');
}

function clickHandler(root, page) {
  // Runs before React: internal links become plain document loads of the exported files. Links
  // re-rendered on the client can lose their locale prefix (the host path does not start with
  // /ko), so the current page's locale is added back. RSC prefetches are left pending (there is no RSC
  // server, and links never use the client router here).
  return `<script>(function(){var R=${JSON.stringify(root)},P=${JSON.stringify(page)};
var L=P.split('/')[0];
function to(h){var i=h.indexOf('#'),x=i<0?'':h.slice(i);h=(i<0?h:h.slice(0,i)).split('?')[0].replace(/^\\//,'');if(!/^(ko|en|ja)(\\/|$)/.test(h))h=L+'/'+h;if(!/\\.[a-z0-9]+$/i.test(h))h=(h&&h.slice(-1)!=='/'?h+'/':h)+'index.html';return R+h+x;}
var F=window.fetch;window.fetch=function(u){var s=String(u&&u.url||u);if(s.indexOf('_rsc=')>-1||/\\.txt(\\?|$)/.test(s))return new Promise(function(){});return F.apply(this,arguments);};
window.addEventListener('click',function(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;var a=e.target.closest&&e.target.closest('a[href]');if(!a||(a.target&&a.target!=='_self'))return;var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||/^[a-z][a-z0-9+.-]*:/i.test(h)||h.indexOf('//')===0)return;e.preventDefault();e.stopPropagation();var l=a.getAttribute('data-locale');location.href=l?R+P.replace(/^(ko|en|ja)\\//,l+'/'):h.charAt(0)==='/'?to(h):h;},true);})();</script>`;
}

for (const file of files.filter((f) => f.endsWith('.html'))) {
  const rel = path.relative(SITE, file).split(path.sep).join('/');
  const depth = rel.split('/').length - 1;
  const root = depth ? '../'.repeat(depth) : './';
  let html = fs.readFileSync(file, 'utf8');

  html = html.split(`${PREFIX}/_next/`).join(`${root}${ASSETS}/`);
  // Remaining references (the router's assetPrefix) become the relative site root
  html = html.split(PREFIX).join(root.replace(/\/$/, ''));
  // Attributes: assets keep their path, pages point at the exported index.html files
  html = html.replace(/(\s(?:href|src|action)=")\/(?!\/)([^"]*)"/g, (m, attr, target) => {
    if (ASSET_DIRS.some((d) => target.startsWith(d)) || /\.(png|jpe?g|webp|avif|svg|ico|css|js|woff2?)$/i.test(target)) return `${attr}${root}${target}"`;
    return `${attr}${root}${pageHref(target)}"`;
  });
  // Image paths inside the serialized React props, so images mounted later (lightbox, demo) resolve too
  for (const d of ['snapshot/', 'brand/']) {
    html = html.split(`\\"/${d}`).join(`\\"${root}${d}`).split(`"/${d}`).join(`"${root}${d}`);
  }
  // Tell the webpack runtime where chunks live, and install the link handler
  const boot = `<script>self.__SP_ASSET__=new URL(${JSON.stringify(`${root}${ASSETS}/`)},document.baseURI).href</script>${clickHandler(root, rel)}`;
  html = html.replace(/<head>/, `<head>${boot}`);
  fs.writeFileSync(file, html);
}

for (const file of files.filter((f) => f.endsWith('.js'))) {
  let js = fs.readFileSync(file, 'utf8');
  // Some hosts reject a literal U+FFFD; Next's polyfills only use it inside string literals.
  if (js.includes('\uFFFD')) fs.writeFileSync(file, (js = js.split('\uFFFD').join('\\ufffd')));
  if (!js.includes(PREFIX)) continue;
  js = js.split(`"${PREFIX}/_next/"`).join('(self.__SP_ASSET__||"/_next/")');
  fs.writeFileSync(file, js);
}
for (const file of files.filter((f) => f.endsWith('.css'))) {
  let css = fs.readFileSync(file, 'utf8');
  css = css.split(`${PREFIX}/_next/static/`).join('../');
  fs.writeFileSync(file, css);
}

// Some static hosts mishandle "[" "]" "(" ")" in file paths, so route-segment folders in chunk
// paths get plain names: app/[locale]/(elysian)/… → app/param-locale/group-elysian/…
const safeSeg = (seg) => seg.replace(/^\[(.+)\]$/, 'param-$1').replace(/^\((.+)\)$/, 'group-$1');
const renames = [];
for (const file of walk(path.join(SITE, '_next/static/chunks/app'))) {
  const rel = path.relative(SITE, file).split(path.sep);
  const safe = rel.map(safeSeg);
  if (safe.join('/') === rel.join('/')) continue;
  const dest = path.join(SITE, ...safe);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(file, dest);
  // References read "static/chunks/app/…" (script tags and the RSC payload), so match from "chunks/"
  renames.push([rel.slice(2).map((seg) => encodeURI(seg)).join('/'), safe.slice(2).join('/')]);
}
for (const file of walk(SITE).filter((f) => /\.(html|js)$/.test(f))) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  for (const [from, to] of renames) text = text.split(from).join(to);
  if (text !== before) fs.writeFileSync(file, text);
}
const prune = (dir) => { for (const d of fs.readdirSync(dir, { withFileTypes: true })) if (d.isDirectory()) prune(path.join(dir, d.name)); if (!fs.readdirSync(dir).length) fs.rmdirSync(dir); };
prune(path.join(SITE, '_next/static/chunks/app'));

// Build bookkeeping that the exported pages never request
for (const f of ['404.html', '404']) fs.rmSync(path.join(SITE, f), { recursive: true, force: true });
for (const f of walk(path.join(SITE, '_next'))) {
  if (/(_buildManifest|_ssgManifest)\.js$|\/pages\/_(app|error)-|\/app\/_not-found\//.test(f)) fs.rmSync(f);
}
prune(path.join(SITE, '_next'));
fs.renameSync(path.join(SITE, '_next'), path.join(SITE, ASSETS));

const left = walk(SITE).filter((f) => /\.(html|js|css)$/.test(f) && fs.readFileSync(f, 'utf8').includes(PREFIX));
console.log(`\nstatic preview → ${path.relative(ROOT, SITE)} (${walk(SITE).length} files)${left.length ? `\nUNREWRITTEN PREFIX in: ${left.join(', ')}` : ''}`);
