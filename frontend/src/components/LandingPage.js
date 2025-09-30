import React from 'react';
import { Award, ListOrdered, Plus, ClipboardList, BarChart3, Calendar, CheckSquare, Sparkles, Zap, Shield, Users, KeySquare } from 'lucide-react';

const LandingPage = ({ onShowAuth }) => {
  // 샘플 데이터
  const sampleStudents = [
    { rank: 1, name: '김민준', grade: 5, class: 2, number: 15, score: 147 },
    { rank: 2, name: '이서윤', grade: 5, class: 2, number: 8, score: 142 },
    { rank: 3, name: '박지호', grade: 5, class: 2, number: 21, score: 138 },
    { rank: 4, name: '최예은', grade: 5, class: 2, number: 12, score: 135 },
    { rank: 5, name: '정하윤', grade: 5, class: 2, number: 5, score: 131 },
  ];

  const features = [
    { icon: Plus, title: '간편한 점수 부여', desc: '클릭 한 번으로 학생별 점수를 실시간 부여', color: 'text-blue-500' },
    { icon: BarChart3, title: '실시간 순위표', desc: '일간/주간/월간 기간별 순위를 한눈에 확인', color: 'text-green-500' },
    { icon: ClipboardList, title: '맞춤형 규칙', desc: '등교시간, 과제제출 등 원하는 규칙을 자유롭게 생성', color: 'text-purple-500' },
    { icon: Users, title: 'CSV 일괄 등록', desc: '학생 명단을 CSV로 한 번에 업로드', color: 'text-orange-500' },
    { icon: Calendar, title: '기간별 분석', desc: '오늘/주간/월간/사용자 지정 기간별 통계', color: 'text-pink-500' },
    { icon: KeySquare, title: '학생 관리자 권한', desc: '학생에게 특정 규칙만 체크 권한을 부여 (교사 관리)', color: 'text-emerald-600' },
    { icon: Shield, title: '안전한 데이터', desc: '개인별 데이터 보호 및 안전한 클라우드 저장', color: 'text-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Award className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">학급 관리 시스템</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onShowAuth('login')}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-semibold"
            >
              로그인
            </button>
            <button
              onClick={() => onShowAuth('register')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md"
            >
              무료로 시작하기
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4 mr-2" />
          무료로 시작하세요
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          학생 점수 관리,<br />
          <span className="text-indigo-600">이제는 쉽고 빠르게</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          실시간 순위표, 맞춤형 규칙, 기간별 분석까지.<br />
          <span className="font-semibold text-gray-800">학생 관리자(제한 권한) 계정</span>으로 학생이 스스로 점수를 체크하도록 맡겨보세요.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onShowAuth('register')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-lg shadow-lg hover:shadow-xl flex items-center"
          >
            <Zap className="w-5 h-5 mr-2" />
            지금 무료로 시작하기
          </button>
          <button
            onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-50 transition font-bold text-lg shadow-md border-2 border-indigo-200"
          >
            데모 보기
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">✨ 신용카드 불필요 · 5분 만에 시작</p>
      </section>

      {/* Sample Preview */}
      <section id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">실제 화면 미리보기</h2>
          <p className="text-xl text-gray-600">클릭 몇 번으로 학생 점수를 관리하고 순위를 확인하세요</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center">
            <ListOrdered className="w-6 h-6 text-white mr-3" />
            <h3 className="text-xl font-bold text-white">실시간 순위표 (샘플)</h3>
          </div>
          <div className="p-6">
            <table className="min-w-full">
              <thead>
                <tr className="bg-indigo-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-600 uppercase">순위</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-600 uppercase">학년</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-600 uppercase">반</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-600 uppercase">번호</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-600 uppercase">이름</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-indigo-600 uppercase">총점</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sampleStudents.map((student) => (
                  <tr key={student.rank} className={`hover:bg-gray-50 transition ${student.rank <= 3 ? 'bg-yellow-50/50 font-bold' : ''}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-2xl ${student.rank === 1 ? 'text-yellow-500' : student.rank === 2 ? 'text-gray-400' : student.rank === 3 ? 'text-yellow-700' : 'text-gray-600'}`}>
                        #{student.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.grade}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.class}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.number}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-2xl font-extrabold text-right text-indigo-700">{student.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">클릭 한 번으로 점수 부여</h4>
            <p className="text-sm text-gray-600">체크박스를 클릭하면 즉시 점수가 반영됩니다</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">규칙별 득점 분석</h4>
            <p className="text-sm text-gray-600">어떤 규칙에서 점수를 많이 받았는지 차트로 확인</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">기간별 순위</h4>
            <p className="text-sm text-gray-600">일간/주간/월간 또는 원하는 기간 선택 가능</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition md:col-span-3">
            <div className="flex items-center gap-3 mb-2">
              <KeySquare className="w-6 h-6 text-emerald-600" />
              <h4 className="font-bold text-gray-900">학생 관리자(제한 권한) 워크플로우</h4>
            </div>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>교사가 학생 관리자 계정 생성 (로그인 ID/비밀번호, 허용 규칙 선택)</li>
              <li>학생은 본인 계정으로 로그인 → 허용된 규칙만 체크 가능</li>
              <li>교사는 언제든 권한을 변경/회수 가능</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white rounded-3xl my-20 shadow-xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">강력한 기능들</h2>
          <p className="text-xl text-gray-600">학급 관리에 필요한 모든 것을 한곳에서</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-xl hover:bg-gray-50 transition group">
              <div className={`${feature.color} mb-4`}>
                <feature.icon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">지금 바로 시작하세요</h2>
          <p className="text-xl text-indigo-100 mb-8">무료로 계정을 만들고 5분 안에 학급 관리를 시작할 수 있습니다</p>
          <button
            onClick={() => onShowAuth('register')}
            className="px-10 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-100 transition font-bold text-lg shadow-xl inline-flex items-center"
          >
            <Award className="w-6 h-6 mr-2" />
            무료로 시작하기
          </button>
          <p className="text-sm text-indigo-200 mt-4">신용카드 필요 없음 · 언제든 취소 가능</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-indigo-400 mr-2" />
            <span className="text-lg font-semibold text-white">학급 관리 시스템</span>
          </div>
          <p className="text-sm">© 2025 학급 관리 시스템. All rights reserved.</p>
          <p className="text-sm mt-2">선생님을 위한 스마트한 학급 관리 솔루션</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
