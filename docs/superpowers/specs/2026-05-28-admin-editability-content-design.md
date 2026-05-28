# 스튜디오 엘리시안 사이트 — 어드민 편집화 & 콘텐츠 정비 설계

작성일: 2026-05-28
대상 리포: `elyweb` (apps/web = Next.js 공개 사이트, apps/admin = react-admin, packages/db = Supabase, supabase/migrations)

## 1. 배경 / 목표

공개 사이트의 여러 콘텐츠가 코드에 하드코딩되어 있어 운영자가 어드민에서 수정하지 못한다. 또 일부 푸터 링크는 대상 페이지가 없는 죽은 링크이고, SNS 링크는 잘못된 fallback URL이 노출된다. 본 작업의 목표:

1. 하드코딩된 콘텐츠를 어드민 편집 가능하게 전환
2. 잘못된/죽은 링크 정비
3. 새로운 어드민 편집 항목 추가(연혁 분리, 게임 썸네일, IP별 드롭다운, 새소식 표시 모드)

## 2. 현재 상태 요약

| # | 항목 | 현재 | 비고 |
|---|---|---|---|
| 1 | 비전 문구("우주공감" 오타 포함) | `apps/web/messages/*.json`의 `Vision.*` 하드코딩, `VisionSection.tsx` 렌더 | 어드민 편집 불가 |
| 2 | 통계바(설립연도/프로젝트/펀딩296%/Global) | `StatsBar.tsx` 하드코딩 | 어드민 편집 불가 |
| 3 | NOW AVAILABLE 뱃지 | `getStatusTagColor` released=`bg-black/80` → 어두운 배경에 묻힘 | IN DEVELOPMENT는 `bg-primary/90`(보라) |
| 4 | 연혁(메인 3개 / 회사소개 전체) | 둘 다 `timeline_events` 동일 테이블 공유, "전체 연혁 보기"=`href="#"` 죽은 링크 | 분리 불가 |
| 5 | 게임 이미지 | 목록 카드·대표게임 모두 `cover_image` 공용 (`banner_image` 별도 존재) | 썸네일 분리 불가 |
| 6 | works IP(시리즈) 필터 | 없음. `games.series_ko/en/ja` 데이터는 존재 | 신규 |
| 7 | 푸터 SNS 링크 | `company_settings`(twitter_url 등)에 연결돼 있으나 DB값이 비어 fallback URL 노출 | layout.tsx에 가짜 fallback 존재 |
| 8 | 푸터 바로가기/문의 | 채용정보·FAQ·제휴문의 = 대상 페이지 없는 죽은 링크 | 제거 대상 |
| 9 | 개인정보처리방침·이용약관 | 둘 다 `href="#"` 죽은 링크 | 결정: 개인정보만 제작, 약관 제거 |
| 10 | 새소식 | 수동 작성만, "출처" 개념 없음 | X 위젯 임베드 + 수동 + 토글 |

## 3. 설계 원칙 / 접근

**접근법 A 채택:** 기존 `company_settings`(key-value 다국어: key, value_ko/en/ja) + 어드민 `SettingsEdit`를 적극 재사용. 구조가 꼭 필요한 곳(연혁 메인노출 플래그, 게임 썸네일 필드)만 컬럼/마이그레이션 추가. 새 전용 테이블은 만들지 않는다(YAGNI).

- 웹 컴포넌트는 settings 값을 읽되, **값이 없으면 기존 i18n/기존 동작으로 fallback** → 점진 전환, 무중단.
- 다국어가 필요한 텍스트는 settings의 value_ko/en/ja 활용.

## 4. 데이터 모델 변경

