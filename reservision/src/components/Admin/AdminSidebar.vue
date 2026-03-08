<template>
  <!-- Overlay -->
  <div
    v-show="isOpen"
    class="overlay"
    :class="{ active: isOpen }"
    @click="emit('close')"
  ></div>

  <!-- Sidebar -->
  <aside class="sidebar" :class="{ active: isOpen, collapsed: isCollapsed }">
    <!-- Subtle wave pattern overlay -->
    <div class="sidebar-wave"></div>

    <!-- Header -->
    <div class="sidebar-header">
      <div class="logo-container">
        <span class="logo-text w-full">
          <img
            src="/Eduardos Resort Logo.jpg"
            alt="Reservision"
            class="logo-image"
          />
        </span>
      </div>

      <button class="md:hidden header-icon-btn" @click="emit('close')">
        <i class="fas fa-bars"></i>
      </button>
    </div>

    <!-- User Info -->
    <div class="user-info">
      <div class="user-avatar">
        <span>{{ userInitial }}</span>
        <div class="avatar-glow"></div>
      </div>
      <div class="user-details">
        <div class="font-medium text-white">{{ userDisplayName }}</div>
        <div class="text-xs text-white/80">{{ userRoleLabel }}</div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="nav-container">
      <ul class="nav-list">
        <li
          v-for="item in filteredNavItems"
          :key="item.path || item.label"
          class="nav-item"
        >
          <!-- Regular Link -->
          <router-link
            v-if="!item.children"
            :to="item.path"
            class="nav-link"
            :class="{ active: activePath === item.path }"
            @click="emit('close')"
          >
            <div class="nav-icon-wrapper">
              <i :class="['nav-icon', item.icon]"></i>
            </div>

            <span class="nav-text">{{ item.label }}</span>

            <!-- Notifications -->
            <span
              v-if="item.path === '/admin/swimming' && notifications.swimmingPendingCount > 0"
              class="notification-badge-sidebar"
              aria-label="Pending swimming requests"
            >
              {{ notifications.swimmingPendingCount > 9 ? '9+' : notifications.swimmingPendingCount }}
            </span>

            <span
              v-if="item.path === '/admin/reservations' && notifications.reservationPendingCount > 0"
              class="notification-badge-sidebar"
              aria-label="Pending reservations"
            >
              {{ notifications.reservationPendingCount > 9 ? '9+' : notifications.reservationPendingCount }}
            </span>

            <span
              v-if="item.path === '/pos' && notifications.eshopPendingCount > 0"
              class="notification-badge-sidebar"
              aria-label="Pending e-shop orders"
            >
              {{ notifications.eshopPendingCount > 9 ? '9+' : notifications.eshopPendingCount }}
            </span>
          </router-link>

          <!-- Dropdown -->
          <div v-else class="nav-dropdown">
            <button
              class="nav-link dropdown-trigger"
              :class="{
                active: item.children.some(child => activePath === child.path),
                open: openDropdown === item.label
              }"
              @click="toggleDropdown(item.label)"
              type="button"
            >
              <div class="nav-icon-wrapper">
                <i :class="['nav-icon', item.icon]"></i>
              </div>

              <span class="nav-text">{{ item.label }}</span>

              <i
                class="fas fa-chevron-down dropdown-arrow"
                :class="{ rotate: openDropdown === item.label }"
              ></i>
            </button>

            <transition name="dropdown">
              <ul v-show="openDropdown === item.label" class="dropdown-menu">
                <li v-for="child in item.children" :key="child.path">
                  <router-link
                    :to="child.path"
                    class="nav-link dropdown-item"
                    :class="{ active: activePath === child.path }"
                    @click="emit('close')"
                  >
                    <div class="nav-icon-wrapper">
                      <i :class="['nav-icon', child.icon]"></i>
                    </div>
                    <span class="nav-text">{{ child.label }}</span>
                  </router-link>
                </li>
              </ul>
            </transition>
          </div>
        </li>
      </ul>
    </div>

    <!-- Logout -->
    <div class="logout-container">
      <button @click="handleLogout" class="nav-link logout-link" type="button">
        <div class="nav-icon-wrapper">
          <i class="fas fa-sign-out-alt nav-icon"></i>
        </div>
        <span class="nav-text">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notifications'

