<template>
  <div class="ticketing-container">
    <div class="ticketing-header">
      <h1>결제권 관리</h1>
      <p>넷플릭스 구독 및 결제 정보를 관리하세요</p>
    </div>
    
    <div class="ticketing-content">
      <div class="subscription-card">
        <h2>현재 구독 정보</h2>
        <div class="subscription-info">
          <div class="plan-info">
            <h3>스탠다드 플랜</h3>
            <p class="plan-price">₩13,500/월</p>
            <p class="plan-description">최대 2대의 기기에서 동시 시청 가능</p>
          </div>
          <div class="plan-features">
            <ul>
              <li>✓ HD 화질</li>
              <li>✓ 2대 기기 동시 시청</li>
              <li>✓ 무제한 영화 및 TV 프로그램</li>
              <li>✓ 광고 없음</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 결제 상태 메시지 -->
      <div v-if="paymentStatus" class="payment-status" :class="paymentStatus.type">
        <h3>{{ paymentStatus.title }}</h3>
        <p>{{ paymentStatus.message }}</p>
        <button @click="paymentStatus = null" class="close-btn">×</button>
      </div>

      <!-- 결제 진행 중 로딩 -->
      <div v-if="isPaymentLoading" class="payment-loading">
        <div class="loading-spinner"></div>
        <p>결제 처리 중...</p>
      </div>

      <div class="payment-methods">
        <h2>결제 방법</h2>
        <div class="payment-cards">
          <div class="payment-card active">
            <span class="card-type">💳 신용카드</span>
            <span class="card-number">**** **** **** 1234</span>
            <span class="card-expiry">만료일: 12/25</span>
          </div>
          <button class="add-payment-btn" @click="showPaymentMethodSelector = true">+ 결제 방법 추가</button>
        </div>
      </div>

      <!-- 결제 수단 선택 모달 -->
      <div v-if="showPaymentMethodSelector" class="payment-method-modal">
        <div class="modal-content">
          <h3>결제 수단 선택</h3>
          <div class="payment-method-grid">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="payment-method-item"
              :class="{ selected: selectedPaymentMethod === method.id }"
              @click="selectedPaymentMethod = method.id"
            >
              <span class="method-icon">{{ method.icon }}</span>
              <span class="method-name">{{ method.name }}</span>
              <span class="method-desc">{{ method.description }}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showPaymentMethodSelector = false" class="cancel-btn">취소</button>
            <button @click="addPaymentMethod" class="confirm-btn">추가</button>
          </div>
        </div>
      </div>

      <div class="billing-history">
        <h2>결제 내역</h2>
        <div class="history-list">
          <div class="history-item">
            <span class="date">2024년 1월 15일</span>
            <span class="amount">₩13,500</span>
            <span class="status success">완료</span>
          </div>
          <div class="history-item">
            <span class="date">2023년 12월 15일</span>
            <span class="amount">₩13,500</span>
            <span class="status success">완료</span>
          </div>
          <div class="history-item">
            <span class="date">2023년 11월 15일</span>
            <span class="amount">₩13,500</span>
            <span class="status success">완료</span>
          </div>
        </div>
      </div>

      <div class="plan-options">
        <h2>플랜 변경</h2>
        <div class="plans-grid">
          <div class="plan-card">
            <h3>베이직</h3>
            <p class="price">₩9,500/월</p>
            <ul>
              <li>1대 기기</li>
              <li>SD 화질</li>
            </ul>
            <button class="plan-btn" @click="changePlan('basic', 9500)">변경</button>
          </div>
          <div class="plan-card current">
            <h3>스탠다드</h3>
            <p class="price">₩13,500/월</p>
            <ul>
              <li>2대 기기</li>
              <li>HD 화질</li>
            </ul>
            <button class="plan-btn current">현재 플랜</button>
          </div>
          <div class="plan-card">
            <h3>프리미엄</h3>
            <p class="price">₩17,000/월</p>
            <ul>
              <li>4대 기기</li>
              <li>4K 화질</li>
            </ul>
            <button class="plan-btn" @click="changePlan('premium', 17000)">변경</button>
          </div>
        </div>
      </div>

      <!-- 개발자 테스트 섹션 -->
      <div class="dev-test-section">
        <h2>NHN 결제 테스트</h2>
        <p>개발 환경에서 NHN 결제서비스를 테스트할 수 있습니다.</p>
        <div class="test-buttons">
          <button class="test-btn" @click="openPaymentModal">모달 결제창 (₩1,000)</button>
          <button class="test-btn" @click="openKCPPopup">KCP 팝업 결제창 (₩1,000)</button>
          <button class="test-btn" @click="showPaymentMethodSelector = true">결제 수단 테스트</button>
        </div>
        <div class="test-info">
          <p>모의 결제 환경 정보:</p>
          <ul>
            <li>🔧 개발 모드: 활성화</li>
            <li>🏪 KCP 사이트 코드: T0000 (개발 테스트)</li>
            <li>📊 결제 성공률: 70%</li>
            <li>⏱️ 처리 시간: 1-2초</li>
            <li>💳 모달 결제창 + KCP 팝업 결제창</li>
            <li>🔲 팝업 크기: 500x600</li>
            <li>✅ 에러 처리 강화 완료</li>
          </ul>
          <div class="warning-notice">
            <strong>⚠️ 주의:</strong> 실제 NHN KCP SDK 연결 없이 모의 결제로 동작합니다.
            실제 돈이 결제되지 않는 안전한 테스트 환경입니다.
          </div>
          <div class="info-box">
            <p><strong>💡 KCP 결제 방식:</strong></p>
            <p>• <strong>모달 결제창:</strong> 페이지 내에서 결제 진행</p>
            <p>• <strong>KCP 팝업:</strong> 별도 팝업 창에서 결제 진행 (실제 KCP 방식 시뮬레이션)</p>
            <p>• <strong>에러 처리:</strong> SDK 로드 실패 시 자동으로 모의 결제로 전환</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 결제 모달 -->
  <PaymentModal 
    :isVisible="showPaymentModal" 
    :paymentData="currentPaymentData"
    @close="closePaymentModal"
    @payment-complete="handlePaymentComplete"
  />
