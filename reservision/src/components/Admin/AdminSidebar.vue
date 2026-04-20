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

    <!-- ── Decorative backgrounds ── -->
    <div class="sb-wave"></div>
    <div class="sb-particles">
      <span v-for="i in 6" :key="i" class="particle" :style="`--i:${i}`"></span>
    </div>

    <!-- ── Header ── -->
    <div class="sidebar-header">
      <div class="logo-container">
        <div class="logo-text">
          <img
            src="/Eduardos Resort Logo.jpg"
            alt="Eduardo's Resort"
            class="logo-image"
          />
        </div>
      </div>
      <button class="md:hidden header-close-btn" @click="emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- ── User Info ── -->
    <div class="user-info">
      <div class="user-avatar">
        <img
          v-if="userAvatarSrc"
          :src="userAvatarSrc"
          alt="Profile"
          class="avatar-image"
        />
        <span v-else class="avatar-initial">{{ userInitial }}</span>
        <span class="avatar-ring"></span>
        <span class="avatar-online-dot"></span>
      </div>
      <div class="user-details">
        <div class="user-name">{{ userDisplayName }}</div>
        <div class="user-role-badge">
          <span class="badge-dot"></span>
          {{ userRoleLabel }}
        </div>
      </div>
    </div>

    <!-- ── Navigation ── -->
    <div class="nav-container">
      <ul class="nav-list">
        <li
          v-for="item in filteredNavItems"
          :key="item.path || item.label"
          class="nav-item"
        >

          <!-- Regular Link -->
          <div class="nav-item-wrap" v-if="!item.children">
            <router-link
              :to="item.path"
              class="nav-link"
              :class="{ active: activePath === item.path }"
              @click="emit('close')"
            >
              <div class="nav-icon-wrapper">
                <i :class="['nav-icon', item.icon]"></i>
                <span class="nav-icon-glow"></span>
              </div>
              <span class="nav-text">{{ item.label }}</span>
              <span
                v-if="item.path === '/admin/swimming' && notifications.swimmingPendingCount > 0"
                class="nav-badge"
              >{{ notifications.swimmingPendingCount > 9 ? '9+' : notifications.swimmingPendingCount }}</span>
              <span
                v-if="item.path === '/admin/reservations' && notifications.reservationPendingCount > 0"
                class="nav-badge"
              >{{ notifications.reservationPendingCount > 9 ? '9+' : notifications.reservationPendingCount }}</span>
              <span
                v-if="item.path === '/pos' && notifications.eshopPendingCount > 0"
                class="nav-badge"
              >{{ notifications.eshopPendingCount > 9 ? '9+' : notifications.eshopPendingCount }}</span>
            </router-link>
            <div class="nav-tooltip">{{ item.label }}</div>
          </div>

          <!-- Dropdown -->
          <div v-else class="nav-dropdown">
            <div class="nav-item-wrap">
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
                  <span class="nav-icon-glow"></span>
                </div>
                <span class="nav-text">{{ item.label }}</span>
                <i
                  class="fas fa-chevron-down dropdown-arrow"
                  :class="{ rotate: openDropdown === item.label }"
                ></i>
              </button>
              <div class="nav-tooltip">{{ item.label }}</div>
            </div>

            <transition name="dropdown">
              <ul v-show="openDropdown === item.label" class="dropdown-menu">
                <li v-for="child in item.children" :key="child.path" class="dropdown-li">
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

    <!-- ── Logout ── -->
    <div class="logout-container">
      <button @click="handleLogout" class="logout-btn" type="button">
        <div class="nav-icon-wrapper">
          <i class="fas fa-sign-out-alt nav-icon"></i>
        </div>
        <span class="nav-text">Logout</span>
      </button>
    </div>

  </aside>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notifications'

const props = defineProps({
  isOpen:      Boolean,
  isCollapsed: Boolean,
  currentPath: { type: String, default: '' }
})

const emit = defineEmits(['close'])

