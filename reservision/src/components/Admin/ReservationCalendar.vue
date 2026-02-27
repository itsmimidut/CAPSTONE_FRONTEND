<template>
  <div class="calendar-wrapper">
    <!-- Side Panel - Bookings List (LEFT) -->
    <div class="bookings-panel">
      <div v-if="selectedCheckinDate" class="panel-content">
        <div class="panel-header">
          <h3>Check-ins</h3>
          <p class="panel-date">{{ formatCheckinDate(selectedCheckinDate) }}</p>
        </div>

        <!-- MULTIPLE BOOKINGS VIEW - List -->
        <div v-if="selectedCheckinsList.length > 1 && !selectedBookingId" class="bookings-list-view">
          <p class="text-xs text-gray-500 mb-3">{{ selectedCheckinsList.length }} booking(s) on this date</p>
          <div class="bookings-list">
            <div 
              v-for="booking in selectedCheckinsList" 
              :key="booking.id"
              @click="selectedBookingId = booking.id"
              class="booking-list-item"
            >
              <div class="item-avatar">
                {{ booking.guest_name.split(' ')[0].charAt(0).toUpperCase() }}
              </div>
              <div class="item-info">
                <p class="item-name">{{ booking.guest_name }}</p>
                <p class="item-code">{{ booking.reservation_code || 'N/A' }}</p>
              </div>
              <span :class="getStatusClass(booking.status)" class="item-status">
                {{ formatStatus(booking.status) }}
              </span>
              <div class="item-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- SINGLE OR SELECTED BOOKING - Details -->
        <div v-else-if="selectedCheckinsList.length > 0" class="booking-details-view">
          <!-- Back button for selected booking -->
          <div v-if="selectedCheckinsList.length > 1 && selectedBookingId" class="back-button">
            <button @click="selectedBookingId = null" class="btn-back">
              <i class="fas fa-arrow-left"></i> Back to list
            </button>
          </div>

          <div class="booking-card">
            <!-- Back button for selected booking -->
            <div v-if="selectedCheckinsList.length > 1 && selectedBookingId" class="back-button-bar">
              <button @click="selectedBookingId = null" class="btn-back">
                <i class="fas fa-arrow-left"></i> Back
              </button>
            </div>

            <!-- Guest Header -->
            <div class="checkin-header">
              <div class="guest-avatar">
                {{ selectedBooking.guest_name.charAt(0).toUpperCase() }}
              </div>
              <div class="guest-details">
                <h4>{{ selectedBooking.guest_name }}</h4>
                <p class="email">{{ selectedBooking.email }}</p>
              </div>
              <span :class="getStatusClass(selectedBooking.status)" class="status">
                {{ formatStatus(selectedBooking.status) }}
              </span>
            </div>

            <!-- Details -->
            <div class="checkin-details">
              <div class="detail-row">
                <span class="label">Code:</span>
                <span class="value">{{ selectedBooking.reservation_code || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-in:</span>
                <span class="value">{{ formatDate(selectedBooking.check_in) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-out:</span>
                <span class="value">{{ formatDate(selectedBooking.check_out) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Type:</span>
                <span :class="getItemBadgeClass(selectedBooking.items_list)" class="value item-badge">
                  {{ getItemLabel(selectedBooking.items_list) }}
                </span>
              </div>
              <div class="detail-row">
                <span class="label">Guests:</span>
                <span class="value">
                  <span v-if="selectedBooking.adults > 0">{{ selectedBooking.adults }} Adult<span v-if="selectedBooking.adults > 1">s</span></span>
                  <span v-if="selectedBooking.children > 0" class="ml-2">{{ selectedBooking.children }} Child<span v-if="selectedBooking.children > 1">ren</span></span>
                </span>
              </div>
              <div class="detail-row">
                <span class="label">Payment:</span>
                <span class="value">{{ selectedBooking.payment_method || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total:</span>
                <span class="value font-semibold">₱{{ parseFloat(selectedBooking.total || 0).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="checkin-actions">
              <button
                v-if="selectedBooking.status === 'pending'"
                @click="confirmBooking(selectedBooking.id)"
                :disabled="loadingBookingId !== null"
                class="action-btn confirm-btn"
                title="Confirm booking"
              >
                <i class="fas fa-check"></i>
              </button>
              <button 
                @click="cancelBooking(selectedBooking.id)"
                :disabled="loadingBookingId !== null"
                class="action-btn cancel-btn"
                title="Cancel booking"
              >
                <i class="fas fa-times"></i>
              </button>
              <button 
                @click="deleteBooking(selectedBooking.id)"
                :disabled="loadingBookingId !== null"
                class="action-btn delete-btn"
                title="Delete booking"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">No check-ins for this date</p>
        </div>
      </div>

      <div v-else class="panel-empty">
        <i class="fas fa-calendar-alt text-4xl text-gray-300 mb-3"></i>
        <p class="text-gray-500">Select a date to view check-ins</p>
      </div>
    </div>

    <!-- Calendar (RIGHT) -->
    <div class="calendar-main">
      <!-- Calendar Header -->
      <div class="calendar-header">
        <div>
          <h3>Reservation Calendar</h3>
          <p class="text-sm text-gray-500">View check-ins by date</p>
        </div>
        <div class="month-navigation">
          <button @click="prevMonth" class="nav-btn">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="current-month">{{ formatMonthYear(currentDate) }}</span>
          <button @click="nextMonth" class="nav-btn">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-container">
        <div class="weekdays">
          <div v-for="day in weekDays" :key="day" class="weekday">
            {{ day }}
          </div>
        </div>

        <div class="dates-grid">
          <!-- Empty cells for days before month starts -->
          <div v-for="i in firstDayOfMonth" :key="`empty-${i}`" class="date-cell empty"></div>

          <!-- Calendar dates -->
          <div
            v-for="date in daysInMonth"
            :key="date"
            :class="getDayClass(date)"
            @click="selectDate(date)"
            class="date-cell"
          >
            <div class="date-number">{{ date }}</div>
            <div v-if="getReservationsForDate(date).length > 0" class="reservation-badge">
              {{ getReservationsForDate(date).length }}
            </div>
            <div v-if="getReservationsForDate(date).length > 0" class="view-button">
              <button
                @click.stop="openCheckInsList(date)"
                class="btn-view"
                title="View check-ins"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineExpose, watch } from 'vue'

const props = defineProps({
  bookings: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'delete'])

const currentDate = ref(new Date())
const showCheckinModal = ref(false)
const selectedCheckinDate = ref(null)
const selectedBookingId = ref(null)
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const loadingBookingId = ref(null)

const daysInMonth = computed(() => {
  return new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    0
  ).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth(),
    1
  ).getDay()
})

const formatMonthYear = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (date.getFullYear() === 1970) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatCheckinDate = (date) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return `${months[currentDate.value.getMonth()]} ${date}, ${currentDate.value.getFullYear()}`
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

const getItemLabel = (itemsList) => {
  if (!itemsList || itemsList === 'N/A') return 'Other'
  
  const itemsStr = String(itemsList).toLowerCase()
  
  if (itemsStr.includes('swimming lesson')) {
    const match = String(itemsList).match(/Swimming Lesson - (.+?)(?:,|$)/i)
    if (match) {
      return `🏊 Swimming: ${match[1].trim()}`
    }
    return '🏊 Swimming Lesson'
  }
  
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

const parseSwimmingDetails = (itemsDescriptions) => {
  if (!itemsDescriptions) return null
  
  try {
    const descriptions = itemsDescriptions.split('|||')
    
    for (const desc of descriptions) {
      if (!desc || desc === 'null') continue
      
      try {
        const parsed = JSON.parse(desc)
        if (parsed && parsed.dates && Array.isArray(parsed.dates)) {
          return parsed
        }
      } catch (e) {
        continue
      }
    }
  } catch (error) {
    console.error('Error parsing swimming details:', error)
  }
  
  return null
}

const isSwimmingBooking = (itemsList) => {
  if (!itemsList) return false
  return String(itemsList).toLowerCase().includes('swimming')
}

const getCheckInDate = (booking) => {
  if (isSwimmingBooking(booking.items_list)) {
    const swimmingDetails = parseSwimmingDetails(booking.items_descriptions)
    if (swimmingDetails && swimmingDetails.dates && swimmingDetails.dates.length > 0) {
      return new Date(swimmingDetails.dates[0])
    }
  }
  return new Date(booking.check_in)
}

const getReservationsForDate = (date) => {
  const targetDate = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth(),
    date
  )

  return props.bookings.filter(booking => {
    const checkInDate = getCheckInDate(booking)
    
    return (
      checkInDate.getFullYear() === targetDate.getFullYear() &&
      checkInDate.getMonth() === targetDate.getMonth() &&
      checkInDate.getDate() === targetDate.getDate()
    )
  })
}

const getDayClass = (date) => {
  const reservations = getReservationsForDate(date)
  const today = new Date()
  const isToday = (
    date === today.getDate() &&
    currentDate.value.getMonth() === today.getMonth() &&
    currentDate.value.getFullYear() === today.getFullYear()
  )

  return {
    today: isToday,
    'has-reservations': reservations.length > 0
  }
}

const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1
  )
}

const selectDate = (date) => {
  const reservations = getReservationsForDate(date)
  if (reservations.length > 0) {
    selectedCheckinDate.value = date
    showCheckinModal.value = true
  }
}

const openCheckInsList = (date) => {
  selectedCheckinDate.value = date
  showCheckinModal.value = true
}

const closeCheckinModal = () => {
  showCheckinModal.value = false
  selectedCheckinDate.value = null
}

const selectedCheckinsList = computed(() => {
  if (!selectedCheckinDate.value) return []
  return getReservationsForDate(selectedCheckinDate.value)
})

const selectedBooking = computed(() => {
  if (!selectedBookingId.value) {
    // Return first booking if only one exists
    return selectedCheckinsList.value.length === 1 ? selectedCheckinsList.value[0] : null
  }
  // Return the selected booking by ID
  return selectedCheckinsList.value.find(b => b.id === selectedBookingId.value) || selectedCheckinsList.value[0]
})

// Reset selected booking when date changes
watch(selectedCheckinDate, () => {
  selectedBookingId.value = null
})

const closeModalAfterAction = () => {
  closeCheckinModal()
}

defineExpose({
  closeModalAfterAction
})

const confirmBooking = async (id) => {
  if (!confirm('Confirm this booking?')) return
  emit('confirm', id)
}

const cancelBooking = async (id) => {
  if (!confirm('Cancel this booking?')) return
  emit('cancel', id)
}

const deleteBooking = async (id) => {
  if (!confirm('Delete this booking permanently?')) return
  emit('delete', id)
}
</script>

<style scoped>
.calendar-wrapper {
  display: flex;
  gap: 20px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 700px;
}

.calendar-main {
  flex: 1;
  width: 70%;
  display: flex;
  flex-direction: column;
}

.bookings-panel {
  width: 30%;
  border-right: 1px solid #e5e7eb;
  padding-right: 20px;
  margin-right: 20px;
  overflow-y: auto;
  min-height: 700px;
  display: flex;
  flex-direction: column;
}

.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}

.panel-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h3 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 600;
}

.panel-date {
  margin: 0;
  font-size: 0.875rem;
  color: #0ea5e9;
  font-weight: 600;
}

.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6b7280;
}

.panel-empty p {
  margin-top: 12px;
}

.checkins-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.checkins-list::-webkit-scrollbar {
  width: 6px;
}

.checkins-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.checkins-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.checkins-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.calendar-header h3 {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  color: #1f2937;
  font-weight: 600;
}

.calendar-header p {
  margin: 0;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  background: #f3f4f6;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.current-month {
  font-weight: 600;
  color: #1f2937;
  min-width: 200px;
  text-align: center;
}

.calendar-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.weekday {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
}

.dates-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  background: white;
}

.date-cell {
  border: 1px solid #e5e7eb;
  padding: 16px 12px;
  min-height: 120px;
  position: relative;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.date-cell:hover {
  background: #f3f4f6;
}

.date-cell.has-reservations {
  background: #fafbfc;
}

.date-cell.has-reservations:hover {
  background: #f0f1f3;
}

.date-cell.empty {
  background: #ffffff;
  cursor: default;
}

.date-cell.empty:hover {
  background: #ffffff;
}

.date-cell.today {
  background: #eff6ff;
  border: 2px solid #0ea5e9;
}

.date-cell.today .date-number {
  background: #0ea5e9;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.date-number {
  font-weight: 700;
  color: #1f2937;
  font-size: 1.1rem;
  margin-bottom: 12px;
  line-height: 1;
}

.reservation-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.view-button {
  margin-top: auto;
  width: 100%;
}

.btn-view {
  background: #0ea5e9;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  width: 100%;
  text-align: center;
}

.btn-view:hover {
  background: #0284c7;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1f2937;
}

.modal-body {
  padding: 24px;
}

.checkins-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.checkin-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkin-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px 12px 12px;
}

.guest-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #0369a1;
  flex-shrink: 0;
}

