import ExcelJS from 'exceljs';
import {
  seoulDateRangeDaily,
  seoulDateRangeWeekly,
  seoulDateRangeMonthly,
  seoulDateRangeLast30Days,
  seoulDateRangeCustom,
} from './koreaDate';

function readRuleDayValue(dailyEntry, ruleId) {
  if (!dailyEntry || typeof dailyEntry !== 'object') return null;
  const raw =
    dailyEntry[String(ruleId)] !== undefined
      ? dailyEntry[String(ruleId)]
      : dailyEntry[ruleId];
  if (raw === undefined || raw === null) return null;
  const scoreValue = typeof raw === 'object' && raw !== null && 'value' in raw ? raw.value : raw;
  const n = Number(scoreValue);
  return Number.isFinite(n) ? n : null;
}

function getDateRangeArray(periodFilter, customStartDate, customEndDate) {
  switch (periodFilter) {
    case 'daily':
      return seoulDateRangeDaily();
    case 'weekly':
      return seoulDateRangeWeekly();
    case 'monthly':
      return seoulDateRangeMonthly();
    case 'last30days':
      return seoulDateRangeLast30Days();
    case 'custom':
      return seoulDateRangeCustom(customStartDate, customEndDate);
    default:
      return null;
  }
}

/** YYYY-MM-DD 문자열 오름차순 */
function sortYmdAsc(dates) {
  return [...new Set(dates)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function collectDatesWithNonzeroForRule(filteredStudents, ruleId) {
  const set = new Set();
  filteredStudents.forEach((student) => {
    const daily = student.dailyScores || {};
    Object.keys(daily).forEach((dateStr) => {
      const v = readRuleDayValue(daily[dateStr], ruleId);
      if (v !== null && v !== 0) set.add(dateStr);
    });
  });
  return sortYmdAsc([...set]);
}

function getColumnDates(periodFilter, customStartDate, customEndDate, filteredStudents, ruleId) {
  if (periodFilter === 'all') {
    return collectDatesWithNonzeroForRule(filteredStudents, ruleId);
  }
  const range = getDateRangeArray(periodFilter, customStartDate, customEndDate);
  if (!range || range.length === 0) return [];
  return sortYmdAsc(range);
}

function periodLabelText(periodFilter, customStartDate, customEndDate) {
  switch (periodFilter) {
    case 'all':
      return '전체';
    case 'daily':
      return '오늘';
    case 'weekly':
      return '이번주';
    case 'monthly':
      return '이번달';
    case 'last30days':
      return '최근30일';
    case 'custom':
      return `${customStartDate}_${customEndDate}`;
    default:
      return periodFilter;
  }
}

function sanitizeFilenamePart(s) {
  return String(s).replace(/[/\\?%*:|"<>]/g, '_').trim() || '규칙';
}

function triggerDownload(buffer, filename) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 규칙별 순위표와 동일한 기간·정렬로 일별 점수 열이 포함된 xlsx를 생성해 다운로드합니다.
 *
 * @param {object} params
 * @param {object} params.rule — { id, name }
 * @param {Array} params.students — 순위표에 쓰이는 전체 학생 목록 (App과 동일)
 * @param {Array} params.filteredStudentsWithScores — 기간 필터가 반영된 dailyScores
 * @param {object} params.filteredStudentRuleScores — { [studentId]: { [ruleId]: { positive, negative, total } } }
 * @param {string} params.periodFilter
 * @param {string} params.customStartDate
 * @param {string} params.customEndDate
 */
export async function exportRuleRankingExcel({
  rule,
  students,
  filteredStudentsWithScores,
  filteredStudentRuleScores,
  periodFilter,
  customStartDate,
  customEndDate,
}) {
  const ruleId = rule.id;
  const columnDates = getColumnDates(
    periodFilter,
    customStartDate,
    customEndDate,
    filteredStudentsWithScores,
    ruleId
  );

  const ranked = [...students]
    .map((s) => {
      const scoreData = filteredStudentRuleScores[s.id]?.[ruleId];
      const ruleScore =
        scoreData && typeof scoreData === 'object' ? scoreData.total : scoreData || 0;
      return { ...s, ruleScore };
    })
    .sort((a, b) => {
      if (b.ruleScore !== a.ruleScore) return b.ruleScore - a.ruleScore;
      if (a.grade !== b.grade) return a.grade - b.grade;
      return a.studentNum - b.studentNum;
    });

  const byId = new Map(filteredStudentsWithScores.map((s) => [s.id, s]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = '학급 관리';
  const sheet = workbook.addWorksheet('규칙별상세', {
    views: [{ state: 'frozen', ySplit: 1, xSplit: 8 }],
  });

  const fixedHeaders = ['순위', '학년', '반', '번호', '이름', '총점', '양수합', '음수합'];
  sheet.addRow([...fixedHeaders, ...columnDates]);

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  ranked.forEach((student, idx) => {
    const sd = filteredStudentRuleScores[student.id]?.[ruleId];
    let positive = '';
    let negative = '';
    let total = student.ruleScore;
    if (sd && typeof sd === 'object') {
      positive = sd.positive || 0;
      negative = sd.negative || 0;
      total = sd.total;
    }
    const fs = byId.get(student.id);
    const daily = fs?.dailyScores || {};
    const dateCells = columnDates.map((d) => {
      const v = readRuleDayValue(daily[d], ruleId);
      if (v === null || v === undefined || v === 0) return '';
      return v;
    });
    sheet.addRow([
      idx + 1,
      student.grade,
      student.classNum,
      student.studentNum,
      student.name,
      total,
      positive,
      negative,
      ...dateCells,
    ]);
  });

  sheet.columns = [
    { width: 6 },
    { width: 6 },
    { width: 6 },
    { width: 6 },
    { width: 14 },
    { width: 8 },
    { width: 8 },
    { width: 8 },
    ...columnDates.map(() => ({ width: 12 })),
  ];

  const periodPart = sanitizeFilenamePart(periodLabelText(periodFilter, customStartDate, customEndDate));
  const rulePart = sanitizeFilenamePart(rule.name);
  const filename = `${rulePart}_순위상세_${periodPart}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer, filename);
}
