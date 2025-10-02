import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Award, UserPlus, ListOrdered, Loader2, AlertTriangle, Plus, Calendar, 
  Shirt, BookOpenCheck, Sparkles, Armchair, Smile, Lightbulb,
  Feather, ShieldCheck, Settings, BarChart3, FileText, Trash2, Edit, Save, 
  ClipboardList, X, BarChart, Palette, LogOut, Clock, CheckSquare, XSquare,
  Star, Download, Users, Mail, ExternalLink, ChevronDown
} from 'lucide-react';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import PublicLeaderboard from './components/PublicLeaderboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import SEOHead from './components/SEOHead';
import { classroomsAPI, studentsAPI, rulesAPI, scoresAPI, settingsAPI, studentManagersAPI } from './services/api';

// Helper functions
const getTodayDate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// 아이콘 옵션
const ICON_OPTIONS = [
  { id: 'Clock', icon: Clock },
  { id: 'Shirt', icon: Shirt },
  { id: 'BookOpenCheck', icon: BookOpenCheck },
  { id: 'Sparkles', icon: Sparkles },
  { id: 'Armchair', icon: Armchair },
  { id: 'Smile', icon: Smile },
  { id: 'Lightbulb', icon: Lightbulb },
  { id: 'Feather', icon: Feather },
  { id: 'ShieldCheck', icon: ShieldCheck },
  { id: 'UserPlus', icon: UserPlus },
  { id: 'Trash2', icon: Trash2 },
  { id: 'Palette', icon: Palette },
  { id: 'Award', icon: Award },
  { id: 'Calendar', icon: Calendar },
  { id: 'BarChart3', icon: BarChart3 },
];

const TABS = [
  { id: 'leaderboard', name: '순위표', icon: ListOrdered, roles: ['teacher', 'student_manager'] },
  { id: 'scoring', name: '점수 부여', icon: Plus, roles: ['teacher', 'student_manager'] },
  { id: 'management', name: '학생 관리', icon: Users, roles: ['teacher'] },
  { id: 'rules', name: '규칙', icon: ClipboardList, roles: ['teacher'] },
  { id: 'managers', name: '학생 관리자', icon: UserPlus, roles: ['teacher'] },
];

const getIconComponent = (iconId) => {
  const iconMap = ICON_OPTIONS.reduce((acc, curr) => {
    acc[curr.id] = curr.icon;
    return acc;
  }, {});
  return iconMap[iconId] || ClipboardList;
};

// --- Sub-Components ---

