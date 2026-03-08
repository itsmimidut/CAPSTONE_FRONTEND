<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      current-path="/admin/reservations"
      @close="sidebarOpen = false"
    />

    <!-- Main Content -->
    <main 
      class="main-content"
      :class="{ shifted: sidebarCollapsed }"
    >
      <!-- Header -->
      <div class="header-container">
        <AdminHeader 
          title="Reservation Management"
          subtitle="Manage all guest bookings"
          :has-notifications="pendingCount > 0"
          :pending-count="pendingCount"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
        <!-- Quick Actions -->
      </div>

      <!-- QR Check-In Scanner Modal -->
      <QRCheckInScanner
        :is-open="isCheckinScannerOpen"
        @close="isCheckinScannerOpen = false"
        @check-in-success="handleCheckInSuccess"
      />
      
      <!-- Stats Grid -->
      <ReservationStats :stats="stats" />

      <!-- Filters -->
      <ReservationFilters
        v-model:search="filters.search"
        v-model:status="filters.status"
        v-model:from="filters.from"
        v-model:to="filters.to"
        @apply="applyFilters"
        @reset="resetFilters"
      />

      <!-- Reservation Calendar -->
      <ReservationCalendar
        ref="reservationCalendar"
        :bookings="bookings"
        @confirm="confirmBooking"
        @cancel="cancelBooking"
        @delete="deleteBooking"
      />

      <!-- Desktop Table -->
      <div class="desktop-table">
        <div class="table-header">
          <h3>Recent Reservations</h3>
          <div class="flex gap-2">
            <button @click="exportData" class="btn btn-outline">
              <i class="fas fa-download mr-2"></i>Export
            </button>
            <button @click="createNew" class="btn btn-primary">
              <i class="fas fa-plus mr-2"></i>New
            </button>
          </div>
        </div>

        <div style="overflow-x:auto">
          <table v-if="!loading && bookings.length > 0" class="reservations-table">
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Booking Type</th>
                <th>Payment Method</th>
                <th>Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in bookings" :key="booking.id">
                <td class="guest-cell">
                  <div class="guest-avatar-mini">
                    {{ booking.guest_name.charAt(0).toUpperCase() }}
                  </div>
                  <span>{{ booking.guest_name }}</span>
                </td>
                <td>{{ getCheckInDisplay(booking) }}</td>
                <td>{{ getCheckOutDisplay(booking) }}</td>
                <td>
                  <span :class="getItemBadgeClass(booking.items_list)" class="item-badge">
                    {{ getItemLabel(booking.items_list) }}
                  </span>
                </td>
                <td>{{ booking.payment_method || 'N/A' }}</td>
                <td class="code-cell">{{ booking.reservation_code || 'N/A' }}</td>
                <td>
                  <span :class="getStatusClass(booking.status)" class="status-badge">
                    {{ formatStatus(booking.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-group">
                    <button
                      v-if="booking.status === 'pending'"
                      @click="confirmBooking(booking.id)"
                      class="action-btn confirm-btn"
                      title="Confirm"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button
                      @click="cancelBooking(booking.id)"
                      class="action-btn cancel-btn"
                      title="Cancel"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                    <button
                      @click="deleteBooking(booking.id)"
                      class="action-btn delete-btn"
                      title="Delete"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="loading" class="text-center py-10">
            <i class="fas fa-spinner fa-spin text-3xl" style="color: #1F8DBF;"></i>
            <p class="mt-2" style="color: #1E88B6;">Loading bookings...</p>
          </div>

          <div v-if="!loading && bookings.length === 0" class="empty-state">
            <i class="fas fa-calendar-check"></i>
            <p>No bookings found</p>
            <button @click="createNew" class="btn btn-primary mt-3">
              <i class="fas fa-plus"></i> Create New Booking
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="table-footer" v-if="!loading && bookings.length > 0">
          <p class="text-sm" style="color: #6b7280;">
            Showing {{ (currentPage - 1) * limit + 1 }} to {{ Math.min(currentPage * limit, totalCount) }} of {{ totalCount }}
          </p>
          <div class="pagination">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="currentPage = page; fetchBookings()"
              :class="{ active: currentPage === page }"
              class="pagination-btn"
            >
              {{ page }}
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="mobile-cards">
        <div class="mobile-header">
          <h3>Recent Reservations</h3>
          <div class="flex gap-2">
            <button @click="exportData" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i>
            </button>
            <button @click="createNew" class="btn btn-primary btn-sm">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-10">
          <i class="fas fa-spinner fa-spin text-3xl" style="color: #1F8DBF;"></i>
        </div>

        <div v-else-if="bookings.length === 0" class="empty-state">
          <i class="fas fa-calendar-check"></i>
          <p>No bookings found</p>
        </div>

        <div v-else>
          <div
            v-for="booking in bookings"
            :key="booking.id"
            class="booking-card"
          >
            <div class="card-header">
              <div class="guest-info">
                <div class="guest-avatar">
                  {{ booking.guest_name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-semibold" style="color: #1F8DBF;">{{ booking.guest_name }}</div>
                  <div class="text-xs" style="color: #1E88B6;">{{ booking.email }}</div>
                </div>
              </div>
              <span :class="getStatusClass(booking.status)" class="status-badge">
                {{ formatStatus(booking.status) }}
              </span>
            </div>

            <div class="card-body">
              <div class="card-row">
                <div>
                  <div class="card-label">{{ isSwimmingBooking(booking.items_list) ? 'First Class' : 'Check-in' }}</div>
                  <div class="card-value">{{ getCheckInDisplay(booking) }}</div>
                </div>
                <div>
                  <div class="card-label">{{ isSwimmingBooking(booking.items_list) ? 'Last Class' : 'Check-out' }}</div>
                  <div class="card-value">{{ getCheckOutDisplay(booking) }}</div>
                </div>
              </div>
              <div class="card-row">
                <div>
                  <div class="card-label">Booking Type</div>
                  <div class="item-badge" :class="getItemBadgeClass(booking.items_list)">
                    {{ getItemLabel(booking.items_list) }}
                  </div>
                </div>
                <div>
                  <div class="card-label">Code</div>
                  <div class="card-value code">{{ booking.reservation_code || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button
                v-if="booking.status === 'pending'"
                @click="confirmBooking(booking.id)"
                class="action-btn confirm-btn"
              >
                <i class="fas fa-check"></i>
              </button>
              <button @click="cancelBooking(booking.id)" class="action-btn cancel-btn">
                <i class="fas fa-times"></i>
              </button>
              <button @click="deleteBooking(booking.id)" class="action-btn delete-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Toast Notification -->
    <div 
      v-if="toastMessage" 
      class="fixed bottom-8 right-8 px-6 py-4 rounded-xl font-bold text-sm shadow-2xl z-50 animate-slideIn text-white"
      :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import ReservationStats from '../../components/admin/ReservationStats.vue'
import ReservationFilters from '../../components/admin/ReservationFilters.vue'
import ReservationCalendar from '../../components/admin/ReservationCalendar.vue'
import QRCheckInScanner from '../../components/QRCheckInScanner.vue'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const activeTab = ref('all')
const loading = ref(false)
const bookings = ref([])
const currentPage = ref(1)
const limit = 15
const totalCount = ref(0)
const totalPages = ref(0)
const reservationCalendar = ref(null)
const isCheckinScannerOpen = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const filters = ref({
  search: '',
  status: '',
  from: '',
  to: ''
})

const stats = computed(() => {
  const statusCounts = bookings.value.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {})

  return [
    { label: 'Total', value: totalCount.value, type: 'total', icon: 'fas fa-calendar-check', color: 'blue' },
    { label: 'Confirmed', value: statusCounts.confirmed || 0, type: 'confirmed', icon: 'fas fa-check-circle', color: 'green' },
    { label: 'Pending', value: statusCounts.pending || 0, type: 'pending', icon: 'fas fa-clock', color: 'amber' },
    { label: 'Cancelled', value: statusCounts.cancelled || 0, type: 'cancelled', icon: 'fas fa-times-circle', color: 'red' }
  ]
})

const pendingCount = computed(() => 
  bookings.value.filter(b => b.status === 'pending').length
)

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const buildReservationParams = (page, pageLimit) => {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('limit', pageLimit)

  if (filters.value.search) params.append('search', filters.value.search)
  if (filters.value.status && filters.value.status !== 'all') params.append('status', filters.value.status)
  if (filters.value.from) params.append('startDate', filters.value.from)
  if (filters.value.to) params.append('endDate', filters.value.to)

  return params
}

const mapBookingData = (booking) => {
  const guestName = `${booking.first_name || ''} ${booking.last_name || ''}`.trim()

  return {
    id: booking.booking_id,
    guest_name: guestName || booking.email || 'Guest',
    email: booking.email || 'N/A',
    reservation_code: booking.booking_reference,
    check_in: booking.check_in_date,
    check_out: booking.check_out_date,
    adults: parseInt(booking.adults) || 0,
    children: parseInt(booking.children) || 0,
    status: booking.booking_status?.toLowerCase() || 'pending',
    payment_status: booking.payment_status,
    payment_method: booking.payment_method || 'N/A',
    payment_reference: booking.payment_reference || 'N/A',
    total: parseFloat(booking.total) || 0,
    item_count: booking.item_count || 0,
    items_list: booking.items_summary || 'N/A',
    items_descriptions: booking.items_descriptions || null
  }
}

const fetchAllBookingsForExport = async () => {
  const exportLimit = 200
  let page = 1
  let totalPageCount = 1
  const allBookings = []

  do {
    const params = buildReservationParams(page, exportLimit)
    const response = await fetch(`http://localhost:8000/api/bookings/admin/reservations?${params}`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch all bookings for export')
    }

    const currentPageData = Array.isArray(result.data) ? result.data : []
    allBookings.push(...currentPageData.map(mapBookingData))

    totalPageCount = Math.max(1, Number(result.pagination?.totalPages) || 1)
    page += 1
  } while (page <= totalPageCount)

  return allBookings
}

const toPercent = (value, total) => {
  if (!total) return '0.00%'
  return `${((value / total) * 100).toFixed(2)}%`
}

const fetchBookings = async () => {
  loading.value = true
  
  try {
    const params = buildReservationParams(currentPage.value, limit)

    const response = await fetch(`http://localhost:8000/api/bookings/admin/reservations?${params}`)
    const result = await response.json()
    
    if (result.success) {
      console.log('📦 Admin reservations data:', result.data)
      showToast('✅ Reservations loaded successfully', 'success')
      
      // Map backend data to frontend format
      bookings.value = (Array.isArray(result.data) ? result.data : []).map(mapBookingData)
      
      // Update pagination info
      if (result.pagination) {
        totalCount.value = result.pagination.totalCount
        totalPages.value = result.pagination.totalPages
      } else {
        totalCount.value = bookings.value.length
        totalPages.value = 1
      }
    } else {
      throw new Error(result.message || 'Failed to fetch bookings')
    }
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    bookings.value = []
    showToast('❌ Failed to load bookings', 'error')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  // Check if it's the default 1970 date (invalid date)
  if (date.getFullYear() === 1970) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Helper function to parse swimming details from item_description
const parseSwimmingDetails = (itemsDescriptions) => {
  if (!itemsDescriptions) return null
  
  try {
    // Split multiple descriptions (separated by |||)
    const descriptions = itemsDescriptions.split('|||')
    
    for (const desc of descriptions) {
      if (!desc || desc === 'null') continue
      
      try {
        const parsed = JSON.parse(desc)
        // Check if this is swimming details (has dates array)
        if (parsed && parsed.dates && Array.isArray(parsed.dates)) {
          return parsed
        }
      } catch (e) {
        // Skip if can't parse individual description
        continue
      }
    }
  } catch (error) {
    console.error('Error parsing swimming details:', error)
  }
  
  return null
}

// Check if booking is a swimming lesson
const isSwimmingBooking = (itemsList) => {
  if (!itemsList) return false
  return String(itemsList).toLowerCase().includes('swimming')
}

// Get display dates for check-in (for swimming, returns first class date)
const getCheckInDisplay = (booking) => {
  if (isSwimmingBooking(booking.items_list)) {
    const swimmingDetails = parseSwimmingDetails(booking.items_descriptions)
    if (swimmingDetails && swimmingDetails.dates && swimmingDetails.dates.length > 0) {
      // Return first date
      return formatDate(swimmingDetails.dates[0])
    }
  }
  return formatDate(booking.check_in)
}

// Get display dates for check-out (for swimming, returns last class date)
const getCheckOutDisplay = (booking) => {
  if (isSwimmingBooking(booking.items_list)) {
    const swimmingDetails = parseSwimmingDetails(booking.items_descriptions)
    if (swimmingDetails && swimmingDetails.dates && swimmingDetails.dates.length > 0) {
      // Return last date
      const lastDate = swimmingDetails.dates[swimmingDetails.dates.length - 1]
      return formatDate(lastDate)
    }
  }
  return formatDate(booking.check_out)
}

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').toUpperCase()
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    checked_in: 'status-confirmed',
    checked_out: 'status-confirmed',
    cancelled: 'status-cancelled',
    no_show: 'status-cancelled'
  }
  return classes[status] || 'status-pending'
}

const getItemLabel = (itemsList) => {
  if (!itemsList || itemsList === 'N/A') return 'Other'
  
  const itemsStr = String(itemsList).toLowerCase()
  
  // Check for swimming lesson variations
  if (itemsStr.includes('swimming lesson')) {
    // Extract lesson type if possible
    const match = String(itemsList).match(/Swimming Lesson - (.+?)(?:,|$)/i)
    if (match) {
      return `🏊 Swimming: ${match[1].trim()}`
    }
    return '🏊 Swimming Lesson'
  }
  
  // Check for room types
  if (itemsStr.includes('deluxe room') || itemsStr.includes('room')) {
    // Extract room name if possible
    const match = String(itemsList).match(/(.+?room[^,]*)/i)
    if (match) {
      return `🏨 ${match[1].trim()}`
    }
    return '🏨 Room'
  }
  
  if (itemsStr.includes('cottage')) {
    return '🏠 Cottage'
  }
  
  if (itemsStr.includes('event')) {
    return '🎉 Event'
  }
  
  return String(itemsList)
}

const getItemBadgeClass = (itemsList) => {
  if (!itemsList || itemsList === 'N/A') return 'badge-other'
  
  const itemsStr = String(itemsList).toLowerCase()
  
  if (itemsStr.includes('swimming')) {
    return 'badge-swimming'
  }
  if (itemsStr.includes('room')) {
    return 'badge-room'
  }
  if (itemsStr.includes('cottage')) {
    return 'badge-cottage'
  }
  if (itemsStr.includes('event')) {
    return 'badge-event'
  }
  
  return 'badge-other'
}

const confirmBooking = async (id) => {
  if (!confirm('Confirm this booking?')) return
  
  try {
    console.log('Confirming booking:', id)
    const response = await fetch(`http://localhost:8000/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_status: 'Confirmed'
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      showToast('✅ Booking confirmed successfully', 'success')
      // Refresh data
      fetchBookings()
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('Error confirming booking:', error)
    showToast('❌ Failed to confirm booking', 'error')
  }
}

const cancelBooking = async (id) => {
  if (!confirm('Cancel this booking?')) return
  
  try {
    console.log('Cancelling booking:', id)
    const response = await fetch(`http://localhost:8000/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_status: 'Cancelled'
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      showToast('✅ Booking cancelled successfully', 'success')
      // Refresh data
      fetchBookings()
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    showToast('❌ Failed to cancel booking', 'error')
  }
}

const deleteBooking = async (id) => {
  if (!confirm('Delete this booking permanently? This action cannot be undone.')) return
  
  try {
    console.log('Deleting booking:', id)
    const response = await fetch(`http://localhost:8000/api/bookings/${id}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (result.success) {
      showToast('✅ Booking deleted successfully', 'success')
      // Refresh data
      fetchBookings()
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('Error deleting booking:', error)
    showToast('❌ Failed to delete booking', 'error')
  }
}

const handleCheckInSuccess = () => {
  // Refresh bookings after successful check-in
  isCheckinScannerOpen.value = false
  fetchBookings()
  // Show success toast
  showToast('✅ Guest checked in successfully', 'success')
}

const createNew = () => {
  showToast('📋 Create new reservation feature coming soon', 'info')
}

const exportData = async () => {
  try {
    const exportBookings = await fetchAllBookingsForExport()

    // Prepare booking details data
    const bookingDetails = exportBookings.map((b, index) => ({
      'No.': index + 1,
      'Guest Name': b.guest_name,
      'Email': b.email,
      'Check In': getCheckInDisplay(b),
      'Check Out': getCheckOutDisplay(b),
      'Booking Type': getItemLabel(b.items_list).replace(/[🏨🏠🏊🎉]/g, '').trim(),
      'Payment Method': b.payment_method,
      'Booking Code': b.reservation_code,
      'Status': formatStatus(b.status),
      'Amount': b.total
    }))

    // Calculate revenue summary by month
    const monthlyData = {}
    exportBookings.forEach(b => {
      const date = new Date(b.check_in)
      if (Number.isNaN(date.getTime()) || date.getFullYear() === 1970) return

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          total_bookings: 0,
          total_revenue: 0,
          confirmed: 0,
          pending: 0,
          cancelled: 0
        }
      }
      
      monthlyData[monthKey].total_bookings++
      monthlyData[monthKey].total_revenue += b.total
      if (b.status === 'confirmed' || b.status === 'checked_in') monthlyData[monthKey].confirmed++
      else if (b.status === 'pending') monthlyData[monthKey].pending++
      else if (b.status === 'cancelled') monthlyData[monthKey].cancelled++
    })

    const revenueSummary = Object.values(monthlyData).map(m => ({
      'Month': m.month,
      'Total Bookings': m.total_bookings,
      'Total Revenue': m.total_revenue,
      'Confirmed': m.confirmed,
      'Pending': m.pending,
      'Cancelled': m.cancelled
    }))

    // Calculate totals
    const totalBookings = exportBookings.length
    const confirmedBookings = exportBookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in').length
    const pendingBookings = exportBookings.filter(b => b.status === 'pending').length
    const cancelledBookings = exportBookings.filter(b => b.status === 'cancelled').length
    
    const totalRevenue = exportBookings.reduce((sum, b) => sum + b.total, 0)
    const confirmedRevenue = exportBookings
      .filter(b => b.status === 'confirmed' || b.status === 'checked_in')
      .reduce((sum, b) => sum + b.total, 0)
    const pendingRevenue = exportBookings
      .filter(b => b.status === 'pending')
      .reduce((sum, b) => sum + b.total, 0)
    const cancelledRevenue = exportBookings
      .filter(b => b.status === 'cancelled')
      .reduce((sum, b) => sum + b.total, 0)

    // Profit calculations (assuming 25% operating costs)
    const operatingCostPercentage = 0.25
    const operatingCosts = totalRevenue * operatingCostPercentage
    const netProfit = totalRevenue - operatingCosts
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0

    const profitAnalysis = [
      { 'FINANCIAL SUMMARY': '', 'Amount': '', 'Percentage': '' },
      { 'FINANCIAL SUMMARY': 'Total Revenue', 'Amount': totalRevenue, 'Percentage': '100%' },
      { 'FINANCIAL SUMMARY': 'Confirmed Payments', 'Amount': confirmedRevenue, 'Percentage': toPercent(confirmedRevenue, totalRevenue) },
      { 'FINANCIAL SUMMARY': 'Pending Payments', 'Amount': pendingRevenue, 'Percentage': toPercent(pendingRevenue, totalRevenue) },
      { 'FINANCIAL SUMMARY': 'Cancelled/Refunded', 'Amount': cancelledRevenue, 'Percentage': toPercent(cancelledRevenue, totalRevenue) },
      { 'FINANCIAL SUMMARY': '', 'Amount': '', 'Percentage': '' },
      { 'FINANCIAL SUMMARY': 'Operating Costs (25%)', 'Amount': operatingCosts.toFixed(2), 'Percentage': '25%' },
      { 'FINANCIAL SUMMARY': 'Net Profit', 'Amount': netProfit.toFixed(2), 'Percentage': profitMargin + '%' },
      { 'FINANCIAL SUMMARY': '', 'Amount': '', 'Percentage': '' },
      { 'FINANCIAL SUMMARY': 'BOOKING SUMMARY', 'Amount': '', 'Percentage': '' },
      { 'FINANCIAL SUMMARY': 'Total Bookings', 'Amount': totalBookings, 'Percentage': '100%' },
      { 'FINANCIAL SUMMARY': 'Confirmed', 'Amount': confirmedBookings, 'Percentage': toPercent(confirmedBookings, totalBookings) },
      { 'FINANCIAL SUMMARY': 'Pending', 'Amount': pendingBookings, 'Percentage': toPercent(pendingBookings, totalBookings) },
      { 'FINANCIAL SUMMARY': 'Cancelled', 'Amount': cancelledBookings, 'Percentage': toPercent(cancelledBookings, totalBookings) }
    ]

    // Create Excel workbook
    const workbook = XLSX.utils.book_new()
    
    // Add sheets
    const ws1 = XLSX.utils.json_to_sheet(bookingDetails)
    const ws2 = XLSX.utils.json_to_sheet(revenueSummary)
    const ws3 = XLSX.utils.json_to_sheet(profitAnalysis)
    
    // Set column widths
    ws1['!cols'] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 }
    ]
    
    ws2['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }]
    ws3['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }]
    
    XLSX.utils.book_append_sheet(workbook, ws1, 'Booking Details')
    XLSX.utils.book_append_sheet(workbook, ws2, 'Revenue Summary')
    XLSX.utils.book_append_sheet(workbook, ws3, 'Profit Analysis')
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `Reservations_Report_${timestamp}.xlsx`
    
    // Write file
    XLSX.writeFile(workbook, filename)
    
    // Show success toast
    showToast(`✅ Export successful! File: ${filename}`, 'success')
  } catch (error) {
    console.error('Export error:', error)
    showToast('❌ Failed to export data. Please try again.', 'error')
  }
}

const applyFilters = () => {
  currentPage.value = 1
  fetchBookings()
}

const resetFilters = () => {
  filters.value = {
    search: '',
    status: '',
    from: '',
    to: ''
  }
  currentPage.value = 1
  fetchBookings()
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchBookings()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchBookings()
  }
}

// Update notification store when pending count changes
watch(() => pendingCount.value, (newCount) => {
  // Notifications watch (if needed)
})

// Toast helper function
const showToast = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => toastMessage.value = '', 4000)
}

let pollInterval = null
let visibilityHandler = null

onMounted(() => {
  fetchBookings()

  // Auto-poll every 30 seconds so the list stays real-time
  pollInterval = setInterval(() => fetchBookings(), 30000)

  // Refetch immediately when the user switches back to this browser tab
  visibilityHandler = () => {
    if (document.visibilityState === 'visible') fetchBookings()
  }
  document.addEventListener('visibilitychange', visibilityHandler)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  if (visibilityHandler) document.removeEventListener('visibilitychange', visibilityHandler)
})
</script>

<style scoped>
@import '../../assets/admin-styles.css';

.header-container {
  margin-bottom: 1.5rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.quick-actions .btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.item-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.badge-swimming {
  background: rgba(31, 141, 191, 0.15);
  color: #1F8DBF;
  border: 1px solid #1F8DBF;
}

.badge-room {
  background: rgba(244, 196, 0, 0.15);
  color: #F4C400;
  border: 1px solid #F4C400;
}

.badge-cottage {
  background: rgba(30, 136, 182, 0.15);
  color: #1E88B6;
  border: 1px solid #1E88B6;
}

.badge-event {
  background: rgba(242, 194, 0, 0.15);
  color: #F2C200;
  border: 1px solid #F2C200;
}

.badge-other {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(31, 141, 191, 0.1);
}

/* Pagination */
.pagination {
  display: flex;
  gap: 0.25rem;
}

.pagination-btn {
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid rgba(31, 141, 191, 0.2);
  background: white;
  color: #1F8DBF;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #F4C400;
  border-color: #F4C400;
  color: #1F8DBF;
}

.pagination-btn.active {
  background: #1F8DBF;
  color: white;
  border-color: #1F8DBF;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #F4C400;
  color: #1F8DBF;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #F4C400;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}

/* Mobile Cards */
.mobile-cards {
  display: none;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .desktop-table {
    display: none;
  }
  
  .mobile-cards {
    display: block;
  }
  
  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #F4C400;
  }
  
  .mobile-header h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1F8DBF;
    margin: 0;
  }
}

.booking-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  border: 1px solid rgba(31, 141, 191, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(244, 196, 0, 0.3);
}

.guest-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.guest-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  background: #F4C400;
  color: #1F8DBF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  border: 2px solid white;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.card-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 600;
}

.card-value {
  font-size: 0.875rem;
  color: #1E88B6;
  font-weight: 500;
}

.card-value.code {
  font-family: monospace;
  background: rgba(31, 141, 191, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(244, 196, 0, 0.2);
}
</style>