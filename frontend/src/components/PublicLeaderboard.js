import React, { useState, useEffect, useMemo } from 'react';
import { ListOrdered, Calendar, Award, Clock, Shirt, BookOpenCheck, Sparkles, Armchair, Smile, Lightbulb, Feather, ShieldCheck, UserPlus, Trash2, Palette, BarChart3 } from 'lucide-react';
import { publicAPI } from '../services/api';

// 아이콘 매핑
const ICON_MAP = {
  Clock, Shirt, BookOpenCheck, Sparkles, Armchair, Smile, Lightbulb, 
  Feather, ShieldCheck, UserPlus, Trash2, Palette, Award, Calendar, BarChart3
};

const getIconComponent = (iconId) => {
  return ICON_MAP[iconId] || ListOrdered;
};

const PublicLeaderboard = ({ token }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodFilter, setPeriodFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
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

  useEffect(() => {
    if (token) {
      loadData();
    }
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

  const { settings, leaderboard, rules } = data;
  const IconComponent = getIconComponent(settings.iconId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <IconComponent className="w-8 h-8 mr-3" style={{ color: settings.iconColor }} />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: settings.font }}>
                {settings.title}
              </h1>
              <p className="text-gray-600 mt-1">{settings.subtitle}</p>
              <p className="text-sm text-gray-500 mt-2">
                {settings.schoolName} • {settings.teacherName} 선생님
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <ListOrdered className="w-6 h-6 mr-2 text-indigo-500" /> 
            {periodFilter === 'all' ? '전체' : 
             periodFilter === 'daily' ? '오늘' :
             periodFilter === 'weekly' ? '최근 7일' :
             periodFilter === 'monthly' ? '최근 30일' :
             '선택한 기간'} 순위표
          </h2>
          
          {/* 기간 필터 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                onClick={() => setPeriodFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  periodFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 border'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setPeriodFilter('daily')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  periodFilter === 'daily'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 border'
                }`}
              >
                오늘
              </button>
              <button
                onClick={() => setPeriodFilter('weekly')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  periodFilter === 'weekly'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 border'
                }`}
              >
                최근 7일
              </button>
              <button
                onClick={() => setPeriodFilter('monthly')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  periodFilter === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 border'
                }`}
              >
                최근 30일
              </button>
              <button
                onClick={() => setPeriodFilter('custom')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  periodFilter === 'custom'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 border'
                }`}
              >
                기간 선택
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
                    max={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 순위표 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">순위</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">학년</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">반</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">번호</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">이름</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">총점</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">규칙별 점수</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedStudents.map((student, index) => (
                  <tr key={student.id} className={`transition duration-150 ease-in-out ${index % 2 === 0 ? 'hover:bg-gray-50' : 'hover:bg-indigo-50'} ${index < 3 ? 'bg-yellow-50/50 font-bold' : ''}`}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`text-xl ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-yellow-900' : 'text-gray-600'}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{student.grade}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{student.classNumber}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{student.studentNumber}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-2xl font-extrabold text-right text-indigo-700">
                      {student.totalScore}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
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
      </div>
    </div>
  );
};

export default PublicLeaderboard;
