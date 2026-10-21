# 콘텐츠 스냅샷

Supabase 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)가 **없을 때** 웹이 읽는 읽기 전용 데이터입니다.
환경변수가 있으면 스냅샷은 쓰이지 않고 실제 DB가 그대로 쓰입니다(`apps/web/lib/supabase.ts` 의 `isSnapshotMode`).

- `apps/web/lib/snapshot/*.json` : 운영 사이트(https://www.studioelysian.co) 공개 페이지에서 만든 작품·섹션·설정·팀·연혁. DB 행과 같은 모양입니다.
- `apps/web/public/snapshot/**` : 같은 사이트의 이미지를 webp 로 줄인 사본(원본 업로드 폴더는 건드리지 않음).
- 장르(`genre_*`)는 운영 DB 컬럼이 공개 HTML 에 드러나지 않아 공개 설명문에 근거해 채운 값입니다.

## 다시 만들기

```bash
python3 scripts/snapshot/build_snapshot.py [--cache DIR]   # 공개 페이지를 GET 만 한다(쓰기 없음)
node scripts/snapshot/optimize-images.mjs [--cache DIR]    # images.manifest.json 의 이미지를 webp 로
```

필요: Python 3 + `beautifulsoup4`/`lxml`, Node 18+, `pnpm install`(sharp).
