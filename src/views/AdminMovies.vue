<template>
  <div class="admin-movies">
    <div class="page-header">
      <div class="header-top">
          <button @click="goBack" class="back-button">
            <ChevronLeft :size="20"/>
            뒤로가기
          </button>
        </div>
      <div class="header-left">
        <h1>영상관리</h1>
        <p>총 {{ movies.length }}개의 영상이 등록되어 있습니다</p>
      </div>
      <div class="header-actions">
        <button @click="showAddModal = true" class="btn-primary">
          <Plus :size="20"/>
          새 영상 추가
        </button>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <Video :size="32"/>
        </div>
        <div class="stat-content">
          <h3>전체 영상</h3>
          <p class="stat-number">{{ movies.length }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon genres">
          <TagOutline :size="32"/>
        </div>
        <div class="stat-content">
          <h3>장르</h3>
          <p class="stat-number">{{ uniqueGenres.length }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon years">
          <CalendarOutline :size="32"/>
        </div>
        <div class="stat-content">
          <h3>연도</h3>
          <p class="stat-number">{{ uniqueYears.length }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon views">
          <Eye :size="32"/>
        </div>
        <div class="stat-content">
          <h3>총 조회수</h3>
          <p class="stat-number">{{ totalViews.toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <!-- 검색 및 필터 -->
    <div class="filter-section">
      <div class="search-box">
        <Magnify :size="20" fillColor="#6B7280"/>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="영화 제목, 설명, 장르로 검색..."
          class="search-input"
        />
      </div>
      
      <div class="filter-controls">
        <select v-model="genreFilter" class="filter-select">
          <option value="all">모든 장르</option>
          <option v-for="genre in uniqueGenres" :key="genre" :value="genre">{{ genre }}</option>
        </select>
        
        <select v-model="yearFilter" class="filter-select">
          <option value="all">모든 연도</option>
          <option v-for="year in uniqueYears" :key="year" :value="year">{{ year }}</option>
        </select>
        
        <select v-model="sortBy" class="filter-select">
          <option value="name">제목순</option>
          <option value="year">연도순</option>
          <option value="views">조회수순</option>
          <option value="rating">평점순</option>
        </select>
      </div>
    </div>

    <!-- 영상 그리드 -->
    <div class="movies-grid">
      <div v-for="movie in paginatedMovies" :key="movie.id" class="movie-card">
        <div class="movie-poster">
          <img :src="'/images/' + movie.name + '.png'" :alt="movie.name" @error="handleImageError">
          <div class="movie-overlay">
            <button @click="editMovie(movie)" class="overlay-btn edit">
              <Pencil :size="16"/>
            </button>
            <button @click="viewMovie(movie)" class="overlay-btn view">
              <Play :size="16"/>
            </button>
            <button @click="deleteMovie(movie)" class="overlay-btn delete">
              <Delete :size="16"/>
            </button>
          </div>
          <div class="movie-stats">
            <span class="views">
              <Eye :size="12"/>
              {{ movie.views?.toLocaleString() || '0' }}
            </span>
            <span class="rating">
              <Star :size="12"/>
              {{ movie.rating || 'N/A' }}
            </span>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">{{ movie.name }}</h3>
          <p class="movie-year">{{ movie.year }}</p>
          <div class="movie-genres">
            <span class="genre-tag">{{ movie.genre.one }}</span>
            <span class="genre-tag">{{ movie.genre.two }}</span>
          </div>
          <p class="movie-description">{{ truncateDescription(movie.description) }}</p>
        </div>
      </div>
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
        {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredMovies.length) }} / {{ filteredMovies.length }}
      </span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage >= totalPages"
        class="pagination-btn"
      >
        <ChevronRight :size="20"/>
      </button>
    </div>

    <!-- 영상 추가/수정 모달 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ showAddModal ? '새 영상 추가' : '영상 정보 수정' }}</h3>
          <button @click="closeModals" class="close-btn">
            <Close :size="24"/>
          </button>
        </div>
        <form @submit.prevent="saveMovie" class="movie-form">
          <div class="form-row">
            <div class="form-group">
              <label>영화 제목</label>
              <input v-model="formData.name" type="text" required class="form-input">
            </div>
            <div class="form-group">
              <label>출시 연도</label>
              <input v-model="formData.year" type="number" min="1900" max="2030" required class="form-input">
            </div>
          </div>
          
          <div class="form-group">
            <label>영화 설명</label>
            <textarea v-model="formData.description" rows="3" required class="form-textarea"></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>장르 1</label>
              <select v-model="formData.genre.one" required class="form-select">
                <option value="">선택하세요</option>
                <option v-for="genre in availableGenres" :key="genre" :value="genre">{{ genre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>장르 2</label>
              <select v-model="formData.genre.two" required class="form-select">
                <option value="">선택하세요</option>
                <option v-for="genre in availableGenres" :key="genre" :value="genre">{{ genre }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>장르 3</label>
              <select v-model="formData.genre.three" class="form-select">
                <option value="">선택하세요</option>
                <option v-for="genre in availableGenres" :key="genre" :value="genre">{{ genre }}</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>평점</label>
              <input v-model="formData.rating" type="number" min="0" max="10" step="0.1" class="form-input">
            </div>
            <div class="form-group">
              <label>조회수</label>
              <input v-model="formData.views" type="number" min="0" class="form-input">
            </div>
          </div>
          
          <div class="form-group">
            <label>포스터 이미지</label>
            <input type="file" accept="image/*" @change="handleImageUpload" class="form-input">
            <small class="form-help">PNG, JPG 파일을 업로드하세요</small>
          </div>
          
          <div class="form-group">
            <label>비디오 파일</label>
            <input type="file" accept="video/*" @change="handleVideoUpload" class="form-input">
            <small class="form-help">MP4 파일을 업로드하세요</small>
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
          <h3>영상 삭제</h3>
        </div>
        <p>정말로 "{{ movieToDelete?.name }}"을 삭제하시겠습니까?</p>
        <div class="form-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">취소</button>
          <button @click="confirmDelete" class="btn-danger">삭제</button>
        </div>
      </div>
    </div>

    <!-- 영상 미리보기 모달 -->
    <div v-if="showPreviewModal" class="modal-overlay" @click="showPreviewModal = false">
      <div class="modal-content video-preview" @click.stop>
        <div class="modal-header">
          <h3>{{ previewMovie?.name }}</h3>
          <button @click="showPreviewModal = false" class="close-btn">
            <Close :size="24"/>
          </button>
        </div>
        <div class="video-container">
          <video 
            v-if="previewMovie"
            :src="'/videos/' + previewMovie.name + '.mp4'"
            controls
            class="preview-video"
          >
            비디오를 재생할 수 없습니다.
          </video>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Plus from 'vue-material-design-icons/Plus.vue'
import Video from 'vue-material-design-icons/Video.vue'
import TagOutline from 'vue-material-design-icons/TagOutline.vue'
import CalendarOutline from 'vue-material-design-icons/CalendarOutline.vue'
import Eye from 'vue-material-design-icons/Eye.vue'
import Magnify from 'vue-material-design-icons/Magnify.vue'
import Pencil from 'vue-material-design-icons/Pencil.vue'
import Play from 'vue-material-design-icons/Play.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import Star from 'vue-material-design-icons/Star.vue'
import Close from 'vue-material-design-icons/Close.vue'
import ChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue'

import moviesData from '@/movies.json'
import '@/assets/styles/AdminMovies.css'

const router = useRouter()

// 상태 관리
const movies = ref([])
const searchQuery = ref('')
const genreFilter = ref('all')
const yearFilter = ref('all')
const sortBy = ref('name')
const currentPage = ref(1)
const itemsPerPage = ref(12)

// 모달 상태
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showPreviewModal = ref(false)
const editingMovie = ref(null)
const movieToDelete = ref(null)
const previewMovie = ref(null)

// 폼 데이터
const formData = ref({
  name: '',
  year: new Date().getFullYear(),
  description: '',
  genre: {
    one: '',
    two: '',
    three: ''
  },
  rating: 0,
  views: 0
})

// 사용 가능한 장르 목록
const availableGenres = ref([
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller', 'War', 'Western', 'Life', 'Story'
])

// 계산된 속성
const uniqueGenres = computed(() => {
  const genres = new Set()
  movies.value.forEach(movie => {
    genres.add(movie.genre.one)
    genres.add(movie.genre.two)
    if (movie.genre.three) genres.add(movie.genre.three)
  })
  return Array.from(genres).sort()
})

const uniqueYears = computed(() => {
  const years = new Set(movies.value.map(movie => movie.year))
  return Array.from(years).sort((a, b) => b - a)
})

const totalViews = computed(() => {
  return movies.value.reduce((total, movie) => total + (movie.views || 0), 0)
})

const filteredMovies = computed(() => {
  let filtered = movies.value.filter(movie => {
    const matchesSearch = 
      movie.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      movie.genre.one.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      movie.genre.two.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (movie.genre.three && movie.genre.three.toLowerCase().includes(searchQuery.value.toLowerCase()))
    
    const matchesGenre = genreFilter.value === 'all' || 
      movie.genre.one === genreFilter.value ||
      movie.genre.two === genreFilter.value ||
      movie.genre.three === genreFilter.value
    
    const matchesYear = yearFilter.value === 'all' || movie.year === yearFilter.value
    
    return matchesSearch && matchesGenre && matchesYear
  })
  
  // 정렬
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'year':
        return b.year - a.year
      case 'views':
        return (b.views || 0) - (a.views || 0)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      default:
        return a.name.localeCompare(b.name)
    }
  })
  
  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredMovies.value.length / itemsPerPage.value)
})

