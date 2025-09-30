const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// 공개 리더보드 조회 (토큰 기반)
router.get('/leaderboard/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { period = 'all', startDate, endDate } = req.query;

    // 토큰으로 사용자 설정 조회
    const settingsResult = await pool.query(
      'SELECT us.*, u.username, u.school_name FROM user_settings us JOIN users u ON us.user_id = u.id WHERE us.share_token = $1 AND us.share_enabled = true',
      [token]
    );

    if (settingsResult.rows.length === 0) {
      return res.status(404).json({ error: '공유 링크를 찾을 수 없거나 비활성화되었습니다.' });
    }

    const settings = settingsResult.rows[0];
    const userId = settings.user_id;

    // 기간 필터링 로직
    let dateFilter = '';
    let queryParams = [userId];
    let paramIndex = 2;

    if (period === 'daily') {
      dateFilter = `AND s.date = CURRENT_DATE`;
    } else if (period === 'weekly') {
      dateFilter = `AND s.date >= CURRENT_DATE - INTERVAL '7 days'`;
    } else if (period === 'monthly') {
      dateFilter = `AND s.date >= CURRENT_DATE - INTERVAL '30 days'`;
    } else if (period === 'custom' && startDate && endDate) {
      dateFilter = `AND s.date >= $${paramIndex} AND s.date <= $${paramIndex + 1}`;
      queryParams.push(startDate, endDate);
      paramIndex += 2;
    }

    // 학생 목록 조회
    const studentsResult = await pool.query(
      `SELECT id, name, grade, class_number, student_number, created_at 
       FROM students 
       WHERE user_id = $1 
       ORDER BY grade, class_number, student_number`,
      [userId]
    );

    const students = studentsResult.rows;
    const studentMap = {};
    students.forEach(student => {
      studentMap[student.id] = {
        id: student.id,
        name: student.name,
        grade: student.grade,
        classNumber: student.class_number,
        studentNumber: student.student_number,
        totalScore: 0,
        dailyScores: {}
      };
    });

    // 점수 조회
    const scoresQuery = `
      SELECT s.student_id, s.rule_id, s.value, s.date, r.name as rule_name, r.color as rule_color, r.icon_id as rule_icon
      FROM daily_scores s
      JOIN rules r ON s.rule_id = r.id
      WHERE s.user_id = $1 ${dateFilter}
      ORDER BY s.date DESC, s.student_id
    `;

    const scoresResult = await pool.query(scoresQuery, queryParams);

    // 점수 데이터 처리
    scoresResult.rows.forEach(score => {
      const dateStr = score.date instanceof Date 
        ? score.date.toISOString().split('T')[0] 
        : score.date;
      
      if (studentMap[score.student_id]) {
        studentMap[score.student_id].totalScore += score.value;
        
        if (!studentMap[score.student_id].dailyScores[dateStr]) {
          studentMap[score.student_id].dailyScores[dateStr] = {};
        }
        studentMap[score.student_id].dailyScores[dateStr][score.rule_id] = {
          value: score.value,
          ruleName: score.rule_name,
          ruleColor: score.rule_color,
          ruleIcon: score.rule_icon
        };
      }
    });

    // 규칙 목록 조회
    const rulesResult = await pool.query(
      'SELECT id, name, color, icon_id FROM rules WHERE user_id = $1 ORDER BY name',
      [userId]
    );

    const leaderboard = Object.values(studentMap)
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    res.json({
      settings: {
        title: settings.title,
        subtitle: settings.subtitle,
        iconId: settings.icon_id,
        iconColor: settings.icon_color,
        font: settings.font,
        schoolName: settings.school_name,
        teacherName: settings.username
      },
      leaderboard,
      rules: rulesResult.rows,
      period,
      startDate,
      endDate
    });

  } catch (error) {
    console.error('Public leaderboard error:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: '리더보드 조회 중 오류가 발생했습니다.', details: error.message });
  }
});

module.exports = router;
