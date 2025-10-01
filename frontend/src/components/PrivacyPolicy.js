import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import Footer from './Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <a 
            href="/#/" 
            className="flex items-center text-gray-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-semibold">홈으로</span>
          </a>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">개인정보처리방침</h1>
          </div>
          
          <p className="text-sm text-gray-500 mb-8">
            최종 수정일: {new Date().toLocaleDateString('ko-KR')}
          </p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 개인정보의 수집 및 이용 목적</h2>
              <p className="mb-3">학급 관리 시스템은 다음의 목적을 위해 개인정보를 수집 및 이용합니다:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>회원 가입 및 관리: 회원제 서비스 제공, 본인 확인, 회원자격 유지·관리</li>
                <li>서비스 제공: 학급 관리, 학생 점수 관리, 순위표 제공 등의 서비스 제공</li>
                <li>서비스 개선: 서비스 이용 기록 분석을 통한 서비스 개선 및 맞춤형 서비스 제공</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 수집하는 개인정보 항목</h2>
              <p className="mb-3">학급 관리 시스템은 다음의 개인정보를 수집합니다:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>필수 항목:</strong> 아이디(이메일), 비밀번호</li>
                <li><strong>학생 정보:</strong> 이름, 학년, 반, 번호 (학급 관리 목적)</li>
                <li><strong>자동 수집 정보:</strong> 서비스 이용 기록, 접속 IP, 쿠키</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
              <p className="mb-3">회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>회원 정보:</strong> 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지)</li>
                <li><strong>학급 및 학생 데이터:</strong> 서비스 이용 기간 동안 보관하며, 사용자가 삭제 요청 시 즉시 삭제</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
              <p>학급 관리 시스템은 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 개인정보의 파기 절차 및 방법</h2>
              <p className="mb-3">이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용 목적이 달성되면 지체 없이 파기합니다.</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>파기 절차:</strong> 이용자가 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.</li>
                <li><strong>파기 방법:</strong> 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 이용자 및 법정대리인의 권리</h2>
              <p className="mb-3">이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>개인정보 열람 요구</li>
                <li>개인정보 정정 요구</li>
                <li>개인정보 삭제 요구</li>
                <li>개인정보 처리 정지 요구</li>
              </ul>
              <p className="mt-3">권리 행사는 서비스 내 설정 메뉴 또는 이메일(hwanys2@naver.com)을 통해 가능합니다.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 개인정보 보호책임자</h2>
              <p className="mb-3">학급 관리 시스템은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p className="font-semibold">개인정보 보호책임자</p>
                <p className="mt-2">이메일: hwanys2@naver.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 개인정보처리방침 변경</h2>
              <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
            </section>

            <section className="bg-indigo-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-indigo-900 mb-3">문의하기</h2>
              <p className="text-gray-700">
                개인정보처리방침에 대한 문의사항이 있으시면 아래 이메일로 연락주시기 바랍니다.
              </p>
              <p className="mt-2 font-semibold text-indigo-700">
                이메일: hwanys2@naver.com
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

