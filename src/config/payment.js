// NHN 결제서비스 설정
export const PAYMENT_CONFIG = {
  // 개발 환경 설정
  TEST_MODE: true,
  
  // NHN 결제서비스 merchant ID
  // 실제 운영 시 NHN에서 발급받은 merchant ID로 교체
  MERCHANT_ID: 'nhn_test_merchant_id',
  
  // API URL 설정
  // 실제 NHN 결제 API URL로 교체 필요
  API_URL: 'https://api-test.nhn.com/payment',
  
  // SDK URL 설정
  // 실제 NHN 결제 SDK URL로 교체 필요
  // 현재는 테스트를 위해 null로 설정
  SDK_URL: null,
  
  // 실제 NHN 결제 SDK URL 예시 (실제 발급받은 URL로 교체)
  // SDK_URL: 'https://pay.nhn.com/payjs/payjs-2.0.0.js',
  
  // 결제 수단 설정
  PAYMENT_METHODS: {
    CARD: 'card',
    BANK: 'bank',
    PHONE: 'phone',
    VIRTUAL_ACCOUNT: 'virtual_account'
  },
  
  // 통화 설정
  CURRENCY: 'KRW',
  
  // 결제 완료 후 리턴 URL
  RETURN_URL: 'http://localhost:3000/ticketing?status=success',
  
  // 결제 취소 URL
  CANCEL_URL: 'http://localhost:3000/ticketing?status=cancel',
  
  // 결제 실패 URL
  FAIL_URL: 'http://localhost:3000/ticketing?status=fail'
}

// NHN 결제서비스 실제 연동 가이드
export const INTEGRATION_GUIDE = {
  steps: [
    '1. NHN 결제서비스 가입 및 계약',
    '2. 테스트 환경 merchant ID 발급',
    '3. 실제 SDK URL 확인 및 설정',
    '4. 콜백 URL 등록',
    '5. 테스트 결제 진행',
    '6. 운영 환경 merchant ID 발급',
    '7. 운영 환경 배포'
  ],
  
  requiredInfo: [
    'Merchant ID (테스트/운영)',
    'API Key (테스트/운영)',
    'Secret Key (테스트/운영)',
    'SDK URL',
    'Callback URL'
  ],
  
  testCards: [
    '4111111111111111 (VISA)',
    '5555555555554444 (MasterCard)',
    '4000000000000002 (결제 거절 테스트)'
  ]
} 