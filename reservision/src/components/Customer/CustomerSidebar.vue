<template> 
  <div
    v-show="isOpen"
    class="overlay"
    :class="{ active: isOpen }"
    @click="emit('close')"
  ></div>

  <aside class="sidebar" :class="{ active: isOpen, collapsed: isCollapsed }">
    <!-- Subtle wave pattern overlay -->
    <div class="sidebar-wave"></div>
    
    <div class="sidebar-header">
      <div class="logo-container">
        <span class="logo-text">
          <img
            src="/Eduardos Resort Logo.jpg"
            alt="Reservision"
            class="logo-image"
          />
        </span>
      </div>
    </div>

    <div class="user-info">
      <div class="user-avatar">
        <span>{{ userInitial }}</span>
        <div class="avatar-glow"></div>
      </div>
      <div class="user-details">
        <div class="font-medium text-white">{{ userName }}</div>
        <div class="text-xs text-white/80">{{ userRole }}</div>
      </div>
    </div>

    <div class="nav-container">
      <ul class="nav-list">
        <li v-for="item in items" :key="item.id" class="nav-item">
          <a
            href="#"
            class="nav-link"
            :class="{ active: activeSection === item.id }"
            @click.prevent="handleSelect(item.id)"
          >
            <div class="nav-icon-wrapper">
              <i :class="['nav-icon', 'fas', item.icon]"></i>
            </div>
            <span class="nav-text text-white">{{ item.label }}</span>
            <div class="active-indicator" v-if="activeSection === item.id"></div>
          </a>
        </li>
      </ul>
    </div>

    <div class="logout-container">
      <button
        @click="handleLogout"
        class="nav-link logout-link"
      >
        <div class="nav-icon-wrapper">
          <i class="fas fa-sign-out-alt nav-icon"></i>
        </div>
        <span class="nav-text text-white">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  activeSection: {
    type: String,
    default: 'dashboard',
  },
  brand: {
    type: String,
    default: 'Reservision',
  },
  userName: {
    type: String,
    default: 'Customer',
  },
  userRole: {
    type: String,
    default: 'Customer',
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select', 'close']);
const router = useRouter()
const auth = useAuthStore()

const userInitial = computed(() => props.userName.charAt(0).toUpperCase());

const handleSelect = (sectionId) => {
  emit('select', sectionId);
  emit('close');
};

const handleLogout = () => {
  auth.logout()
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
/* ========================================
   TROPICAL RESORT COLOR PALETTE
   RECTANGULAR STYLING (NO CURVES)
   ======================================== */

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(31, 141, 191, 0.7);
  backdrop-filter: blur(4px);
  z-index: 39;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}

.overlay.active {
  opacity: 1;
  visibility: visible;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;

  background: linear-gradient(165deg, #1F8DBF 0%, #1E88B6 60%, #1F8DBF 100%);
  color: #ffffff;

  z-index: 50;
  overflow: hidden;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  border-right: 2px solid #F4C400;

  transition: transform 0.3s ease, width 0.3s ease;
  transform: translateX(-100%);
  display: flex;
  flex-direction: column;
}

/* Wave overlay - subtle */
.sidebar-wave {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(244, 196, 0, 0.05) 0%, transparent 40%),
    repeating-linear-gradient(45deg, 
      rgba(244, 196, 0, 0.01) 0px, 
      rgba(244, 196, 0, 0.01) 2px,
      transparent 2px, 
      transparent 10px);
  pointer-events: none;
  z-index: 1;
}

.sidebar.active {
  transform: translateX(0);
}

/* HEADER - Rectangular */
.sidebar-header {
  position: relative;
  z-index: 2;
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #F4C400;
  display: flex;
  align-items: center;
  background: rgba(30, 136, 182, 0.3);
  backdrop-filter: blur(4px);
  min-height: 64px;
}

.logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
}

/* USER INFO - Rectangular */
.user-info {
  position: relative;
  z-index: 2;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  background: rgba(244, 196, 0, 0.08);
  border-bottom: 1px solid rgba(244, 196, 0, 0.2);
}

.user-avatar {
  width: 2.75rem;
  height: 2.75rem;
  background: #F4C400;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: #1F8DBF;
  border: 2px solid white;
}

.user-details .font-medium,
.user-details .text-xs {
  color: #ffffff;
}

/* NAV - Rectangular (no border-radius) */
.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.7rem 1rem;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  overflow: hidden;
}

.nav-link:hover {
  color: #ffffff;
  background: rgba(244, 196, 0, 0.1);
}

.nav-icon {
  font-size: 0.85rem;
  color: #ffffff;
  width: 1.25rem;
}

.nav-link:hover .nav-icon {
  color: #F4C400;
}

.nav-link.active {
  background: rgba(244, 196, 0, 0.2);
  border-left: 3px solid #F4C400;
  color: #ffffff;
  font-weight: 600;
}

.nav-link.active .nav-icon {
  color: #F4C400;
}

.nav-text {
  margin-left: 0.75rem;
  color: #ffffff;
}

/* LOGOUT - Rectangular */
.logout-link {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  margin: 0.5rem 1rem;
  width: calc(100% - 2rem);
}

.logout-link:hover {
  background: rgba(244, 196, 0, 0.2) !important;
  border-left: 3px solid #F4C400;
  color: #ffffff;
}

/* COLLAPSED */
.sidebar.collapsed .nav-text,
.sidebar.collapsed .user-details,
.sidebar.collapsed .logo-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
  visibility: hidden;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.7rem 0;
}

.sidebar.collapsed .nav-icon {
  margin: 0;
}

.sidebar.collapsed .user-avatar {
  margin: 0 auto;
}

/* Hide scrollbar */
.nav-container {
  scrollbar-width: none;
  flex: 1;
  overflow-y: auto;
}
.nav-container::-webkit-scrollbar {
  display: none;
}

/* Logout container */
.logout-container {
  padding: 0.5rem 0;
  border-top: 1px solid rgba(244, 196, 0, 0.2);
}

/* Text colors */
.text-white {
  color: #ffffff;
}

.text-white\/80 {
  color: rgba(255, 255, 255, 0.8);
}
</style>