# Studio Elysian (elyweb)

[![English](https://img.shields.io/badge/lang-English-blue.svg)](#english)
[![한국어](https://img.shields.io/badge/lang-한국어-red.svg)](#한국어)

---

<a name="english"></a>
## [English] Project Overview

Studio Elysian is a comprehensive web solution for a game development company, featuring a public-facing website and a powerful administration system.

### 🚀 Tech Stack
- **Frontend (Web):** Next.js 14 (App Router), next-intl, Tailwind CSS
- **Admin (CMS):** React Admin v5, Vite, ra-supabase
- **Backend/Database:** Supabase (PostgreSQL, Auth)
- **Image Storage:** Local filesystem (self-hosted friendly)
- **Monorepo Management:** Turborepo, pnpm
- **Testing:** Playwright (E2E)
- **Deployment:** Docker, Nginx, Cloudflare Tunnel compatible

### ✨ Key Features
- **Multi-language Support:** Full localization for Korean, English, and Japanese (ko/en/ja).
- **Content Management:** Dedicated admin panel to manage games, news, timeline, and company settings.
- **Responsive Design:** Optimized for mobile, tablet, and desktop with dark mode support.
- **Real-time Database:** Seamless integration with Supabase for data and authentication.
- **Local Image Upload:** Images stored on local filesystem - perfect for home server deployment.
- **Self-hostable:** Easy deployment using Docker containers with Cloudflare Tunnel support.

---

<a name="한국어"></a>
## [한국어] 프로젝트 개요

스튜디오 엘리시안(Studio Elysian)은 게임 개발사를 위한 종합 웹 솔루션으로, 대중에게 공개되는 웹사이트와 효율적인 콘텐츠 관리를 위한 어드민 시스템을 포함하고 있습니다.

### 🚀 기술 스택
- **Frontend (Web):** Next.js 14 (App Router), next-intl, Tailwind CSS
- **Admin (CMS):** React Admin v5, Vite, ra-supabase
- **Backend/Database:** Supabase (PostgreSQL, Auth)
- **이미지 저장소:** 로컬 파일시스템 (자체 호스팅 최적화)
- **Monorepo Management:** Turborepo, pnpm
- **Testing:** Playwright (E2E)
- **Deployment:** Docker, Nginx, Cloudflare Tunnel 호환

### ✨ 주요 기능
- **다국어 지원:** 한국어, 영어, 일본어 완벽 지원 (ko/en/ja).
- **콘텐츠 관리:** 게임 정보, 뉴스, 타임라인, 회사 설정을 위한 전용 관리자 페이지.
- **반응형 디자인:** 다크 모드를 지원하며 모바일, 태블릿, 데스크톱에 최적화된 UI.
- **실시간 데이터베이스:** Supabase를 통한 실시간 데이터 동기화 및 인증.
- **로컬 이미지 업로드:** 이미지를 로컬 파일시스템에 저장 - 홈 서버 배포에 최적화.
- **자체 호스팅 가능:** Docker와 Cloudflare Tunnel을 이용한 간편한 배포 환경 구축.

---

## 📂 Project Structure / 프로젝트 구조

```text
elyweb/
├── apps/
│   ├── web/                    # Public website (Next.js 14) / 공식 웹사이트
│   │   ├── app/
│   │   │   ├── [locale]/       # i18n routes (ko/en/ja)
│   │   │   └── api/
│   │   │       └── upload/     # Image upload API endpoint
│   │   ├── lib/
│   │   │   └── supabase.ts     # Supabase client & helper functions
│   │   ├── components/         # React components
│   │   └── public/
│   │       └── uploads/        # Uploaded images storage
│   │           ├── games/      # Game cover/banner images
│   │           └── news/       # News article images
│   └── admin/                  # Admin CMS (React Admin v5) / 관리자 패널
│       └── src/
│           ├── components/
│           │   ├── LocalizedInput.tsx      # Multi-language text input
│           │   └── LocalizedArrayInput.tsx # Multi-language array input (genres)
│           ├── resources/
│           │   ├── games/      # Game CRUD components
│           │   ├── news/       # News CRUD components
│           │   └── timeline/   # Timeline CRUD components
│           └── dataProvider.ts # Custom data provider with image upload
├── packages/
│   ├── types/                  # Shared TypeScript types / 공통 타입 정의
│   ├── db/                     # Supabase client & types / DB 클라이언트
│   └── config-tailwind/        # Shared Tailwind config / 테일윈드 설정
├── e2e/                        # Playwright E2E tests / 종단간 테스트
├── docker/                     # Docker & Nginx configs / 도커 설정
└── supabase/
    └── migrations/             # Database migrations
        ├── 001_initial.sql
        ├── 002_news_timeline.sql
        └── 003_genre_series_i18n.sql  # Multi-language genre/series
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
# Edit .env with your Supabase credentials
```

### Development / 개발 실행
```bash
# Start all applications / 전체 앱 실행
pnpm dev

# Access points:
# - Web:   http://localhost:3000
# - Admin: http://localhost:5175

# Filter by application / 특정 앱만 실행
pnpm dev --filter web     # Website only (port 3000)
pnpm dev --filter admin   # Admin only (port 5175)
```

### Building / 빌드
```bash
pnpm build
```

---

## 🔑 Environment Variables / 환경 변수

Configure the following variables in your `.env` file:
`.env` 파일에 다음 변수들을 설정해 주세요:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (Web) | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (Private) | `eyJhbG...` |
| `VITE_SUPABASE_URL` | Supabase project URL (Admin) | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (Admin) | `eyJhbG...` |
| `VITE_WEB_API_URL` | Web API URL for image upload | `http://localhost:3000` |

### Example .env file
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Admin Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_WEB_API_URL=http://localhost:3000
```

---

## 🗄 Database Setup / 데이터베이스 설정

### Quick Setup / 빠른 설정
1. Create a new project in [Supabase](https://supabase.com/).
2. Run the migrations in `supabase/migrations/` folder via Supabase Dashboard SQL Editor.

### Migrations / 마이그레이션

**001_initial.sql** - Base tables
```sql
-- games table with multi-language support
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title_ko TEXT, title_en TEXT, title_ja TEXT,
  description_ko TEXT, description_en TEXT, description_ja TEXT,
  synopsis_ko TEXT, synopsis_en TEXT, synopsis_ja TEXT,
  status TEXT DEFAULT 'in_development',
  platforms TEXT[] DEFAULT '{}',
  cover_image TEXT,
  banner_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  steam_url TEXT,
  trailer_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**003_genre_series_i18n.sql** - Multi-language genre/series
```sql
-- Add localized genre and series columns
ALTER TABLE games ADD COLUMN genre_ko TEXT[] DEFAULT '{}';
ALTER TABLE games ADD COLUMN genre_en TEXT[] DEFAULT '{}';
ALTER TABLE games ADD COLUMN genre_ja TEXT[] DEFAULT '{}';
ALTER TABLE games ADD COLUMN series_ko TEXT;
ALTER TABLE games ADD COLUMN series_en TEXT;
ALTER TABLE games ADD COLUMN series_ja TEXT;
```

### Schema Overview / 스키마 개요

| Table | Description |
| :--- | :--- |
| `games` | Game titles, descriptions (ko/en/ja), genres, series, status, and media |
| `news` | Official announcements with multi-language support |
| `timeline_events` | Company history and milestones |
| `company_settings` | Global settings and configuration |

---

## 📤 Image Upload System / 이미지 업로드 시스템

This project uses **local filesystem storage** instead of cloud storage, making it ideal for self-hosted deployments.

이 프로젝트는 클라우드 스토리지 대신 **로컬 파일시스템**을 사용하여 자체 호스팅 배포에 최적화되어 있습니다.

### How It Works / 작동 방식

1. **Admin uploads image** → File sent to `/api/upload` endpoint
2. **API saves file** → Stored in `apps/web/public/uploads/{folder}/{uuid}.{ext}`
3. **URL saved to DB** → `/uploads/games/abc123.png`
4. **Web serves image** → Next.js static file serving

### API Endpoint / API 엔드포인트

```
POST /api/upload
Content-Type: multipart/form-data

Parameters:
- file: Image file (required)
- folder: Subfolder name, e.g., "games" or "news" (optional, default: "general")

Response:
{ "url": "/uploads/games/abc123-def456.png" }
```

### Storage Location / 저장 위치
```
apps/web/public/uploads/
├── games/          # Game cover images, banners
│   ├── uuid1.png
│   └── uuid2.jpg
└── news/           # News article images
    └── uuid3.png
```

---

## 🐳 Deployment / 배포

### Docker
Deploy using Docker Compose:
도커 컴포즈를 사용하여 배포합니다:

```bash
docker-compose up -d
```

- **Nginx:** Acts as a reverse proxy for `web` and `admin` apps.
- **SSL:** Configure Let's Encrypt or use Cloudflare Tunnel for HTTPS.

### Cloudflare Tunnel (Recommended for Home Server)
For home server deployment without port forwarding:

1. Install cloudflared
2. Create tunnel: `cloudflared tunnel create elysian`
3. Configure routing to `localhost:3000` (web) and `localhost:5175` (admin)

---

## 🛡 Admin Guide / 관리자 가이드

### English

1. **Login:** Access the admin URL (`http://localhost:5175`) and login with your Supabase Auth credentials.

2. **Games Management:**
   - Create or update game profiles
   - Multi-language fields: Title, Description, Synopsis, Genre, Series (Korean/English/Japanese tabs)
   - Upload cover and banner images directly (no external URL needed)
   - Set game status: Released, Coming Soon, In Development, Publishing

3. **News Management:**
   - Publish news articles with multi-language support
   - Toggle `is_published` to control website visibility
   - Upload featured images

4. **Image Upload:**
   - Click "Choose File" or drag & drop images
   - Images are automatically uploaded to local storage
   - Supported formats: PNG, JPG, JPEG, GIF, WebP

### 한국어

1. **로그인:** 관리자 URL (`http://localhost:5175`)에 접속하여 Supabase 인증 계정으로 로그인합니다.

2. **게임 관리:**
   - 게임 프로필을 생성하거나 업데이트합니다
   - 다국어 필드: 제목, 설명, 시놉시스, 장르, 시리즈 (한국어/영어/일본어 탭)
   - 커버 이미지와 배너 이미지를 직접 업로드 (외부 URL 불필요)
   - 게임 상태 설정: 출시됨, 출시 예정, 개발 중, 퍼블리싱

3. **뉴스 관리:**
   - 다국어 지원으로 뉴스 기사를 발행합니다
   - `is_published` 상태를 변경하여 웹사이트 노출을 제어합니다
   - 대표 이미지를 업로드합니다

4. **이미지 업로드:**
   - "Choose File" 클릭 또는 드래그 앤 드롭으로 이미지 선택
   - 이미지가 자동으로 로컬 스토리지에 업로드됩니다
   - 지원 형식: PNG, JPG, JPEG, GIF, WebP

---

## 🔧 Development Notes / 개발 노트

### Key Files / 주요 파일

| File | Description |
| :--- | :--- |
| `apps/web/app/api/upload/route.ts` | Image upload API with CORS support |
| `apps/web/lib/supabase.ts` | Supabase client and helper functions (`getGames`, `getLocalizedField`, etc.) |
| `apps/admin/src/dataProvider.ts` | Custom React Admin data provider with image upload handling |
| `apps/admin/src/components/LocalizedInput.tsx` | Multi-language text input component |
| `apps/admin/src/components/LocalizedArrayInput.tsx` | Multi-language array input (for genres) |
| `apps/admin/src/resources/games/GameEdit.tsx` | Game edit form with image upload |

### Localization Helper / 다국어 헬퍼

```typescript
// apps/web/lib/supabase.ts

// Get localized field value
getLocalizedField(game, 'title', 'ko')  // Returns title_ko or fallback

// Get localized array (for genres)
getLocalizedArray(game, 'genre', 'en')  // Returns genre_en or fallback
```

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
