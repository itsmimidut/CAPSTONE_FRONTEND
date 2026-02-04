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

      <!-- Desktop Table -->
      <div class="desktop-table">
        <div class="table-header">
          <h3>Recent Reservations</h3>
          <div class="flex gap-2">
            <button @click="exportData" class="btn btn-outline">
              <i class="fas fa-download mr-2"></i>Export
            </button>
            <button @click="createNew" class="btn">
              <i class="fas fa-plus mr-2"></i>New
            </button>
          </div>
        </div>

        <div style="overflow-x:auto">
          <table v-if="!loading && bookings.length > 0">
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Room/Item</th>
                <th>Payment Method</th>
                <th>Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in bookings" :key="booking.id">
                <td>{{ booking.guest_name }}</td>
                <td>{{ formatDate(booking.check_in) }}</td>
                <td>{{ formatDate(booking.check_out) }}</td>
                <td>{{ booking.items_list || 'N/A' }}</td>
                <td>{{ booking.payment_method || 'N/A' }}</td>
                <td>{{ booking.reservation_code || 'N/A' }}</td>
                <td>
                  <span :class="getStatusClass(booking.status)">
                    {{ formatStatus(booking.status) }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-1">
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
            <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
            <p class="mt-2 text-gray-500">Loading bookings...</p>
          </div>

          <div v-if="!loading && bookings.length === 0" class="text-center py-10">
            <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
            <p class="text-gray-500">No bookings found</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="table-footer" v-if="!loading && bookings.length > 0">
          <p class="text-sm text-gray-500">
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
            <button @click="exportData" class="btn btn-outline text-xs px-2 py-1">
              <i class="fas fa-download"></i>
            </button>
            <button @click="createNew" class="btn text-xs px-2 py-1">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-10">
          <i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
        </div>

        <div v-else-if="bookings.length === 0" class="text-center py-10">
          <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">No bookings found</p>
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
                  <div class="font-semibold">{{ booking.guest_name }}</div>
                  <div class="text-xs text-gray-500">{{ booking.email }}</div>
                </div>
              </div>
              <span :class="getStatusClass(booking.status)">
                {{ formatStatus(booking.status) }}
              </span>
            </div>

            <div class="card-body">
              <div>
                <div class="card-label">Check-in</div>
                <div class="card-value">{{ formatDate(booking.check_in) }}</div>
              </div>
              <div>
                <div class="card-label">Check-out</div>
                <div class="card-value">{{ formatDate(booking.check_out) }}</div>
              </div>
              <div>
                <div class="card-label">Room/Item</div>
                <div class="card-value">{{ booking.items_list || 'N/A' }}</div>
              </div>
              <div>
                <div class="card-label">Payment Ref</div>
                <div class="card-value">{{ booking.payment_reference || 'N/A' }}</div>
              </div>
              <div>
                <div class="card-label">Code</div>
                <div class="card-value">{{ booking.reservation_code || 'N/A' }}</div>
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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import ReservationStats from '../../components/admin/ReservationStats.vue'
import ReservationFilters from '../../components/admin/ReservationFilters.vue'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const activeTab = ref('all')
const loading = ref(false)
const bookings = ref([])
const currentPage = ref(1)
const limit = 15
const totalCount = ref(0)
const totalPages = ref(0)

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
          adults: booking.adults || 0,
          children: booking.children || 0,
          status: booking.booking_status?.toLowerCase() || 'pending',
          payment_status: booking.payment_status,
          payment_method: booking.payment_method || 'N/A',
          payment_reference: booking.payment_reference || 'N/A',
          total: booking.total,
          item_count: booking.item_count || 0,
          items_list: booking.items_summary || 'N/A'
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
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').toUpperCase()
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'status status-pending',
    confirmed: 'status status-confirmed',
    checked_in: 'status status-confirmed',
    checked_out: 'status status-confirmed',
    cancelled: 'status status-cancelled',
    no_show: 'status status-cancelled'
  }
  return classes[status] || 'status'
}

const confirmBooking = async (id) => {
  if (!confirm('Confirm this booking?')) return
  
  try {
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
    const response = await fetch(`http://localhost:8000/api/bookings/${id}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (result.success) {
      alert('Booking deleted successfully')
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

onMounted(() => {
  fetchBookings()
})
</script>

<style scoped>
@import '../../assets/admin-styles.css';
</style>