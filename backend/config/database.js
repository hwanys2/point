const { Pool } = require('pg');

// Railway: 같은 프로젝트 내 DB는 private URL 사용 권장 (ECONNRESET 방지)
const connectionString = process.env.DATABASE_PRIVATE_URL || process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && process.env.DATABASE_PRIVATE_URL) {
  console.log('🔗 DB: Railway private URL 사용');
}

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  max: 10,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Railway 등에서 DB 준비/private 네트워크 초기화 대기 후 재시도
const withRetry = async (fn, maxAttempts = 8) => {
  const initialDelay = isProduction ? 5000 : 1000;
  let delayMs = initialDelay;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLast = attempt === maxAttempts;
      console.log(
        isLast ? `❌ DB 연결 실패 (${attempt}/${maxAttempts})` : `⚠️ DB 연결 시도 ${attempt}/${maxAttempts} 실패, ${delayMs}ms 후 재시도...`,
        err.code || err.message
      );
      if (isLast) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
      delayMs = Math.min(Math.round(delayMs * 1.5), 20000);
    }
  }
};

// 데이터베이스 테이블 초기화
const initDatabase = async () => {
  // Railway private 네트워크 초기화 대기 (권장 3초 이상)
  if (isProduction) {
    console.log('⏳ DB 연결 대기 중 (5초)...');
    await new Promise((r) => setTimeout(r, 5000));
  }
  await withRetry(async () => {
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

      CREATE TABLE IF NOT EXISTS classrooms (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(50) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        grade INTEGER NOT NULL,
        class_num INTEGER NOT NULL,
        student_num INTEGER NOT NULL,
        score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(classroom_id, grade, class_num, student_num)
      );

      CREATE TABLE IF NOT EXISTS rules (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
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

      CREATE TABLE IF NOT EXISTS student_managers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        allowed_rule_ids TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_classrooms_user_id ON classrooms(user_id);
      CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
      CREATE INDEX IF NOT EXISTS idx_rules_user_id ON rules(user_id);
      CREATE INDEX IF NOT EXISTS idx_daily_scores_student ON daily_scores(student_id);
      CREATE INDEX IF NOT EXISTS idx_daily_scores_date ON daily_scores(date);
      CREATE INDEX IF NOT EXISTS idx_student_managers_user_id ON student_managers(user_id);
    `);
    
    // 기존 데이터베이스를 위한 마이그레이션 쿼리
    try {
      // 1. classroom_id 컬럼 추가 (NULL 허용)
      await pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS classroom_id INTEGER;`);
      await pool.query(`ALTER TABLE rules ADD COLUMN IF NOT EXISTS classroom_id INTEGER;`);
      
      // 2. 기존 사용자들에게 기본 학급이 없으면 생성
      const usersWithoutClassroom = await pool.query(`
        SELECT DISTINCT u.id 
        FROM users u 
        LEFT JOIN classrooms c ON c.user_id = u.id 
        WHERE c.id IS NULL
      `);
      
      for (const user of usersWithoutClassroom.rows) {
        await pool.query(
          `INSERT INTO classrooms (user_id, name, is_default) VALUES ($1, '기본 학급', true) ON CONFLICT DO NOTHING`,
          [user.id]
        );
      }
      
      // 3. classroom_id가 NULL인 기존 데이터를 각 사용자의 기본 학급으로 연결
      await pool.query(`
        UPDATE students s
        SET classroom_id = (
          SELECT c.id FROM classrooms c 
          WHERE c.user_id = s.user_id AND c.is_default = true 
          LIMIT 1
        )
        WHERE s.classroom_id IS NULL
      `);
      
      await pool.query(`
        UPDATE rules r
        SET classroom_id = (
          SELECT c.id FROM classrooms c 
          WHERE c.user_id = r.user_id AND c.is_default = true 
          LIMIT 1
        )
        WHERE r.classroom_id IS NULL
      `);
      
      // 4. 외래 키 제약 조건 추가 (데이터 마이그레이션 후)
      await pool.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'students_classroom_id_fkey'
          ) THEN
            ALTER TABLE students ADD CONSTRAINT students_classroom_id_fkey 
            FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `);
      
      // 5. 잘못된 제약조건 제거 및 올바른 제약조건 추가
      await pool.query(`
        DO $$ 
        BEGIN
          -- 기존 잘못된 제약조건 제거 (classroom_id 없이 user_id만 포함)
          IF EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'students_user_id_grade_class_num_student_num_key'
          ) THEN
            ALTER TABLE students DROP CONSTRAINT students_user_id_grade_class_num_student_num_key;
          END IF;
          
          -- 올바른 제약조건 추가 (classroom_id 포함)
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'students_classroom_id_grade_class_num_student_num_key'
          ) THEN
            ALTER TABLE students ADD CONSTRAINT students_classroom_id_grade_class_num_student_num_key 
            UNIQUE (classroom_id, grade, class_num, student_num);
          END IF;
        END $$;
      `);
      
      await pool.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'rules_classroom_id_fkey'
          ) THEN
            ALTER TABLE rules ADD CONSTRAINT rules_classroom_id_fkey 
            FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `);
      
      // 6. student_managers 테이블에 classroom_id 추가
      await pool.query(`ALTER TABLE student_managers ADD COLUMN IF NOT EXISTS classroom_id INTEGER;`);
      
      // 7. 기존 student_managers의 classroom_id를 해당 사용자의 기본 학급으로 설정
      await pool.query(`
        UPDATE student_managers sm
        SET classroom_id = (
          SELECT c.id FROM classrooms c 
          WHERE c.user_id = sm.user_id AND c.is_default = true 
          LIMIT 1
        )
        WHERE sm.classroom_id IS NULL
      `);
      
      // 8. student_managers의 외래 키 제약 조건 추가
      await pool.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'student_managers_classroom_id_fkey'
          ) THEN
            ALTER TABLE student_managers ADD CONSTRAINT student_managers_classroom_id_fkey 
            FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `);
      
      // 9. 인덱스 생성
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_students_classroom_id ON students(classroom_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_rules_classroom_id ON rules(classroom_id);`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_student_managers_classroom_id ON student_managers(classroom_id);`);
      
      console.log('✅ Database migration completed successfully');
    } catch (migrationError) {
      console.log('⚠️ Migration warning:', migrationError.message);
    }
    
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
  });
};

module.exports = { pool, initDatabase };
