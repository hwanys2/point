# 로컬 개발 가이드

## 🛠️ 개발 환경 설정

### 1. PostgreSQL 설치

#### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
https://www.postgresql.org/download/windows/ 에서 설치 프로그램 다운로드

### 2. 데이터베이스 생성

```bash
# PostgreSQL 접속
psql postgres

# 데이터베이스 생성
CREATE DATABASE student_management;

# 사용자 생성 (선택사항)
CREATE USER student_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE student_management TO student_user;

# 종료
\q
```

### 3. 프로젝트 설정

```bash
# 저장소 클론
git clone <your-repo-url>
cd point

# 의존성 설치
npm install
cd frontend
npm install
cd ..
```

### 4. 환경 변수 설정

#### 백엔드 `.env` 파일
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/student_management
JWT_SECRET=your_development_secret
PORT=5000
NODE_ENV=development
FRONTEND_URL=https://classpoint.kr
```

#### 프론트엔드 `frontend/.env` 파일
```env
REACT_APP_API_URL=https://classpoint.kr/api
```

### 5. 개발 서버 실행

#### 터미널 1: 백엔드
```bash
npm run dev
```

#### 터미널 2: 프론트엔드
```bash
npm run client
```

- 백엔드: http://localhost:5000
- 프론트엔드: http://localhost:3000

## 📁 프로젝트 구조 상세

```
point/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL 설정 및 테이블 초기화
│   ├── middleware/
│   │   └── auth.js              # JWT 인증 미들웨어
│   ├── routes/
│   │   ├── auth.js              # POST /api/auth/register, /login, GET /me
│   │   ├── students.js          # CRUD for students
│   │   ├── rules.js             # CRUD for rules
│   │   ├── scores.js            # POST /toggle, GET /date/:date
│   │   └── settings.js          # GET/PUT user settings
│   └── server.js                # Express 서버 엔트리포인트
│
├── frontend/
│   ├── public/
│   │   └── index.html           # HTML 템플릿
│   └── src/
│       ├── components/
│       │   └── Auth.js          # 로그인/회원가입 UI
│       ├── services/
│       │   └── api.js           # Axios API 클라이언트
│       ├── App.js               # 메인 애플리케이션
│       └── index.js             # React 엔트리포인트
│
├── .env                         # 백엔드 환경 변수
├── .env.example                 # 환경 변수 템플릿
├── .gitignore
├── package.json                 # 백엔드 의존성
├── README.md                    # 프로젝트 개요
├── DEPLOY.md                    # 배포 가이드
├── DEVELOPMENT.md               # 개발 가이드 (이 파일)
└── railway.json                 # Railway 배포 설정
```

## 🔌 API 엔드포인트

### 인증 (Authentication)

#### 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "teacher1",
  "email": "teacher@example.com",
  "password": "password123",
  "schoolName": "서울초등학교" (optional)
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "teacher1", ... }
}
```

#### 현재 사용자 정보
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 학생 관리 (Students)

#### 모든 학생 조회
```http
GET /api/students
Authorization: Bearer <token>
```

#### 학생 추가
```http
POST /api/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "김철수",
  "grade": 3,
  "classNum": 2,
  "studentNum": 15
}
```

#### 학생 수정
```http
PUT /api/students/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "김철수",
  "grade": 4,
  "classNum": 1,
  "studentNum": 10
}
```

#### 학생 삭제
```http
DELETE /api/students/:id
Authorization: Bearer <token>
```

#### CSV 일괄 업로드
```http
POST /api/students/bulk-upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "students": [
    { "grade": 3, "classNum": 1, "studentNum": 1, "name": "김철수" },
    { "grade": 3, "classNum": 1, "studentNum": 2, "name": "이영희" }
  ]
}
```

### 규칙 관리 (Rules)

#### 모든 규칙 조회
```http
GET /api/rules
Authorization: Bearer <token>
```

#### 규칙 추가
```http
POST /api/rules
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "등교 시간 지키기",
  "iconId": "Clock",
  "color": "#4f46e5"
}
```

#### 규칙 수정
```http
PUT /api/rules/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "등교 시간 잘 지키기",
  "iconId": "Clock",
  "color": "#6366f1"
}
```

#### 규칙 삭제
```http
DELETE /api/rules/:id
Authorization: Bearer <token>
```

### 점수 관리 (Scores)

#### 점수 토글 (부여/취소)
```http
POST /api/scores/toggle
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "3-2-15",
  "ruleId": 1,
  "date": "2025-09-30"
}
```

#### 특정 날짜 점수 조회
```http
GET /api/scores/date/2025-09-30
Authorization: Bearer <token>
```

### 설정 (Settings)

#### 앱 설정 조회
```http
GET /api/settings
Authorization: Bearer <token>
```

#### 앱 설정 업데이트
```http
PUT /api/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "3학년 2반 관리",
  "subtitle": "우리 반 점수 관리",
  "iconId": "Award",
  "iconColor": "#ef4444",
  "font": "'Pretendard', sans-serif"
}
```

## 🧪 테스트

### API 테스트 (Postman/Insomnia)

1. 회원가입 → 토큰 저장
2. 토큰을 Authorization 헤더에 추가
3. 각 엔드포인트 테스트

### 데이터베이스 직접 확인

```bash
# PostgreSQL 접속
psql student_management

# 테이블 확인
\dt

# 사용자 확인
SELECT * FROM users;

# 학생 확인
SELECT * FROM students;

# 규칙 확인
SELECT * FROM rules;

# 점수 확인
SELECT * FROM daily_scores;
```

## 🔧 개발 팁

### 1. Hot Reload
- 백엔드: `nodemon` 사용 (npm run dev)
- 프론트엔드: React 자동 리로드

### 2. 디버깅
- 백엔드: `console.log` 또는 VSCode 디버거
- 프론트엔드: Chrome DevTools (F12)

### 3. 데이터베이스 초기화
```bash
# PostgreSQL 접속
psql student_management

# 모든 테이블 삭제
DROP TABLE IF EXISTS daily_scores, students, rules, user_settings, users CASCADE;

# 서버 재시작 시 자동으로 테이블 재생성됨
```

### 4. Git 워크플로우
```bash
# 새 기능 브랜치 생성
git checkout -b feature/new-feature

# 커밋
git add .
git commit -m "Add new feature"

# 메인 브랜치로 병합
git checkout main
git merge feature/new-feature

# GitHub에 푸시
git push origin main
```

## 🐛 일반적인 문제 해결

### "ECONNREFUSED" 에러
- PostgreSQL이 실행 중인지 확인
- `DATABASE_URL`이 올바른지 확인

### "Invalid token" 에러
- localStorage에서 토큰 삭제 후 재로그인
- JWT_SECRET이 변경되었는지 확인

### CORS 에러
- 백엔드의 `FRONTEND_URL`이 올바른지 확인
- 프론트엔드가 `http://localhost:3000`에서 실행 중인지 확인

### 프론트엔드 빌드 에러
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📚 추가 리소스

- [Express 문서](https://expressjs.com/)
- [React 문서](https://react.dev/)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [JWT 가이드](https://jwt.io/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

Happy Coding! 🚀
