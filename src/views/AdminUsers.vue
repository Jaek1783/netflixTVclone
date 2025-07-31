<template>
  <div class="admin-users">
    <div class="page-header">
      <div class="header-top">
          <button @click="goBack" class="back-button">
            <ChevronLeft :size="20"/>
            뒤로가기
          </button>
        </div>
      <div class="header-left">
        <h1>회원관리</h1>
        <p>{{ filteredUsers.length }}명의 회원이 등록되어 있습니다</p>
      </div>
      <div class="header-actions">
        <button @click="showAddModal = true" class="btn-primary">
          <AccountPlus :size="20"/>
          새 회원 추가
        </button>
      </div>
    </div>

    <!-- 검색 및 필터 -->
    <div class="search-filter-section">
      <div class="search-box">
        <Magnify :size="20" fillColor="#6B7280"/>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="이름, 이메일, 전화번호로 검색..."
          class="search-input"
        />
      </div>
      <div class="filter-buttons">
        <button 
          @click="statusFilter = 'all'" 
          :class="['filter-btn', { active: statusFilter === 'all' }]"
        >
          전체
        </button>
        <button 
          @click="statusFilter = 'active'" 
          :class="['filter-btn', { active: statusFilter === 'active' }]"
        >
          활성
        </button>
        <button 
          @click="statusFilter = 'inactive'" 
          :class="['filter-btn', { active: statusFilter === 'inactive' }]"
        >
          비활성
        </button>
        <button 
          @click="statusFilter = 'premium'" 
          :class="['filter-btn', { active: statusFilter === 'premium' }]"
        >
          프리미엄
        </button>
      </div>
    </div>

    <!-- 사용자 테이블 -->
    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>프로필</th>
            <th>이름</th>
            <th>이메일</th>
            <th>전화번호</th>
            <th>가입일</th>
            <th>상태</th>
            <th>구독</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id" class="user-row">
            <td>
              <div class="user-avatar">
                <img :src="user.avatar" :alt="user.name" class="avatar-img">
              </div>
            </td>
            <td>
              <div class="user-name">{{ user.name }}</div>
            </td>
            <td>
              <div class="user-email">{{ user.email }}</div>
            </td>
            <td>
              <div class="user-phone">{{ user.phone }}</div>
            </td>
            <td>
              <div class="join-date">{{ formatDate(user.joinDate) }}</div>
            </td>
            <td>
              <span :class="['status-badge', user.status]">
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td>
              <span :class="['subscription-badge', user.subscription]">
                {{ getSubscriptionText(user.subscription) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="editUser(user)" class="btn-icon" title="수정">
                  <Pencil :size="16"/>
                </button>
                <button @click="toggleUserStatus(user)" class="btn-icon" :title="user.status === 'active' ? '비활성화' : '활성화'">
                  <AccountOff v-if="user.status === 'active'" :size="16"/>
                  <AccountCheck v-else :size="16"/>
                </button>
                <button @click="deleteUser(user)" class="btn-icon delete" title="삭제">
                  <Delete :size="16"/>
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
        {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} / {{ filteredUsers.length }}
      </span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage >= totalPages"
        class="pagination-btn"
      >
        <ChevronRight :size="20"/>
      </button>
    </div>

    <!-- 사용자 추가/수정 모달 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddModal ? '새 회원 추가' : '회원 정보 수정' }}</h3>
          <button @click="closeModals" class="close-btn">
            <Close :size="24"/>
          </button>
        </div>
        <form @submit.prevent="saveUser" class="user-form">
          <div class="form-group">
            <label>이름</label>
            <input v-model="formData.name" type="text" required class="form-input">
          </div>
          <div class="form-group">
            <label>이메일</label>
            <input v-model="formData.email" type="email" required class="form-input">
          </div>
          <div class="form-group">
            <label>전화번호</label>
            <input v-model="formData.phone" type="tel" required class="form-input">
          </div>
          <div class="form-group">
            <label>상태</label>
            <select v-model="formData.status" class="form-select">
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
          <div class="form-group">
            <label>구독</label>
            <select v-model="formData.subscription" class="form-select">
              <option value="free">무료</option>
              <option value="premium">프리미엄</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModals" class="btn-secondary">취소</button>
            <button type="submit" class="btn-primary">{{ showAddModal ? '추가' : '수정' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content small" @click.stop>
        <div class="modal-header">
          <h3>회원 삭제</h3>
        </div>
        <p>정말로 {{ userToDelete?.name }}님을 삭제하시겠습니까?</p>
        <div class="form-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">취소</button>
          <button @click="confirmDelete" class="btn-danger">삭제</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AccountPlus from 'vue-material-design-icons/AccountPlus.vue'
import Magnify from 'vue-material-design-icons/Magnify.vue'
import Pencil from 'vue-material-design-icons/Pencil.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import AccountOff from 'vue-material-design-icons/AccountOff.vue'
import AccountCheck from 'vue-material-design-icons/AccountCheck.vue'
import Close from 'vue-material-design-icons/Close.vue'
import ChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import '@/assets/styles/AdminUsers.css'

const router = useRouter()

// 상태 관리
const users = ref([])
const searchQuery = ref('')
const statusFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// 모달 상태
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const userToDelete = ref(null)
const editingUser = ref(null)

// 폼 데이터
const formData = ref({
  name: '',
  email: '',
  phone: '',
  status: 'active',
  subscription: 'free'
})

// 계산된 속성
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.phone.includes(searchQuery.value)
    
    const matchesStatus = 
      statusFilter.value === 'all' || 
      user.status === statusFilter.value ||
      (statusFilter.value === 'premium' && user.subscription === 'premium')
    
    return matchesSearch && matchesStatus
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value)
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredUsers.value.slice(start, start + itemsPerPage.value)
})

