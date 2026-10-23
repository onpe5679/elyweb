#!/usr/bin/env python3
"""Usage: python3 build-static.py SOURCE_REPO editorial|paseo OUTPUT_WORKDIR
Requires installed source dependencies and apps/web/.env.local with public Supabase config.
Copies source first; never edits it. Output: OUTPUT_WORKDIR/out. Contains published CMS snapshot.
"""
from pathlib import Path
import shutil,sys,subprocess,os
source=Path(sys.argv[1]).resolve()/'apps/web';name=sys.argv[2];work=Path(sys.argv[3]).resolve();tools=Path(__file__).resolve().parent
assert name in ['editorial','paseo'] and not work.exists(), 'Use a new output directory'
shutil.copytree(source,work,ignore=shutil.ignore_patterns('node_modules','.next','.omc','tsconfig.tsbuildinfo','.env*'))
os.symlink(source/'node_modules',work/'node_modules')
# Build configuration stays private; only /out is publishable.
shutil.copy2(source/'.env.local',work/'.env.local')
shutil.rmtree(work/'app/api',ignore_errors=True);(work/'middleware.ts').unlink(missing_ok=True)
with open(tools/(name+'.patch')) as f:subprocess.run(['patch','-p1'],cwd=work,stdin=f,check=True)
subprocess.run([str(work/'node_modules/.bin/next'),'build'],cwd=work,check=True,env={**os.environ,'NEXT_TELEMETRY_DISABLED':'1'})
subprocess.run(['python3',str(tools/'postprocess.py'),str(work/'out'),name],check=True)
