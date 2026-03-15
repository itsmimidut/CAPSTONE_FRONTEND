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
          <!-- Hamburger (mobile) -->
          <button class="hamburger-btn" @click="sidebarOpen = !sidebarOpen">
            <i class="fas fa-bars"></i>
          </button>

          <!-- Title block -->
          <div class="header-title-block">
            <h1 class="header-title">{{ headerTitle }}</h1>
            <p class="header-subtitle">{{ headerSubtitle }}</p>
          </div>
        </div>

        <div class="header-right">
          <!-- Section quick-nav pills (desktop) -->
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
            <span class="notif-dot"></span>
          </button>

          <!-- Avatar -->
          <div class="header-avatar" :title="customerName">
            {{ customerInitial }}
          </div>
        </div>
      </header>

      <!-- ══ ERROR BANNER ═══════════════════════════ -->
      <transition name="banner-fade">
        <div v-if="loadError" class="error-banner">
          <i class="fas fa-exclamation-circle"></i>
          {{ loadError }}
        </div>
      </transition>

      <!-- ══ SECTION CONTENT ════════════════════════ -->
      <div class="section-area">

        <!-- ReservationSection — outside content-wrapper for full width -->
        <div v-show="activeSection === 'book'" class="full-bleed-section">
          <ReservationSection
            @view-reservations="setActiveSection('reservations')"
          />
        </div>

        <!-- Dashboard -->
        <div v-show="activeSection === 'dashboard'" class="inner-section">
          <CustomerDashboardSection
            :summary-cards="summaryCards"
            :recent-activity="recentActivity"
            :recommended-rooms="recommendedRooms"
            :customer-name="customerName"
          />
        </div>

        <!-- My Reservations -->
        <div v-show="activeSection === 'reservations'" class="inner-section">
          <CustomerReservationsSection
            ref="reservationsRef"
            :reservations="reservations"
          />
        </div>

        <!-- E-Shop -->
        <div v-show="activeSection === 'esop'" class="inner-section">
          <CustomerEsop />
        </div>

        <!-- My Orders -->
        <div v-show="activeSection === 'orders'" class="inner-section">
          <OrderHistory
            ref="ordersRef"
            :show-header="false"
            @close="() => {}"
          />
        </div>

        <!-- Profile -->
        <div v-show="activeSection === 'profile'" class="inner-section">
          <CustomerProfileSection
            :profile="profile"
            @profile-updated="onProfileUpdated"
          />
        </div>

        <!-- Support -->
        <div v-show="activeSection === 'support'" class="inner-section">
          <CustomerSupportSection />
        </div>

      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import AdminHeader from '../../components/admin/AdminHeader.vue'
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

// Refetch when switching sections
watch(activeSection, (s) => {
  if (s === 'reservations' && reservationsRef.value) reservationsRef.value.fetchBookingHistory()
  if (s === 'orders' && ordersRef.value)             ordersRef.value.fetchOrders()
})

const menuItems = [
  { id: 'dashboard',    label: 'Dashboard',      icon: 'fa-home' },
  { id: 'book',         label: 'Book a Room',    icon: 'fa-bed' },
  { id: 'reservations', label: 'My Reservations',icon: 'fa-calendar-alt' },
  { id: 'esop',         label: 'Resort E-Shop',  icon: 'fa-shopping-cart' },
  { id: 'orders',       label: 'My Orders',      icon: 'fa-receipt' },
  { id: 'profile',      label: 'Profile',        icon: 'fa-user' },
]

const customerName    = computed(() => auth.user?.name  || 'Guest')
const customerEmail   = computed(() => auth.user?.email || '')
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

const setActiveSection = (id) => { activeSection.value = id }

const onProfileUpdated = (updated) => { profile.value = { ...profile.value, ...updated } }

