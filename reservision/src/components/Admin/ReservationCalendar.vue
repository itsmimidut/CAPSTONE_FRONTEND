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
          <p class="list-count">{{ selectedCheckinsList.length }} booking(s) on this date</p>
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
          <div v-if="selectedCheckinsList.length > 1 && selectedBookingId" class="back-button">
            <button @click="selectedBookingId = null" class="btn-back">
              <i class="fas fa-arrow-left"></i> Back
            </button>
          </div>

          <div class="booking-card">
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
                <span class="label">Code</span>
                <span class="value">{{ selectedBooking.reservation_code || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-in</span>
                <span class="value">{{ formatDate(selectedBooking.check_in) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-out</span>
                <span class="value">{{ formatDate(selectedBooking.check_out) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Type</span>
                <span :class="getItemBadgeClass(selectedBooking.items_list)" class="value item-badge">
                  {{ getItemLabel(selectedBooking.items_list) }}
                </span>
              </div>
              <div class="detail-row">
                <span class="label">Guests</span>
                <span class="value">
                  <span v-if="selectedBooking.adults > 0">{{ selectedBooking.adults }} Adult<span v-if="selectedBooking.adults > 1">s</span></span>
                  <span v-if="selectedBooking.children > 0" class="ml-2">{{ selectedBooking.children }} Child<span v-if="selectedBooking.children > 1">ren</span></span>
                </span>
              </div>
              <div class="detail-row">
                <span class="label">Payment</span>
                <span class="value">{{ selectedBooking.payment_method || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total</span>
                <span class="value total-value">₱{{ parseFloat(selectedBooking.total || 0).toFixed(2) }}</span>
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
                <i class="fas fa-check"></i> Confirm
              </button>
              <button
                @click="cancelBooking(selectedBooking.id)"
                :disabled="loadingBookingId !== null"
                class="action-btn cancel-btn"
                title="Cancel booking"
              >
                <i class="fas fa-times"></i> Cancel
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
          <i class="fas fa-inbox"></i>
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

    <!-- Calendar (RIGHT) -->
    <div class="calendar-main">
      <!-- Calendar Header -->
      <div class="calendar-header">
        <div class="header-title-block">
          <h3>Reservation Calendar</h3>
          <p>View and manage check-ins by date</p>
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

      <!-- Occupancy Legend -->
      <div class="occupancy-legend">
        <span class="legend-title">Occupancy:</span>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-dot legend-available"></div>
            <span>Available (0–39%)</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-partial"></div>
            <span>Partial (40–79%)</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot legend-full"></div>
            <span>Full (80–100%)</span>
          </div>
        </div>
      </div>

      <!-- Calendar Grid -->
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

            <div v-if="getReservationsForDate(date).length > 0" class="reservation-badge">
              {{ getReservationsForDate(date).length }}
            </div>

            <div v-if="getReservationsForDate(date).length > 0" class="view-button">
              <button @click.stop="openCheckInsList(date)" class="btn-view" title="View check-ins">
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

const daysInMonth = computed(() => {
  return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).getDay()
})

const formatMonthYear = (date) => {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (date.getFullYear() === 1970) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatCheckinDate = (date) => {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[currentDate.value.getMonth()]} ${date}, ${currentDate.value.getFullYear()}`
}

const formatStatus = (status) => status.replace(/_/g, ' ').toUpperCase()

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
    return match ? `🏊 Swimming: ${match[1].trim()}` : '🏊 Swimming Lesson'
  }
  if (itemsStr.includes('deluxe room') || itemsStr.includes('room')) return '🏨 Room'
  if (itemsStr.includes('cottage')) return '🏠 Cottage'
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
  return { status, occupancy, percentages: { rooms: Math.round(roomPercent), cottages: Math.round(cottagePercent), events: Math.round(eventPercent), avg: Math.round(avgPercent) } }
}

const getOccupancyDisplay = (date) => {
  const { status, occupancy } = getOccupancyStatus(date)
  const total = occupancy.rooms + occupancy.cottages + occupancy.events
  return { status, count: total }
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
  const isPast = isDateInPast(date)
  const { status } = getOccupancyStatus(date)
  return {
    today: isToday,
    'has-reservations': reservations.length > 0,
    'past-date': isPast,
    [`occ-cell-${status}`]: true
  }
}

const prevMonth = () => { currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1) }
const nextMonth = () => { currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1) }

const selectDate = (date) => {
  if (isDateInPast(date)) return
  const reservations = getReservationsForDate(date)
  if (reservations.length > 0) { selectedCheckinDate.value = date; showCheckinModal.value = true }
}

const openCheckInsList = (date) => {
  if (isDateInPast(date)) return
  selectedCheckinDate.value = date
  showCheckinModal.value = true
}

const closeCheckinModal = () => { showCheckinModal.value = false; selectedCheckinDate.value = null }

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

const confirmBooking = async (id) => { if (!confirm('Confirm this booking?')) return; emit('confirm', id) }
const cancelBooking = async (id) => { if (!confirm('Cancel this booking?')) return; emit('cancel', id) }
const deleteBooking = async (id) => { if (!confirm('Delete this booking permanently?')) return; emit('delete', id) }
</script>

<style scoped>
/* ── Eduardo's Resort Palette ── */
.calendar-wrapper {
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

  /* Semantic occupancy colors */
  --occ-available:       #10b981;
  --occ-available-soft:  rgba(16, 185, 129, 0.08);
  --occ-available-hover: rgba(16, 185, 129, 0.15);
  --occ-partial:         #f59e0b;
  --occ-partial-soft:    rgba(245, 158, 11, 0.08);
  --occ-partial-hover:   rgba(245, 158, 11, 0.15);
  --occ-full:            #ef4444;
  --occ-full-soft:       rgba(239, 68, 68, 0.08);
  --occ-full-hover:      rgba(239, 68, 68, 0.15);
}

/* ── Wrapper ── */
.calendar-wrapper {
  display: flex;
  gap: 0;
  background: var(--color-white);
  border-radius: 8px;
  overflow: hidden;
  margin: 24px 0;
  box-shadow: 0 2px 16px rgba(12, 59, 94, 0.1), 0 0 0 1px rgba(12, 59, 94, 0.06);
  min-height: 680px;
}

/* ══════════════════════════════════
   SIDE PANEL
══════════════════════════════════ */
.bookings-panel {
  width: 288px;
  flex-shrink: 0;
  background: var(--color-gray-bg);
  border-right: 2px solid var(--color-gray-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Panel header — navy bar matching sidebar */
.panel-header {
  background: var(--color-navy);
  padding: 18px 20px 16px;
  border-bottom: 2px solid var(--color-gold);
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0 0 3px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-white);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.panel-date {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-gold);
  font-weight: 600;
}

.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px 20px;
  text-align: center;
  gap: 14px;
}

.panel-empty-icon {
  width: 56px; height: 56px;
  border-radius: 14px;
  background: rgba(3, 105, 161, 0.1);
  border: 1.5px solid rgba(3, 105, 161, 0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem;
  color: var(--color-primary-light);
}

.panel-empty p {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-text-light);
  font-weight: 500;
  line-height: 1.5;
}

/* List count label */
.list-count {
  font-size: 0.75rem;
  color: var(--color-text-light);
  font-weight: 600;
  padding: 12px 16px 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Bookings list */
.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px 16px;
  overflow-y: auto;
}

.bookings-list::-webkit-scrollbar { width: 4px; }
.bookings-list::-webkit-scrollbar-track { background: transparent; }
.bookings-list::-webkit-scrollbar-thumb { background: var(--color-gray-border); border-radius: 4px; }

.booking-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--color-white);
  border: 1.5px solid var(--color-gray-border);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.18s, box-shadow 0.18s, transform 0.15s;
}

.booking-list-item:hover {
  border-color: var(--color-primary-light);
  box-shadow: 0 2px 8px rgba(3, 105, 161, 0.12);
  transform: translateX(2px);
}

.item-avatar {
  width: 34px; height: 34px;
  border-radius: 8px;
  background: var(--color-navy);
  color: var(--color-gold);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700;
  flex-shrink: 0;
}

.item-info { flex: 1; min-width: 0; }

.item-name {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-dark);
  text-overflow: ellipsis; overflow: hidden; white-space: nowrap;
}

.item-code {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: var(--color-text-light);
  text-overflow: ellipsis; overflow: hidden; white-space: nowrap;
}

.item-arrow { color: var(--color-gray-border); font-size: 0.7rem; flex-shrink: 0; }

/* ── Booking details card ── */
.booking-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.back-button-bar {
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-gray-border);
  background: var(--color-white);
  flex-shrink: 0;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(3, 105, 161, 0.08);
  border: 1.5px solid rgba(3, 105, 161, 0.2);
  color: var(--color-primary);
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.btn-back:hover {
  background: rgba(3, 105, 161, 0.15);
  border-color: var(--color-primary);
}

/* Guest header */
.checkin-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-gray-border);
  background: var(--color-white);
  flex-shrink: 0;
}

.guest-avatar {
  width: 38px; height: 38px;
  border-radius: 8px;
  background: var(--color-navy);
  color: var(--color-gold);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1rem;
  flex-shrink: 0;
}

.guest-details { flex: 1; min-width: 0; }

.guest-details h4 {
  margin: 0 0 2px;
  color: var(--color-text-dark);
  font-size: 0.82rem;
  font-weight: 700;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.email {
  margin: 0;
  color: var(--color-text-light);
  font-size: 0.7rem;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* Detail rows */
.checkin-details {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  flex: 1;
  overflow-y: auto;
  background: var(--color-white);
}

.checkin-details::-webkit-scrollbar { width: 4px; }
.checkin-details::-webkit-scrollbar-thumb { background: var(--color-gray-border); border-radius: 4px; }

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  padding: 9px 16px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.6);
  gap: 8px;
  transition: background 0.12s;
}

.detail-row:last-child { border-bottom: none; }
.detail-row:hover { background: var(--color-gray-bg); }

.label {
  color: var(--color-text-light);
  font-weight: 600;
  flex-shrink: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.value {
  color: var(--color-text-dark);
  font-weight: 600;
  text-align: right;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.total-value {
  color: var(--color-primary);
  font-size: 0.85rem;
}

/* Action buttons */
.checkin-actions {
  display: flex;
  gap: 6px;
  padding: 12px 14px;
  border-top: 2px solid var(--color-gray-border);
  background: var(--color-gray-bg);
  flex-shrink: 0;
}

.action-btn {
  flex: 1;
  padding: 8px 6px;
  border: none;
  border-radius: 5px;
  font-size: 0.72rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-weight: 700;
  transition: all 0.18s;
  letter-spacing: 0.02em;
}

.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.confirm-btn { background: #10b981; color: white; }
.confirm-btn:hover:not(:disabled) { background: #059669; box-shadow: 0 2px 8px rgba(16,185,129,0.3); }

.cancel-btn { background: var(--color-gold); color: var(--color-navy); }
.cancel-btn:hover:not(:disabled) { background: var(--color-gold-dark); box-shadow: 0 2px 8px rgba(244,196,0,0.3); }

.delete-btn { background: rgba(239,68,68,0.1); color: #ef4444; border: 1.5px solid rgba(239,68,68,0.25); flex: 0 0 36px; padding: 8px; }
.delete-btn:hover:not(:disabled) { background: #ef4444; color: white; border-color: #ef4444; }

/* Status badges */
.status, .item-status {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.04em;
}

.status-pending  { background: #fef3c7; color: #b45309; }
.status-confirmed { background: #d1fae5; color: #065f46; }
.status-cancelled { background: #fee2e2; color: #991b1b; }

/* Type badges */
.item-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-swimming { background: rgba(3,105,161,0.1); color: var(--color-primary); border: 1px solid rgba(3,105,161,0.2); }
.badge-room     { background: #fef3c7; color: #b45309; border: 1px solid #fbbf24; }
.badge-cottage  { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.badge-event    { background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; }
.badge-other    { background: var(--color-gray-bg); color: var(--color-text-light); border: 1px solid var(--color-gray-border); }

/* Empty state */
.empty-state {
  text-align: center;
  padding: 32px 20px;
  color: var(--color-text-light);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.empty-state i { font-size: 2rem; opacity: 0.4; }
.empty-state p { margin: 0; font-size: 0.8rem; }

/* ══════════════════════════════════
   CALENDAR MAIN
══════════════════════════════════ */
.calendar-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: var(--color-white);
  min-width: 0;
}

/* Calendar header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.header-title-block h3 {
  margin: 0 0 3px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-navy);
}

.header-title-block p {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-light);
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--color-navy);
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid var(--color-navy);
}

.nav-btn {
  background: transparent;
  border: none;
  width: 38px; height: 38px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.7);
  font-size: 0.75rem;
  transition: background 0.15s, color 0.15s;
}

.nav-btn:hover {
  background: rgba(255,255,255,0.12);
  color: var(--color-gold);
}

.current-month {
  font-weight: 700;
  color: var(--color-white);
  min-width: 170px;
  text-align: center;
  font-size: 0.875rem;
  letter-spacing: 0.02em;
  padding: 0 4px;
  border-left: 1px solid rgba(255,255,255,0.12);
  border-right: 1px solid rgba(255,255,255,0.12);
}

/* Occupancy legend */
.occupancy-legend {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: var(--color-gray-bg);
  border-radius: 6px;
  border: 1.5px solid var(--color-gray-border);
  font-size: 0.78rem;
}

.legend-title {
  font-weight: 700;
  color: var(--color-navy);
  white-space: nowrap;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.legend-items {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-light);
  font-size: 0.75rem;
  font-weight: 500;
}

.legend-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-available { background: var(--occ-available); box-shadow: 0 0 5px rgba(16,185,129,0.4); }
.legend-partial   { background: var(--occ-partial);   box-shadow: 0 0 5px rgba(245,158,11,0.4); }
.legend-full      { background: var(--occ-full);      box-shadow: 0 0 5px rgba(239,68,68,0.4); }

/* Calendar grid container */
.calendar-container {
  border: 1.5px solid var(--color-gray-border);
  border-radius: 6px;
  overflow: hidden;
  flex: 1;
}

/* Weekday row */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--color-navy);
  border-bottom: 2px solid var(--color-gold);
}

.weekday {
  padding: 11px 8px;
  text-align: center;
  font-weight: 700;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.08em;
}

.weekday:first-child,
.weekday:last-child { color: var(--color-gold); }

/* Dates grid */
.dates-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--color-gray-border);
  gap: 1px;
}

/* ── Date cell ── */
.date-cell {
  border: none;
  padding: 10px 10px 8px;
  min-height: 108px;
  position: relative;
  background: var(--color-white);
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.date-cell:hover { background: #f0f4f8; }

.date-cell.empty {
  background: var(--color-gray-bg);
  cursor: default;
  opacity: 0.5;
}
.date-cell.empty:hover { background: var(--color-gray-bg); }

.date-cell.past-date {
  background: var(--color-gray-bg);
  cursor: not-allowed;
  opacity: 0.55;
  pointer-events: none;
}

/* Today */
.date-cell.today {
  background: rgba(3, 105, 161, 0.06);
  box-shadow: inset 0 0 0 2px var(--color-primary);
}

.date-cell.today .date-number {
  background: var(--color-primary);
  color: var(--color-white);
  width: 28px; height: 28px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
}

/* Date with reservations */
.date-cell.has-reservations {
  background: rgba(3, 105, 161, 0.03);
}
.date-cell.has-reservations:hover { background: rgba(3, 105, 161, 0.08); }

/* Occupancy cell tints */
.date-cell.occ-cell-available { background: var(--occ-available-soft); }
.date-cell.occ-cell-available:hover { background: var(--occ-available-hover); }
.date-cell.occ-cell-partial   { background: var(--occ-partial-soft); }
.date-cell.occ-cell-partial:hover   { background: var(--occ-partial-hover); }
.date-cell.occ-cell-full      { background: var(--occ-full-soft); }
.date-cell.occ-cell-full:hover      { background: var(--occ-full-hover); }

/* Date number */
.date-number {
  font-weight: 700;
  color: var(--color-text-dark);
  font-size: 0.9rem;
  margin-bottom: 6px;
  line-height: 1;
}

.past-date .date-number { color: var(--color-text-light); }

/* Occupancy dot */
.occupancy-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.occupancy-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.occ-available { background: var(--occ-available); box-shadow: 0 0 4px rgba(16,185,129,0.5); }
.occ-partial   { background: var(--occ-partial);   box-shadow: 0 0 4px rgba(245,158,11,0.5); }
.occ-full      { background: var(--occ-full);      box-shadow: 0 0 4px rgba(239,68,68,0.5); }

/* Reservation count badge */
.reservation-badge {
  display: inline-flex;
  align-items: center; justify-content: center;
  background: var(--color-navy);
  color: var(--color-gold);
  width: 22px; height: 22px;
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 800;
  margin-bottom: 6px;
}

/* View button */
.view-button {
  margin-top: auto;
  width: 100%;
}

.btn-view {
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: background 0.15s, transform 0.12s;
  font-weight: 700;
  width: 100%;
  text-align: center;
  letter-spacing: 0.03em;
}

.btn-view:hover {
  background: var(--color-navy);
  transform: translateY(-1px);
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .calendar-wrapper {
    flex-direction: column;
    min-height: auto;
  }

  .bookings-panel {
    width: 100%;
    border-right: none;
    border-bottom: 2px solid var(--color-gray-border);
    max-height: 380px;
  }

  .calendar-main { padding: 16px; }
}

@media (max-width: 640px) {
  .date-cell { min-height: 76px; padding: 7px 6px 6px; }
  .weekday { font-size: 0.6rem; padding: 9px 4px; }
  .current-month { min-width: 130px; font-size: 0.78rem; }
  .legend-items { gap: 10px; }
  .occupancy-legend { flex-wrap: wrap; gap: 8px; }
}
</style>