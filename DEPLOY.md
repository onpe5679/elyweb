# 로컬 서버 배포 가이드

## 사전 요구사항

- Docker & Docker Compose 설치
- Supabase 프로젝트 (클라우드 또는 셀프호스팅)

## 빠른 시작

### 1. 환경변수 설정

```bash
cd docker
cp .env.example .env
```

`.env` 파일 수정:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 로컬 서버 IP로 변경 (Admin에서 이미지 업로드 시 사용)
VITE_WEB_API_URL=http://192.168.1.100:3000
```

### 2. 빌드 및 실행

```bash
# 로컬 서버용 (nginx 없이)
docker-compose -f docker-compose.local.yml up -d --build

# 또는 nginx 포함 (도메인 필요)
docker-compose up -d --build
```

### 3. 접속

- **웹사이트**: http://서버IP:3000
- **어드민**: http://서버IP:3001

---

## 상세 설정

### Cloudflare Tunnel 사용 (권장)

포트포워딩 없이 외부 접속 가능:

```bash
# cloudflared 설치
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# 터널 생성
cloudflared tunnel login
cloudflared tunnel create elysian

# 설정 파일 생성
cat > ~/.cloudflared/config.yml << EOF
tunnel: elysian
credentials-file: /home/$USER/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: studioelysian.com
    service: http://localhost:3000
  - hostname: admin.studioelysian.com
    service: http://localhost:3001
  - service: http_status:404
EOF

# 실행
cloudflared tunnel run elysian
```

### 도메인 사용 시 (nginx 포함)

1. `docker/nginx/nginx.conf` 에서 도메인 수정
2. SSL 인증서를 `docker/nginx/ssl/` 에 배치
3. `.env` 에서 `VITE_WEB_API_URL` 을 도메인으로 변경

```bash
docker-compose up -d --build
```

---

## 업데이트 방법

```bash
cd /path/to/elysite/docker

# 코드 업데이트
git pull

# 재빌드 및 재시작
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d --build
```

---

## 볼륨 관리

### 업로드 이미지 백업

```bash
# 볼륨 위치 확인
docker volume inspect docker_uploads

# 백업
docker run --rm -v docker_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# 복원
docker run --rm -v docker_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

---

## 문제 해결

### 이미지 업로드 안됨
- `VITE_WEB_API_URL` 이 올바른지 확인 (Admin에서 Web 서버로 접근 가능해야 함)
- 브라우저 개발자 도구 Network 탭에서 `/api/upload` 요청 확인

### 컨테이너 로그 확인
```bash
docker-compose -f docker-compose.local.yml logs -f web
docker-compose -f docker-compose.local.yml logs -f admin
```

### 컨테이너 재시작
```bash
docker-compose -f docker-compose.local.yml restart
```
