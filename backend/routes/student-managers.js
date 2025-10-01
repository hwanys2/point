const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// 모든 학생 관리자 조회 (교사만, 특정 학급)
router.get('/', auth, async (req, res) => {
  try {
    const { classroomId } = req.query;
    console.log('Student managers GET request - classroomId:', classroomId, 'query:', req.query);
    
    if (!classroomId) {
      console.log('Missing classroomId in request');
      return res.status(400).json({ error: '학급 ID가 필요합니다.' });
    }
    
    // 학급 소유권 확인
    const classroomCheck = await pool.query(
      'SELECT id FROM classrooms WHERE id = $1 AND user_id = $2',
      [classroomId, req.userId]
    );

    if (classroomCheck.rows.length === 0) {
      return res.status(403).json({ error: '해당 학급에 접근할 수 없습니다.' });
    }
    
    const result = await pool.query(
      'SELECT id, username, display_name, allowed_rule_ids, classroom_id, created_at FROM student_managers WHERE user_id = $1 AND classroom_id = $2 ORDER BY created_at DESC',
      [req.userId, classroomId]
    );

    const managers = result.rows.map(manager => ({
      id: manager.id,
      username: manager.username,
      displayName: manager.display_name,
      allowedRuleIds: manager.allowed_rule_ids ? JSON.parse(manager.allowed_rule_ids) : [],
      classroomId: manager.classroom_id,
      createdAt: manager.created_at
    }));

    res.json(managers);
  } catch (error) {
    console.error('Get student managers error:', error);
    res.status(500).json({ error: '학생 관리자 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 학생 관리자 생성 (교사만)
router.post('/', auth, [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('사용자명은 3-50자여야 합니다.'),
  body('password').isLength({ min: 4 }).withMessage('비밀번호는 최소 4자 이상이어야 합니다.'),
  body('displayName').trim().notEmpty().withMessage('표시 이름을 입력하세요.'),
  body('allowedRuleIds').isArray().withMessage('허용된 규칙 ID 배열을 제공하세요.'),
  body('classroomId').isInt().withMessage('학급 ID가 필요합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, displayName, allowedRuleIds, classroomId } = req.body;

    // 학급 소유권 확인
    const classroomCheck = await pool.query(
      'SELECT id FROM classrooms WHERE id = $1 AND user_id = $2',
      [classroomId, req.userId]
    );

    if (classroomCheck.rows.length === 0) {
      return res.status(403).json({ error: '해당 학급에 접근할 수 없습니다.' });
    }

    // 중복 확인
    const existingManager = await pool.query(
      'SELECT * FROM student_managers WHERE username = $1',
      [username]
    );

    if (existingManager.rows.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 사용자명입니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 학생 관리자 생성
    const result = await pool.query(
      'INSERT INTO student_managers (user_id, classroom_id, username, password, display_name, allowed_rule_ids) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, display_name, allowed_rule_ids, classroom_id, created_at',
      [req.userId, classroomId, username, hashedPassword, displayName, JSON.stringify(allowedRuleIds)]
    );

    const manager = result.rows[0];

    res.status(201).json({
      message: '학생 관리자가 생성되었습니다.',
      manager: {
        id: manager.id,
        username: manager.username,
        displayName: manager.display_name,
        allowedRuleIds: JSON.parse(manager.allowed_rule_ids),
        classroomId: manager.classroom_id,
        createdAt: manager.created_at
      }
    });
  } catch (error) {
    console.error('Create student manager error:', error);
    res.status(500).json({ error: '학생 관리자 생성 중 오류가 발생했습니다.' });
  }
});

// 학생 관리자 수정 (교사만)
router.put('/:id', auth, [
  body('displayName').optional().trim().notEmpty().withMessage('표시 이름을 입력하세요.'),
  body('password').optional().isLength({ min: 4 }).withMessage('비밀번호는 최소 4자 이상이어야 합니다.'),
  body('allowedRuleIds').optional().isArray().withMessage('허용된 규칙 ID 배열을 제공하세요.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { displayName, password, allowedRuleIds } = req.body;

    // 소유권 확인
    const checkResult = await pool.query(
      'SELECT * FROM student_managers WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: '학생 관리자를 찾을 수 없습니다.' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (displayName) {
      updates.push(`display_name = $${paramCount++}`);
      values.push(displayName);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }

    if (allowedRuleIds) {
      updates.push(`allowed_rule_ids = $${paramCount++}`);
      values.push(JSON.stringify(allowedRuleIds));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '수정할 내용이 없습니다.' });
    }

    values.push(id, req.userId);

    const result = await pool.query(
      `UPDATE student_managers SET ${updates.join(', ')} WHERE id = $${paramCount++} AND user_id = $${paramCount} RETURNING id, username, display_name, allowed_rule_ids, created_at`,
      values
    );

    const manager = result.rows[0];

    res.json({
      message: '학생 관리자가 수정되었습니다.',
      manager: {
        id: manager.id,
        username: manager.username,
        displayName: manager.display_name,
        allowedRuleIds: JSON.parse(manager.allowed_rule_ids),
        createdAt: manager.created_at
      }
    });
  } catch (error) {
    console.error('Update student manager error:', error);
    res.status(500).json({ error: '학생 관리자 수정 중 오류가 발생했습니다.' });
  }
});

// 학생 관리자 삭제 (교사만)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM student_managers WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '학생 관리자를 찾을 수 없습니다.' });
    }

    res.json({ message: '학생 관리자가 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete student manager error:', error);
    res.status(500).json({ error: '학생 관리자 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
