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
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean); // undefined 값 제거

app.use(cors({
  origin: function (origin, callback) {
    // origin이 undefined인 경우 (예: 모바일 앱, Postman 등) 허용
    if (!origin) return callback(null, true);
    
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
    
    callback(new Error('CORS 정책에 의해 차단되었습니다.'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/rules', require('./routes/rules'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/student-managers', require('./routes/student-managers'));
app.use('/api/public', require('./routes/public'));

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
    // Initialize database
    await initDatabase();
    
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