const paginatedMovies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredMovies.value.slice(start, start + itemsPerPage.value)
})

// 메소드
const goBack = () => {
  router.push('/admin')
}

const truncateDescription = (description) => {
  return description.length > 100 ? description.substring(0, 100) + '...' : description
}

const handleImageError = (event) => {
  event.target.src = '/images/placeholder.png'
}

const editMovie = (movie) => {
  editingMovie.value = movie
  formData.value = JSON.parse(JSON.stringify(movie))
  showEditModal.value = true
}

const deleteMovie = (movie) => {
  movieToDelete.value = movie
  showDeleteModal.value = true
}

const viewMovie = (movie) => {
  previewMovie.value = movie
  showPreviewModal.value = true
}

const saveMovie = () => {
  if (showAddModal.value) {
    // 새 영화 추가
    const newMovie = {
      id: movies.value.length + 1,
      ...formData.value,
      views: parseInt(formData.value.views) || 0,
      rating: parseFloat(formData.value.rating) || 0
    }
    movies.value.push(newMovie)
  } else {
    // 기존 영화 수정
    const index = movies.value.findIndex(m => m.id === editingMovie.value.id)
    if (index !== -1) {
      movies.value[index] = {
        ...movies.value[index],
        ...formData.value,
        views: parseInt(formData.value.views) || 0,
        rating: parseFloat(formData.value.rating) || 0
      }
    }
  }
  closeModals()
}

const confirmDelete = () => {
  const index = movies.value.findIndex(m => m.id === movieToDelete.value.id)
  if (index !== -1) {
    movies.value.splice(index, 1)
  }
  showDeleteModal.value = false
  movieToDelete.value = null
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showPreviewModal.value = false
  editingMovie.value = null
  formData.value = {
    name: '',
    year: new Date().getFullYear(),
    description: '',
    genre: {
      one: '',
      two: '',
      three: ''
    },
    rating: 0,
    views: 0
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 이미지 업로드 로직
    console.log('이미지 업로드:', file.name)
  }
}

const handleVideoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 비디오 업로드 로직
    console.log('비디오 업로드:', file.name)
  }
}

// 초기 데이터 로드
onMounted(() => {
  // 기존 영화 데이터를 플랫한 배열로 변환
  const allMovies = []
  let id = 1
  Object.values(moviesData).forEach(category => {
    category.forEach(movie => {
      if (!allMovies.find(m => m.name === movie.name)) {
        allMovies.push({
          id: id++,
          ...movie,
          views: Math.floor(Math.random() * 100000),
          rating: (Math.random() * 5 + 5).toFixed(1)
        })
      }
    })
  })
  movies.value = allMovies
})
</script> 