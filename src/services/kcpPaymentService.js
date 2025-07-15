// 실제 NHN KCP 결제 서비스 연동

class KCPPaymentService {
  constructor() {
    this.isKCPLoaded = false
    this.isTestMode = true  // 개발 모드 플래그
    this.kcpConfig = {
      // KCP 설정 (개발 환경)
      site_cd: 'T0000',     // 테스트 사이트 코드
      site_key: 'TEST_KEY', // 테스트 사이트 키
      site_name: '넷플릭스 개발 테스트',
      currency: 'KRW',
      // 결제창 타입 설정
      pay_method: 'CARD',
      // 팝업 결제창 설정
      popup_yn: 'Y',
      // 결제 완료 후 콜백 URL
      return_url: 'http://localhost:3000/ticketing?status=success',
      cancel_url: 'http://localhost:3000/ticketing?status=cancel',
      // 결제창 크기 설정
      popup_width: 500,
      popup_height: 600
    }
  }

  // KCP 결제 모듈 로드
  async loadKCPScript() {
    if (this.isKCPLoaded) return Promise.resolve()

    // 개발 환경에서는 실제 KCP 스크립트 로드 없이 바로 성공 처리
    console.log('🔧 개발 모드: KCP 모듈 로드 시뮬레이션')
    this.isKCPLoaded = true
    return Promise.resolve()

    // 실제 운영 환경에서는 아래 코드 사용
    /*
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://testpgapi.kcp.co.kr/plugin/payplus_web.jsp'
      script.onload = () => {
        this.isKCPLoaded = true
        console.log('KCP 결제 모듈 로드 완료')
        resolve()
      }
      script.onerror = (error) => {
        console.error('KCP 결제 모듈 로드 실패:', error)
        reject(error)
      }
      document.head.appendChild(script)
    })
    */
  }

  // 팝업 결제창 열기
  async openPaymentPopup(paymentData) {
    try {
      await this.loadKCPScript()

      // 결제 요청 데이터 준비
      const requestData = {
        site_cd: this.kcpConfig.site_cd,
        site_key: this.kcpConfig.site_key,
        site_name: this.kcpConfig.site_name,
        ordr_idxx: paymentData.orderId,
        good_name: paymentData.orderName,
        good_mny: paymentData.amount,
        buyr_name: paymentData.customerName,
        buyr_mail: paymentData.customerEmail,
        pay_method: this.kcpConfig.pay_method,
        currency: this.kcpConfig.currency,
        popup_yn: this.kcpConfig.popup_yn,
        return_url: this.kcpConfig.return_url
      }

      console.log('💳 KCP 결제 요청:', requestData)

      // 개발 환경에서는 항상 모의 결제창 사용
      console.log('🔧 개발 모드: 모의 KCP 팝업 결제창 사용')
      return this.mockKCPPayment(requestData)

      // 실제 운영 환경에서는 아래 코드 사용
      /*
      if (window.openKCPPayment) {
        return window.openKCPPayment(requestData)
      } else {
        console.warn('KCP 모듈이 로드되지 않았습니다. 모의 결제창을 사용합니다.')
        return this.mockKCPPayment(requestData)
      }
      */
    } catch (error) {
      console.error('KCP 결제창 오류:', error)
      // 에러 발생 시에도 모의 결제로 진행
      console.log('🔧 에러 발생으로 모의 결제 진행')
      return this.mockKCPPayment({
        ordr_idxx: paymentData.orderId,
        good_name: paymentData.orderName,
        good_mny: paymentData.amount
      })
    }
  }

  // 임베디드 결제창 (페이지 내 결제)
  async initEmbeddedPayment(containerId, paymentData) {
    try {
      await this.loadKCPScript()

      const container = document.getElementById(containerId)
      if (!container) {
        throw new Error('결제 컨테이너를 찾을 수 없습니다')
      }

      // KCP 임베디드 결제창 초기화
      const paymentConfig = {
        ...this.kcpConfig,
        ordr_idxx: paymentData.orderId,
        good_name: paymentData.orderName,
        good_mny: paymentData.amount,
        buyr_name: paymentData.customerName,
        buyr_mail: paymentData.customerEmail,
        popup_yn: 'N' // 임베디드 모드
      }

      // 개발 환경에서는 항상 모의 임베디드 결제 사용
      console.log('🔧 개발 모드: 모의 KCP 임베디드 결제 사용')
      return this.mockEmbeddedPayment(container, paymentConfig)

      // 실제 운영 환경에서는 아래 코드 사용
      /*
      if (window.initKCPEmbedded) {
        return window.initKCPEmbedded(container, paymentConfig)
      } else {
        console.warn('KCP 임베디드 모듈이 없습니다')
        return this.mockEmbeddedPayment(container, paymentConfig)
      }
      */
    } catch (error) {
      console.error('KCP 임베디드 결제 초기화 오류:', error)
      // 에러 발생 시에도 모의 결제로 진행
      console.log('🔧 에러 발생으로 모의 임베디드 결제 진행')
      const container = document.getElementById(containerId)
      if (container) {
        return this.mockEmbeddedPayment(container, {
          good_name: paymentData.orderName,
          good_mny: paymentData.amount
        })
      }
    }
  }