// 메소드
const goBack = () => {
  router.push('/admin')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR')
}

const getStatusText = (status) => {
  return status === 'active' ? '활성' : '비활성'
}

const getSubscriptionText = (subscription) => {
  return subscription === 'premium' ? '프리미엄' : '무료'
}

const editUser = (user) => {
  editingUser.value = user
  formData.value = { ...user }
  showEditModal.value = true
}

const deleteUser = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const toggleUserStatus = (user) => {
  user.status = user.status === 'active' ? 'inactive' : 'active'
}

const saveUser = () => {
  if (showAddModal.value) {
    // 새 사용자 추가
    const newUser = {
      id: users.value.length + 1,
      ...formData.value,
      avatar: `https://ui-avatars.com/api/?name=${formData.value.name}&background=random`,
      joinDate: new Date().toISOString()
    }
    users.value.push(newUser)
  } else {
    // 기존 사용자 수정
    const index = users.value.findIndex(u => u.id === editingUser.value.id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...formData.value }
    }
  }
  closeModals()
}

const confirmDelete = () => {
  const index = users.value.findIndex(u => u.id === userToDelete.value.id)
  if (index !== -1) {
    users.value.splice(index, 1)
  }
  showDeleteModal.value = false
  userToDelete.value = null
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingUser.value = null
  formData.value = {
    name: '',
    email: '',
    phone: '',
    status: 'active',
    subscription: 'free'
  }
}

// 초기 데이터 로드
onMounted(() => {
  // 샘플 사용자 데이터
  users.value = [
    {
      id: 1,
      name: '김철수',
      email: 'kim@example.com',
      phone: '010-1234-5678',
      status: 'active',
      subscription: 'premium',
      joinDate: '2023-01-15',
      avatar: 'https://ui-avatars.com/api/?name=김철수&background=random'
    },
    {
      id: 2,
      name: '이영희',
      email: 'lee@example.com',
      phone: '010-9876-5432',
      status: 'active',
      subscription: 'free',
      joinDate: '2023-02-20',
      avatar: 'https://ui-avatars.com/api/?name=이영희&background=random'
    },
    {
      id: 3,
      name: '박민수',
      email: 'park@example.com',
      phone: '010-5555-1234',
      status: 'inactive',
      subscription: 'free',
      joinDate: '2023-03-10',
      avatar: 'https://ui-avatars.com/api/?name=박민수&background=random'
    },
    {
      id: 4,
      name: '정수연',
      email: 'jung@example.com',
      phone: '010-7777-8888',
      status: 'active',
      subscription: 'premium',
      joinDate: '2023-04-05',
      avatar: 'https://ui-avatars.com/api/?name=정수연&background=random'
    },
    {
      id: 5,
      name: '최동훈',
      email: 'choi@example.com',
      phone: '010-3333-4444',
      status: 'active',
      subscription: 'free',
      joinDate: '2023-05-12',
      avatar: 'https://ui-avatars.com/api/?name=최동훈&background=random'
    }
  ]
})
</script> 