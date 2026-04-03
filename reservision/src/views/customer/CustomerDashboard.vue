<template>
  <div class="customer-layout">

    <!-- ── Sidebar ──────────────────────────────── -->
    <CustomerSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      :items="menuItems"
      :active-section="activeSection"
      brand="Eduardo's Resort"
      :user-name="customerName"
      user-role="Customer"
      @select="setActiveSection"
      @close="sidebarOpen = false"
    />

    <!-- ── Main content ──────────────────────────── -->
    <main class="main-content" :class="{ shifted: sidebarCollapsed }">

      <!-- ══ HEADER ════════════════════════════════ -->
      <header class="dashboard-header">
        <div class="header-left">
          <img src="/Eduardos Resort Logo.jpg" alt="Eduardo's Resort" class="mobile-logo" />
          <div class="header-title-block">
            <h1 class="header-title">{{ headerTitle }}</h1>
            <p class="header-subtitle">{{ headerSubtitle }}</p>
          </div>
        </div>

        <div class="header-right">
          <!-- Quick-nav pills (desktop only) -->
          <nav class="header-nav">
            <button
              v-for="item in menuItems"
              :key="item.id"
              class="header-nav-btn"
              :class="{ active: activeSection === item.id }"
              @click="setActiveSection(item.id)"
            >
              <i :class="['fas', item.icon]"></i>
              <span>{{ item.label }}</span>
            </button>
          </nav>

          <!-- Notification bell -->
          <button class="icon-btn notification-btn" title="Notifications">
            <i class="fas fa-bell"></i>
            <span class="notif-dot">{{ notificationCount }}</span>
          </button>

          <!-- Avatar -->
          <div class="header-avatar" :title="customerName">{{ customerInitial }}</div>
        </div>
      </header>

      <!-- ══ ERROR BANNER ═══════════════════════════ -->
      <transition name="banner-fade">
        <div v-if="loadError" class="error-banner">
          <i class="fas fa-exclamation-circle"></i>
          {{ loadError }}
        </div>
      </transition>

      <!-- ══ MOBILE BOTTOM NAV ══════════════════════ -->
      <nav class="mobile-bottom-nav">
        <button
          v-for="item in menuItems"
          :key="item.id"
          class="mob-nav-btn"
          :class="{ active: activeSection === item.id }"
          @click="setActiveSection(item.id)"
        >
          <div class="mob-nav-icon-wrap">
            <i :class="['fas', item.icon]"></i>
          </div>
          <span class="mob-nav-label">{{ item.label.split(' ')[0] }}</span>
        </button>
      </nav>

      <!-- ══ SECTION CONTENT ════════════════════════ -->
      <div class="section-area">

        <div v-show="activeSection === 'book'" class="full-bleed-section">
          <ReservationSection @view-reservations="setActiveSection('reservations')" />
        </div>

        <div v-show="activeSection === 'dashboard'" class="inner-section">
          <CustomerDashboardSection
            :summary-cards="summaryCards"
            :recent-activity="recentActivity"
            :recommended-rooms="recommendedRooms"
            :customer-name="customerName"
          />
        </div>

        <div v-show="activeSection === 'reservations'" class="inner-section">
          <CustomerReservationsSection ref="reservationsRef" :reservations="reservations" />
        </div>

        <div v-show="activeSection === 'esop'" class="inner-section">
          <CustomerEsop />
        </div>

        <div v-show="activeSection === 'orders'" class="inner-section">
          <OrderHistory ref="ordersRef" :show-header="false" @close="() => {}" />
        </div>

        <div v-show="activeSection === 'profile'" class="inner-section">
          <CustomerProfileSection :profile="profile" @profile-updated="onProfileUpdated" />
        </div>

        <div v-show="activeSection === 'support'" class="inner-section">
          <CustomerSupportSection />
        </div>

      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import CustomerSidebar from '../../components/Customer/CustomerSidebar.vue'
