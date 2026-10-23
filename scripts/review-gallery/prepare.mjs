// Run after copying each static export into review-gallery/previews/<id>.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../review-gallery');
const entries = JSON.parse(fs.readFileSync(path.join(root, 'data.json'), 'utf8'));
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
for (const entry of entries) {
  const dir = path.join(root, 'previews', entry.id);
  for (const file of walk(dir).filter(f => f.endsWith('.html'))) {
    let html = fs.readFileSync(file, 'utf8');
    if (!html.includes('name="robots"')) html = html.replace('</head>', '<meta name="robots" content="noindex,nofollow"></head>');
    if (!html.includes('← 시안 모음')) html = html.replace('</body>', `<a id="review-gallery-return" href="/elyweb/#${entry.id}" target="_top" style="position:fixed;right:16px;bottom:16px;z-index:2147483647;padding:11px 17px;border:1px solid #d9d5cb;border-radius:999px;background:#fffef9;color:#242820;font:600 13px/1.4 system-ui,sans-serif;text-decoration:none;box-shadow:0 3px 18px #0002" aria-label="${entry.label} 검토를 마치고 시안 모음으로">← 시안 모음 · ${entry.label}</a></body>`);
    fs.writeFileSync(file, html);
  }
}
fs.writeFileSync(path.join(root,'.nojekyll'),'');
fs.writeFileSync(path.join(root,'robots.txt'),'User-agent: *\nDisallow: /\n');
console.log('Prepared gallery exports; source designs unchanged.');