// ── Helpers ──────────────────────────────────────────
const formatDate = (v) => {
  if (!v) return ''
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s.includes('confirm')) return 'text-green-600 font-semibold'
  if (s.includes('pending'))  return 'text-yellow-600 font-semibold'
  if (s.includes('cancel'))   return 'text-red-600 font-semibold'
  return 'text-blue-600 font-semibold'
}

const parseImages = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  try { const p = JSON.parse(value); return Array.isArray(p) ? p : [] } catch { return [] }
}

const buildSummaryCards = (bookings) => {
  const now = new Date()
  const upcoming = bookings.find(b => new Date(b.check_in_date) > now)
  const nights = upcoming
    ? Math.max(1, Math.round((new Date(upcoming.check_out_date) - new Date(upcoming.check_in_date)) / 86400000))
    : 0
  summaryCards.value = [
    { title: 'Upcoming Stay',    value: `${nights} Nights`,     tone: 'blue' },
    { title: 'Total Bookings',   value: String(bookings.length), tone: 'green' },
    { title: 'Loyalty Points',   value: String(bookings.length * 50), tone: 'orange' },
    { title: 'Unread Messages',  value: '0',                     tone: 'yellow' },
  ]
}

// ── API calls ─────────────────────────────────────────
const fetchBookings = async () => {
  if (!customerEmail.value) return []
  const res = await fetch(`${apiBase}/bookings?email=${encodeURIComponent(customerEmail.value)}`)
  if (!res.ok) throw new Error('Failed to load bookings')
  const payload = await res.json()
  return payload.data || []
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
    const [bookings, rooms, customerProfile] = await Promise.all([
      fetchBookings(), fetchRooms(), fetchCustomerProfile()
    ])

    buildSummaryCards(bookings)

    recentActivity.value = bookings.slice(0, 5).map(b => ({
      date:        formatDate(b.created_at || b.check_in_date),
      activity:    b.items_summary || 'Booking created',
      status:      b.booking_status || 'Pending',
      statusClass: statusClass(b.booking_status),
    }))

    reservations.value = bookings.map(b => ({
      roomType:   b.items_summary || 'Room Booking',
      checkIn:    formatDate(b.check_in_date),
      checkOut:   formatDate(b.check_out_date),
      status:     b.booking_status || 'Pending',
      statusClass:statusClass(b.booking_status),
    }))

    const available = rooms.filter(r => String(r.status || '').toLowerCase() === 'available')
    const mapped = available.slice(0, 6).map(room => {
      const images = parseImages(room.images)
      const imageUrl = images[room.primaryImageIndex] || images[0] ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60'
      return {
        title: room.name,
        price: `PHP ${Number(room.price || 0).toLocaleString()} / night`,
        imageUrl,
      }
    })

    recommendedRooms.value = mapped.slice(0, 3)
    bookRooms.value = mapped

    profile.value = customerProfile
      ? {
          fullName:     `${customerProfile.firstName || ''} ${customerProfile.lastName || ''}`.trim() || customerName.value,
          email:        customerProfile.email      || customerEmail.value,
          phone:        customerProfile.phone      || '',
          address:      customerProfile.address    || '',
          city:         customerProfile.city       || '',
          country:      customerProfile.country    || '',
          postalCode:   customerProfile.postalCode || '',
          profileImage: customerProfile.profileImage || '',
          firstName:    customerProfile.firstName  || '',
          lastName:     customerProfile.lastName   || '',
        }
      : { fullName: customerName.value, email: customerEmail.value, phone: '', address: '', city: '', country: '', postalCode: '', profileImage: '' }

  } catch (err) {
    loadError.value = err?.message || 'Failed to load dashboard data'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const param = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('section') ||
      new URLSearchParams(window.location.search).get('ActiveSection')
    : null
  if (param) activeSection.value = param
  loadDashboardData()
})
</script>

