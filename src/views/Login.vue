<template>
  <div class="login-container">
    <div class="login-background">
      <div class="login-overlay"></div>
      <div class="login-form-container">
        <div class="login-form">
          <h1 class="login-title">로그인</h1>
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <input
                v-model="loginForm.email"
                type="email"
                placeholder="이메일 주소"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="비밀번호"
                class="form-input"
                required
              />
            </div>
            <button type="submit" class="login-btn">로그인</button>
          </form>
          
          <div class="login-options">
            <div class="remember-me">
              <input type="checkbox" id="remember">
              <label for="remember">로그인 정보 저장</label>
            </div>
            <a href="#" class="forgot-password">비밀번호를 잊으셨나요?</a>
          </div>
          
          <div class="signup-section">
            <p class="signup-text">
              넷플릭스 회원이 아니신가요? 
              <a href="#" class="signup-link">지금 가입하세요</a>
            </p>
          </div>

          <div class="social-login">
            <button class="social-btn google">
              <span>Google로 로그인</span>
            </button>
            <button class="social-btn facebook">
              <span>Facebook으로 로그인</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/styles/Login.css'

const router = useRouter()

const loginForm = ref({
  email: '',
  password: ''
})

const handleLogin = () => {
  console.log('로그인 시도:', loginForm.value)
  alert('로그인 기능이 구현되었습니다!')
  // 로그인 성공 후 홈으로 이동
  router.push('/home')
}
</script> 