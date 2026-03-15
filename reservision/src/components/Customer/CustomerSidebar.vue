<template>
  <div
    v-show="isOpen"
    class="overlay"
    :class="{ active: isOpen }"
    @click="emit('close')"
  ></div>

  <aside class="sidebar" :class="{ active: isOpen, collapsed: isCollapsed }">

    <!-- Decorative background wave -->
    <div class="sb-wave"></div>
    <div class="sb-particles">
      <span v-for="i in 6" :key="i" class="particle" :style="`--i:${i}`"></span>
    </div>

    <!-- ── Header ───────────────────────────────── -->
    <div class="sidebar-header">
      <div class="logo-container">
        <div class="brand-text">
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

    <!-- ── User Info ─────────────────────────────── -->
    <div class="user-info">
      <div class="user-avatar">
        <span class="avatar-initial">{{ userInitial }}</span>
        <span class="avatar-ring"></span>
        <span class="avatar-online-dot"></span>
      </div>
      <div class="user-details">
        <div class="user-name">{{ resolvedUserName }}</div>
        <div class="user-role-badge">
          <span class="badge-dot"></span>
          {{ resolvedUserRole }}
        </div>
      </div>
    </div>

    <!-- ── Navigation ────────────────────────────── -->
    <div class="nav-container">

      <ul class="nav-list">
        <li
          v-for="item in mainItems"
          :key="item.id"
          class="nav-item"
        >
          <a
            href="#"
            class="nav-link"
            :class="{ active: activeSection === item.id }"
            @click.prevent="handleSelect(item.id)"
          >
            <div class="nav-icon-wrapper">
              <i :class="['nav-icon', 'fas', item.icon]"></i>
              <span class="nav-icon-glow"></span>
            </div>
            <span class="nav-text">{{ item.label }}</span>
            <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          </a>
          <div class="nav-tooltip">{{ item.label }}</div>
        </li>
      </ul>

      <div class="nav-divider"></div>
      <div class="nav-section-label">Account</div>

      <ul class="nav-list">
        <li
          v-for="item in accountItems"
          :key="item.id"
          class="nav-item"
        >
          <a
            href="#"
            class="nav-link"
            :class="{ active: activeSection === item.id }"
            @click.prevent="handleSelect(item.id)"
          >
            <div class="nav-icon-wrapper">
              <i :class="['nav-icon', 'fas', item.icon]"></i>
              <span class="nav-icon-glow"></span>
            </div>
            <span class="nav-text">{{ item.label }}</span>
          </a>
          <div class="nav-tooltip">{{ item.label }}</div>
        </li>
      </ul>

    </div>

    <!-- ── Logout ────────────────────────────────── -->
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  items:         { type: Array,   default: () => [] },
  activeSection: { type: String,  default: 'dashboard' },
  brand:         { type: String,  default: 'Eduardo\'s Resort' },
  userName:      { type: String,  default: 'Customer' },
  userRole:      { type: String,  default: 'Customer' },
  isOpen:        { type: Boolean, default: false },
  isCollapsed:   { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'close'])
const router = useRouter()
const auth = useAuthStore()

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') }
  catch { return {} }
}

const resolvedUser = computed(() => auth.user || getStoredUser())

const resolvedUserName = computed(() => {
  const u = resolvedUser.value || {}
  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim()
  return fullName || u.name || props.userName || 'Guest'
})

const resolvedUserRole = computed(() => {
  const role = resolvedUser.value?.role
  const roleLabels = {
    admin: 'Admin',
    restaurantstaff: 'Restaurant Staff',
    restaurant_staff: 'Restaurant Staff',
    receptionist: 'Receptionist',
    customer: 'Customer'
  }
  return roleLabels[role] || props.userRole || 'Customer'
})

const userInitial = computed(() => (resolvedUserName.value?.charAt(0) || 'G').toUpperCase())

/* Split items into two groups for section labels */
const mainItems = computed(() =>
  props.items.filter(i => ['dashboard', 'book', 'reservations', 'esop', 'orders'].includes(i.id))
)
const accountItems = computed(() =>
  props.items.filter(i => ['profile', 'support'].includes(i.id))
)

const handleSelect = (sectionId) => {
  emit('select', sectionId)
  emit('close')
}

const handleLogout = () => {
  auth.logout()
  localStorage.clear()
  router.push('/login')
}

onMounted(() => { auth.initFromStorage() })
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

@keyframes dotBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

@keyframes particleDrift {
  0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.25; }
  50%  { transform: translateY(-18px) translateX(6px) scale(1.2); opacity: 0.1; }
  100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.25; }
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
  border-radius: 0 20px 20px 0;
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
  bottom: 0;
  left: 0;
  right: 0;
  height: 160px;
  background: rgba(3, 105, 161, 0.2);
  clip-path: ellipse(140% 60% at 50% 100%);
  pointer-events: none;
  z-index: 0;
}

.sb-particles { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-gold);
  opacity: 0.2;
  animation: particleDrift calc(3s + var(--i) * 0.7s) ease-in-out infinite;
  top:  calc(20% + var(--i) * 11%);
  left: calc(10% + var(--i) * 14%);
}

