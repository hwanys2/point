require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/database');

const app = express();

// Middleware
const allowedOrigins = [
  'https://classpoint.kr',
  'https://classpoint.kr/',
  'https://www.classpoint.kr',
  'https://www.classpoint.kr/',
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  process.env.CLIENT_ORIGIN
].filter(Boolean); // undefined 값 제거

// 개발 환경에서는 localhost 모든 포트 허용
const isDevelopment = process.env.NODE_ENV !== 'production';

console.log('🌍 환경:', isDevelopment ? 'development' : 'production');
console.log('🔧 환경 변수:');
console.log('  - FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('  - CLIENT_URL:', process.env.CLIENT_URL);
console.log('  - CLIENT_ORIGIN:', process.env.CLIENT_ORIGIN);
console.log('✅ 허용된 origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // origin이 undefined인 경우 (예: 모바일 앱, Postman 등) 허용
    if (!origin) {
      return callback(null, true);
    }
    
    // 개발 환경에서 localhost 모든 포트 허용
    if (isDevelopment && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
      return callback(null, true);
    }
    
    // 정확히 일치하는 origin이 있으면 허용
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // 슬래시를 제거한 버전과 비교
    const originWithoutSlash = origin.replace(/\/$/, '');
    const allowedWithoutSlash = allowedOrigins.map(o => o.replace(/\/$/, ''));
    
    if (allowedWithoutSlash.includes(originWithoutSlash)) {
      return callback(null, true);
    }
    
    // www 없는 버전과 비교 (https://classpoint.kr <-> https://www.classpoint.kr)
    const originWithoutWww = origin.replace(/^https?:\/\/(www\.)?/, 'https://');
    const allowedWithoutWww = allowedOrigins.map(o => o.replace(/^https?:\/\/(www\.)?/, 'https://'));
    
    if (allowedWithoutWww.includes(originWithoutWww)) {
      return callback(null, true);
    }
    
    // 차단된 경우에만 로그 출력
    console.log('❌ CORS 차단된 origin:', origin);
    console.log('❌ 허용된 origins:', allowedOrigins);
    callback(new Error('CORS 정책에 의해 차단되었습니다.'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
console.log('🔗 Registering routes...');
app.use('/api/auth', require('./routes/auth'));
console.log('✅ Auth routes registered');
app.use('/api/classrooms', require('./routes/classrooms'));
app.use('/api/students', require('./routes/students'));
app.use('/api/rules', require('./routes/rules'));
app.use('/api/scores', require('./routes/scores'));
const settingsRoutes = require('./routes/settings');
app.use('/api/settings', settingsRoutes);
app.use('/api/student-managers', require('./routes/student-managers'));
app.use('/api/public', require('./routes/public'));
console.log('✅ All routes registered');

// In production, serve frontend build as static files
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(buildPath));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: '서버가 정상 작동 중입니다.' });
});

// SPA fallback: serve index.html for non-API routes in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// 404 handler for API routes only
app.use('/api', (req, res) => {
  res.status(404).json({ error: '요청한 API 리소스를 찾을 수 없습니다.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize database (재시도 포함)
    await initDatabase();
    // Settings 테이블은 DB 초기화 이후에만 실행 (ECONNRESET 방지)
    await settingsRoutes.initSettingsTable();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🚀 서버가 시작되었습니다!            ║
║   📍 포트: ${PORT}                      ║
║   🌍 환경: ${process.env.NODE_ENV || 'development'}              ║
║   📊 데이터베이스: PostgreSQL          ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
