<template>
  <!-- Overlay -->
  <div
    v-show="isOpen"
    class="overlay"
    :class="{ active: isOpen }"
    @click="emit('close')"
  ></div>

  <aside class="sidebar" :class="{ active: isOpen, collapsed: isCollapsed }">

    <!-- Decorative layer -->
    <div class="sb-wave"></div>
    <div class="sb-particles">
      <span v-for="i in 6" :key="i" class="particle" :style="`--i:${i}`"></span>
    </div>

    <!-- ── Header ─────────────────────────────────── -->
    <div class="sidebar-header">
      <div class="logo-container">
        <div class="brand-text">
          <img src="/Eduardos Resort Logo.jpg" alt="Eduardo's Resort" class="logo-image" />
        </div>
      </div>
      <button class="md:hidden header-close-btn" @click="emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- ── User Info ──────────────────────────────── -->
    <div class="user-info">
      <div class="user-avatar">
        <img v-if="userAvatarSrc" :src="userAvatarSrc" alt="Profile" class="avatar-image" />
        <span v-else class="avatar-initial">{{ userInitial }}</span>
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

    <!-- ── Navigation ─────────────────────────────── -->
    <div class="nav-container">
      <div class="nav-section-label">Menu</div>
      <ul class="nav-list">
        <li v-for="item in mainItems" :key="item.id" class="nav-item">
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
            <i v-if="activeSection === item.id" class="fas fa-chevron-right nav-active-chevron"></i>
          </a>
          <div class="nav-tooltip">{{ item.label }}</div>
        </li>
      </ul>

      <div class="nav-divider"></div>
      <div class="nav-section-label">Account</div>

      <ul class="nav-list">
        <li v-for="item in accountItems" :key="item.id" class="nav-item">
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
            <i v-if="activeSection === item.id" class="fas fa-chevron-right nav-active-chevron"></i>
          </a>
          <div class="nav-tooltip">{{ item.label }}</div>
        </li>
      </ul>
    </div>

    <!-- ── Logout ──────────────────────────────────── -->
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
import { computed, onMounted, ref } from 'vue'
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
const configuredApiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '')
const apiBase = /\/api$/i.test(configuredApiBase) ? configuredApiBase : `${configuredApiBase}/api`
const apiRoot = apiBase.replace(/\/api\/?$/, '')
const fetchedProfileImage = ref('')

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
}

