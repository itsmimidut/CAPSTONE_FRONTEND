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
      </div>
      
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import ReservationStats from '../../components/admin/ReservationStats.vue'
import ReservationFilters from '../../components/admin/ReservationFilters.vue'
import ReservationCalendar from '../../components/admin/ReservationCalendar.vue'
import { useNotificationStore } from '../../stores/notifications'

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
const notifications = useNotificationStore()

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

const fetchBookings = async () => {
  loading.value = true
  
  try {
    const params = new URLSearchParams()
    
    // Add pagination
    params.append('page', currentPage.value)
    params.append('limit', limit)
    
    // Map filters to backend params
    if (filters.value.search) params.append('search', filters.value.search)
    if (filters.value.status && filters.value.status !== 'all') params.append('status', filters.value.status)
    if (filters.value.from) params.append('startDate', filters.value.from)
    if (filters.value.to) params.append('endDate', filters.value.to)

    const response = await fetch(`http://localhost:8000/api/bookings/admin/reservations?${params}`)
    const result = await response.json()
    
    if (result.success) {
      console.log('📦 Admin reservations data:', result.data)
      
      // Map backend data to frontend format
      bookings.value = result.data.map(booking => {
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
      })
      
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
    alert('Failed to load bookings. Please try again.')
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
      alert('Booking confirmed successfully')
      // Refresh data
      fetchBookings()
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('Error confirming booking:', error)
    alert('Failed to confirm booking')
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
      alert('Booking cancelled successfully')
      // Refresh data
      fetchBookings()
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    alert('Failed to cancel booking')
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
      alert('Booking deleted successfully')
      // Refresh data
      fetchBookings()
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error('Error deleting booking:', error)
    alert('Failed to delete booking')
  }
}

const createNew = () => {
  alert('Create new reservation')
}

const exportData = () => {
  alert('Export functionality coming soon')
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
  notifications.setReservationPending(newCount)
})

onMounted(() => {
  fetchBookings()
})
</script>

<style scoped>
@import '../../assets/admin-styles.css';

/* Main Layout */
.admin-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%);
}

.main-content {
  margin-left: 0;
  padding: 2rem 1rem;
  transition: margin-left 0.3s ease;
}

@media (min-width: 768px) {
  .main-content {
    margin-left: 260px;
    padding: 2rem;
  }
}

.header-container {
  margin-bottom: 2rem;
}

/* Table Styles */
.desktop-table {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  border: 1px solid rgba(31, 141, 191, 0.1);
  margin-top: 2rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #F4C400;
}

.table-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F8DBF;
  margin: 0;
}

/* Button Styles */
.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1E88B6 0%, #1F8DBF 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.3);
}

.btn-outline {
  background: transparent;
  border: 2px solid #1F8DBF;
  color: #1F8DBF;
}

.btn-outline:hover {
  background: #F4C400;
  border-color: #F4C400;
  color: #1F8DBF;
  transform: translateY(-2px);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

/* Table Styles */
.reservations-table {
  width: 100%;
  border-collapse: collapse;
}

.reservations-table th {
  text-align: left;
  padding: 1rem 0.75rem;
  background: rgba(31, 141, 191, 0.05);
  color: #1F8DBF;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
}

.reservations-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid rgba(31, 141, 191, 0.1);
  color: #1E88B6;
  font-size: 0.875rem;
}

.reservations-table tbody tr:hover {
  background: rgba(244, 196, 0, 0.05);
}

.guest-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.guest-avatar-mini {
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  background: #F4C400;
  color: #1F8DBF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  border: 1px solid white;
}

.code-cell {
  font-family: monospace;
  font-weight: 500;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-pending {
  background: rgba(244, 196, 0, 0.15);
  color: #F4C400;
  border: 1px solid #F4C400;
}

.status-confirmed {
  background: rgba(31, 141, 191, 0.15);
  color: #1F8DBF;
  border: 1px solid #1F8DBF;
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid #ef4444;
}

/* Action Buttons */
.action-group {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.confirm-btn {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
}

.confirm-btn:hover {
  background: #1F8DBF;
  color: white;
  transform: scale(1.1);
}

.cancel-btn {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}

.cancel-btn:hover {
  background: #F4C400;
  color: #1F8DBF;
  transform: scale(1.1);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

/* Item Badges */
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