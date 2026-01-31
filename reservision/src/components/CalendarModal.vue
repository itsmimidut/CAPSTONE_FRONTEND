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
            @click="$emit('select-date', day)"
            :class="[
              'w-9 h-9 rounded-lg text-sm font-bold transition',
              isCheckInDate(day) || isCheckOutDate(day)
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
    }
  }
}
</script>