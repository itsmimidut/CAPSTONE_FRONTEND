<template>
  <div class="page-header">
    <div class="header-left">
      <button 
        @click="$emit('toggle-sidebar')"
        class="mobile-menu-btn md:hidden"
      >
        <i class="fas fa-bars"></i>
      </button>
      
      <div class="header-title">
        <h1 tabindex="-1" class="no-highlight">{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
    </div>

    <div class="header-right">
      <!-- Notification Bell -->
      <button class="notification-bell">
        <i class="fas fa-bell"></i>
        <span v-if="hasNotifications" class="notification-badge"></span>
      </button>

      <!-- User Initial -->
      <div class="user-initial">
        {{ userInitial }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  },
  subtitle: {
    type: String,
    default: 'Welcome back, Admin'
  },
  userName: {
    type: String,
    default: 'Admin User'
  },
  hasNotifications: {
    type: Boolean,
    default: true
  }
})

defineEmits(['toggle-sidebar'])

const userInitial = computed(() => {
  return props.userName.charAt(0).toUpperCase()
})
</script>

<style scoped>
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1rem 1.5rem;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 40;
  border-bottom: 1px solid #e2e8f0;
  transition: margin-left 0.3s ease;
}

@media (min-width: 768px) {
  .page-header {
    margin-left: 260px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-menu-btn {
  font-size: 1.25rem;
  color: #374151;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.header-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.header-title h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  outline: none;
  user-select: none;
  pointer-events: none;
  transition: background 0.2s;
}
.header-title h1:focus {
  background: #f3f4f6;
  outline: none;
}
.no-highlight {
  user-select: none;
  pointer-events: none;
}

.header-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #9CA3AF;
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-bell {
  position: relative;
  padding: 0.5rem;
  border-radius: 50%;
  color: #6B7280;
  transition: background 0.2s;
  background: none;
  border: none;
  cursor: pointer;
}

.notification-bell:hover {
  background: #F3F4F6;
}

.notification-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 0.5rem;
  height: 0.5rem;
  background: #EF4444;
  border-radius: 50%;
}

.user-initial {
  width: 2.25rem;
  height: 2.25rem;
  background: #63B3ED;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.875rem;
}
</style>