<template>
  <div v-if="isVisible" class="confirm-modal-overlay" @click="handleOverlayClick">
    <div class="confirm-modal-content" @click.stop>
      <div class="confirm-modal-header">
        <h3>{{ title }}</h3>
      </div>
      
      <div class="confirm-modal-body">
        <p>{{ message }}</p>
        <div v-if="details" class="confirm-details">
          <p v-for="detail in details" :key="detail" class="detail-item">{{ detail }}</p>
        </div>
      </div>
      
      <div class="confirm-modal-actions">
        <button 
          class="cancel-btn" 
          @click="handleCancel"
          :disabled="isLoading"
        >
          {{ cancelText }}
        </button>
        <button 
          class="confirm-btn" 
          @click="handleConfirm"
          :disabled="isLoading"
          :class="{ loading: isLoading }"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/styles/ConfirmModal.css'

// Props 정의
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '확인'
  },
  message: {
    type: String,
    default: '정말로 진행하시겠습니까?'
  },
  details: {
    type: Array,
    default: null
  },
  confirmText: {
    type: String,
    default: '확인'
  },
  cancelText: {
    type: String,
    default: '취소'
  },
  loadingText: {
    type: String,
    default: '처리중...'
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true
  }
})

// Emits 정의
const emit = defineEmits(['confirm', 'cancel', 'close'])

// 핸들러 함수들
const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick && !props.isLoading) {
    emit('close')
  }
}
</script> 