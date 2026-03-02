<template>
  <div class="bg-white rounded-2xl shadow-xl border-2 sticky top-24 overflow-hidden" :style="{ borderColor: '#1E88B6' }">
    <!-- Header with Gradient - Using new blue palette -->
    <div class="bg-gradient-to-r p-5" :style="{ background: 'linear-gradient(135deg, #1E88B6, #1F8DBF)' }">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold flex items-center gap-2 text-white">
            <i class="fas fa-shopping-cart"></i>
            Your Booking
          </h2>
          <p class="text-blue-100 text-sm mt-1" :style="{ color: '#E3F2FD' }">
            {{ items.length }} item{{ items.length !== 1 ? 's' : '' }} selected
          </p>
        </div>
        <button
          v-if="items.length > 0"
          @click="emit('clear')"
          class="px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1"
          :style="{ backgroundColor: 'rgba(242, 194, 0, 0.2)', color: '#F2C200' }"
          @mouseover="hoverClear = true"
          @mouseleave="hoverClear = false"
          :class="{ 'hover-clear': true }"
        >
          <i class="fas fa-trash"></i> Clear
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Date Summary -->
      <div v-if="checkIn || checkOut" class="mb-4 p-4 rounded-xl border" :style="{ backgroundColor: '#E3F2FD', borderColor: '#1E88B6' }">
        <div class="flex items-center gap-2 text-sm font-semibold mb-2" :style="{ color: '#1E88B6' }">
          <i class="fas fa-calendar-alt" :style="{ color: '#1E88B6' }"></i>
          Stay Duration
        </div>
        <div class="text-xs space-y-1" :style="{ color: '#666' }">
          <div v-if="checkIn">
            <span class="font-medium">Check-in:</span> 
            {{ checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
          </div>
          <div v-if="checkOut">
            <span class="font-medium">Check-out:</span> 
            {{ checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
          </div>
          <div v-if="checkIn && checkOut" class="pt-2 border-t" :style="{ borderColor: '#1E88B6' }">
            <span class="font-bold text-sm" :style="{ color: '#1E88B6' }">{{ nights }} night{{ nights !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>

      <!-- Swimming Dates Summary -->
      <div v-if="hasSwimmingBookings" class="mb-4 p-3 rounded-xl border-2" :style="{ background: 'linear-gradient(135deg, #E3F2FD, #F0F9FF)', borderColor: '#1E88B6' }">
        <div v-for="(booking, index) in swimmingBookings" :key="index" class="space-y-2">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center" :style="{ backgroundColor: '#1E88B6' }">
                <i class="fas fa-swimmer text-white text-xs"></i>
              </div>
              <div>
                <div class="font-bold text-sm" :style="{ color: '#1E88B6' }">{{ booking.item.name }}</div>
                <div class="text-xs" :style="{ color: '#999' }">Swimming Program</div>
              </div>
            </div>
          </div>

          <!-- Compact Info Badges -->
          <div class="flex flex-wrap gap-1.5">
            <div class="bg-white px-2 py-1 rounded-md shadow-sm border text-xs" :style="{ borderColor: '#1E88B6' }">
              <i class="fas fa-clipboard-list mr-1" :style="{ color: '#1E88B6' }"></i>
              <span class="font-semibold" :style="{ color: '#1E88B6' }">{{ booking.swimmingDetails.selectedDates }}/{{ booking.swimmingDetails.totalSessions }}</span>
              <span class="ml-0.5" :style="{ color: '#999' }">sessions</span>
            </div>
            <div class="bg-white px-2 py-1 rounded-md shadow-sm border text-xs" :style="{ borderColor: '#1E88B6' }">
              <i class="fas fa-clock mr-1" :style="{ color: '#1E88B6' }"></i>
              <span class="font-semibold" :style="{ color: '#1E88B6' }">{{ booking.swimmingDetails.time }}</span>
            </div>
            <div class="bg-white px-2 py-1 rounded-md shadow-sm border text-xs" :style="{ borderColor: '#1E88B6' }">
              <i class="fas fa-users mr-1" :style="{ color: '#1E88B6' }"></i>
              <span class="font-semibold" :style="{ color: '#1E88B6' }">{{ booking.swimmingDetails.participants }}</span>
              <span class="ml-0.5" :style="{ color: '#999' }">{{ booking.swimmingDetails.participants > 1 ? 'people' : 'person' }}</span>
            </div>
          </div>

          <!-- Compact Dates Display -->
          <div v-if="booking.swimmingDetails.dates.length > 0">
            <button 
              @click="toggleSwimmingDates(index)"
              type="button"
              class="w-full flex items-center justify-between text-xs font-medium px-2 py-1.5 rounded-md transition"
              :style="{ color: '#1E88B6', backgroundColor: 'rgba(30, 136, 182, 0.05)' }"
              @mouseover="hoverDates = true"
              @mouseleave="hoverDates = false"
            >
              <span>
                <i class="fas fa-calendar-alt mr-1" :style="{ color: '#1E88B6' }"></i>
                {{ booking.swimmingDetails.dates.length }} date{{ booking.swimmingDetails.dates.length > 1 ? 's' : '' }} selected
              </span>
              <i :class="expandedSwimmingBookings.includes(index) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" :style="{ color: '#1E88B6' }"></i>
            </button>

            <!-- Expandable Dates List -->
            <div v-if="expandedSwimmingBookings.includes(index)" class="mt-2 grid grid-cols-2 gap-1 max-h-32 overflow-y-auto p-2 rounded-lg" :style="{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }">
              <div 
                v-for="(date, dateIndex) in booking.swimmingDetails.dates.slice().sort()" 
                :key="dateIndex"
                class="flex items-center gap-1 bg-white px-2 py-1 rounded border text-xs"
                :style="{ borderColor: '#1E88B6' }"
              >
                <i class="fas fa-check-circle" :style="{ color: '#F2C200', fontSize: '8px' }"></i>
                <span class="font-medium" :style="{ color: '#1E88B6' }">{{ formatCompactDate(date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    <!-- Items -->
    <div v-if="items.length > 0" class="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="[
          'relative rounded-xl border-2 transition group',
          item.swimmingDetails 
            ? 'p-3' 
            : 'p-4 hover:shadow-lg'
        ]"
        :style="item.swimmingDetails 
          ? { background: 'linear-gradient(135deg, #E3F2FD, #F0F9FF)', borderColor: '#1E88B6' } 
          : { background: 'linear-gradient(135deg, #E3F2FD, #FFFFFF)', borderColor: '#1E88B6' }"
        @mouseover="hoverItem = true"
        @mouseleave="hoverItem = false"
      >
        <!-- Remove Button -->
        <button
          @click="emit('remove', item.item.id)"
          class="absolute -top-2 -right-2 w-7 h-7 rounded-full transition flex items-center justify-center shadow-md z-10 opacity-0 group-hover:opacity-100"
          :style="{ backgroundColor: '#F2C200', color: '#FFFFFF' }"
          @mouseover="hoverRemove = true"
          @mouseleave="hoverRemove = false"
        >
          <i class="fas fa-times text-xs"></i>
        </button>

        <!-- Swimming Item (Compact Version) -->
        <div v-if="item.swimmingDetails" class="flex gap-2">
          <!-- Swimming Icon -->
          <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" :style="{ backgroundColor: '#1E88B6' }">
            <i class="fas fa-swimmer text-white text-lg"></i>
          </div>

          <!-- Compact Swimming Details -->
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-sm mb-1 truncate" :style="{ color: '#1E88B6' }">{{ item.item.name }}</h4>
            <div class="flex flex-wrap gap-1 mb-2">
              <span class="px-1.5 py-0.5 rounded text-xs font-medium" :style="{ backgroundColor: '#E3F2FD', color: '#1E88B6' }">
                {{ item.swimmingDetails.participants }} {{ item.swimmingDetails.participants > 1 ? 'people' : 'person' }}
              </span>
              <span class="px-1.5 py-0.5 rounded text-xs font-medium" :style="{ backgroundColor: '#FEF3E2', color: '#F2C200' }">
                {{ item.swimmingDetails.selectedDates }} sessions
              </span>
            </div>
            
            <!-- Price -->
            <div class="flex items-center justify-between pt-1.5 border-t" :style="{ borderColor: '#1E88B6' }">
              <span class="text-xs" :style="{ color: '#999' }">Package</span>
              <span class="font-bold text-sm" :style="{ color: '#1E88B6' }">₱{{ getLineTotal(item).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Regular Item -->
        <div v-else class="flex gap-3">
          <!-- Item Image -->
          <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm" :style="{ backgroundColor: '#F5F5F5' }">
            <img 
              v-if="(item.item.imgs && item.item.imgs[0]) || item.item.image" 
              :src="item.item.imgs ? item.item.imgs[0] : item.item.image" 
              :alt="item.item.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <i class="fas fa-image text-xl" :style="{ color: '#999' }"></i>
            </div>
          </div>

          <!-- Item Details -->
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-sm mb-2 truncate" :style="{ color: '#1E88B6' }">{{ item.item.name }}</h4>
            <div class="space-y-1.5 text-xs" :style="{ color: '#666' }">
              <div class="flex items-center gap-2">
                <i class="fas fa-cubes w-3" :style="{ color: '#1E88B6' }"></i>
                <span>Qty: <span class="font-semibold" :style="{ color: '#1E88B6' }">{{ item.qty }}</span></span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-users w-3" :style="{ color: '#1E88B6' }"></i>
                <span><span class="font-semibold" :style="{ color: '#1E88B6' }">{{ item.guests }}</span> Guest{{ item.guests > 1 ? 's' : '' }}</span>
              </div>
              <div v-if="item.item.perNight && nights > 0" class="flex items-center gap-2">
                <i class="fas fa-moon w-3" :style="{ color: '#1E88B6' }"></i>
                <span><span class="font-semibold" :style="{ color: '#1E88B6' }">{{ nights }}</span> night{{ nights > 1 ? 's' : '' }}</span>
              </div>
            </div>
            
            <!-- Price -->
            <div class="mt-3 pt-2 border-t flex items-center justify-between" :style="{ borderColor: '#1E88B6' }">
              <span class="text-xs" :style="{ color: '#999' }">
                ₱{{ item.item.price.toLocaleString() }}{{ item.item.perNight ? '/night' : '' }}
              </span>
              <span class="font-bold text-sm" :style="{ color: '#1E88B6' }">₱{{ getLineTotal(item).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="text-center py-16 px-4">
      <div class="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-inner" :style="{ background: 'linear-gradient(135deg, #E3F2FD, #F0F9FF)' }">
        <i class="fas fa-cart-plus text-4xl" :style="{ color: '#1E88B6' }"></i>
      </div>
      <h3 class="text-lg font-bold mb-2" :style="{ color: '#1E88B6' }">Start Your Reservation</h3>
      <p class="text-sm leading-relaxed" :style="{ color: '#999' }">Browse our rooms, cottages, and services below to begin planning your perfect stay</p>
      <div class="mt-4 flex items-center justify-center gap-2 text-xs" :style="{ color: '#999' }">
        <i class="fas fa-arrow-down animate-bounce" :style="{ color: '#F2C200' }"></i>
        <span>Select items below</span>
      </div>
    </div>

    <!-- Totals -->
    <div v-if="items.length > 0" class="border-t-2 pt-5 space-y-3" :style="{ borderColor: '#E0E0E0' }">
      <div class="space-y-2.5 text-sm">
        <div class="flex justify-between items-center">
          <span class="flex items-center gap-2" :style="{ color: '#666' }">
            <i class="fas fa-calculator" :style="{ color: '#1E88B6' }"></i>
            Subtotal
          </span>
          <span class="font-semibold" :style="{ color: '#1E88B6' }">₱{{ subtotal.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="flex items-center gap-2" :style="{ color: '#999' }">
            <i class="fas fa-receipt" :style="{ color: '#1E88B6' }"></i>
            Service Fee & Taxes
          </span>
          <span class="font-medium px-2 py-0.5 rounded" :style="{ backgroundColor: '#FEF3E2', color: '#F2C200' }">Included</span>
        </div>
      </div>
      
      <div class="p-5 rounded-xl shadow-lg" :style="{ background: 'linear-gradient(135deg, #1E88B6, #1F8DBF)' }">
        <div class="flex justify-between items-center text-white">
          <span class="font-bold text-base">Total Amount</span>
          <span class="text-3xl font-bold">₱{{ total.toLocaleString() }}</span>
        </div>
      </div>
      
      <!-- Checkout Button -->
      <button 
        @click="emit('checkout')"
        class="w-full py-4 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition transform flex items-center justify-center gap-3 group"
        :style="{ background: 'linear-gradient(135deg, #F2C200, #1E88B6)' }"
        @mouseover="hoverCheckout = true"
        @mouseleave="hoverCheckout = false"
      >
        <i class="fas fa-check-circle group-hover:scale-110 transition"></i>
        <span>Proceed to Checkout</span>
        <i class="fas fa-arrow-right group-hover:translate-x-1 transition"></i>
      </button>
      
      <!-- Security Badge -->
      <div class="flex items-center justify-center gap-2 text-xs py-2 rounded-lg" :style="{ backgroundColor: '#F5F5F5', color: '#999' }">
        <i class="fas fa-shield-alt" :style="{ color: '#F2C200' }"></i>
        <span>Secure & Encrypted Payment</span>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { computed, ref } from 'vue'

// Hover states
const hoverClear = ref(false)
const hoverDates = ref(false)
const hoverItem = ref(false)
const hoverRemove = ref(false)
const hoverCheckout = ref(false)

// Track which swimming bookings are expanded
const expandedSwimmingBookings = ref([])

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  checkIn: {
    type: Date,
    default: null
  },
  checkOut: {
    type: Date,
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

// Calculate number of nights
const nights = computed(() => {
  if (!props.checkIn || !props.checkOut) return 0
  const diff = props.checkOut - props.checkIn
  return Math.ceil(diff / 86400000)
})

// Get all swimming bookings
const swimmingBookings = computed(() => {
  return props.items.filter(item => item.swimmingDetails)
})

// Check if there are any swimming bookings
const hasSwimmingBookings = computed(() => {
  return swimmingBookings.value.length > 0
})

// Toggle swimming dates expansion
const toggleSwimmingDates = (index) => {
  const expandedIndex = expandedSwimmingBookings.value.indexOf(index)
  if (expandedIndex > -1) {
    expandedSwimmingBookings.value.splice(expandedIndex, 1)
  } else {
    expandedSwimmingBookings.value.push(index)
  }
}

// Format swimming date for display (full format)
const formatSwimmingDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

// Format compact date (shorter format)
const formatCompactDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  })
}

// Calculate line total for each item
const getLineTotal = (item) => {
  const n = item.item.perNight && nights.value > 0 ? nights.value : 1
  return item.item.price * item.qty * n
}
</script>

<style scoped>
.hover-clear:hover {
  background-color: #F2C200 !important;
  color: white !important;
}

button[style*="linear-gradient(135deg, #F2C200, #1E88B6)"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(30, 136, 182, 0.3);
}

button[style*="linear-gradient(135deg, #F2C200, #1E88B6)"]:active {
  transform: translateY(0);
}
</style>