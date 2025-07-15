<template>
  <div v-if="isVisible" class="payment-modal-overlay" @click="closeModal">
    <div class="payment-modal" @click.stop>
      <div class="modal-header">
        <h2>결제하기</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <!-- 결제 정보 표시 -->
        <div class="payment-info">
          <h3>결제 정보</h3>
          <div class="info-item">
            <span class="label">상품명:</span>
            <span class="value">{{ paymentData.orderName }}</span>
          </div>
          <div class="info-item">
            <span class="label">결제 금액:</span>
            <span class="value price">{{ formatPrice(paymentData.amount) }}</span>
          </div>
          <div class="info-item">
            <span class="label">주문번호:</span>
            <span class="value">{{ paymentData.orderId }}</span>
          </div>
        </div>

        <!-- 결제 수단 선택 -->
        <div class="payment-methods">
          <h3>결제 수단</h3>
          <div class="method-grid">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="method-item"
              :class="{ active: selectedMethod === method.id }"
              @click="selectedMethod = method.id"
            >
              <span class="method-icon">{{ method.icon }}</span>
              <span class="method-name">{{ method.name }}</span>
            </div>
          </div>
        </div>

        <!-- 신용카드 정보 입력 (신용카드 선택 시) -->
        <div v-if="selectedMethod === 'card'" class="card-input-section">
          <h3>카드 정보</h3>
          <div class="card-form">
            <div class="form-group">
              <label>카드 번호</label>
              <input 
                v-model="cardInfo.number" 
                type="text" 
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                @input="formatCardNumber"
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>유효기간</label>
                <input 
                  v-model="cardInfo.expiry" 
                  type="text" 
                  placeholder="MM/YY"
                  maxlength="5"
                  @input="formatExpiry"
                />
              </div>
              <div class="form-group">
                <label>CVC</label>
                <input 
                  v-model="cardInfo.cvc" 
                  type="text" 
                  placeholder="123"
                  maxlength="3"
                />
              </div>
            </div>
            <div class="form-group">
              <label>카드 소유자명</label>
              <input 
                v-model="cardInfo.holderName" 
                type="text" 
                placeholder="홍길동"
              />
            </div>
          </div>
        </div>

        <!-- 계좌이체 정보 입력 (계좌이체 선택 시) -->
        <div v-if="selectedMethod === 'bank'" class="bank-input-section">
          <h3>계좌이체 정보</h3>
          <div class="bank-form">
            <div class="form-group">
              <label>은행 선택</label>
              <select v-model="bankInfo.bankCode">
                <option value="">은행을 선택하세요</option>
                <option value="004">KB국민은행</option>
                <option value="011">NH농협은행</option>
                <option value="020">우리은행</option>
                <option value="088">신한은행</option>
                <option value="081">하나은행</option>
              </select>
            </div>
            <div class="form-group">
              <label>계좌번호</label>
              <input 
                v-model="bankInfo.accountNumber" 
                type="text" 
                placeholder="123-456-789012"
              />
            </div>
          </div>
        </div>

        <!-- 결제 진행 상태 -->
        <div v-if="isProcessing" class="processing-section">
          <div class="loading-spinner"></div>
          <p>결제 처리 중...</p>
        </div>

        <!-- 결제 결과 -->
        <div v-if="paymentResult" class="result-section">
          <div class="result-icon" :class="paymentResult.success ? 'success' : 'error'">
            {{ paymentResult.success ? '✅' : '❌' }}
          </div>
          <p class="result-message">{{ paymentResult.message }}</p>
          <div v-if="paymentResult.success" class="success-details">
            <p>결제ID: {{ paymentResult.paymentId }}</p>
            <p>결제시간: {{ formatDateTime(paymentResult.paidAt) }}</p>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          v-if="!paymentResult" 
          class="cancel-btn" 
          @click="closeModal"
          :disabled="isProcessing"
        >
          취소
        </button>
        <button 
          v-if="!paymentResult" 
          class="pay-btn" 
          @click="processPayment"
          :disabled="isProcessing || !isFormValid"
        >
          {{ isProcessing ? '처리중...' : `${formatPrice(paymentData.amount)} 결제하기` }}
        </button>
        <button 
          v-if="paymentResult" 
          class="confirm-btn" 
          @click="closeModal"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import '@/assets/styles/PaymentModal.css'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  paymentData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'payment-complete'])

