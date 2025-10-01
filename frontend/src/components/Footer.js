import React from 'react';
import { Award, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 로고 및 설명 */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <Award className="w-6 h-6 text-indigo-400 mr-2" />
              <span className="text-lg font-semibold text-white">학급 관리 시스템</span>
            </div>
            <p className="text-sm">선생님을 위한 스마트한 학급 관리 솔루션</p>
          </div>

          {/* 법적 문서 링크 */}
          <div className="text-center">
            <h3 className="text-white font-semibold mb-4">정책 및 약관</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="/#/privacy-policy" 
                  className="hover:text-indigo-400 transition"
                >
                  개인정보처리방침
                </a>
              </li>
              <li>
                <a 
                  href="/#/terms-of-service" 
                  className="hover:text-indigo-400 transition"
                >
                  이용약관
                </a>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div className="text-center md:text-right">
            <h3 className="text-white font-semibold mb-4">문의</h3>
            <a 
              href="mailto:hwanys2@naver.com" 
              className="inline-flex items-center text-sm hover:text-indigo-400 transition"
            >
              <Mail className="w-4 h-4 mr-2" />
              hwanys2@naver.com
            </a>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-center">
            © {new Date().getFullYear()} 학급 관리 시스템. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

