# Studio Elysian (elyweb)

[![English](https://img.shields.io/badge/lang-English-blue.svg)](#english)
[![한국어](https://img.shields.io/badge/lang-한국어-red.svg)](#한국어)

---

<a name="english"></a>
## [English] Project Overview

Studio Elysian is a comprehensive web solution for a game development company, featuring a public-facing website and a powerful administration system.

### 🚀 Tech Stack
- **Frontend (Web):** Next.js 14 (App Router), i18n-next, Tailwind CSS
- **Admin (CMS):** React Admin v5, Vite, ra-supabase
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage)
- **Monorepo Management:** Turborepo, pnpm
- **Testing:** Playwright (E2E)
- **Deployment:** Docker, Nginx

### ✨ Key Features
- **Multi-language Support:** Full localization for Korean, English, and Japanese.
- **Content Management:** Dedicated admin panel to manage games, news, timeline, and company settings.
- **Responsive Design:** Optimized for mobile, tablet, and desktop with dark mode support.
- **Real-time Database:** Seamless integration with Supabase for data and authentication.
- **Self-hostable:** Easy deployment using Docker containers.

---

<a name="한국어"></a>
## [한국어] 프로젝트 개요

스튜디오 엘리시안(Studio Elysian)은 게임 개발사를 위한 종합 웹 솔루션으로, 대중에게 공개되는 웹사이트와 효율적인 콘텐츠 관리를 위한 어드민 시스템을 포함하고 있습니다.

### 🚀 기술 스택
- **Frontend (Web):** Next.js 14 (App Router), i18n-next, Tailwind CSS
- **Admin (CMS):** React Admin v5, Vite, ra-supabase
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage)
- **Monorepo Management:** Turborepo, pnpm
- **Testing:** Playwright (E2E)
- **Deployment:** Docker, Nginx

### ✨ 주요 기능
- **다국어 지원:** 한국어, 영어, 일본어 완벽 지원 (i18n).
- **콘텐츠 관리:** 게임 정보, 뉴스, 타임라인, 회사 설정을 위한 전용 관리자 페이지.
- **반응형 디자인:** 다크 모드를 지원하며 모바일, 태블릿, 데스크톱에 최적화된 UI.
- **실시간 데이터베이스:** Supabase를 통한 실시간 데이터 동기화 및 인증.
- **자체 호스팅 가능:** Docker를 이용한 간편한 배포 환경 구축.

---

## 📂 Project Structure / 프로젝트 구조

```text
elyweb/
├── apps/
│   ├── web/          # Public website (Next.js 14) / 공식 웹사이트
│   └── admin/        # Admin CMS (React Admin v5) / 관리자 패널
├── packages/
│   ├── types/        # Shared TypeScript types / 공통 타입 정의
│   ├── db/           # Supabase client & types / DB 클라이언트 및 타입 생성
│   └── config-tailwind/ # Shared Tailwind config / 공통 테일윈드 설정
├── e2e/              # Playwright E2E tests / 종단간 테스트
├── docker/           # Docker & Nginx configs / 도커 및 엔진엑스 설정
└── supabase/         # DB migrations & schema / 데이터베이스 마이그레이션
```

---

## 🛠 Getting Started / 시작하기

### Prerequisites / 사전 요구사항
- **Node.js:** 18 or higher
- **pnpm:** 8 or higher
- **Supabase:** Account or self-hosted instance

### Installation / 설치
```bash
# Clone the repository / 저장소 복제
git clone https://github.com/onpe5679/elyweb.git
cd elyweb

# Install dependencies / 의존성 설치
pnpm install

# Environment variables / 환경 변수 설정
cp .env.example .env
```

### Development / 개발 실행
```bash
# Start all applications / 전체 앱 실행
pnpm dev

# Filter by application / 특정 앱만 실행
pnpm dev --filter web     # Website only
pnpm dev --filter admin   # Admin only
```

### Building / 빌드
```bash
pnpm build
```

---

## 🔑 Environment Variables / 환경 변수

Configure the following variables in your `.env` file:
`.env` 파일에 다음 변수들을 설정해 주세요:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (Web) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Private) |
| `VITE_SUPABASE_URL` | Supabase project URL (Admin) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (Admin) |

---

## 🗄 Database Setup / 데이터베이스 설정

1. Create a new project in [Supabase](https://supabase.com/).
2. Install Supabase CLI: `npm install -g supabase`
3. Link your project: `supabase link --project-ref your-project-id`
4. Apply migrations / 마이그레이션 적용:
   ```bash
   supabase db push
   ```
5. (Optional) Generate types / 타입 생성:
   ```bash
   pnpm db:generate
   ```

### Schema Overview / 스키마 개요
- `games`: Game titles, descriptions, status, and media.
- `news`: Official announcements and updates.
- `timeline_events`: Company history and milestones.
- `company_settings`: Global settings and configuration.

---

## 🐳 Deployment / 배포

### Docker
Deploy using Docker Compose:
도커 컴포즈를 사용하여 배포합니다:

```bash
docker-compose up -d
```

- **Nginx:** Acts as a reverse proxy for `web` and `admin` apps.
- **SSL:** Configure Let's Encrypt for production environments.

---

## 🛡 Admin Guide / 관리자 가이드

1. **Login:** Access the admin URL and login with your Supabase Auth credentials.
2. **Games:** Create or update game profiles. Supports multi-language fields.
3. **News:** Publish news articles. Toggle `is_published` to make them visible on the website.
4. **Media:** Upload images (covers, banners, gallery) to Supabase Storage and link the URLs.

1. **로그인:** 관리자 URL에 접속하여 Supabase 인증 계정으로 로그인합니다.
2. **게임 관리:** 게임 프로필을 생성하거나 업데이트합니다. 다국어 필드를 지원합니다.
3. **뉴스 관리:** 뉴스 기사를 발행합니다. `is_published` 상태를 변경하여 웹사이트 노출을 제어합니다.
4. **미디어:** 커버, 배너, 갤러리 이미지를 Supabase Storage에 업로드하고 URL을 연결합니다.

---

## 🤝 Contributing / 기여하기

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License / 라이선스

Distributed under the **MIT License**. See `LICENSE` for more information.
본 프로젝트는 **MIT 라이선스**에 따라 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.