<style scoped>
/* ── Design Tokens ──────────────────────────────────────────── */
:root {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #f9fafb;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Root layout: sidebar + main ────────────────────────────── */
.customer-layout {
  min-height: 100vh;
  background: #EEF5FB;
  display: flex;
}

/* ── Main content area ──────────────────────────────────────── */
.main-content {
  flex: 1;
  min-width: 0;           /* prevents flex blowout */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #EEF5FB;
  /* sidebar is 262px wide — main starts after it on md+ */
  margin-left: 262px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-content.shifted { margin-left: 72px; }

@media (max-width: 767px) {
  .main-content { margin-left: 0 !important; }
}

/* ── Dashboard Header ───────────────────────────────────────── */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1.5rem;
  height: 64px;
  background: linear-gradient(135deg, #0C3B5E 0%, #0369a1 60%, #1F8DBF 100%);
  border-bottom: 3px solid #F4C400;
  box-shadow: 0 2px 14px rgba(12,59,94,0.3);
  position: sticky;
  top: 0;
  z-index: 40;
  flex-shrink: 0;
}

/* Left: hamburger + title */
.header-left { display: flex; align-items: center; gap: 0.85rem; min-width: 0; }

.hamburger-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border-radius: 9px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.18s;
  flex-shrink: 0;
}
.hamburger-btn:hover { background: rgba(255,255,255,0.22); }

/* Hide hamburger on md+ since sidebar is always visible */
@media (min-width: 768px) { .hamburger-btn { display: none; } }

.header-title-block { min-width: 0; }

.header-title {
  font-size: 1rem; font-weight: 800; color: #fff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 0.68rem; color: rgba(255,255,255,0.65);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-top: 1px;
}

/* Right: nav + icons */
.header-right { display: flex; align-items: center; gap: 0.65rem; flex-shrink: 0; }

/* Quick-nav pills — hidden on mobile, visible on wide screens */
.header-nav {
  display: none;
  align-items: center;
  gap: 2px;
  background: rgba(255,255,255,0.08);
  padding: 3px;
  border-radius: 50px;
}

@media (min-width: 1200px) { .header-nav { display: flex; } }

.header-nav-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border: none; border-radius: 50px;
  background: transparent; color: rgba(255,255,255,0.7);
  font-family: inherit; font-size: 0.72rem; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  transition: all 0.18s;
}

.header-nav-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }

.header-nav-btn.active {
  background: #F4C400; color: #0C3B5E;
}

/* Notification bell */
.icon-btn {
  position: relative;
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.18s;
}
.icon-btn:hover { background: rgba(255,255,255,0.22); }

.notif-dot {
  position: absolute; top: 5px; right: 5px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #ef4444;
  border: 1.5px solid #0C3B5E;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
  50%       { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
}

/* Avatar pill */
.header-avatar {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: #F4C400;
  color: #0C3B5E;
  font-size: 0.9rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  cursor: default;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(244,196,0,0.35);
  transition: transform 0.18s;
}
.header-avatar:hover { transform: scale(1.08); }

/* ── Error Banner ───────────────────────────────────────────── */
.error-banner {
  display: flex; align-items: center; gap: 0.5rem;
  margin: 0.75rem 1.5rem 0;
  padding: 0.65rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 9px;
  font-size: 0.83rem; color: #991b1b;
}

.banner-fade-enter-active, .banner-fade-leave-active { transition: opacity 0.25s; }
.banner-fade-enter-from, .banner-fade-leave-to { opacity: 0; }

/* ── Section area ───────────────────────────────────────────── */
.section-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Full-bleed: ReservationSection gets the full column width, no padding */
.full-bleed-section {
  flex: 1;
}

/* Inner sections: padded container */
.inner-section {
  flex: 1;
  padding: 1.25rem 1.5rem;
}

@media (max-width: 640px) {
  .dashboard-header { padding: 0 0.85rem; }
  .inner-section    { padding: 0.85rem; }
  .header-title     { font-size: 0.88rem; }
}
</style>