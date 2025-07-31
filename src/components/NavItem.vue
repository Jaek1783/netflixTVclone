<script setup>
import '../assets/styles/NavItem.css';

defineProps({
  icon: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="nav-item" :class="{ active: isActive }">
    <component 
      :is="icon" 
      :fillColor="isActive ? '#ef4444' : '#fff'" 
      :size="40" 
      class="cursor-pointer"
    />
  </div>
</template>