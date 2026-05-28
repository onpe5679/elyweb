# 어드민 편집화 & 콘텐츠 정비 — 구현 계획

> **For agentic workers:** 이 계획은 `docs/superpowers/specs/2026-05-28-admin-editability-content-design.md` spec을 구현한다. 단계별로 진행하고 각 단계 끝에 타입체크/빌드 + (가능 시) Playwright E2E로 검증한다.

**Goal:** 하드코딩된 사이트 콘텐츠(비전/통계/SNS/연혁/썸네일/개인정보/새소식)를 어드민에서 편집 가능하게 만들고 죽은 링크·잘못된 뱃지를 정비한다.

**Architecture:** 기존 `company_settings`(다국어 key-value) + react-admin `SettingsEdit`(비이미지 키는 자동 다국어 멀티라인 입력) 재사용. 구조 필요한 것만 컬럼 추가(`timeline_events.show_on_home`, `games.thumbnail_image`). 웹은 settings 값을 읽되 없으면 기존 i18n/하드코딩 fallback. 어드민 저장 시 dataProvider가 웹 `/api/revalidate` 자동 호출.

**Tech Stack:** Next.js(App Router, next-intl) · react-admin(Vite) · Supabase(Postgres) · Playwright

---

## 환경 준비 (사장님 협조 필요 — Option A)

- `apps/web/.env.local` 과 `apps/admin/.env.local` 생성. 키:
  - web: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, (선택)`RESEND_API_KEY`
  - admin: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_WEB_API_URL=http://localhost:3000`
- 마이그레이션 `003_genre_series_i18n.sql` ~ `011_editable_content.sql`이 대상 DB에 적용돼야 함.
- E2E 인증용: `ADMIN_TEST_EMAIL`, `ADMIN_TEST_PASSWORD` (실제 어드민 로그인 계정).

## File Structure

| 파일 | 역할 |
|---|---|
| `supabase/migrations/011_editable_content.sql` | 신규: show_on_home, thumbnail_image, settings 키 시드 |
| `packages/types/src/settings.ts` | SettingKey 신규 키 추가 |
| `packages/types/src/game.ts` | `thumbnail_image` 추가 |
| `packages/types/src/timeline.ts` | `show_on_home` 추가 |
| `apps/web/lib/supabase.ts` | Game/TimelineEvent 타입 + getStatusTagColor + getHomeTimelineEvents |
| `apps/web/app/[locale]/page.tsx` | settings fetch 확장, Vision/Stats props 전달, 홈 연혁 필터 |
| `apps/web/components/sections/VisionSection.tsx` | settings 기반 title/body |
| `apps/web/components/sections/StatsBar.tsx` | props 기반 4통계(값+라벨) |
| `apps/web/components/sections/TimelineSection.tsx` | slice 제거, viewAll → /about |
| `apps/web/components/sections/ProjectsSection.tsx` + `games/GameCard.tsx` | thumbnail_image 사용 |
| `apps/web/components/layout/Footer.tsx` | 죽은 링크 제거, 빈 SNS 숨김, privacy → /privacy |
| `apps/web/app/[locale]/layout.tsx` | footer settings 가짜 fallback 제거 |
| `apps/web/app/[locale]/privacy/page.tsx` | 신규: 개인정보처리방침 |
| `apps/web/app/[locale]/games/page.tsx` | IP(시리즈) 필터 드롭다운 |
| `apps/web/app/[locale]/news/page.tsx` + `components/news/XTimeline.tsx` | 모드 분기 + X 위젯 |
| `apps/web/messages/{ko,en,ja}.json` | Footer 링크 정리, Timeline/Stats 라벨 |
| `apps/admin/src/resources/timeline/TimelineCreate.tsx` + `TimelineEdit.tsx` | show_on_home BooleanInput |
| `apps/admin/src/resources/games/GameCreate.tsx` + `GameEdit.tsx` | thumbnail_image ImageInput |
| `apps/admin/src/resources/settings/SettingsEdit.tsx` | news_display_mode SelectInput 특수처리 |
| `e2e/content-editing.spec.ts` | 신규: 비전 편집 E2E(오타 수정) |

---

## Phase 1 — 즉시 수정 (저위험)

### Task 1.1: NOW AVAILABLE 뱃지 보라 박스
- Modify: `apps/web/lib/supabase.ts` `getStatusTagColor`
- `released: 'bg-black/80'` → `released: 'bg-primary/90'` (운영자 명시 요청: in_development와 동일 보라톤)

### Task 1.2: 전체 연혁 보기 링크 + slice 정리
- Modify: `apps/web/components/sections/TimelineSection.tsx`
- `<a href="#">` → next-intl `Link href="/about"`. `events.slice(0,3)` 제거(이미 홈 전용 데이터로 필터링되므로 — Task 3.1 이후). 단계 순서상 1.2에서는 href만 고치고 slice는 3.1에서 제거.

