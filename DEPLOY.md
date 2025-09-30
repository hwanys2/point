# Railway 배포 가이드 (상세)

이 문서는 학급 관리 시스템을 Railway에 배포하는 상세한 절차를 안내합니다.

## 🎯 배포 개요

- **백엔드**: Railway (Node.js + PostgreSQL)
- **프론트엔드**: Vercel 또는 Netlify (권장)
- **데이터베이스**: Railway PostgreSQL

---

## 📋 사전 준비

### 1. 필요한 계정
- [x] GitHub 계정
- [x] Railway 계정 (https://railway.app)
- [x] Vercel 계정 (https://vercel.com) 또는 Netlify 계정

### 2. 코드를 GitHub에 푸시

```bash
# Git 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 🚂 Railway 백엔드 배포

### 1단계: Railway 프로젝트 생성

1. https://railway.app 접속 및 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. GitHub 저장소 연결 및 권한 부여
5. 배포할 저장소 선택

### 2단계: PostgreSQL 추가

1. 프로젝트 대시보드에서 "New" 버튼 클릭
2. "Database" → "Add PostgreSQL" 선택
3. PostgreSQL 서비스가 자동으로 생성됨
4. `DATABASE_URL` 환경 변수가 자동으로 백엔드에 연결됨

### 3단계: 백엔드 환경 변수 설정

백엔드 서비스 클릭 → "Variables" 탭:

```env
# 자동 생성됨
DATABASE_URL=${{Postgres.DATABASE_URL}}

# 수동 추가 필요
JWT_SECRET=<랜덤 문자열 생성>
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.vercel.app
PORT=${{PORT}}
```

#### JWT_SECRET 생성 방법:
```bash
# macOS/Linux
openssl rand -base64 32

# 또는 온라인 도구 사용
# https://generate-secret.vercel.app/32
```

### 4단계: 배포 설정 확인

"Settings" 탭에서:
- **Root Directory**: `/` (기본값)
- **Build Command**: `npm install` (자동 감지)
- **Start Command**: `npm start` (package.json의 start 스크립트)

### 5단계: 배포 및 확인

1. "Deployments" 탭에서 배포 로그 확인
2. 성공 시 "Settings" → "Domains"에서 생성된 URL 확인
3. `https://your-app.railway.app/health` 접속하여 서버 작동 확인

---

## ☁️ Vercel 프론트엔드 배포

### 1단계: Vercel CLI 설치 및 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 프론트엔드 디렉토리로 이동
cd frontend

# 배포 시작
vercel

# 프로덕션 배포
vercel --prod
```

### 2단계: 환경 변수 설정

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:

```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### 3단계: 재배포

환경 변수 추가 후 자동으로 재배포되거나:

```bash
vercel --prod
```

---

## 🌐 Netlify 프론트엔드 배포 (대안)

### 1단계: Netlify에서 사이트 생성

1. https://app.netlify.com 접속 및 로그인
2. "New site from Git" 클릭
3. GitHub 저장소 연결
4. Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

### 2단계: 환경 변수 설정

Site settings → Environment → Environment variables:

```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### 3단계: 재배포

"Deploys" → "Trigger deploy" 클릭

---

## 🔄 Railway 백엔드 CORS 설정 업데이트

프론트엔드 배포 완료 후:

1. Railway 대시보드 → 백엔드 서비스 → Variables
2. `FRONTEND_URL` 값을 실제 프론트엔드 URL로 업데이트:
   ```env
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```
3. 저장 후 자동 재배포됨

---

## ✅ 배포 확인 체크리스트

- [ ] 백엔드 Health Check: `https://your-backend.railway.app/health`
- [ ] 프론트엔드 접속: `https://your-frontend.vercel.app`
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 학생 추가 테스트
- [ ] 점수 부여 테스트

---

## 🐛 트러블슈팅

### 백엔드 배포 실패

#### 문제: "Cannot find module 'express'"
**해결**: `package.json`이 루트 디렉토리에 있는지 확인

#### 문제: "Database connection failed"
**해결**:
1. PostgreSQL이 같은 프로젝트에 있는지 확인
2. `DATABASE_URL` 환경 변수가 올바르게 설정되었는지 확인

#### 문제: "Port already in use"
**해결**: Railway는 자동으로 `PORT` 환경 변수를 설정하므로 코드에서 `process.env.PORT`를 사용해야 함

### 프론트엔드 배포 실패

#### 문제: API 호출 실패 (CORS 에러)
**해결**:
1. 백엔드의 `FRONTEND_URL` 환경 변수가 프론트엔드 URL과 일치하는지 확인
2. 프론트엔드의 `REACT_APP_API_URL`이 올바른 백엔드 URL인지 확인

#### 문제: "Failed to compile"
**해결**:
1. `cd frontend && npm install` 로컬에서 빌드 테스트
2. `npm run build` 실행하여 에러 확인

---

## 🔧 환경 변수 전체 요약

### Railway 백엔드

| 변수명 | 값 예시 | 설명 |
|--------|---------|------|
| `DATABASE_URL` | (자동 생성) | PostgreSQL 연결 문자열 |
| `JWT_SECRET` | `abc123...` | JWT 토큰 암호화 키 |
| `NODE_ENV` | `production` | 환경 설정 |
| `FRONTEND_URL` | `https://app.vercel.app` | CORS 허용 도메인 |
| `PORT` | (Railway 자동 설정) | 서버 포트 |

### Vercel/Netlify 프론트엔드

| 변수명 | 값 예시 | 설명 |
|--------|---------|------|
| `REACT_APP_API_URL` | `https://api.railway.app/api` | 백엔드 API URL |

---

## 📱 모바일 접속

배포된 프론트엔드 URL을 모바일 브라우저에서 접속하면 반응형 UI로 사용 가능합니다.

---

## 🎓 추가 최적화

### 1. Custom Domain 설정
- Railway: Settings → Domains → Add Custom Domain
- Vercel: Settings → Domains → Add Domain

### 2. 데이터베이스 백업 (Railway)
- PostgreSQL 서비스 → Data → Export Database

### 3. 모니터링
- Railway: Metrics 탭에서 CPU, 메모리, 네트워크 사용량 확인

---

배포 중 문제가 발생하면 Railway 로그(`Deployments` → 최신 배포 클릭)와 브라우저 콘솔을 확인하세요!