const props = defineProps({
  isOpen: Boolean,
  isCollapsed: Boolean,
  currentPath: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationStore()

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

const resolvedUser = computed(() => auth.user || getStoredUser())

// Logout handler
const handleLogout = () => {
  auth.logout()
  localStorage.clear()
  router.push('/login')
}

const userDisplayName = computed(() => {
  const u = resolvedUser.value || {}
  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim()
  return fullName || u.name || u.email || 'Guest'
})

const userRoleLabel = computed(() => {
  const role = resolvedUser.value?.role
  const roleLabels = {
    admin: 'Admin',
    restaurantstaff: 'Restaurant Staff',
    restaurant_staff: 'Restaurant Staff',
    receptionist: 'Receptionist',
    customer: 'Customer'
  }
  return roleLabels[role] || 'User'
})
const userInitial = computed(() => (userDisplayName.value?.charAt(0) || 'G').toUpperCase())

// Use actual route path or fallback to prop
const activePath = computed(() => props.currentPath || route.path)

const openDropdown = ref(null)

const toggleDropdown = (label) => {
  // Simple toggle without any extra logic that could cause blinking
  if (openDropdown.value === label) {
    openDropdown.value = null
  } else {
    openDropdown.value = label
  }
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', roles: ['admin', 'restaurantstaff', 'receptionist'] },
  { path: '/admin/reservations', label: 'Reservations', icon: 'fas fa-calendar-check', roles: ['admin', 'receptionist'] },
  {
    label: 'Rooms & Cottages',
    icon: 'fas fa-bed',
    roles: ['admin'],
    children: [
      { path: '/admin/rooms/rooms', label: 'Rooms', icon: 'fas fa-door-open', roles: ['admin'] },
      { path: '/admin/rooms/cottages', label: 'Cottages', icon: 'fas fa-home', roles: ['admin'] },
      { path: '/admin/rooms/events', label: 'Events', icon: 'fas fa-calendar', roles: ['admin'] }
    ]
  },
  {
    label: 'Restaurants',
    icon: 'fas fa-utensils',
    roles: ['admin', 'restaurantstaff'],
    children: [
      // { path: '/admin/restaurants/tables', label: 'Tables', icon: 'fas fa-table', roles: ['admin', 'restaurantstaff'] },
      { path: '/admin/restaurants/menu', label: 'Menu', icon: 'fas fa-book-open', roles: ['admin', 'restaurantstaff'] },
      { path: '/admin/restaurants/inventory', label: 'Inventory', icon: 'fas fa-boxes', roles: ['admin', 'restaurantstaff'] }
    ]
  },
  { path: '/pos', label: 'Point of Sale', icon: 'fas fa-cash-register', roles: ['admin', 'restaurantstaff', 'receptionist'] },
  { path: '/admin/swimming', label: 'Swimming Pools', icon: 'fas fa-swimming-pool', roles: ['admin', 'receptionist'] },
  { path: '/admin/users', label: 'User Management', icon: 'fas fa-users', roles: ['admin'] }
]

const isRoleAllowed = (item, role) => {
  if (!item.roles || item.roles.length === 0) return true
  return item.roles.includes(role)
}

const filteredNavItems = computed(() => {
  const rawRole = resolvedUser.value?.role || auth.role || ''
  const role = rawRole === 'restaurant_staff' ? 'restaurantstaff' : rawRole

  return navItems
    .filter(item => isRoleAllowed(item, role))
    .map(item => {
      if (!item.children) return item
      const filteredChildren = item.children.filter(child => isRoleAllowed(child, role))
      return { ...item, children: filteredChildren }
    })
    .filter(item => !item.children || item.children.length > 0)
})

// Auto-open dropdown if current path matches a child - only on mount and route change
const autoOpenDropdown = () => {
  for (const item of filteredNavItems.value) {
    if (item.children) {
      const isChildActive = item.children.some(child => activePath.value === child.path)
      if (isChildActive) {
        openDropdown.value = item.label
        return
      }
    }
  }
  // Don't auto-close if nothing is active - keep current dropdown state
}

// Only auto-open on mount and when route changes, but don't force close
watch(() => activePath.value, () => {
  autoOpenDropdown()
})

onMounted(() => {
  auth.initFromStorage()
  autoOpenDropdown()
})
</script>

<style scoped>
/* ========================================
   ORIGINAL COLOR PALETTE RESTORED
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

.sidebar.active {
  transform: translateX(0);
}

/* Desktop: keep visible; allow collapse */
@media (min-width: 768px) {
  .sidebar {
    transform: translateX(0) !important;
  }
  .sidebar.collapsed {
    width: 70px;
  }
}

/* Wave overlay - subtle */
.sidebar-wave {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(244, 196, 0, 0.05) 0%, transparent 40%),
    repeating-linear-gradient(
      45deg,
      rgba(244, 196, 0, 0.01) 0px,
      rgba(244, 196, 0, 0.01) 2px,
      transparent 2px,
      transparent 10px
    );
  pointer-events: none;
  z-index: 1;
}

/* HEADER - rectangular */
.sidebar-header {
  position: relative;
  z-index: 2;
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #F4C400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 136, 182, 0.3);
  backdrop-filter: blur(4px);
  min-height: 64px;
}

.header-icon-btn {
  color: #ffffff;
  background: transparent;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}

.logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
}

