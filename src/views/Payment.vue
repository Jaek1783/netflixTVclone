<template>
  <div class="payment-container">
    <div class="payment-header">
      <h1>넷플릭스 구독 플랜</h1>
      <p>원하는 플랜을 선택하고 지금 바로 넷플릭스를 시작하세요</p>
    </div>

    <!-- 선택한 플랜 표시 섹션 -->
    <div class="selected-plan-display">
      <div v-if="selectedPlanData" class="selected-plan-info">
        <div class="plan-details">
          <div class="plan-info">
            <div class="plan-name">{{ selectedPlanData.name }} 플랜</div>
            <div class="plan-total">
              <span>월 요금: </span>
              <span class="total-price">₩{{ selectedPlanData.price.toLocaleString() }}</span>
            </div>
          </div>
          <button 
            class="payment-btn-top"
            @click="startPayment"
          >
            결제하기
          </button>
        </div>
      </div>
      <div v-else class="no-plan-selected">
        <h2>플랜을 선택해주세요</h2>
        <p>아래에서 원하는 플랜을 선택하세요</p>
      </div>
    </div>

    <!-- 플랜 비교 섹션 -->
    <div class="plans-comparison">
      <div class="comparison-header">
        <h2>플랜을 선택하세요</h2>
        <p>언제든지 플랜을 변경하거나 해지할 수 있습니다.</p>
      </div>

      <div class="plans-grid">
        <div 
          v-for="plan in plans" 
          :key="plan.id"
          class="plan-card"
          :class="{ 
            selected: selectedPlan === plan.id,
            popular: plan.popular 
          }"
          @click="selectPlan(plan.id)"
        >
          <div v-if="plan.popular" class="popular-badge">인기</div>
          
          <div class="plan-header">
            <h3>{{ plan.name }}</h3>
            <div class="plan-price">
              <span class="price">₩{{ plan.price.toLocaleString() }}</span>
              <span class="period">/월</span>
            </div>
          </div>

          <div class="plan-features">
            <div class="feature-item">
              <span class="feature-icon">📱</span>
              <span>{{ plan.devices }}대 기기 동시 시청</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎬</span>
              <span>{{ plan.quality }} 화질</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">⬇️</span>
              <span>{{ plan.downloads }}개 다운로드</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🌍</span>
              <span>{{ plan.profiles }}개 프로필</span>
            </div>
          </div>

          <div class="plan-benefits">
            <h4>포함된 혜택</h4>
            <ul>
              <li v-for="benefit in plan.benefits" :key="benefit">{{ benefit }}</li>
            </ul>
          </div>

          <button 
            class="select-plan-btn"
            :class="{ selected: selectedPlan === plan.id }"
          >
            {{ selectedPlan === plan.id ? '선택됨' : '선택하기' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 추가 혜택 섹션 -->
    <div class="additional-benefits">
      <h2>넷플릭스만의 특별한 혜택</h2>
      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-icon">🎯</div>
          <h3>개인 맞춤 추천</h3>
          <p>AI가 당신의 취향을 분석하여 완벽한 콘텐츠를 추천합니다</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">📱</div>
          <h3>모든 기기에서</h3>
          <p>스마트폰, 태블릿, 노트북, TV에서 언제 어디서나 시청</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">⬇️</div>
          <h3>오프라인 시청</h3>
          <p>좋아하는 콘텐츠를 다운로드하여 인터넷 없이도 시청</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">🔒</div>
          <h3>키즈 프로필</h3>
          <p>안전하고 연령에 맞는 콘텐츠로 아이들만을 위한 공간</p>
        </div>
      </div>
    </div>

    <!-- 안내사항 섹션 -->
    <div class="payment-section">
      <div class="payment-summary">
        <div class="payment-notice">
          <h3>주의사항 및 안내사항</h3>
          <p>• 구독 서비스는 월 단위로 자동 갱신됩니다</p>
          <p>• 언제든지 마이페이지에서 플랜 변경 및 해지가 가능합니다</p>
          <p>• 결제일 기준으로 다음 달 같은 날에 자동 결제됩니다</p>
          <p>• 신규 가입자에게는 첫 달 무료 체험 혜택이 제공됩니다</p>
          <p>• 모든 결제는 안전한 암호화 시스템을 통해 처리됩니다</p>
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
import '@/assets/styles/Payment.css'
import { ref, computed } from 'vue'
import PaymentModal from '@/components/PaymentModal.vue'

// 반응형 데이터
const selectedPlan = ref('standard')
const showPaymentModal = ref(false)
const currentPaymentData = ref({})

// 플랜 데이터
const plans = ref([
  {
    id: 'basic',
    name: '베이직',
    price: 9500,
    devices: 1,
    quality: 'SD',
    downloads: 1,
    profiles: 1,
    popular: false,
    benefits: [
      '무제한 영화 및 TV 프로그램',
      '모든 기기에서 시청',
      '광고 없음'
    ]
  },
  {
    id: 'standard',
    name: '스탠다드',
    price: 13500,
    devices: 2,
    quality: 'HD',
    downloads: 2,
    profiles: 2,
    popular: true,
    benefits: [
      '무제한 영화 및 TV 프로그램',
      '모든 기기에서 시청',
      '광고 없음',
      'HD 화질'
    ]
  },
  {
    id: 'premium',
    name: '프리미엄',
    price: 17000,
    devices: 4,
    quality: '4K + HDR',
    downloads: 6,
    profiles: 5,
    popular: false,
    benefits: [
      '무제한 영화 및 TV 프로그램',
      '모든 기기에서 시청',
      '광고 없음',
      '4K + HDR 화질',
      '공간 음향 지원'
    ]
  }
])

// 선택된 플랜 데이터
const selectedPlanData = computed(() => {
  return plans.value.find(plan => plan.id === selectedPlan.value)
})

// 플랜 선택
const selectPlan = (planId) => {
  selectedPlan.value = planId
}

// 주문 ID 생성
const generateOrderId = () => {
  return 'netflix_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 결제 시작
const startPayment = () => {
  if (!selectedPlanData.value) return

  const paymentData = {
    amount: selectedPlanData.value.price,
    orderName: `넷플릭스 ${selectedPlanData.value.name} 플랜`,
    customerName: '사용자',
    customerEmail: 'user@example.com',
    paymentMethod: 'card',
    orderId: generateOrderId(),
    planId: selectedPlan.value
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
    // 결제 성공 시 처리
    alert(`${selectedPlanData.value.name} 플랜 구독이 완료되었습니다!`)
    // 필요시 다른 페이지로 리다이렉트
    // router.push('/ticketing')
  } else {
    // 결제 실패 시 처리
    alert('결제 중 오류가 발생했습니다: ' + (result.message || '알 수 없는 오류'))
  }
  
  closePaymentModal()
}
</script> 