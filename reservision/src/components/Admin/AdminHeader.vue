<template>
  <div class="page-header">
    <div class="header-left">
      <button 
        @click="$emit('toggle-sidebar')"
        class="mobile-menu-btn"
      >
        <i class="fas fa-bars"></i>
      </button>
      
      <div class="header-title">
        <h1 tabindex="-1" class="no-highlight">{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
    </div>

    <div class="header-right">
      <button class="notification-bell" :class="{ 'has-notifications': hasNotifications }">
        <i class="fas fa-bell"></i>
        <span v-if="hasNotifications" class="notification-badge">
          {{ pendingCount > 9 ? '9+' : pendingCount }}
        </span>
      </button>

      <div class="user-initial">
        {{ userInitial }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Dashboard' },
  subtitle: { type: String, default: 'Welcome back, Admin' },
  userName: { type: String, default: 'Admin User' },
  hasNotifications: { type: Boolean, default: false },
  pendingCount: { type: Number, default: 0 }
})

defineEmits(['toggle-sidebar'])

const userInitial = computed(() => props.userName.charAt(0).toUpperCase())
</script>

<style scoped>
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #1a3a6b, #c8971a, #1a3a6b) 1;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(15, 35, 71, 0.1);
  /* ❌ removed border-bottom */
  padding: 0.4rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 200;
  transition: margin-left 0.3s ease;
}

@media (min-width: 768px) {
  .page-header {
    margin-left: 260px;
  }
}

/* ── Left ───────────────────────── */
.header-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.mobile-menu-btn {
  font-size: 1.1rem;
  color: #374151;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.4rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.mobile-menu-btn:hover {
  background: #F3F4F6;
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

/* ── Right ──────────────────────── */
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
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.notification-bell:hover {
  background: #F3F4F6;
}

.notification-bell.has-notifications {
  color: #EF4444;
  animation: bellGlow 2s ease-in-out infinite;
}

.notification-bell.has-notifications:hover {
  background: #FEE2E2;
}

@keyframes bellGlow {
  0%, 100% {
    text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
  }
  50% {
    text-shadow: 0 0 15px rgba(239, 68, 68, 0.8);
  }
}

.notification-badge {
  position: absolute;
  top: 0.1rem;
  right: 0.1rem;
  minimum-width: 1.2rem;
  min-width: 1.2rem;
  height: 1.2rem;
  background: linear-gradient(135deg, #EF4444, #DC2626);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.7rem;
  border: 2px solid white;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
  }
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