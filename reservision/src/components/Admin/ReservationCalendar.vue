<template>
  <div class="calendar-wrapper">
    <!-- Side Panel - Bookings List (LEFT) - Compact -->
    <div class="bookings-panel">
      <div v-if="selectedCheckinDate" class="panel-content">
        <div class="panel-header">
          <div class="panel-header-content">
            <i class="fas fa-calendar-check"></i>
            <div>
              <h3>Check-ins</h3>
              <p class="panel-date">{{ formatCheckinDate(selectedCheckinDate) }}</p>
            </div>
          </div>
        </div>

        <!-- MULTIPLE BOOKINGS VIEW -->
        <div v-if="selectedCheckinsList.length > 1 && !selectedBookingId" class="bookings-list-view">
          <div class="list-header">
            <i class="fas fa-users"></i>
            <span>{{ selectedCheckinsList.length }} booking(s)</span>
          </div>
          <div class="bookings-list">
            <div
              v-for="booking in selectedCheckinsList"
              :key="booking.id"
              @click="selectedBookingId = booking.id"
              class="booking-list-item"
            >
              <div class="item-avatar" :style="{ background: getAvatarGradient(booking.guest_name) }">
                {{ booking.guest_name.charAt(0).toUpperCase() }}
              </div>
              <div class="item-info">
                <p class="item-name">{{ booking.guest_name }}</p>
                <p class="item-code">{{ booking.reservation_code || 'N/A' }}</p>
              </div>
              <span :class="getStatusClass(booking.status)" class="item-status">
                {{ formatStatus(booking.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- SINGLE BOOKING DETAILS - Compact -->
        <div v-else-if="selectedCheckinsList.length > 0" class="booking-details-view">
          <div v-if="selectedCheckinsList.length > 1" class="back-button-bar">
            <button @click="selectedBookingId = null" class="btn-back">
              <i class="fas fa-arrow-left"></i> Back
            </button>
          </div>

          <div class="booking-card">
            <!-- Guest Header - Compact -->
            <div class="checkin-header">
              <div class="guest-avatar" :style="{ background: getAvatarGradient(selectedBooking.guest_name) }">
                {{ selectedBooking.guest_name.charAt(0).toUpperCase() }}
              </div>
              <div class="guest-details">
                <h4>{{ selectedBooking.guest_name }}</h4>
                <p class="email">{{ selectedBooking.email }}</p>
              </div>
              <span :class="getStatusClass(selectedBooking.status)" class="status-badge">
                {{ formatStatus(selectedBooking.status) }}
              </span>
            </div>

            <!-- Details - Compact Grid -->
            <div class="checkin-details-compact">
              <div class="detail-row-compact">
                <span class="label">Reservation Code</span>
                <span class="value code-value">{{ selectedBooking.reservation_code || 'N/A' }}</span>
              </div>
              <div class="detail-row-compact">
                <span class="label">Check-in</span>
                <span class="value">{{ formatDate(selectedBooking.check_in) }}</span>
              </div>
              <div class="detail-row-compact">
                <span class="label">Booking Type</span>
                <span :class="getItemBadgeClass(selectedBooking.items_list)" class="value item-badge">
                  {{ getItemLabel(selectedBooking.items_list) }}
                </span>
              </div>
              <div class="detail-row-compact">
                <span class="label">Payment</span>
                <span class="value">{{ selectedBooking.payment_method || 'N/A' }}</span>
              </div>
              <div class="detail-row-compact total-row">
                <span class="label">Total Amount</span>
                <span class="value total-value">₱{{ parseFloat(selectedBooking.total || 0).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Action Buttons - Compact -->
            <div class="checkin-actions-compact">
              <button
                v-if="selectedBooking.status === 'pending'"
                @click="confirmBooking(selectedBooking.id)"
                :disabled="loadingBookingId !== null"
                class="action-btn confirm-btn"
              >
                <i class="fas fa-check"></i> Confirm
              </button>
              <button
                @click="cancelBooking(selectedBooking.id)"
                :disabled="loadingBookingId !== null"
                class="action-btn cancel-btn"
              >
                <i class="fas fa-times"></i> Cancel
              </button>
              <button
                @click="deleteBooking(selectedBooking.id)"
                :disabled="loadingBookingId !== null"
                class="action-btn delete-btn"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="fas fa-calendar-day"></i>
          <p>No check-ins for this date</p>
        </div>
      </div>

      <div v-else class="panel-empty">
        <div class="panel-empty-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <p>Select a date to view check-ins</p>
      </div>
    </div>

    <!-- Calendar (RIGHT) - Compact -->
    <div class="calendar-main">
      <!-- Calendar Header - Compact -->
      <div class="calendar-header">
        <div class="header-title-block">
          <i class="fas fa-calendar-alt"></i>
          <div>
            <h3>Reservation Calendar</h3>
            <p>View and manage check-ins</p>
          </div>
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

      <!-- Occupancy Legend - Compact -->
      <div class="occupancy-legend">
        <span class="legend-title">Occupancy:</span>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-dot legend-available"></div>
            <span>Low</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-partial"></div>
            <span>Medium</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-full"></div>
            <span>High</span>
          </div>
        </div>
      </div>

      <!-- Calendar Grid - Compact -->
      <div class="calendar-container">
        <div class="weekdays">
          <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
        </div>

        <div class="dates-grid">
          <div v-for="i in firstDayOfMonth" :key="`empty-${i}`" class="date-cell empty"></div>

          <div
            v-for="date in daysInMonth"
            :key="date"
            :class="getDayClass(date)"
            @click="selectDate(date)"
            class="date-cell"
          >
            <div class="date-number">{{ date }}</div>
            <div v-if="!isDateInPast(date)" class="occupancy-indicator" :title="`${getOccupancyDisplay(date).count} items occupied`">
              <div :class="`occupancy-dot occ-${getOccupancyStatus(date).status}`"></div>
            </div>
            <div v-if="getReservationsForDate(date).length > 0" class="reservation-count">
              {{ getReservationsForDate(date).length }}
            </div>
            <button v-if="getReservationsForDate(date).length > 0" @click.stop="openCheckInsList(date)" class="btn-view">
              View
            </button>
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

const facilityCapacity = {
  rooms: 15,
  cottages: 8,
  events: 5
}

const currentDate = ref(new Date())
const showCheckinModal = ref(false)
const selectedCheckinDate = ref(null)
const selectedBookingId = ref(null)
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const loadingBookingId = ref(null)

const getAvatarGradient = (name) => {
  const gradients = [
    'linear-gradient(135deg, #0C3B5E, #0369a1)',
    'linear-gradient(135deg, #0369a1, #1F8DBF)',
    'linear-gradient(135deg, #1F8DBF, #0C3B5E)'
  ]
  const index = name.charCodeAt(0) % gradients.length
  return gradients[index]
}

const daysInMonth = computed(() => {
  return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).getDay()
})

const formatMonthYear = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatCheckinDate = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[currentDate.value.getMonth()]} ${date}, ${currentDate.value.getFullYear()}`
}

const formatStatus = (status) => status.replace(/_/g, ' ').toUpperCase()

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
  if (itemsStr.includes('swimming lesson')) {
    const match = String(itemsList).match(/Swimming Lesson - (.+?)(?:,|$)/i)
    return match ? `🏊 ${match[1].trim()}` : '🏊 Swimming'
  }
  if (itemsStr.includes('deluxe room') || itemsStr.includes('room')) return '🏨 Room'
  if (itemsStr.includes('cottage')) return '📍 Cottage'
  if (itemsStr.includes('event')) return '🎉 Event'
  return String(itemsList)
}

const getItemBadgeClass = (itemsList) => {
  if (!itemsList || itemsList === 'N/A') return 'badge-other'
  const itemsStr = String(itemsList).toLowerCase()
  if (itemsStr.includes('swimming')) return 'badge-swimming'
  if (itemsStr.includes('room')) return 'badge-room'
  if (itemsStr.includes('cottage')) return 'badge-cottage'
  if (itemsStr.includes('event')) return 'badge-event'
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
        if (parsed && parsed.dates && Array.isArray(parsed.dates)) return parsed
      } catch (e) { continue }
    }
  } catch (error) { console.error('Error parsing swimming details:', error) }
  return null
}

const isSwimmingBooking = (itemsList) => {
  if (!itemsList) return false
  return String(itemsList).toLowerCase().includes('swimming')
}

const getCheckInDate = (booking) => {
  if (isSwimmingBooking(booking.items_list)) {
    const swimmingDetails = parseSwimmingDetails(booking.items_descriptions)
    if (swimmingDetails?.dates?.length > 0) return new Date(swimmingDetails.dates[0])
  }
  return new Date(booking.check_in)
}

const isDateInPast = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), date)
  targetDate.setHours(0, 0, 0, 0)
  return targetDate < today
}

const getOccupancyForDate = (date) => {
  const targetDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), date)
  let occupancy = { rooms: 0, cottages: 0, events: 0 }
  props.bookings.forEach(booking => {
    const checkInDate = getCheckInDate(booking)
    const checkOutDate = new Date(booking.check_out)
    if (
      checkInDate.getFullYear() === targetDate.getFullYear() &&
      checkInDate.getMonth() === targetDate.getMonth() &&
      checkInDate.getDate() <= targetDate.getDate() &&
      checkOutDate.getFullYear() === targetDate.getFullYear() &&
      checkOutDate.getMonth() === targetDate.getMonth() &&
      checkOutDate.getDate() >= targetDate.getDate()
    ) {
      const itemsStr = String(booking.items_list || '').toLowerCase()
      if (itemsStr.includes('room')) occupancy.rooms++
      else if (itemsStr.includes('cottage')) occupancy.cottages++
      else if (itemsStr.includes('event') || itemsStr.includes('swimming')) occupancy.events++
    }
  })
  return occupancy
}

const getOccupancyStatus = (date) => {
  const occupancy = getOccupancyForDate(date)
  const roomPercent = (occupancy.rooms / facilityCapacity.rooms) * 100
  const cottagePercent = (occupancy.cottages / facilityCapacity.cottages) * 100
  const eventPercent = (occupancy.events / facilityCapacity.events) * 100
  const avgPercent = (roomPercent + cottagePercent + eventPercent) / 3
  let status = 'available'
  if (avgPercent >= 80) status = 'full'
  else if (avgPercent >= 40) status = 'partial'
  return status
}

const getOccupancyDisplay = (date) => {
  const occupancy = getOccupancyForDate(date)
  const total = occupancy.rooms + occupancy.cottages + occupancy.events
  return { count: total }
}

const getReservationsForDate = (date) => {
  const targetDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), date)
  if (isDateInPast(date)) return []
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
  const isToday = (date === today.getDate() && currentDate.value.getMonth() === today.getMonth() && currentDate.value.getFullYear() === today.getFullYear())
  const isSelected = selectedCheckinDate.value === date
  const isPast = isDateInPast(date)
  const status = getOccupancyStatus(date)
  return {
    today: isToday,
    selected: isSelected,
    'has-reservations': reservations.length > 0,
    'past-date': isPast,
    [`occ-${status}`]: true
  }
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
  selectedCheckinDate.value = null
  selectedBookingId.value = null
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
  selectedCheckinDate.value = null
  selectedBookingId.value = null
}

const selectDate = (date) => {
  if (isDateInPast(date)) return
  const reservations = getReservationsForDate(date)
  if (reservations.length > 0) {
    selectedCheckinDate.value = date
    showCheckinModal.value = true
  }
}

const openCheckInsList = (date) => {
  if (isDateInPast(date)) return
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
  if (!selectedBookingId.value) return selectedCheckinsList.value.length === 1 ? selectedCheckinsList.value[0] : null
  return selectedCheckinsList.value.find(b => b.id === selectedBookingId.value) || selectedCheckinsList.value[0]
})

watch(selectedCheckinDate, () => { selectedBookingId.value = null })

const closeModalAfterAction = () => closeCheckinModal()
defineExpose({ closeModalAfterAction })

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
/* ── Eduardo's Resort Compact Palette ── */
.calendar-wrapper {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-gold: #F4C400;
  --color-gold-dark: #E2B300;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;
  --color-gray-bg: #F8FAFC;
  --color-gray-border: #E2E8F0;
  --color-text-dark: #1E293B;
  --color-text-mid: #475569;
  --color-text-light: #94A3B8;
  
  --occ-available: #10B981;
  --occ-available-soft: rgba(16, 185, 129, 0.08);
  --occ-partial: #F59E0B;
  --occ-partial-soft: rgba(245, 158, 11, 0.08);
  --occ-full: #EF4444;
  --occ-full-soft: rgba(239, 68, 68, 0.08);
}

.calendar-wrapper {
  display: flex;
  gap: 0;
  background: var(--color-white);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-gray-border);
  height: 580px;
  max-height: 80vh;
}

/* ═════ SIDE PANEL - Compact ═════ */
.bookings-panel {
  width: 300px;
  flex-shrink: 0;
  background: var(--color-white);
  border-right: 1px solid var(--color-gray-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  background: linear-gradient(135deg, var(--color-navy) 0%, #145075 100%);
  padding: 12px 16px;
  border-bottom: 2px solid var(--color-gold);
  flex-shrink: 0;
}

.panel-header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-header-content i {
  font-size: 20px;
  color: var(--color-gold);
}

.panel-header h3 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-white);
}

.panel-date {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: var(--color-gold);
}

/* List Header */
.list-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px 6px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-primary);
  border-bottom: 1px solid var(--color-gray-border);
}

/* Bookings List */
.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  overflow-y: auto;
  flex: 1;
}

.booking-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--color-gray-bg);
  border: 1px solid var(--color-gray-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.booking-list-item:hover {
  border-color: var(--color-primary);
  background: var(--color-white);
  transform: translateX(2px);
}

.item-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  color: var(--color-gold);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-code {
  margin: 2px 0 0;
  font-size: 0.65rem;
  color: var(--color-text-light);
  font-family: monospace;
}

.item-status {
  font-size: 0.6rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
}

/* Back Button */
.back-button-bar {
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-gray-border);
  background: var(--color-white);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(3, 105, 161, 0.08);
  border: 1px solid rgba(3, 105, 161, 0.2);
  color: var(--color-primary);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-back:hover {
  background: rgba(3, 105, 161, 0.15);
}

/* Booking Card - Compact */
.booking-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.checkin-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--color-gray-bg);
  border-bottom: 1px solid var(--color-gray-border);
  flex-shrink: 0;
}

.guest-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  color: var(--color-gold);
}

.guest-details {
  flex: 1;
  min-width: 0;
}

.guest-details h4 {
  margin: 0 0 2px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email {
  margin: 0;
  font-size: 0.65rem;
  color: var(--color-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Details - Compact Rows */
.checkin-details-compact {
  padding: 8px 12px;
  flex: 1;
  overflow-y: auto;
}

.detail-row-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-gray-border);
  font-size: 0.7rem;
}

.detail-row-compact:last-child {
  border-bottom: none;
}

.total-row {
  margin-top: 4px;
  padding-top: 10px;
  border-top: 2px solid var(--color-gray-border);
}

.label {
  color: var(--color-text-light);
  font-weight: 600;
  font-size: 0.65rem;
}

.value {
  color: var(--color-text-dark);
  font-weight: 500;
}

.code-value {
  font-family: monospace;
  font-size: 0.7rem;
}

.total-value {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.85rem;
}

/* Action Buttons - Compact */
.checkin-actions-compact {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-gray-bg);
  flex-shrink: 0;
}

.action-btn {
  flex: 1;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.15s;
}

.confirm-btn {
  background: #10B981;
  color: white;
}

.confirm-btn:hover {
  background: #059669;
}

.cancel-btn {
  background: var(--color-gold);
  color: var(--color-navy);
}

.cancel-btn:hover {
  background: var(--color-gold-dark);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  flex: 0.4;
}

.delete-btn:hover {
  background: #EF4444;
  color: white;
}

/* Status Badges */
.status-pending {
  background: #FEF3C7;
  color: #B45309;
}

.status-confirmed {
  background: #D1FAE5;
  color: #065F46;
}

.status-cancelled {
  background: #FEE2E2;
  color: #991B1B;
}

/* Item Badges */
.item-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
}

.badge-swimming { background: rgba(3, 105, 161, 0.1); color: var(--color-primary); }
.badge-room { background: #FEF3C7; color: #B45309; }
.badge-cottage { background: #DBEAFE; color: #1E40AF; }
.badge-event { background: #F3E8FF; color: #6B21A8; }
.badge-other { background: var(--color-gray-bg); color: var(--color-text-mid); }

/* Empty States */
.empty-state, .panel-empty {
  text-align: center;
  padding: 40px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.empty-state i, .panel-empty-icon i {
  font-size: 32px;
  color: var(--color-text-light);
  opacity: 0.5;
}

.empty-state p, .panel-empty p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-mid);
}

/* ═════ CALENDAR MAIN - Compact ═════ */
.calendar-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background: var(--color-white);
  min-width: 0;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 10px;
}

.header-title-block {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title-block i {
  font-size: 18px;
  color: var(--color-primary);
}

.header-title-block h3 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-navy);
}

.header-title-block p {
  margin: 2px 0 0;
  font-size: 0.65rem;
  color: var(--color-text-light);
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--color-gray-border);
  background: var(--color-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: all 0.15s;
}

.nav-btn:hover {
  background: var(--color-gold);
  border-color: var(--color-gold);
  color: var(--color-navy);
}

.current-month {
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--color-text-dark);
  min-width: 100px;
  text-align: center;
}

/* Occupancy Legend */
.occupancy-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  margin-bottom: 12px;
  background: var(--color-gray-bg);
  border-radius: 8px;
  border: 1px solid var(--color-gray-border);
}

.legend-title {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-navy);
}

.legend-items {
  display: flex;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: var(--color-text-mid);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-available { background: var(--occ-available); }
.legend-partial { background: var(--occ-partial); }
.legend-full { background: var(--occ-full); }

/* Calendar Grid */
.calendar-container {
  border: 1px solid var(--color-gray-border);
  border-radius: 10px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--color-navy);
}

.weekday {
  padding: 8px 4px;
  text-align: center;
  font-weight: 700;
  font-size: 0.65rem;
  color: var(--color-white);
}

.weekday:first-child,
.weekday:last-child {
  color: var(--color-gold);
}

.dates-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--color-gray-border);
  gap: 1px;
  flex: 1;
}

.date-cell {
  background: var(--color-white);
  padding: 6px 4px;
  min-height: 70px;
  position: relative;
  cursor: pointer;
  transition: all 0.1s;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-cell:hover {
  background: var(--color-gray-bg);
}

.date-cell.empty {
  background: var(--color-gray-bg);
  cursor: default;
}

.date-cell.past-date {
  background: var(--color-gray-bg);
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
}

.date-cell.today {
  background: rgba(3, 105, 161, 0.06);
  box-shadow: inset 0 0 0 1px var(--color-primary);
}

.date-cell.selected {
  background: rgba(244, 196, 0, 0.12);
  box-shadow: inset 0 0 0 1px var(--color-gold);
}

/* Occupancy Backgrounds */
.date-cell.occ-available { background: var(--occ-available-soft); }
.date-cell.occ-partial { background: var(--occ-partial-soft); }
.date-cell.occ-full { background: var(--occ-full-soft); }

.date-number {
  font-weight: 700;
  font-size: 0.75rem;
  color: var(--color-text-dark);
}

.date-cell.today .date-number {
  background: var(--color-primary);
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.occupancy-indicator {
  display: flex;
  align-items: center;
}

.occupancy-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.occ-available { background: var(--occ-available); }
.occ-partial { background: var(--occ-partial); }
.occ-full { background: var(--occ-full); }

.reservation-count {
  background: var(--color-primary);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
}

.btn-view {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 0.6rem;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.1s;
  width: fit-content;
}

.btn-view:hover {
  background: var(--color-primary);
  color: white;
}

/* Responsive */
@media (max-width: 900px) {
  .calendar-wrapper {
    flex-direction: column;
    height: auto;
    max-height: none;
  }
  
  .bookings-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-gray-border);
    max-height: 350px;
  }
  
  .calendar-main {
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .date-cell {
    min-height: 55px;
    padding: 4px 2px;
  }
  
  .date-number {
    font-size: 0.7rem;
  }
  
  .weekday {
    font-size: 0.55rem;
    padding: 6px 2px;
  }
  
  .checkin-actions-compact {
    flex-wrap: wrap;
  }
  
  .delete-btn {
    flex: 1;
  }
}
</style>