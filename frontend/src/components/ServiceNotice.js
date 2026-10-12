import React from 'react';
import { ArrowUpRight, Calendar } from 'lucide-react';
import './ServiceNotice.css';

export default function ServiceNotice() {
  return (
    <aside className="service-notice" aria-labelledby="service-notice-title">
      <div className="service-notice-content">
        <span className="service-notice-label"><Calendar size={16} aria-hidden="true" /> 서비스 운영 안내</span>
        <h2 id="service-notice-title">ClassPoint는 <strong>2027년 2월까지</strong> 운영 후 종료됩니다.</h2>
        <p>그동안 ClassPoint를 이용해 주셔서 감사합니다. 학생 점수 관리, 영역별 랭킹, 학생 관리자 등 비슷한 기능을 <strong>포에듀케이터의 ‘학급 관리 · 활동 기록’</strong>에서 이용해 주세요.</p>
      </div>
      <a className="service-notice-link" href="https://www.foreducator.com/classmate/activities" target="_blank" rel="noopener noreferrer">
        포에듀케이터 활동 기록 바로가기
        <ArrowUpRight size={18} aria-hidden="true" />
        <span className="service-notice-sr-only"> (새 창)</span>
      </a>
    </aside>
  );
}
