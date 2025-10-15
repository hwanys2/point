const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// 모든 규칙 조회
router.get('/', auth, async (req, res) => {
  try {
    const { classroomId } = req.query;
    
    // classroom_id가 제공되면 해당 학급의 규칙만, 아니면 모든 규칙
    let query, params;
    if (classroomId) {
      query = 'SELECT * FROM rules WHERE user_id = $1 AND classroom_id = $2 ORDER BY id';
      params = [req.userId, classroomId];
    } else {
      query = 'SELECT * FROM rules WHERE user_id = $1 ORDER BY id';
      params = [req.userId];
    }
    
    const result = await pool.query(query, params);

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
  body('color').matches(/^#[0-9A-F]{6}$/i).withMessage('유효한 색상 코드를 입력하세요.'),
  body('classroomId').isInt().withMessage('학급 ID가 필요합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, iconId, color, classroomId } = req.body;

    // 학급 소유권 확인
    const classroomCheck = await pool.query(
      'SELECT id FROM classrooms WHERE id = $1 AND user_id = $2',
      [classroomId, req.userId]
    );

    if (classroomCheck.rows.length === 0) {
      return res.status(403).json({ error: '해당 학급에 접근할 수 없습니다.' });
    }

    const result = await pool.query(
      'INSERT INTO rules (user_id, classroom_id, name, icon_id, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.userId, classroomId, name, iconId, color]
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

      // 각 학생의 총점에서 규칙 점수 차감 (음수 허용)
      for (const row of scoresResult.rows) {
        await client.query(
          'UPDATE students SET score = score - $1 WHERE id = $2',
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

// 다른 학급에서 규칙 가져오기
router.post('/import', auth, [
  body('sourceClassroomId').isInt().withMessage('원본 학급 ID가 필요합니다.'),
  body('targetClassroomId').isInt().withMessage('대상 학급 ID가 필요합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sourceClassroomId, targetClassroomId } = req.body;

    // 학급 소유권 확인
    const classroomCheck = await pool.query(
      'SELECT id FROM classrooms WHERE id IN ($1, $2) AND user_id = $3',
      [sourceClassroomId, targetClassroomId, req.userId]
    );

    if (classroomCheck.rows.length !== 2) {
      return res.status(400).json({ error: '유효하지 않은 학급입니다.' });
    }

    // 원본 학급의 규칙 조회
    const sourceRules = await pool.query(
      'SELECT name, icon_id, color FROM rules WHERE user_id = $1 AND classroom_id = $2',
      [req.userId, sourceClassroomId]
    );

    if (sourceRules.rows.length === 0) {
      return res.status(400).json({ error: '가져올 규칙이 없습니다.' });
    }

    // 대상 학급의 기존 규칙 조회 (중복 체크용)
    const existingRules = await pool.query(
      'SELECT name FROM rules WHERE user_id = $1 AND classroom_id = $2',
      [req.userId, targetClassroomId]
    );

    const existingRuleNames = new Set(existingRules.rows.map(rule => rule.name));

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const importedRules = [];
      const skippedRules = [];
      const duplicateRules = [];

      for (const rule of sourceRules.rows) {
        if (existingRuleNames.has(rule.name)) {
          duplicateRules.push(rule.name);
          continue;
        }

        try {
          const result = await client.query(
            'INSERT INTO rules (user_id, classroom_id, name, icon_id, color) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, icon_id, color',
            [req.userId, targetClassroomId, rule.name, rule.icon_id, rule.color]
          );
          
          importedRules.push(result.rows[0]);
        } catch (error) {
          console.error(`Error importing rule ${rule.name}:`, error);
          skippedRules.push({ name: rule.name, error: '가져오기 실패' });
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        imported: importedRules,
        duplicates: duplicateRules,
        skipped: skippedRules,
        summary: {
          total: sourceRules.rows.length,
          imported: importedRules.length,
          duplicates: duplicateRules.length,
          skipped: skippedRules.length
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Import rules error:', error);
    res.status(500).json({ error: '규칙 가져오기 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