const route         = useRoute()
const router        = useRouter()
const auth          = useAuthStore()
const notifications = useNotificationStore()
const configuredApiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '')
const apiBase = /\/api$/i.test(configuredApiBase)
  ? configuredApiBase
  : `${configuredApiBase}/api`
const apiRoot = apiBase.replace(/\/api\/?$/, '')
const fetchedProfileImage = ref('')

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') }
  catch { return {} }
}

const handleLogout = () => {
  auth.logout()
  localStorage.clear()
  router.push('/login')
}

const userDisplayName = computed(() => {
  const u = resolvedUser.value || {}
  return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || u.email || 'Guest'
})

const userRoleLabel = computed(() => {
  const roleLabels = {
    admin:            'Admin',
    restaurantstaff:  'Restaurant Staff',
    restaurant_staff: 'Restaurant Staff',
    receptionist:     'Receptionist',
    customer:         'Customer'
  }
  return roleLabels[resolvedUser.value?.role] || 'User'
})

const userInitial  = computed(() => (userDisplayName.value?.charAt(0) || 'G').toUpperCase())
const activePath   = computed(() => props.currentPath || route.path)
const openDropdown = ref(null)

const toggleDropdown = (label) => {
  openDropdown.value = openDropdown.value === label ? null : label
}

const navItems = [
  { path: '/dashboard',          label: 'Dashboard',       icon: 'fas fa-tachometer-alt', roles: ['admin', 'restaurantstaff', 'receptionist'] },
  { path: '/admin/reservations', label: 'Reservations',    icon: 'fas fa-calendar-check', roles: ['admin', 'receptionist'] },
  {
    label: 'Rooms & Cottages', icon: 'fas fa-bed', roles: ['admin'],
    children: [
      { path: '/admin/rooms/rooms',    label: 'Rooms',    icon: 'fas fa-door-open', roles: ['admin'] },
      { path: '/admin/rooms/cottages', label: 'Cottages', icon: 'fas fa-home',      roles: ['admin'] },
      { path: '/admin/rooms/events',   label: 'Events',   icon: 'fas fa-calendar',  roles: ['admin'] }
    ]
  },
  {
    label: 'Restaurants', icon: 'fas fa-utensils', roles: ['admin', 'restaurantstaff'],
    children: [
      { path: '/admin/restaurants/menu',      label: 'Menu',      icon: 'fas fa-book-open', roles: ['admin', 'restaurantstaff'] },
      { path: '/admin/restaurants/inventory', label: 'Inventory', icon: 'fas fa-boxes',     roles: ['admin', 'restaurantstaff'] }
    ]
  },
  { path: '/pos',            label: 'Point of Sale',   icon: 'fas fa-cash-register', roles: ['admin', 'restaurantstaff', 'receptionist'] },
  { path: '/admin/swimming', label: 'Swimming Pools',  icon: 'fas fa-swimming-pool', roles: ['admin', 'receptionist'] },
  { path: '/admin/entrance-rates', label: 'Entrance Rates', icon: 'fas fa-door-open', roles: ['admin'] },
  // { path: '/admin/website/amenities', label: 'Website Amenities', icon: 'fas fa-globe', roles: ['admin'] },
  { path: '/profile',        label: 'Profile',          icon: 'fas fa-user-circle', roles: ['admin', 'restaurantstaff', 'receptionist', 'customer'] },
  { path: '/admin/users',    label: 'User Management', icon: 'fas fa-users',         roles: ['admin'] }
]

const resolvedUser = computed(() => {
  const fromStore = auth.user || {}
  const fromStorage = getStoredUser()
  return {
    ...fromStorage,
    ...fromStore,
    // Ensure image survives even if auth store user object is partial
    profileImage:
      fromStore.profileImage ||
      fromStore.profile_image ||
      fromStorage.profileImage ||
      fromStorage.profile_image ||
      '',
  }
})

