# 셰어하우스 웹 데모 (미니 체험)

`/[locale]/games/sharehouse#demo` 구역에서 바로 플레이하는 "어서오세요, 셰어하우스에!" 웹 데모.
모달·새 창 없이 페이지 본문 안의 16:9 무대에서 시작한다. 히어로와 하봄 홈의 "미니 체험"은 이 구역으로 이동하는 링크다.

## 구성

```
scripts/sharehouse-demo/
  staging.mjs          연출표(손으로 정한 값): 배경·스탠딩·표정·CG·흔들기·효과음 id, 원본 → 웹 이미지 표,
                       화자 이름/색, 3020 일본어 줄 맞춤표, 일본어 임시 번역
  build-script.mjs     대본 변환 → apps/web/public/habom/sharehouse-demo/data/{ko,en,ja}.json, used-assets.json
  build-images.mjs     이미지 변환(sharp) → apps/web/public/habom/sharehouse-demo/img/**
  lib/xlsx.mjs         의존성 없는 xlsx/csv 리더
  used-assets.json     대본에서 실제로 쓰는 이미지 목록(build-images 입력)
apps/web/components/habom/sharehouse-demo/
  SharehouseDemo.tsx   플레이어(클라이언트 컴포넌트)
  demo.module.css      무대 스타일(게임 UI 재현 + 좁은 화면 배치)
  meta.ts              데모가 있는 slug, 타이틀/로고 경로, 효과음 표(SFX)
  types.ts             데이터 형태
```

다시 만들기(저장소 루트, 원본 폴더는 기본값 `../elyweb/sharehouse`, 다르면 `SHAREHOUSE_SRC=...`):

```
node scripts/sharehouse-demo/build-script.mjs
node scripts/sharehouse-demo/build-images.mjs
```

## 대본

| 장면 | 원본 | 대사 | 배경 | 비고 |
| --- | --- | --- | --- | --- |
| 지혜 · 김치볶음밥 | Scenario 1000 | 147줄 | 거실(저녁) | 63~81행은 요리 ECG |
| 세은 · 새벽 스터디 | Scenario 3020 | 161줄 | 주인공 방(밤) → 거실(밤) → 세은 방 | |

- 한국어·영어: `20260221 백업 _ 20260126 데모 분량 시나리오 번역 내보내기 공간 작업용.xlsx` 의 `1000(수정 완)`, `3020(수정 완)` 시트.
  260126 CSV 보다 새 판본이다(영어가 다듬어져 있고, 3020 CSV 는 영어·일본어·이름 열이 한국어와 몇 줄씩 어긋나 있음).
- 일본어: `260126 데모 분량 시나리오 CSV` 의 Text_Jp.
  - 1000 은 한국어와 줄이 맞아 그대로 쓴다(변환기가 수정본과 CSV 의 한국어를 대조해 다르면 경고).
  - 3020 은 구판 대본 기준 번역이라 줄 순서가 다르다. `staging.mjs` 의 `buildJaMap3020()` 으로 수정본 한국어 줄에 맞췄고,
    원본에 없는 9줄(111, 157~164 — 마지막 대화 포함)은 `JA_DRAFT` 의 **임시 번역**이다. 데이터에 `"draft": true` 로 표시된다. **검수 필요.**
  - 일본어판에 남아 있던 `「セウン」`·`ホン・「セウン」` 은 일본어 이름 `紗夜` 로 바꿨다. `ガチャ…`(타닥타닥 오역) → `（カタカタ）`, `きゃ` → `キィッ`.
  - 3020 일본어는 말투(세은이 반말 `〜しなさいよ`, 주인공이 `〜わね` 등)가 원문과 맞지 않는 줄이 많다. 손대지 않았다.
- 빈 행·`<Blank>` 는 대사로 보여 주지 않고 연출 전환 자리로만 쓴다. `<br>` 는 줄바꿈.
- 연출 키는 시트의 **데이터 행 순번**(머리글 다음 행 = 0). ScriptIndex 는 3020 수정본에서 중복·누락이 있어 쓰지 않는다.
- `<PlayerName>`: 대본 본문에는 나오지 않고 이름표에만 쓰인다. 타이틀 화면의 "주인공 이름" 입력값(최대 10자)을 쓰고,
  비우면 `HabomDemo.defaultName`(나 / Me / 俺).
