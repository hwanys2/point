/**
 * 한국(서울) 달력 기준 날짜 유틸.
 * 점수/순위표는 YYYY-MM-DD 키로 저장되므로 서울 기준을 고정한다.
 */

const SEOUL = 'Asia/Seoul';

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** 주어진 시각을 서울 달력 YYYY-MM-DD로 반환 */
function formatSeoulYmd(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

/** node-pg 등이 돌려주는 PostgreSQL DATE → 저장된 달력 문자열 (서버 TZ 무관) */
function pgDateToYmd(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

/** 서울 기준 연·월·일 */
function seoulYmdParts(date = new Date()) {
  const f = new Intl.DateTimeFormat('en', {
    timeZone: SEOUL,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const parts = Object.fromEntries(
    f.formatToParts(date).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value])
  );
  return { y: +parts.year, m: +parts.month, d: +parts.day };
}

function ymdFromParts(y, m, d) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/** UTC 달력 연산으로 Y-M-D에서 일수 가감 후 YYYY-MM-DD */
function addCalendarDaysYmd(y, m, d, deltaDays) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return ymdFromParts(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** 오늘(서울)만 */
function seoulDateRangeDaily() {
  return [formatSeoulYmd()];
}

/** 이번 주 월요일 ~ 오늘(서울), 월요일 시작 */
function seoulDateRangeWeekly() {
  const { y, m, d } = seoulYmdParts();
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const mondayOffset = dow === 0 ? 6 : dow - 1;
  const dates = [];
  for (let i = mondayOffset; i >= 0; i--) {
    dates.push(addCalendarDaysYmd(y, m, d, -i));
  }
  return dates;
}

/** 이번 달 1일 ~ 오늘(서울) */
function seoulDateRangeMonthly() {
  const { y, m, d } = seoulYmdParts();
  const dates = [];
  const end = new Date(Date.UTC(y, m - 1, d));
  for (let cur = new Date(Date.UTC(y, m - 1, 1)); cur <= end; cur.setUTCDate(cur.getUTCDate() + 1)) {
    dates.push(ymdFromParts(cur.getUTCFullYear(), cur.getUTCMonth() + 1, cur.getUTCDate()));
  }
  return dates;
}

/** 최근 30일(오늘 포함 30개의 달력 날짜), [오늘, 어제, …] 순 — 기존 App과 동일 */
function seoulDateRangeLast30Days() {
  const { y, m, d } = seoulYmdParts();
  const dates = [];
  for (let i = 0; i < 30; i++) {
    dates.push(addCalendarDaysYmd(y, m, d, -i));
  }
  return dates;
}

/**
 * 공개 API용: 최근 30일 구간 [시작, 끝] (포함 범위, 달력 30일)
 * 끝 = 서울 오늘, 시작 = 서울 오늘에서 29일 전
 */
function seoulLast30DaysInclusiveBounds() {
  const { y, m, d } = seoulYmdParts();
  const end = ymdFromParts(y, m, d);
  const start = addCalendarDaysYmd(y, m, d, -29);
  return { start, end };
}

module.exports = {
  formatSeoulYmd,
  pgDateToYmd,
  seoulYmdParts,
  seoulDateRangeDaily,
  seoulDateRangeWeekly,
  seoulDateRangeMonthly,
  seoulDateRangeLast30Days,
  seoulLast30DaysInclusiveBounds,
  addCalendarDaysYmd
};