const resolveProfileImageUrl = (rawPath) => {
  const path = (rawPath || '').trim()
  if (!path) return ''
  if (/^(https?:\/\/|data:|blob:)/i.test(path)) return path
  if (path.startsWith('//')) return `https:${path}`
  if (path.startsWith('/')) return `${apiRoot}${path}`
  return `${apiRoot}/${path.replace(/^\.?\//, '')}`
}

const userAvatarSrc = computed(() => {
  const u = resolvedUser.value || {}
  const candidate = fetchedProfileImage.value || u.profileImage || u.profile_image || ''
  return resolveProfileImageUrl(candidate)
})

const isRoleAllowed = (item, role) =>
  !item.roles || item.roles.length === 0 || item.roles.includes(role)

const filteredNavItems = computed(() => {
  const rawRole = resolvedUser.value?.role || auth.role || ''
  const role = rawRole === 'restaurant_staff' ? 'restaurantstaff' : rawRole
  return navItems
    .filter(item => isRoleAllowed(item, role))
    .map(item => {
      if (!item.children) return item
      return { ...item, children: item.children.filter(c => isRoleAllowed(c, role)) }
    })
    .filter(item => !item.children || item.children.length > 0)
})

const autoOpenDropdown = () => {
  for (const item of filteredNavItems.value) {
    if (item.children?.some(c => activePath.value === c.path)) {
      openDropdown.value = item.label
      return
    }
  }
}

const fetchProfileImageById = async () => {
  const u = resolvedUser.value || {}
  const userId = u.id || u.user_id
  if (!userId) return

  try {
    const res = await fetch(`${apiBase}/customers/profile/id/${encodeURIComponent(userId)}`)
    if (!res.ok) return

    const payload = await res.json()
    const customer = payload?.customer || {}
    const latestProfileImage = customer.profileImage || customer.profile_image || ''
    fetchedProfileImage.value = latestProfileImage

    const currentStored = getStoredUser()
    const mergedUser = {
      ...currentStored,
      ...(auth.user || {}),
      profileImage: latestProfileImage,
      profile_image: latestProfileImage,
    }
    localStorage.setItem('user', JSON.stringify(mergedUser))
    auth.setUser(mergedUser)
  } catch {
    // Fallback to existing user data if fetch fails
  }
}

// Only auto-open on mount and when route changes, but don't force close
watch(() => activePath.value, () => {
  autoOpenDropdown()
})

onMounted(async () => {
  auth.initFromStorage()
  await fetchProfileImageById()
  autoOpenDropdown()
  notifications.fetchNotificationCounts()
  notificationInterval = setInterval(() => {
    notifications.fetchNotificationCounts()
  }, 30000)
})