- 선택지: 두 원본 대본에는 선택지가 없다. 게임 구조(히로인별 시나리오)를 따라 시작할 때 "어느 장면을 볼까요?"에서 장면을 고른다.
  대본에 없는 대사는 만들지 않았다.

### 데이터 형태(`data/{locale}.json`)

```jsonc
{
  "version": 1, "locale": "ko",
  "speakers": { "jihye": { "name": "류지혜", "color": "#F7A35C" }, "saeun": {...}, "unknown": {...} },
  "chapters": [{ "id": "jihye", "cast": "jihye", "source": "1000(수정 완)", "steps": [
    { "n": 11, "text": "에헤~", "who": "jihye", "bg": "living-evening", "stand": "jihye/happy" },
    { "n": 43, "text": "찰팍-", "bg": "living-evening", "stand": "jihye/worry", "fx": "shake", "sfx": "splat" }
  ]}],
  "images": { "bg": { "living-evening": "/habom/sharehouse-demo/img/bg/living-evening.webp" }, "ecg": {...}, "stand": {...} }
}
```

줄마다 장면 상태(bg/stand/ecg)를 풀어 두어 어느 줄로든 바로 이동할 수 있다(백로그·처음부터·미리 불러오기).
`who` 가 없으면 지문(내레이션·속마음), `player` 는 주인공.

## 이미지 (총 1.77MB, WebP)

| 웹 파일 | 원본(`02 그래픽/`) | 처리 |
| --- | --- | --- |
| `bg/living-evening` | `01 배경/#1 아파트 거실/소스/#01-거실 (저녁) 조명OFF (배경O).png` | 1920×1080 |
| `bg/living-night` | 같은 파일 | **임시 밤 톤**(푸른 단색조, 게임 UI 목업의 밤 거실 참고) |
| `bg/room-night` | `01 배경/#3 주인공 방/#03-주인공방(낮).png` | **임시 밤 톤**(창밖 구름은 그대로 보임) |
| `bg/saeun-room` | `01 배경/#99-세은이 방 추가본/#10-세은이 방 추가(저녁).png` | 살짝 어둡게 |
| `ecg/jihye-cooking` | `00 ECG/99 IngameResource/지혜_요리_기본_보정.png` | 1920×1080 |
| `stand/jihye-*` (7) | `00 SCG/Jihye/지혜_잠옷_흥미_없음.png` + `Resource/Face/{base,Smile,Fear,Panic_B,fatigue,사연3}.png` | 몸 + 표정 합성 |
| `stand/saeun-*` (6) | `00 SCG/Saeun/세은_잠옷_기본_없음.png` + `Resource/Face/{Kidding,Panic,Tired,sad,surprised}.png` | 몸 + 표정 합성 |
| `title` | `00 ECG/00 Special/메인화면 CG/메인화면 일러스트하늘X_인쇄용.png` | 타이틀 화면 |
| `logo` | `03 etc/Logo/로고.png` | |

- 표정 id: 지혜 `interest`(몸 그림 기본) `happy` `smile` `worry` `cry` `grin` `awkward`, 세은 `base` `grin` `startled` `tired` `pout` `surprised` (`teary` 는 표에만 있고 미사용).
- 스탠딩 구도는 게임 UI 목업 `99 old result/UXUI/2024.09 Renewal/Text/00 Mergeimage_Dark_Off.png` 를 따랐다:
  캔버스(2393×4700)를 화면 높이의 160% 로, 위쪽을 화면 위에 맞춤 → 보이는 위쪽 62.5% 만 잘라 1400px 높이로 내보낸다.
  지혜 `Base/` 폴더(금발 니트)는 현행 디자인과 달라 쓰지 않았다(요리 ECG·표정 파츠는 잠옷 스탠딩 기준).
