<template>
  <!-- Overlay -->
  <div 
    v-show="isOpen"
    @click="$emit('close')"
    class="overlay"
    :class="{ active: isOpen }"
  ></div>

  <!-- Sidebar -->
  <aside 
    class="sidebar"
    :class="{ active: isOpen, collapsed: isCollapsed }"
  >
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
      <button class="md:hidden" @click="emit('close')">
        <i class="fas fa-bars"></i>
      </button>
    </div>

    <!-- User Info -->
    <div class="user-info">
      <div class="user-avatar">
        <span>{{ userInitial }}</span>
      </div>
      <div>
        <div class="font-medium">{{ userDisplayName }}</div>
        <div class="text-xs opacity-70">{{ userRoleLabel }}</div>
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
            @click="$emit('close')"
          >
            <i :class="item.icon" class="nav-icon"></i>
            <span class="nav-text">{{ item.label }}</span>
            <span 
              v-if="item.path === '/admin/swimming' && notifications.swimmingPendingCount > 0" 
              class="notification-badge-sidebar"
            >
              {{ notifications.swimmingPendingCount > 9 ? '9+' : notifications.swimmingPendingCount }}
            </span>
            <span 
              v-if="item.path === '/admin/reservations' && notifications.reservationPendingCount > 0" 
              class="notification-badge-sidebar"
            >
              {{ notifications.reservationPendingCount > 9 ? '9+' : notifications.reservationPendingCount }}
            </span>
            <span 
              v-if="item.path === '/pos' && notifications.eshopPendingCount > 0" 
              class="notification-badge-sidebar"
            >
              {{ notifications.eshopPendingCount > 9 ? '9+' : notifications.eshopPendingCount }}
            </span>
          </router-link>

          <!-- Dropdown Link -->
          <div v-else class="nav-dropdown">
            <button
              class="nav-link dropdown-trigger"
              :class="{ 
                active: item.children.some(child => activePath === child.path),
                open: openDropdown === item.label
              }"
              @click="toggleDropdown(item.label)"
            >
              <i :class="item.icon" class="nav-icon"></i>
              <span class="nav-text">{{ item.label }}</span>
              <i class="fas fa-chevron-down dropdown-arrow" :class="{ rotate: openDropdown === item.label }"></i>
            </button>

            <transition name="dropdown">
              <ul v-show="openDropdown === item.label" class="dropdown-menu">
                <li v-for="child in item.children" :key="child.path">
                  <router-link
                    :to="child.path"
                    class="nav-link dropdown-item"
                    :class="{ active: activePath === child.path }"
                    @click="$emit('close')"
                  >
                    <i :class="child.icon" class="nav-icon"></i>
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
      <button
        @click="handleLogout"
        class="nav-link w-full text-left"
      >
        <i class="fas fa-sign-out-alt nav-icon"></i>
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

defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationStore()

// Logout handler
const handleLogout = () => {
  // Call auth store logout (clears authToken and user from localStorage)
  auth.logout()
  
  // Clear ALL localStorage to prevent accessing admin pages with old credentials
  localStorage.clear()
  
  // Redirect to login page
  router.push('/login')
}

const userDisplayName = computed(() => auth.user?.name || 'User')
const userRoleLabel = computed(() => {
  const role = auth.user?.role
  const roleLabels = {
    admin: 'Admin',
    restaurantstaff: 'Restaurant Staff',
    receptionist: 'Receptionist'
  }

  return roleLabels[role] || 'User'
})
const userInitial = computed(() => userDisplayName.value.charAt(0).toUpperCase())

// Use actual route path or fallback to prop
const activePath = computed(() => props.currentPath || route.path)

const openDropdown = ref(null)