### 4.1 `company_settings` 신규/활성 키
| key | 용도 | 형식 |
|---|---|---|
| `vision_title` | 비전 제목("무궁한 이야기의 지평선") | 다국어 텍스트 |
| `vision_body` | 비전 본문(문단은 빈 줄로 구분) — 여기서 "우주공감" 오타 수정 | 다국어 멀티라인 |
| `stat_year_value` / `stat_year_label` | 통계1: 설립연도 값(2022) + 라벨(설립 연도) | 다국어 텍스트 |
| `stat_projects_value` / `stat_projects_label` | 통계2: 진행 프로젝트 값(3+) + 라벨 | 다국어 텍스트 |
| `stat_released_value` / `stat_released_label` | 통계3: **출시 프로젝트** 값 + 라벨(펀딩 달성률 대체) | 다국어 텍스트 |
| `stat_global_value` / `stat_global_label` | 통계4: 값(Global) + 라벨(스팀 출시) | 다국어 텍스트 |
| `twitter_url` | X 링크 = https://x.com/_StudioElysian | URL |
| `instagram_url` | IG 링크 = https://www.instagram.com/_studioelysian/ | URL |
| `youtube_url` | (미정, 비우면 아이콘 숨김) | URL |
| `contact_email` | 이메일 | 텍스트 |
| `privacy_policy` | 개인정보처리방침 본문 | 다국어 멀티라인 |
| `news_display_mode` | `widget` / `manual` / `both` | 텍스트(select) |
| `news_widget_x_handle` | X 타임라인 위젯 계정(`_StudioElysian`) | 텍스트 |

> 펀딩 통계 교체: 4개 통계 모두 **값 + 라벨**을 settings로 어드민 편집. 기존 3번 슬롯(펀딩 달성률 296%) → `stat_released_label`("출시 프로젝트") + `stat_released_value`(출시작 수). 값/라벨 없으면 기존 i18n/하드코딩 fallback.

### 4.2 스키마 컬럼 추가 (신규 마이그레이션 `011_*.sql`)
```sql
ALTER TABLE timeline_events ADD COLUMN show_on_home boolean NOT NULL DEFAULT false;
ALTER TABLE games ADD COLUMN thumbnail_image text;  -- 목록용 썸네일(없으면 cover_image fallback)
-- company_settings 신규 키 INSERT (값 NULL; 운영자가 어드민에서 채움)
```
- `show_on_home`: 메인 연혁 = `show_on_home = true`만, 회사소개 = 전체. 기존 데이터 마이그레이션 시 상위 N개를 true로 시드할지 결정(기본 false → 운영자가 어드민에서 체크).

## 5. 항목별 상세 설계

1. **비전 문구** — `VisionSection`이 `vision_title`/`vision_body` settings를 받아 렌더. `vision_body`는 빈 줄로 split해 문단 렌더. 값 없으면 기존 i18n. page.tsx에서 settings fetch에 키 추가.
2. **통계바** — `StatsBar`를 props 기반으로 변경, page.tsx가 4개 통계의 `stat_*_value` + `stat_*_label`(settings, 없으면 i18n/하드코딩 fallback) 전달. 3번 슬롯 펀딩 달성률 → 출시 프로젝트(라벨·값 모두 어드민 편집).
3. **뱃지 박스** — `apps/web/lib/supabase.ts`의 `getStatusTagColor`에서 `released: 'bg-black/80'` → `bg-primary/90`. 운영자가 "IN DEVELOPMENT처럼 보라박스"를 명시 요청했으므로 in_development와 동일 보라톤으로 통일한다.
4. **연혁 분리** — `timeline_events.show_on_home` 추가. 메인 fetch는 `show_on_home=true` 필터(또는 전용 함수). "전체 연혁 보기" 버튼 `href` → `/{locale}/about`. 어드민 TimelineCreate/Edit에 `BooleanInput show_on_home`.
5. **썸네일 분리** — `games.thumbnail_image` 추가. `ProjectsSection`의 GameCard image = `thumbnail_image || cover_image`. 상세/대표 배너는 기존 유지. 어드민 GameCreate/Edit에 썸네일 ImageInput 추가.
6. **IP 드롭다운** — works(게임 목록) 페이지 상단에 series 필터 드롭다운(클라이언트 컴포넌트). "전체" + 시리즈 목록. 선택 시 해당 series 게임만 표시. series는 `getLocalizedField(game,'series',locale)`로 그룹화.
7. **SNS 링크** — `twitter_url`=X, `instagram_url` 시드 후 어드민 입력. layout.tsx의 가짜 fallback 제거. Footer는 **URL이 빈 SNS 아이콘은 렌더 안 함**(youtube 비면 숨김).
8. **푸터 정리** — 채용정보·FAQ·제휴문의·이용약관 링크와 관련 i18n/마크업 제거. 바로가기엔 회사소개/프로젝트/새소식 유지, 문의엔 문의하기 유지.
9. **개인정보처리방침** — `privacy_policy` setting + `app/[locale]/privacy/page.tsx` 신규(본문 렌더). 푸터 개인정보 링크 → `/privacy`. 이용약관 제거.
10. **새소식** — `news_display_mode`로 분기: `manual`=기존 수동 카드, `widget`=X 타임라인 위젯 임베드(`news_widget_x_handle`), `both`=둘 다(위젯 섹션 + 수동 카드 섹션, 인터리브 아님). 어드민 SettingsEdit에서 모드 select. X 임베드는 공식 widgets.js 사용(불안정 가능성 인지).