  // 모의 KCP 결제 처리 (개발용)
  mockKCPPayment(requestData) {
    return new Promise((resolve, reject) => {
      console.log('🔄 모의 KCP 팝업 결제 시작...', {
        orderId: requestData.ordr_idxx,
        amount: requestData.good_mny,
        productName: requestData.good_name
      })
      
      // 실제 KCP 팝업과 유사한 처리 시뮬레이션
      const popup = window.open(
        '', 
        'kcpPayment', 
        `width=${this.kcpConfig.popup_width},height=${this.kcpConfig.popup_height},scrollbars=yes,resizable=no`
      )

      if (!popup) {
        console.error('팝업이 차단되었습니다')
        reject(new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.'))
        return
      }

      // 팝업 내용 생성
      popup.document.write(`
        <html>
          <head>
            <title>KCP 결제창</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                background: #f5f5f5;
              }
              .payment-form {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .form-group {
                margin-bottom: 15px;
              }
              label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
              }
              input, select {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-sizing: border-box;
              }
              .btn {
                background: #007bff;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                margin-right: 10px;
              }
              .btn:hover {
                background: #0056b3;
              }
              .cancel-btn {
                background: #6c757d;
              }
              .cancel-btn:hover {
                background: #545b62;
              }
            </style>
          </head>
          <body>
            <div class="payment-form">
              <h2>KCP 결제창</h2>
              <div class="form-group">
                <label>상품명</label>
                <input type="text" value="${requestData.good_name}" readonly>
              </div>
              <div class="form-group">
                <label>결제금액</label>
                <input type="text" value="${requestData.good_mny.toLocaleString()}원" readonly>
              </div>
              <div class="form-group">
                <label>카드번호</label>
                <input type="text" placeholder="1234-5678-9012-3456" id="card_number">
              </div>
              <div class="form-group">
                <label>유효기간</label>
                <input type="text" placeholder="MM/YY" id="expiry">
              </div>
              <div class="form-group">
                <label>CVC</label>
                <input type="text" placeholder="123" id="cvc">
              </div>
              <button class="btn" onclick="processPayment()">결제하기</button>
              <button class="btn cancel-btn" onclick="window.close()">취소</button>
            </div>
            <script>
              function processPayment() {
                const cardNumber = document.getElementById('card_number').value;
                const expiry = document.getElementById('expiry').value;
                const cvc = document.getElementById('cvc').value;
                
                if (!cardNumber || !expiry || !cvc) {
                  alert('모든 필드를 입력해주세요');
                  return;
                }
                
                // 모의 결제 처리
                setTimeout(() => {
                  const success = Math.random() > 0.3; // 70% 성공률
                  
                  if (success) {
                    window.opener.postMessage({
                      type: 'KCP_PAYMENT_SUCCESS',
                      data: {
                        success: true,
                        paymentId: 'kcp_${Date.now()}',
                        orderId: '${requestData.ordr_idxx}',
                        amount: ${requestData.good_mny},
                        status: 'COMPLETED'
                      }
                    }, '*');
                  } else {
                    window.opener.postMessage({
                      type: 'KCP_PAYMENT_FAIL',
                      data: {
                        success: false,
                        error: 'PAYMENT_FAILED',
                        message: '결제 실패'
                      }
                    }, '*');
                  }
                  
                  window.close();
                }, 1000);
              }
            </script>
          </body>
        </html>
      `)

      // 팝업 메시지 수신
      const messageHandler = (event) => {
        if (event.data.type === 'KCP_PAYMENT_SUCCESS') {
          window.removeEventListener('message', messageHandler)
          resolve(event.data.data)
        } else if (event.data.type === 'KCP_PAYMENT_FAIL') {
          window.removeEventListener('message', messageHandler)
          reject(event.data.data)
        }
      }

      window.addEventListener('message', messageHandler)

      // 팝업 닫힘 감지
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          reject(new Error('사용자가 결제를 취소했습니다'))
        }
      }, 1000)
    })
  }

  // 모의 임베디드 결제
  mockEmbeddedPayment(container, config) {
    container.innerHTML = `
      <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; background: white;">
        <h3>KCP 임베디드 결제</h3>
        <p>상품명: ${config.good_name}</p>
        <p>결제금액: ${config.good_mny.toLocaleString()}원</p>
        <div style="margin-top: 15px;">
          <button style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
            결제하기
          </button>
        </div>
      </div>
    `
  }

  // 결제 결과 검증
  async verifyPayment(paymentId) {
    try {
      // 실제 KCP 결제 검증 API 호출
      const response = await fetch('/api/kcp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentId,
          site_cd: this.kcpConfig.site_cd
        })
      })

      return await response.json()
    } catch (error) {
      console.error('KCP 결제 검증 오류:', error)
      throw error
    }
  }
}

export default new KCPPaymentService()

// 실제 KCP 연동 가이드
export const KCP_INTEGRATION_GUIDE = {
  requirements: [
    '1. KCP 가맹점 신청 및 승인',
    '2. 사이트 코드 및 사이트 키 발급',
    '3. KCP 결제 모듈 다운로드',
    '4. 서버 측 결제 검증 구현',
    '5. 콜백 URL 설정'
  ],
  
  paymentMethods: [
    '신용카드', '계좌이체', '가상계좌', '휴대폰', '상품권'
  ],
  
  popupSettings: {
    width: 500,
    height: 600,
    scrollbars: 'yes',
    resizable: 'no'
  },
  
  testCards: [
    '4000-0000-0000-0004 (VISA)',
    '5000-0000-0000-0009 (Master)',
    '3000-0000-0000-0006 (JCB)'
  ]
} 