// 반응형 데이터
const selectedMethod = ref('card')
const isProcessing = ref(false)
const paymentResult = ref(null)

// 결제 수단 옵션
const paymentMethods = ref([
  { id: 'card', name: '신용카드', icon: '💳' },
  { id: 'bank', name: '계좌이체', icon: '🏦' },
  { id: 'phone', name: '휴대폰', icon: '📱' },
  { id: 'virtual_account', name: '가상계좌', icon: '💰' }
])

// 카드 정보
const cardInfo = ref({
  number: '',
  expiry: '',
  cvc: '',
  holderName: ''
})

// 계좌이체 정보
const bankInfo = ref({
  bankCode: '',
  accountNumber: ''
})

// 폼 유효성 검사
const isFormValid = computed(() => {
  if (selectedMethod.value === 'card') {
    return cardInfo.value.number.length >= 16 && 
           cardInfo.value.expiry.length === 5 && 
           cardInfo.value.cvc.length === 3 && 
           cardInfo.value.holderName.length > 0
  }
  if (selectedMethod.value === 'bank') {
    return bankInfo.value.bankCode && bankInfo.value.accountNumber.length > 0
  }
  return true
})

// 카드 번호 포맷팅
const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || ''
  cardInfo.value.number = formattedValue
}

// 유효기간 포맷팅
const formatExpiry = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  cardInfo.value.expiry = value
}

// 가격 포맷팅
const formatPrice = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

// 날짜 포맷팅
const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('ko-KR')
}

// 결제 처리
const processPayment = async () => {
  isProcessing.value = true
  paymentResult.value = null

  try {
    // 결제 데이터 준비
    const paymentRequestData = {
      ...props.paymentData,
      paymentMethod: selectedMethod.value,
      cardInfo: selectedMethod.value === 'card' ? cardInfo.value : null,
      bankInfo: selectedMethod.value === 'bank' ? bankInfo.value : null
    }

    console.log('💳 결제창에서 결제 요청:', paymentRequestData)

    // 모의 결제 처리
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const success = Math.random() > 0.3 // 70% 성공률
    
    if (success) {
      const result = {
        success: true,
        paymentId: 'modal_payment_' + Date.now(),
        amount: props.paymentData.amount,
        orderId: props.paymentData.orderId,
        status: 'COMPLETED',
        paidAt: new Date().toISOString(),
        method: selectedMethod.value,
        message: '결제가 성공적으로 완료되었습니다!'
      }
      
      paymentResult.value = result
      console.log('✅ 결제 성공:', result)
      
      // 3초 후 자동으로 결제 완료 이벤트 발생
      setTimeout(() => {
        emit('payment-complete', result)
        closeModal()
      }, 3000)
    } else {
      const errorTypes = ['CARD_DECLINED', 'INSUFFICIENT_FUNDS', 'NETWORK_ERROR']
      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)]
      
      paymentResult.value = {
        success: false,
        error: randomError,
        message: `결제 실패: ${randomError}`,
        orderId: props.paymentData.orderId
      }
      
      console.log('❌ 결제 실패:', paymentResult.value)
    }
  } catch (error) {
    console.error('결제 처리 중 오류:', error)
    paymentResult.value = {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: '결제 처리 중 오류가 발생했습니다.',
      orderId: props.paymentData.orderId
    }
  } finally {
    isProcessing.value = false
  }
}

// 모달 닫기
const closeModal = () => {
  // 초기화
  selectedMethod.value = 'card'
  isProcessing.value = false
  paymentResult.value = null
  cardInfo.value = {
    number: '',
    expiry: '',
    cvc: '',
    holderName: ''
  }
  bankInfo.value = {
    bankCode: '',
    accountNumber: ''
  }
  
  emit('close')
}

// 모달이 열릴 때 초기화
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    paymentResult.value = null
    isProcessing.value = false
  }
})
</script> 