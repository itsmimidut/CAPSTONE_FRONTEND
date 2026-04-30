<template>
  <div class="bg-white rounded-2xl shadow-xl border-2 sticky top-24 overflow-hidden" :style="{ borderColor: '#1E88B6' }">
    <!-- Header with Clear Button on Top Right -->
    <div class="p-5 border-b-2" :style="{ borderColor: '#E0E0E0' }">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold flex items-center gap-2" :style="{ color: '#1E88B6' }">
          <i class="fas fa-shopping-cart"></i>
          Your Booking
        </h2>
        <button
          v-if="items.length > 0"
          @click="emit('clear')"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1"
          :style="{ backgroundColor: 'rgba(242, 194, 0, 0.1)', color: '#F2C200' }"
          @mouseover="(e) => { e.target.style.backgroundColor = '#F2C200'; e.target.style.color = 'white'; }"
          @mouseleave="(e) => { e.target.style.backgroundColor = 'rgba(242, 194, 0, 0.1)'; e.target.style.color = '#F2C200'; }"
        >
          <i class="fas fa-trash-alt text-xs"></i>
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Content - No Scroll, Everything Visible -->
    <div class="p-5">
      <!-- Stay Duration - Compact -->
      <div v-if="validCheckIn && validCheckOut" class="mb-5">
        <div class="flex items-center gap-2 mb-2">
          <i class="fas fa-calendar-alt text-sm" :style="{ color: '#1E88B6' }"></i>
          <span class="text-sm font-semibold" :style="{ color: '#1E88B6' }">Stay Duration</span>
        </div>
        <div class="bg-gray-50 rounded-lg p-3">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">Check-in:</span>
            <span class="font-medium" :style="{ color: '#1E88B6' }">{{ formatDate(validCheckIn) }}</span>
          </div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-600">Check-out:</span>
            <span class="font-medium" :style="{ color: '#1E88B6' }">{{ formatDate(validCheckOut) }}</span>
          </div>
          <div class="pt-2 border-t border-gray-200 flex justify-between">
            <span class="text-gray-600 text-sm">Duration:</span>
            <span class="font-bold" :style="{ color: '#1E88B6' }">{{ nights }} night{{ nights !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>

      <!-- Items List - Compact, No Scroll -->
      <div v-if="items.length > 0" class="space-y-3 mb-5">
        <div 
          v-for="(item, index) in items" 
          :key="index" 
          class="border rounded-lg p-3"
          :style="{ borderColor: '#E0E0E0' }"
        >
          <!-- Room Name & Remove Button -->
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-bold text-sm uppercase tracking-wide" :style="{ color: '#1E88B6' }">
              {{ item.item.name }}
            </h4>
            <button
              @click="emit('remove', item.item.id)"
              class="w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-50 transition"
              :style="{ color: '#999' }"
              @mouseover="(e) => e.target.style.color = '#F2C200'"
              @mouseleave="(e) => e.target.style.color = '#999'"
            >
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>

          <!-- Swimming Details (if any) - Ultra Compact -->
          <div v-if="item.swimmingDetails" class="mb-2 flex flex-wrap gap-1">
            <span class="text-xs px-2 py-0.5 rounded" :style="{ backgroundColor: '#E3F2FD', color: '#1E88B6' }">
              {{ item.swimmingDetails.selectedDates }} sessions
            </span>
            <span class="text-xs px-2 py-0.5 rounded" :style="{ backgroundColor: '#E3F2FD', color: '#1E88B6' }">
              {{ item.swimmingDetails.time }}
            </span>
            <span class="text-xs px-2 py-0.5 rounded" :style="{ backgroundColor: '#E3F2FD', color: '#1E88B6' }">
              {{ item.swimmingDetails.participants }} pax
            </span>
          </div>

          <!-- Item Details - Single Line -->
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-3">
              <span class="text-gray-600">Qty: <span class="font-semibold" :style="{ color: '#1E88B6' }">{{ item.qty }}</span></span>
              <span class="text-gray-600">Guests: <span class="font-semibold" :style="{ color: '#1E88B6' }">{{ item.guests }}</span></span>
              <span v-if="item.item.perNight && nights > 0" class="text-gray-600">
                Stay: <span class="font-semibold" :style="{ color: '#1E88B6' }">{{ nights }} night{{ nights > 1 ? 's' : '' }}</span>
              </span>
            </div>
            <div class="font-bold" :style="{ color: '#1E88B6' }">
              ₱{{ getLineTotal(item).toLocaleString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State - Compact -->
      <div v-else class="text-center py-8 mb-5">
        <i class="fas fa-calendar-plus text-2xl mb-2" :style="{ color: '#1E88B6', opacity: 0.5 }"></i>
        <p class="text-sm text-gray-500">No items selected</p>
      </div>

      <!-- Totals - Clean & Simple -->
      <div v-if="items.length > 0" class="border-t-2 pt-4" :style="{ borderColor: '#1E88B6' }">
        <!-- Subtotal Row -->
        <div class="flex justify-between items-center mb-2">
          <span class="text-gray-700 text-sm font-medium">Subtotal</span>
          <span class="font-bold" :style="{ color: '#1E88B6' }">₱{{ subtotal.toLocaleString() }}</span>
        </div>
        
        <!-- Service Fee Row -->
        <div class="flex justify-between items-center mb-3">
          <span class="text-gray-500 text-sm">Service Fee & Taxes</span>
          <span class="text-xs px-2 py-0.5 rounded-full font-medium" :style="{ backgroundColor: '#FEF3E2', color: '#F2C200' }">
            Included
          </span>
        </div>

        <!-- Total Amount - Prominent -->
        <div class="p-3 rounded-lg mb-3" :style="{ background: 'linear-gradient(135deg, #1E88B6, #1F8DBF)' }">
          <div class="flex justify-between items-center text-white">
            <span class="font-bold">Total Amount</span>
            <span class="text-xl font-bold">₱{{ total.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Book Now Button -->
        <button 
          @click="emit('checkout')"
          class="w-full py-3 text-white rounded-lg font-bold transition transform hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2 shadow-md"
          :style="{ background: 'linear-gradient(135deg, #F2C200, #F7D13E)' }"
        >
          <i class="fas fa-check-circle text-sm"></i>
          <span>Book Now</span>
          <i class="fas fa-arrow-right text-sm"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  checkIn: {
    type: [Date, String],
    default: null
  },
  checkOut: {
    type: [Date, String],
    default: null
  },
  subtotal: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['remove', 'clear', 'checkout'])

const validCheckIn = computed(() => {
  if (!props.checkIn) return null
  return props.checkIn instanceof Date ? props.checkIn : new Date(props.checkIn)
})

const validCheckOut = computed(() => {
  if (!props.checkOut) return null
  return props.checkOut instanceof Date ? props.checkOut : new Date(props.checkOut)
})

const nights = computed(() => {
  if (!validCheckIn.value || !validCheckOut.value) return 0
  const diff = validCheckOut.value - validCheckIn.value
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const formatDate = (date) => {
  if (!date) return ''
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const getLineTotal = (item) => {
  const multiplier = item.item.perNight && nights.value > 0 ? nights.value : 1
  return item.item.price * item.qty * multiplier
}
</script>

<style scoped>
/* No scrollbars - everything visible */
.space-y-3 {
  max-height: none;
  overflow: visible;
}

/* Smooth transitions */
button {
  transition: all 0.15s ease;
}


</style>