import CustomerDashboardSection from '../../components/Customer/CustomerDashboardSection.vue'
import ReservationSection from '../../components/Customer/ReservationSection.vue'
import CustomerReservationsSection from '../../components/Customer/CustomerReservationsSection.vue'
import CustomerProfileSection from '../../components/Customer/CustomerProfileSection.vue'
import CustomerSupportSection from '../../components/Customer/CustomerSupportSection.vue'
import CustomerEsop from '../../components/Customer/ResortEShop.vue'
import OrderHistory from '../../components/Customer/OrderHistory.vue'

const apiBase = 'http://localhost:8000/api'
const auth    = useAuthStore()
const route   = useRoute()
const apiRoot = (import.meta.env.VITE_API_URL || apiBase).replace(/\/api\/?$/, '')
const roomFallbackImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60'

const activeSection    = ref('dashboard')
const reservationsRef  = ref(null)
const ordersRef        = ref(null)
const sidebarOpen      = ref(false)
const sidebarCollapsed = ref(false)

const summaryCards     = ref([])
const recentActivity   = ref([])
const recommendedRooms = ref([])
const bookRooms        = ref([])
const reservations     = ref([])
const isLoading        = ref(false)
const loadError        = ref('')

const profile = ref({
  fullName: 'Guest', email: '', phone: '',
  address: '', city: '', country: '',
  postalCode: '', profileImage: '',
})

watch(activeSection, (s) => {
  if (s === 'reservations' && reservationsRef.value) reservationsRef.value.fetchBookingHistory()
  if (s === 'orders' && ordersRef.value)             ordersRef.value.fetchOrders()
})

const menuItems = [
  { id: 'dashboard',    label: 'Dashboard',       icon: 'fa-home' },
  { id: 'book',         label: 'Book a Room',     icon: 'fa-bed' },
  { id: 'reservations', label: 'My Reservations', icon: 'fa-calendar-alt' },
  { id: 'esop',         label: 'Resort E-Shop',   icon: 'fa-shopping-cart' },
  { id: 'orders',       label: 'My Orders',       icon: 'fa-receipt' },
  { id: 'profile',      label: 'Profile',         icon: 'fa-user' },
]

const customerName    = computed(() => auth.user?.name || 'Guest')
const customerEmail   = computed(() => {
  const fromAuth = auth.user?.email || auth.user?.Email || ''
  if (fromAuth) return String(fromAuth)
  try {
    const stored = JSON.parse(localStorage.getItem('user') || '{}')
    return String(stored?.email || stored?.Email || '').trim()
  } catch { return '' }
})
const customerInitial = computed(() => (customerName.value?.charAt(0) || 'G').toUpperCase())

const headerTitle = computed(() => ({
  dashboard:    'Customer Dashboard',
  book:         'Book a Room',
  reservations: 'My Reservations',
  esop:         'Resort E-Shop',
  orders:       'My Orders',
  profile:      'Profile Settings',
  support:      'Support & Help',
}[activeSection.value] || 'Customer Dashboard'))

const headerSubtitle = computed(() => {
  if (activeSection.value === 'dashboard') return `Welcome back, ${customerName.value}`
  return ({
    book:         'Find and book your perfect stay',
    reservations: 'View and manage your bookings',
    esop:         'Shop resort merchandise and amenities',
    orders:       'View your order history',
    profile:      'Manage your account information',
    support:      'Get help and submit requests',
  }[activeSection.value] || '')
})

const notificationCount = computed(() => (activeSection.value === 'book' ? 1 : 2))
const setActiveSection  = (id) => { activeSection.value = id }

const onProfileUpdated = (updated) => {
  profile.value = { ...profile.value, ...updated }
  const currentStored = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } })()
  const nextUser = {
    ...currentStored, ...(auth.user || {}),
    firstName: updated.firstName ?? auth.user?.firstName ?? currentStored.firstName ?? '',
    lastName: updated.lastName ?? auth.user?.lastName ?? currentStored.lastName ?? '',
    name: updated.fullName ?? auth.user?.name ?? currentStored.name ?? '',
    email: updated.email ?? auth.user?.email ?? currentStored.email ?? '',
    phone: updated.phone ?? auth.user?.phone ?? currentStored.phone ?? '',
    role: auth.user?.role ?? currentStored.role ?? 'customer',
    profileImage: updated.profileImage ?? auth.user?.profileImage ?? currentStored.profileImage ?? '',
  }
  localStorage.setItem('user', JSON.stringify(nextUser))
  auth.setUser(nextUser)
}

