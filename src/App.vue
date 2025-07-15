<script setup>
import { ref, watch, computed, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import './assets/styles/App.css'

import Magnify from 'vue-material-design-icons/Magnify.vue'
import HomeOutline from 'vue-material-design-icons/HomeOutline.vue'
import TrendingUp from 'vue-material-design-icons/TrendingUp.vue'
import Television from 'vue-material-design-icons/Television.vue'
import MovieOutline from 'vue-material-design-icons/MovieOutline.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import ChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import TicketOutline from 'vue-material-design-icons/TicketOutline.vue'
import Account from 'vue-material-design-icons/Account.vue'
import Close from 'vue-material-design-icons/Close.vue'

import NavItem from '@/components/NavItem.vue'

import { useMovieStore } from './stores/movie'
import { storeToRefs } from 'pinia'
import movies from './movies.json'

const router = useRouter()
const route = useRoute()

const useMovie = useMovieStore()
const { showFullVideo } = storeToRefs(useMovie)

// 검색 관련 상태
const isSearchOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref([])

// 현재 라우트에 따라 활성 상태 결정
const isActive = (routeName) => {
  return route.name === routeName
}

// 네비게이션 클릭 핸들러
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

// 검색창 토글
const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
  if (!isSearchOpen.value) {
    searchQuery.value = ''
    searchResults.value = []
  }
}

// 검색 기능
const searchMovies = () => {
  if (searchQuery.value.trim() === '') {
    searchResults.value = []
    return
  }

  const allMovies = []
  Object.values(movies).forEach(category => {
    allMovies.push(...category)
  })

  searchResults.value = allMovies.filter(movie => 
    movie.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    movie.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    movie.genre.one.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    movie.genre.two.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    movie.genre.three.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
}

// 검색어 변경 감지
watch(searchQuery, () => {
  searchMovies()
})

// 네비게이션 바 너비 계산
const navWidth = computed(() => {
  return isSearchOpen.value ? '400px' : '120px'
})

// 메인 콘텐츠 패딩 계산
const mainContentPadding = computed(() => {
  return isSearchOpen.value ? '400px' : '120px'
})

// 네비게이션 바 너비를 하위 컴포넌트에 제공
provide('navWidth', navWidth)

// 검색 결과 클릭 핸들러
const selectMovie = (movie) => {
  useMovie.movie = movie
  isSearchOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
}
</script>

<template>
  <div class="app-container">
    <!-- 사이드 네비게이션 -->
    <div v-if="!showFullVideo" id="SideNav" class="side-nav" :style="{ width: navWidth }">
      <div class="nav-main">
        <a href="/">
          <img class="netflix-logo" src="/images/netflix-logo.png" alt="넷플릭스 로고">
        </a>
        <div class="nav-container">
          <NavItem 
            :icon="Magnify" 
            :is-active="isSearchOpen" 
            @click="toggleSearch" 
          />
          <NavItem 
            :icon="HomeOutline" 
            :is-active="isActive('home')" 
            @click="navigateTo('home')" 
          />
          <NavItem 
            :icon="TrendingUp" 
            :is-active="isActive('trending')" 
            @click="navigateTo('trending')" 
          />
          <NavItem 
            :icon="MovieOutline" 
            :is-active="isActive('movies')" 
            @click="navigateTo('movies')" 
          />
          <NavItem 
            :icon="TicketOutline" 
            :is-active="isActive('ticketing')" 
            @click="navigateTo('ticketing')" 
          />
          <NavItem 
            :icon="Account" 
            :is-active="isActive('login')" 
            @click="navigateTo('login')" 
          />
        </div>
      </div>

      <!-- 검색 패널 -->
      <div v-if="isSearchOpen" class="search-panel">
        <div class="search-header">
          <h3>검색</h3>
          <button @click="toggleSearch" class="close-btn">
            <Close fillColor="#fff" :size="24"/>
          </button>
        </div>
        
        <div class="search-input-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="영화, 장르 검색..."
            class="search-input"
            autofocus
          />
        </div>

        <div class="search-results" v-if="searchResults.length > 0">
          <div class="search-results-header">
            <span>검색 결과 ({{ searchResults.length }})</span>
          </div>
          <div class="search-result-item" 
               v-for="movie in searchResults.slice(0, 10)" 
               :key="movie.name"
               @click="selectMovie(movie)">
            <img :src="'/images/' + movie.name + '.png'" :alt="movie.name" class="movie-thumbnail">
            <div class="movie-info">
              <h4>{{ movie.name }}</h4>
              <p class="movie-year">{{ movie.year }}</p>
              <p class="movie-genre">{{ movie.genre.one }} • {{ movie.genre.two }}</p>
            </div>
          </div>
        </div>

        <div v-else-if="searchQuery.trim() !== ''" class="no-results">
          <p>검색 결과가 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- 메인 콘텐츠 영역 -->
    <div v-if="!showFullVideo" class="main-content" :style="{ paddingLeft: mainContentPadding }">
      <router-view />
    </div>

    <!-- 전체화면 비디오 -->
    <div v-if="showFullVideo">
      <div @click="showFullVideo = false" class="back-button">
        <ChevronLeft fillColor="#fff" :size="40"/>
      </div>
      <video
        :src="'/videos/' + (useMovie.movie?.name || '') + '.mp4'"
        autoplay
        loop
        controls
        class="fullscreen-video"
      />
    </div>
  </div>
</template>