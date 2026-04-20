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
              <button @click="openExportPreview" class="btn-outline">
                <i class="fas fa-download"></i>
                <span>Export</span>
              </button>
              <button @click="printReservationList" class="btn-outline">
                <i class="fas fa-print"></i>
                <span>Print List</span>
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
              <button @click="openExportPreview" class="btn-outline btn-icon"><i class="fas fa-download"></i></button>
              <button @click="printReservationList" class="btn-outline btn-icon" title="Print List"><i class="fas fa-print"></i></button>
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
    <div v-if="showExportPreview" class="sales-preview-overlay" @click.self="showExportPreview = false">
      <div class="sales-preview-modal">
        <div class="sales-preview-toolbar">
          <div>
            <h3>Reservation Report Preview</h3>
            <p>Review before downloading Excel</p>
          </div>
          <div class="sales-preview-actions">
            <button class="btn-download" @click="exportData" :disabled="exportPreviewLoading || !exportPreviewReport">
              <i class="fas fa-download"></i>
              {{ exportPreviewLoading ? 'Loading…' : 'Download Excel' }}
            </button>
            <button class="btn-preview" @click="printReservationReportPreview" :disabled="exportPreviewLoading || !exportPreviewReport">
              <i class="fas fa-print"></i>
              Print
            </button>
            <button class="btn-preview" @click="showExportPreview = false">
              <i class="fas fa-xmark"></i>
              Close
            </button>
          </div>
        </div>

        <div class="sales-preview-scroll">
          <div v-if="exportPreviewLoading" class="srp-loading">
            <div class="srp-spinner"></div>
            <p>Preparing report preview…</p>
          </div>

          <article v-else-if="exportPreviewReport" class="sales-report-print" id="reservation-report-print">
            <header class="srp-header">
              <div class="srp-logo">ER</div>
              <div>
                <h2>Eduardo's Resort</h2>
                <p>Reservation and POS Sales Report</p>
              </div>
              <div class="srp-meta">
                <span>Generated</span>
                <strong>{{ exportPreviewReport.generatedAt }}</strong>
              </div>
            </header>

              <section class="srp-section">
                <div class="srp-title-row">
                  <div>
                    <h3>Sales Report</h3>
                    <p>{{ exportPreviewReport.dateRange }}</p>
                  </div>
                  <div class="srp-applied">
                    <div><span>Status</span><strong>{{ exportPreviewReport.applied.status }}</strong></div>
                    <div><span>Search</span><strong>{{ exportPreviewReport.applied.search }}</strong></div>
                  </div>
                </div>
              </section>

              <section class="srp-cards">
                <div class="srp-card">
                  <span>Total</span>
                  <strong>{{ exportPreviewReport.totalBookings }}</strong>
                </div>
                <div class="srp-card">
                  <span>Revenue</span>
                  <strong>{{ exportPreviewReport.totalRevenue }}</strong>
                </div>
                <div class="srp-card">
                  <span>Peak Day</span>
                  <strong>{{ exportPreviewReport.peakDay }}</strong>
                </div>
                <div class="srp-card">
                  <span>Top Service</span>
                  <strong>{{ exportPreviewReport.topService }}</strong>
                </div>
              </section>

              <section class="srp-section">
                <h4>Status Breakdown</h4>
                <table class="srp-table">
                  <thead>
                    <tr><th>Status</th><th>Bookings</th><th>Revenue</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in exportPreviewReport.statusBreakdown" :key="`status-${row.status}`">
                      <td>{{ toStatusLabel(row.status) }}</td>
                      <td>{{ row.count }}</td>
                      <td>{{ row.revenue }}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="srp-grid">
                <div class="srp-section">
                  <h4>Category Breakdown</h4>
                  <table class="srp-table">
                    <thead>
                      <tr><th>Category</th><th>Bookings</th><th>Revenue</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in exportPreviewReport.categoryBreakdown" :key="`cat-${row.category}`">
                        <td>{{ row.category }}</td>
                        <td>{{ row.count }}</td>
                        <td>{{ row.revenue }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="srp-section">
                  <h4>Payment Summary</h4>
                  <table class="srp-table">
                    <thead>
                      <tr><th>Method</th><th>Count</th><th>Amount</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in exportPreviewReport.paymentSummary" :key="`pay-${row.method}`">
                        <td>{{ row.method }}</td>
                        <td>{{ row.count }}</td>
                        <td>{{ row.amount }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section class="srp-grid">
                <div class="srp-section">
                  <h4>Top Booked Items by Category</h4>
                  <table class="srp-table">
                    <thead>
                      <tr><th>Category</th><th>Top Item</th><th>Bookings</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in exportPreviewReport.topBookedItemsByCategory" :key="`top-${row.category}`">
                        <td>{{ row.category }}</td>
                        <td>{{ row.name }}</td>
                        <td>{{ row.count }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="srp-section">
                  <h4>Sales Channels Summary</h4>
                  <table class="srp-table">
                    <thead>
                      <tr><th>Channel</th><th>Transactions</th><th>Revenue</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in exportPreviewReport.channelSummary" :key="`channel-${row.channel}`">
                        <td>{{ row.channel }}</td>
                        <td>{{ row.count }}</td>
                        <td>{{ row.amount }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section class="srp-section">
                <h4>Top POS Items</h4>
                <table class="srp-table">
                  <thead>
                    <tr><th>Item</th><th>Sales</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in (exportPreviewReport.topPosItems.length ? exportPreviewReport.topPosItems : [{ item: 'N/A', sales: safeCurrency(0) }])" :key="`pos-item-${index}`">
                      <td>{{ row.item || row.name || 'N/A' }}</td>
                      <td>{{ row.sales || row.amount || safeCurrency(0) }}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
          </article>
        </div>
      </div>
    </div>

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
const showExportPreview    = ref(false)
const exportPreviewLoading = ref(false)
const exportPreviewReport  = ref(null)

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
  phone:            b.phone || 'N/A',
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

const toFiniteNumber = value => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const safeCurrency = value => `₱${toFiniteNumber(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDateTime = dateValue => {
  const dt = new Date(dateValue)
  if (Number.isNaN(dt.getTime())) return 'N/A'
  return dt.toLocaleString('en-PH', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEffectiveDateRangeLabel = () => {
  const from = filters.value.from || 'Start'
  const to = filters.value.to || 'Today'
  if (!filters.value.from && !filters.value.to) return 'All dates'
  return `${from} to ${to}`
}

const normalizeStatusKey = status => {
  const s = String(status || '').toLowerCase()
  if (s === 'checked_out') return 'checked_in'
  if (s === 'no_show') return 'cancelled'
  return s || 'pending'
}

const toStatusLabel = status => ({
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  cancelled: 'Cancelled'
}[status] || formatStatus(status || 'pending'))

const normalizePaymentMethod = method => {
  const m = String(method || '').trim().toLowerCase()
  if (m === 'gcash' || m === 'g cash') return 'GCash'
  if (m === 'cash') return 'Cash'
  return method || 'N/A'
}

const getCategoryFromItems = list => {
  const s = String(list || '').toLowerCase()
  if (s.includes('room')) return 'Room'
  if (s.includes('cottage')) return 'Cottage'
  if (s.includes('event')) return 'Event'
  if (s.includes('swimming')) return 'Swimming'
  return 'Other'
}

const extractTopBookedItemName = (itemsList, category) => {
  if (!itemsList || itemsList === 'N/A') return null
  const entries = String(itemsList)
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)

  const categoryKey = String(category || '').toLowerCase()
  const matched = entries.find(entry => entry.toLowerCase().includes(categoryKey))
  return matched || null
}

const getGuestCount = row => toFiniteNumber(row.adults) + toFiniteNumber(row.children)


const getPrintRows = rows => rows
  .map(row => ({
    reservationId: row.id,
    guestName: row.guest_name || 'Guest',
    contactNumber: row.phone || 'N/A',
    checkIn: getCheckInDisplay(row),
    checkOut: getCheckOutDisplay(row),
    accommodation: row.items_list || 'N/A',
    guests: getGuestCount(row),
    status: toStatusLabel(normalizeStatusKey(row.status)),
    paymentStatus: row.payment_status || 'N/A',
  }))

const getPrintFilterLabel = () => {
  const parts = []
  if (filters.value.from || filters.value.to) parts.push(`Date: ${getEffectiveDateRangeLabel()}`)
  if (filters.value.status && filters.value.status !== 'all') parts.push(`Status: ${toStatusLabel(filters.value.status)}`)
  if (filters.value.search) parts.push(`Search: ${filters.value.search}`)
  return parts.length ? parts.join(' | ') : 'All reservations'
}

const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const printReservationList = async () => {
  try {
    const all = await fetchAllForExport()
    const rows = getPrintRows(all)
    if (!rows.length) return showToast('No reservations available to print', 'error')

    const printWindow = window.open('', '_blank', 'width=1400,height=900')
    if (!printWindow) return showToast('Allow pop-ups to print the reservation list', 'error')

    const totalGuests = rows.reduce((sum, row) => sum + row.guests, 0)
    const htmlRows = rows.map(row => `
      <tr>
        <td>${escapeHtml(row.reservationId)}</td>
        <td>${escapeHtml(row.guestName)}</td>
        <td>${escapeHtml(row.contactNumber)}</td>
        <td>${escapeHtml(row.checkIn)}</td>
        <td>${escapeHtml(row.checkOut)}</td>
        <td>${escapeHtml(row.accommodation)}</td>
        <td style="text-align:center">${escapeHtml(row.guests)}</td>
        <td>${escapeHtml(row.status)}</td>
        <td>${escapeHtml(row.paymentStatus)}</td>
        <td style="min-width:120px"></td>
      </tr>`).join('')

    printWindow.document.write(`<!doctype html>
<html>
<head>
  <title>Reservation List</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 12mm; color: #111827; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 10px; }
    .brand { display:flex; gap:10px; align-items:center; }
    .badge { background:#0C3B5E; color:#fff; font-weight:700; padding:8px 12px; border-radius:4px; }
    .title { font-size:18px; font-weight:700; color:#0C3B5E; }
    .subtitle, .meta { font-size:12px; color:#475569; }
    .summary { margin: 10px 0 12px; font-size: 12px; }
    table { width:100%; border-collapse:collapse; font-size:11px; }
    th, td { border:1px solid #cbd5e1; padding:6px 7px; vertical-align:top; }
    th { background:#f1f5f9; text-align:left; font-size:10px; text-transform:uppercase; }
    tfoot td { font-weight:700; background:#f8fafc; }
    .footer { margin-top: 12px; font-size: 11px; color:#475569; }
    @page { size: A4 landscape; margin: 10mm; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="badge">ER</div>
      <div>
        <div class="title">Eduardo's Resort</div>
        <div class="subtitle">Reservation List - Printable Backup Copy</div>
      </div>
    </div>
    <div class="meta">
      <div>Generated: ${escapeHtml(formatDateTime(new Date()))}</div>
      <div>Filters: ${escapeHtml(getPrintFilterLabel())}</div>
    </div>
  </div>
  <div class="summary">Total Records: ${rows.length} | Total Guests: ${totalGuests}</div>
  <table>
    <thead>
      <tr>
        <th>Reservation ID</th>
        <th>Guest Name</th>
        <th>Contact Number</th>
        <th>Check-in Date</th>
        <th>Check-out Date</th>
        <th>Accommodation / Room / Cottage</th>
        <th>Guests</th>
        <th>Status</th>
        <th>Payment Status</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>${htmlRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="6">Totals</td>
        <td style="text-align:center">${totalGuests}</td>
        <td colspan="3"></td>
        <td></td>
      </tr>
    </tfoot>
  </table>
  <div class="footer">Staff signature: ________________________ Date: ____________</div>
</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.onafterprint = () => printWindow.close()
    }, 250)
  } catch {
    showToast('Failed to print reservation list', 'error')
  }
}

const buildReservationSalesReport = rows => {
  const statusOrder = ['pending', 'confirmed', 'checked_in', 'cancelled']
  const topItemMap = { Room: {}, Cottage: {}, Event: {} }
  const statusMap = {}
  const categoryMap = {}
  const paymentMap = { Cash: { count: 0, amountRaw: 0 }, GCash: { count: 0, amountRaw: 0 } }
  const dayMap = {}
  let totalRevenueRaw = 0

  for (const row of rows) {
    const status = normalizeStatusKey(row.status)
    const category = getCategoryFromItems(row.items_list)
    const method = normalizePaymentMethod(row.payment_method)
    const amount = toFiniteNumber(row.total)

    if (!statusMap[status]) statusMap[status] = { count: 0, revenueRaw: 0 }
    statusMap[status].count += 1
    statusMap[status].revenueRaw += amount

    if (!categoryMap[category]) categoryMap[category] = { count: 0, revenueRaw: 0 }
    categoryMap[category].count += 1
    categoryMap[category].revenueRaw += amount

    if (!paymentMap[method]) paymentMap[method] = { count: 0, amountRaw: 0 }
    paymentMap[method].count += 1
    paymentMap[method].amountRaw += amount

    totalRevenueRaw += amount

    const dayLabel = getCheckInDisplay(row)
    if (dayLabel && dayLabel !== 'N/A') {
      if (!dayMap[dayLabel]) dayMap[dayLabel] = 0
      dayMap[dayLabel] += 1
    }

    if (topItemMap[category]) {
      const itemName = extractTopBookedItemName(row.items_list, category)
      if (itemName) topItemMap[category][itemName] = (topItemMap[category][itemName] || 0) + 1
    }
  }

  const statusBreakdown = statusOrder.map(status => ({
    status,
    count: statusMap[status]?.count || 0,
    revenue: safeCurrency(statusMap[status]?.revenueRaw || 0)
  }))

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, values]) => ({
      category,
      count: values.count,
      revenue: safeCurrency(values.revenueRaw),
      revenueRaw: values.revenueRaw
    }))
    .sort((a, b) => b.revenueRaw - a.revenueRaw)

  const paymentSummary = Object.entries(paymentMap)
    .map(([method, values]) => ({
      method,
      count: values.count,
      amount: safeCurrency(values.amountRaw),
      amountRaw: values.amountRaw
    }))
    .sort((a, b) => b.amountRaw - a.amountRaw)

  const peakEntry = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]
  const peakDay = peakEntry ? `${peakEntry[0]} (${peakEntry[1]})` : 'N/A'

  const topService = categoryBreakdown[0]?.category || 'N/A'

  const topBookedItemsByCategory = ['Room', 'Cottage', 'Event'].map(category => {
    const items = Object.entries(topItemMap[category] || {}).sort((a, b) => b[1] - a[1])
    if (!items.length) return { category, name: 'N/A', count: 0 }
    return { category, name: items[0][0], count: items[0][1] }
  })

  const channelSummary = [{
    channel: 'Reservations',
    count: rows.length,
    amount: safeCurrency(totalRevenueRaw)
  }]

  return {
    generatedAt: formatDateTime(new Date()),
    dateRange: getEffectiveDateRangeLabel(),
    applied: {
      status: !filters.value.status || filters.value.status === 'all' ? 'All statuses' : toStatusLabel(filters.value.status),
      search: filters.value.search || 'None'
    },
    totalBookings: rows.length,
    totalRevenue: safeCurrency(totalRevenueRaw),
    peakDay,
    topService,
    statusBreakdown,
    categoryBreakdown,
    paymentSummary,
    topBookedItemsByCategory,
    channelSummary,
    topPosItems: []
  }
}

const openExportPreview = async () => {
  showExportPreview.value = true
  exportPreviewLoading.value = true
  exportPreviewReport.value = null
  try {
    const all = await fetchAllForExport()
    exportPreviewReport.value = buildReservationSalesReport(all)
  } catch {
    exportPreviewReport.value = null
    showToast('Failed to load export preview', 'error')
  } finally {
    exportPreviewLoading.value = false
  }
}

const exportData = async () => {
  try {
    let report = exportPreviewReport.value
    if (!report) {
      const all = await fetchAllForExport()
      report = buildReservationSalesReport(all)
      exportPreviewReport.value = report
    }

    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Eduardo's Resort"
    workbook.created = new Date()

    const ws = workbook.addWorksheet('Sales Report', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 }
    })

    ws.columns = [
      { width: 28 },
      { width: 14 },
      { width: 20 },
      { width: 3  },
      { width: 28 },
      { width: 14 },
      { width: 20 }
    ]

    const C_DARK_BLUE = 'FF0C3B5E'
    const C_LOGO_BG = 'FF0C3B5E'
    const C_HDR_BG = 'FFE8F4FD'
    const C_TBL_HDR = 'FFF0F6FB'
    const C_CARD_BDR = 'FFDCE8F3'
    const C_WHITE = 'FFFFFFFF'
    const C_ROW_ALT = 'FFF8FBFF'
    const C_GREY_TEXT = 'FF64748B'

    const bdr = c => ({ style: 'thin', color: { argb: c } })
    const cardBorder = { top: bdr(C_CARD_BDR), bottom: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR) }

    const secHdr = (cell, text) => {
      cell.value = text
      cell.font = { bold: true, size: 10, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } }
      cell.border = cardBorder
      cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    }

    const th = (cell, text, right = false) => {
      cell.value = text
      cell.font = { bold: true, size: 10, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } }
      cell.border = cardBorder
      cell.alignment = { horizontal: right ? 'right' : 'left', indent: right ? 0 : 1 }
    }

    const td = (cell, value, right = false, bold = false, alt = false) => {
      cell.value = value
      cell.font = { size: 10, name: 'Calibri', bold }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: alt ? C_ROW_ALT : C_WHITE } }
      cell.border = cardBorder
      cell.alignment = { horizontal: right ? 'right' : 'left', indent: right ? 0 : 1 }
    }

    let r = 1

    ws.getCell(`A${r}`).value = 'ER'
    ws.getCell(`A${r}`).font = { bold: true, size: 14, color: { argb: C_WHITE }, name: 'Calibri' }
    ws.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_LOGO_BG } }
    ws.getCell(`A${r}`).alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getCell(`A${r}`).border = cardBorder

    ws.mergeCells(`B${r}:E${r}`)
    ws.getCell(`B${r}`).value = "Eduardo's Resort"
    ws.getCell(`B${r}`).font = { bold: true, size: 15, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`B${r}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }

    ws.getCell(`F${r}`).value = 'Generated'
    ws.getCell(`F${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`F${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`F${r}`).alignment = { horizontal: 'right' }

    ws.getCell(`G${r}`).value = report.generatedAt
    ws.getCell(`G${r}`).font = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`G${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`G${r}`).alignment = { horizontal: 'right' }
    ws.getRow(r).height = 28
    r++

    ws.mergeCells(`A${r}:G${r}`)
    ws.getCell(`A${r}`).value = 'Reservation and POS Sales Report'
    ws.getCell(`A${r}`).font = { italic: true, size: 10, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.getRow(r).height = 16
    r++

    r++

    ws.mergeCells(`A${r}:C${r}`)
    ws.getCell(`A${r}`).value = 'Sales Report'
    ws.getCell(`A${r}`).font = { bold: true, size: 12, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.getCell(`E${r}`).value = 'Status'
    ws.getCell(`E${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`E${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
    ws.getCell(`E${r}`).border = cardBorder
    ws.getCell(`E${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.mergeCells(`F${r}:G${r}`)
    ws.getCell(`F${r}`).value = report.applied.status
    ws.getCell(`F${r}`).font = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`F${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
    ws.getCell(`F${r}`).border = cardBorder
    ws.getRow(r).height = 18
    r++

    ws.mergeCells(`A${r}:C${r}`)
    ws.getCell(`A${r}`).value = report.dateRange
    ws.getCell(`A${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.getCell(`E${r}`).value = 'Search'
    ws.getCell(`E${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`E${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
    ws.getCell(`E${r}`).border = cardBorder
    ws.getCell(`E${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.mergeCells(`F${r}:G${r}`)
    ws.getCell(`F${r}`).value = report.applied.search
    ws.getCell(`F${r}`).font = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`F${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
    ws.getCell(`F${r}`).border = cardBorder
    ws.getRow(r).height = 16
    r++

    r++

    const cards = [
      { label: 'TOTAL BOOKINGS', value: String(report.totalBookings) },
      { label: 'TOTAL REVENUE', value: report.totalRevenue },
      { label: 'PEAK DAY', value: report.peakDay },
      { label: 'TOP SERVICE', value: report.topService }
    ]
    const cardCols = ['A', 'C', 'E', 'G']

    cards.forEach(({ label }, i) => {
      const cell = ws.getCell(`${cardCols[i]}${r}`)
      cell.value = label
      cell.font = { size: 8, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
      cell.border = { top: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR), bottom: { style: 'hair', color: { argb: C_CARD_BDR } } }
      cell.alignment = { horizontal: 'left', indent: 1 }
    })
    ws.getRow(r).height = 14
    r++

    cards.forEach(({ value }, i) => {
      const cell = ws.getCell(`${cardCols[i]}${r}`)
      cell.value = value
      cell.font = { bold: true, size: 12, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
      cell.border = { bottom: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR), top: { style: 'hair', color: { argb: C_CARD_BDR } } }
      cell.alignment = { horizontal: 'left', indent: 1, vertical: 'middle' }
    })
    ws.getRow(r).height = 22
    r++

    r++

    ws.mergeCells(`A${r}:G${r}`)
    secHdr(ws.getCell(`A${r}`), 'Status Breakdown')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Status')
    th(ws.getCell(`B${r}`), 'Bookings', true)
    th(ws.getCell(`C${r}`), 'Revenue', true)
    r++

    report.statusBreakdown.forEach((row, i) => {
      const alt = i % 2 === 1
      td(ws.getCell(`A${r}`), toStatusLabel(row.status), false, false, alt)
      td(ws.getCell(`B${r}`), row.count, true, false, alt)
      td(ws.getCell(`C${r}`), row.revenue, true, false, alt)
      r++
    })

    r++

    ws.mergeCells(`A${r}:C${r}`)
    secHdr(ws.getCell(`A${r}`), 'Category Breakdown')
    ws.mergeCells(`E${r}:G${r}`)
    secHdr(ws.getCell(`E${r}`), 'Payment Summary')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Category')
    th(ws.getCell(`B${r}`), 'Bookings', true)
    th(ws.getCell(`C${r}`), 'Revenue', true)
    th(ws.getCell(`E${r}`), 'Method')
    th(ws.getCell(`F${r}`), 'Count', true)
    th(ws.getCell(`G${r}`), 'Amount', true)
    r++

    const maxCPRows = Math.max(report.categoryBreakdown.length, report.paymentSummary.length, 1)
    for (let i = 0; i < maxCPRows; i++) {
      const alt = i % 2 === 1
      const c = report.categoryBreakdown[i]
      const p = report.paymentSummary[i]
      if (c) {
        td(ws.getCell(`A${r}`), c.category, false, false, alt)
        td(ws.getCell(`B${r}`), c.count, true, false, alt)
        td(ws.getCell(`C${r}`), c.revenue, true, false, alt)
      }
      if (p) {
        td(ws.getCell(`E${r}`), p.method, false, false, alt)
        td(ws.getCell(`F${r}`), p.count, true, false, alt)
        td(ws.getCell(`G${r}`), p.amount, true, false, alt)
      }
      r++
    }

    r++

    ws.mergeCells(`A${r}:G${r}`)
    secHdr(ws.getCell(`A${r}`), 'Top Booked Items by Category (Room, Cottage, Event)')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Category')
    th(ws.getCell(`B${r}`), 'Top Item')
    th(ws.getCell(`C${r}`), 'Bookings', true)
    r++

    report.topBookedItemsByCategory.forEach((row, i) => {
      const alt = i % 2 === 1
      td(ws.getCell(`A${r}`), row.category, false, false, alt)
      td(ws.getCell(`B${r}`), row.name, false, false, alt)
      td(ws.getCell(`C${r}`), row.count, true, false, alt)
      r++
    })

    r++

    ws.mergeCells(`A${r}:G${r}`)
    secHdr(ws.getCell(`A${r}`), 'Sales Channels Summary (Reservations, POS, E-Shop)')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Channel')
    th(ws.getCell(`B${r}`), 'Transactions', true)
    th(ws.getCell(`C${r}`), 'Revenue', true)
    r++

    report.channelSummary.forEach((row, i) => {
      const alt = i % 2 === 1
      td(ws.getCell(`A${r}`), row.channel, false, false, alt)
      td(ws.getCell(`B${r}`), row.count, true, false, alt)
      td(ws.getCell(`C${r}`), row.amount, true, false, alt)
      r++
    })

    r++

    ws.mergeCells(`A${r}:G${r}`)
    secHdr(ws.getCell(`A${r}`), 'Top POS Items')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Item')
    th(ws.getCell(`B${r}`), 'Sales', true)
    r++

    td(ws.getCell(`A${r}`), 'N/A')
    td(ws.getCell(`B${r}`), safeCurrency(0), true)

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `Reservations_Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)

    showExportPreview.value = false
    showToast('Export successful', 'success')
  } catch { showToast('Failed to export data', 'error') }
}

const applyFilters = () => { currentPage.value = 1; fetchBookings() }
const resetFilters = () => { filters.value = { search: '', status: '', from: '', to: '' }; currentPage.value = 1; fetchBookings() }
const prevPage     = () => { if (currentPage.value > 1) { currentPage.value--; fetchBookings() } }
const nextPage     = () => { if (currentPage.value < totalPages.value) { currentPage.value++; fetchBookings() } }
const showToast    = (msg, type = 'success') => { toastMessage.value = msg; toastType.value = type; setTimeout(() => toastMessage.value = '', 4000) }

const printReservationReportPreview = () => {
  const reportEl = document.getElementById('reservation-report-print')
  if (!reportEl) return
  const styles = `
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #fff; color: #0f172a; margin: 0; padding: 8mm; }
    .sales-report-print { width: 100%; background: #fff; }
    .srp-header { display: grid; grid-template-columns: 52px 1fr auto; gap: 0.55rem; align-items: center; border-bottom: 2px solid #0c3b5e; padding-bottom: 0.4rem; margin-bottom: 0.5rem; }
    .srp-logo { width: 44px; height: 44px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: #0c3b5e; color: #f4c400; font-weight: 800; font-size: 0.9rem; }
    .srp-header h2 { margin: 0; font-size: 0.92rem; color: #0c3b5e; }
    .srp-header p { margin: 0.2rem 0 0; font-size: 0.7rem; color: #64748b; }
    .srp-meta { text-align: right; display: flex; flex-direction: column; gap: 0.08rem; }
    .srp-meta span { font-size: 0.62rem; color: #64748b; }
    .srp-meta strong { font-size: 0.72rem; }
    .srp-section { margin-top: 0.45rem; }
    .srp-title-row { display: flex; justify-content: space-between; gap: 0.45rem; }
    .srp-title-row h3 { margin: 0; font-size: 0.88rem; color: #0c3b5e; }
    .srp-title-row p { margin: 0.2rem 0 0; font-size: 0.68rem; color: #64748b; }
    .srp-applied { border: 1px solid #dce8f3; border-radius: 8px; padding: 0.34rem 0.46rem; min-width: 190px; }
    .srp-applied div { display: flex; justify-content: space-between; gap: 0.4rem; font-size: 0.64rem; }
    .srp-applied span { color: #64748b; }
    .srp-cards { margin-top: 0.4rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.35rem; }
    .srp-card { border: 1px solid #dce8f3; border-radius: 8px; padding: 0.34rem 0.4rem; background: #fff; }
    .srp-card span { display: block; font-size: 0.5rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 0.1rem; }
    .srp-card strong { font-size: 0.8rem; font-weight: 800; color: #1e293b; }
    .srp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
    .srp-section h4 { margin: 0 0 0.2rem; color: #0c3b5e; font-size: 0.74rem; }
    .srp-table { width: 100%; border-collapse: collapse; border: 1px solid #dce8f3; }
    .srp-table th, .srp-table td { border: 1px solid #dce8f3; padding: 0.24rem 0.3rem; font-size: 0.64rem; text-align: left; }
    .srp-table th { background: #f0f6fb; color: #0c3b5e; font-weight: 700; }
    @page { size: A4 portrait; margin: 8mm; }
  `
  const win = window.open('', '', 'left=0,top=0,width=900,height=700,toolbar=0,scrollbars=1,status=0')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reservation Report</title><style>${styles}</style></head><body>${reportEl.outerHTML}</body></html>`)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 400)
}

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

/* ── Export Preview Modal ── */
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(12, 59, 94, .5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: .45rem;
}

.preview-modal {
  width: min(1180px, 98vw);
  max-height: 96vh;
  background: var(--color-white);
  border-radius: 18px;
  border: 1px solid var(--color-gray-border);
  box-shadow: 0 24px 48px rgba(12, 59, 94, .25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: .8rem 1rem;
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
}

.preview-title {
  margin: 0;
  font-size: .95rem;
  font-weight: 800;
  color: var(--color-white);
}

.preview-sub {
  margin: .2rem 0 0;
  font-size: .74rem;
  color: rgba(255, 255, 255, .72);
}

.preview-close {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, .3);
  background: rgba(255, 255, 255, .12);
  color: var(--color-white);
  cursor: pointer;
}

.preview-close:hover { background: rgba(255, 255, 255, .2); }

.preview-body {
  padding: .65rem .9rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: .6rem;
}

.report-preview-sheet-wrap {
  display: flex;
}

.report-preview-sheet {
  width: min(1080px, 100%);
  margin: 0 auto;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid #d8e3ee;
  border-radius: 16px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
  padding: .75rem;
  display: flex;
  flex-direction: column;
  gap: .55rem;
}

.report-sheet-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: .55rem;
  border-bottom: 1px solid var(--color-gray-border);
}

.report-sheet-brand {
  display: flex;
  gap: .65rem;
  align-items: center;
}

.report-sheet-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--color-navy);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  letter-spacing: .5px;
}

.report-sheet-name {
  font-size: .92rem;
  font-weight: 800;
  color: var(--color-navy);
}

.report-sheet-caption {
  margin-top: .18rem;
  font-size: .72rem;
  color: var(--color-text-light);
}

.report-sheet-meta-right {
  font-size: .72rem;
  color: var(--color-text-light);
}

.report-sheet-meta-right div {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .15rem;
}

.report-sheet-meta-right strong {
  color: var(--color-text-dark);
  font-size: .78rem;
}

.report-sheet-subhead {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: .5rem;
  padding: .58rem .72rem;
  border: 1px solid var(--color-gray-border);
  border-radius: 12px;
  background: var(--color-gray-bg);
}

.report-meta-key {
  display: block;
  font-size: .6rem;
  text-transform: uppercase;
  letter-spacing: .35px;
  color: var(--color-text-light);
  font-weight: 700;
}

.report-meta-val {
  display: block;
  margin-top: .1rem;
  color: var(--color-text-dark);
  font-size: .76rem;
}

.preview-loading {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .7rem;
  color: var(--color-text-light);
}

.preview-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: .45rem;
}

.preview-card {
  border: 1px solid var(--color-gray-border);
  border-radius: 12px;
  padding: .5rem .62rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.preview-label {
  display: block;
  font-size: .6rem;
  font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: .35px;
}

.preview-value {
  font-size: .86rem;
  color: var(--color-navy);
  font-weight: 800;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: .7rem 1rem;
  font-size: .78rem;
  color: var(--color-text-light);
  padding: .7rem .85rem;
  border: 1px solid var(--color-gray-border);
  border-radius: 10px;
  background: var(--color-gray-bg);
}

.preview-meta strong { color: var(--color-text-dark); }

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .55rem;
}

.preview-doc-section {
  border: 1px solid var(--color-gray-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-white);
}

.preview-doc-title {
  margin: 0;
  padding: .52rem .7rem;
  font-size: .72rem;
  font-weight: 800;
  color: var(--color-navy);
  background: #edf4fb;
  border-bottom: 1px solid var(--color-gray-border);
}

.preview-panel {
  border: 1px solid var(--color-gray-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-white);
}

.preview-panel h4 {
  margin: 0;
  padding: .52rem .7rem;
  font-size: .72rem;
  font-weight: 800;
  color: var(--color-navy);
  background: var(--color-gray-bg);
  border-bottom: 1px solid var(--color-gray-border);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .72rem;
}

.preview-table th,
.preview-table td {
  padding: .38rem .55rem;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
}

.preview-table th {
  font-size: .6rem;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: .3px;
}

.preview-table td:nth-child(2),
.preview-table td:nth-child(3),
.preview-table th:nth-child(2),
.preview-table th:nth-child(3) {
  white-space: nowrap;
}

.preview-table tbody tr:last-child td { border-bottom: none; }

.preview-foot {
  display: flex;
  justify-content: flex-end;
  gap: .6rem;
  padding: .55rem 1rem .75rem;
  border-top: 1px solid var(--color-gray-border);
  background: #fafcff;
}

@media (min-width: 1024px) {
  .report-preview-sheet {
    zoom: .8;
  }
}

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
  .preview-modal { width: 100%; max-height: 92vh; border-radius: 14px; }
  .preview-head, .preview-body, .preview-foot { padding-left: .85rem; padding-right: .85rem; }
  .preview-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .preview-grid { grid-template-columns: 1fr; }
  .report-sheet-head { flex-direction: column; align-items: flex-start; }
  .report-sheet-meta-right div { align-items: flex-start; }
  .report-sheet-subhead { grid-template-columns: 1fr; }
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

/* ── srp-* Report Preview Modal ── */
.sales-preview-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); z-index: 1200; display: flex; align-items: center; justify-content: center; padding: 0.45rem; }
.sales-preview-modal { background: #eef5fb; width: min(1280px, 99vw); max-height: 98vh; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }
.sales-preview-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 0.7rem; padding: 0.6rem 0.85rem; border-bottom: 1px solid #d7e4ef; background: #fff; flex-shrink: 0; }
.sales-preview-toolbar h3 { margin: 0; font-size: 0.9rem; color: #1f2937; }
.sales-preview-toolbar p  { margin: 0.2rem 0 0; font-size: 0.72rem; color: #64748b; }
.sales-preview-actions { display: flex; gap: 0.45rem; flex-wrap: wrap; }
.sales-preview-scroll { overflow-y: auto; overflow-x: hidden; flex: 1; min-height: 0; padding: 0.55rem; display: flex; align-items: flex-start; justify-content: center; }
.sales-report-print { width: min(1140px, 100%); margin: 0 auto; background: #fff; color: #0f172a; padding: 7mm; box-shadow: 0 4px 20px rgba(15,23,42,0.16); }
.srp-header { display: grid; grid-template-columns: 52px 1fr auto; gap: 0.55rem; align-items: center; border-bottom: 2px solid #0c3b5e; padding-bottom: 0.4rem; }
.srp-logo { width: 44px; height: 44px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: #0c3b5e; color: #f4c400; font-weight: 800; }
.srp-header h2 { margin: 0; font-size: 0.92rem; color: #0c3b5e; }
.srp-header p  { margin: 0.2rem 0 0; font-size: 0.7rem; color: #64748b; }
.srp-meta { text-align: right; display: flex; flex-direction: column; gap: 0.08rem; }
.srp-meta span   { font-size: 0.62rem; color: #64748b; }
.srp-meta strong { font-size: 0.72rem; }
.srp-section { margin-top: 0.45rem; }
.srp-title-row { display: flex; justify-content: space-between; gap: 0.45rem; }
.srp-title-row h3 { margin: 0; font-size: 0.88rem; color: #0c3b5e; }
.srp-title-row p  { margin: 0.2rem 0 0; font-size: 0.68rem; color: #64748b; }
.srp-applied { border: 1px solid #dce8f3; border-radius: 8px; padding: 0.34rem 0.46rem; min-width: 190px; }
.srp-applied div  { display: flex; justify-content: space-between; gap: 0.4rem; font-size: 0.64rem; }
.srp-applied span { color: #64748b; }
.srp-cards { margin-top: 0.4rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.35rem; }
.srp-card { border: 1px solid #dce8f3; border-radius: 8px; padding: 0.34rem 0.4rem; background: #fff; }
.srp-card span { display: block; font-size: 0.5rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 0.1rem; }
.srp-card strong { font-size: 0.8rem; font-weight: 800; color: #1e293b; }
.srp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
.srp-section h4 { margin: 0 0 0.2rem; color: #0c3b5e; font-size: 0.74rem; }
.srp-table { width: 100%; border-collapse: collapse; border: 1px solid #dce8f3; }
.srp-table th, .srp-table td { border: 1px solid #dce8f3; padding: 0.24rem 0.3rem; font-size: 0.64rem; text-align: left; }
.srp-table th { background: #f0f6fb; color: #0c3b5e; font-weight: 700; }
.srp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; padding: 3rem; }
.srp-spinner { width: 32px; height: 32px; border: 3px solid #dce8f3; border-top-color: #0c3b5e; border-radius: 50%; animation: srp-spin 0.7s linear infinite; }
@keyframes srp-spin { to { transform: rotate(360deg); } }
@media screen and (min-width: 1024px) { .sales-report-print { zoom: 0.8; } }
@media screen and (max-height: 820px) { .sales-report-print { zoom: 0.7; } }
.btn-download { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.25rem; background: linear-gradient(135deg, #2B6CB0 0%, #2C5282 100%); color: white; border: none; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-download:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(43,108,176,0.3); }
.btn-download:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-preview { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.1rem; background: #fff; color: #2C5282; border: 1px solid #2B6CB0; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-preview:hover { background: #EBF8FF; transform: translateY(-1px); }
.btn-preview:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
</style>