const formatDate = (v) => {
  if (!v) return ''
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
const toStatusLabel = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return 'Pending'
  return raw.replace(/_/g,' ').replace(/-/g,' ').replace(/\s+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
}
const statusClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s.includes('checked') || s.includes('complete') || s.includes('confirm')) return 'text-green-700 font-semibold'
  if (s.includes('pending')) return 'text-yellow-600 font-semibold'
  if (s.includes('cancel'))  return 'text-red-600 font-semibold'
  return 'text-blue-600 font-semibold'
}
const buildActivityText = (booking) => {
  const items   = String(booking?.items_summary || '').trim() || 'Booking created'
  const ref     = booking?.booking_reference ? `Ref ${booking.booking_reference}` : null
  const range   = booking?.check_in_date ? `${formatDate(booking.check_in_date)}${booking?.check_out_date ? ` to ${formatDate(booking.check_out_date)}` : ''}` : null
  const payment = booking?.payment_status ? `Payment: ${toStatusLabel(booking.payment_status)}` : null
  return [items, ref, range, payment].filter(Boolean).join(' • ')
}
const applySectionFromRouteQuery = (query = {}) => {
  const raw = String(query.activeSection || query.section || query.ActiveSection || '').trim().toLowerCase()
  if (!raw) return
  if (menuItems.some(item => item.id === raw)) activeSection.value = raw
}
const parseImages = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  try { const p = JSON.parse(value); return Array.isArray(p) ? p : [] } catch { return [] }
}
const resolveRoomImageUrl = (rawPath) => {
  if (!rawPath) return roomFallbackImage
  const path = String(rawPath).trim()
  if (!path) return roomFallbackImage
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) return path
  if (path.startsWith('//')) return `${window.location.protocol}${path}`
  if (path.startsWith('/')) return `${apiRoot}${path}`
  return `${apiRoot}/${path.replace(/^\.?\//, '')}`
}
const buildSummaryCards = (bookings) => {
  const now = new Date()
  const upcoming = bookings.find(b => new Date(b.check_in_date) > now)
  const nights = upcoming ? Math.max(1, Math.round((new Date(upcoming.check_out_date) - new Date(upcoming.check_in_date)) / 86400000)) : 0
  summaryCards.value = [
    { title: 'Upcoming Stay',   value: `${nights} Nights`,      tone: 'blue' },
    { title: 'Total Bookings',  value: String(bookings.length), tone: 'green' },
    { title: 'Loyalty Points',  value: String(bookings.length * 50), tone: 'orange' },
    { title: 'Unread Messages', value: '0',                      tone: 'yellow' },
  ]
}