let notificationInterval = null
onUnmounted(() => {
  if (notificationInterval) clearInterval(notificationInterval)
})
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.overlay, .sidebar {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-white-soft:    rgba(255, 255, 255, 0.1);
  --color-gray-bg:       #f9fafb;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

/* ── Keyframes ── */
@keyframes ringPulse {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50%       { opacity: 0.95; transform: scale(1.07); }
}
@keyframes shimmer {
  0%   { left: -60%; }
  100% { left: 110%; }
}
@keyframes badgePop {
  0%   { transform: scale(0.7); opacity: 0; }
  70%  { transform: scale(1.12); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes badgePulse {
  0%, 100% { transform: scale(1);     box-shadow: 0 0 8px  rgba(220, 38, 38, 0.4); }
  50%       { transform: scale(1.12); box-shadow: 0 0 14px rgba(220, 38, 38, 0.65); }
}
@keyframes dotBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
@keyframes particleDrift {
  0%,100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.2; }
  50%      { transform: translateY(-18px) translateX(6px) scale(1.2); opacity: 0.08; }
}
@keyframes iconGlow {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50%       { opacity: 1; transform: scale(1.4); }
}

/* ── Overlay ── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 59, 94, 0.55);
  backdrop-filter: blur(4px);
  z-index: 39;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.28s ease, visibility 0.28s ease;
}
.overlay.active { opacity: 1; visibility: visible; }

/* ── Sidebar Shell ── */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 262px;
  height: 100vh;
  background: var(--color-navy);
  color: var(--color-white);
  z-index: 50;
  overflow: hidden;
  border-right: 3px solid var(--color-gold);
  border-radius: 0 10px 10px 0;
  box-shadow: 4px 0 32px rgba(12, 59, 94, 0.45);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease;
  transform: translateX(-100%);
  display: flex;
  flex-direction: column;
}
.sidebar.active { transform: translateX(0); }

@media (min-width: 768px) {
  .sidebar { transform: translateX(0) !important; }
  .sidebar.collapsed { width: 72px; }
}

/* ── Decorative Backgrounds ── */
.sb-wave {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 160px;
  background: rgba(3, 105, 161, 0.18);
  clip-path: ellipse(140% 60% at 50% 100%);
  pointer-events: none;
  z-index: 0;
}

.sb-particles { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.particle {
  position: absolute;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--color-gold);
  opacity: 0.2;
  animation: particleDrift calc(3s + var(--i) * 0.7s) ease-in-out infinite;
  top:  calc(20% + var(--i) * 11%);
  left: calc(10% + var(--i) * 14%);
}

/* ── Header ──
   Uses the same navy as the sidebar body, unified with a gold accent border
   and a very subtle inner glow so the logo area feels part of the sidebar
   rather than a separate contrasting section.
── */
.sidebar-header {
  position: relative;
  z-index: 1;
  /* Navy base — same as sidebar, slightly lighter via transparency */
  background: rgba(12, 59, 94, 0.85);
  /* Gold bottom border ties it visually to the sidebar's right border */
  border-bottom: 2px solid rgba(244, 196, 0, 0.55);
  /* Soft top highlight so the area reads as "elevated" without being jarring */
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.06),
              0 4px 16px rgba(0, 0, 0, 0.18);
  padding: 0.75rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 66px;
  flex-shrink: 0;
  overflow: hidden;
}

/* Shimmer sweep — now very faint so it doesn't clash on navy */
.sidebar-header::after {
  content: '';
  position: absolute;
  top: 0; left: -60%;
  width: 40%; height: 100%;
  background: rgba(244, 196, 0, 0.05);
  transform: skewX(-15deg);
  animation: shimmer 5s ease-in-out infinite;
  pointer-events: none;
}

/* Subtle gold left accent strip — echoes the sidebar's gold border-right */
.sidebar-header::before {
  content: '';
  position: absolute;
  left: 0; top: 15%; bottom: 15%;
  width: 3px;
  background: linear-gradient(to bottom, transparent, var(--color-gold), transparent);
  border-radius: 0 2px 2px 0;
  opacity: 0.7;
}

.logo-container {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  width: 100%;
}

.logo-text {
  flex: 1;
  width: 100%;
}

.logo-image {
  display: block;
  width: 100%;
  height: 70px; /* adjust mo: 60px, 70px, 80px */
  object-fit: contain; /* use cover if gusto mo mapuno talaga */
  object-position: center;
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.35));
}
.sidebar.collapsed .logo-text { display: none; }

.header-close-btn {
  display: flex;
  width: 30px; height: 30px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--color-white);
  font-size: 0.8rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0; margin-left: 0.5rem;
}
.header-close-btn:hover {
  background: rgba(244, 196, 0, 0.18);
  border-color: rgba(244, 196, 0, 0.5);
}

/* Keep sidebar close control mobile-only even if utility classes fail to apply */
@media (min-width: 768px) {
  .header-close-btn {
    display: none !important;
  }
}

