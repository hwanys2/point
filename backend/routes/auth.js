const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// 회원가입
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('사용자명은 3-50자여야 합니다.'),
  body('email').isEmail().withMessage('유효한 이메일을 입력하세요.'),
  body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다.'),
  body('schoolName').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, schoolName } = req.body;

    // 중복 확인
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 사용자명 또는 이메일입니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const result = await pool.query(
      'INSERT INTO users (username, email, password, school_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, school_name',
      [username, email, hashedPassword, schoolName || null]
    );

    const user = result.rows[0];

    // 기본 학급 생성
    await pool.query(
      'INSERT INTO classrooms (user_id, name, is_default) VALUES ($1, $2, $3)',
      [user.id, '기본 학급', true]
    );

    // JWT 토큰 생성
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        schoolName: user.school_name,
        role: 'teacher'  // 회원가입 시 교사 역할로 명시적 설정
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인 (교사 또는 학생 관리자)
router.post('/login', [
  body('username').notEmpty().withMessage('사용자명을 입력하세요.'),
  body('password').notEmpty().withMessage('비밀번호를 입력하세요.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // 1. 먼저 교사(users) 테이블에서 확인 (email 또는 username으로 검색)
    const teacherResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [username]
    );

    if (teacherResult.rows.length > 0) {
      const teacher = teacherResult.rows[0];
      const isMatch = await bcrypt.compare(password, teacher.password);
      
      if (isMatch) {
        const token = jwt.sign(
          { userId: teacher.id, role: 'teacher' }, 
          process.env.JWT_SECRET, 
          { expiresIn: '30d' }
        );

        return res.json({
          message: '로그인 성공',
          token,
          user: {
            id: teacher.id,
            username: teacher.username,
            email: teacher.email,
            schoolName: teacher.school_name,
            role: 'teacher'
          }
        });
      }
    }

    // 2. 학생 관리자 테이블에서 확인
    const managerResult = await pool.query(
      'SELECT sm.*, u.id as teacher_id FROM student_managers sm JOIN users u ON sm.user_id = u.id WHERE sm.username = $1',
      [username]
    );

    if (managerResult.rows.length > 0) {
      const manager = managerResult.rows[0];
      const isMatch = await bcrypt.compare(password, manager.password);
      
      if (isMatch) {
        const allowedRuleIds = manager.allowed_rule_ids ? JSON.parse(manager.allowed_rule_ids) : [];
        
        const token = jwt.sign(
          { managerId: manager.id, userId: manager.teacher_id, classroomId: manager.classroom_id, role: 'student_manager' }, 
          process.env.JWT_SECRET, 
          { expiresIn: '30d' }
        );

        return res.json({
          message: '로그인 성공',
          token,
          user: {
            id: manager.id,
            username: manager.username,
            displayName: manager.display_name,
            role: 'student_manager',
            allowedRuleIds,
            teacherId: manager.teacher_id,
            classroomId: manager.classroom_id
          }
        });
      }
    }

    // 일치하는 계정 없음
    return res.status(401).json({ error: '사용자명 또는 비밀번호가 일치하지 않습니다.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

// 현재 사용자 정보 조회
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, school_name, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        schoolName: result.rows[0].school_name,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: '사용자 정보 조회 중 오류가 발생했습니다.' });
  }
});

// 사용자 정보 수정
router.put('/profile', auth, [
  body('schoolName').optional().trim(),
  body('username').optional().trim().isLength({ min: 3, max: 50 }).withMessage('사용자명은 3-50자여야 합니다.'),
  body('currentPassword').optional().isLength({ min: 6 }).withMessage('현재 비밀번호는 최소 6자 이상이어야 합니다.'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('새 비밀번호는 최소 6자 이상이어야 합니다.')
], async (req, res) => {
  try {
    console.log('Update profile request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolName, username, currentPassword, newPassword } = req.body;
    const userId = req.userId;
    
    console.log('User ID:', userId, 'School Name:', schoolName);

    // 사용자 정보 조회
    console.log('Querying user with ID:', userId);
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    console.log('User query result:', userResult.rows.length, 'rows');
    
    if (userResult.rows.length === 0) {
      console.log('User not found');
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const user = userResult.rows[0];
    console.log('Found user:', user.username);

    // 비밀번호 변경이 있는 경우 현재 비밀번호 확인
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: '현재 비밀번호를 입력하세요.' });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: '현재 비밀번호가 올바르지 않습니다.' });
      }

      // 새 비밀번호 해시화
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // 비밀번호 업데이트
      await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedNewPassword, userId]
      );
    }

    // 사용자명 변경 처리 (선택 사항)
    if (username !== undefined && username !== user.username) {
      // 사용자명 중복 확인
      const dupCheck = await pool.query('SELECT id FROM users WHERE username = $1 AND id <> $2', [username, userId]);
      if (dupCheck.rows.length > 0) {
        return res.status(400).json({ error: '이미 사용 중인 사용자명입니다.' });
      }
      await pool.query(
        'UPDATE users SET username = $1 WHERE id = $2',
        [username, userId]
      );
    }

    // 학교명 업데이트
    if (schoolName !== undefined) {
      console.log('Updating school name to:', schoolName);
      await pool.query(
        'UPDATE users SET school_name = $1 WHERE id = $2',
        [schoolName, userId]
      );
      console.log('School name updated successfully');
    }

    // 업데이트된 사용자 정보 조회
    const updatedUserResult = await pool.query('SELECT id, username, email, school_name FROM users WHERE id = $1', [userId]);
    const updatedUser = updatedUserResult.rows[0];

    res.json({
      message: '사용자 정보가 수정되었습니다.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        schoolName: updatedUser.school_name
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: '사용자 정보 수정 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

module.exports = router;
