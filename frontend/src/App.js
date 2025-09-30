import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Award, UserPlus, ListOrdered, Loader2, AlertTriangle, Plus, Calendar, 
  Shirt, BookOpenCheck, Sparkles, Armchair, Smile, Lightbulb,
  Feather, ShieldCheck, Settings, BarChart3, FileText, Trash2, Edit, Save, 
  ClipboardPlus, X, BarChart, Palette, LogOut, Clock, CheckSquare, XSquare 
} from 'lucide-react';
import Auth from './components/Auth';
import { studentsAPI, rulesAPI, scoresAPI, settingsAPI } from './services/api';

// Helper functions
const getTodayDate = () => new Date().toISOString().split('T')[0];
const createStudentDocId = (grade, classNum, studentNum) => `${grade}-${classNum}-${studentNum}`;

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
  { id: 'leaderboard', name: '순위표', icon: ListOrdered },
  { id: 'scoring', name: '점수 부여', icon: Plus },
  { id: 'management', name: '학생 관리', icon: Settings },
  { id: 'rules', name: '규칙', icon: ClipboardPlus },
];

const getIconComponent = (iconId) => {
  const iconMap = ICON_OPTIONS.reduce((acc, curr) => {
    acc[curr.id] = curr.icon;
    return acc;
  }, {});
  return iconMap[iconId] || ClipboardPlus;
};

// --- Sub-Components ---

const AppHeaderSettingsModal = ({ currentSettings, onClose, onSave }) => {
  const [title, setTitle] = useState(currentSettings.title);
  const [subtitle, setSubtitle] = useState(currentSettings.subtitle);
  const [iconId, setIconId] = useState(currentSettings.iconId);
  const [iconColor, setIconColor] = useState(currentSettings.iconColor);
  const [font, setFont] = useState(currentSettings.font);
  const [isSaving, setIsSaving] = useState(false);

  const IconComponent = getIconComponent(iconId);

  const fontOptions = [
    { value: "'Inter', sans-serif", name: 'Inter (기본/깔끔)' },
    { value: "'Gochi Hand', cursive", name: 'Gochi Hand (활동적/손글씨)' },
    { value: "'Noto Serif KR', serif", name: 'Noto Serif KR (단정함/신뢰)' },
    { value: "'Pretendard', sans-serif", name: 'Pretendard (현대적/깔끔)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(iconColor)) {
      alert('유효한 Hex 색상 코드를 입력해주세요 (예: #4f46e5).');
      return;
    }

    if (!title.trim() || !iconId || !iconColor || !font) return;
    setIsSaving(true);
    await onSave({ title: title.trim(), subtitle: subtitle.trim(), iconId, iconColor, font });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
        <h3 className="text-2xl font-bold mb-6 flex items-center text-indigo-600">
          <Settings className="w-6 h-6 mr-2" /> 앱 제목 및 설정 수정
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 border rounded-lg flex items-center justify-between">
            <span className="text-lg font-bold" style={{ color: iconColor }}>{title || '제목 없음'}</span>
            <IconComponent className="w-6 h-6" style={{ color: iconColor }} />
          </div>

          <label className="block">
            <span className="text-gray-700 font-semibold">제목</span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg" required/>
          </label>
          
          <label className="block">
            <span className="text-gray-700 font-semibold">설명 (부제)</span>
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-lg"/>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div className="block col-span-2">
              <span className="text-gray-700 font-semibold mb-2 block">아이콘 선택</span>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 border border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-gray-50">
                {ICON_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = iconId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIconId(opt.id)}
                      className={`p-2 rounded-lg transition duration-150 flex justify-center items-center ${isSelected ? 'bg-indigo-500 text-white shadow-md ring-2 ring-indigo-500' : 'bg-white text-gray-700 hover:bg-indigo-100'}`}
                      title={opt.id}
                    >
                      <Icon className="w-6 h-6" />
                    </button>
                  );
                })}
              </div>
            </div>
            
            <label className="block col-span-2 sm:col-span-1">
              <span className="text-gray-700 font-semibold">아이콘 색상</span>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="color" 
                  value={iconColor} 
                  onChange={(e) => setIconColor(e.target.value)} 
                  className="w-full h-10 p-0 border border-gray-300 rounded-md cursor-pointer overflow-hidden" 
                  required
                />
              </div>
            </label>

            <label className="block col-span-2 sm:col-span-1">
              <span className="text-gray-700 font-semibold">제목 폰트</span>
              <select 
                value={font} 
                onChange={(e) => setFont(e.target.value)} 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                {fontOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.name}</option>
                ))}
              </select>
            </label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
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
              {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />} 설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