/* ── User Info ── */
.user-info {
  position: relative;
  z-index: 1;
  background: rgba(3, 105, 161, 0.35);
  border-bottom: 1px solid rgba(244, 196, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.9rem 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-shrink: 0;
  transition: background 0.2s;
}
.user-info:hover { background: rgba(3, 105, 161, 0.5); }

.user-avatar {
  position: relative;
  width: 2.7rem; height: 2.7rem;
  border-radius: 8px;
  background: var(--color-gold);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 1.05rem;
  color: var(--color-navy);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.user-info:hover .user-avatar { transform: scale(1.06); }

.avatar-initial { position: relative; z-index: 1; }

.avatar-ring {
  position: absolute;
  inset: -3px;
  border-radius: 10px;
  border: 2px solid var(--color-gold-dark);
  opacity: 0.6;
  animation: ringPulse 3s ease-in-out infinite;
}

.avatar-online-dot {
  position: absolute;
  bottom: -2px; right: -2px;
  width: 9px; height: 9px;
  border-radius: 50%;
  background: #4ade80;
  border: 2px solid var(--color-navy);
  z-index: 2;
  animation: dotBlink 2.5s ease-in-out infinite;
}

.user-details { min-width: 0; flex: 1; }
.user-name {
  font-size: 0.875rem; font-weight: 700;
  color: var(--color-white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  line-height: 1.2;
}
.user-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  padding: 0.15rem 0.55rem;
  background: rgba(244, 196, 0, 0.18);
  border: 1px solid rgba(244, 196, 0, 0.38);
  border-radius: 20px;
  font-size: 0.65rem; font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 0.3px;
  animation: badgePop 0.4s ease both;
}
.badge-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
  animation: dotBlink 2s ease-in-out infinite;
}

.sidebar.collapsed .user-details { display: none; }
.sidebar.collapsed .user-info    { justify-content: center; padding: 0.9rem 0; }

/* ── Nav Container ── */
.nav-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0.6rem;
  scrollbar-width: none;
  position: relative;
  z-index: 1;
}
.nav-container::-webkit-scrollbar { display: none; }

.nav-list { padding: 0; margin: 0; list-style: none; display: flex; flex-direction: column; gap: 2px; }
.nav-item { margin: 0; }
.nav-item-wrap { position: relative; }

/* ── Nav Links ── */
.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.68rem 0.85rem;
  color: rgba(255, 255, 255, 0.65) !important;
  text-decoration: none !important;
  font-size: 0.875rem; font-weight: 500;
  border: none;
  background: transparent;
  width: 100%;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  transition: background 0.18s ease, transform 0.15s ease, color 0.18s ease;
}
.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white) !important;
  transform: translateX(3px);
}
.nav-link:hover .nav-icon {
  color: var(--color-gold);
  transform: scale(1.2);
}
.nav-link:hover .nav-icon-glow {
  animation: iconGlow 0.6s ease forwards;
}

/* Active state */
.nav-link.active {
  background: rgba(12, 59, 94, 0.75);
  color: var(--color-white) !important;
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(12, 59, 94, 0.4);
}
.nav-link.active::after {
  content: '';
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 3px;
  background: var(--color-gold);
  border-radius: 0 3px 3px 0;
}
.nav-link.active .nav-icon      { color: var(--color-gold); }
.nav-link.active:hover           { transform: none; }
.nav-link.active:hover .nav-icon { transform: none; }

/* Collapsed center-align */
.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.7rem 0;
  transform: none !important;
}

/* ── Nav Icon ── */
.nav-icon-wrapper {
  width: 1.6rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.nav-icon {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.75);
  transition: color 0.18s, transform 0.2s;
  position: relative; z-index: 1;
}
.nav-icon-glow {
  position: absolute;
  width: 24px; height: 24px;
  border-radius: 50%;
  background: rgba(244, 196, 0, 0.3);
  opacity: 0; transform: scale(0.8);
  pointer-events: none;
}

.nav-text { color: var(--color-white); font-size: 0.875rem; flex: 1; }
.sidebar.collapsed .nav-text { opacity: 0; width: 0; overflow: hidden; visibility: hidden; }