/* ── Header ── */
.sidebar-header {
  position: relative;
  z-index: 1;
  background: var(--color-primary-light);
  border-bottom: 2px solid rgba(244, 196, 0, 0.45);
  padding: 0.75rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 66px;
  flex-shrink: 0;
  overflow: hidden;
}

/* shimmer sweep */
.sidebar-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: -60%;
  width: 40%;
  height: 100%;
  background: rgba(255, 255, 255, 0.08);
  transform: skewX(-15deg);
  animation: shimmer 4s ease-in-out infinite;
  pointer-events: none;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.brand-text { min-width: 0; flex: 1; overflow: hidden; }
.logo-image {
  width: 100%;
  height: auto;
  display: block;
  max-height: 42px;
  object-fit: contain;
  object-position: left center;
}

.sidebar.collapsed .brand-text { display: none; }

.header-close-btn {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  color: var(--color-white);
  font-size: 0.8rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0; margin-left: 0.5rem;
}
.header-close-btn:hover { background: rgba(255,255,255,0.25); }

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
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 14px;
}
.user-info:hover .user-avatar { transform: scale(1.06); }

.avatar-initial { position: relative; z-index: 1; }

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

.user-details { min-width: 0; flex: 1; }
.user-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 0.3px;
  animation: badgePop 0.4s ease both;
}

.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
  animation: dotBlink 2s ease-in-out infinite;
}

.sidebar.collapsed .user-details { display: none; }
.sidebar.collapsed .user-info    { justify-content: center; padding: 0.9rem 0; }

/* ── Nav Section Labels ── */
.nav-section-label {
  padding: 10px 14px 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  white-space: nowrap;
  overflow: hidden;
}
.sidebar.collapsed .nav-section-label {
  height: 0; padding: 0; overflow: hidden;
}

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

.nav-list {
  padding: 0; margin: 0; list-style: none;
  display: flex; flex-direction: column; gap: 2px;
}
.nav-item { position: relative; }

/* ── Nav Links ── */
.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.68rem 0.85rem;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  background: transparent;
  width: 100%;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: background 0.18s ease, transform 0.15s ease, color 0.18s ease;
}

.nav-link::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: rgba(255,255,255,0);
  transition: background 0.18s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
  transform: translateX(3px);
}
.nav-link:hover .nav-icon {
  color: var(--color-gold);
  transform: scale(1.2);
}
.nav-link:hover .nav-icon-glow {
  animation: iconGlow 0.6s ease forwards;
}

.nav-link.active {
  background: rgba(12, 59, 94, 0.75);
  color: var(--color-white);
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(12, 59, 94, 0.4);
}
.nav-link.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  background: var(--color-gold);
  border-radius: 0 3px 3px 0;
}
.nav-link.active .nav-icon      { color: var(--color-gold); }
.nav-link.active:hover           { transform: none; }
.nav-link.active:hover .nav-icon { transform: none; }

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 0.7rem 0;
  transform: none !important;
}

/* ── Nav Icon ── */
.nav-icon-wrapper {
  width: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.nav-icon {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.75);
  transition: color 0.18s, transform 0.2s;
  position: relative;
  z-index: 1;
}

.nav-icon-glow {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(244, 196, 0, 0.3);
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
}

.nav-text { color: var(--color-white); font-size: 0.875rem; flex: 1; }

.sidebar.collapsed .nav-text { opacity: 0; width: 0; overflow: hidden; visibility: hidden; }

/* ── Nav Badge ── */
.nav-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 10px;
  background: var(--color-gold);
  color: var(--color-navy);
  flex-shrink: 0;
  animation: badgePop 0.4s ease both;
}
.sidebar.collapsed .nav-badge { display: none; }

/* ── Tooltip (collapsed mode) ── */
.nav-tooltip {
  display: none;
  position: absolute;
  left: 72px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-navy);
  border: 1px solid var(--color-gold);
  color: var(--color-white);
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 8px;
  white-space: nowrap;
  z-index: 999;
  pointer-events: none;
  box-shadow: 2px 2px 12px rgba(12,59,94,0.3);
}
.nav-tooltip::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 0; height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 5px solid var(--color-gold);
}
.sidebar.collapsed .nav-item:hover .nav-tooltip { display: block; }

/* ── Nav Divider ── */
.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 6px 8px;
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
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  white-space: nowrap;
  overflow: hidden;
}
.logout-btn:hover {
  background: rgba(220, 38, 38, 0.18);
  border-color: rgba(220, 38, 38, 0.4);
  color: var(--color-white);
}
.logout-btn .nav-icon       { color: rgba(255, 255, 255, 0.6); transition: color 0.18s; }
.logout-btn:hover .nav-icon { color: #fca5a5; }

.sidebar.collapsed .logout-btn      { justify-content: center; padding: 0.7rem 0; }
.sidebar.collapsed .logout-btn .nav-text { opacity: 0; width: 0; overflow: hidden; visibility: hidden; }
</style>