- 대사창: 같은 목업처럼 상자 없이 아래쪽 그라데이션 + 캐릭터 색 이름(세은 `#7BD4E7` 은 `TextNameSaeun.png` 색, 지혜·주인공 색은 임의) + 흰 대사.
- 불러오기: 대본 JSON 은 구역이 화면 600px 앞에 오면 받는다. 타이틀 그림은 `loading="lazy"`. 장면 고르기 화면에서 두 장면의 첫 그림을,
  진행 중에는 다음 6줄의 그림을 미리 받는다.

### 이미지 바꾸기

1. `staging.mjs` 의 `ASSETS` 에서 해당 id 의 `src` 를 새 원본으로 바꾼다(밤 배경이 생기면 `tone` 을 지운다).
2. 표정을 추가하려면 `ASSETS.stand.<캐릭터>.faces` 에 id 와 파츠 경로를 넣고, 연출표(`CHAPTERS[].stage`)에서 `face: '<id>'` 로 쓴다.
3. `build-script.mjs` → `build-images.mjs` 순서로 다시 돌린다. 안 쓰게 된 webp 는 자동으로 지워진다.

## 플레이어

- 진행: 무대 클릭/탭, 또는 무대(진행 버튼)에 포커스가 있을 때 Enter·Space. 타자 중에 누르면 문장만 완성한다.
  무대 밖에 포커스가 있으면 키를 가로채지 않는다(페이지 스크롤 유지). 포커스 이동은 사용자가 버튼을 눌렀을 때만, `preventScroll`.
- 무대 아래(하봄 스타일): 진행률(`n / 전체`), 자동, 빨리 넘기기(누르면 엔딩까지 빠르게, 무대를 누르면 멈춤), 대사 기록(Escape 로 닫힘),
  이 장면 처음부터, 장면 선택.
- 엔딩 카드: Steam 에서 이어서(작품의 Steam 스토어 링크가 있을 때) · 다른 장면 보기 · 처음부터.
- `prefers-reduced-motion`: 타자 효과·흔들기·페이드 없음.
- 접근성: 대사는 `aria-live="polite"` 로 "화자: 대사" 를 알림, 선택지·컨트롤은 버튼, 포커스 링 표시. 진행률은 `role="progressbar"`.
- 좁은 화면(무대 폭 600px 미만): 16:9 그림 아래에 대사·선택지·엔딩 카드를 둔다.

## 소리(나중에 붙이기)

음성·BGM·효과음은 권리 확인 전이라 넣지 않았다. 효과음 자리는 데이터의 `sfx` 에 남아 있다:
`doorlock`(도어락), `door`(문), `splat`(계란), `crash`(그릇), `phone`(전화), `typing`(폰 타자).

- 효과음: 파일을 `apps/web/public/habom/sharehouse-demo/sfx/` 에 두고 `meta.ts` 의 `SFX` 에 `{ door: '/habom/sharehouse-demo/sfx/door.mp3' }` 처럼 적으면
  해당 줄에서 재생한다(빨리 넘기기 중에는 생략).
- 음성: 원본 행의 `ScriptGuid` 를 키로 쓰는 것을 권장 — 변환기에서 step 에 guid 를 넣고 플레이어에서 줄이 바뀔 때 재생하면 된다.
- BGM: 장면(chapter)별 한 곡이면 `staging.mjs` 의 CHAPTERS 에 `bgm` 을 두는 정도로 충분하다. 자동 재생 정책 때문에 첫 클릭 후 시작해야 한다.

## 남은 일

- 3020 일본어 임시 번역 9줄과 일본어 말투 검수, 3020 일본어 원본을 수정본 대본 기준으로 다시 번역할지 결정.
- 밤 배경 3종은 톤 보정 임시본. 주인공 방(밤)·거실(밤) 원본이 있으면 교체.
- 지혜·주인공 이름 색, 표정 배치는 임의로 정했다. 기획 확인 필요.
- 요리 ECG(노출이 있는 일러스트)를 웹 데모에 쓸지 최종 확인.
- 효과음·음성 권리 확인 후 연결.
