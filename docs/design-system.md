# 디자인 시스템 — "원고(原稿)"

스튜디오 엘리시안 독립 리디자인 시안(`design/my-independent-concept`)의 디자인 규칙입니다.
코드는 `apps/web`(Next.js 14 + next-intl + Tailwind), 토큰은 `apps/web/app/globals.css`에 있습니다.

## 1. 컨셉

종이 위에 놓인 글자와 도판. 원고지 칸, 잉크 마커, 얇은 괘선으로 "이야기를 만드는 스튜디오"의 정체성과 신뢰감을 만들고, 여러 작품의 일러스트가 서로의 색을 해치지 않도록 **종이(여백)** 가 무대가 됩니다.

- **전체가 세로쓰기가 아닙니다.** 본문은 모두 가로쓰기. (회의에서 세로쓰기에 부정적 반응이 있었음)
- **특정 게임 한 편의 사이트처럼 보이지 않게**: 색은 종이/잉크/코발트로 중립을 유지하고 작품 색은 도판 안에서만 나타납니다.
- 첫 화면은 **책 표지 = 게임 타이틀 화면**(원고지 칸 타이틀 + 목차형 메뉴 + 겹쳐진 도판 스트립).

## 2. 브랜드와 테마

| 브랜드 | 선택자 | 분위기 |
| --- | --- | --- |
| 엘리시안(기본) | `:root` | 흰 종이(#F5F5F1) + 블루블랙 잉크 + 코발트(#2B44B8), 각진 모서리 |
| 하봄 | `[data-brand="habom"]` | 연한 핑크(#F78FAE) 메인 + 버터 옐로(#FFE08A) 서브, 둥근 서체(Jua / Gowun Dodum), 알약·둥근 카드, 스티커 |

테마는 둘 다 지원합니다: **종이(밝음)** 이 기본, **밤(어두움)** 은 헤더의 토글(`html[data-theme="night"]`, localStorage `se-theme`).

색은 RGB 3값 토큰(`--c-paper`, `--c-ink`, `--c-accent` …)이고 Tailwind 에서는 `bg-paper`, `text-ink-2`, `border-ink/15` 처럼 씁니다.
리터럴 색(`#fff` 등)을 컴포넌트에 직접 쓰지 마세요. (이미지 위 흰 글자처럼 이미지 위에서만 예외)

하봄 영역을 엘리시안 페이지 안에 넣을 때(관문 섹션 등)는 해당 `div` 에 `data-brand="habom"` 만 붙이면 토큰이 바뀝니다.

## 3. 서체

| 역할 | 엘리시안 | 하봄 |
| --- | --- | --- |
| 제목(display) | Hahmlet 800 (ja: Shippori Mincho) | Jua |
| 본문 읽기(serif) | Hahmlet / Shippori Mincho | Gowun Dodum |
| UI(sans) | Noto Sans KR / JP | Gowun Dodum / M PLUS Rounded 1c |
| 카탈로그 번호·캡션(mono) | IBM Plex Mono | 동일 |

한글은 `break-keep`(단어 단위 줄바꿈)을 기본으로 합니다. 한글에는 이탤릭을 쓰지 않습니다(가짜 이탤릭이 보기 나쁨).

## 4. 공통 부품

| 부품 | 위치 | 용도 |
| --- | --- | --- |
| `Cells` | `components/ui/Cells.tsx` | 원고지 칸 타이포. `filled` 로 역상, `indent` 로 들여쓰기 |
| `.marker` / `.marker--outline` / `.marker--accent` | globals.css | 시리즈·상태 라벨(잉크 마커) |
| `StatusMarker` | `components/ui/StatusMarker.tsx` | 출시/개발 중 등 상태 |
| `.plate` + `.plate__img` | globals.css | 도판(얇은 괘선 액자). 하봄에서는 둥글고 그림자가 생김 |
| `.btn` / `.btn--ghost` / `.btn--accent` | globals.css | 버튼. 하봄에서는 알약 + 눌리는 그림자 |
| `.t-display` `.t-eyebrow` `.t-prose` | globals.css | 제목 / 영문 소제목(mono) / 본문(serif, 줄 간격 2.0) |
| `.link-u` | globals.css | 밑줄이 그어지는 텍스트 링크 |
| `.sticker` `.blob` `.bob` | globals.css | 하봄 장식 |
| `Shell` | `components/shell/Shell.tsx` | 모든 페이지의 틀. `<Shell brand="elysian|habom" locale={locale}>` |
| `useFocusTrap` | `components/ui/useFocusTrap.ts` | 모달류의 포커스 트랩 + Esc + 스크롤 잠금 |

## 5. 레이아웃 규칙

- 최대 폭 `max-w-page`(88rem), 좌우 `px-5 md:px-10`.
- 섹션 사이는 `border-t border-ink/15` 한 줄 + `py-20 md:py-28`.
- 12칸 그리드에서 비대칭(5:7)을 기본으로 하고, 가운데 정렬은 쓰지 않습니다.
- 움직임은 한 곳에 모읍니다: 표지의 칸 등장·스트립 펼침, 도판 hover 확대. `prefers-reduced-motion` 이면 모두 꺼집니다.

## 6. 다국어

- `messages/<locale>/<area>.json` 영역별 파일을 `i18n/request.ts` 가 합칩니다: `common`, `home`, `works`, `habom`, `pages`.
- 새 문구는 **ko/en/ja 세 파일 모두** 추가하세요. `node scripts/check-i18n.mjs` 가 코드의 키와 세 로케일을 대조합니다.
- 페이지는 `setRequestLocale(locale)` 을 호출하고 서버 컴포넌트에서 `getTranslations('<Namespace>')` 를 씁니다.

## 7. 접근성

- 모든 인터랙션은 키보드로 가능해야 하고 `:focus-visible` 스타일이 있습니다(globals.css 전역).
- 모달은 `role="dialog" aria-modal="true"` + `useFocusTrap`, Esc 로 닫고 원래 요소로 포커스를 돌려줍니다.
- 장식(원고지 칸 글자 등)은 `aria-hidden`, 전체 문구는 `aria-label`/`sr-only` 로 한 번만 읽힙니다.
