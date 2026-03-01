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
   Tropical Resort Color Palette
   - Ocean Blue:     #1F8DBF (primary)
   - Ocean Deep:     #1E88B6 (secondary)
   - Ocean Pale:     rgba(31, 141, 191, 0.1)
   - Gold Accent:    #F4C400 (primary)
   - Gold Deep:      #F2C200 (secondary)
   - Gold Pale:      rgba(244, 196, 0, 0.1)
   - Text Dark:      #1F8DBF (primary text)
   - Text Light:     #1E88B6 (secondary text)
   ======================================== */

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  background: #ffffff;
  border-top: 3px solid #F4C400;
  border-bottom: 1px solid rgba(31, 141, 191, 0.1);
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);

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
  color: #1F8DBF;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.4rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.mobile-menu-btn:hover {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  transform: scale(1.05);
}

.mobile-menu-btn i {
  transition: transform 0.2s;
}

.mobile-menu-btn:hover i {
  transform: rotate(90deg);
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
  color: #1F8DBF;
  line-height: 1.2;

  background: rgba(31, 141, 191, 0.05);
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  outline: none;
  user-select: none;
  pointer-events: none;
  border-left: 3px solid #F4C400;
}

.no-highlight {
  user-select: none;
  pointer-events: none;
}

.header-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #1E88B6;
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
  color: #1F8DBF;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-bell:hover {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  transform: scale(1.05);
}

.notification-bell.has-notifications {
  color: #F4C400;
}

.notification-bell.has-notifications::after {
  content: '';
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  width: 8px;
  height: 8px;
  background: #F4C400;
  border-radius: 50%;
  border: 2px solid white;
}

/* Badge */
.notification-badge {
  position: absolute;
  top: 0.1rem;
  right: 0.1rem;
  min-width: 1.2rem;
  height: 1.2rem;

  background: #F4C400;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  color: #1F8DBF;
  font-weight: 700;
  font-size: 0.7rem;
  border: 2px solid #ffffff;
  box-shadow: 0 0 10px rgba(244, 196, 0, 0.4);
}

/* User Initial Circle */
.user-initial {
  width: 2.5rem;
  height: 2.5rem;

  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: #ffffff;

  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;

  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.3);
  border: 2px solid #F4C400;
  transition: all 0.2s;
}

.user-initial:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.4);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    padding: 0.4rem 1rem;
  }

  .header-title h1 {
    font-size: 1.25rem;
    padding: 0.2rem 0.5rem;
  }

  .header-title p {
    font-size: 0.8rem;
  }

  .user-initial {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.9rem;
  }

  .notification-bell {
    width: 2.25rem;
    height: 2.25rem;
  }
}

@media (max-width: 480px) {
  .header-title h1 {
    font-size: 1rem;
  }

  .header-title p {
    font-size: 0.7rem;
  }

  .user-initial {
    width: 2rem;
    height: 2rem;
    font-size: 0.8rem;
  }
}
</style>