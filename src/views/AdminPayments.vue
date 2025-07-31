<template>
  <div class="admin-payments">
    <div class="page-header">
      <div class="header-top">
          <button @click="goBack" class="back-button">
            <ChevronLeft :size="20"/>
            뒤로가기
          </button>
        </div>
      <div class="header-left">
        <h1>결제권관리</h1>
        <p>총 {{ payments.length }}건의 결제 내역이 있습니다</p>
      </div>
      <div class="header-actions">
        <button @click="exportData" class="btn-secondary">
          <Download :size="20"/>
          내역 내보내기
        </button>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon revenue">
          <CashMultiple :size="32"/>
        </div>
        <div class="stat-content">
          <h3>이번 달 수익</h3>
          <p class="stat-number">{{ monthlyRevenue.toLocaleString() }}원</p>
          <span class="stat-change positive">+12.5%</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon subscription">
          <Account :size="32"/>
        </div>
        <div class="stat-content">
          <h3>활성 구독자</h3>
          <p class="stat-number">{{ activeSubscriptions }}</p>
          <span class="stat-change positive">+5.2%</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon refund">
          <ArrowLeft :size="32"/>
        </div>
        <div class="stat-content">
          <h3>환불 요청</h3>
          <p class="stat-number">{{ refundRequests }}</p>
          <span class="stat-change neutral">2건 대기중</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon conversion">
          <TrendingUp :size="32"/>
        </div>
        <div class="stat-content">
          <h3>결제 성공률</h3>
          <p class="stat-number">{{ paymentSuccessRate }}%</p>
          <span class="stat-change positive">+1.2%</span>
        </div>
      </div>
    </div>

    <!-- 필터 및 검색 -->
    <div class="filter-section">
      <div class="search-box">
        <Magnify :size="20" fillColor="#6B7280"/>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="사용자명, 이메일, 결제ID로 검색..."
          class="search-input"
        />
      </div>
      
      <div class="filter-controls">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">모든 상태</option>
          <option value="completed">완료</option>
          <option value="pending">대기중</option>
          <option value="failed">실패</option>
          <option value="refunded">환불됨</option>
        </select>
        
        <select v-model="subscriptionFilter" class="filter-select">
          <option value="all">모든 구독</option>
          <option value="premium">프리미엄</option>
          <option value="basic">베이직</option>
        </select>
        
        <input v-model="dateFrom" type="date" class="filter-date">
        <input v-model="dateTo" type="date" class="filter-date">
      </div>
    </div>

    <!-- 결제 내역 테이블 -->
    <div class="payments-table-container">
      <table class="payments-table">
        <thead>
          <tr>
            <th>결제ID</th>
            <th>사용자</th>
            <th>구독 플랜</th>
            <th>금액</th>
            <th>결제일</th>
            <th>결제방법</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in paginatedPayments" :key="payment.id" class="payment-row">
            <td>
              <div class="payment-id">#{{ payment.id }}</div>
            </td>
            <td>
              <div class="user-info">
                <img :src="payment.userAvatar" :alt="payment.userName" class="user-avatar">
                <div>
                  <div class="user-name">{{ payment.userName }}</div>
                  <div class="user-email">{{ payment.userEmail }}</div>
                </div>
              </div>
            </td>
            <td>
              <span :class="['plan-badge', payment.plan]">
                {{ getPlanText(payment.plan) }}
              </span>
            </td>
            <td>
              <div class="amount">{{ payment.amount.toLocaleString() }}원</div>
            </td>
            <td>
              <div class="payment-date">{{ formatDate(payment.paymentDate) }}</div>
            </td>
            <td>
              <div class="payment-method">
                <component :is="getPaymentIcon(payment.method)" :size="16"/>
                {{ getPaymentMethodText(payment.method) }}
              </div>
            </td>
            <td>
              <span :class="['status-badge', payment.status]">
                {{ getStatusText(payment.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="viewDetails(payment)" class="btn-icon" title="상세보기">
                  <Eye :size="16"/>
                </button>
                <button 
                  v-if="payment.status === 'completed'" 
                  @click="processRefund(payment)" 
                  class="btn-icon refund" 
                  title="환불"
                >
                  <ArrowLeft :size="16"/>
                </button>
                <button @click="downloadReceipt(payment)" class="btn-icon" title="영수증">
                  <FileDownload :size="16"/>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination">
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        <ChevronLeft :size="20"/>
      </button>
      <span class="pagination-info">
        {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredPayments.length) }} / {{ filteredPayments.length }}
      </span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage >= totalPages"
        class="pagination-btn"
      >
        <ChevronRight :size="20"/>
      </button>
    </div>

    <!-- 결제 상세 모달 -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="showDetailsModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>결제 상세 정보</h3>
          <button @click="showDetailsModal = false" class="close-btn">
            <Close :size="24"/>
          </button>
        </div>
        <div v-if="selectedPayment" class="payment-details">
          <div class="detail-row">
            <span class="detail-label">결제 ID:</span>
            <span class="detail-value">#{{ selectedPayment.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">사용자:</span>
            <span class="detail-value">{{ selectedPayment.userName }} ({{ selectedPayment.userEmail }})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">구독 플랜:</span>
            <span class="detail-value">{{ getPlanText(selectedPayment.plan) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">결제 금액:</span>
            <span class="detail-value">{{ selectedPayment.amount.toLocaleString() }}원</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">결제 방법:</span>
            <span class="detail-value">{{ getPaymentMethodText(selectedPayment.method) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">결제일:</span>
            <span class="detail-value">{{ formatDateTime(selectedPayment.paymentDate) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">상태:</span>
            <span :class="['status-badge', selectedPayment.status]">
              {{ getStatusText(selectedPayment.status) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">거래 번호:</span>
            <span class="detail-value">{{ selectedPayment.transactionId }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 환불 확인 모달 -->
    <div v-if="showRefundModal" class="modal-overlay" @click="showRefundModal = false">
      <div class="modal-content small" @click.stop>
        <div class="modal-header">
          <h3>환불 처리</h3>
        </div>
        <p>{{ paymentToRefund?.userName }}님의 {{ paymentToRefund?.amount.toLocaleString() }}원 결제를 환불하시겠습니까?</p>
        <div class="form-actions">
          <button @click="showRefundModal = false" class="btn-secondary">취소</button>
          <button @click="confirmRefund" class="btn-danger">환불 처리</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import Download from 'vue-material-design-icons/Download.vue'
import CashMultiple from 'vue-material-design-icons/CashMultiple.vue'
import Account from 'vue-material-design-icons/Account.vue'
import ArrowLeft from 'vue-material-design-icons/ArrowLeft.vue'
import TrendingUp from 'vue-material-design-icons/TrendingUp.vue'
import Magnify from 'vue-material-design-icons/Magnify.vue'
import Eye from 'vue-material-design-icons/Eye.vue'
import FileDownload from 'vue-material-design-icons/FileDownload.vue'
import CreditCard from 'vue-material-design-icons/CreditCard.vue'
import Bank from 'vue-material-design-icons/Bank.vue'
import Phone from 'vue-material-design-icons/Phone.vue'
import Close from 'vue-material-design-icons/Close.vue'
import ChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue'

const router = useRouter()

// 상태 관리
const payments = ref([])
const searchQuery = ref('')
const statusFilter = ref('all')
const subscriptionFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// 통계 데이터
const monthlyRevenue = ref(15420000)
const activeSubscriptions = ref(1248)
const refundRequests = ref(5)
const paymentSuccessRate = ref(98.3)

// 모달 상태
const showDetailsModal = ref(false)
const showRefundModal = ref(false)
const selectedPayment = ref(null)
const paymentToRefund = ref(null)

// 계산된 속성
const filteredPayments = computed(() => {
  return payments.value.filter(payment => {
    const matchesSearch = 
      payment.userName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      payment.id.toString().includes(searchQuery.value)
    
    const matchesStatus = statusFilter.value === 'all' || payment.status === statusFilter.value
    const matchesSubscription = subscriptionFilter.value === 'all' || payment.plan === subscriptionFilter.value
    
    let matchesDate = true
    if (dateFrom.value || dateTo.value) {
      const paymentDate = new Date(payment.paymentDate)
      if (dateFrom.value) {
        matchesDate = matchesDate && paymentDate >= new Date(dateFrom.value)
      }
      if (dateTo.value) {
        matchesDate = matchesDate && paymentDate <= new Date(dateTo.value)
      }
    }
    
    return matchesSearch && matchesStatus && matchesSubscription && matchesDate
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredPayments.value.length / itemsPerPage.value)
})

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredPayments.value.slice(start, start + itemsPerPage.value)
})

// 메소드
const goBack = () => {
  router.push('/admin')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('ko-KR')
}

const getPlanText = (plan) => {
  const plans = {
    premium: '프리미엄',
    basic: '베이직'
  }
  return plans[plan] || plan
}

const getStatusText = (status) => {
  const statuses = {
    completed: '완료',
    pending: '대기중',
    failed: '실패',
    refunded: '환불됨'
  }
  return statuses[status] || status
}

const getPaymentMethodText = (method) => {
  const methods = {
    card: '신용카드',
    bank: '계좌이체',
    mobile: '휴대폰결제'
  }
  return methods[method] || method
}

const getPaymentIcon = (method) => {
  const icons = {
    card: markRaw(CreditCard),
    bank: markRaw(Bank),
    mobile: markRaw(Phone)
  }
  return icons[method] || markRaw(CreditCard)
}

const viewDetails = (payment) => {
  selectedPayment.value = payment
  showDetailsModal.value = true
}

const processRefund = (payment) => {
  paymentToRefund.value = payment
  showRefundModal.value = true
}

const confirmRefund = () => {
  const index = payments.value.findIndex(p => p.id === paymentToRefund.value.id)
  if (index !== -1) {
    payments.value[index].status = 'refunded'
  }
  showRefundModal.value = false
  paymentToRefund.value = null
}

const downloadReceipt = (payment) => {
  // 영수증 다운로드 로직
  alert(`결제 #${payment.id}의 영수증을 다운로드합니다.`)
}

const exportData = () => {
  // 데이터 내보내기 로직
  alert('결제 내역을 CSV 파일로 내보냅니다.')
}

// 초기 데이터 로드
onMounted(() => {
  // 샘플 결제 데이터
  payments.value = [
    {
      id: 1001,
      userName: '김철수',
      userEmail: 'kim@example.com',
      userAvatar: 'https://ui-avatars.com/api/?name=김철수&background=random',
      plan: 'premium',
      amount: 15900,
      paymentDate: '2024-01-15T10:30:00',
      method: 'card',
      status: 'completed',
      transactionId: 'TXN-2024-001'
    },
    {
      id: 1002,
      userName: '이영희',
      userEmail: 'lee@example.com',
      userAvatar: 'https://ui-avatars.com/api/?name=이영희&background=random',
      plan: 'basic',
      amount: 8900,
      paymentDate: '2024-01-14T15:45:00',
      method: 'bank',
      status: 'completed',
      transactionId: 'TXN-2024-002'
    },
    {
      id: 1003,
      userName: '박민수',
      userEmail: 'park@example.com',
      userAvatar: 'https://ui-avatars.com/api/?name=박민수&background=random',
      plan: 'premium',
      amount: 15900,
      paymentDate: '2024-01-13T09:20:00',
      method: 'mobile',
      status: 'failed',
      transactionId: 'TXN-2024-003'
    },
    {
      id: 1004,
      userName: '정수연',
      userEmail: 'jung@example.com',
      userAvatar: 'https://ui-avatars.com/api/?name=정수연&background=random',
      plan: 'premium',
      amount: 15900,
      paymentDate: '2024-01-12T14:10:00',
      method: 'card',
      status: 'refunded',
      transactionId: 'TXN-2024-004'
    },
    {
      id: 1005,
      userName: '최동훈',
      userEmail: 'choi@example.com',
      userAvatar: 'https://ui-avatars.com/api/?name=최동훈&background=random',
      plan: 'basic',
      amount: 8900,
      paymentDate: '2024-01-11T11:30:00',
      method: 'card',
      status: 'pending',
      transactionId: 'TXN-2024-005'
    }
  ]
})
</script>

<style scoped>
.admin-payments {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  margin: 0 0 8px 0;
  text-align: center;
}

.header-left p {
  color: #D1D5DB;
  margin: 0;
  text-align: center;
}

.header-top {
  margin-bottom: 16px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.back-button:hover {
  background: #E5E7EB;
  border-color: #9CA3AF;
  color: #1F2937;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  padding: 12px;
  border-radius: 8px;
}

.stat-icon.revenue {
  background: #DCFCE7;
  color: #166534;
}

.stat-icon.subscription {
  background: #FEF3C7;
  color: #D97706;
}

.stat-icon.refund {
  background: #FEF2F2;
  color: #DC2626;
}

.stat-icon.conversion {
  background: #EEF2FF;
  color: #3730A3;
}

.stat-content h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  margin: 0 0 4px 0;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1F2937;
  margin: 0 0 4px 0;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #059669;
}

.stat-change.neutral {
  color: #6B7280;
}

.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
}

.filter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select,
.filter-date {
  padding: 12px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  min-width: 120px;
}

.payments-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
}

.payments-table th {
  background: #F9FAFB;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #E5E7EB;
}

.payment-row {
  border-bottom: 1px solid #F3F4F6;
}

.payment-row:hover {
  background: #F9FAFB;
}

.payments-table td {
  padding: 16px;
  vertical-align: middle;
}

.payment-id {
  font-family: monospace;
  font-weight: 600;
  color: #6B7280;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.user-name {
  font-weight: 500;
  color: #1F2937;
}

.user-email {
  font-size: 0.875rem;
  color: #6B7280;
}

.plan-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.plan-badge.premium {
  background: #FEF3C7;
  color: #D97706;
}

.plan-badge.basic {
  background: #E0E7FF;
  color: #3730A3;
}

.amount {
  font-weight: 600;
  color: #1F2937;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.completed {
  background: #DCFCE7;
  color: #166534;
}

.status-badge.pending {
  background: #FEF3C7;
  color: #D97706;
}

.status-badge.failed {
  background: #FEF2F2;
  color: #DC2626;
}

.status-badge.refunded {
  background: #F3F4F6;
  color: #6B7280;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 6px;
  border: 1px solid #D1D5DB;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #F3F4F6;
}

.btn-icon.refund:hover {
  background: #FEF2F2;
  border-color: #DC2626;
  color: #DC2626;
}

.btn-primary,
.btn-secondary {
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #3B82F6;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #2563EB;
}

.btn-secondary {
  background: white;
  color: #6B7280;
  border: 1px solid #D1D5DB;
}

.btn-danger {
  background: #DC2626;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination-btn {
  padding: 8px;
  border: 1px solid #D1D5DB;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #6B7280;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F3F4F6;
}

.detail-label {
  font-weight: 500;
  color: #6B7280;
}

.detail-value {
  color: #1F2937;
  text-align: right;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .admin-payments {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .filter-controls {
    overflow-x: auto;
  }
  
  .payments-table-container {
    overflow-x: auto;
  }
  
  .payments-table {
    min-width: 1000px;
  }
}
</style> 