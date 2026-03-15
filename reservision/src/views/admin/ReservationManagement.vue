<template>
  <div class="admin-layout">
    <AdminSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      current-path="/admin/reservations"
      @close="sidebarOpen = false"
    />

    <main class="main-content" :class="{ shifted: sidebarCollapsed }">

      <AdminHeader
        title="Reservation Management"
        subtitle="Manage all guest bookings"
        :has-notifications="pendingCount > 0"
        :pending-count="pendingCount"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <QRCheckInScanner
        :is-open="isCheckinScannerOpen"
        @close="isCheckinScannerOpen = false"
        @check-in-success="handleCheckInSuccess"
      />

      <div class="content-container">

        <!-- ── Stats ── -->
        <ReservationStats :stats="stats" />

        <!-- ── Filters ── -->
        <ReservationFilters
          v-model:search="filters.search"
          v-model:status="filters.status"
          v-model:from="filters.from"
          v-model:to="filters.to"
          @apply="applyFilters"
          @reset="resetFilters"
        />

        <!-- ── Calendar ── -->
        <ReservationCalendar
          ref="reservationCalendar"
          :bookings="bookings"
          @confirm="confirmBooking"
          @cancel="cancelBooking"
          @delete="deleteBooking"
        />

        <!-- ── Desktop Table ── -->
        <div class="section-card desktop-table">

          <div class="section-header">
            <div class="section-header-left">
              <h2 class="section-title">Recent Reservations</h2>
              <p class="section-subtitle">All guest bookings and their current status</p>
            </div>
            <div class="header-actions">
              <button @click="exportData" class="btn-outline">
                <i class="fas fa-download"></i>
                <span>Export</span>
              </button>
              <button @click="createNew" class="btn-primary">
                <i class="fas fa-plus"></i>
                <span>New Booking</span>
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading reservations…</p>
          </div>

          <!-- Empty -->
          <div v-else-if="bookings.length === 0" class="empty-state">
            <div class="empty-icon-wrap"><i class="fas fa-calendar-check"></i></div>
            <p class="empty-title">No bookings found</p>
            <p class="empty-sub">Try adjusting your filters or create a new booking.</p>
            <button @click="createNew" class="btn-primary">
              <i class="fas fa-plus"></i> Create New Booking
            </button>
          </div>

          <!-- Table -->
          <div v-else style="overflow-x:auto">
            <table class="res-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in bookings" :key="booking.id">
                  <td>
                    <div class="guest-cell">
                      <div class="guest-avatar-mini">{{ booking.guest_name.charAt(0).toUpperCase() }}</div>
                      <span class="guest-name">{{ booking.guest_name }}</span>
                    </div>
                  </td>
                  <td class="date-cell">{{ getCheckInDisplay(booking) }}</td>
                  <td class="date-cell">{{ getCheckOutDisplay(booking) }}</td>
                  <td>
                    <span :class="['item-badge', getItemBadgeClass(booking.items_list)]">
                      {{ getItemLabel(booking.items_list) }}
                    </span>
                  </td>
                  <td class="muted-cell">{{ booking.payment_method || 'N/A' }}</td>
                  <td class="code-cell">{{ booking.reservation_code || 'N/A' }}</td>
                  <td>
                    <span :class="['status-badge', getStatusClass(booking.status)]">
                      {{ formatStatus(booking.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-group">
                      <button
                        v-if="booking.status === 'pending'"
                        @click="confirmBooking(booking.id)"
                        class="act-btn confirm-btn"
                        title="Confirm"
                      ><i class="fas fa-check"></i></button>
                      <button @click="cancelBooking(booking.id)" class="act-btn cancel-btn" title="Cancel">
                        <i class="fas fa-times"></i>
                      </button>
                      <button @click="deleteBooking(booking.id)" class="act-btn delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="table-footer" v-if="!loading && bookings.length > 0">
            <p class="page-info">
              Showing {{ (currentPage - 1) * limit + 1 }}–{{ Math.min(currentPage * limit, totalCount) }}
              of <strong>{{ totalCount }}</strong>
            </p>
            <div class="pagination">
              <button @click="prevPage" :disabled="currentPage === 1" class="pg-btn">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page; fetchBookings()"
                :class="['pg-btn', { active: currentPage === page }]"
              >{{ page }}</button>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="pg-btn">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

        </div>

        <!-- ── Mobile Cards ── -->
        <div class="mobile-cards">

          <div class="section-header mobile-header">
            <div class="section-header-left">
              <h2 class="section-title">Recent Reservations</h2>
            </div>
            <div class="header-actions">
              <button @click="exportData" class="btn-outline btn-icon"><i class="fas fa-download"></i></button>
              <button @click="createNew" class="btn-primary btn-icon"><i class="fas fa-plus"></i></button>
            </div>
          </div>

          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
          </div>

          <div v-else-if="bookings.length === 0" class="empty-state">
            <div class="empty-icon-wrap"><i class="fas fa-calendar-check"></i></div>
            <p class="empty-title">No bookings found</p>
          </div>

          <div v-else>
            <div v-for="booking in bookings" :key="booking.id" class="booking-card">
              <div class="bc-header">
                <div class="bc-guest">
                  <div class="guest-avatar">{{ booking.guest_name.charAt(0).toUpperCase() }}</div>
                  <div>
                    <div class="bc-name">{{ booking.guest_name }}</div>
                    <div class="bc-email">{{ booking.email }}</div>
                  </div>
                </div>
                <span :class="['status-badge', getStatusClass(booking.status)]">
                  {{ formatStatus(booking.status) }}
                </span>
              </div>

              <div class="bc-body">
                <div class="bc-row">
                  <div>
                    <div class="bc-label">{{ isSwimmingBooking(booking.items_list) ? 'First Class' : 'Check-in' }}</div>
                    <div class="bc-value">{{ getCheckInDisplay(booking) }}</div>
                  </div>
                  <div>
                    <div class="bc-label">{{ isSwimmingBooking(booking.items_list) ? 'Last Class' : 'Check-out' }}</div>
                    <div class="bc-value">{{ getCheckOutDisplay(booking) }}</div>
                  </div>
                </div>
                <div class="bc-row">
                  <div>
                    <div class="bc-label">Booking Type</div>
                    <span :class="['item-badge', getItemBadgeClass(booking.items_list)]">
                      {{ getItemLabel(booking.items_list) }}
                    </span>
                  </div>
                  <div>
                    <div class="bc-label">Code</div>
                    <div class="bc-code">{{ booking.reservation_code || 'N/A' }}</div>
                  </div>
                </div>
              </div>

              <div class="bc-actions">
                <button v-if="booking.status === 'pending'" @click="confirmBooking(booking.id)" class="act-btn confirm-btn">
                  <i class="fas fa-check"></i>
                </button>
                <button @click="cancelBooking(booking.id)" class="act-btn cancel-btn">
                  <i class="fas fa-times"></i>
                </button>
                <button @click="deleteBooking(booking.id)" class="act-btn delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>

    <!-- ── Toast ── -->
    <transition name="toast">
      <div
        v-if="toastMessage"
        class="toast"
        :class="toastType === 'success' ? 'toast--success' : 'toast--error'"
      >
        <i :class="toastType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        {{ toastMessage }}
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as XLSX from 'xlsx'
import AdminSidebar          from '../../components/admin/AdminSidebar.vue'
import AdminHeader           from '../../components/admin/AdminHeader.vue'
import ReservationStats      from '../../components/admin/ReservationStats.vue'
import ReservationFilters    from '../../components/admin/ReservationFilters.vue'
import ReservationCalendar   from '../../components/admin/ReservationCalendar.vue'
import QRCheckInScanner      from '../../components/QRCheckInScanner.vue'

const sidebarOpen          = ref(false)
const sidebarCollapsed     = ref(false)
const loading              = ref(false)
const bookings             = ref([])
const currentPage          = ref(1)
const limit                = 15
const totalCount           = ref(0)
const totalPages           = ref(0)
const reservationCalendar  = ref(null)
const isCheckinScannerOpen = ref(false)
const toastMessage         = ref('')
const toastType            = ref('success')

const filters = ref({ search: '', status: '', from: '', to: '' })

const stats = computed(() => {
  const sc = bookings.value.reduce((a, b) => { a[b.status] = (a[b.status] || 0) + 1; return a }, {})
  return [
    { label: 'Total',     value: totalCount.value,       type: 'total',     icon: 'fas fa-calendar-check', color: 'blue'   },
    { label: 'Confirmed', value: sc.confirmed || 0,      type: 'confirmed', icon: 'fas fa-check-circle',   color: 'green'  },
    { label: 'Pending',   value: sc.pending   || 0,      type: 'pending',   icon: 'fas fa-clock',          color: 'yellow' },
    { label: 'Cancelled', value: sc.cancelled || 0,      type: 'cancelled', icon: 'fas fa-times-circle',   color: 'red'    }
  ]
})

const pendingCount = computed(() => bookings.value.filter(b => b.status === 'pending').length)

const visiblePages = computed(() => {
  const pages = []; const max = 5
  let start = Math.max(1, currentPage.value - Math.floor(max / 2))
  let end   = Math.min(totalPages.value, start + max - 1)
  if (end - start < max - 1) start = Math.max(1, end - max + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const buildParams = (page, lim) => {
  const p = new URLSearchParams()
  p.append('page', page); p.append('limit', lim)
  if (filters.value.search) p.append('search', filters.value.search)
  if (filters.value.status && filters.value.status !== 'all') p.append('status', filters.value.status)
  if (filters.value.from)   p.append('startDate', filters.value.from)
  if (filters.value.to)     p.append('endDate',   filters.value.to)
  return p
}

const mapBooking = b => ({
  id:               b.booking_id,
  guest_name:       `${b.first_name || ''} ${b.last_name || ''}`.trim() || b.email || 'Guest',
  email:            b.email || 'N/A',
  reservation_code: b.booking_reference,
  check_in:         b.check_in_date,
  check_out:        b.check_out_date,
  adults:           parseInt(b.adults) || 0,
  children:         parseInt(b.children) || 0,
  status:           b.booking_status?.toLowerCase() || 'pending',
  payment_status:   b.payment_status,
  payment_method:   b.payment_method || 'N/A',
  total:            parseFloat(b.total) || 0,
  items_list:       b.items_summary || 'N/A',
  items_descriptions: b.items_descriptions || null
})

const fetchBookings = async () => {
  loading.value = true
  try {
    const res    = await fetch(`http://localhost:8000/api/bookings/admin/reservations?${buildParams(currentPage.value, limit)}`)
    const result = await res.json()
    if (result.success) {
      bookings.value  = (Array.isArray(result.data) ? result.data : []).map(mapBooking)
      totalCount.value = result.pagination?.totalCount || bookings.value.length
      totalPages.value = result.pagination?.totalPages || 1
    } else throw new Error(result.message)
  } catch (e) {
    bookings.value = []; showToast('Failed to load bookings', 'error')
  } finally { loading.value = false }
}

const fetchAllForExport = async () => {
  const limit = 200; let page = 1; let totalP = 1; const all = []
  do {
    const res    = await fetch(`http://localhost:8000/api/bookings/admin/reservations?${buildParams(page, limit)}`)
    const result = await res.json()
    if (!result.success) throw new Error(result.message)
    all.push(...(result.data || []).map(mapBooking))
    totalP = result.pagination?.totalPages || 1; page++
  } while (page <= totalP)
  return all
}

const formatDate = d => {
  if (!d) return 'N/A'
  const dt = new Date(d)
  return dt.getFullYear() === 1970 ? 'N/A' : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const parseSwimmingDetails = desc => {
  if (!desc) return null
  try {
    for (const d of desc.split('|||')) {
      if (!d || d === 'null') continue
      try { const p = JSON.parse(d); if (p?.dates) return p } catch {}
    }
  } catch {}
  return null
}

const isSwimmingBooking = list => list && String(list).toLowerCase().includes('swimming')

const getCheckInDisplay  = b => {
  if (isSwimmingBooking(b.items_list)) {
    const sw = parseSwimmingDetails(b.items_descriptions)
    if (sw?.dates?.length) return formatDate(sw.dates[0])
  }
  return formatDate(b.check_in)
}

const getCheckOutDisplay = b => {
  if (isSwimmingBooking(b.items_list)) {
    const sw = parseSwimmingDetails(b.items_descriptions)
    if (sw?.dates?.length) return formatDate(sw.dates[sw.dates.length - 1])
  }
  return formatDate(b.check_out)
}

const formatStatus  = s => s.replace(/_/g, ' ').toUpperCase()
const getStatusClass = s => ({
  pending: 'status-pending', confirmed: 'status-confirmed',
  checked_in: 'status-confirmed', checked_out: 'status-confirmed',
  cancelled: 'status-cancelled', no_show: 'status-cancelled'
}[s] || 'status-pending')

const getItemLabel = list => {
  if (!list || list === 'N/A') return 'Other'
  const s = String(list).toLowerCase()
  if (s.includes('swimming lesson')) {
    const m = String(list).match(/Swimming Lesson - (.+?)(?:,|$)/i)
    return m ? `Swimming: ${m[1].trim()}` : 'Swimming Lesson'
  }
  if (s.includes('room')) { const m = String(list).match(/(.+?room[^,]*)/i); return m ? m[1].trim() : 'Room' }
  if (s.includes('cottage')) return 'Cottage'
  if (s.includes('event'))   return 'Event'
  return String(list)
}

const getItemBadgeClass = list => {
  if (!list || list === 'N/A') return 'badge-other'
  const s = String(list).toLowerCase()
  if (s.includes('swimming')) return 'badge-swimming'
  if (s.includes('room'))     return 'badge-room'
  if (s.includes('cottage'))  return 'badge-cottage'
  if (s.includes('event'))    return 'badge-event'
  return 'badge-other'
}

const confirmBooking = async id => {
  if (!confirm('Confirm this booking?')) return
  try {
    const res = await fetch(`http://localhost:8000/api/bookings/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_status: 'Confirmed' })
    })
    const r = await res.json()
    if (r.success) { showToast('Booking confirmed successfully', 'success'); fetchBookings() }
    else throw new Error(r.message)
  } catch { showToast('Failed to confirm booking', 'error') }
}

const cancelBooking = async id => {
  if (!confirm('Cancel this booking?')) return
  try {
    const res = await fetch(`http://localhost:8000/api/bookings/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_status: 'Cancelled' })
    })
    const r = await res.json()
    if (r.success) { showToast('Booking cancelled', 'success'); fetchBookings() }
    else throw new Error(r.message)
  } catch { showToast('Failed to cancel booking', 'error') }
}

const deleteBooking = async id => {
  if (!confirm('Delete this booking permanently?')) return
  try {
    const res = await fetch(`http://localhost:8000/api/bookings/${id}`, { method: 'DELETE' })
    const r   = await res.json()
    if (r.success) { showToast('Booking deleted', 'success'); fetchBookings() }
    else throw new Error(r.message)
  } catch { showToast('Failed to delete booking', 'error') }
}

const handleCheckInSuccess = () => { isCheckinScannerOpen.value = false; fetchBookings(); showToast('Guest checked in successfully', 'success') }
const createNew = () => showToast('Create new reservation coming soon', 'info')

const toPercent = (v, t) => (!t ? '0.00%' : `${((v / t) * 100).toFixed(2)}%`)

const exportData = async () => {
  try {
    const all = await fetchAllForExport()
    const details = all.map((b, i) => ({
      'No.': i + 1, 'Guest Name': b.guest_name, 'Email': b.email,
      'Check In': getCheckInDisplay(b), 'Check Out': getCheckOutDisplay(b),
      'Booking Type': getItemLabel(b.items_list), 'Payment Method': b.payment_method,
      'Booking Code': b.reservation_code, 'Status': formatStatus(b.status), 'Amount': b.total
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(details)
    ws['!cols'] = [5, 20, 25, 12, 12, 20, 15, 15, 12, 12].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws, 'Booking Details')
    XLSX.writeFile(wb, `Reservations_${new Date().toISOString().split('T')[0]}.xlsx`)
    showToast('Export successful', 'success')
  } catch { showToast('Failed to export data', 'error') }
}

const applyFilters = () => { currentPage.value = 1; fetchBookings() }
const resetFilters = () => { filters.value = { search: '', status: '', from: '', to: '' }; currentPage.value = 1; fetchBookings() }
const prevPage     = () => { if (currentPage.value > 1) { currentPage.value--; fetchBookings() } }
const nextPage     = () => { if (currentPage.value < totalPages.value) { currentPage.value++; fetchBookings() } }
const showToast    = (msg, type = 'success') => { toastMessage.value = msg; toastType.value = type; setTimeout(() => toastMessage.value = '', 4000) }

let pollInterval = null; let visHandler = null
onMounted(() => {
  fetchBookings()
  pollInterval = setInterval(() => fetchBookings(), 30000)
  visHandler = () => { if (document.visibilityState === 'visible') fetchBookings() }
  document.addEventListener('visibilitychange', visHandler)
})
onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  if (visHandler) document.removeEventListener('visibilitychange', visHandler)
})
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.admin-layout {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #EEF5FB;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

@keyframes fadeUp   { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
@keyframes slideIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin     { to { transform: rotate(360deg) } }

/* ── Layout ── */
.admin-layout {
  min-height: 100vh;
  background: var(--color-gray-bg);
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.main-content {
  margin-left: 0;
  padding-top: 64px;
  transition: margin-left 0.3s ease;
}
.main-content.shifted { margin-left: 72px; }
@media (min-width: 768px) { .main-content { margin-left: 262px; } }

.content-container {
  padding: 1.5rem 1.75rem;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
@media (max-width: 768px) { .content-container { padding: .85rem; gap: 1rem; } }

/* ── Section Card ── */
.section-card {
  background: var(--color-white);
  border-radius: 20px;
  padding: 1.5rem 1.75rem;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 16px rgba(3, 105, 161, .07);
  animation: fadeUp .3s ease both;
}
@media (max-width: 768px) { .section-card { padding: 1rem; border-radius: 14px; } }

/* ── Section Header ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: .75rem;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid rgba(244, 196, 0, .3);
}
.section-header-left { flex: 1; min-width: 0; }
.section-title {
  font-size: 1.15rem; font-weight: 800; color: var(--color-navy);
  margin: 0 0 .2rem;
  display: flex; align-items: center; gap: .65rem;
}
.section-title::before {
  content: '';
  display: inline-block;
  width: 4px; height: 1.1em;
  background: var(--color-gold);
  border-radius: 3px; flex-shrink: 0;
}
.section-subtitle { font-size: .8rem; color: var(--color-text-light); margin: 0; padding-left: .75rem; }
.header-actions    { display: flex; gap: .6rem; flex-wrap: wrap; }

/* ── Buttons ── */
.btn-primary {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: 0 1.2rem; height: 38px;
  background: var(--color-navy); color: var(--color-white);
  border: none; border-radius: 12px;
  font-size: .875rem; font-weight: 700; cursor: pointer;
  white-space: nowrap; box-shadow: 0 2px 8px rgba(12,59,94,.22);
  transition: all .18s ease;
}
.btn-primary:hover { background: var(--color-primary); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(3,105,161,.28); }
.btn-primary i { color: var(--color-gold); font-size: .8rem; transition: transform .2s; }
.btn-primary:hover i { transform: rotate(90deg); }

.btn-outline {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: 0 1.2rem; height: 38px;
  background: var(--color-white); color: var(--color-primary);
  border: 1.5px solid rgba(3,105,161,.3); border-radius: 12px;
  font-size: .875rem; font-weight: 600; cursor: pointer;
  white-space: nowrap; transition: all .18s ease;
}
.btn-outline:hover { background: var(--color-gray-bg); border-color: var(--color-gold); color: var(--color-navy); transform: translateY(-1px); }
.btn-outline i { font-size: .8rem; }
.btn-icon { width: 38px; padding: 0; justify-content: center; }

/* ── Table ── */
.res-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .875rem;
}
.res-table thead th {
  padding: .7rem 1rem;
  text-align: left;
  font-size: .7rem; font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase; letter-spacing: .6px;
  background: var(--color-gray-bg);
  border-bottom: 2px solid rgba(244,196,0,.25);
}
.res-table thead th:first-child { border-radius: 10px 0 0 0; }
.res-table thead th:last-child  { border-radius: 0 10px 0 0; }

.res-table tbody tr {
  border-bottom: 0.5px solid var(--color-gray-border);
  transition: background .15s;
}
.res-table tbody tr:hover { background: rgba(31,141,191,.04); }
.res-table tbody tr:last-child { border-bottom: none; }

.res-table tbody td {
  padding: .85rem 1rem;
  color: var(--color-text-dark);
  vertical-align: middle;
}

/* Guest cell */
.guest-cell { display: flex; align-items: center; gap: .65rem; }
.guest-avatar-mini {
  width: 32px; height: 32px; border-radius: 9px;
  background: var(--color-gold); color: var(--color-navy);
  font-size: .85rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.guest-name { font-weight: 600; color: var(--color-text-dark); }
.date-cell  { color: var(--color-text-dark); font-size: .85rem; white-space: nowrap; }
.muted-cell { color: var(--color-text-light); font-size: .85rem; }
.code-cell  {
  font-family: monospace;
  font-size: .8rem;
  color: var(--color-primary);
  background: rgba(31,141,191,.06);
  padding: .2rem .55rem !important;
  border-radius: 6px;
}

/* ── Badges ── */
.item-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: .72rem; font-weight: 600;
  white-space: nowrap;
}
.badge-swimming { background: rgba(31,141,191,.1);  color: var(--color-primary-light); border: 1px solid rgba(31,141,191,.25); }
.badge-room     { background: rgba(12,59,94,.08);   color: var(--color-navy);          border: 1px solid rgba(12,59,94,.2); }
.badge-cottage  { background: rgba(244,196,0,.12);  color: #7a5200;                    border: 1px solid rgba(244,196,0,.3); }
.badge-event    { background: rgba(22,163,74,.1);   color: #15803d;                    border: 1px solid rgba(22,163,74,.25); }
.badge-other    { background: var(--color-gray-bg); color: var(--color-text-light);    border: 1px solid var(--color-gray-border); }

/* ── Status badges ── */
.status-badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 20px;
  font-size: .7rem; font-weight: 700;
  letter-spacing: .3px; white-space: nowrap;
}
.status-confirmed { background: rgba(22,163,74,.1);   color: #15803d; border: 1px solid rgba(22,163,74,.25); }
.status-pending   { background: rgba(244,196,0,.15);  color: #7a5200; border: 1px solid rgba(244,196,0,.3); }
.status-cancelled { background: rgba(220,38,38,.1);   color: #dc2626; border: 1px solid rgba(220,38,38,.22); }

/* ── Action buttons ── */
.action-group { display: flex; gap: .3rem; }
.act-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid var(--color-gray-border);
  background: var(--color-white);
  font-size: .75rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-light);
  transition: all .15s ease;
}
.act-btn:hover { transform: translateY(-1px); }
.confirm-btn { color: #15803d; }
.confirm-btn:hover { background: #16a34a; color: var(--color-white); border-color: #16a34a; }
.cancel-btn  { color: #92700a; }
.cancel-btn:hover  { background: var(--color-gold); color: var(--color-navy); border-color: var(--color-gold); }
.delete-btn  { color: #dc2626; }
.delete-btn:hover  { background: #ef4444; color: var(--color-white); border-color: #ef4444; }

/* ── Table Footer ── */
.table-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1.25rem; padding-top: 1rem;
  border-top: 1px solid var(--color-gray-border);
  flex-wrap: wrap; gap: .75rem;
}
.page-info { font-size: .8rem; color: var(--color-text-light); }
.page-info strong { color: var(--color-text-dark); }

.pagination { display: flex; gap: .25rem; }
.pg-btn {
  width: 34px; height: 34px;
  border: 1.5px solid var(--color-gray-border);
  background: var(--color-white);
  color: var(--color-primary);
  border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: .8rem; font-weight: 600;
  transition: all .18s ease;
}
.pg-btn:hover:not(:disabled) { background: var(--color-gold); border-color: var(--color-gold); color: var(--color-navy); }
.pg-btn.active { background: var(--color-navy); color: var(--color-white); border-color: var(--color-navy); }
.pg-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── Loading State ── */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .75rem;
  padding: 3rem 2rem;
  color: var(--color-text-light); font-size: .875rem;
}
.loading-spinner {
  width: 36px; height: 36px;
  border: 3px solid var(--color-gray-border);
  border-top-color: var(--color-primary-light);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

/* ── Empty State ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .75rem;
  padding: 4rem 2rem; text-align: center;
  border: 2px dashed rgba(244,196,0,.4);
  border-radius: 16px;
  background: rgba(244,196,0,.02);
}
.empty-icon-wrap {
  width: 60px; height: 60px; border-radius: 16px;
  background: rgba(3,105,161,.08); color: var(--color-primary-light);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem;
}
.empty-title { font-size: .95rem; font-weight: 700; color: var(--color-text-dark); margin: 0; }
.empty-sub   { font-size: .8rem;  color: var(--color-text-light); margin: 0; }

/* ── Mobile Cards ── */
.mobile-cards { display: none; }

@media (max-width: 768px) {
  .desktop-table { display: none; }
  .mobile-cards  { display: block; }
  .mobile-header { border-bottom: none; padding-bottom: 0; margin-bottom: 1rem; }
}

.booking-card {
  background: var(--color-white);
  border-radius: 16px;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 10px rgba(3,105,161,.07);
  margin-bottom: 1rem;
  overflow: hidden;
  transition: box-shadow .2s, border-color .2s;
}
.booking-card:hover { box-shadow: 0 6px 20px rgba(3,105,161,.12); border-color: rgba(244,196,0,.35); }

.bc-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: .9rem 1rem;
  background: var(--color-navy);
  border-bottom: 2px solid var(--color-gold);
}
.bc-guest { display: flex; align-items: center; gap: .65rem; }
.guest-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--color-gold); color: var(--color-navy);
  font-size: .95rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.bc-name  { color: var(--color-white); font-size: .875rem; font-weight: 700; }
.bc-email { color: rgba(255,255,255,.55); font-size: .75rem; margin-top: 1px; }

.bc-body { padding: .85rem 1rem; display: flex; flex-direction: column; gap: .65rem; }
.bc-row  { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.bc-label { font-size: .68rem; font-weight: 700; color: var(--color-text-light); text-transform: uppercase; letter-spacing: .4px; margin-bottom: 3px; }
.bc-value { font-size: .85rem; color: var(--color-text-dark); font-weight: 500; }
.bc-code  {
  font-family: monospace; font-size: .8rem;
  background: rgba(31,141,191,.07);
  color: var(--color-primary);
  padding: 2px 8px; border-radius: 5px;
  display: inline-block;
}

.bc-actions {
  display: flex; gap: .4rem; justify-content: flex-end;
  padding: .65rem 1rem;
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-gray-bg);
}

/* ── Toast ── */
.toast {
  position: fixed; bottom: 2rem; right: 2rem;
  display: flex; align-items: center; gap: .6rem;
  padding: .8rem 1.2rem;
  border-radius: 12px;
  font-size: .875rem; font-weight: 600;
  color: var(--color-white);
  box-shadow: 0 8px 28px rgba(0,0,0,.18);
  z-index: 9999;
}
.toast--success { background: #16a34a; }
.toast--error   { background: #dc2626; }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
</style>