const EditStudentModal = ({ student, onClose, onSave }) => {
  const [name, setName] = useState(student.name);
  const [grade, setGrade] = useState(String(student.grade || 1));
  const [classNum, setClassNum] = useState(String(student.classNum || 1));
  const [studentNum, setStudentNum] = useState(String(student.studentNum || 1));
  const [isSaving, setIsSaving] = useState(false);
  const [warning, setWarning] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isNaN(Number(grade)) || isNaN(Number(classNum)) || isNaN(Number(studentNum))) {
      setWarning('학년, 반, 번호는 숫자만 입력해야 합니다.');
      return;
    }

    setIsSaving(true);
    await onSave({ 
      oldId: student.id, 
      newFields: {
        name: name.trim(),
        grade: Number(grade),
        classNum: Number(classNum),
        studentNum: Number(studentNum),
      } 
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 flex items-center text-indigo-600">
          <Edit className="w-5 h-5 mr-2" /> 학생 정보 수정
        </h3>
        {warning && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">{warning}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-gray-700">이름</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-gray-700">학년</span>
              <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                min="1" max="6"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </label>
            <label className="block">
              <span className="text-gray-700">반</span>
              <input
                type="number"
                value={classNum}
                onChange={(e) => setClassNum(e.target.value)}
                min="1"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </label>
            <label className="block">
              <span className="text-gray-700">번호</span>
              <input
                type="number"
                value={studentNum}
                onChange={(e) => setStudentNum(e.target.value)}
                min="1"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </label>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              disabled={isSaving}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition flex items-center"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />} 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditClassroomModal = ({ classroom, onClose, onUpdate, onDelete }) => {
  const [name, setName] = useState(classroom.name);
  const [isSaving, setIsSaving] = useState(false);

  console.log('EditClassroomModal rendered with classroom:', classroom);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === classroom.name) {
      onClose();
      return;
    }

    setIsSaving(true);
    await onUpdate(classroom.id, name.trim());
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`정말로 '${classroom.name}' 학급을 삭제하시겠습니까?`)) return;
    
    setIsSaving(true);
    await onDelete(classroom.id);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 flex items-center text-indigo-600">
          <Settings className="w-5 h-5 mr-2" /> 학급 관리
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              학급 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="학급 이름을 입력하세요"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isSaving || classroom.is_default}
              title={classroom.is_default ? '기본 학급은 삭제할 수 없습니다' : '학급 삭제'}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              삭제
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:bg-gray-200"
              disabled={isSaving}
            >
              취소
            </button>
            
            <button
              type="submit"
              className="flex-1 bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isSaving || !name.trim() || name.trim() === classroom.name}
            >
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Footer = () => {
  const [showOtherSites, setShowOtherSites] = useState(false);

  const otherSites = [
    { name: '교사들을 위한 웹사이트', url: 'https://foreducator.com' },
    { name: '수학하는 즐거움', url: 'https://pimath.kr' },
    { name: '한국어 단축주소 서비스', url: 'https://숏.한국' },
    { name: '실시간 OX 응답 서비스', url: 'https://oxit.run' }
  ];

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOtherSites && !event.target.closest('.footer-dropdown')) {
        setShowOtherSites(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOtherSites]);

  return (
    <footer className="mt-12 pt-8 pb-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-gray-500 text-sm">
          {/* Contact */}
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <a 
              href="mailto:hwanys2@naver.com" 
              className="hover:text-gray-700 transition-colors"
            >
              Contact: hwanys2@naver.com
            </a>
          </div>
          
          {/* Separator */}
          <div className="hidden sm:block text-gray-300">•</div>
          
          {/* Privacy Policy & Terms */}
          <div className="flex items-center gap-3">
            <a 
              href="/#/privacy-policy" 
              className="hover:text-gray-700 transition-colors"
            >
              개인정보처리방침
            </a>
            <span className="text-gray-300">•</span>
            <a 
              href="/#/terms-of-service" 
              className="hover:text-gray-700 transition-colors"
            >
              이용약관
            </a>
          </div>
          
          {/* Separator */}
          <div className="hidden sm:block text-gray-300">•</div>
          
          {/* Other Sites Dropdown */}
          <div className="relative footer-dropdown">
            <button
              onClick={() => setShowOtherSites(!showOtherSites)}
              className="flex items-center hover:text-gray-700 transition-colors"
            >
              <span>개발자의 다른 사이트</span>
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showOtherSites ? 'rotate-180' : ''}`} />
            </button>
            
            {showOtherSites && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                {otherSites.map((site, index) => (
                  <a
                    key={index}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>{site.name}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

const RuleScoreBar = ({ student, rules, studentRuleScores }) => {
  const scores = studentRuleScores[student.id] || {};
  const totalScore = student.periodScore || student.score || 0;
  if (totalScore === 0) return <div className="h-2 w-full bg-gray-200 rounded-full"></div>;
  
  return (
    <div className="flex w-full h-2 rounded-full overflow-hidden shadow-inner cursor-pointer" title={`총점: ${totalScore}점`}>
      {rules.map((rule) => {
        const score = scores[rule.id] || 0;
        const percentage = (score / totalScore) * 100;
        
        if (percentage > 0) {
          return (
            <div 
              key={rule.id} 
              className={`h-full`}
              style={{ width: `${percentage}%`, backgroundColor: rule.color }}
              title={`${rule.name}: ${score}점 (${percentage.toFixed(0)}%)`}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

const AllStudentsRuleComparison = ({ students, rules, studentRuleScores }) => {
  const maxScore = useMemo(() => {
    const scores = students.map(s => s.periodScore || s.score);
    const actualMax = Math.max(...scores);
    return actualMax > 0 ? actualMax : 1; // 실제 최대값이 0보다 클 때만 사용
  }, [students]);

  if (students.length === 0 || rules.length === 0 || students.every(s => (s.periodScore || s.score) === 0)) {
    return (
      <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-lg h-full flex items-center justify-center border border-gray-100">
        <p>등록된 학생이 없거나 규칙/점수가 부여되지 않았습니다.</p>
      </div>
    );
  }
  
  const sortedStudents = [...students].sort((a, b) => (b.periodScore || b.score) - (a.periodScore || a.score));

  // 디버깅 로그
  console.log('AllStudentsRuleComparison - students:', students);
  console.log('AllStudentsRuleComparison - studentRuleScores:', studentRuleScores);
  console.log('AllStudentsRuleComparison - maxScore:', maxScore);

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
          )
        )}
      </div>
      
      <div className="space-y-6">
        {sortedStudents.map(student => {
          const totalScore = student.periodScore || student.score || 0;
          
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
                {/* studentRuleScores 대신 students 데이터에서 직접 계산 */}
                {studentRuleScores[student.id] ? (
                  rules.map(rule => {
                    const score = studentRuleScores[student.id][rule.id] || 0;
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
                  })
                ) : (
                  // studentRuleScores가 없으면 빈 막대 표시
                  <div className="w-full h-full bg-gray-200"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const defaultSettings = {
    title: '학급 관리 시스템',
    subtitle: '학년/반/번호 기반 관리 및 실시간 점수 순위표',
    iconId: 'Award',
    iconColor: '#4f46e5',
    font: "'Noto Sans KR', sans-serif",
  };

  const [user, setUser] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [currentClassroom, setCurrentClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [newStudentInfo, setNewStudentInfo] = useState({ grade: 1, classNum: 1, studentNum: 1, name: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [currentRule, setCurrentRule] = useState({ name: '', iconId: 'Clock', color: '#4f46e5' });
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [appSettings, setAppSettings] = useState(defaultSettings);
  const [currentLogo] = useState(() => Math.random() < 0.5 ? 'logo.png' : 'logo2.png');
  const [shareEnabled, setShareEnabled] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);
  
  // 순위표 기간 필터
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all', 'daily', 'weekly', 'monthly', 'custom'
  const [customStartDate, setCustomStartDate] = useState(getTodayDate());
  const [customEndDate, setCustomEndDate] = useState(getTodayDate());
  
  // Auth 모달 상태
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // 학생 관리자 관리 (교사만)
  // eslint-disable-next-line no-unused-vars
  const [managers, setManagers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [newManager, setNewManager] = useState({ username: '', password: '', confirmPassword: '', displayName: '', allowedRuleIds: [] });
  
  // 규칙 가져오기 관련 상태
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedSourceClassroom, setSelectedSourceClassroom] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  // 학급 관리 관련 상태
  const [editingClassroom, setEditingClassroom] = useState(null);

  // 해시 변경 감지
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // editingClassroom 상태 디버깅
  useEffect(() => {
    console.log('editingClassroom state changed:', editingClassroom);
  }, [editingClassroom]);

  // 초기 로드: 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // 학생 관리자는 점수 부여 탭을 기본으로 표시
      if (parsedUser.role === 'student_manager') {
        setActiveTab('scoring');
      }
      
      loadData();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 현재 학급이 변경되면 해당 학급의 학생과 규칙 다시 로드
  useEffect(() => {
    if (currentClassroom && user) {
      const reloadClassroomData = async () => {
        try {
          const [studentsRes, rulesRes] = await Promise.all([
            studentsAPI.getAll({ params: { classroomId: currentClassroom.id } }),
            rulesAPI.getAll({ params: { classroomId: currentClassroom.id } })
          ]);
          setStudents(studentsRes.data);
          setRules(rulesRes.data);
        } catch (err) {
          console.error('Reload classroom data error:', err);
          setError('학급 데이터를 불러오는 중 오류가 발생했습니다.');
        }
      };
      reloadClassroomData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClassroom?.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      let selectedClassroom = null;
      
      // 학생 관리자인 경우: classroomId를 user 객체에서 직접 가져옴
      if (savedUser.role === 'student_manager') {
        if (!savedUser.classroomId) {
          setError('학급 정보가 없습니다. 관리자에게 문의하세요.');
          setIsLoading(false);
          return;
        }
        // 학생 관리자는 단일 학급만 접근 가능
        selectedClassroom = { 
          id: savedUser.classroomId, 
          name: '담당 학급',
          user_id: savedUser.teacherId 
        };
        setClassrooms([selectedClassroom]);
        setCurrentClassroom(selectedClassroom);
      } else {
        // 교사인 경우: 학급 목록 로드
        const classroomsResponse = await classroomsAPI.getAll();
        const classroomsList = classroomsResponse.data;
        setClassrooms(classroomsList);
        
        // 저장된 마지막 선택 학급 또는 기본 학급 찾기
        const savedClassroomId = localStorage.getItem('selectedClassroomId');
        
        if (savedClassroomId) {
          // 저장된 학급 ID로 학급 찾기
          selectedClassroom = classroomsList.find(c => c.id === parseInt(savedClassroomId));
        }
        
        // 저장된 학급이 없거나 삭제된 경우, 기본 학급 또는 첫 번째 학급 선택
        if (!selectedClassroom) {
          selectedClassroom = classroomsList.find(c => c.is_default) || classroomsList[0];
        }
        
        if (!selectedClassroom) {
          setError('학급이 없습니다. 학급을 먼저 생성해주세요.');
          setIsLoading(false);
          return;
        }
        
        setCurrentClassroom(selectedClassroom);
      }
      
      const promises = [
        studentsAPI.getAll({ params: { classroomId: selectedClassroom.id } }),
        rulesAPI.getAll({ params: { classroomId: selectedClassroom.id } }),
        settingsAPI.get(),
      ];
      
      const results = await Promise.all(promises);

      setStudents(results[0].data);
      setRules(results[1].data);
      const settings = { ...defaultSettings, ...results[2].data };
      setAppSettings(settings);
      setShareEnabled(settings.shareEnabled || false);
      setShareToken(settings.shareToken || null);
      
      // 교사인 경우에만 학생 관리자 목록도 로드 (별도 처리로 실패해도 앱 작동)
      if (savedUser.role === 'teacher') {
        try {
          const managersResult = await studentManagersAPI.getAll({ params: { classroomId: selectedClassroom.id } });
          setManagers(managersResult.data);
        } catch (managersError) {
          console.warn('학생 관리자 목록 로드 실패:', managersError.response?.data || managersError.message);
          setManagers([]);
        }
      }
    } catch (err) {
      console.error('Load data error:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    // 학생 관리자는 점수 부여 탭을, 교사는 순위표 탭을 기본으로 표시
    setActiveTab(userData.role === 'student_manager' ? 'scoring' : 'leaderboard');
    setShowAuthModal(false);
    loadData();
  };
  
  const handleShowAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setStudents([]);
    setRules([]);
  };

  // 역할에 따라 허용된 규칙만 필터링
  const allowedRules = useMemo(() => {
    if (!user) return [];
    if (user.role === 'teacher') return rules;
    if (user.role === 'student_manager' && user.allowedRuleIds) {
      return rules.filter(rule => user.allowedRuleIds.includes(rule.id));
    }
    return [];
  }, [user, rules]);

  // 역할에 따라 표시할 탭 필터링
  const visibleTabs = useMemo(() => {
    if (!user) return [];
    return TABS.filter(tab => tab.roles.includes(user.role));
  }, [user]);

  // Ensure active tab is valid for current role
  useEffect(() => {
    if (visibleTabs.length === 0) return;
    const isValid = visibleTabs.some(tab => tab.id === activeTab);
    if (!isValid) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab]);

  // 기간별 필터링된 학생 점수 계산
  const filteredStudentsWithScores = useMemo(() => {
    console.log('🔄 filteredStudentsWithScores 계산 시작');
    console.log('📅 periodFilter:', periodFilter);
    console.log('👥 students:', students);
    
    const getDateRange = () => {
      const today = new Date();
      const todayStr = getTodayDate();
      
      switch (periodFilter) {
        case 'daily':
          return [todayStr];
        case 'weekly': {
          const dates = [];
          for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
          }
          return dates;
        }
        case 'monthly': {
          const dates = [];
          for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
          }
          return dates;
        }
        case 'custom': {
          const dates = [];
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
          }
          return dates;
        }
        default: // 'all'
          return null;
      }
    };

    const dateRange = getDateRange();
    console.log('📆 dateRange:', dateRange);

    const result = students.map(student => {
      let periodScore = 0;
      
      if (dateRange === null) {
        // 전체 기간
        periodScore = student.score;
        console.log(`👤 ${student.name}: 전체 기간 점수 = ${periodScore}`);
      } else {
        // 특정 기간 - dailyScores 구조 처리 (숫자 또는 객체)
        dateRange.forEach(date => {
          if (student.dailyScores[date]) {
            Object.values(student.dailyScores[date]).forEach(scoreData => {
              // scoreData가 객체인 경우 value 속성 사용, 아니면 직접 값 사용
              const scoreValue = typeof scoreData === 'object' ? scoreData.value : scoreData;
              if (scoreValue === 1) periodScore++;
            });
          }
        });
        console.log(`👤 ${student.name}: ${periodFilter} 기간 점수 = ${periodScore}, dailyScores:`, student.dailyScores);
      }

      return { ...student, periodScore };
    });
    
    console.log('✅ filteredStudentsWithScores 결과:', result);
    return result;
  }, [students, periodFilter, customStartDate, customEndDate]);

  const sortedStudents = useMemo(() => {
    return [...filteredStudentsWithScores].sort((a, b) => {
      if (b.periodScore !== a.periodScore) return b.periodScore - a.periodScore;
      if (a.grade !== b.grade) return a.grade - b.grade;
      if (a.classNum !== b.classNum) return a.classNum - b.classNum;
      return a.studentNum - b.studentNum;
    });
  }, [filteredStudentsWithScores]);

  const numberedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      if (a.classNum !== b.classNum) return a.classNum - b.classNum;
      return a.studentNum - b.studentNum;
    });
  }, [students]);
  
  const studentRuleScores = useMemo(() => {
    const scores = {};
    
    // filteredStudentsWithScores와 동일한 기간 계산 로직 사용
    const getDateRange = () => {
      const today = new Date();
      const todayStr = getTodayDate();
      
      switch (periodFilter) {
        case 'daily':
          return [todayStr];
        case 'weekly': {
          const dates = [];
          for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
          }
          return dates;
        }
        case 'monthly': {
          const dates = [];
          for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
          }
          return dates;
        }
        case 'custom': {
          const dates = [];
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
          }
          return dates;
        }
        default: // 'all'
          return null;
      }
    };

    const dateRange = getDateRange();

    students.forEach(student => {
      scores[student.id] = {};
      
      if (dateRange === null) {
        // 전체 기간 - 모든 날짜 포함
        const daily = student.dailyScores || {};
        Object.keys(daily).forEach(dateStr => {
          const dailyEntry = daily[dateStr];
          for (const ruleId in dailyEntry) {
            const scoreData = dailyEntry[ruleId];
            const scoreValue = typeof scoreData === 'object' ? scoreData.value : scoreData;
            
            if (rules.some(r => r.id === parseInt(ruleId, 10)) && scoreValue === 1) {
              scores[student.id][ruleId] = (scores[student.id][ruleId] || 0) + 1;
            }
          }
        });
      } else {
        // 특정 기간
        dateRange.forEach(dateStr => {
          if (student.dailyScores && student.dailyScores[dateStr]) {
            const dailyEntry = student.dailyScores[dateStr];
            for (const ruleId in dailyEntry) {
              const scoreData = dailyEntry[ruleId];
              const scoreValue = typeof scoreData === 'object' ? scoreData.value : scoreData;
              
              if (rules.some(r => r.id === parseInt(ruleId, 10)) && scoreValue === 1) {
                scores[student.id][ruleId] = (scores[student.id][ruleId] || 0) + 1;
              }
            }
          }
        });
      }
    });
    
    return scores;
  }, [students, rules, periodFilter, customStartDate, customEndDate]);

  // filteredStudentsWithScores를 기반으로 한 studentRuleScores 계산
  const filteredStudentRuleScores = useMemo(() => {
    console.log('🔄 filteredStudentRuleScores 계산 시작');
    const scores = {};
    
    // 기간별 필터링된 점수 계산
    const getDateRange = () => {
      const today = new Date();
      const todayStr = getTodayDate();
      
      switch (periodFilter) {
        case 'daily':
          return [todayStr];
        case 'weekly': {
          const dates = [];
          for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
          }
          return dates;
        }
        case 'monthly': {
          const dates = [];
          for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
          }
          return dates;
        }
        case 'custom': {
          const dates = [];
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
          }
          return dates;
        }
        default: // 'all'
          return null;
      }
    };

    const dateRange = getDateRange();
    console.log('📆 filteredStudentRuleScores dateRange:', dateRange);
    
    // filteredStudentsWithScores를 기반으로 계산
    filteredStudentsWithScores.forEach(student => {
      scores[student.id] = {};
      
      if (dateRange === null) {
        // 전체 기간 - 모든 날짜 포함
        const daily = student.dailyScores || {};
        Object.keys(daily).forEach(dateStr => {
          const dailyEntry = daily[dateStr];
          for (const ruleId in dailyEntry) {
            const scoreData = dailyEntry[ruleId];
            const scoreValue = typeof scoreData === 'object' ? scoreData.value : scoreData;
            
            if (rules.some(r => r.id === parseInt(ruleId, 10)) && scoreValue === 1) {
              scores[student.id][ruleId] = (scores[student.id][ruleId] || 0) + 1;
            }
          }
        });
      } else {
        // 특정 기간 - dateRange에 포함된 날짜만
        dateRange.forEach(dateStr => {
          if (student.dailyScores && student.dailyScores[dateStr]) {
            const dailyEntry = student.dailyScores[dateStr];
            for (const ruleId in dailyEntry) {
              const scoreData = dailyEntry[ruleId];
              const scoreValue = typeof scoreData === 'object' ? scoreData.value : scoreData;
              
              if (rules.some(r => r.id === parseInt(ruleId, 10)) && scoreValue === 1) {
                scores[student.id][ruleId] = (scores[student.id][ruleId] || 0) + 1;
              }
            }
          }
        });
      }
      
      // 디버깅: 각 학생의 점수 계산 결과 확인
      console.log(`👤 ${student.name}: scores[${student.id}] =`, scores[student.id]);
    });
    
    console.log('✅ filteredStudentRuleScores 결과:', scores);
    return scores;
  }, [filteredStudentsWithScores, rules, periodFilter, customStartDate, customEndDate]);
  
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const { grade, classNum, studentNum, name } = newStudentInfo;
    if (!name.trim()) return;

    if (!currentClassroom) {
      setError('학급을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await studentsAPI.create({ 
        name: name.trim(), 
        grade, 
        classNum, 
        studentNum,
        classroomId: currentClassroom.id 
      });
      setStudents([...students, response.data]);
      setNewStudentInfo({ grade: 1, classNum: 1, studentNum: 1, name: '' });
    } catch (err) {
      console.error('Add student error:', err);
      setError(err.response?.data?.error || '학생 추가 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStudent = async ({ oldId, newFields }) => {
    try {
      setIsLoading(true);
      await studentsAPI.update(oldId, newFields);
      await loadData(); // 전체 데이터 다시 로드
      setEditingStudent(null);
    } catch (err) {
      console.error('Save student error:', err);
      setError(err.response?.data?.error || '학생 정보 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('정말로 해당 학생의 모든 데이터를 삭제하시겠습니까?')) return;

    try {
      setIsLoading(true);
      await studentsAPI.delete(studentId);
      setStudents(students.filter(s => s.id !== studentId));
    } catch (err) {
      console.error('Delete student error:', err);
      setError('학생 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRulePoint = useCallback(async (studentId, ruleId, date) => {
    if (rules.length === 0) {
      setError("점수를 부여할 규칙이 없습니다. '규칙' 탭에서 규칙을 먼저 등록해주세요.");
      return;
    }

    try {
      await scoresAPI.toggle({ studentId, ruleId, date });
      await loadData(); // 전체 데이터 다시 로드
    } catch (err) {
      console.error('Toggle score error:', err);
      setError('점수 업데이트 중 오류가 발생했습니다.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rules]);
  
  const handleDownloadSampleCsv = () => {
    // 샘플 CSV 데이터 생성
    const sampleData = [
      ['학년', '반', '번호', '이름'],
      ['5', '2', '1', '김민준'],
      ['5', '2', '2', '이서윤'],
      ['5', '2', '3', '박지호'],
      ['5', '2', '4', '최예은'],
      ['5', '2', '5', '정하윤']
    ];
    
    // CSV 문자열로 변환
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    
    // BOM 추가 (한글 깨짐 방지)
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 다운로드 링크 생성 및 클릭
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '학생명단_샘플.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.trim().split('\n');
      const newStudents = [];

      for (let i = 1; i < lines.length; i++) {
        const [grade, classNum, studentNum, name] = lines[i].split(',').map(s => s.trim());
        if (grade && classNum && studentNum && name && !isNaN(Number(grade)) && !isNaN(Number(classNum)) && !isNaN(Number(studentNum))) {
          newStudents.push({
            name,
            grade: Number(grade),
            classNum: Number(classNum),
            studentNum: Number(studentNum),
          });
        }
      }

      if (newStudents.length === 0) {
        setError("CSV 파일에서 유효한 학생 데이터를 찾을 수 없습니다.");
        return;
      }

      if (!currentClassroom) {
        setError('학급을 선택해주세요.');
        return;
      }

      try {
        setIsLoading(true);
        const response = await studentsAPI.bulkUpload({ 
          students: newStudents,
          classroomId: currentClassroom.id 
        });
        alert(response.data.message);
        await loadData();
      } catch (err) {
        console.error('CSV upload error:', err);
        setError('CSV 업로드 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
        e.target.value = null;
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!currentRule.name.trim() || !currentRule.iconId || !currentRule.color) return;

    if (!/^#([0-9A-F]{3}){1,2}$/i.test(currentRule.color)) {
      alert('규칙 색상이 유효한 Hex 색상 코드가 아닙니다.');
      return;
    }

    if (!currentClassroom) {
      setError('학급을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const ruleData = {
        name: currentRule.name.trim(),
        iconId: currentRule.iconId,
        color: currentRule.color,
        classroomId: currentClassroom.id,
      };

      if (editingRuleId) {
        await rulesAPI.update(editingRuleId, ruleData);
      } else {
        await rulesAPI.create(ruleData);
      }

      await loadData();
      setCurrentRule({ name: '', iconId: 'Clock', color: '#4f46e5' });
      setEditingRuleId(null);
    } catch (err) {
      console.error('Save rule error:', err);
      setError('규칙 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteRule = async (ruleId, ruleName) => {
    if (!window.confirm(`정말로 '${ruleName}' 규칙과 관련된 모든 점수 데이터를 삭제하시겠습니까?`)) return;

    try {
      setIsLoading(true);
      await rulesAPI.delete(ruleId);
      await loadData();
    } catch (err) {
      console.error('Delete rule error:', err);
      setError('규칙 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportRules = async () => {
    if (!selectedSourceClassroom || !currentClassroom) {
      setError('원본 학급을 선택해주세요.');
      return;
    }

    if (selectedSourceClassroom === currentClassroom.id.toString()) {
      setError('같은 학급에서는 규칙을 가져올 수 없습니다.');
      return;
    }

    try {
      setIsImporting(true);
      const response = await rulesAPI.import({
        sourceClassroomId: parseInt(selectedSourceClassroom),
        targetClassroomId: currentClassroom.id
      });

      const { summary } = response.data;
      
      // 결과 메시지 생성
      let message = `규칙 가져오기 완료!\n\n`;
      message += `• 총 ${summary.total}개 규칙 중\n`;
      message += `• ${summary.imported}개 성공적으로 가져옴\n`;
      
      if (summary.duplicates > 0) {
        message += `• ${summary.duplicates}개 중복으로 건너뜀\n`;
      }
      
      if (summary.skipped > 0) {
        message += `• ${summary.skipped}개 오류로 건너뜀\n`;
      }

      alert(message);
      
      // 데이터 다시 로드
      await loadData();
      
      // 모달 닫기
      setShowImportModal(false);
      setSelectedSourceClassroom('');
      
    } catch (err) {
      console.error('Import rules error:', err);
      setError('규칙 가져오기 중 오류가 발생했습니다.');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleStartEditRule = (rule) => {
    setEditingRuleId(rule.id);
    setCurrentRule({ name: rule.name, iconId: rule.iconId, color: rule.color });
  };

  // 학급 관리 핸들러들
  const handleAddClassroom = async () => {
    const name = prompt('새 학급 이름을 입력하세요:');
    if (name && name.trim()) {
      try {
        setIsLoading(true);
        await classroomsAPI.create({ name: name.trim() });
        await loadData();
      } catch (err) {
        setError('학급 생성 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSetDefaultClassroom = async (classroomId) => {
    try {
      setIsLoading(true);
      await classroomsAPI.setDefault(classroomId);
      await loadData();
    } catch (err) {
      setError('기본 학급 설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClassroom = async (classroomId, newName) => {
    try {
      setIsLoading(true);
      await classroomsAPI.update(classroomId, { name: newName.trim() });
      await loadData();
      setEditingClassroom(null);
    } catch (err) {
      setError('학급 이름 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClassroom = async (classroomId) => {
    if (!window.confirm('정말로 이 학급을 삭제하시겠습니까? 관련된 모든 데이터(학생, 규칙, 점수)가 함께 삭제됩니다.')) {
      return;
    }

    try {
      setIsLoading(true);
      await classroomsAPI.delete(classroomId);
      
      // 삭제된 학급이 현재 선택된 학급인 경우 localStorage에서 제거
      const savedClassroomId = localStorage.getItem('selectedClassroomId');
      if (savedClassroomId === classroomId.toString()) {
        localStorage.removeItem('selectedClassroomId');
      }
      
      await loadData();
      setEditingClassroom(null);
    } catch (err) {
      setError(err.response?.data?.error || '학급 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Functions ---

  const TableHeader = ({ showScore = true, showRuleBar = false }) => (
    <tr className="bg-indigo-50">
      <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider w-8 sm:w-12">순위</th>
      <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider w-10 sm:w-16">학년</th>
      <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider w-8 sm:w-12">반</th>
      <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider w-8 sm:w-12">번호</th>
      <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider">이름</th>
      {showScore && <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider w-12 sm:w-24">총점</th>}
      {showRuleBar && <th className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider w-16 sm:w-32 md:w-40"><span className="md:hidden">분포</span><span className="hidden md:inline">규칙별 점수 분포</span></th>}
    </tr>
  );

  const renderLeaderboard = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 종합 순위표 */}
        <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
              <ListOrdered className="w-6 h-6 lg:w-7 lg:h-7 mr-2 text-indigo-500" /> 종합 순위표
            </h2>
          
          </div>
        
        {/* 기간 필터 */}
        <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition ${
                periodFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setPeriodFilter('daily')}
              className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition ${
                periodFilter === 'daily'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border'
              }`}
            >
              오늘
            </button>
            <button
              onClick={() => setPeriodFilter('weekly')}
              className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition ${
                periodFilter === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border'
              }`}
            >
              <span className="hidden sm:inline">최근 </span>7일
            </button>
            <button
              onClick={() => setPeriodFilter('monthly')}
              className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition ${
                periodFilter === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border'
              }`}
            >
              <span className="hidden sm:inline">최근 </span>30일
            </button>
            <button
              onClick={() => setPeriodFilter('custom')}
              className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm md:text-base font-semibold transition ${
                periodFilter === 'custom'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border'
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
                  max={getTodayDate()}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <TableHeader showRuleBar={true} />
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedStudents.map((student, index) => {
                return (
                  <tr key={student.id} className={`transition duration-150 ease-in-out ${index % 2 === 0 ? 'hover:bg-gray-50' : 'hover:bg-indigo-50'} ${index < 3 ? 'bg-yellow-50/50 font-bold' : ''}`}>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center">
                      <span className={`text-sm sm:text-lg md:text-xl ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-yellow-900' : 'text-gray-600'}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{student.grade}</td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{student.classNum}</td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">{student.studentNum}</td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-base sm:text-xl md:text-2xl font-extrabold text-right text-indigo-700">
                      {student.periodScore}
                    </td>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-4 whitespace-nowrap text-sm text-center">
                      <div className="w-12 sm:w-24 md:w-32 lg:w-40 mx-auto">
                        <RuleScoreBar student={student} rules={rules} studentRuleScores={studentRuleScores} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && (
            <p className="text-center text-gray-500 py-8">학생 관리 탭에서 학생을 먼저 등록해주세요.</p>
          )}
        </div>
        </div>

        {/* 규칙별 득점 비교 차트 */}
        <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
          <AllStudentsRuleComparison students={filteredStudentsWithScores} rules={rules} studentRuleScores={filteredStudentRuleScores} />
        </div>
      </div>

      {/* 공유 설정 (교사만) - 전체 페이지 하단에 배치 */}
      {user?.role === 'teacher' && (
        <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-800">공유 설정</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={shareEnabled}
                  onChange={async (e) => {
                    const enabled = e.target.checked;
                    setShareEnabled(enabled);
                    try {
                      const response = await settingsAPI.update({
                        title: appSettings.title,
                        subtitle: appSettings.subtitle,
                        iconId: appSettings.iconId,
                        iconColor: appSettings.iconColor,
                        font: appSettings.font,
                        shareEnabled: enabled,
                      });
                      setShareToken(response.data.settings.shareToken);
                    } catch (err) {
                      setError('공유 설정 업데이트 중 오류가 발생했습니다.');
                      setShareEnabled(!enabled); // 롤백
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                공개 링크 활성화
              </label>
              
              {shareEnabled && shareToken && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={`${window.location.origin}/#/share/${shareToken}`}
                    readOnly
                    className="px-3 py-1 text-sm border border-gray-300 rounded bg-gray-50 text-gray-600 w-full sm:w-64"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/#/share/${shareToken}`);
                      alert('링크가 클립보드에 복사되었습니다!');
                    }}
                    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition w-full sm:w-auto"
                  >
                    복사
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderScoring = () => (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 min-h-[70vh]">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Plus className="w-7 h-7 mr-2 text-indigo-500" /> 일일 점수 부여
      </h2>
      <div className="flex justify-between items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> 기록 날짜
        </h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={getTodayDate()}
          className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto text-lg"
        />
      </div>

      <h3 className="text-xl font-semibold text-gray-700 mb-4">{selectedDate} 점수 부여 그리드</h3>
      
      {user?.role === 'student_manager' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>{user.displayName}</strong>님은 <strong>{allowedRules.length}개 규칙</strong>에 대한 점수 부여 권한이 있습니다.
          </p>
        </div>
      )}
      
      {allowedRules.length === 0 ? (
        <div className="text-center p-8 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-lg text-yellow-800 font-semibold">
            {user?.role === 'teacher' 
              ? "점수를 부여할 규칙이 없습니다. '규칙' 탭에서 규칙을 먼저 등록해주세요."
              : "부여된 권한이 없습니다. 교사에게 문의하세요."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 relative">
            <thead className="bg-gray-100 sticky top-0 z-20">
              <tr>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-12 bg-gray-100">학년</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-12 bg-gray-100">반</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-12 bg-gray-100">번호</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-24 bg-gray-100 sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">이름</th>
                {allowedRules.map((rule) => {
                  const RuleIcon = getIconComponent(rule.iconId);
                  return (
                    <th key={rule.id} className="px-3 py-3 text-center text-xs font-semibold text-gray-600 whitespace-nowrap bg-gray-100">
                      <RuleIcon className={`w-5 h-5 mx-auto mb-1`} style={{ color: rule.color }} title={rule.name} />
                      {rule.name}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {numberedStudents.length > 0 ? (
                numberedStudents.map((student) => {
                  const dailyEntry = student.dailyScores[selectedDate] || {};
                  return (
                    <tr key={student.id} className="group hover:bg-indigo-50 transition duration-100">
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{student.grade}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{student.classNum}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{student.studentNum}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-indigo-50">{student.name}</td>
                      {allowedRules.map((rule) => {
                        // dailyEntry[rule.id]가 객체인 경우 value 속성 사용, 아니면 직접 값 사용
                        const scoreData = dailyEntry[rule.id];
                        const scoreValue = scoreData ? (typeof scoreData === 'object' ? scoreData.value : scoreData) : 0;
                        const isChecked = scoreValue === 1;
                        return (
                          <td key={rule.id} className="px-3 py-3 whitespace-nowrap text-center">
            <button
                              onClick={() => handleToggleRulePoint(student.id, rule.id, selectedDate)}
                              className={`p-2 rounded-full transition duration-100 shadow-sm ${
                                isChecked
                                  ? 'bg-green-500 hover:bg-green-600 text-white'
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                              }`}
                              title={isChecked ? `${rule.name} 점수 취소` : `${rule.name} 점수 부여 (+1)`}
                              disabled={isLoading}
                            >
                              {isChecked ? <CheckSquare className="w-5 h-5" /> : <XSquare className="w-5 h-5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4 + allowedRules.length} className="text-center text-gray-500 py-8">
                    학생 관리 탭에서 학생을 먼저 등록해주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderManagement = () => (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 min-h-[70vh] space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center">
        <Users className="w-7 h-7 mr-2 text-indigo-500" /> 학생 관리
      </h2>

      <div className="border p-4 rounded-lg bg-indigo-50">
        <h3 className="text-xl font-semibold text-indigo-700 mb-3 flex items-center">
          <UserPlus className="w-5 h-5 mr-2" /> 개별 학생 등록
        </h3>
        <form onSubmit={handleAddStudent} className="grid grid-cols-5 gap-3 items-end">
          {['grade', 'classNum', 'studentNum'].map(key => (
            <label key={key} className="col-span-1">
              <span className="text-gray-700 text-sm">{key === 'grade' ? '학년' : key === 'classNum' ? '반' : '번호'}</span>
              <input 
                type="number" 
                value={newStudentInfo[key]} 
                onChange={(e) => setNewStudentInfo(prev => ({ ...prev, [key]: Number(e.target.value) }))} 
                min="1" 
                className="block w-full p-2 border border-gray-300 rounded-lg" 
                required
              />
            </label>
          ))}
          <label className="col-span-1">
            <span className="text-gray-700 text-sm">이름</span>
            <input 
              type="text" 
              value={newStudentInfo.name} 
              onChange={(e) => setNewStudentInfo(prev => ({ ...prev, name: e.target.value }))} 
              placeholder="이름" 
              className="block w-full p-2 border border-gray-300 rounded-lg" 
              required
            />
          </label>
          <button type="submit" className="col-span-1 bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition flex items-center justify-center h-full shadow-md" disabled={isLoading}>
            <Plus className="w-5 h-5 mr-1" /> 등록
          </button>
        </form>
      </div>

      <div className="border p-4 rounded-lg bg-gray-50">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-700 flex items-center">
            <FileText className="w-5 h-5 mr-2" /> CSV 일괄 업데이트
          </h3>
          <button
            onClick={handleDownloadSampleCsv}
            className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-semibold shadow-sm"
            title="샘플 CSV 파일 다운로드"
          >
            <Download className="w-4 h-4 mr-1" />
            샘플 다운로드
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-2">업로드 시 기존 점수는 유지되며, 학생 정보만 업데이트됩니다.</p>
        <p className="text-xs text-red-500 mb-3">파일 형식: **학년,반,번호,이름** (첫 줄 헤더 제외)</p>
        <input
          type="file"
          accept=".csv"
          onChange={handleCsvUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          disabled={isLoading}
        />
      </div>
      
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">학년</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">반</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">번호</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">이름</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">총점</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {numberedStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition duration-100">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.grade}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.classNum}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.studentNum}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right">{student.score}</td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-sm space-x-2">
                  <button onClick={() => setEditingStudent(student)} className="text-blue-500 hover:text-blue-700 p-1" title="수정"><Edit className="w-5 h-5 inline" /></button>
                  <button onClick={() => handleDeleteStudent(student.id)} className="text-red-500 hover:text-red-700 p-1" title="삭제"><Trash2 className="w-5 h-5 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {numberedStudents.length === 0 && (
          <p className="text-center text-gray-500 py-8">등록된 학생이 없습니다.</p>
        )}
      </div>
      {editingStudent && <EditStudentModal student={editingStudent} onClose={() => setEditingStudent(null)} onSave={handleSaveStudent} />}
    </div>
  );
  
  const renderRules = () => (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 min-h-[70vh] space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <ClipboardList className="w-7 h-7 mr-2 text-indigo-500" /> 규칙 관리
        </h2>
        
        {/* 규칙 가져오기 버튼 */}
        {user?.role === 'teacher' && classrooms.length > 1 && (
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md"
            title="다른 학급에서 규칙 가져오기"
          >
            <Download className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">규칙 가져오기</span>
          </button>
        )}
      </div>

      <div className="border p-4 rounded-lg bg-indigo-50">
        <h3 className="text-xl font-semibold text-indigo-700 mb-3 flex items-center">
          <Edit className="w-5 h-5 mr-2" /> {editingRuleId ? '규칙 수정' : '새 규칙 등록'}
        </h3>
        
        <form onSubmit={handleSaveRule} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <label className="col-span-full">
            <span className="text-gray-700 text-sm">규칙 이름</span>
            <input 
              type="text" 
              value={currentRule.name} 
              onChange={(e) => setCurrentRule(prev => ({ ...prev, name: e.target.value }))} 
              placeholder="예: 등교 시간 지키기" 
              className="block w-full p-2 border border-gray-300 rounded-lg h-[42px]" 
              required
            />
          </label>
          
          <div className="md:col-span-2 lg:col-span-5">
            <span className="text-gray-700 text-sm block mb-1">아이콘 및 색상 선택</span>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 p-2 border border-gray-300 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
              {ICON_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = currentRule.iconId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCurrentRule(prev => ({ ...prev, iconId: opt.id }))}
                    className={`p-2 rounded-lg transition duration-150 flex justify-center items-center ${isSelected ? 'shadow-md ring-2' : 'bg-white hover:bg-gray-100'}`}
                    style={isSelected ? { backgroundColor: currentRule.color, color: 'white', borderColor: currentRule.color } : {}}
                    title={opt.id}
                  >
                    <Icon className="w-6 h-6" style={isSelected ? {} : { color: '#374151' }} />
                  </button>
                );
              })}
              
              {/* 색상 선택 버튼 */}
              <label 
                className="p-2 rounded-lg bg-white hover:bg-gray-100 transition duration-150 flex justify-center items-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 relative overflow-hidden"
                title="색상 선택"
              >
                <Palette className="w-6 h-6 text-gray-600 absolute" />
                <input 
                  type="color" 
                  value={currentRule.color} 
                  onChange={(e) => setCurrentRule(prev => ({ ...prev, color: e.target.value }))} 
                  className="opacity-0 w-full h-full absolute inset-0 cursor-pointer"
                  required
                />
                <div 
                  className="w-full h-full absolute inset-0 opacity-30"
                  style={{ backgroundColor: currentRule.color }}
                ></div>
              </label>
            </div>
          </div>
          
          <div className="md:col-span-2 lg:col-span-1 flex gap-2 pt-2 md:pt-0">
            <button type="submit" className="flex-1 bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition flex items-center justify-center shadow-md h-[42px]" disabled={isLoading}>
              <Save className="w-5 h-5 mr-1" /> {editingRuleId ? '수정' : '추가'}
            </button>
            {editingRuleId && (
              <button type="button" onClick={() => { setEditingRuleId(null); setCurrentRule({ name: '', iconId: 'Clock', color: '#4f46e5' }); }} className="bg-gray-400 text-white p-2 rounded-lg hover:bg-gray-500 transition flex items-center justify-center shadow-md h-[42px]" disabled={isLoading}>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <BarChart className="w-6 h-6 mr-2 text-indigo-500" /> 규칙별 순위표
      </h3>
      {rules.length === 0 ? (
        <div className="p-8 bg-yellow-50 border border-yellow-300 rounded-lg space-y-4">
          <h3 className="text-xl font-bold text-yellow-800 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" /> 현재 등록된 규칙이 없습니다.
          </h3>
          <p className="text-gray-700">새 규칙을 등록하여 학급 관리 시스템을 시작하세요.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rules.map((rule) => {
            const RuleIcon = getIconComponent(rule.iconId);
            
            const rankedByRule = [...students].map(s => ({
              ...s,
              ruleScore: studentRuleScores[s.id]?.[rule.id] || 0
            })).sort((a, b) => {
              if (b.ruleScore !== a.ruleScore) return b.ruleScore - a.ruleScore;
              if (a.grade !== b.grade) return a.grade - b.grade;
              return a.studentNum - b.studentNum;
            });

            return (
              <div key={rule.id} className="border p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`text-xl font-bold flex items-center`} style={{ color: rule.color }}>
                    <RuleIcon className="w-5 h-5 mr-2" /> {rule.name}
                    <span className="text-base text-gray-500 ml-3 font-normal"> (총 {rankedByRule.reduce((sum, s) => sum + s.ruleScore, 0)}점)</span>
                  </h4>
                  <div className="space-x-2">
                    <button onClick={() => handleStartEditRule(rule)} className="text-blue-500 hover:text-blue-700 p-1" title="규칙 수정"><Edit className="w-5 h-5 inline" /></button>
                    <button onClick={() => handleDeleteRule(rule.id, rule.name)} className="text-red-500 hover:text-red-700 p-1" title="규칙 삭제"><Trash2 className="w-5 h-5 inline" /></button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-12">순위</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-12">학년</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-12">반</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 w-12">번호</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">이름</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 w-24">점수</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {rankedByRule.map((s, idx) => (
                        <tr key={s.id} className={idx < 3 ? 'bg-yellow-50/50' : 'hover:bg-gray-50'}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-center">#{idx + 1}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{s.grade}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{s.classNum}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{s.studentNum}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">{s.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-right text-indigo-600">{s.ruleScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* 규칙 가져오기 모달 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Download className="w-6 h-6 mr-2 text-green-500" />
                  규칙 가져오기
                </h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedSourceClassroom('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                  disabled={isImporting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    원본 학급 선택
                  </label>
                  <select
                    value={selectedSourceClassroom}
                    onChange={(e) => setSelectedSourceClassroom(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isImporting}
                  >
                    <option value="">학급을 선택하세요</option>
                    {classrooms
                      .filter(classroom => classroom.id !== currentClassroom.id)
                      .map(classroom => (
                        <option key={classroom.id} value={classroom.id}>
                          {classroom.is_default ? '⭐ ' : ''}{classroom.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">가져오기 안내</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 같은 이름의 규칙은 중복으로 처리됩니다</li>
                    <li>• 원본 규칙은 그대로 유지됩니다</li>
                    <li>• 가져온 규칙은 현재 학급에 추가됩니다</li>
                  </ul>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleImportRules}
                    disabled={!selectedSourceClassroom || isImporting}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        가져오는 중...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        가져오기
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setSelectedSourceClassroom('');
                    }}
                    disabled={isImporting}
                    className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:bg-gray-200"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 라우팅 처리
  const shareMatch = currentRoute.match(/#\/share\/([a-f0-9]+)/);
  
  if (shareMatch) {
    const token = shareMatch[1];
    return <PublicLeaderboard token={token} />;
  }

  if (currentRoute === '#/privacy-policy') {
    return <PrivacyPolicy />;
  }

  if (currentRoute === '#/terms-of-service') {
    return <TermsOfService />;
  }

  if (!user) {
    return (
      <>
        <SEOHead 
          title="학급 관리 시스템 - 무료 학생 점수 관리 도구"
          description="교사와 학생을 위한 스마트한 학급 관리 시스템. 학생 점수 부여, 실시간 순위표, 규칙별 관리 기능을 제공하는 무료 온라인 도구입니다. 회원가입 후 바로 사용하세요!"
          keywords="학급관리, 학생관리, 점수관리, 순위표, 학급점수, 학생점수, 교실관리, 교육도구, 학급운영, 학생평가, 포인트시스템, 학급순위, 교육관리, 무료, 온라인"
          url="https://classpoint.kr"
        />
        <LandingPage onShowAuth={handleShowAuth} />
        {showAuthModal && (
          <Auth 
            onLogin={handleLogin} 
            onClose={() => setShowAuthModal(false)}
            initialMode={authMode}
          />
        )}
      </>
    );
  }

  if (isLoading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8" style={{ fontFamily: appSettings.font }}>
      <SEOHead 
        title={appSettings.title || '학급 관리 시스템'}
        description={`${appSettings.subtitle || '학년/반/번호 기반 관리 및 실시간 점수 순위표'} - ${appSettings.title || '학급 관리 시스템'}`}
        url={`https://classpoint.kr${currentRoute === '#/' ? '' : currentRoute}`}
      />
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {editingClassroom && (() => {
        console.log('Rendering EditClassroomModal with classroom:', editingClassroom);
        return <EditClassroomModal classroom={editingClassroom} onClose={() => setEditingClassroom(null)} onUpdate={handleUpdateClassroom} onDelete={handleDeleteClassroom} />;
      })()}

      <header className="text-center mb-4 sm:mb-8">
        <div className="flex flex-col items-center justify-center pt-4 sm:pt-6">
          <img 
            src={`/${currentLogo}`} 
            alt="학급 관리 시스템 로고" 
            className="h-24 sm:h-32 md:h-40 lg:h-48 w-auto object-contain mx-auto"
          />
        </div>
        
        {/* 학급 선택 탭 (교사만, 학급이 2개 이상일 때) */}
        {user?.role === 'teacher' && classrooms.length > 1 && (
          <div className="mt-4 flex justify-center">
            <div className="flex flex-wrap gap-2 bg-white rounded-lg p-1 shadow-md border">
              {classrooms.map(classroom => (
                <div key={classroom.id} className="relative group">
                  <button
                    onClick={() => {
                      setCurrentClassroom(classroom);
                      localStorage.setItem('selectedClassroomId', classroom.id.toString());
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                      currentClassroom?.id === classroom.id
                        ? 'bg-indigo-500 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {/* 기본 학급 별표 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!classroom.is_default) {
                          handleSetDefaultClassroom(classroom.id);
                        }
                      }}
                      className={`transition ${
                        classroom.is_default 
                          ? 'text-yellow-400 hover:text-yellow-300' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      title={classroom.is_default ? '기본 학급' : '기본 학급으로 설정'}
                    >
                      <Star className={`w-4 h-4 ${classroom.is_default ? 'fill-current' : ''}`} />
                    </button>
                    
                    {/* 학급 이름 */}
                    <span className="font-medium">{classroom.name}</span>
                    
                    {/* 점세개 메뉴 */}
                    {user?.role === 'teacher' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Settings button clicked for classroom:', classroom);
                          setEditingClassroom(classroom);
                          console.log('editingClassroom state set to:', classroom);
                        }}
                        className="opacity-70 hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200"
                        title="학급 관리"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </button>
                </div>
              ))}
              
              {/* 학급 추가 버튼 (교사만) */}
              {user?.role === 'teacher' && (
                <button
                  onClick={handleAddClassroom}
                  className="flex items-center gap-1 px-3 py-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition"
                  title="새 학급 추가"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">추가</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto">
        {/* 로그아웃 버튼 - 콘텐츠 영역 오른쪽 정렬 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="로그아웃"
          >
            <LogOut className="w-4 h-4 mr-1" /> {user.username}
          </button>
        </div>
        <div className="flex border-b border-gray-200 mb-6 sticky top-0 bg-white z-10 shadow-sm rounded-t-xl overflow-x-auto">
          {visibleTabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center p-2 sm:p-3 text-center text-xs sm:text-sm md:text-base lg:text-lg font-semibold transition-colors duration-200 border-b-4 whitespace-nowrap min-w-fit
                  ${isActive 
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50' 
                    : 'border-transparent text-gray-500 hover:text-indigo-500 hover:border-gray-300'}`
                }
              >
                <TabIcon className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2 mb-1 sm:mb-0" /> 
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden text-xs">{tab.name.replace(' ', '')}</span>
              </button>
            );
          })}
        </div>

        <div className="tab-content">
          {activeTab === 'leaderboard' && renderLeaderboard()}
          {activeTab === 'scoring' && renderScoring()}
          {activeTab === 'management' && renderManagement()}
          {activeTab === 'rules' && renderRules()}
          {activeTab === 'managers' && user?.role === 'teacher' && (
            <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 min-h-[70vh] space-y-8">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                <UserPlus className="w-7 h-7 mr-2 text-indigo-500" /> 학생 관리자 관리
              </h2>
              <p className="text-gray-600">학생들이 직접 점수를 체크할 수 있도록 제한된 권한의 계정을 만들어주세요.</p>

              {/* 새 학생 관리자 추가 폼 */}
              <div className="border p-4 rounded-lg bg-indigo-50">
                <h3 className="text-xl font-semibold text-indigo-700 mb-3 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" /> 새 학생 관리자 계정 생성
                </h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="사용자명 (로그인 ID)"
                      value={newManager.username}
                      onChange={(e) => setNewManager(prev => ({ ...prev, username: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="password"
                      placeholder="비밀번호 (4자 이상)"
                      value={newManager.password}
                      onChange={(e) => setNewManager(prev => ({ ...prev, password: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="password"
                      placeholder="비밀번호 확인"
                      value={newManager.confirmPassword}
                      onChange={(e) => setNewManager(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="text"
                      placeholder="표시 이름 (학생 이름)"
                      value={newManager.displayName}
                      onChange={(e) => setNewManager(prev => ({ ...prev, displayName: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700 mb-2">체크 권한 부여할 규칙 선택:</p>
                    <div className="flex flex-wrap gap-2">
                      {rules.map(rule => {
                        const RuleIcon = getIconComponent(rule.iconId);
                        const isSelected = newManager.allowedRuleIds.includes(rule.id);
                        return (
                          <button
                            key={rule.id}
                            type="button"
                            onClick={() => {
                              setNewManager(prev => ({
                                ...prev,
                                allowedRuleIds: isSelected
                                  ? prev.allowedRuleIds.filter(id => id !== rule.id)
                                  : [...prev.allowedRuleIds, rule.id]
                              }));
                            }}
                            className={`px-3 py-2 rounded-lg transition flex items-center ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <RuleIcon className="w-4 h-4 mr-1" style={{ color: isSelected ? 'white' : rule.color }} />
                            {rule.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newManager.username || !newManager.password || !newManager.confirmPassword || !newManager.displayName) {
                        alert('모든 필드를 입력하세요.');
                        return;
                      }
                      if (newManager.password !== newManager.confirmPassword) {
                        alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
                        return;
                      }
                      if (newManager.allowedRuleIds.length === 0) {
                        alert('최소 1개 이상의 규칙을 선택하세요.');
                        return;
                      }
                      try {
                        setIsLoading(true);
                        await studentManagersAPI.create({ 
                          username: newManager.username, 
                          password: newManager.password, 
                          displayName: newManager.displayName, 
                          allowedRuleIds: newManager.allowedRuleIds,
                          classroomId: currentClassroom.id
                        });
                        setNewManager({ username: '', password: '', confirmPassword: '', displayName: '', allowedRuleIds: [] });
                        await loadData();
                        alert('학생 관리자가 생성되었습니다!');
                      } catch (err) {
                        setError(err.response?.data?.error || '학생 관리자 생성 중 오류가 발생했습니다.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <Plus className="w-5 h-5 mr-2" /> 학생 관리자 계정 생성
                  </button>
                </form>
              </div>

              {/* 기존 학생 관리자 목록 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">등록된 학생 관리자 목록</h3>
                {managers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">등록된 학생 관리자가 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {managers.map(manager => (
                      <div key={manager.id} className="border p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg text-gray-900">{manager.displayName}</p>
                            <p className="text-sm text-gray-600">로그인 ID: <code className="bg-gray-200 px-2 py-1 rounded">{manager.username}</code></p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {manager.allowedRuleIds.map(ruleId => {
                                const rule = rules.find(r => r.id === ruleId);
                                if (!rule) return null;
                                const RuleIcon = getIconComponent(rule.iconId);
                                return (
                                  <span key={ruleId} className="inline-flex items-center px-2 py-1 bg-white text-xs rounded-lg border" style={{ color: rule.color }}>
                                    <RuleIcon className="w-3 h-3 mr-1" />
                                    {rule.name}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`${manager.displayName} 계정을 삭제하시겠습니까?`)) return;
                              try {
                                setIsLoading(true);
                                await studentManagersAPI.delete(manager.id);
                                await loadData();
                              } catch (err) {
                                setError('학생 관리자 삭제 중 오류가 발생했습니다.');
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="삭제"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
