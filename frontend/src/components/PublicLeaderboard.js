import React, { useState, useEffect, useMemo } from 'react';
import { ListOrdered, BarChart3 } from 'lucide-react';
import { publicAPI } from '../services/api';
import Footer from './Footer';

// 규칙별 점수 막대 그래프 컴포넌트 (양수/음수 분리)
const RuleScoreBar = ({ student, rules, studentRuleScores }) => {
  const scores = studentRuleScores[student.id] || {};
  const totalScore = student.totalScore || 0;
  
  // 양수/음수 점수 합계 계산 (해당 학생만)
  let totalPositive = 0;
  let totalNegative = 0;
  
  Object.values(scores).forEach(scoreData => {
    if (scoreData && typeof scoreData === 'object') {
      totalPositive += scoreData.positive || 0;
      totalNegative += scoreData.negative || 0;
    }
  });
  
  // 해당 학생의 점수 기준으로 계산 (자기 점수 100%)
  const totalRange = totalPositive + totalNegative;
  const hasNegative = totalNegative > 0;
  const zeroPosition = hasNegative ? (totalNegative / totalRange) * 100 : 0;
  
  if (totalPositive === 0 && totalNegative === 0) {
    return <div className="h-4 w-full bg-gray-200 rounded"></div>;
  }
  
  return (
    <div className="relative w-full h-4" title={`총점: ${totalScore}점 (양수: +${totalPositive}, 음수: -${totalNegative})`}>
      {/* 실제 점수 막대 (액체) */}
      <div className="absolute inset-0 flex overflow-hidden rounded">
        {/* 회색 배경 (유리관) - 막대보다 4px 크게 */}
        <div className="absolute inset-x-0 bg-gray-200 rounded" style={{ top: '-2px', bottom: '-2px' }}></div>
      
        {/* 0 지점 구분선 (음수가 있을 때만) */}
        {hasNegative && (
          <div 
            className="absolute w-0.5 bg-gray-800 z-[2]"
            style={{ left: `${zeroPosition}%`, top: '-2px', bottom: '-2px' }}
          ></div>
        )}
      
        {/* 점수 막대 내용 */}
        <div className="absolute inset-0 flex z-[1]">
        {hasNegative ? (
          <>
            {/* 음수 영역 (0 지점 왼쪽) */}
            <div 
              className="relative flex flex-row-reverse"
              style={{ width: `${zeroPosition}%` }}
            >
              {rules.map((rule, index, arr) => {
                const scoreData = scores[rule.id];
                const negativeScore = scoreData?.negative || 0;
                const percentage = totalNegative > 0 ? (negativeScore / totalNegative) * 100 : 0;
                const visibleRules = arr.filter(r => {
                  const sd = scores[r.id];
                  return (sd?.negative || 0) > 0;
                });
                const isFirst = index === arr.length - 1 || rule.id === visibleRules[visibleRules.length - 1]?.id;
                
                if (percentage > 0) {
                  return (
                    <div 
                      key={`neg-${rule.id}`}
                      className={`opacity-75 ${isFirst ? 'rounded-l' : ''}`}
                      style={{ width: `${percentage}%`, height: '75%', alignSelf: 'center', backgroundColor: rule.color }}
                      title={`${rule.name}: -${negativeScore}점`}
                    />
                  );
                }
                return null;
              })}
            </div>
            
            {/* 양수 영역 (0 지점 오른쪽) */}
            <div 
              className="relative flex"
              style={{ width: `${100 - zeroPosition}%` }}
            >
              {rules.map((rule, index, arr) => {
                const scoreData = scores[rule.id];
                const positiveScore = scoreData?.positive || 0;
                const percentage = totalPositive > 0 ? (positiveScore / totalPositive) * 100 : 0;
                const visibleRules = arr.filter(r => {
                  const sd = scores[r.id];
                  return (sd?.positive || 0) > 0;
                });
                const isLast = index === arr.length - 1 || rule.id === visibleRules[visibleRules.length - 1]?.id;
                
                if (percentage > 0) {
                  return (
                    <div 
                      key={`pos-${rule.id}`}
                      className={`h-full ${isLast ? 'rounded-r' : ''}`}
                      style={{ width: `${percentage}%`, backgroundColor: rule.color }}
                      title={`${rule.name}: +${positiveScore}점`}
                    />
                  );
                }
                return null;
              })}
            </div>
          </>
        ) : (
          /* 음수가 없을 때: 0부터 최대값까지 범위로 표시 */
          <div className="relative flex w-full">
            {rules.map((rule, index, arr) => {
              const scoreData = scores[rule.id];
              const positiveScore = scoreData?.positive || 0;
              const percentage = totalPositive > 0 ? (positiveScore / totalPositive) * 100 : 0;
              const visibleRules = arr.filter(r => {
                const sd = scores[r.id];
                return (sd?.positive || 0) > 0;
              });
              const isFirst = index === 0 || rule.id === visibleRules[0]?.id;
              const isLast = index === arr.length - 1 || rule.id === visibleRules[visibleRules.length - 1]?.id;
        
        if (percentage > 0) {
          return (
            <div 
                    key={`pos-${rule.id}`}
                    className={`h-full ${isFirst ? 'rounded-l' : ''} ${isLast ? 'rounded-r' : ''}`}
              style={{ width: `${percentage}%`, backgroundColor: rule.color }}
                    title={`${rule.name}: ${positiveScore}점`}
            />
          );
        }
        return null;
      })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

// 규칙별 득점 비교 차트 컴포넌트 (양수/음수 분리)
const PublicRuleComparison = ({ students, rules }) => {
  // 각 학생의 규칙별 점수 계산 (양수/음수 분리) - 백엔드에서 이미 필터링된 dailyScores 사용
  const studentRuleScores = useMemo(() => {
    const scores = {};
    students.forEach(student => {
      scores[student.id] = {};
      // 백엔드에서 이미 필터링된 dailyScores만 사용
      Object.values(student.dailyScores || {}).forEach(dayScores => {
        Object.entries(dayScores).forEach(([ruleId, scoreEntry]) => {
          // scoreEntry가 객체인 경우 value 속성 사용, 아니면 직접 값 사용
          const scoreValue = typeof scoreEntry === 'object' ? scoreEntry.value : scoreEntry;
          if (scoreValue !== 0 && rules.some(r => r.id === parseInt(ruleId, 10))) {
            if (!scores[student.id][ruleId]) {
              scores[student.id][ruleId] = { positive: 0, negative: 0, total: 0 };
            }
            
            if (scoreValue > 0) {
              scores[student.id][ruleId].positive += scoreValue;
            } else {
              scores[student.id][ruleId].negative += Math.abs(scoreValue);
            }
            scores[student.id][ruleId].total += scoreValue;
          }
        });
      });
    });
    return scores;
  }, [students, rules]);

  // 전체 범위의 최대/최소값 계산
  const rangeValues = useMemo(() => {
    let maxPositive = 0;
    let maxNegative = 0;
    
    students.forEach(student => {
      const scores = studentRuleScores[student.id] || {};
      let studentPositive = 0;
      let studentNegative = 0;
      
      Object.values(scores).forEach(scoreData => {
        if (scoreData && typeof scoreData === 'object') {
          studentPositive += scoreData.positive || 0;
          studentNegative += scoreData.negative || 0;
        }
      });
      
      maxPositive = Math.max(maxPositive, studentPositive);
      maxNegative = Math.max(maxNegative, studentNegative);
    });
    
    const totalRange = maxPositive + maxNegative;
    const hasNegative = maxNegative > 0;
    const zeroPosition = hasNegative ? (maxNegative / totalRange) * 100 : 0;
    
    return { 
      maxPositive: maxPositive || 1, 
      maxNegative: maxNegative || 0,
      totalRange: totalRange || 1,
      hasNegative,
      zeroPosition
    };
  }, [students, studentRuleScores]);

  if (students.length === 0 || rules.length === 0 || students.every(s => (s.totalScore || 0) === 0)) {
    return (
      <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100">
        <p>등록된 학생이 없거나 규칙/점수가 부여되지 않았습니다.</p>
      </div>
    );
  }
  
  const sortedStudents = [...students].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-2xl border border-gray-100">
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-indigo-500" /> 
        <span>규칙별 득점 비교 차트</span>
      </h3>
      
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 p-2 rounded-lg border bg-gray-50">
        {rules.map(rule => (
          <span key={rule.id} className="flex items-center text-xs font-medium text-gray-600">
            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: rule.color }}></div>
            {rule.name}
          </span>
        ))}
      </div>
      
      <div className="space-y-6">
        {sortedStudents.map(student => {
          const scores = studentRuleScores[student.id] || {};
          const totalScore = student.totalScore || 0;
          
          // 양수/음수 점수 합계 계산
          let totalPositive = 0;
          let totalNegative = 0;
          
          Object.values(scores).forEach(scoreData => {
            if (scoreData && typeof scoreData === 'object') {
              totalPositive += scoreData.positive || 0;
              totalNegative += scoreData.negative || 0;
            }
          });
          
          if (totalPositive === 0 && totalNegative === 0) return null;

          return (
            <div key={student.id} className="relative flex items-center gap-3">
              <div className="text-sm font-bold text-gray-700 min-w-[80px]">
                {student.name}
              </div>
              
              <div className="flex-1 relative h-6">
                {/* 실제 점수 막대 (액체) */}
                <div className="absolute inset-0 flex overflow-hidden rounded">
                  {/* 회색 배경 (유리관) - 막대보다 4px 크게 */}
                  <div className="absolute inset-x-0 bg-gray-200 rounded" style={{ top: '-2px', bottom: '-2px' }}></div>
                
                  {/* 0 지점 구분선 (음수가 있을 때만) */}
                  {rangeValues.hasNegative && (
                    <div 
                      className="absolute w-0.5 bg-gray-800 z-[2]"
                      style={{ left: `${rangeValues.zeroPosition}%`, top: '-2px', bottom: '-2px' }}
                    ></div>
                  )}
                
                  {/* 점수 막대 내용 */}
                  <div className="absolute inset-0 flex z-[1]">
                  {rangeValues.hasNegative ? (
                    <>
                      {/* 음수 영역 (0 지점 왼쪽) */}
                      <div 
                        className="relative flex flex-row-reverse"
                        style={{ width: `${rangeValues.zeroPosition}%` }}
                      >
                  {rules.map((rule, index, arr) => {
                    const scoreData = scores[rule.id];
                    const negativeScore = scoreData?.negative || 0;
                    const percentage = (negativeScore / rangeValues.maxNegative) * 100;
                    const visibleRules = arr.filter(r => {
                      const sd = scores[r.id];
                      return (sd?.negative || 0) > 0;
                    });
                    const isFirst = index === arr.length - 1 || rule.id === visibleRules[visibleRules.length - 1]?.id;
                    
                    if (percentage > 0) {
                      return (
                        <div 
                          key={`neg-${rule.id}`}
                          className={`opacity-75 ${isFirst ? 'rounded-l' : ''}`}
                          style={{ width: `${percentage}%`, height: '75%', alignSelf: 'center', backgroundColor: rule.color }}
                          title={`${student.name} - ${rule.name}: -${negativeScore}점`}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
                
                {/* 양수 영역 (0 지점 오른쪽) */}
                <div 
                  className="relative flex"
                  style={{ width: `${100 - rangeValues.zeroPosition}%` }}
                >
                  {rules.map((rule, index, arr) => {
                    const scoreData = scores[rule.id];
                    const positiveScore = scoreData?.positive || 0;
                    const percentage = (positiveScore / rangeValues.maxPositive) * 100;
                    const visibleRules = arr.filter(r => {
                      const sd = scores[r.id];
                      return (sd?.positive || 0) > 0;
                    });
                    const isLast = index === arr.length - 1 || rule.id === visibleRules[visibleRules.length - 1]?.id;
                    
                    if (percentage > 0) {
                      return (
                        <div 
                          key={`pos-${rule.id}`}
                          className={`h-full ${isLast ? 'rounded-r' : ''}`}
                          style={{ width: `${percentage}%`, backgroundColor: rule.color }}
                          title={`${student.name} - ${rule.name}: +${positiveScore}점`}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </>
                  ) : (
                    /* 음수가 없을 때: 0부터 최대값까지 범위로 표시 */
                    <div className="relative flex w-full">
                      {rules.map((rule, index, arr) => {
                        const scoreData = scores[rule.id];
                        const positiveScore = scoreData?.positive || 0;
                        const percentage = (positiveScore / rangeValues.maxPositive) * 100;
                        const visibleRules = arr.filter(r => {
                          const sd = scores[r.id];
                          return (sd?.positive || 0) > 0;
                        });
                        const isFirst = index === 0 || rule.id === visibleRules[0]?.id;
                        const isLast = index === arr.length - 1 || rule.id === visibleRules[visibleRules.length - 1]?.id;
                        
                        if (percentage > 0) {
                          return (
                            <div 
                              key={`pos-${rule.id}`}
                              className={`h-full ${isFirst ? 'rounded-l' : ''} ${isLast ? 'rounded-r' : ''}`}
                              style={{ width: `${percentage}%`, backgroundColor: rule.color }}
                              title={`${student.name} - ${rule.name}: ${positiveScore}점`}
                      />
                    );
                  }
                  return null;
                })}
                    </div>
                  )}
                  </div>
                </div>
              </div>
              
              <div className="text-xs font-semibold min-w-[100px] text-right">
                {rangeValues.hasNegative && (
                  <>
                    <span className="text-green-600">+{totalPositive}</span>
                    {' '}
                    <span className="text-red-600">-{totalNegative}</span>
                    {' = '}
                  </>
                )}
                <span className={totalScore >= 0 ? 'text-indigo-700' : 'text-red-700'}>{totalScore}점</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PublicLeaderboard = ({ token }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodFilter, setPeriodFilter] = useState('all');
  const [randomLogo] = useState(() => Math.random() < 0.5 ? 'logo.png' : 'logo2.png');
  const getLocalToday = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const [customStartDate, setCustomStartDate] = useState(getLocalToday());
  const [customEndDate, setCustomEndDate] = useState(getLocalToday());

  useEffect(() => {
    const run = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const params = { period: periodFilter };
        if (periodFilter === 'custom') {
          params.startDate = customStartDate;
          params.endDate = customEndDate;
        }
        const response = await publicAPI.getLeaderboard(token, params);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token, periodFilter, customStartDate, customEndDate]);

  const sortedStudents = useMemo(() => {
    if (!data?.leaderboard) return [];
    return data.leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  }, [data]);

  // 학생 규칙별 점수 계산 (양수/음수 분리)
  const studentRuleScores = useMemo(() => {
    if (!data?.leaderboard || !data?.rules) return {};
    
    const scores = {};
    data.leaderboard.forEach(student => {
      scores[student.id] = {};
      Object.values(student.dailyScores || {}).forEach(dayScores => {
        Object.entries(dayScores).forEach(([ruleId, scoreEntry]) => {
          const scoreValue = typeof scoreEntry === 'object' ? scoreEntry.value : scoreEntry;
          if (scoreValue !== 0 && data.rules.some(r => r.id === parseInt(ruleId, 10))) {
            if (!scores[student.id][ruleId]) {
              scores[student.id][ruleId] = { positive: 0, negative: 0, total: 0 };
            }
            
            if (scoreValue > 0) {
              scores[student.id][ruleId].positive += scoreValue;
            } else {
              scores[student.id][ruleId].negative += Math.abs(scoreValue);
            }
            scores[student.id][ruleId].total += scoreValue;
          }
        });
      });
    });
    return scores;
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">순위표를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">접근할 수 없습니다</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">데이터가 없습니다</h1>
          <p className="text-gray-600">순위표 데이터를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const { settings, rules, classrooms } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center">
            <img 
              src={`/${randomLogo}`}
              alt="학급 관리 시스템 로고" 
              className="h-16 sm:h-20 md:h-24 w-auto object-contain mb-3"
            />
            <p className="text-sm text-gray-500">
              {settings.schoolName && `${settings.schoolName} • `}
              {classrooms && classrooms.length > 0 ? classrooms[0].name : '학급'}
            </p>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* 기간 필터 */}
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">기간 선택</h3>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition ${
                periodFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 border'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setPeriodFilter('daily')}
              className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition ${
                periodFilter === 'daily'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 border'
              }`}
            >
              오늘
            </button>
            <button
              onClick={() => setPeriodFilter('weekly')}
              className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition ${
                periodFilter === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 border'
              }`}
            >
              <span className="hidden sm:inline">최근 </span>7일
            </button>
            <button
              onClick={() => setPeriodFilter('monthly')}
              className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition ${
                periodFilter === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 border'
              }`}
            >
              <span className="hidden sm:inline">최근 </span>30일
            </button>
            <button
              onClick={() => setPeriodFilter('custom')}
              className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition ${
                periodFilter === 'custom'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 border'
              }`}
            >
              기간<span className="hidden sm:inline"> 선택</span>
            </button>
          </div>
          
          {periodFilter === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div>
                <label className="text-sm text-gray-600 mr-2">시작일:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={customEndDate}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span className="text-gray-500">~</span>
              <div>
                <label className="text-sm text-gray-600 mr-2">종료일:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  max={getLocalToday()}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 종합 순위표 */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <ListOrdered className="w-6 h-6 mr-2 text-indigo-500" /> 
              {periodFilter === 'all' ? '전체' : 
               periodFilter === 'daily' ? '오늘' :
               periodFilter === 'weekly' ? '최근 7일' :
               periodFilter === 'monthly' ? '최근 30일' :
               '선택한 기간'} 순위표
            </h2>

          {/* 순위표 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider w-8 sm:w-16">순위</th>
                  <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider w-8 sm:w-12">학년</th>
                  <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider w-8 sm:w-12">반</th>
                  <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider w-8 sm:w-12">번호</th>
                  <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">이름</th>
                  <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider w-12 sm:w-24">총점</th>
                  <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider w-16 sm:w-32 md:w-40"><span className="md:hidden">분포</span><span className="hidden md:inline">규칙별 점수 분포</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedStudents.map((student, index) => (
                  <tr key={student.id} className={`transition duration-150 ease-in-out ${index % 2 === 0 ? 'hover:bg-gray-50' : 'hover:bg-indigo-50'} ${index < 3 ? 'bg-yellow-50/50 font-bold' : ''}`}>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center">
                      <span className={`text-sm sm:text-lg md:text-xl ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-yellow-900' : 'text-gray-600'}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{student.grade}</td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{student.classNumber}</td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{student.studentNumber}</td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-base sm:text-xl md:text-2xl font-extrabold text-right text-indigo-700">
                      {student.totalScore}
                    </td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-sm text-center">
                      <div className="w-12 sm:w-24 md:w-32 lg:w-40 mx-auto">
                        <RuleScoreBar student={student} rules={rules} studentRuleScores={studentRuleScores} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {sortedStudents.length === 0 && (
              <p className="text-center text-gray-500 py-8">순위표 데이터가 없습니다.</p>
            )}
          </div>
          </div>

          {/* 규칙별 득점 비교 차트 */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6">
            <PublicRuleComparison students={data.leaderboard || []} rules={rules || []} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublicLeaderboard;