const fetchBookings = async () => {
  const userId = auth.user?.id || auth.user?.user_id || null
  let email = customerEmail.value
  if (!userId && !email) return []
  const endpoint = userId
    ? `${apiBase}/bookings/user/${encodeURIComponent(userId)}/history`
    : `${apiBase}/bookings/email/${encodeURIComponent(email)}/history`
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error('Failed to load bookings')
  const payload = await res.json()
  if (!payload?.success) throw new Error(payload?.error || 'Failed to load bookings')
  const bookings = payload?.data?.bookings
  return Array.isArray(bookings) ? bookings : []
}
const fetchRooms = async () => {
  const res = await fetch(`${apiBase}/rooms`)
  if (!res.ok) throw new Error('Failed to load rooms')
  const rooms = await res.json()
  return Array.isArray(rooms) ? rooms : []
}
const fetchCustomerProfile = async () => {
  if (!customerEmail.value) return null
  const res = await fetch(`${apiBase}/customers/profile/${encodeURIComponent(customerEmail.value)}`)
  if (!res.ok) return null
  const payload = await res.json()
  return payload.customer || null
}
const loadDashboardData = async () => {
  isLoading.value = true; loadError.value = ''
  try {
    const [bookings, rooms, customerProfile] = await Promise.all([fetchBookings(), fetchRooms(), fetchCustomerProfile()])
    buildSummaryCards(bookings)
    recentActivity.value = bookings.slice(0, 5).map(b => ({
      date: formatDate(b.created_at || b.check_in_date),
      activity: buildActivityText(b), status: toStatusLabel(b.booking_status), statusClass: statusClass(b.booking_status),
    }))
    reservations.value = bookings.map(b => ({
      roomType: b.items_summary || 'Room Booking', checkIn: formatDate(b.check_in_date),
      checkOut: formatDate(b.check_out_date), status: b.booking_status || 'Pending', statusClass: statusClass(b.booking_status),
    }))
    const available = rooms.filter(r => String(r.status || '').toLowerCase() === 'available')
    const mapped = available.slice(0, 6).map(room => {
      const images = parseImages(room.images)
      const primaryIndex = Number.isInteger(Number(room.primaryImageIndex)) ? Number(room.primaryImageIndex) : 0
      const selectedImage = images[primaryIndex] || images[0] || ''
      return { title: room.name, price: `PHP ${Number(room.price || 0).toLocaleString()} / night`, imageUrl: resolveRoomImageUrl(selectedImage), roomId: room.item_id ?? room.id ?? null }
    })
    recommendedRooms.value = mapped.slice(0, 3); bookRooms.value = mapped
    profile.value = customerProfile
      ? {
          fullName: `${customerProfile.firstName || ''} ${customerProfile.lastName || ''}`.trim() || customerName.value,
          email: customerProfile.email || customerEmail.value, phone: customerProfile.phone || '',
          address: customerProfile.address || '', city: customerProfile.city || '',
          country: customerProfile.country || '', postalCode: customerProfile.postalCode || '',
          profileImage: customerProfile.profileImage || '', firstName: customerProfile.firstName || '', lastName: customerProfile.lastName || '',
        }
      : { fullName: customerName.value, email: customerEmail.value, phone: '', address: '', city: '', country: '', postalCode: '', profileImage: '' }
  } catch (err) {
    loadError.value = err?.message || 'Failed to load dashboard data'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { applySectionFromRouteQuery(route.query); loadDashboardData() })
watch(() => route.query, (query) => { applySectionFromRouteQuery(query) })
</script>

<style scoped>
:root {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-gold:          #F4C400;
  --color-navy:          #0C3B5E;
  --color-navy-dark:     #082B45;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Root layout ─────────────────────────────────────────────── */
.customer-layout { min-height: 100vh; background: #f0f4f9; display: flex; }

/* ── Main content ────────────────────────────────────────────── */
.main-content {
  flex: 1; min-width: 0; min-height: 100vh;
  display: flex; flex-direction: column; background: #f0f4f9;
  margin-left: 262px;
  transition: margin-left .3s cubic-bezier(.4,0,.2,1);
}
.main-content.shifted { margin-left: 72px; }

@media (max-width: 767px) { .main-content { margin-left: 0 !important; } }

/* ── Dashboard Header ────────────────────────────────────────── */
.dashboard-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: 0 1.5rem; height: 68px;
  background: linear-gradient(135deg, #0C3B5E 0%, #082B45 100%);
  border-bottom: 2px solid rgba(244,196,0,0.2);
  box-shadow: 0 4px 20px rgba(12,59,94,0.28);
  position: sticky; top: 0; z-index: 40; flex-shrink: 0;
}

/* Left */
.header-left { display: flex; align-items: center; gap: 0.9rem; min-width: 0; }

/* Mobile logo — replaces hamburger on small screens */
.mobile-logo {
  display: none; width: 42px; height: 42px;
  border-radius: 50%; object-fit: contain;
  background: #fff; padding: 2px;
  border: 2px solid rgba(244,196,0,0.5);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
@media (max-width: 767px) { .mobile-logo { display: block; } }

.header-title-block { min-width: 0; }
.header-title {
  font-size: 1rem; font-weight: 800; color: #fff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;
}
.header-subtitle {
  font-size: 0.7rem; color: rgba(255,255,255,0.55);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;
}

/* Right */
.header-right { display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0; }

.header-nav {
  display: none; align-items: center; gap: 2px;
  background: rgba(255,255,255,0.06); padding: 3px; border-radius: 50px;
}
@media (min-width: 1200px) { .header-nav { display: flex; } }

.header-nav-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.35rem 0.75rem; border: none; border-radius: 50px;
  background: transparent; color: rgba(255,255,255,0.65);
  font-family: inherit; font-size: 0.72rem; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: all .18s;
}
.header-nav-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
.header-nav-btn.active { background: #F4C400; color: #0C3B5E; }

.icon-btn {
  position: relative; width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
  color: #fff; font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background .18s;
}
.icon-btn:hover { background: rgba(255,255,255,0.18); }

.notif-dot {
  position: absolute; top: -2px; right: -1px;
  min-width: 17px; height: 17px; padding: 0 4px; border-radius: 999px;
  background: #F4C400; color: #0C3B5E; border: 2px solid #0C3B5E;
  font-size: 0.58rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center; line-height: 1;
}

.header-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, #F4C400, #e6b800);
  color: #0C3B5E; font-size: 0.9rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  cursor: default; flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(244,196,0,0.3);
  transition: transform .18s;
}
.header-avatar:hover { transform: scale(1.08); }

/* ── Error Banner ────────────────────────────────────────────── */
.error-banner {
  display: flex; align-items: center; gap: .5rem;
  margin: .75rem 1.5rem 0; padding: .65rem 1rem;
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 10px; font-size: .83rem; color: #991b1b;
}
.banner-fade-enter-active,.banner-fade-leave-active { transition: opacity .25s; }
.banner-fade-enter-from,.banner-fade-leave-to { opacity: 0; }

/* ── Mobile Bottom Nav ───────────────────────────────────────── */
.mobile-bottom-nav {
  display: none; /* hidden on desktop */
}

@media (max-width: 767px) {
  .mobile-bottom-nav {
    display: flex;
    position: fixed; bottom: 0; left: 0; right: 0;
    background: linear-gradient(135deg, #0C3B5E 0%, #082B45 100%);
    border-top: 1px solid rgba(244,196,0,0.2);
    z-index: 38;
    padding: 0 4px;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    box-shadow: 0 -4px 20px rgba(12,59,94,0.32);
  }
}

.mob-nav-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px; padding: 10px 4px 8px;
  background: none; border: none; cursor: pointer;
  transition: all .2s; color: rgba(255,255,255,0.45);
  min-height: 56px; position: relative;
}

.mob-nav-btn::before {
  content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 0; height: 2px; background: #F4C400;
  border-radius: 0 0 2px 2px; transition: width .2s ease;
}

.mob-nav-btn.active { color: #F4C400; }
.mob-nav-btn.active::before { width: 28px; }

.mob-nav-icon-wrap {
  width: 32px; height: 32px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s;
}
.mob-nav-btn.active .mob-nav-icon-wrap {
  background: rgba(244,196,0,0.12);
}

.mob-nav-btn i { font-size: 1rem; }
.mob-nav-label { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.2px; white-space: nowrap; }

/* ── Section area ────────────────────────────────────────────── */
.section-area { flex: 1; display: flex; flex-direction: column; }

.full-bleed-section { flex: 1; }

.inner-section { flex: 1; padding: 1rem 1rem; }

/* ── Mobile layout overrides ─────────────────────────────────── */
@media (max-width: 767px) {
  .dashboard-header { padding: 0 14px; height: 62px; }
  .header-title     { font-size: 0.92rem; }
  .header-subtitle  { font-size: 0.67rem; }

  .inner-section {
    padding: 5px 3px;
    /* Add bottom padding so content doesn't hide under bottom nav */
    padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  }
}

@media (max-width: 400px) {
  .header-title   { font-size: 0.86rem; z-index: 40;}
  .mob-nav-label  { display: none; }
  .mob-nav-btn    { padding: 14px 4px; }
  .mob-nav-icon-wrap { width: 36px; height: 36px; }
  .mob-nav-btn i  { font-size: 1.1rem; }
}
</style>