const resolvedUser = computed(() => {
  const fromStore = auth.user || {}
  const fromStorage = getStoredUser()
  return {
    ...fromStorage, ...fromStore,
    profileImage: fromStore.profileImage || fromStore.profile_image || fromStorage.profileImage || fromStorage.profile_image || '',
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

const resolvedUserName = computed(() => {
  const u = resolvedUser.value || {}
  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim()
  return fullName || u.name || props.userName || 'Guest'
})

const resolvedUserRole = computed(() => {
  const role = resolvedUser.value?.role
  const roleLabels = { admin: 'Admin', restaurantstaff: 'Restaurant Staff', restaurant_staff: 'Restaurant Staff', receptionist: 'Receptionist', customer: 'Customer' }
  return roleLabels[role] || props.userRole || 'Customer'
})

const userAvatarSrc = computed(() => {
  const u = resolvedUser.value || {}
  const candidate = fetchedProfileImage.value || u.profileImage || u.profile_image || ''
  return resolveProfileImageUrl(candidate)
})

const userInitial = computed(() => (resolvedUserName.value?.charAt(0) || 'G').toUpperCase())

const mainItems    = computed(() => props.items.filter(i => ['dashboard', 'book', 'reservations', 'esop', 'orders'].includes(i.id)))
const accountItems = computed(() => props.items.filter(i => ['profile', 'support'].includes(i.id)))

const handleSelect = (sectionId) => { emit('select', sectionId); emit('close') }

const handleLogout = () => { auth.logout(); localStorage.clear(); router.push('/login') }

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
    const mergedUser = { ...currentStored, ...(auth.user || {}), profileImage: latestProfileImage, profile_image: latestProfileImage }
    localStorage.setItem('user', JSON.stringify(mergedUser))
    auth.setUser(mergedUser)
  } catch {}
}

onMounted(async () => { auth.initFromStorage(); await fetchProfileImageById() })
</script>

<style scoped>
.overlay, .sidebar {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-gold:          #F4C400;
  --color-navy:          #0C3B5E;
  --color-navy-dark:     #082B45;
}

/* ── Keyframes ── */
@keyframes ringPulse   { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:.95;transform:scale(1.07)} }
@keyframes shimmer     { 0%{left:-60%} 100%{left:110%} }
@keyframes badgePop    { 0%{transform:scale(.7);opacity:0} 70%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
@keyframes dotBlink    { 0%,100%{opacity:1} 50%{opacity:.3} }
@keyframes particleDrift { 0%,100%{transform:translateY(0) scale(1);opacity:.25} 50%{transform:translateY(-18px) scale(1.2);opacity:.1} }

/* ── Overlay ── */
.overlay {
  position: fixed; inset: 0;
  background: rgba(7, 30, 47, 0.7);
  backdrop-filter: blur(6px);
  z-index: 39; opacity: 0; visibility: hidden;
  transition: opacity .28s ease, visibility .28s ease;
}
.overlay.active { opacity: 1; visibility: visible; }

/* ── Sidebar Shell ── */
.sidebar {
  position: fixed; top: 0; left: 0;
  width: 280px; height: 100vh;
  background: var(--color-navy);
  color: #fff;
  z-index: 50; overflow: hidden;
  border-right: 2px solid rgba(244,196,0,0.3);
  border-radius: 0 24px 24px 0;
  box-shadow: 6px 0 40px rgba(7,30,47,0.6);
  transition: transform .32s cubic-bezier(.4,0,.2,1), width .3s ease;
  transform: translateX(-100%);
  display: flex; flex-direction: column;
}
.sidebar.active { transform: translateX(0); }

@media (min-width: 768px) {
  .sidebar { transform: translateX(0) !important; width: 262px; }
  .sidebar.collapsed { width: 72px; }
}

/* ── Decorative Backgrounds ── */
.sb-wave {
  position: absolute; bottom: 0; left: 0; right: 0; height: 200px;
  background: radial-gradient(ellipse at bottom, rgba(3,105,161,0.25) 0%, transparent 70%);
  pointer-events: none; z-index: 0;
}

.sb-particles { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.particle {
  position: absolute; width: 3px; height: 3px; border-radius: 50%;
  background: var(--color-gold); opacity: 0.18;
  animation: particleDrift calc(4s + var(--i) * 0.8s) ease-in-out infinite;
  top: calc(15% + var(--i) * 12%); left: calc(8% + var(--i) * 15%);
}

/* ── Header ── */
.sidebar-header {
  position: relative; z-index: 1;
  background: linear-gradient(135deg, var(--color-primary) 0%, #02568a 100%);
  border-bottom: 2px solid rgba(244,196,0,0.35);
  padding: 0.85rem 1.1rem;
  display: flex; align-items: center; justify-content: space-between;
  min-height: 68px; flex-shrink: 0; overflow: hidden;
}
.sidebar-header::after {
  content: ''; position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
  background: rgba(255,255,255,0.07); transform: skewX(-15deg);
  animation: shimmer 4s ease-in-out infinite; pointer-events: none;
}
.logo-container { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.brand-text     { min-width: 0; flex: 1; overflow: hidden; }
.logo-image     { width: 100%; height: auto; max-height: 42px; object-fit: contain; object-position: left center; display: block; }
.sidebar.collapsed .brand-text { display: none; }

.header-close-btn {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 0.78rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s; flex-shrink: 0; margin-left: .5rem;
}
.header-close-btn:hover { background: rgba(255,255,255,0.25); }

/* ── User Info ── */
.user-info {
  position: relative; z-index: 1;
  background: rgba(3,105,161,0.2);
  border-bottom: 1px solid rgba(244,196,0,0.15);
  padding: 1rem 1.1rem;
  display: flex; align-items: center; gap: 0.85rem;
  flex-shrink: 0; transition: background .2s;
}
.user-info:hover { background: rgba(3,105,161,0.35); }

.user-avatar {
  position: relative; width: 44px; height: 44px; border-radius: 14px;
  background: linear-gradient(135deg, var(--color-primary), #02568a);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: transform .2s;
}
.user-info:hover .user-avatar { transform: scale(1.05); }

.avatar-initial {
  font-size: 1.1rem; font-weight: 800; color: #fff;
  position: relative; z-index: 1;
}
.avatar-image {
  width: 100%; height: 100%; object-fit: cover;
  border-radius: 14px; position: relative; z-index: 1;
}
.avatar-ring {
  position: absolute; inset: -3px; border-radius: 16px;
  border: 2px solid var(--color-gold);
  opacity: 0.55; animation: ringPulse 3s ease-in-out infinite;
}
.avatar-online-dot {
  position: absolute; bottom: -2px; right: -2px;
  width: 10px; height: 10px; border-radius: 50%;
  background: #4ade80; border: 2px solid var(--color-navy-deep);
  z-index: 2; animation: dotBlink 2.5s ease-in-out infinite;
}

.user-details { min-width: 0; flex: 1; }
.user-name {
  font-size: 0.9rem; font-weight: 700; color: #fff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;
}
.user-role-badge {
  display: inline-flex; align-items: center; gap: 5px;
  margin-top: 4px; padding: 0.18rem 0.6rem;
  background: rgba(244,196,0,0.15); border: 1px solid rgba(244,196,0,0.3);
  border-radius: 20px; font-size: 0.64rem; font-weight: 700;
  color: var(--color-gold); letter-spacing: 0.3px;
  animation: badgePop .4s ease both;
}
.badge-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #4ade80; flex-shrink: 0; animation: dotBlink 2s ease-in-out infinite;
}

.sidebar.collapsed .user-details { display: none; }
.sidebar.collapsed .user-info    { justify-content: center; padding: 0.9rem 0; }

/* ── Nav ── */
.nav-section-label {
  padding: 12px 16px 5px;
  font-size: 9px; font-weight: 700; letter-spacing: 1.4px;
  text-transform: uppercase; color: rgba(255,255,255,0.28);
}
.sidebar.collapsed .nav-section-label { height: 0; padding: 0; overflow: hidden; }

.nav-container {
  flex: 1; overflow-y: auto; padding: 0.5rem 0.7rem;
  scrollbar-width: none; position: relative; z-index: 1;
}
.nav-container::-webkit-scrollbar { display: none; }

.nav-list { padding: 0; margin: 0; list-style: none; display: flex; flex-direction: column; gap: 2px; }
.nav-item  { position: relative; }

/* ── Nav Links ── */
.nav-link {
  position: relative; display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  color: rgba(255,255,255,0.6); text-decoration: none;
  font-size: 0.875rem; font-weight: 500;
  border: none; background: transparent; width: 100%;
  white-space: nowrap; cursor: pointer; border-radius: 14px;
  overflow: hidden; transition: all .18s ease;
}
.nav-link:hover { background: rgba(255,255,255,0.08); color: #fff; transform: translateX(2px); }
.nav-link:hover .nav-icon { color: var(--color-gold); transform: scale(1.15); }

.nav-link.active {
  background: linear-gradient(135deg, rgba(182, 183, 183, 0.55) 0%, rgba(3,105,161,0.3) 100%);
  color: #fff; font-weight: 600;
  border: 1px solid rgba(244,196,0,0.2);
  box-shadow: 0 2px 12px rgba(3,105,161,0.25), inset 0 1px 0 rgba(255,255,255,0.05);
}
.nav-link.active::before {
  content: ''; position: absolute; left: 0; top: 25%; bottom: 25%;
  width: 3px; background: var(--color-gold);
  border-radius: 0 3px 3px 0;
}
.nav-link.active .nav-icon { color: var(--color-gold); }

.sidebar.collapsed .nav-link { justify-content: center; padding: 0.75rem 0; transform: none !important; }

/* ── Nav Icon ── */
.nav-icon-wrapper {
  width: 1.7rem; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; position: relative;
}
.nav-icon {
  font-size: 0.88rem; color: rgba(255,255,255,0.7);
  transition: color .18s, transform .2s; position: relative; z-index: 1;
}
.nav-icon-glow {
  position: absolute; width: 24px; height: 24px; border-radius: 50%;
  background: rgba(244,196,0,0.25); opacity: 0; transform: scale(0.8); pointer-events: none;
}
.nav-text { color: #fff; font-size: 0.875rem; flex: 1; }
.sidebar.collapsed .nav-text { opacity: 0; width: 0; overflow: hidden; visibility: hidden; }

.nav-active-chevron {
  font-size: 0.6rem; color: var(--color-gold); opacity: 0.7; flex-shrink: 0;
}
.sidebar.collapsed .nav-active-chevron { display: none; }

.nav-badge {
  font-size: 10px; font-weight: 700; padding: 1px 7px;
  border-radius: 10px; background: var(--color-gold); color: var(--color-navy);
  flex-shrink: 0; animation: badgePop .4s ease both;
}
.sidebar.collapsed .nav-badge { display: none; }

/* Tooltip */
.nav-tooltip {
  display: none; position: absolute; left: 72px; top: 50%; transform: translateY(-50%);
  background: var(--color-navy); border: 1px solid var(--color-gold);
  color: #fff; font-size: 12px; font-weight: 600; padding: 5px 12px;
  border-radius: 8px; white-space: nowrap; z-index: 999; pointer-events: none;
  box-shadow: 2px 2px 12px rgba(12,59,94,0.3);
}
.nav-tooltip::before {
  content: ''; position: absolute; left: -5px; top: 50%; transform: translateY(-50%);
  border-top: 5px solid transparent; border-bottom: 5px solid transparent;
  border-right: 5px solid var(--color-gold);
}
.sidebar.collapsed .nav-item:hover .nav-tooltip { display: block; }

.nav-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 8px 10px; }

/* ── Logout ── */
.logout-container {
  position: relative; z-index: 1;
  padding: 0.6rem 0.7rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;
}
.logout-btn {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.7rem 0.9rem; width: 100%;
  background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2);
  border-radius: 14px; color: rgba(255,255,255,0.65);
  font-size: 0.875rem; font-weight: 500; cursor: pointer;
  transition: all .18s ease; white-space: nowrap; overflow: hidden;
}
.logout-btn:hover { background: rgba(220,38,38,0.2); border-color: rgba(220,38,38,0.4); color: #fff; }
.logout-btn .nav-icon { color: rgba(255,255,255,0.55); transition: color .18s; }
.logout-btn:hover .nav-icon { color: #fca5a5; }

.sidebar.collapsed .logout-btn { justify-content: center; padding: 0.75rem 0; }
.sidebar.collapsed .logout-btn .nav-text { opacity: 0; width: 0; overflow: hidden; visibility: hidden; }

/* ── Mobile: hide sidebar entirely (≤767px) ── */
@media (max-width: 767px) {
  .sidebar { display: none !important; }
  .overlay { display: none !important; }
}

/* ── Mobile overrides (≤640px) ── */
@media (max-width: 640px) {
  .sidebar { width: 82vw; max-width: 300px; border-radius: 0 28px 28px 0; }

  .sidebar-header { padding: 1rem 1.2rem; min-height: 72px; }

  .user-info { padding: 1.1rem 1.2rem; }

  .user-avatar { width: 48px; height: 48px; border-radius: 16px; }
  .avatar-initial { font-size: 1.2rem; }

  .user-name { font-size: 0.95rem; }

  .nav-link {
    padding: 0.85rem 1rem;
    border-radius: 16px;
    font-size: 0.92rem;
    min-height: 52px; /* touch target */
  }

  .nav-icon { font-size: 0.95rem; }
  .nav-icon-wrapper { width: 1.8rem; }

  .logout-btn { padding: 0.85rem 1rem; border-radius: 16px; min-height: 52px; }

  .nav-section-label { padding: 14px 18px 6px; }

  .nav-container { padding: 0.4rem 0.75rem; }
}
</style>