const RuleScoreBar = ({ student, rules, studentRuleScores }) => {
  const scores = studentRuleScores[student.id] || {};
  const totalScore = student.score || 0;
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
    return Math.max(1, ...students.map(s => s.score));
  }, [students]);

  if (students.length === 0 || rules.length === 0 || students.every(s => s.score === 0)) {
    return (
      <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-lg h-full flex items-center justify-center border border-gray-100">
        <p>등록된 학생이 없거나 규칙/점수가 부여되지 않았습니다.</p>
      </div>
    );
  }
  
  const sortedStudents = [...students].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 h-full max-h-[80vh] overflow-y-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <BarChart3 className="w-6 h-6 mr-2 text-indigo-500" /> 규칙별 득점 비교 차트
      </h3>
      
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 p-2 rounded-lg border bg-gray-50">
        {rules.map(rule => {
          const RuleIcon = getIconComponent(rule.iconId);
          return (
            <span key={rule.id} className="flex items-center text-xs font-medium text-gray-600">
              <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: rule.color }}></div>
              {rule.name}
            </span>
          )
        })}
      </div>
      
      <div className="space-y-6">
        {sortedStudents.map(student => {
          const scores = studentRuleScores[student.id] || {};
          const totalScore = student.score || 0;
          
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

// --- Main App Component ---

const App = () => {
  const defaultSettings = {
    title: '학급 관리 시스템',
    subtitle: '학년/반/번호 기반 관리 및 실시간 점수 순위표',
    iconId: 'Award',
    iconColor: '#4f46e5',
    font: "'Inter', sans-serif",
  };

  const [user, setUser] = useState(null);
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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 초기 로드: 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [studentsRes, rulesRes, settingsRes] = await Promise.all([
        studentsAPI.getAll(),
        rulesAPI.getAll(),
        settingsAPI.get(),
      ]);

      setStudents(studentsRes.data);
      setRules(rulesRes.data);
      setAppSettings({ ...defaultSettings, ...settingsRes.data });
    } catch (err) {
      console.error('Load data error:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setStudents([]);
    setRules([]);
  };

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.grade !== b.grade) return a.grade - b.grade;
      if (a.classNum !== b.classNum) return a.classNum - b.classNum;
      return a.studentNum - b.studentNum;
    });
  }, [students]);

  const numberedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      if (a.classNum !== b.classNum) return a.classNum - b.classNum;
      return a.studentNum - b.studentNum;
    });
  }, [students]);
  
  const studentRuleScores = useMemo(() => {
    const scores = {};
    students.forEach(student => {
      scores[student.id] = {};
      for (const date in student.dailyScores) {
        const dailyEntry = student.dailyScores[date];
        for (const ruleId in dailyEntry) {
          if (rules.some(r => r.id === parseInt(ruleId)) && dailyEntry[ruleId] === 1) {
            scores[student.id][ruleId] = (scores[student.id][ruleId] || 0) + 1;
          }
        }
      }
    });
    return scores;
  }, [students, rules]);

  const handleSaveSettings = async (newSettings) => {
    try {
      setIsLoading(true);
      await settingsAPI.update(newSettings);
      setAppSettings(newSettings);
      setIsSettingsModalOpen(false);
    } catch (err) {
      console.error('Save settings error:', err);
      setError('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const { grade, classNum, studentNum, name } = newStudentInfo;
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      const response = await studentsAPI.create({ name: name.trim(), grade, classNum, studentNum });
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
  }, [rules]);
  
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

      try {
        setIsLoading(true);
        const response = await studentsAPI.bulkUpload(newStudents);
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

    try {
      setIsLoading(true);
      const ruleData = {
        name: currentRule.name.trim(),
        iconId: currentRule.iconId,
        color: currentRule.color,
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
  
  const handleStartEditRule = (rule) => {
    setEditingRuleId(rule.id);
    setCurrentRule({ name: rule.name, iconId: rule.iconId, color: rule.color });
  };

  // --- Render Functions ---

  const TableHeader = ({ showScore = true, showRuleBar = false }) => (
    <tr className="bg-indigo-50">
      <th className="px-3 py-3 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider w-12">순위</th>
      <th className="px-3 py-3 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider w-16">학년</th>
      <th className="px-3 py-3 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider w-12">반</th>
      <th className="px-3 py-3 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider w-12">번호</th>
      <th className="px-3 py-3 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">이름</th>
      {showScore && <th className="px-3 py-3 text-right text-xs font-semibold text-indigo-600 uppercase tracking-wider w-24">총점</th>}
      {showRuleBar && <th className="px-3 py-3 text-center text-xs font-semibold text-indigo-600 uppercase tracking-wider w-40">규칙별 점수 분포</th>}
    </tr>
  );

  const renderLeaderboard = () => (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-2xl border border-gray-100 h-fit">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <ListOrdered className="w-7 h-7 mr-2 text-indigo-500" /> 종합 순위표
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <TableHeader showRuleBar={true} />
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedStudents.map((student, index) => {
                return (
                  <tr key={student.id} className={`transition duration-150 ease-in-out ${index % 2 === 0 ? 'hover:bg-gray-50' : 'hover:bg-indigo-50'} ${index < 3 ? 'bg-yellow-50/50 font-bold' : ''}`}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`text-xl ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-yellow-900' : 'text-gray-600'}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{student.grade}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{student.classNum}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{student.studentNum}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-2xl font-extrabold text-right text-indigo-700">
                      {student.score}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-center">
                      <RuleScoreBar student={student} rules={rules} studentRuleScores={studentRuleScores} />
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

      <div className="lg:col-span-1">
        <AllStudentsRuleComparison students={students} rules={rules} studentRuleScores={studentRuleScores} />
      </div>
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
      
      {rules.length === 0 ? (
        <div className="text-center p-8 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-lg text-yellow-800 font-semibold">점수를 부여할 규칙이 없습니다. '규칙' 탭에서 규칙을 먼저 등록해주세요.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-12">학년</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-12">반</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-12">번호</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-24">이름</th>
                {rules.map((rule) => {
                  const RuleIcon = getIconComponent(rule.iconId);
                  return (
                    <th key={rule.id} className="px-3 py-3 text-center text-xs font-semibold text-gray-600 whitespace-nowrap">
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
                    <tr key={student.id} className="hover:bg-indigo-50 transition duration-100">
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{student.grade}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{student.classNum}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{student.studentNum}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                      {rules.map((rule) => {
                        const isChecked = dailyEntry[rule.id] === 1;
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
                  <td colSpan={4 + rules.length} className="text-center text-gray-500 py-8">
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
        <Settings className="w-7 h-7 mr-2 text-indigo-500" /> 학생 관리
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
        <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
          <FileText className="w-5 h-5 mr-2" /> CSV 일괄 업데이트
        </h3>
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
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <ClipboardPlus className="w-7 h-7 mr-2 text-indigo-500" /> 규칙 관리
      </h2>

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
          
          <div className="md:col-span-1 lg:col-span-4">
            <span className="text-gray-700 text-sm block mb-1">아이콘 선택</span>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 p-2 border border-gray-300 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
              {ICON_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = currentRule.iconId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCurrentRule(prev => ({ ...prev, iconId: opt.id }))}
                    className={`p-2 rounded-lg transition duration-150 flex justify-center items-center ${isSelected ? 'bg-indigo-500 text-white shadow-md ring-2 ring-indigo-500' : 'bg-white text-gray-700 hover:bg-indigo-100'}`}
                    title={opt.id}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>

          <label className="md:col-span-1 lg:col-span-1">
            <span className="text-gray-700 text-sm">색상</span>
            <input 
              type="color" 
              value={currentRule.color} 
              onChange={(e) => setCurrentRule(prev => ({ ...prev, color: e.target.value }))} 
              className="w-full p-0 border border-gray-300 rounded-lg cursor-pointer mt-1 overflow-hidden h-[42px]" 
              required
            />
          </label>
          
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
    </div>
  );

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (isLoading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  const HeaderIconComponent = getIconComponent(appSettings.iconId);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8" style={{ fontFamily: appSettings.font }}>
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
      
      {isSettingsModalOpen && <AppHeaderSettingsModal currentSettings={appSettings} onClose={() => setIsSettingsModalOpen(false)} onSave={handleSaveSettings} />}

      <header className="text-center mb-8">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-extrabold flex items-center justify-center gap-3 relative" style={{ fontFamily: appSettings.font, color: appSettings.iconColor }}>
            <HeaderIconComponent className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: appSettings.iconColor }} />
            <span>{appSettings.title}</span>
            
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="absolute -right-8 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-indigo-600 transition"
              title="앱 설정 수정"
            >
              <Settings className="w-5 h-5" />
            </button>
          </h1>
        </div>
        <p className="text-gray-500 mt-2 text-lg">{appSettings.subtitle}</p>
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <LogOut className="w-4 h-4 mr-2" /> 로그아웃 ({user.username})
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="flex border-b border-gray-200 mb-6 sticky top-0 bg-white z-10 shadow-sm rounded-t-xl">
          {TABS.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center p-3 text-center text-lg font-semibold transition-colors duration-200 border-b-4 
                  ${isActive 
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50' 
                    : 'border-transparent text-gray-500 hover:text-indigo-500 hover:border-gray-300'}`
                }
              >
                <TabIcon className="w-5 h-5 mr-2" /> {tab.name}
              </button>
            );
          })}
        </div>

        <div className="tab-content">
          {activeTab === 'leaderboard' && renderLeaderboard()}
          {activeTab === 'scoring' && renderScoring()}
          {activeTab === 'management' && renderManagement()}
          {activeTab === 'rules' && renderRules()}
        </div>
      </div>
    </div>
  );
};

export default App;
