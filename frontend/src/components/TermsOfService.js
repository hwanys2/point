import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import Footer from './Footer';

const TermsOfService = () => {
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
            <FileText className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">이용약관</h1>
          </div>
          
          <p className="text-sm text-gray-500 mb-8">
            최종 수정일: {new Date().toLocaleDateString('ko-KR')}
          </p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
              <p>
                본 약관은 학급 관리 시스템(이하 "서비스")을 이용함에 있어 서비스 제공자와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제2조 (용어의 정의)</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>"서비스"</strong>란 학급 관리 시스템이 제공하는 학생 점수 관리, 순위표, 규칙 설정 등의 온라인 서비스를 의미합니다.</li>
                <li><strong>"이용자"</strong>란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                <li><strong>"회원"</strong>이란 서비스에 회원등록을 한 자로서, 계속적으로 서비스를 이용할 수 있는 자를 말합니다.</li>
                <li><strong>"교사"</strong>란 학급을 생성하고 전체 관리 권한을 가진 회원을 말합니다.</li>
                <li><strong>"학생 관리자"</strong>란 교사가 제한된 권한을 부여한 회원을 말합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</li>
                <li>본 약관의 내용은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지하고, 이에 동의한 이용자가 서비스에 가입함으로써 효력이 발생합니다.</li>
                <li>서비스 제공자는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 시행일자 7일 전부터 공지합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제4조 (회원가입)</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>이용자는 서비스가 정한 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
                <li>서비스는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각호에 해당하지 않는 한 회원으로 등록합니다:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                    <li>기타 회원으로 등록하는 것이 서비스의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제5조 (서비스의 제공 및 변경)</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>서비스는 다음과 같은 업무를 수행합니다:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>학급 및 학생 정보 관리</li>
                    <li>학생별 점수 부여 및 관리</li>
                    <li>실시간 순위표 제공</li>
                    <li>맞춤형 규칙 설정</li>
                    <li>기간별 통계 및 분석</li>
                    <li>학생 관리자 권한 관리</li>
                  </ul>
                </li>
                <li>서비스는 필요한 경우 서비스의 내용을 변경할 수 있으며, 변경사항은 사전 공지합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제6조 (서비스의 중단)</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>서비스는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
                <li>제1항에 의한 서비스 중단의 경우, 서비스는 사전에 공지합니다. 다만, 사전에 공지할 수 없는 부득이한 사유가 있는 경우 사후에 공지할 수 있습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제7조 (이용자의 의무)</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>이용자는 다음 행위를 하여서는 안 됩니다:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>신청 또는 변경 시 허위내용의 등록</li>
                    <li>타인의 정보 도용</li>
                    <li>서비스에 게시된 정보의 무단 변경</li>
                    <li>서비스가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                    <li>서비스의 저작권 등 지적재산권에 대한 침해</li>
                    <li>타인의 명예를 손상시키거나 불이익을 주는 행위</li>
                    <li>서비스의 안정적인 운영에 지장을 주는 행위</li>
                  </ul>
                </li>
                <li>이용자는 관계법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항 등을 준수하여야 합니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제8조 (개인정보의 보호)</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>서비스는 관계법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력합니다.</li>
                <li>개인정보의 보호 및 사용에 대해서는 관련법령 및 서비스의 개인정보처리방침이 적용됩니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제9조 (저작권 및 콘텐츠)</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>서비스가 작성한 저작물에 대한 저작권 및 기타 지적재산권은 서비스에 귀속됩니다.</li>
                <li>이용자는 서비스를 이용함으로써 얻은 정보 중 서비스에 지적재산권이 귀속된 정보를 서비스의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
                <li>이용자가 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제10조 (손해배상)</h2>
              <p className="mb-3">
                서비스는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 서비스가 고의 또는 중대한 과실로 인한 손해발생의 경우를 제외하고는 이에 대하여 책임을 부담하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제11조 (면책조항)</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
                <li>서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
                <li>서비스는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제12조 (분쟁해결)</h2>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>서비스는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 노력합니다.</li>
                <li>본 약관에 명시되지 않은 사항은 관계법령 및 상관례에 따릅니다.</li>
              </ol>
            </section>

            <section className="bg-indigo-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-indigo-900 mb-3">문의하기</h2>
              <p className="text-gray-700">
                이용약관에 대한 문의사항이 있으시면 아래 이메일로 연락주시기 바랍니다.
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

export default TermsOfService;

