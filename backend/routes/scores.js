const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// 점수 토글 (부여/취소)
router.post('/toggle', auth, [
  body('studentId').notEmpty().withMessage('학생 ID를 제공하세요.'),
  body('ruleId').isInt().withMessage('규칙 ID를 제공하세요.'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('날짜 형식이 올바르지 않습니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, ruleId, date } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 학생이 현재 사용자의 것인지 확인
      const studentCheck = await client.query(
        'SELECT * FROM students WHERE id = $1 AND user_id = $2',
        [studentId, req.userId]
      );

      if (studentCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
      }

      // 규칙이 현재 사용자의 것인지 확인
      const ruleCheck = await client.query(
        'SELECT * FROM rules WHERE id = $1 AND user_id = $2',
        [ruleId, req.userId]
      );

      if (ruleCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: '규칙을 찾을 수 없습니다.' });
      }

      // 기존 점수 확인
      const existingScore = await client.query(
        'SELECT * FROM daily_scores WHERE student_id = $1 AND rule_id = $2 AND date = $3',
        [studentId, ruleId, date]
      );

      let newValue;
      let scoreDelta;

      if (existingScore.rows.length > 0) {
        // 기존 점수가 있으면 토글
        const currentValue = existingScore.rows[0].value;
        newValue = currentValue === 1 ? 0 : 1;
        scoreDelta = newValue - currentValue;

        await client.query(
          'UPDATE daily_scores SET value = $1 WHERE student_id = $2 AND rule_id = $3 AND date = $4',
          [newValue, studentId, ruleId, date]
        );
      } else {
        // 새로운 점수 추가
        newValue = 1;
        scoreDelta = 1;

        await client.query(
          'INSERT INTO daily_scores (student_id, rule_id, date, value) VALUES ($1, $2, $3, $4)',
          [studentId, ruleId, date, newValue]
        );
      }

      // 학생 총점 업데이트 (음수 허용)
      await client.query(
        'UPDATE students SET score = score + $1 WHERE id = $2',
        [scoreDelta, studentId]
      );

      // 업데이트된 학생 정보 가져오기
      const updatedStudent = await client.query(
        'SELECT score FROM students WHERE id = $1',
        [studentId]
      );

      await client.query('COMMIT');

      res.json({
        message: '점수가 업데이트되었습니다.',
        studentId,
        ruleId,
        date,
        value: newValue,
        totalScore: updatedStudent.rows[0].score
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Toggle score error:', error);
    res.status(500).json({ error: '점수 업데이트 중 오류가 발생했습니다.' });
  }
});

// 점수 조정 (증가/감소)
router.post('/adjust', auth, [
  body('studentId').notEmpty().withMessage('학생 ID를 제공하세요.'),
  body('ruleId').isInt().withMessage('규칙 ID를 제공하세요.'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('날짜 형식이 올바르지 않습니다.'),
  body('delta').isInt().withMessage('점수 변경량을 제공하세요.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, ruleId, date, delta } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 학생이 현재 사용자의 것인지 확인
      const studentCheck = await client.query(
        'SELECT * FROM students WHERE id = $1 AND user_id = $2',
        [studentId, req.userId]
      );

      if (studentCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
      }

      // 규칙이 현재 사용자의 것인지 확인
      const ruleCheck = await client.query(
        'SELECT * FROM rules WHERE id = $1 AND user_id = $2',
        [ruleId, req.userId]
      );

      if (ruleCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: '규칙을 찾을 수 없습니다.' });
      }

      // 기존 점수 확인
      const existingScore = await client.query(
        'SELECT * FROM daily_scores WHERE student_id = $1 AND rule_id = $2 AND date = $3',
        [studentId, ruleId, date]
      );

      let newValue;
      let scoreDelta;

      if (existingScore.rows.length > 0) {
        // 기존 점수가 있으면 증감
        const currentValue = existingScore.rows[0].value;
        newValue = currentValue + delta;
        scoreDelta = delta;

        await client.query(
          'UPDATE daily_scores SET value = $1 WHERE student_id = $2 AND rule_id = $3 AND date = $4',
          [newValue, studentId, ruleId, date]
        );
      } else {
        // 새로운 점수 추가
        newValue = delta;
        scoreDelta = delta;

        await client.query(
          'INSERT INTO daily_scores (student_id, rule_id, date, value) VALUES ($1, $2, $3, $4)',
          [studentId, ruleId, date, newValue]
        );
      }

      // 학생 총점 업데이트 (음수 허용)
      await client.query(
        'UPDATE students SET score = score + $1 WHERE id = $2',
        [scoreDelta, studentId]
      );

      // 업데이트된 학생 정보 가져오기
      const updatedStudent = await client.query(
        'SELECT score FROM students WHERE id = $1',
        [studentId]
      );

      await client.query('COMMIT');

      res.json({
        message: '점수가 업데이트되었습니다.',
        studentId,
        ruleId,
        date,
        value: newValue,
        totalScore: updatedStudent.rows[0].score
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Adjust score error:', error);
    res.status(500).json({ error: '점수 업데이트 중 오류가 발생했습니다.' });
  }
});

// 특정 날짜의 모든 점수 조회
router.get('/date/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;

    // 현재 사용자의 모든 학생과 규칙에 대한 점수 조회
    const result = await pool.query(
      `SELECT ds.student_id, ds.rule_id, ds.date, ds.value
       FROM daily_scores ds
       JOIN students s ON ds.student_id = s.id
       WHERE s.user_id = $1 AND ds.date = $2`,
      [req.userId, date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get scores by date error:', error);
    res.status(500).json({ error: '점수 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
