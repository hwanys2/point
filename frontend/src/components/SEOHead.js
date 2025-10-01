import React from 'react';
import { Helmet } from 'react-helmet';

const SEOHead = ({ 
  title = '학급 관리 시스템 - 학생 점수 관리 및 순위표',
  description = '교사와 학생을 위한 스마트한 학급 관리 시스템. 학생 점수 부여, 실시간 순위표, 규칙별 관리 기능을 제공하는 무료 온라인 도구입니다.',
  keywords = '학급관리, 학생관리, 점수관리, 순위표, 학급점수, 학생점수, 교실관리, 교육도구, 학급운영, 학생평가, 포인트시스템, 학급순위, 교육관리',
  url = 'https://classpoint.kr',
  image = 'https://classpoint.kr/og-image.png',
  type = 'website'
}) => {
  const fullTitle = title.includes('학급 관리 시스템') ? title : `${title} | 학급 관리 시스템`;
  
  return (
    <Helmet>
      {/* 기본 메타 태그 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph 메타 태그 */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="학급 관리 시스템" />
      
      {/* Twitter Card 메타 태그 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* 추가 메타 태그 */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
    </Helmet>
  );
};

export default SEOHead;