### Task 1.3: 푸터 죽은 링크 제거
- Modify: `apps/web/components/layout/Footer.tsx` — 채용정보(`/careers`), FAQ(`/faq`), 제휴문의(`/partnership`), 이용약관(`href="#"` terms) 링크 제거. 바로가기=회사소개/프로젝트/새소식, 문의=문의하기만 유지.
- Modify: `apps/web/messages/{ko,en,ja}.json` — `Footer.links.careers`, `Footer.contactLinks.faq`, `Footer.contactLinks.partnership`, `Footer.terms` 키 제거.

### 검증
- `pnpm --filter web build` 통과. (env 없으면 런타임 fetch는 빈 배열 fallback — 빌드는 통과해야 함)
- 커밋: `feat(web): 뱃지 보라박스, 푸터 죽은링크 제거, 전체연혁 링크`

---

## Phase 2 — 어드민 편집화 (settings 확장)

### Task 2.1: 마이그레이션 011 작성
- Create: `supabase/migrations/011_editable_content.sql`
```sql
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS show_on_home boolean NOT NULL DEFAULT false;
ALTER TABLE games ADD COLUMN IF NOT EXISTS thumbnail_image text;

INSERT INTO company_settings (key, value_ko, value_en, value_ja) VALUES
  ('vision_title', NULL, NULL, NULL),
  ('vision_body', NULL, NULL, NULL),
  ('stat_year_value', '2022', NULL, NULL),
  ('stat_year_label', '설립 연도', 'Founded', '設立年'),
  ('stat_projects_value', '3+', NULL, NULL),
  ('stat_projects_label', '진행 프로젝트', 'Projects', 'プロジェクト'),
  ('stat_released_value', NULL, NULL, NULL),
  ('stat_released_label', '출시 프로젝트', 'Released Titles', 'リリースタイトル'),
  ('stat_global_value', 'Global', NULL, NULL),
  ('stat_global_label', '스팀 출시', 'Steam', 'Steam配信'),
  ('twitter_url', 'https://x.com/_StudioElysian', NULL, NULL),
  ('instagram_url', 'https://www.instagram.com/_studioelysian/', NULL, NULL),
  ('youtube_url', NULL, NULL, NULL),
  ('contact_email', NULL, NULL, NULL),
  ('privacy_policy', NULL, NULL, NULL),
  ('news_display_mode', 'manual', NULL, NULL),
  ('news_widget_x_handle', '_StudioElysian', NULL, NULL)
ON CONFLICT (key) DO NOTHING;
```

### Task 2.2: 타입 추가
- Modify: `packages/types/src/settings.ts` SettingKey에 신규 키 추가(vision_body, stat_*_value/label, privacy_policy, news_display_mode, news_widget_x_handle).
- Modify: `packages/types/src/game.ts` `thumbnail_image?: string`.
- Modify: `packages/types/src/timeline.ts` `show_on_home: boolean`.
- Modify: `apps/web/lib/supabase.ts` Game 타입에 `thumbnail_image?`, TimelineEvent에 `show_on_home?`.

### Task 2.3: 비전 문구 settings화
- Modify: `apps/web/components/sections/VisionSection.tsx` — props `visionTitle?`, `visionBody?` 추가. title 있으면 사용 else `t('title')`. body 있으면 빈 줄(`\n\n`)로 split해 `<p>` 렌더, 없으면 기존 `t('p1'/p2/p3)`.
- Modify: `apps/web/app/[locale]/page.tsx` — getSettings 키에 `vision_title`,`vision_body` 추가, `getLocalizedSettingValue`로 추출해 VisionSection에 전달.

### Task 2.4: 통계바 settings화
- Modify: `apps/web/components/sections/StatsBar.tsx` — props로 4쌍(value+label) 받음. 각 fallback은 기존 하드코딩.
- Modify: `apps/web/app/[locale]/page.tsx` — stat_* 키 fetch해 전달.
- (선택) `apps/web/app/[locale]/about/page.tsx` 하드코딩 통계도 동일 settings로 정렬(296% Funding 제거).

### Task 2.5: SNS 링크 fallback 정리
- Modify: `apps/web/app/[locale]/layout.tsx` — `|| 'https://twitter.com/...'` 등 가짜 fallback 제거(빈 문자열로). (값은 011에서 시드됨)

### 검증
- `pnpm build` + 타입체크. 커밋: `feat: 비전/통계/SNS 어드민 편집화 + 마이그레이션 011`

---

## Phase 3 — 스키마 기능 (연혁/썸네일/IP/개인정보)

