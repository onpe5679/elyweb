from pathlib import Path
import re,sys
root=Path(sys.argv[1]);prefix='/elyweb/previews/'+sys.argv[2]
# Raw HTML image/source paths and values serialized into React payloads/chunks.
for p in root.rglob('*'):
 if not p.is_file() or p.suffix not in ['.html','.js','.css','.json','.txt','.svg']: continue
 s=p.read_text(); old=s
 s=re.sub(r'(?<=[\"\'(`])/(images|uploads)/',lambda m:prefix+'/'+m[1]+'/',s)
 if p.suffix=='.html': s=s.replace('</head>',f'<meta name="robots" content="noindex,nofollow"><script src="{prefix}/review-preview.js"></script></head>')
 if s!=old:p.write_text(s)
(root/'review-preview.js').write_text('''(()=>{const prefix=PREFIX;document.addEventListener('click',e=>{if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;const a=e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download'))return;let u=new URL(a.href);if(u.origin!==location.origin)return;if(/^\/(ko|en|ja)(\/|$)/.test(u.pathname))u.pathname=prefix+u.pathname;if(!u.pathname.startsWith(prefix+'/'))return;if(!/\.[^/]+$/.test(u.pathname))u.pathname=u.pathname.replace(/\/?$/,'/');if(u.pathname===location.pathname&&u.hash)return;e.preventDefault();e.stopImmediatePropagation();location.href=u.href},true);document.addEventListener('DOMContentLoaded',()=>{const a=document.createElement('a');a.href='/elyweb/';a.textContent='← 시안 모음';a.style.cssText='position:fixed;bottom:16px;left:16px;z-index:9999;padding:10px 16px;background:#252820;color:white;border-radius:30px;font:600 12px system-ui;text-decoration:none;box-shadow:0 2px 16px #0003';document.body.appendChild(a)})})();'''.replace('PREFIX',repr(prefix)))
(root/'index.html').write_text(f'<!doctype html><html lang="ko"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url={prefix}/ko/"><title>Studio Elysian 시안</title><a href="{prefix}/ko/">시안 열기</a></html>')
(root/'.nojekyll').touch()
print(root)