.guest-details {
  flex: 1;
  min-width: 0;
}

.guest-details h4 {
  margin: 0 0 2px 0;
  color: #1f2937;
  font-size: 0.85rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email {
  margin: 0;
  color: #6b7280;
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-pending {
  background: #fef3c7;
  color: #b45309;
}

.status-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.checkin-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: #fafafa;
  border-radius: 0;
  flex: 1;
  overflow-y: auto;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.75rem;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  color: #6b7280;
  font-weight: 600;
  flex-shrink: 0;
}

.value {
  color: #1f2937;
  font-weight: 600;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 0.375rem;
  font-size: 0.65rem;
  font-weight: 500;
  white-space: nowrap;
}

.badge-swimming {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #0ea5e9;
}

.badge-room {
  background-color: #fef3c7;
  color: #b45309;
  border: 1px solid #fbbf24;
}

.badge-cottage {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.badge-event {
  background-color: #f3e8ff;
  color: #6b21a8;
  border: 1px solid #d946ef;
}

.badge-other {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.checkin-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 12px;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  flex: 1;
  padding: 8px 6px;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-btn {
  background: #10b981;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: #059669;
}

.cancel-btn {
  background: #f59e0b;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background: #d97706;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #dc2626;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #6b7280;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-state p {
  margin: 8px 0 0;
  font-size: 0.875rem;
}

.back-button-bar {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

/* Multiple Bookings List View */
.bookings-list-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 500px;
  overflow-y: auto;
}

.booking-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.booking-list-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.item-code {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: #9ca3af;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.item-status {
  font-size: 0.625rem !important;
  padding: 4px 6px !important;
  border-radius: 4px;
  flex-shrink: 0;
}

.item-arrow {
  color: #d1d5db;
  flex-shrink: 0;
  font-size: 0.75rem;
}

/* Booking Details View */
.booking-details-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.back-button {
  margin-bottom: 4px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.booking-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: white;
  border-radius: 8px;
  height: 100%;
}

.back-button-bar {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.checkin-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px 12px 12px;
}

.guest-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #0369a1;
  flex-shrink: 0;
}

.guest-details {
  flex: 1;
  min-width: 0;
}

.guest-details h4 {
  margin: 0 0 2px 0;
  color: #1f2937;
  font-size: 0.85rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email {
  margin: 0;
  color: #6b7280;
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-pending {
  background: #fef3c7;
  color: #b45309;
}

.status-confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.checkin-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: #fafafa;
  border-radius: 0;
  flex: 1;
  overflow-y: auto;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.75rem;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  color: #6b7280;
  font-weight: 600;
  flex-shrink: 0;
}

.value {
  color: #1f2937;
  font-weight: 600;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 0.375rem;
  font-size: 0.65rem;
  font-weight: 500;
  white-space: nowrap;
}

.badge-swimming {
  background-color: #e0f2fe;
  color: #0369a1;
  border: 1px solid #0ea5e9;
}

.badge-room {
  background-color: #fef3c7;
  color: #b45309;
  border: 1px solid #fbbf24;
}

.badge-cottage {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.badge-event {
  background-color: #f3e8ff;
  color: #6b21a8;
  border: 1px solid #d946ef;
}

.badge-other {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.checkin-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 12px;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  flex: 1;
  padding: 8px 6px;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-btn {
  background: #10b981;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background: #059669;
}

.cancel-btn {
  background: #f59e0b;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background: #d97706;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #dc2626;
}

/* Responsive */
@media (max-width: 1200px) {
  .calendar-wrapper {
    flex-direction: column;
    min-height: auto;
    padding: 16px;
    gap: 16px;
  }

  .calendar-main {
    width: 100%;
  }

  .bookings-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding-right: 0;
    padding-bottom: 16px;
    margin-right: 0;
    margin-bottom: 16px;
    max-height: none;
    max-height: 400px;
  }
}
</style>
