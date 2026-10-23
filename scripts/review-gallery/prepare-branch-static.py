#!/usr/bin/env python3
"""Run once on a fresh exported site: script SITE literary|manuscript [BASE=/elyweb]."""
from pathlib import Path
import re,sys
root=Path(sys.argv[1]);kind=sys.argv[2];base=(sys.argv[3] if len(sys.argv)>3 else '/elyweb').rstrip('/');prefix=base+'/previews/'+kind
if kind=='manuscript':
 for f in root.rglob('*'):
  if not f.is_file() or f.suffix not in ['.html','.js','.css','.txt','.json','.svg']:continue
  s=f.read_text()
  for asset in ['nx/','snapshot/','favicon.svg','preview-nav.js']:s=s.replace('/'+asset,prefix+'/'+asset)
  if f.suffix=='.html':s=re.sub(r'((?:href|action)=")/(?!/|'+re.escape(base.lstrip('/'))+r'/)([^"\s]*)',lambda m:m[1]+prefix+'/'+m[2],s)
  if f.name=='preview-nav.js':
   s=s.replace("a.href = '/index.html';","a.href = '"+base+"/';")
   old="var p = u.pathname.replace(/index\\.html$/, '');"
   new=old+" if(p.indexOf('"+base+"/')!==0){var locale=(location.pathname.match(/\\/(ko|en|ja)(?:\\/|$)/)||[])[1]||'ko';if(!/^\\/(ko|en|ja)(\\/|$)/.test(p))p='/'+locale+p;p='"+prefix+"'+p;}"
   s=s.replace(old,new)
  f.write_text(s)
else:
 (root/'index.html').write_text('<!doctype html><html lang="ko"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=ko/index.html"><a href="ko/index.html">시안 보기</a></html>')
for f in root.rglob('*.html'):
 s=f.read_text().replace('<head>','<head><meta name="robots" content="noindex,nofollow,noarchive">')
 if kind=='literary':s=s.replace('</body>','<a href="'+base+'/" target="_top" style="position:fixed;left:12px;bottom:12px;z-index:99999;padding:9px 14px;border-radius:99px;background:#222;color:#fff;font:700 12px system-ui;text-decoration:none">← 시안 모음</a></body>')
 f.write_text(s)
