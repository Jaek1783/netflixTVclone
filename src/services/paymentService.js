// NHN 결제서비스 통합 모듈

// 결제 설정
const PAYMENT_CONFIG = {
  TEST_MODE: true,
  MERCHANT_ID: 'nhn_test_merchant_id',
  API_URL: 'https://api-test.nhn.com/payment',
  SDK_URL: null, // 테스트 환경에서는 SDK 로드 없이 모의 결제 사용
  CURRENCY: 'KRW',
  RETURN_URL: 'http://localhost:3000/ticketing?status=success',
  CANCEL_URL: 'http://localhost:3000/ticketing?status=cancel',
  FAIL_URL: 'http://localhost:3000/ticketing?status=fail'
}

class PaymentService {
  constructor() {
    this.isSDKLoaded = false
    this.paymentInstance = null
  }

  // NHN 결제 SDK 로드
  async loadPaymentSDK() {
    if (this.isSDKLoaded) return Promise.resolve()

    // 테스트 환경에서는 SDK 로드 없이 바로 성공 처리
    if (PAYMENT_CONFIG.TEST_MODE && !PAYMENT_CONFIG.SDK_URL) {
      console.log('테스트 모드: 모의 SDK 로드 완료')
      this.isSDKLoaded = true
      return Promise.resolve()
    }

    // 실제 SDK가 있는 경우에만 로드
    if (PAYMENT_CONFIG.SDK_URL) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = PAYMENT_CONFIG.SDK_URL
        script.onload = () => {
          this.isSDKLoaded = true
          console.log('NHN 결제 SDK 로드 완료')
          resolve()
        }
        script.onerror = (error) => {
          console.error('NHN 결제 SDK 로드 실패:', error)
          reject(error)
        }
        document.head.appendChild(script)
      })
    }

    // SDK URL이 없는 경우
    console.log('SDK URL이 설정되지 않았습니다. 모의 결제 모드로 진행합니다.')
    this.isSDKLoaded = true
    return Promise.resolve()
  }

  // 결제 초기화
  async initPayment() {
    try {
      await this.loadPaymentSDK()
      
      // 테스트 모드에서는 모의 인스턴스 생성
      if (PAYMENT_CONFIG.TEST_MODE) {
        this.paymentInstance = {
          requestPayment: (data) => this.mockPayment(data),
          merchantId: PAYMENT_CONFIG.MERCHANT_ID,
          testMode: true
        }
        console.log('테스트 모드: 모의 결제 인스턴스 생성 완료')
        return
      }
      
      // 실제 NHN 결제 SDK 초기화 (운영 환경)
      if (window.NHNPayment) {
        this.paymentInstance = new window.NHNPayment({
          merchantId: PAYMENT_CONFIG.MERCHANT_ID,
          testMode: PAYMENT_CONFIG.TEST_MODE
        })
        console.log('NHN 결제 SDK 초기화 완료')
      } else {
        console.warn('NHN 결제 SDK를 찾을 수 없습니다. 모의 결제 모드로 진행합니다.')
        this.paymentInstance = {
          requestPayment: (data) => this.mockPayment(data),
          merchantId: PAYMENT_CONFIG.MERCHANT_ID,
          testMode: true
        }
      }
    } catch (error) {
      console.error('결제 초기화 실패:', error)
      // 초기화 실패 시에도 모의 결제 인스턴스 생성
      this.paymentInstance = {
        requestPayment: (data) => this.mockPayment(data),
        merchantId: PAYMENT_CONFIG.MERCHANT_ID,
        testMode: true
      }
      console.log('초기화 실패로 인한 모의 결제 모드 활성화')
    }
  }

  // 결제 요청
  async requestPayment(paymentData) {
    try {
      await this.initPayment()

      const paymentRequest = {
        orderId: this.generateOrderId(),
        amount: paymentData.amount,
        orderName: paymentData.orderName,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        paymentMethod: paymentData.paymentMethod,
        currency: PAYMENT_CONFIG.CURRENCY,
        returnUrl: PAYMENT_CONFIG.RETURN_URL,
        cancelUrl: PAYMENT_CONFIG.CANCEL_URL,
        failUrl: PAYMENT_CONFIG.FAIL_URL
      }

      console.log('결제 요청 데이터:', paymentRequest)

      // 결제 인스턴스를 통해 결제 처리
      if (this.paymentInstance && this.paymentInstance.requestPayment) {
        return await this.paymentInstance.requestPayment(paymentRequest)
      }

      // 백업: 직접 모의 결제 처리
      console.log('결제 인스턴스 없음, 직접 모의 결제 처리')
      return this.mockPayment(paymentRequest)
    } catch (error) {
      console.error('결제 요청 실패:', error)
      throw error
    }
  }

  // 모의 결제 처리 (테스트용)
  mockPayment(paymentRequest) {
    return new Promise((resolve, reject) => {
      console.log('🔄 모의 결제 처리 시작...', {
        orderId: paymentRequest.orderId,
        amount: paymentRequest.amount,
        method: paymentRequest.paymentMethod
      })
      
      setTimeout(() => {
        const success = Math.random() > 0.2 // 80% 성공률
        
        if (success) {
          const result = {
            success: true,
            orderId: paymentRequest.orderId,
            paymentId: 'mock_payment_' + Date.now(),
            amount: paymentRequest.amount,
            status: 'COMPLETED',
            paidAt: new Date().toISOString(),
            method: paymentRequest.paymentMethod,
            currency: paymentRequest.currency,
            customerName: paymentRequest.customerName,
            merchantId: PAYMENT_CONFIG.MERCHANT_ID
          }
          console.log('✅ 모의 결제 성공:', result)
          resolve(result)
        } else {
          const errorTypes = ['PAYMENT_FAILED', 'CARD_DECLINED', 'INSUFFICIENT_FUNDS', 'NETWORK_ERROR']
          const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)]
          
          const error = {
            success: false,
            error: randomError,
            message: `모의 결제 실패: ${randomError}`,
            orderId: paymentRequest.orderId
          }
          console.log('❌ 모의 결제 실패:', error)
          reject(error)
        }
      }, 1500) // 1.5초 후 결과 반환
    })
  }

  // 결제 결과 확인
  async verifyPayment(paymentId) {
    try {
      const response = await fetch(`${PAYMENT_CONFIG.API_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentId,
          merchantId: PAYMENT_CONFIG.MERCHANT_ID
        })
      })

      if (!response.ok) {
        throw new Error('결제 검증 실패')
      }

      return await response.json()
    } catch (error) {
      console.error('결제 검증 오류:', error)
      throw error
    }
  }

  // 결제 취소
  async cancelPayment(paymentId, reason) {
    try {
      const response = await fetch(`${PAYMENT_CONFIG.API_URL}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: paymentId,
          merchantId: PAYMENT_CONFIG.MERCHANT_ID,
          reason: reason
        })
      })

      if (!response.ok) {
        throw new Error('결제 취소 실패')
      }

      return await response.json()
    } catch (error) {
      console.error('결제 취소 오류:', error)
      throw error
    }
  }

  // 주문 ID 생성
  generateOrderId() {
    return 'netflix_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // 결제 수단별 설정
  getPaymentMethodConfig(method) {
    const configs = {
      card: {
        name: '신용카드',
        icon: '💳',
        description: '신용카드로 결제'
      },
      bank: {
        name: '계좌이체',
        icon: '🏦',
        description: '계좌이체로 결제'
      },
      phone: {
        name: '휴대폰',
        icon: '📱',
        description: '휴대폰 결제'
      },
      virtual_account: {
        name: '가상계좌',
        icon: '💰',
        description: '가상계좌로 결제'
      }
    }

    return configs[method] || configs.card
  }
}

export default new PaymentService() 