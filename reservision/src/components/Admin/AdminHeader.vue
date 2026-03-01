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
/* ========================================
   Tropical Ocean + Sunflower Gold Palette
   - Ocean Blue:     #1E88B6
   - Ocean Dark:     #166B8F
   - Ocean Pale:     #E3F2F9
   - Gold Accent:    #F2C200
   - Gold Light:     #FFD633
   - Deep Text:      #0B2230
   ======================================== */

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  background: #ffffff;
  border-top: 3px solid #F2C200;
  box-shadow: 0 6px 16px rgba(22, 107, 143, 0.12);

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
  color: #166B8F;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.4rem;
  border-radius: 0.375rem;
  transition: background 0.2s, color 0.2s;
}

.mobile-menu-btn:hover {
  background: #E3F2F9;
  color: #1E88B6;
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
  color: #0B2230;
  line-height: 1.2;

  background: #E3F2F9;
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  outline: none;
  user-select: none;
  pointer-events: none;
}

.no-highlight {
  user-select: none;
  pointer-events: none;
}

.header-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #166B8F;
  font-weight: 500;
}

/* ── Right ──────────────────────── */

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Notification Bell */
.notification-bell {
  position: relative;
  padding: 0.5rem;
  border-radius: 50%;
  color: #166B8F;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.notification-bell:hover {
  background: #E3F2F9;
}

.notification-bell.has-notifications {
  color: #F2C200;
}

/* Badge */
.notification-badge {
  position: absolute;
  top: 0.1rem;
  right: 0.1rem;
  min-width: 1.2rem;
  height: 1.2rem;

  background: #F2C200;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  color: #0B2230;
  font-weight: 700;
  font-size: 0.7rem;
  border: 2px solid #ffffff;
  box-shadow: 0 0 10px rgba(242, 194, 0, 0.4);
}

/* User Initial Circle */
.user-initial {
  width: 2.25rem;
  height: 2.25rem;

  background: #1E88B6;
  color: #ffffff;

  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;

  box-shadow: 0 6px 14px rgba(22, 107, 143, 0.18);
}
</style>