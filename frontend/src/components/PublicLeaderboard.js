import React, { useState, useEffect, useMemo } from 'react';
import { ListOrdered, Calendar, Award, Clock, Shirt, BookOpenCheck, Sparkles, Armchair, Smile, Lightbulb, Feather, ShieldCheck, UserPlus, Trash2, Palette, BarChart3 } from 'lucide-react';
import { publicAPI } from '../services/api';
import Footer from './Footer';

// 아이콘 매핑
const ICON_MAP = {
  Clock, Shirt, BookOpenCheck, Sparkles, Armchair, Smile, Lightbulb, 
  Feather, ShieldCheck, UserPlus, Trash2, Palette, Award, Calendar, BarChart3
};

const getIconComponent = (iconId) => {
  return ICON_MAP[iconId] || ListOrdered;
};

// 규칙별 득점 비교 차트 컴포넌트
const PublicRuleComparison = ({ students, rules }) => {
  const maxScore = useMemo(() => {
    return Math.max(1, ...students.map(s => s.totalScore || 0));
  }, [students]);

  // 각 학생의 규칙별 점수 계산
  const studentRuleScores = useMemo(() => {
    const scores = {};
    students.forEach(student => {
      scores[student.id] = {};
      Object.values(student.dailyScores || {}).forEach(dayScores => {
        Object.values(dayScores).forEach(scoreEntry => {
          const ruleId = rules.find(r => r.name === scoreEntry.ruleName)?.id;
          if (ruleId) {
            scores[student.id][ruleId] = (scores[student.id][ruleId] || 0) + scoreEntry.value;
          }
        });
      });
    });
    return scores;
  }, [students, rules]);

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
          
          if (totalScore === 0) return null;
          
          const overallPercentage = (totalScore / maxScore) * 100;

          return (
            <div key={student.id} className="relative">
              <div className="text-sm font-bold text-gray-700 mb-1 flex justify-between">
                <span>{student.name} ({totalScore}점)</span>
              </div>
              
              <div 
                className="flex h-5 rounded-md overflow-hidden shadow-md border border-gray-300"
                style={{ width: `${overallPercentage}%`, minWidth: '10%' }}
              >
                {rules.map(rule => {
                  const score = scores[rule.id] || 0;
                  const relativePercentage = (score / totalScore) * 100;
                  
                  if (relativePercentage > 0) {
                    return (
                      <div 
                        key={rule.id} 
                        className={`h-full`}
                        style={{ width: `${relativePercentage}%`, backgroundColor: rule.color }}
                        title={`${student.name} - ${rule.name}: ${score}점`}
                      />
                    );
                  }
                  return null;
                })}
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

  const { settings, rules } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center">
            <img 
              src="/logo.png" 
              alt="학급 관리 시스템 로고" 
              className="h-16 sm:h-20 md:h-24 w-auto object-contain mb-3"
            />
            <p className="text-sm text-gray-500">
              {settings.schoolName} • {settings.teacherName} 선생님
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
                  <th className="hidden md:table-cell px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">규칙별 점수</th>
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
                    <td className="hidden md:table-cell px-3 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {rules.map(rule => {
                          const RuleIcon = getIconComponent(rule.icon_id);
                          const score = Object.values(student.dailyScores || {})
                            .flatMap(day => Object.values(day))
                            .filter(s => s.ruleName === rule.name)
                            .reduce((sum, s) => sum + s.value, 0);
                          
                          return (
                            <span key={rule.id} className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs rounded-lg" style={{ color: rule.color }}>
                              <RuleIcon className="w-3 h-3 mr-1" />
                              {score}
                            </span>
                          );
                        })}
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
