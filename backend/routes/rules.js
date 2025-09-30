const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// 모든 규칙 조회
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM rules WHERE user_id = $1 ORDER BY id',
      [req.userId]
    );

    const rules = result.rows.map(rule => ({
      id: rule.id,
      name: rule.name,
      iconId: rule.icon_id,
      color: rule.color
    }));

    res.json(rules);
  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({ error: '규칙 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 규칙 추가
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('규칙 이름을 입력하세요.'),
  body('iconId').notEmpty().withMessage('아이콘을 선택하세요.'),
  body('color').matches(/^#[0-9A-F]{6}$/i).withMessage('유효한 색상 코드를 입력하세요.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, iconId, color } = req.body;

    const result = await pool.query(
      'INSERT INTO rules (user_id, name, icon_id, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, name, iconId, color]
    );

    res.status(201).json({
      id: result.rows[0].id,
      name: result.rows[0].name,
      iconId: result.rows[0].icon_id,
      color: result.rows[0].color
    });
  } catch (error) {
    console.error('Add rule error:', error);
    res.status(500).json({ error: '규칙 추가 중 오류가 발생했습니다.' });
  }
});

// 규칙 수정
router.put('/:id', auth, [
  body('name').trim().notEmpty().withMessage('규칙 이름을 입력하세요.'),
  body('iconId').notEmpty().withMessage('아이콘을 선택하세요.'),
  body('color').matches(/^#[0-9A-F]{6}$/i).withMessage('유효한 색상 코드를 입력하세요.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, iconId, color } = req.body;

    const result = await pool.query(
      'UPDATE rules SET name = $1, icon_id = $2, color = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, iconId, color, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '규칙을 찾을 수 없습니다.' });
    }

    res.json({
      id: result.rows[0].id,
      name: result.rows[0].name,
      iconId: result.rows[0].icon_id,
      color: result.rows[0].color
    });
  } catch (error) {
    console.error('Update rule error:', error);
    res.status(500).json({ error: '규칙 수정 중 오류가 발생했습니다.' });
  }
});

// 규칙 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 규칙 존재 확인
      const ruleCheck = await client.query(
        'SELECT * FROM rules WHERE id = $1 AND user_id = $2',
        [id, req.userId]
      );

      if (ruleCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: '규칙을 찾을 수 없습니다.' });
      }

      // 해당 규칙의 점수 데이터 가져오기
      const scoresResult = await client.query(
        `SELECT student_id, SUM(value) as total
         FROM daily_scores
         WHERE rule_id = $1
         GROUP BY student_id`,
        [id]
      );

      // 각 학생의 총점에서 규칙 점수 차감
      for (const row of scoresResult.rows) {
        await client.query(
          'UPDATE students SET score = GREATEST(0, score - $1) WHERE id = $2',
          [row.total, row.student_id]
        );
      }

      // 규칙 관련 점수 데이터 삭제 (CASCADE로 자동 삭제됨)
      await client.query('DELETE FROM rules WHERE id = $1', [id]);

      await client.query('COMMIT');
      res.json({ message: '규칙이 삭제되었습니다.' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({ error: '규칙 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
