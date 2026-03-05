<!-- components/CalendarModal.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    @click="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border-2 border-gray-200"
      @click.stop
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-gray-900">Select Dates</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-900 text-xl font-bold">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Error Message Display -->
      <div v-if="validationError" class="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
        <div class="flex items-start gap-2">
          <i class="fas fa-warning text-red-600 mt-0.5 flex-shrink-0"></i>
          <div class="flex-1">
            <p class="text-sm font-semibold text-red-700 mb-1">Dates Not Available</p>
            <p class="text-xs text-red-600">{{ validationError }}</p>
          </div>
        </div>
      </div>

      <!-- Month Navigation -->
      <div class="flex justify-between items-center mb-3 px-2">
        <button
          @click="$emit('prev-month')"
          class="p-2 hover:bg-gray-100 rounded-full text-blue-700 font-bold transition"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <h4 class="font-bold text-lg text-gray-900 flex-1 text-center">
          {{ monthYearStr }}
        </h4>
        <button
          @click="$emit('next-month')"
          class="p-2 hover:bg-gray-100 rounded-full text-blue-700 font-bold transition"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Days of Week -->
      <div class="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-600 mb-2">
        <div v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="day">
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7 gap-1 text-center mb-6">
        <div v-for="(day, idx) in calendarDays" :key="`day-${idx}`">
          <button
            v-if="day"
            @click="!isDisabled(day) && $emit('select-date', day)"
            :disabled="isDisabled(day)"
            :class="[
              'w-9 h-9 rounded-lg text-sm font-bold transition',
              isDisabled(day)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                : isCheckInDate(day) || isCheckOutDate(day)
                ? 'bg-blue-700 text-white shadow-md'
                : isBetweenDates(day)
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-blue-100 text-gray-700'
            ]"
          >
            {{ day.getDate() }}
          </button>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <div class="flex items-center gap-1">
          <div class="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
          <span>Unavailable</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-4 h-4 rounded bg-blue-700"></div>
          <span>Selected</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-4 h-4 rounded bg-blue-100"></div>
          <span>In Range</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between gap-3 pt-4 border-t-2 border-gray-200">
        <button
          @click="$emit('clear')"
          class="flex-1 py-2 text-gray-600 hover:text-gray-900 font-bold hover:bg-gray-50 rounded-lg transition text-sm"
        >
          Clear
        </button>
        <button
          @click="$emit('close')"
          class="flex-1 py-2 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition text-sm"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    checkIn: {
      type: Date,
      default: null
    },
    checkOut: {
      type: Date,
      default: null
    },
    currentMonth: {
      type: Date,
      required: true
    },
    /**
     * occupiedDates: Array of objects from API
     * Each entry has: { date: "YYYY-MM-DD", inventoryItemId: Number, status: String }
     */
    occupiedDates: {
      type: Array,
      default: () => []
    },
    /**
     * bookedItems: Items currently in the cart that require dates (perNight items)
     * Each entry has: { item_id: Number, category: String, name: String }
     */
    bookedItems: {
      type: Array,
      default: () => []
    },
    /**
     * allRooms: Full list of all room/cottage inventory items
     * Used to count total rooms per category
     */
    allRooms: {
      type: Array,
      default: () => []
    },
    validationError: {
      type: String,
      default: null
    }
  },
  emits: ['close', 'select-date', 'prev-month', 'next-month', 'clear'],
  computed: {
    monthYearStr() {
      return this.currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
    },
    calendarDays() {
      const year = this.currentMonth.getFullYear()
      const month = this.currentMonth.getMonth()
      const firstDay = new Date(year, month, 1).getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const days = []

      for (let i = 0; i < firstDay; i++) days.push(null)
      for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))

      return days
    }
  },
  methods: {
    isCheckInDate(date) {
      return this.checkIn && date.toDateString() === this.checkIn.toDateString()
    },
    isCheckOutDate(date) {
      return this.checkOut && date.toDateString() === this.checkOut.toDateString()
    },
    isBetweenDates(date) {
      return this.checkIn && this.checkOut && date > this.checkIn && date < this.checkOut
    },

    /**
     * Convert a calendar Date object to a "YYYY-MM-DD" string
     * using LOCAL time — avoids UTC timezone offset issues
     * e.g. new Date(2026, 2, 7) → "2026-03-07" (always correct)
     */
    toLocalDateStr(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    /**
     * Normalize an occupied date entry's date string to "YYYY-MM-DD"
     * Handles all possible field names from the API:
     *   entry.date, entry.occupiedDate, entry.occupied_date
     */
    getOccupiedDateStr(entry) {
      const raw = entry.date ?? entry.occupiedDate ?? entry.occupied_date ?? null
      if (!raw) return null
      // If it has a time component (e.g. "2026-03-07T00:00:00"), slice only date part
      return String(raw).split('T')[0]
    },

    /**
     * Get the inventory item ID from an occupied date entry
     * Handles both camelCase and snake_case field names
     */
    getOccupiedItemId(entry) {
      return Number(entry.inventoryItemId ?? entry.inventory_item_id ?? 0)
    },

    /**
     * Core logic: should this calendar date be disabled?
     *
     * If there are booked items in cart (perNight items):
     *   → Disable if ALL rooms of the booked item's category are occupied on this date
     *
     * If NO booked items in cart:
     *   → Never disable (user is just browsing dates freely)
     */
    isAllRoomsBooked(date) {
      // No booked items = no restriction
      if (!this.bookedItems || this.bookedItems.length === 0) return false

      const dateStr = this.toLocalDateStr(date)

      // Check each booked item in the cart
      for (const bookedItem of this.bookedItems) {
        const category = bookedItem.category

        // Get all rooms of this same category from inventory
        const roomsOfCategory = this.allRooms.filter(r => r.category === category)
        const totalRoomsOfCategory = roomsOfCategory.length

        // No rooms of this category found = skip (can't determine availability)
        if (totalRoomsOfCategory === 0) continue

        // Build a set of item_ids belonging to this category for fast lookup
        const categoryItemIds = new Set(roomsOfCategory.map(r => Number(r.item_id)))

        // Count how many rooms of this category are occupied on this date
        const occupiedCount = this.occupiedDates.filter(entry => {
          const entryItemId = this.getOccupiedItemId(entry)
          const entryDateStr = this.getOccupiedDateStr(entry)
          return entryDateStr === dateStr && categoryItemIds.has(entryItemId)
        }).length

        // If ALL rooms of this category are occupied, disable this date
        if (occupiedCount >= totalRoomsOfCategory) {
          return true
        }
      }

      return false
    },

    isDisabled(date) {
      // Disable past dates
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date < today) return true

      // Disable if all rooms of the selected category are fully booked
      return this.isAllRoomsBooked(date)
    }
  }
}
</script>