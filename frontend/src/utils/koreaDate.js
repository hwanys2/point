/**
 * 한국(서울) 달력 기준 날짜 유틸 (백엔드 utils/koreaDate.js와 동일 로직).
 */

const SEOUL = 'Asia/Seoul';

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function formatSeoulYmd(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function seoulYmdParts(date = new Date()) {
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

function addCalendarDaysYmd(y, m, d, deltaDays) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return ymdFromParts(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function seoulDateRangeDaily() {
  return [formatSeoulYmd()];
}

export function seoulDateRangeWeekly() {
  const { y, m, d } = seoulYmdParts();
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const mondayOffset = dow === 0 ? 6 : dow - 1;
  const dates = [];
  for (let i = mondayOffset; i >= 0; i--) {
    dates.push(addCalendarDaysYmd(y, m, d, -i));
  }
  return dates;
}

export function seoulDateRangeMonthly() {
  const { y, m, d } = seoulYmdParts();
  const dates = [];
  const end = new Date(Date.UTC(y, m - 1, d));
  for (let cur = new Date(Date.UTC(y, m - 1, 1)); cur <= end; cur.setUTCDate(cur.getUTCDate() + 1)) {
    dates.push(ymdFromParts(cur.getUTCFullYear(), cur.getUTCMonth() + 1, cur.getUTCDate()));
  }
  return dates;
}

export function seoulDateRangeLast30Days() {
  const { y, m, d } = seoulYmdParts();
  const dates = [];
  for (let i = 0; i < 30; i++) {
    dates.push(addCalendarDaysYmd(y, m, d, -i));
  }
  return dates;
}

/**
 * 커스텀 기간: 시작·끝 YYYY-MM-DD(서울에서 선택) 사이의 모든 날짜 (포함).
 * ISO 날짜만 받으므로 UTC 달력으로 순회해 타임존 이슈를 피함.
 */
export function seoulDateRangeCustom(startYmd, endYmd) {
  const [ys, ms, ds] = startYmd.split('-').map(Number);
  const [ye, me, de] = endYmd.split('-').map(Number);
  const dates = [];
  const end = new Date(Date.UTC(ye, me - 1, de));
  for (let cur = new Date(Date.UTC(ys, ms - 1, ds)); cur <= end; cur.setUTCDate(cur.getUTCDate() + 1)) {
    dates.push(ymdFromParts(cur.getUTCFullYear(), cur.getUTCMonth() + 1, cur.getUTCDate()));
  }
  return dates;
}