.logo-image {
  width: 100%;
  height: auto;
  display: block;
}

/* USER INFO - rectangular */
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
  border: 2px solid #ffffff;
  position: relative;
}

.avatar-glow {
  position: absolute;
  inset: -6px;
  background: radial-gradient(circle, rgba(244, 196, 0, 0.25) 0%, transparent 60%);
  pointer-events: none;
}

.user-details .font-medium,
.user-details .text-xs {
  color: #ffffff;
}

/* NAV */
.nav-container {
  position: relative;
  z-index: 2;
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
  scrollbar-width: none;
}
.nav-container::-webkit-scrollbar {
  display: none;
}

.nav-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.nav-item {
  margin: 0;
}

/* Links - rectangular (no radius) */
.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  overflow: hidden;
  border-radius: 0;
  border: none;
  background: transparent;
  width: 100%;
  white-space: nowrap;
  cursor: pointer;
}

.nav-link:hover {
  background: rgba(244, 196, 0, 0.1);
  color: #ffffff;
}

.nav-link.active {
  background: rgba(244, 196, 0, 0.2);
  font-weight: 600;
}

.nav-icon-wrapper {
  width: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  font-size: 0.9rem;
  color: #ffffff;
}

.nav-link:hover .nav-icon {
  color: #F4C400;
}

.nav-link.active .nav-icon {
  color: #F4C400;
}

.nav-text {
  margin-left: 0;
  color: #ffffff;
}

/* Dropdown */
.nav-dropdown {
  margin: 0;
}

.dropdown-trigger {
  justify-content: flex-start;
}

.dropdown-trigger.open {
  background: rgba(244, 196, 0, 0.12);
}

.dropdown-arrow {
  position: absolute;
  right: 1rem;
  font-size: 0.75rem;
  transition: transform 0.3s ease;
  color: rgba(255, 255, 255, 0.9);
}
.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

/* Dropdown menu - rectangular (no radius) */
.dropdown-menu {
  list-style: none;
  padding: 0.35rem 0;
  margin: 0;
  background: rgba(0, 0, 0, 0.18);
  border-top: 1px solid rgba(244, 196, 0, 0.15);
  border-bottom: 1px solid rgba(244, 196, 0, 0.15);
  border-left: 3px solid rgba(244, 196, 0, 0.35);
  border-radius: 0;
  overflow: hidden;
}

.dropdown-item {
  padding-left: 1.5rem;
  padding-right: 1rem;
  font-size: 0.92rem;
}

.dropdown-item .nav-icon-wrapper {
  width: 1.75rem;
}

/* Dropdown animation - smooth without flicker */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease;
  opacity: 1;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
}

/* Logout container */
.logout-container {
  position: relative;
  z-index: 2;
  padding: 0.5rem 0;
  border-top: 1px solid rgba(244, 196, 0, 0.2);
}

.logout-link {
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 1rem;
  width: calc(100% - 2rem);
}

.logout-link:hover {
  background: rgba(244, 196, 0, 0.2) !important;
}

/* Notification badge - rectangular */
.notification-badge-sidebar {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6rem;
  height: 1.35rem;
  padding: 0 0.35rem;
  background: #DC2626;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  font-size: 0.65rem;
  font-weight: 800;
  border-radius: 0;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.45);
  animation: badgePulseSidebar 2s ease-in-out infinite;
}

@keyframes badgePulseSidebar {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(220, 38, 38, 0.45);
  }
  50% {
    transform: scale(1.12);
    box-shadow: 0 0 18px rgba(220, 38, 38, 0.65);
  }
}

/* COLLAPSED behavior */
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

.sidebar.collapsed .nav-icon-wrapper {
  width: auto;
}

.sidebar.collapsed .user-avatar {
  margin: 0 auto;
}

.sidebar.collapsed .dropdown-arrow,
.sidebar.collapsed .notification-badge-sidebar {
  display: none;
}
</style>