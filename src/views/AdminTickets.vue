<template>
  <div class="admin-tickets">
    <div class="header-top">
      <button @click="goBack" class="back-button">
        <ChevronLeft :size="20"/>
        관리자 대시보드로
      </button>
    </div>

    <div class="page-header">
      <h1>티켓 관리</h1>
      <p>영화 티켓을 생성하고 관리할 수 있습니다.</p>
    </div>

    <!-- 티켓 생성 폼 -->
    <div class="ticket-form-section">
      <h2>새 티켓 생성</h2>
      <div class="form-container">
        <div class="form-group">
          <label for="movieSelect">영화 선택</label>
          <select v-model="newTicket.movieId" id="movieSelect" required>
            <option value="">영화를 선택하세요</option>
            <option v-for="movie in allMovies" :key="movie.id" :value="movie.id">
              {{ movie.title }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="ticketType">티켓 타입</label>
          <select v-model="newTicket.type" id="ticketType" required>
            <option value="">티켓 타입을 선택하세요</option>
            <option value="adult">성인</option>
            <option value="teen">청소년</option>
            <option value="child">어린이</option>
            <option value="senior">시니어</option>
          </select>
        </div>

        <div class="form-group">
          <label for="price">가격 (원)</label>
          <input 
            type="number" 
            v-model="newTicket.price" 
            id="price" 
            placeholder="가격을 입력하세요"
            required
          />
        </div>

        <div class="form-group">
          <label for="showTime">상영 시간</label>
          <input 
            type="datetime-local" 
            v-model="newTicket.showTime" 
            id="showTime"
            required
          />
        </div>

        <div class="form-group">
          <label for="theater">상영관</label>
          <select v-model="newTicket.theater" id="theater" required>
            <option value="">상영관을 선택하세요</option>
            <option value="1관">1관</option>
            <option value="2관">2관</option>
            <option value="3관">3관</option>
            <option value="4관">4관</option>
            <option value="IMAX">IMAX</option>
          </select>
        </div>

        <div class="form-group">
          <label for="availableSeats">총 좌석 수</label>
          <input 
            type="number" 
            v-model="newTicket.availableSeats" 
            id="availableSeats" 
            placeholder="좌석 수를 입력하세요"
            required
          />
        </div>

        <div class="form-actions">
          <button @click="createTicket" class="btn-primary">티켓 생성</button>
          <button @click="resetForm" class="btn-secondary">초기화</button>
        </div>
      </div>
    </div>

    <!-- 티켓 목록 -->
    <div class="tickets-list-section">
      <h2>등록된 티켓 목록</h2>
      <div class="tickets-grid">
        <div v-for="ticket in tickets" :key="ticket.id" class="ticket-card">
          <div class="ticket-header">
            <h3>{{ getMovieTitle(ticket.movieId) }}</h3>
            <div class="ticket-type-badge" :class="ticket.type">
              {{ getTicketTypeLabel(ticket.type) }}
            </div>
          </div>
          
          <div class="ticket-details">
            <p><strong>상영 시간:</strong> {{ formatDateTime(ticket.showTime) }}</p>
            <p><strong>상영관:</strong> {{ ticket.theater }}</p>
            <p><strong>가격:</strong> {{ ticket.price.toLocaleString() }}원</p>
            <p><strong>남은 좌석:</strong> {{ ticket.availableSeats }}석</p>
          </div>

          <div class="ticket-actions">
            <button @click="editTicket(ticket)" class="btn-edit">수정</button>
            <button @click="deleteTicket(ticket.id)" class="btn-delete">삭제</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 수정 모달 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h3>티켓 수정</h3>
        <div class="form-group">
          <label>영화</label>
          <select v-model="editingTicket.movieId" required>
            <option v-for="movie in allMovies" :key="movie.id" :value="movie.id">
              {{ movie.title }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>티켓 타입</label>
          <select v-model="editingTicket.type" required>
            <option value="adult">성인</option>
            <option value="teen">청소년</option>
            <option value="child">어린이</option>
            <option value="senior">시니어</option>
          </select>
        </div>

        <div class="form-group">
          <label>가격</label>
          <input type="number" v-model="editingTicket.price" required />
        </div>

        <div class="form-group">
          <label>상영 시간</label>
          <input type="datetime-local" v-model="editingTicket.showTime" required />
        </div>

        <div class="form-group">
          <label>상영관</label>
          <select v-model="editingTicket.theater" required>
            <option value="1관">1관</option>
            <option value="2관">2관</option>
            <option value="3관">3관</option>
            <option value="4관">4관</option>
            <option value="IMAX">IMAX</option>
          </select>
        </div>

        <div class="form-group">
          <label>좌석 수</label>
          <input type="number" v-model="editingTicket.availableSeats" required />
        </div>

        <div class="modal-actions">
          <button @click="saveEdit" class="btn-primary">저장</button>
          <button @click="closeEditModal" class="btn-secondary">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import ChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import movies from '@/movies.json'
import '@/assets/styles/AdminTickets.css'

const router = useRouter()

// 티켓 데이터
const tickets = ref([])
const showEditModal = ref(false)
const editingTicket = ref({})

// 새 티켓 폼 데이터
const newTicket = ref({
  movieId: '',
  type: '',
  price: '',
  showTime: '',
  theater: '',
  availableSeats: ''
})

// 모든 영화 목록
const allMovies = computed(() => {
  const movieList = []
  Object.values(movies).forEach(category => {
    category.forEach(movie => {
      movieList.push({
        id: movie.id,
        title: movie.title
      })
    })
  })
  return movieList
})

// 티켓 타입 라벨
const getTicketTypeLabel = (type) => {
  const labels = {
    adult: '성인',
    teen: '청소년',
    child: '어린이',
    senior: '시니어'
  }
  return labels[type] || type
}

// 영화 제목 가져오기
const getMovieTitle = (movieId) => {
  const movie = allMovies.value.find(m => m.id === movieId)
  return movie ? movie.title : '알 수 없는 영화'
}

// 날짜 포맷팅
const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString('ko-KR')
}

// 티켓 생성
const createTicket = () => {
  if (!newTicket.value.movieId || !newTicket.value.type || !newTicket.value.price || 
      !newTicket.value.showTime || !newTicket.value.theater || !newTicket.value.availableSeats) {
    alert('모든 필드를 입력해주세요.')
    return
  }

  const ticket = {
    id: Date.now(),
    ...newTicket.value,
    price: parseInt(newTicket.value.price),
    availableSeats: parseInt(newTicket.value.availableSeats),
    createdAt: new Date().toISOString()
  }

  tickets.value.push(ticket)
  resetForm()
  alert('티켓이 성공적으로 생성되었습니다.')
}

// 폼 초기화
const resetForm = () => {
  newTicket.value = {
    movieId: '',
    type: '',
    price: '',
    showTime: '',
    theater: '',
    availableSeats: ''
  }
}

// 티켓 수정
const editTicket = (ticket) => {
  editingTicket.value = { ...ticket }
  showEditModal.value = true
}

// 수정 저장
const saveEdit = () => {
  const index = tickets.value.findIndex(t => t.id === editingTicket.value.id)
  if (index !== -1) {
    tickets.value[index] = { ...editingTicket.value }
    closeEditModal()
    alert('티켓이 성공적으로 수정되었습니다.')
  }
}

// 수정 모달 닫기
const closeEditModal = () => {
  showEditModal.value = false
  editingTicket.value = {}
}

// 티켓 삭제
const deleteTicket = (ticketId) => {
  if (confirm('정말로 이 티켓을 삭제하시겠습니까?')) {
    tickets.value = tickets.value.filter(t => t.id !== ticketId)
    alert('티켓이 삭제되었습니다.')
  }
}

// 뒤로가기
const goBack = () => {
  router.push('/admin')
}

onMounted(() => {
  // 로컬 스토리지에서 티켓 데이터 로드
  const savedTickets = localStorage.getItem('adminTickets')
  if (savedTickets) {
    tickets.value = JSON.parse(savedTickets)
  }
})

// 티켓 데이터가 변경될 때마다 로컬 스토리지에 저장
watch(tickets, (newTickets) => {
  localStorage.setItem('adminTickets', JSON.stringify(newTickets))
}, { deep: true })
</script> 