/* ── Notification Badge ── */
.nav-badge {
  display: inline-flex;
  align-items: center; justify-content: center;
  min-width: 1.35rem; height: 1.15rem;
  padding: 0 0.28rem;
  background: #DC2626;
  color: var(--color-white);
  border-radius: 20px;
  font-size: 0.6rem; font-weight: 800;
  box-shadow: 0 0 8px rgba(220, 38, 38, 0.45);
  animation: badgePulse 2s ease-in-out infinite;
  flex-shrink: 0;
}
.sidebar.collapsed .nav-badge { display: none; }

/* ── Tooltip (collapsed mode) ── */
.nav-tooltip {
  display: none;
  position: absolute;
  left: 72px; top: 50%;
  transform: translateY(-50%);
  background: var(--color-navy);
  border: 1px solid var(--color-gold);
  color: var(--color-white);
  font-size: 12px; font-weight: 600;
  padding: 5px 12px;
  border-radius: 6px;
  white-space: nowrap;
  z-index: 999;
  pointer-events: none;
  box-shadow: 2px 2px 12px rgba(12, 59, 94, 0.3);
}
.nav-tooltip::before {
  content: '';
  position: absolute;
  left: -5px; top: 50%;
  transform: translateY(-50%);
  width: 0; height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 5px solid var(--color-gold);
}
.sidebar.collapsed .nav-item-wrap:hover .nav-tooltip { display: block; }

/* ── Dropdown ── */
.nav-dropdown { margin: 0; }

.dropdown-trigger {
  padding-left: 0.85rem;
}

.dropdown-trigger .nav-text {
  text-align: left;
}

.dropdown-arrow {
  margin-left: auto;
  flex-shrink: 0;
}
.dropdown-menu {
  list-style: none;
  padding: 0.25rem 0 0.25rem 0.4rem;
  margin: 3px 0 3px 0;
  background: rgba(3, 105, 161, 0.3);
  border-radius: 6px;
  border-left: 3px solid rgba(244, 196, 0, 0.45);
  overflow: hidden;
}

.dropdown-li { margin: 1px 0; }

.dropdown-item {
  padding: 0.55rem 0.75rem 0.55rem 1rem;
  font-size: 0.845rem;
  color: rgba(255, 255, 255, 0.7) !important;
  border-radius: 4px;
}
.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white) !important;
}
.dropdown-item.active {
  background: rgba(12, 59, 94, 0.75);
  color: var(--color-white) !important;
}

.sidebar.collapsed .dropdown-arrow,
.sidebar.collapsed .dropdown-menu { display: none; }

.dropdown-enter-active,
.dropdown-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.dropdown-enter-from   { opacity: 0; transform: translateY(-6px); }
.dropdown-leave-to     { opacity: 0; transform: translateY(-4px); }

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
  position: relative;
  z-index: 1;
}

.avatar-ring {
  position: absolute;
  inset: -3px;
  border-radius: 14px;
  border: 2px solid var(--color-gold-dark);
  opacity: 0.6;
  animation: ringPulse 3s ease-in-out infinite;
}

.avatar-online-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4ade80;
  border: 2px solid var(--color-navy);
  z-index: 2;
  animation: dotBlink 2.5s ease-in-out infinite;
}

/* ── Logout ── */
.logout-container {
  position: relative;
  z-index: 1;
  padding: 0.5rem 0.6rem 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}
.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.85rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.875rem; font-weight: 500;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  white-space: nowrap; overflow: hidden;
}
.logout-btn:hover {
  background: rgba(3, 105, 161, 0.35);
  border-color: var(--color-primary-light);
  color: var(--color-white);
}
.logout-btn .nav-icon       { color: rgba(255, 255, 255, 0.6); transition: color 0.18s; }
.logout-btn:hover .nav-icon { color: var(--color-gold); }

.sidebar.collapsed .logout-btn {
  justify-content: center;
  padding: 0.7rem 0;
}
.sidebar.collapsed .logout-btn .nav-text { opacity: 0; width: 0; overflow: hidden; visibility: hidden; }
</style>