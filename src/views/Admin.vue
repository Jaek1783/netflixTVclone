<template>
  <div class="admin-dashboard">
    <div class="header-top">
        <button @click="goBack" class="back-button">
          <ChevronLeft :size="20"/>
          홈으로
        </button>
      </div>
    <div class="admin-header">
      <h1>관리자 대시보드</h1>
      <p>시스템 전반을 관리할 수 있는 관리자 페이지입니다.</p>
    </div>

    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <Account :size="40" fillColor="#1E40AF"/>
        </div>
        <div class="stat-content">
          <h3>총 회원수</h3>
          <p class="stat-number">{{ totalUsers }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <CreditCard :size="40" fillColor="#DC2626"/>
        </div>
        <div class="stat-content">
          <h3>월 수익</h3>
          <p class="stat-number">{{ monthlyRevenue.toLocaleString() }}원</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <MovieOutline :size="40" fillColor="#059669"/>
        </div>
        <div class="stat-content">
          <h3>총 영상수</h3>
          <p class="stat-number">{{ totalMovies }}</p>
        </div>
      </div>
    </div>

    <div class="admin-menu-grid">
      <div class="menu-card" @click="navigateTo('admin-users')">
        <div class="menu-icon">
          <Account :size="60" fillColor="#1E40AF"/>
        </div>
        <h3>회원관리</h3>
        <p>사용자 계정 관리, 회원 정보 수정/삭제</p>
        <div class="menu-arrow">
          <ChevronRight :size="24" fillColor="#6B7280"/>
        </div>
      </div>

      <div class="menu-card" @click="navigateTo('admin-payments')">
        <div class="menu-icon">
          <CreditCard :size="60" fillColor="#DC2626"/>
        </div>
        <h3>결제권관리</h3>
        <p>구독 관리, 결제 내역, 환불 처리</p>
        <div class="menu-arrow">
          <ChevronRight :size="24" fillColor="#6B7280"/>
        </div>
      </div>

      <div class="menu-card" @click="navigateTo('admin-movies')">
        <div class="menu-icon">
          <MovieOutline :size="60" fillColor="#059669"/>
        </div>
        <h3>영상관리</h3>
        <p>영화/영상 추가, 수정, 삭제</p>
        <div class="menu-arrow">
          <ChevronRight :size="24" fillColor="#6B7280"/>
        </div>
      </div>

      <div class="menu-card" @click="navigateTo('admin-tickets')">
        <div class="menu-icon">
          <Ticket :size="60" fillColor="#F59E0B"/>
        </div>
        <h3>티켓관리</h3>
        <p>영화 티켓 생성, 수정, 삭제</p>
        <div class="menu-arrow">
          <ChevronRight :size="24" fillColor="#6B7280"/>
        </div>
      </div>

      <div class="menu-card" @click="navigateTo('admin-analytics')">
        <div class="menu-icon">
          <ChartLine :size="60" fillColor="#7C3AED"/>
        </div>
        <h3>통계 및 분석</h3>
        <p>사용자 활동, 인기 콘텐츠 분석</p>
        <div class="menu-arrow">
          <ChevronRight :size="24" fillColor="#6B7280"/>
        </div>
      </div>
    </div>

    <div class="recent-activities">
      <h2>최근 활동</h2>
      <div class="activity-list">
        <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
          <div class="activity-icon">
            <component :is="activity.icon" :size="20" :fillColor="activity.color"/>
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.text }}</p>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import Account from 'vue-material-design-icons/Account.vue'
import CreditCard from 'vue-material-design-icons/CreditCard.vue'
import MovieOutline from 'vue-material-design-icons/MovieOutline.vue'
import ChartLine from 'vue-material-design-icons/ChartLine.vue'
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import ChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import AccountPlus from 'vue-material-design-icons/AccountPlus.vue'
import CashMultiple from 'vue-material-design-icons/CashMultiple.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import Ticket from 'vue-material-design-icons/Ticket.vue'

import movies from '@/movies.json'
import '@/assets/styles/AdminDashboard.css'

const router = useRouter()

// 통계 데이터
const totalUsers = ref(1248)
const monthlyRevenue = ref(15420000)
const totalMovies = ref(0)

// 최근 활동 데이터
const recentActivities = ref([
  {
    id: 1,
    text: '새로운 사용자가 가입했습니다',
    time: '5분 전',
    icon: markRaw(AccountPlus),
    color: '#059669'
  },
  {
    id: 2,
    text: '프리미엄 구독 결제가 완료되었습니다',
    time: '15분 전',
    icon: markRaw(CashMultiple),
    color: '#DC2626'
  },
  {
    id: 3,
    text: '새로운 영화가 추가되었습니다',
    time: '30분 전',
    icon: markRaw(Plus),
    color: '#7C3AED'
  },
  {
    id: 4,
    text: '사용자 계정이 비활성화되었습니다',
    time: '1시간 전',
    icon: markRaw(Account),
    color: '#EF4444'
  }
])

const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

const goBack = () => {
  router.push('/home')
}

onMounted(() => {
  // 영화 총 개수 계산
  let count = 0
  Object.values(movies).forEach(category => {
    count += category.length
  })
  totalMovies.value = count
})
</script> 