</template>

<script setup>
import '@/assets/styles/Ticketing.css'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PaymentService from '@/services/paymentService'
import KCPPaymentService from '@/services/kcpPaymentService'
import PaymentModal from '@/components/PaymentModal.vue'

// 반응형 데이터
const paymentStatus = ref(null)
const isPaymentLoading = ref(false)
const showPaymentMethodSelector = ref(false)
const selectedPaymentMethod = ref('card')
const showPaymentModal = ref(false)
const currentPaymentData = ref({})

// 결제 수단 옵션
const paymentMethods = ref([
  { id: 'card', name: '신용카드', icon: '💳', description: '신용카드로 결제' },
  { id: 'bank', name: '계좌이체', icon: '🏦', description: '계좌이체로 결제' },
  { id: 'phone', name: '휴대폰', icon: '📱', description: '휴대폰 결제' },
  { id: 'virtual_account', name: '가상계좌', icon: '💰', description: '가상계좌로 결제' }
])

const route = useRoute()

// 컴포넌트 마운트 시 결제 상태 확인
onMounted(() => {
  const status = route.query.status
  if (status) {
    handlePaymentCallback(status)
  }
  
  // NHN 결제서비스 초기화
  initializePaymentService()
})

// NHN 결제서비스 초기화
const initializePaymentService = async () => {
  try {
    console.log('NHN 결제서비스 초기화 중...')
    await PaymentService.initPayment()
    console.log('NHN 결제서비스 초기화 완료')
  } catch (error) {
    console.error('NHN 결제서비스 초기화 실패:', error)
  }
}

