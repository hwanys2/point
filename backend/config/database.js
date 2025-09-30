const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 데이터베이스 테이블 초기화
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        school_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(50) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        grade INTEGER NOT NULL,
        class_num INTEGER NOT NULL,
        student_num INTEGER NOT NULL,
        score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, grade, class_num, student_num)
      );

      CREATE TABLE IF NOT EXISTS rules (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        icon_id VARCHAR(50) NOT NULL,
        color VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS daily_scores (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
        rule_id INTEGER REFERENCES rules(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        value INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, rule_id, date)
      );

      CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
      CREATE INDEX IF NOT EXISTS idx_rules_user_id ON rules(user_id);
      CREATE INDEX IF NOT EXISTS idx_daily_scores_student ON daily_scores(student_id);
      CREATE INDEX IF NOT EXISTS idx_daily_scores_date ON daily_scores(date);
    `);
    
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

module.exports = { pool, initDatabase };
