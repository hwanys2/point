# 학급 관리 시스템

학생 점수 관리 및 순위표를 제공하는 웹 애플리케이션입니다.

## 🌟 주요 기능

- ✅ **회원가입/로그인**: JWT 기반 인증 시스템
- 👨‍🎓 **학생 관리**: 학생 추가, 수정, 삭제 및 CSV 일괄 업로드
- 📊 **점수 부여**: 규칙별 일일 점수 부여 및 관리
- 🏆 **순위표**: 실시간 학생 순위 및 규칙별 득점 비교 차트
- 🎨 **커스터마이징**: 앱 제목, 아이콘, 색상, 폰트 설정 가능
- 📝 **규칙 관리**: 자유로운 점수 부여 규칙 생성 및 관리

## 🛠️ 기술 스택

### Backend
- Node.js + Express
- PostgreSQL (Railway)
- JWT 인증
- bcryptjs (비밀번호 암호화)

### Frontend
- React 18
- Tailwind CSS
- Axios (HTTP 클라이언트)
- Lucide Icons

## 📦 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd point
```

### 2. 의존성 설치

```bash
# 백엔드와 프론트엔드 모두 설치
npm run install-all
```

### 3. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 값을 설정하세요:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_secure_random_string_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. 개발 서버 실행

#### 백엔드 실행 (터미널 1)
```bash
npm run dev
```

#### 프론트엔드 실행 (터미널 2)
```bash
npm run client
```

- 백엔드: http://localhost:5000
- 프론트엔드: http://localhost:3000

## 🚀 Railway 배포 가이드

**할 일 정리**
1. PostgreSQL 서비스 추가 후, **앱 서비스** Variables에 `DATABASE_PRIVATE_URL` 추가 → PostgreSQL Variables 탭에서 **Private** URL 복사해 넣기 (ECONNRESET 방지).
2. `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL` 설정.
3. Start Command: `npm start`, Root Directory: `/`.

---

### 1. Railway 회원가입
https://railway.app 에서 회원가입

### 2. PostgreSQL 데이터베이스 생성

1. Railway Dashboard에서 "New Project" 클릭
2. "Provision PostgreSQL" 선택
3. 데이터베이스가 생성되면 "Variables" 탭에서 `DATABASE_URL` 확인

### 3. 백엔드 배포

1. Railway Dashboard에서 "New Service" → "GitHub Repo" 선택
2. 이 저장소를 연결
3. **환경 변수 설정** (앱 서비스의 Variables 탭):
   - `DATABASE_URL`: PostgreSQL 서비스에서 복사 (또는 변수 참조로 자동 연결)
   - **`DATABASE_PRIVATE_URL`** (권장): PostgreSQL 서비스 Variables 탭의 **Private** URL (`postgres.railway.internal` 호스트). ECONNRESET 방지용. 없으면 `DATABASE_URL` 사용
   - `JWT_SECRET`: 랜덤 문자열 (예: `openssl rand -base64 32`)
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: 배포된 프론트엔드 URL
   - `PORT`: 비워두면 Railway가 자동 설정

4. Root Directory: `/` (기본값)
5. Start Command: `npm start`

### 4. 프론트엔드 배포 (Vercel 또는 Netlify)

#### Vercel 배포:
```bash
npm install -g vercel
cd frontend
vercel
```

환경 변수 설정:
- `REACT_APP_API_URL`: Railway 백엔드 URL (예: https://classpoint.kr/api)

#### Netlify 배포:
1. Netlify Dashboard에서 "New site from Git" 클릭
2. 저장소 연결
3. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
4. 환경 변수:
   - `REACT_APP_API_URL`: Railway 백엔드 URL

### 5. CORS 설정 업데이트

Railway의 백엔드 환경 변수에서:
- `FRONTEND_URL`: 배포된 프론트엔드 URL로 업데이트

## 📝 사용 방법

### 1. 회원가입 및 로그인
- 첫 화면에서 "회원가입" 클릭
- 사용자명, 이메일, 비밀번호, 학교명(선택) 입력
- 로그인하여 시스템 접근

### 2. 규칙 등록
- "규칙" 탭에서 점수 부여 규칙 생성
- 예: "등교 시간 지키기", "과제 제출", "청소 참여" 등
- 아이콘과 색상 설정 가능

### 3. 학생 등록
- "학생 관리" 탭에서 개별 학생 등록
- 또는 CSV 파일로 일괄 업로드
- CSV 형식: `학년,반,번호,이름`

### 4. 점수 부여
- "점수 부여" 탭에서 날짜 선택
- 각 학생의 규칙별 체크박스 클릭하여 점수 부여/취소

### 5. 순위 확인
- "순위표" 탭에서 실시간 학생 순위 확인
- 규칙별 득점 비교 차트 제공

## 🗂️ 프로젝트 구조

```
point/
├── backend/
│   ├── config/
│   │   └── database.js       # DB 설정 및 초기화
│   ├── middleware/
│   │   └── auth.js           # JWT 인증 미들웨어
│   ├── routes/
│   │   ├── auth.js           # 인증 라우트
│   │   ├── students.js       # 학생 관리 라우트
│   │   ├── rules.js          # 규칙 관리 라우트
│   │   ├── scores.js         # 점수 관리 라우트
│   │   └── settings.js       # 설정 관리 라우트
│   └── server.js             # Express 서버
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   └── Auth.js       # 로그인/회원가입 컴포넌트
│       ├── services/
│       │   └── api.js        # API 서비스
│       ├── App.js            # 메인 앱 컴포넌트
│       └── index.js
├── .env.example              # 환경 변수 템플릿
├── .gitignore
├── package.json              # 루트 패키지 (백엔드)
└── README.md
```

## 🔐 보안

- 비밀번호는 bcrypt로 해싱하여 저장
- JWT 토큰 기반 인증
- SQL Injection 방지 (Parameterized Queries)
- CORS 설정으로 허용된 도메인만 접근 가능

## 📄 라이센스

MIT License

## 👨‍💻 개발자

프로젝트에 기여하고 싶으시다면 Pull Request를 보내주세요!

## 🐛 버그 리포트

이슈가 있다면 GitHub Issues에 등록해주세요.
