require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: '서버가 정상 작동 중입니다.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
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
