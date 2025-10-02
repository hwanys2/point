const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// 모든 학생 조회
router.get('/', auth, async (req, res) => {
  try {
    const { classroomId } = req.query;
    
    // classroom_id가 제공되면 해당 학급의 학생만, 아니면 모든 학생
    let query, params;
    if (classroomId) {
      query = 'SELECT * FROM students WHERE user_id = $1 AND classroom_id = $2 ORDER BY grade, class_num, student_num';
      params = [req.userId, classroomId];
    } else {
      query = 'SELECT * FROM students WHERE user_id = $1 ORDER BY grade, class_num, student_num';
      params = [req.userId];
    }
    
    const result = await pool.query(query, params);

    // 각 학생의 일별 점수 데이터 가져오기
    const students = await Promise.all(result.rows.map(async (student) => {
      const scoresResult = await pool.query(
        `SELECT ds.rule_id, ds.date, ds.value, r.name as rule_name
         FROM daily_scores ds
         JOIN rules r ON ds.rule_id = r.id
         WHERE ds.student_id = $1`,
        [student.id]
      );

      const dailyScores = {};
      scoresResult.rows.forEach(score => {
        // PostgreSQL DATE를 YYYY-MM-DD 문자열로 변환
        const dateStr = score.date instanceof Date 
          ? score.date.toISOString().split('T')[0] 
          : score.date;
        if (!dailyScores[dateStr]) {
          dailyScores[dateStr] = {};
        }
        // 객체 형태로 저장하여 public.js와 일관성 유지
        dailyScores[dateStr][score.rule_id] = {
          value: score.value,
          ruleName: score.rule_name
        };
      });

      return {
        id: student.id,
        name: student.name,
        grade: student.grade,
        classNum: student.class_num,
        studentNum: student.student_num,
        score: student.score,
        dailyScores
      };
    }));

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: '학생 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 학생 추가
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('이름을 입력하세요.'),
  body('grade').isInt({ min: 1, max: 6 }).withMessage('학년은 1-6 사이의 숫자여야 합니다.'),
  body('classNum').isInt({ min: 1 }).withMessage('반은 1 이상의 숫자여야 합니다.'),
  body('studentNum').isInt({ min: 1 }).withMessage('번호는 1 이상의 숫자여야 합니다.'),
  body('classroomId').isInt().withMessage('학급 ID가 필요합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, grade, classNum, studentNum, classroomId } = req.body;
    const studentId = `${classroomId}-${grade}-${classNum}-${studentNum}`;

    // 학급 소유권 확인
    const classroomCheck = await pool.query(
      'SELECT id FROM classrooms WHERE id = $1 AND user_id = $2',
      [classroomId, req.userId]
    );

    if (classroomCheck.rows.length === 0) {
      return res.status(403).json({ error: '해당 학급에 접근할 수 없습니다.' });
    }

    // 중복 확인
    const existing = await pool.query(
      'SELECT * FROM students WHERE classroom_id = $1 AND grade = $2 AND class_num = $3 AND student_num = $4',
      [classroomId, grade, classNum, studentNum]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: '이미 존재하는 학생입니다.' });
    }

    const result = await pool.query(
      'INSERT INTO students (id, user_id, classroom_id, name, grade, class_num, student_num, score) VALUES ($1, $2, $3, $4, $5, $6, $7, 0) RETURNING *',
      [studentId, req.userId, classroomId, name, grade, classNum, studentNum]
    );

    res.status(201).json({
      id: result.rows[0].id,
      name: result.rows[0].name,
      grade: result.rows[0].grade,
      classNum: result.rows[0].class_num,
      studentNum: result.rows[0].student_num,
      score: result.rows[0].score,
      dailyScores: {}
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ error: '학생 추가 중 오류가 발생했습니다.' });
  }
});

// 학생 수정
router.put('/:id', auth, [
  body('name').trim().notEmpty().withMessage('이름을 입력하세요.'),
  body('grade').isInt({ min: 1, max: 6 }).withMessage('학년은 1-6 사이의 숫자여야 합니다.'),
  body('classNum').isInt({ min: 1 }).withMessage('반은 1 이상의 숫자여야 합니다.'),
  body('studentNum').isInt({ min: 1 }).withMessage('번호는 1 이상의 숫자여야 합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, grade, classNum, studentNum } = req.body;
    const newId = `${grade}-${classNum}-${studentNum}`;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 학생 존재 확인
      const checkResult = await client.query(
        'SELECT * FROM students WHERE id = $1 AND user_id = $2',
        [id, req.userId]
      );

      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
      }

      const student = checkResult.rows[0];

      if (id !== newId) {
        // ID가 변경되는 경우
        // 1. 새 ID로 학생 생성
        await client.query(
          'INSERT INTO students (id, user_id, name, grade, class_num, student_num, score) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [newId, req.userId, name, grade, classNum, studentNum, student.score]
        );

        // 2. 점수 데이터 이전
        await client.query(
          'UPDATE daily_scores SET student_id = $1 WHERE student_id = $2',
          [newId, id]
        );

        // 3. 기존 학생 삭제
        await client.query('DELETE FROM students WHERE id = $1', [id]);
      } else {
        // ID가 동일한 경우 이름만 업데이트
        await client.query(
          'UPDATE students SET name = $1, grade = $2, class_num = $3, student_num = $4 WHERE id = $5',
          [name, grade, classNum, studentNum, id]
        );
      }

      await client.query('COMMIT');

      res.json({
        id: newId,
        name,
        grade,
        classNum,
        studentNum,
        score: student.score
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: '학생 수정 중 오류가 발생했습니다.' });
  }
});

// 학생 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM students WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
    }

    res.json({ message: '학생이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: '학생 삭제 중 오류가 발생했습니다.' });
  }
});

// CSV 일괄 업로드
router.post('/bulk-upload', auth, async (req, res) => {
  try {
    const { students, classroomId } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: '유효한 학생 데이터를 제공하세요.' });
    }

    if (!classroomId) {
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

    const client = await pool.connect();
    let successCount = 0;

    try {
      await client.query('BEGIN');

      for (const student of students) {
        const { name, grade, classNum, studentNum } = student;
        const studentId = `${classroomId}-${grade}-${classNum}-${studentNum}`;

        // 기존 학생 확인
        const existing = await client.query(
          'SELECT * FROM students WHERE id = $1 AND classroom_id = $2',
          [studentId, classroomId]
        );

        if (existing.rows.length > 0) {
          // 기존 학생 업데이트 (이름만)
          await client.query(
            'UPDATE students SET name = $1 WHERE id = $2 AND classroom_id = $3',
            [name, studentId, classroomId]
          );
        } else {
          // 새 학생 추가
          await client.query(
            'INSERT INTO students (id, user_id, classroom_id, name, grade, class_num, student_num, score) VALUES ($1, $2, $3, $4, $5, $6, $7, 0)',
            [studentId, req.userId, classroomId, name, grade, classNum, studentNum]
          );
        }
        successCount++;
      }

      await client.query('COMMIT');
      res.json({ message: `${successCount}명의 학생이 업데이트되었습니다.`, count: successCount });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'CSV 업로드 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
