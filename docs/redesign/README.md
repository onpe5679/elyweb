# 리디자인 시안 원격 개발

## 📍 사용할 브랜치

| 목적 | 브랜치 | 시작 문서 |
| --- | --- | --- |
| 구현된 엘리시안·하봄 시안을 이어서 작업 | `design/elysian-redesign` | [시안 검토](prototype-review.md) |
| 기존 시안을 보지 않고 별도의 시안 제작 | `design/independent-brief` | 해당 브랜치 루트의 `DESIGN_BRIEF.md` |

독립 시안은 새 대화와 별도 체크아웃에서 시작한다. `design/independent-brief`는 기준 커밋 `79deebe49826e714d8e26bc727d3e72c770ad68a`의 원본 코드, 사용자 요구사항, 원본 레퍼런스 8장만 포함한다. 구현된 시안이나 캡처는 포함하지 않는다. 원본 대화록 전체는 공개 저장소에 올리지 않았다.

## 🔧 원격 환경에서 실행

아래는 현재 시안을 이어서 작업할 때의 명령이다.

```bash
git clone --single-branch --branch design/elysian-redesign https://github.com/onpe5679/elyweb.git
cd elyweb
corepack enable
pnpm install --frozen-lockfile
cp .env.example apps/web/.env.local
```

Node.js 20 이상과 저장소에 지정된 pnpm 버전을 사용한다. `apps/web/.env.local`의 예시 값을 프로젝트의 실제 환경변수로 설정하거나 원격 작업 환경의 비밀값 설정 기능을 사용한다. 실제 `.env` 파일은 커밋하지 않는다. 공개 웹 데이터에는 Supabase URL·anon key가 필요하고, 서버 API·빌드에는 기존 서버용 설정도 필요할 수 있다. 비밀값은 저장소에 포함하지 않았다.

```bash
pnpm --filter web dev --port 3100
```

원격 개발 환경에서 포트 3100을 포워딩하고, 해당 환경이 발급한 HTTPS 주소로 접속한다. 브라우저를 사용하는 사람의 `localhost`와 원격 서버의 `localhost`는 다르므로 미리보기 주소를 공유할 때 원격 접속 주소를 사용한다. 별도 터널을 쓴다면 화면 검토에 필요한 경로만 제공하고 문의 전송 등 쓰기 작업은 미리보기에서 비활성화할 수 있다.

## 📚 검증과 자료

```bash
pnpm --filter web exec tsc --noEmit --incremental false
pnpm exec playwright install chromium
pnpm exec playwright test --config playwright.redesign.config.ts
pnpm --filter web build
```

빌드와 개발 서버는 동일한 `.next`를 사용하므로 빌드할 때는 개발 서버를 먼저 종료한다. 테스트는 실제 공개 작품 데이터를 읽는다. 원격 환경에서도 동일한 Supabase 프로젝트 설정을 사용해야 현재 작품을 확인할 수 있다.

- [대화에서 확정한 요구사항](meeting-requirements.md)
- [시안 구성·검증 기록](prototype-review.md)
- [시안 캡처](previews/)
- [원본 레퍼런스](references/)

`main`에는 기존 자동 운영 배포가 연결되어 있다. 위 두 브랜치의 푸시는 시안 공유·개발용이며 `main` 병합이나 운영 배포는 수행하지 않았다.