## 6. 어드민(apps/admin) 변경
- `SettingsEdit`: 신규 텍스트 키 자동 노출. `news_display_mode`는 select(widget/manual/both)로 처리. 멀티라인 키(vision_body, privacy_policy) 멀티라인 입력.
- `timeline/`: Create/Edit에 `show_on_home` BooleanInput.
- `games/`: Create/Edit에 `thumbnail_image` ImageInput.
- `news/`: 기존 수동 작성 유지(변경 없음).

## 7. 단계 계획
- **1단계(즉시):** 뱃지 색(3), 푸터 죽은 링크 제거(8), 전체 연혁 보기 링크(4 일부), 이용약관 제거(9 일부)
- **2단계(settings 확장):** 비전(1), 통계(2), SNS 링크(7)
- **3단계(스키마):** 연혁 분리(4), 썸네일(5), IP 드롭다운(6), 개인정보처리방침(9)
- **4단계(새소식):** X 위젯 + 모드 토글(10)

## 8. 테스트 / 검증

**원칙(운영자 요청):** 어드민 편집 기능은 **Playwright로 실제 어드민 페이지를 구동해 E2E 검증**한다. DB/i18n 직접 수정으로 우회하지 않는다.

- 대표 시나리오: 어드민 로그인 → 비전 `vision_body` 편집 → **"우주공감" 오타 수정** → 저장 → 공개 사이트에서 수정문구 노출 & "우주공감" 미존재 확인.
- 정확한 교정 문자열은 저장 직전 현재값을 보여주고 운영자에게 확정받는다(임의 추정 금지).
- `e2e/` + `playwright.config.ts` 기존 인프라 활용.
- **선행 요건:** Playwright E2E 실행에는 admin+web 구동 및 Supabase 백엔드(.env: URL/anon/service key)가 필요 → 구현 단계에서 로컬/스테이징 구성 확인 필요.

## 9. 필요 입력값 / 미결
- 유튜브 URL(미정 → 당분간 숨김)
- "우주공감" 정확한 교정 표기 — Playwright 수정 시 운영자 확정
- 연혁 `show_on_home` 초기 시드 대상(기본 false로 두고 어드민에서 지정할지)
- 새소식 `both` 모드 레이아웃: 위젯 위/수동 아래 2섹션(인터리브 아님)으로 확정

## 10. 범위 밖 (Out of scope / YAGNI)
- 트위터/X API 자동 동기화(유료·승인·취약)
- 채용정보·FAQ·제휴문의 페이지 신설
- 이용약관 페이지
- 위젯과 수동 글의 단일 피드 병합(시간순 인터리브)
- X/IG/YT 외 추가 SNS 플랫폼
