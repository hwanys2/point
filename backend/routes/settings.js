const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// 사용자별 앱 설정 테이블 생성 (초기 실행 시)
const initSettingsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) DEFAULT '학급 관리 시스템',
        subtitle VARCHAR(200) DEFAULT '학년/반/번호 기반 관리 및 실시간 점수 순위표',
        icon_id VARCHAR(50) DEFAULT 'Award',
        icon_color VARCHAR(20) DEFAULT '#4f46e5',
        font VARCHAR(100) DEFAULT '''Inter'', sans-serif',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (error) {
    console.error('Settings table init error:', error);
  }
};

initSettingsTable();

// 설정 조회
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      // 기본 설정 생성
      const defaultSettings = {
        title: '학급 관리 시스템',
        subtitle: '학년/반/번호 기반 관리 및 실시간 점수 순위표',
        iconId: 'Award',
        iconColor: '#4f46e5',
        font: "'Inter', sans-serif"
      };

      await pool.query(
        `INSERT INTO user_settings (user_id, title, subtitle, icon_id, icon_color, font)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [req.userId, defaultSettings.title, defaultSettings.subtitle, 
         defaultSettings.iconId, defaultSettings.iconColor, defaultSettings.font]
      );

      return res.json(defaultSettings);
    }

    const settings = result.rows[0];
    res.json({
      title: settings.title,
      subtitle: settings.subtitle,
      iconId: settings.icon_id,
      iconColor: settings.icon_color,
      font: settings.font
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: '설정 조회 중 오류가 발생했습니다.' });
  }
});

// 설정 업데이트
router.put('/', auth, [
  body('title').trim().notEmpty().withMessage('제목을 입력하세요.'),
  body('subtitle').optional().trim(),
  body('iconId').notEmpty().withMessage('아이콘을 선택하세요.'),
  body('iconColor').matches(/^#[0-9A-F]{6}$/i).withMessage('유효한 색상 코드를 입력하세요.'),
  body('font').notEmpty().withMessage('폰트를 선택하세요.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, subtitle, iconId, iconColor, font } = req.body;

    await pool.query(
      `INSERT INTO user_settings (user_id, title, subtitle, icon_id, icon_color, font)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id)
       DO UPDATE SET 
         title = $2,
         subtitle = $3,
         icon_id = $4,
         icon_color = $5,
         font = $6,
         updated_at = CURRENT_TIMESTAMP`,
      [req.userId, title, subtitle || '', iconId, iconColor, font]
    );

    res.json({
      message: '설정이 업데이트되었습니다.',
      settings: { title, subtitle, iconId, iconColor, font }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: '설정 업데이트 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
