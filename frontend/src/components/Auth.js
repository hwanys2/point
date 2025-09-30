import React, { useState } from 'react';
import { LogIn, UserPlus, Loader2, Award, X } from 'lucide-react';
import { authAPI } from '../services/api';

const Auth = ({ onLogin, onClose, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    schoolName: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let response;
      if (isLogin) {
        // 로그인은 username 또는 email 모두 가능
        response = await authAPI.login({
          username: formData.email, // email 입력란을 username으로 사용
          password: formData.password,
        });
      } else {
        response = await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          schoolName: formData.schoolName,
        });
      }

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || '오류가 발생했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        <div className="text-center mb-8">
          <Award className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">학급 관리 시스템</h1>
          <p className="text-gray-500 mt-2">학생 점수 관리 및 순위표</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사용자명
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  minLength="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  학교 이름 (선택)
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isLogin ? '이메일 또는 사용자명' : '이메일'}
            </label>
            <input
              type={isLogin ? "text" : "email"}
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 {!isLogin && '(최소 6자)'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              minLength={isLogin ? "4" : "6"}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? (
                  <>
                    <LogIn className="w-5 h-5 mr-2" /> 로그인
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" /> 회원가입
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
