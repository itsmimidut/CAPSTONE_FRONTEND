<template>
  <div class="admin-layout">
    <AdminSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <main class="main-content" :class="{ shifted: sidebarCollapsed }">
      <div class="header-container no-print">
        <AdminHeader
          title="Sales Report"
          subtitle="Generate structured, printable sales reports"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

      <div class="content-wrap">
        <section class="panel no-print">
          <div class="panel-head">
            <div>
              <h2>Report Filters</h2>
              <p>Filter by date range, status, and customer/search terms.</p>
            </div>
          </div>

          <div class="filters-grid">
            <div class="field">
              <label for="fromDate">From</label>
              <input id="fromDate" v-model="filters.from" type="date" />
            </div>

            <div class="field">
              <label for="toDate">To</label>
              <input id="toDate" v-model="filters.to" type="date" />
            </div>

            <div class="field">
              <label for="statusFilter">Status</label>
              <select id="statusFilter" v-model="filters.status">
                <option value="all">All statuses</option>
                <option v-for="status in statusOptions" :key="status" :value="status">
                  {{ statusLabel(status) }}
                </option>
              </select>
            </div>

            <div class="field field--wide">
              <label for="searchFilter">Search</label>
              <input
                id="searchFilter"
                v-model.trim="filters.search"
                type="text"
                placeholder="Name, email, booking code"
              />
            </div>
          </div>

          <div class="actions-row">
            <button class="btn btn-primary" :disabled="isGenerating" @click="handleGenerateReport">
              <i class="fas" :class="isGenerating ? 'fa-spinner fa-spin' : 'fa-file-lines'"></i>
              {{ isGenerating ? 'Generating...' : 'Generate Report' }}
            </button>

            <button class="btn btn-secondary" :disabled="isGenerating" @click="resetFilters">
              <i class="fas fa-rotate-left"></i>
              Reset Filters
            </button>
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </section>

        <section v-if="reportHistory.length" class="panel panel--history no-print">
          <div class="panel-head compact">
            <div>
              <h2>Recent Reports</h2>
              <p>Last generated summaries saved locally.</p>
            </div>
          </div>

          <div class="history-list">
            <div v-for="item in reportHistory" :key="item.id" class="history-chip">
              <span>{{ item.title }}</span>
              <strong>{{ item.totalRevenue }}</strong>
              <small>{{ item.generatedAt }}</small>
            </div>
          </div>
        </section>
      </div>

      <div v-if="showPreview && report" class="preview-overlay no-print" @click.self="showPreview = false">
        <div class="preview-modal">
          <div class="preview-toolbar">
            <div>
              <h3>Sales Report Preview</h3>
              <p>Review before printing</p>
            </div>

            <div class="toolbar-actions">
              <button class="btn btn-primary" @click="printReport">
                <i class="fas fa-print"></i>
                Print Report
              </button>
              <button class="btn btn-secondary" @click="downloadCsv">
                <i class="fas fa-file-csv"></i>
                Download CSV
              </button>
              <button class="btn btn-ghost" @click="showPreview = false">
                <i class="fas fa-xmark"></i>
                Close
              </button>
            </div>
          </div>

          <div class="preview-scroll">
            <article class="report-print" id="sales-report-print">
              <header class="report-header">
                <div class="brand-mark">ER</div>
                <div>
                  <h1>Eduardo's Resort</h1>
                  <p>Comprehensive reservation and POS sales reporting</p>
                </div>
                <div class="doc-meta">
                  <span>Generated</span>
                  <strong>{{ formatDateTime(report.generatedAt) }}</strong>
                </div>
              </header>

              <section class="report-title-row">
                <div>
                  <h2>{{ report.title }}</h2>
                  <p>{{ report.rangeText }}</p>
                </div>
                <div class="applied-filters">
                  <div><span>Status</span><strong>{{ report.appliedFilters.status }}</strong></div>
                  <div><span>Search</span><strong>{{ report.appliedFilters.search }}</strong></div>
                  <div><span>Date</span><strong>{{ report.appliedFilters.dateRange }}</strong></div>
                </div>
              </section>

              <section class="summary-grid">
                <div class="summary-card">
                  <span>Total Bookings</span>
                  <strong>{{ report.totalBookings }}</strong>
                </div>
                <div class="summary-card">
                  <span>Total Revenue</span>
                  <strong>{{ currency(report.totalRevenue) }}</strong>
                </div>
                <div class="summary-card">
                  <span>Peak Day</span>
                  <strong>{{ report.peakDay.label }}</strong>
                  <small>{{ report.peakDay.count }} bookings</small>
                </div>
                <div class="summary-card">
                  <span>Top Service</span>
                  <strong>{{ report.topService.name }}</strong>
                  <small>{{ currency(report.topService.revenue) }}</small>
                </div>
              </section>

              <section class="report-section">
                <h3>Status Breakdown</h3>
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in report.statusBreakdown" :key="item.status">
                      <td>{{ statusLabel(item.status) }}</td>
                      <td>{{ item.count }}</td>
                      <td>{{ currency(item.revenue) }}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="report-section two-col">
                <div>
                  <h3>Category Breakdown</h3>
                  <table class="report-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Bookings</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in report.categoryBreakdown" :key="item.category">
                        <td>{{ item.category }}</td>
                        <td>{{ item.count }}</td>
                        <td>{{ currency(item.revenue) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3>Payment Summary</h3>
                  <table class="report-table">
                    <thead>
                      <tr>
                        <th>Method</th>
                        <th>Count</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in report.paymentSummary" :key="item.method">
                        <td>{{ item.method }}</td>
                        <td>{{ item.count }}</td>
                        <td>{{ currency(item.amount) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section class="report-section">
                <h3>Booking Details</h3>
                <table class="report-table report-table--dense">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Guest</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Payment</th>
                      <th>Check-in</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="booking in report.bookings" :key="booking.id">
                      <td>{{ booking.reservationCode }}</td>
                      <td>{{ booking.guestName }}</td>
                      <td>{{ statusLabel(booking.status) }}</td>
                      <td>{{ booking.category }}</td>
                      <td>{{ booking.paymentMethod }}</td>
                      <td>{{ formatDate(booking.checkIn) }}</td>
                      <td>{{ currency(booking.total) }}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </article>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'
import AdminHeader from '../../components/Admin/AdminHeader.vue'

const API_BASE = 'http://localhost:8000/api/bookings/admin/reservations'
const route = useRoute()

const sidebarOpen = ref(true)
const sidebarCollapsed = ref(false)

const isGenerating = ref(false)
const showPreview = ref(false)
const errorMessage = ref('')
const report = ref(null)
const reportHistory = ref([])

const statusOptions = [
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
  'no_show'
]

const filters = ref({
  from: '',
  to: '',
  status: 'all',
  search: ''
})

const todayISO = computed(() => new Date().toISOString().split('T')[0])

const statusLabel = (value) => {
  if (!value) return 'Unknown'
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const currency = (value) => {
  const amount = Number(value || 0)
  return amount.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-PH', { month: 'short', day: '2-digit', year: 'numeric' })
}

const formatDateTime = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-PH', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const normalizeStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase().replace(/-/g, '_')
  if (normalized === 'checked in') return 'checked_in'
  if (normalized === 'checked out') return 'checked_out'
  if (normalized === 'noshow') return 'no_show'
  return normalized || 'pending'
}

const detectCategory = (itemsSummary) => {
  const text = String(itemsSummary || '').toLowerCase()
  if (text.includes('swimming')) return 'Swimming'
  if (text.includes('cottage')) return 'Cottage'
  if (text.includes('event')) return 'Event'
  if (text.includes('room')) return 'Room'
  return 'Other'
}

const mapBooking = (raw) => {
  return {
    id: raw.booking_id,
    reservationCode: raw.booking_reference || 'N/A',
    guestName: `${raw.first_name || ''} ${raw.last_name || ''}`.trim() || raw.email || 'Guest',
    email: raw.email || '',
    status: normalizeStatus(raw.booking_status),
    checkIn: raw.check_in_date,
    checkOut: raw.check_out_date,
    paymentMethod: (raw.payment_method || 'Unknown').toUpperCase(),
    total: Number(raw.total || 0),
    category: detectCategory(raw.items_summary),
    itemsSummary: raw.items_summary || ''
  }
}

const buildParams = (page = 1, limit = 100) => {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('limit', String(limit))

  if (filters.value.search) params.append('search', filters.value.search)
  if (filters.value.status && filters.value.status !== 'all') params.append('status', filters.value.status)
  if (filters.value.from) params.append('startDate', filters.value.from)
  if (filters.value.to) params.append('endDate', filters.value.to)

  return params.toString()
}

const fetchFilteredBookings = async () => {
  const rows = []
  let page = 1
  let totalPages = 1

  do {
    const response = await fetch(`${API_BASE}?${buildParams(page, 200)}`)
    const payload = await response.json()

    if (!payload.success) {
      throw new Error(payload.message || 'Failed to fetch report data')
    }

    const pageRows = Array.isArray(payload.data) ? payload.data.map(mapBooking) : []
    rows.push(...pageRows)

    totalPages = Number(payload.pagination?.totalPages || 1)
    page += 1
  } while (page <= totalPages)

  return rows
}

const applySearchFilter = (rows) => {
  const q = filters.value.search.trim().toLowerCase()
  if (!q) return rows

  return rows.filter((row) => {
    return [row.guestName, row.email, row.reservationCode]
      .some((value) => String(value || '').toLowerCase().includes(q))
  })
}

const aggregateMapToArray = (mapObj, keyName, valueNames) => {
  return Object.entries(mapObj)
    .map(([key, values]) => ({ [keyName]: key, ...values }))
    .sort((a, b) => b[valueNames[0]] - a[valueNames[0]])
}

const buildSalesReport = (rows) => {
  const totalBookings = rows.length
  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.total || 0), 0)

  const statusMap = {}
  const categoryMap = {}
  const paymentMap = {}
  const dayMap = {}

  for (const row of rows) {
    const status = row.status || 'pending'
    const category = row.category || 'Other'
    const method = row.paymentMethod || 'UNKNOWN'

    if (!statusMap[status]) statusMap[status] = { count: 0, revenue: 0 }
    if (!categoryMap[category]) categoryMap[category] = { count: 0, revenue: 0 }
    if (!paymentMap[method]) paymentMap[method] = { count: 0, amount: 0 }

    statusMap[status].count += 1
    statusMap[status].revenue += Number(row.total || 0)

    categoryMap[category].count += 1
    categoryMap[category].revenue += Number(row.total || 0)

    paymentMap[method].count += 1
    paymentMap[method].amount += Number(row.total || 0)

    const dayKey = formatDate(row.checkIn)
    if (!dayMap[dayKey]) dayMap[dayKey] = { count: 0, revenue: 0 }
    dayMap[dayKey].count += 1
    dayMap[dayKey].revenue += Number(row.total || 0)
  }

  const statusBreakdown = statusOptions.map((status) => ({
    status,
    count: statusMap[status]?.count || 0,
    revenue: statusMap[status]?.revenue || 0
  }))

  const categoryBreakdown = aggregateMapToArray(categoryMap, 'category', ['revenue'])
  const paymentSummary = aggregateMapToArray(paymentMap, 'method', ['amount'])

  const topService = categoryBreakdown[0]
    ? { name: categoryBreakdown[0].category, revenue: categoryBreakdown[0].revenue }
    : { name: 'N/A', revenue: 0 }

  const peakEntry = Object.entries(dayMap).sort((a, b) => b[1].count - a[1].count)[0]
  const peakDay = peakEntry
    ? { label: peakEntry[0], count: peakEntry[1].count, revenue: peakEntry[1].revenue }
    : { label: 'N/A', count: 0, revenue: 0 }

  const dateRangeText = filters.value.from || filters.value.to
    ? `${filters.value.from || 'Start'} to ${filters.value.to || 'Today'}`
    : 'All dates'

  return {
    id: Date.now(),
    title: 'Sales Report',
    generatedAt: new Date().toISOString(),
    rangeText: dateRangeText,
    appliedFilters: {
      status: filters.value.status === 'all' ? 'All statuses' : statusLabel(filters.value.status),
      search: filters.value.search || 'None',
      dateRange: dateRangeText
    },
    totalBookings,
    totalRevenue,
    statusBreakdown,
    categoryBreakdown,
    paymentSummary,
    peakDay,
    topService,
    bookings: rows
  }
}

const syncHistory = (newReport) => {
  const snapshot = {
    id: newReport.id,
    title: `${newReport.title} (${newReport.rangeText})`,
    totalRevenue: currency(newReport.totalRevenue),
    generatedAt: formatDateTime(newReport.generatedAt)
  }

  reportHistory.value = [snapshot, ...reportHistory.value].slice(0, 5)
  localStorage.setItem('salesReportHistory', JSON.stringify(reportHistory.value))
}

const handleGenerateReport = async () => {
  errorMessage.value = ''

  if (filters.value.from && filters.value.to && filters.value.from > filters.value.to) {
    errorMessage.value = 'Invalid date range: From date must be before To date.'
    return
  }

  isGenerating.value = true
  try {
    const fetchedRows = await fetchFilteredBookings()
    const searchedRows = applySearchFilter(fetchedRows)

    const nextReport = buildSalesReport(searchedRows)
    report.value = nextReport
    syncHistory(nextReport)
    showPreview.value = true
  } catch (error) {
    errorMessage.value = error.message || 'Failed to generate report.'
  } finally {
    isGenerating.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    from: '',
    to: '',
    status: 'all',
    search: ''
  }
  errorMessage.value = ''
}

const applyPeriodPreset = (period) => {
  const today = new Date()
  const toIso = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  let fromDate = null
  if (period === 'day') {
    fromDate = new Date(today)
  } else if (period === 'month') {
    fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
  } else if (period === 'year') {
    fromDate = new Date(today.getFullYear(), 0, 1)
  }

  if (!fromDate) return
  filters.value.from = toIso(fromDate)
  filters.value.to = toIso(today)
}

const printReport = () => {
  window.print()
}

const toCsvField = (value) => {
  const text = String(value ?? '')
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

const downloadCsv = () => {
  if (!report.value) return

  const header = ['Booking Code', 'Guest Name', 'Email', 'Status', 'Category', 'Payment Method', 'Check-in', 'Check-out', 'Total']
  const rows = report.value.bookings.map((item) => [
    item.reservationCode,
    item.guestName,
    item.email,
    statusLabel(item.status),
    item.category,
    item.paymentMethod,
    formatDate(item.checkIn),
    formatDate(item.checkOut),
    Number(item.total || 0).toFixed(2)
  ])

  const csv = [header, ...rows]
    .map((line) => line.map(toCsvField).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `sales-report-${todayISO.value}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  try {
    const stored = JSON.parse(localStorage.getItem('salesReportHistory') || '[]')
    if (Array.isArray(stored)) reportHistory.value = stored.slice(0, 5)
  } catch (_) {
    reportHistory.value = []
  }

  const periodQuery = String(route.query.period || '').toLowerCase()
  if (['day', 'month', 'year'].includes(periodQuery)) {
    applyPeriodPreset(periodQuery)
  }

  if (String(route.query.autoPreview || '') === '1') {
    handleGenerateReport()
  }
})
</script>

<style scoped>
.admin-layout {
  --color-primary: #0369a1;
  --color-primary-light: #1f8dbf;
  --color-primary-dark: #1e88b6;
  --color-gold: #f4c400;
  --color-navy: #0c3b5e;
  --color-white: #ffffff;
  --color-bg: #f4f8fc;
  --color-border: #dce8f3;
  --color-text: #1f2937;
  --color-muted: #64748b;

  min-height: 100vh;
  background: var(--color-bg);
}

.main-content {
  margin-left: 0;
  padding-top: 64px;
  transition: margin-left 0.3s ease;
}

.main-content.shifted {
  margin-left: 72px;
}

@media (min-width: 768px) {
  .main-content {
    margin-left: 262px;
  }
}

.header-container {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
}

.content-wrap {
  max-width: 1240px;
  margin: 1.25rem auto;
  padding: 0 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(3, 105, 161, 0.08);
  padding: 1rem 1rem 1.1rem;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.panel-head h2 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text);
}

.panel-head p {
  margin: 0.25rem 0 0;
  color: var(--color-muted);
  font-size: 0.84rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.34rem;
}

.field--wide {
  grid-column: span 1;
}

.field label {
  font-size: 0.74rem;
  text-transform: uppercase;
  color: var(--color-muted);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.field input,
.field select {
  height: 38px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  padding: 0 0.7rem;
  font-size: 0.85rem;
  color: var(--color-text);
  background: #fff;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(31, 141, 191, 0.15);
}

.actions-row {
  margin-top: 0.9rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 38px;
  border-radius: 10px;
  padding: 0 1rem;
  border: 1px solid transparent;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-navy);
  color: var(--color-white);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary);
}

.btn-secondary {
  border-color: var(--color-border);
  background: var(--color-white);
  color: var(--color-text);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-primary-light);
  color: var(--color-primary);
}

.btn-ghost {
  border-color: #fbcaca;
  background: #fff8f8;
  color: #b91c1c;
}

.panel--history {
  padding-top: 0.8rem;
}

.panel-head.compact {
  margin-bottom: 0.65rem;
}

.history-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.history-chip {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.45rem 0.65rem;
  display: flex;
  flex-direction: column;
  background: #f9fcff;
}

.history-chip span {
  font-size: 0.78rem;
  color: var(--color-text);
  font-weight: 600;
}

.history-chip strong {
  font-size: 0.8rem;
  color: var(--color-primary);
}

.history-chip small {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.error-message {
  margin-top: 0.75rem;
  color: #b91c1c;
  font-size: 0.84rem;
  font-weight: 600;
}

.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.preview-modal {
  background: #eef5fb;
  border-radius: 16px;
  width: min(1200px, 100%);
  max-height: 94vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-toolbar {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #d6e3ef;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  background: #ffffff;
}

.preview-toolbar h3 {
  margin: 0;
  font-size: 0.95rem;
}

.preview-toolbar p {
  margin: 0.2rem 0 0;
  font-size: 0.78rem;
  color: var(--color-muted);
}

.toolbar-actions {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.preview-scroll {
  overflow: auto;
  padding: 1rem;
  background: #eaf2f9;
}

.report-print {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  background: #ffffff;
  color: #111827;
  padding: 12mm;
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.14);
}

.report-header {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 0.75rem;
  align-items: center;
  border-bottom: 2px solid #0c3b5e;
  padding-bottom: 0.6rem;
}

.brand-mark {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #0c3b5e;
  color: #f4c400;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.report-header h1 {
  margin: 0;
  font-size: 1.08rem;
}

.report-header p {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: #475569;
}

.doc-meta {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.doc-meta span {
  color: #64748b;
  font-size: 0.72rem;
}

.doc-meta strong {
  font-size: 0.8rem;
}

.report-title-row {
  display: flex;
  justify-content: space-between;
  gap: 0.9rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.report-title-row h2 {
  margin: 0;
  font-size: 1.04rem;
}

.report-title-row p {
  margin: 0.22rem 0 0;
  color: #475569;
  font-size: 0.8rem;
}

.applied-filters {
  min-width: 260px;
  border: 1px solid #d9e6f2;
  border-radius: 10px;
  padding: 0.5rem 0.6rem;
}

.applied-filters div {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.74rem;
  padding: 0.12rem 0;
}

.applied-filters span {
  color: #64748b;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.summary-card {
  border: 1px solid #dce8f3;
  border-radius: 10px;
  padding: 0.55rem;
}

.summary-card span {
  font-size: 0.72rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-card strong {
  margin-top: 0.24rem;
  display: block;
  font-size: 0.96rem;
}

.summary-card small {
  color: #64748b;
  font-size: 0.72rem;
}

.report-section {
  margin-top: 0.75rem;
}

.report-section h3 {
  margin: 0 0 0.35rem;
  font-size: 0.88rem;
  color: #0c3b5e;
}

.report-section.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #dce8f3;
}

.report-table th,
.report-table td {
  border: 1px solid #dce8f3;
  padding: 0.34rem 0.4rem;
  font-size: 0.75rem;
  text-align: left;
}

.report-table th {
  background: #f0f6fb;
  color: #0c3b5e;
  font-weight: 700;
}

.report-table--dense th,
.report-table--dense td {
  font-size: 0.7rem;
}

@media (max-width: 1100px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }

  .field--wide {
    grid-column: span 2;
  }

  .preview-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .report-title-row,
  .report-section.two-col {
    grid-template-columns: 1fr;
    display: grid;
  }

  .summary-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 680px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .field--wide {
    grid-column: span 1;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
@media print {
  body * {
    visibility: hidden !important;
  }

  .report-print,
  .report-print * {
    visibility: visible !important;
  }

  .report-print {
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm;
    min-height: 297mm;
    margin: 0;
    padding: 10mm;
    box-shadow: none !important;
    color: #000 !important;
    background: #fff !important;
  }

  .report-print .summary-card,
  .report-print .report-table,
  .report-print .report-table th,
  .report-print .report-table td,
  .report-print .applied-filters {
    border-color: #000 !important;
  }

  .no-print {
    display: none !important;
  }

  @page {
    size: A4 portrait;
    margin: 8mm;
  }
}
</style>
