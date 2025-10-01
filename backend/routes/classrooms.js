const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// 모든 학급 조회
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, is_default, created_at FROM classrooms WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({ error: '학급 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 학급 생성
router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('학급 이름을 입력해주세요.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name } = req.body;
      
      const result = await pool.query(
        'INSERT INTO classrooms (user_id, name, is_default) VALUES ($1, $2, $3) RETURNING id, name, is_default, created_at',
        [req.userId, name, false]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create classroom error:', error);
      res.status(500).json({ error: '학급 생성 중 오류가 발생했습니다.' });
    }
  }
);

// 학급 수정
router.put(
  '/:id',
  auth,
  [
    body('name').trim().notEmpty().withMessage('학급 이름을 입력해주세요.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { name } = req.body;
      
      // 권한 확인
      const checkResult = await pool.query(
        'SELECT id FROM classrooms WHERE id = $1 AND user_id = $2',
        [id, req.userId]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: '학급을 찾을 수 없습니다.' });
      }
      
      const result = await pool.query(
        'UPDATE classrooms SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name, is_default, created_at',
        [name, id, req.userId]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update classroom error:', error);
      res.status(500).json({ error: '학급 수정 중 오류가 발생했습니다.' });
    }
  }
);

// 학급 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 권한 확인
    const checkResult = await pool.query(
      'SELECT id, is_default FROM classrooms WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: '학급을 찾을 수 없습니다.' });
    }
    
    if (checkResult.rows[0].is_default) {
      return res.status(400).json({ error: '기본 학급은 삭제할 수 없습니다. 먼저 다른 학급을 기본으로 설정해주세요.' });
    }
    
    await pool.query('DELETE FROM classrooms WHERE id = $1 AND user_id = $2', [id, req.userId]);
    
    res.json({ message: '학급이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({ error: '학급 삭제 중 오류가 발생했습니다.' });
  }
});

// 기본 학급 설정 (별표시)
router.patch('/:id/set-default', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 권한 확인
    const checkResult = await pool.query(
      'SELECT id FROM classrooms WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: '학급을 찾을 수 없습니다.' });
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 기존 기본 학급 해제
      await client.query(
        'UPDATE classrooms SET is_default = false WHERE user_id = $1',
        [req.userId]
      );
      
      // 새로운 기본 학급 설정
      const result = await client.query(
        'UPDATE classrooms SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING id, name, is_default, created_at',
        [id, req.userId]
      );
      
      await client.query('COMMIT');
      
      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Set default classroom error:', error);
    res.status(500).json({ error: '기본 학급 설정 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