const toggleDropdown = (label) => {
  openDropdown.value = openDropdown.value === label ? null : label
}

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'fas fa-tachometer-alt',
    roles: ['admin', 'restaurantstaff', 'receptionist']
  },
  {
    path: '/admin/reservations',
    label: 'Reservations',
    icon: 'fas fa-calendar-check',
    roles: ['admin', 'receptionist']
  },
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
      { path: '/admin/restaurants/tables', label: 'Tables', icon: 'fas fa-table', roles: ['admin', 'restaurantstaff'] },
      { path: '/admin/restaurants/menu', label: 'Menu', icon: 'fas fa-book-open', roles: ['admin', 'restaurantstaff'] },
      { path: '/admin/restaurants/inventory', label: 'Inventory', icon: 'fas fa-boxes', roles: ['admin', 'restaurantstaff'] }
    ]
  },
  {
    path: '/pos',
    label: 'Point of Sale',
    icon: 'fas fa-cash-register',
    roles: ['admin', 'restaurantstaff', 'receptionist']
  },
  // {
  //   path: '/admin/sales-report',
  //   label: 'Sales Report',
  //   icon: 'fas fa-chart-line',
  //   roles: ['admin', 'restaurantstaff', 'receptionist']
  // },
  {
    path: '/admin/swimming',
    label: 'Swimming Pools',
    icon: 'fas fa-swimming-pool',
    roles: ['admin', 'receptionist']
  },
  {
    path: '/admin/users',
    label: 'User Management',
    icon: 'fas fa-users',
    roles: ['admin']
  }
  // { path: '/admin/reports', label: 'Reports & Analytics', icon: 'fas fa-chart-bar', roles: ['admin'] },
  // { path: '/admin/settings', label: 'Site Configuration', icon: 'fas fa-cog', roles: ['admin'] },
  // { path: '/admin/feedback', label: 'Feedback & Support', icon: 'fas fa-headset', roles: ['admin'] }
]

const isRoleAllowed = (item, role) => {
  if (!item.roles || item.roles.length === 0) {
    return true
  }
  return item.roles.includes(role)
}

const filteredNavItems = computed(() => {
  const role = auth.role || ''

  return navItems
    .filter(item => isRoleAllowed(item, role))
    .map(item => {
      if (!item.children) {
        return item
      }

      const filteredChildren = item.children.filter(child => isRoleAllowed(child, role))
      return {
        ...item,
        children: filteredChildren
      }
    })
    .filter(item => !item.children || item.children.length > 0)
})

// Auto-open dropdown if current path matches a child
const autoOpenDropdown = () => {
  for (const item of filteredNavItems.value) {
    if (item.children) {
      const isChildActive = item.children.some(child => activePath.value === child.path)
      if (isChildActive) {
        openDropdown.value = item.label
        break
      }
    }
  }
}

// Watch for path changes
watch(() => activePath.value, () => {
  autoOpenDropdown()
})

// Auto-open on mount
onMounted(() => {
  autoOpenDropdown()
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(3px);
  z-index: 39;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
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
  background-color: #2B6CB0;
  color: white;
  z-index: 50;
  overflow: hidden;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  transform: translateX(-100%);
  display: flex;
  flex-direction: column;
}

.sidebar.active {
  transform: translateX(0);
}

@media (min-width: 768px) {
  .sidebar {
    transform: translateX(0) !important;
  }
  
  .sidebar.collapsed {
    width: 70px;
  }
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255,255,255,0.1);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 600;
  width: 100%;
}

.logo-image {
  width: 100%;
  height: auto;
  display: block;
}

.user-info {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.nav-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  font-size: 0.9375rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.nav-link.active {
  background: rgba(255,255,255,0.2);
  font-weight: 600;
  border-left: 3px solid white;
}

.nav-icon {
  width: 1.25rem;
  text-align: center;
}

.nav-text {
  margin-left: 0.75rem;
  opacity: 1;
  transition: opacity 0.2s ease 0.1s;
}

.sidebar.collapsed .nav-text,
.sidebar.collapsed .logo-text,
.sidebar.collapsed .user-info > div {
  opacity: 0;
  visibility: hidden;
  width: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.sidebar.collapsed .logo-text {
  display: none;
}

.logout-container {
  padding: 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.logout-container button {
  cursor: pointer;
}

/* Dropdown Styles */
.nav-dropdown {
  position: relative;
  margin: 0.25rem 0;
}

.dropdown-trigger {
  width: 100%;
  /* background: rgba(255, 255, 255, 0.08); */
  border: none;
  text-align: left;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.dropdown-trigger.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
  border-left: 3px solid white;
}

.dropdown-trigger.open {
  background: rgba(255, 255, 255, 0.12);
}

.dropdown-arrow {
  position: absolute;
  right: 1rem;
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  list-style: none;
  padding: 0.75rem 0.5rem;
  margin: 0.5rem 0 0.25rem 0;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.dropdown-item {
  padding-left: 2.5rem !important;
  padding-right: 1rem !important;
  font-size: 0.875rem;
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
  display: flex !important;
  align-items: center;
  border-radius: 0.5rem;
  margin: 0.25rem 0.25rem !important;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item .nav-icon {
  width: 1rem;
  font-size: 0.875rem;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
}

.dropdown-enter-from,
.dropdown-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Notification Badge for Sidebar */
.notification-badge-sidebar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: white;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 700;
  margin-left: auto;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  animation: badgePulseSidebar 2s ease-in-out infinite;
}

@keyframes badgePulseSidebar {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
  }
}
</style>