### Task 3.1: 연혁 메인/소개 분리
- Modify: `apps/web/lib/supabase.ts` — `getHomeTimelineEvents()` 추가(`.eq('show_on_home', true)`). 기존 `getTimelineEvents` = 전체(about용).
- Modify: `apps/web/app/[locale]/page.tsx` — `getHomeTimelineEvents()` 사용.
- Modify: `apps/web/components/sections/TimelineSection.tsx` — `events.slice(0,3)` 제거(필터된 데이터 그대로).
- Modify: `apps/admin/src/resources/timeline/TimelineCreate.tsx` + `TimelineEdit.tsx` — `<BooleanInput source="show_on_home" label="메인 노출" />`.

### Task 3.2: 게임 썸네일 분리
- Modify: `apps/web/components/sections/ProjectsSection.tsx` — GameCard image = `game.thumbnail_image || game.cover_image || ''`.
- Modify: `apps/admin/src/resources/games/GameCreate.tsx` + `GameEdit.tsx` — `thumbnail_image` ImageInput 추가(기존 cover_image 패턴 동일).

### Task 3.3: IP(시리즈) 드롭다운
- Create: `apps/web/components/games/SeriesFilter.tsx` (client) — series 목록 드롭다운, 선택 시 필터.
- Modify: `apps/web/app/[locale]/games/page.tsx` — 게임을 SeriesFilter로 감싸 클라이언트 필터링. (games 페이지 현재 구조 확인 후 반영)

### Task 3.4: 개인정보처리방침
- Create: `apps/web/app/[locale]/privacy/page.tsx` — `getSetting('privacy_policy')` 본문 렌더(whitespace-pre-line). 값 없으면 기본 안내문.
- Modify: `apps/web/components/layout/Footer.tsx` — 개인정보 링크 `href="#"` → `/privacy`.

### 검증
- `pnpm build`. 커밋: `feat: 연혁 분리/게임 썸네일/IP 드롭다운/개인정보처리방침`

---

## Phase 4 — 새소식 X 위젯 + 토글

### Task 4.1: X 타임라인 컴포넌트
- Create: `apps/web/components/news/XTimeline.tsx` (client) — `news_widget_x_handle`로 X 타임라인 위젯 임베드(공식 `platform.twitter.com/widgets.js`). 로드 실패/빈 핸들 시 안내.

### Task 4.2: 새소식 모드 분기
- Modify: `apps/web/app/[locale]/news/page.tsx` — `getSetting('news_display_mode')`/`news_widget_x_handle` fetch. `widget`=XTimeline만, `manual`=기존 카드, `both`=XTimeline 섹션 + 카드 섹션.
- Modify: `apps/admin/src/resources/settings/SettingsEdit.tsx` — `news_display_mode` 키는 `SelectInput`(widget/manual/both)로 특수처리.

### 검증
- `pnpm build`. 커밋: `feat: 새소식 X위젯 임베드 + 표시모드 토글`

---

## Phase 5 — 실전 E2E 검증 (Option A)

### Task 5.1: 환경 가동
- 사장님이 `.env.local`(web/admin) 작성 + 마이그레이션 적용 + 어드민 계정 확인.
- web: `pnpm --filter web dev`(3000), admin: `pnpm --filter admin dev`(5175) 기동 확인.

### Task 5.2: 비전 오타 수정 E2E
- Create: `e2e/content-editing.spec.ts` — 어드민 로그인 → Settings → `vision_body` 편집 → **현재 "우주공감" 텍스트를 운영자 확정 교정문구로 교체** → 저장 → 웹 `/ko` 재검증 → 비전 문구에 교정문구 노출 & "우주공감" 미존재 assert.
- 교정 문자열은 저장 직전 현재값을 사장님께 보여드리고 확정받는다(추정 금지).
- Run: `ADMIN_TEST_EMAIL=... ADMIN_TEST_PASSWORD=... pnpm test:e2e e2e/content-editing.spec.ts`

### Task 5.3: 회귀 확인
- 기존 `e2e/home.spec.ts`, `games.spec.ts`, `navigation.spec.ts` 통과 확인.

---

## Self-Review 체크
- spec 10개 항목 ↔ Task 매핑: 1→2.3, 2→2.4, 3→1.1, 4→1.2/3.1, 5→3.2, 6→3.3, 7→2.5/2.1, 8→1.3, 9→3.4, 10→4.x ✅
- 마이그레이션은 idempotent(IF NOT EXISTS / ON CONFLICT) — 재적용 안전.
- 미결: youtube_url(빈값=숨김), 우주공감 교정문구(5.2에서 확정), about페이지 통계 정렬(2.4 선택), games 페이지 현 구조(3.3 구현 시 확인).