// 결제 콜백 처리
const handlePaymentCallback = (status) => {
  switch (status) {
    case 'success':
      paymentStatus.value = {
        type: 'success',
        title: '결제 완료',
        message: '결제가 성공적으로 완료되었습니다.'
      }
      break
    case 'cancel':
      paymentStatus.value = {
        type: 'warning',
        title: '결제 취소',
        message: '결제가 취소되었습니다.'
      }
      break
    case 'fail':
      paymentStatus.value = {
        type: 'error',
        title: '결제 실패',
        message: '결제 처리 중 오류가 발생했습니다.'
      }
      break
  }
}

// 플랜 변경 결제 처리
const changePlan = async (planType, amount) => {
  const paymentData = {
    amount: amount,
    orderName: `넷플릭스 ${planType} 플랜`,
    customerName: '사용자',
    customerEmail: 'user@example.com',
    paymentMethod: selectedPaymentMethod.value,
    orderId: generateOrderId()
  }

  currentPaymentData.value = paymentData
  showPaymentModal.value = true
}

// 결제 수단 추가
const addPaymentMethod = () => {
  const methodConfig = PaymentService.getPaymentMethodConfig(selectedPaymentMethod.value)
  
  console.log('결제 수단 추가:', methodConfig)
  
  // 실제 결제 수단 등록 로직
  showPaymentMethodSelector.value = false
  
  paymentStatus.value = {
    type: 'success',
    title: '결제 수단 추가',
    message: `${methodConfig.name}이(가) 성공적으로 추가되었습니다.`
  }
}

// 결제 모달 열기
const openPaymentModal = () => {
  const paymentData = {
    amount: 1000,
    orderName: '테스트 결제',
    customerName: '테스트 사용자',
    customerEmail: 'test@example.com',
    paymentMethod: 'card',
    orderId: generateOrderId()
  }

  currentPaymentData.value = paymentData
  showPaymentModal.value = true
}

// 결제 모달 닫기
const closePaymentModal = () => {
  showPaymentModal.value = false
  currentPaymentData.value = {}
}

// 결제 완료 처리
const handlePaymentComplete = (result) => {
  console.log('결제 완료 결과:', result)
  
  if (result.success) {
    paymentStatus.value = {
      type: 'success',
      title: '결제 완료',
      message: `결제가 성공적으로 완료되었습니다. (결제ID: ${result.paymentId})`
    }
  } else {
    paymentStatus.value = {
      type: 'error',
      title: '결제 실패',
      message: result.message || '결제 중 오류가 발생했습니다.'
    }
  }
  
  showPaymentModal.value = false
  currentPaymentData.value = {}
}

// 주문 ID 생성 함수
const generateOrderId = () => {
  return 'netflix_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// KCP 팝업 결제창 열기
const openKCPPopup = async () => {
  try {
    const paymentData = {
      orderId: generateOrderId(),
      orderName: 'KCP 팝업 테스트 결제',
      amount: 1000,
      customerName: '테스트 사용자',
      customerEmail: 'test@example.com'
    }

    console.log('KCP 팝업 결제 시작:', paymentData)
    
    const result = await KCPPaymentService.openPaymentPopup(paymentData)
    
    if (result.success) {
      paymentStatus.value = {
        type: 'success',
        title: 'KCP 팝업 결제 성공',
        message: `결제가 완료되었습니다. (결제ID: ${result.paymentId})`
      }
    } else {
      throw new Error(result.message || 'KCP 결제 실패')
    }
  } catch (error) {
    console.error('KCP 팝업 결제 오류:', error)
    paymentStatus.value = {
      type: 'error',
      title: 'KCP 팝업 결제 실패',
      message: error.message || 'KCP 결제 중 오류가 발생했습니다.'
    }
  }
}

// 전역으로 테스트 함수 노출 (개발용)
window.openPaymentModal = openPaymentModal
window.openKCPPopup = openKCPPopup
</script> 