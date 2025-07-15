# NHN 결제서비스 연동 가이드

## 📋 개요
이 문서는 Vue.js 프로젝트에서 NHN 결제서비스를 연동하는 방법을 설명합니다.

## 🚀 현재 상태
- ✅ 모의 결제 시스템 구현 완료
- ✅ 결제 UI 및 로직 구현 완료
- ⚠️ 실제 NHN 결제 SDK 연결 필요

## 🔧 실제 NHN 결제 서비스 연동 단계

### 1. NHN 결제서비스 가입 및 계약
1. NHN 결제서비스 공식 사이트 방문
2. 사업자 등록 및 계약 진행
3. 테스트 환경 계정 생성

### 2. 개발 환경 설정
```javascript
// src/config/payment.js 수정
export const PAYMENT_CONFIG = {
  TEST_MODE: true,
  MERCHANT_ID: 'YOUR_NHN_TEST_MERCHANT_ID',
  API_URL: 'https://api-test.nhn.com/payment',
  SDK_URL: 'https://실제NHN결제SDK_URL',
  // ... 기타 설정
}
```

### 3. SDK 연동
```javascript
// src/services/paymentService.js 수정
const PAYMENT_CONFIG = {
  TEST_MODE: true,
  SDK_URL: 'https://실제NHN결제SDK_URL', // 실제 SDK URL로 교체
  // ... 기타 설정
}
```

### 4. 콜백 URL 등록
NHN 결제 관리자 페이지에서 다음 URL들을 등록:
- 성공: `https://yourdomain.com/ticketing?status=success`
- 취소: `https://yourdomain.com/ticketing?status=cancel`
- 실패: `https://yourdomain.com/ticketing?status=fail`

### 5. 테스트 결제 진행
1. 테스트 카드 번호 사용
2. 결제 플로우 확인
3. 콜백 처리 확인

### 6. 운영 환경 배포
```javascript
// 운영 환경 설정
export const PAYMENT_CONFIG = {
  TEST_MODE: false,
  MERCHANT_ID: 'YOUR_NHN_PRODUCTION_MERCHANT_ID',
  API_URL: 'https://api.nhn.com/payment',
  SDK_URL: 'https://실제NHN운영SDK_URL',
  // ... 기타 설정
}
```

## 💳 테스트 카드 번호
- **VISA**: 4111111111111111
- **MasterCard**: 5555555555554444
- **결제 거절**: 4000000000000002

## 🔍 현재 구현된 기능

### 결제 서비스 (`src/services/paymentService.js`)
- ✅ SDK 동적 로드
- ✅ 결제 초기화
- ✅ 결제 요청 처리
- ✅ 결제 검증
- ✅ 결제 취소
- ✅ 모의 결제 시스템

### 결제 UI (`src/views/Ticketing.vue`)
- ✅ 플랜 변경 결제
- ✅ 결제 수단 관리
- ✅ 결제 상태 표시
- ✅ 로딩 상태 처리
- ✅ 에러 처리

### 스타일링 (`src/assets/styles/Ticketing.css`)
- ✅ 반응형 디자인
- ✅ 넷플릭스 테마 적용
- ✅ 결제 상태 알림
- ✅ 모달 디자인

## 🧪 테스트 방법

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. 테스트 페이지 접속
```
http://localhost:3000/ticketing
```

### 3. 테스트 기능 사용
- "테스트 결제 (₩1,000)" 버튼 클릭
- 플랜 변경 버튼 클릭
- 결제 수단 추가 테스트

### 4. 콘솔 확인
브라우저 개발자 도구에서 결제 처리 로그 확인

## 🔨 문제 해결

### SDK 로드 실패
- 실제 NHN SDK URL 확인
- 네트워크 연결 상태 확인
- CORS 설정 확인

### 결제 처리 실패
- Merchant ID 확인
- API 키 유효성 확인
- 콜백 URL 설정 확인

### 콜백 처리 실패
- URL 라우팅 확인
- 파라미터 처리 로직 확인

## 📞 지원
- NHN 결제서비스 기술지원팀 문의
- 개발 문서 참조
- 테스트 환경 활용

## 🚨 주의사항
- 실제 운영 환경에서는 반드시 HTTPS 사용
- 민감한 정보는 환경 변수로 관리
- 결제 로그는 보안을 고려하여 관리
- 정기적인 보안 업데이트 필요

---

**현재 상태**: 모의 결제 시스템으로 구현완료 ✅  
**다음 단계**: 실제 NHN 결제 SDK 연동 🔄 