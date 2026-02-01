<template>
  <div class="bg-white rounded-2xl shadow-xl border-2 border-blue-100 sticky top-24 overflow-hidden">
    <!-- Header with Gradient -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-5">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <i class="fas fa-shopping-cart"></i>
            Your Booking
          </h2>
          <p class="text-blue-100 text-sm mt-1">
            {{ items.length }} item{{ items.length !== 1 ? 's' : '' }} selected
          </p>
        </div>
        <button
          v-if="items.length > 0"
          @click="emit('clear')"
          class="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1"
        >
          <i class="fas fa-trash"></i> Clear
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5">
      <!-- Date Summary -->
      <div v-if="checkIn || checkOut" class="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div class="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <i class="fas fa-calendar-alt text-blue-600"></i>
          Stay Duration
        </div>
        <div class="text-xs text-gray-600 space-y-1">
          <div v-if="checkIn">
            <span class="font-medium">Check-in:</span> 
            {{ checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
          </div>
          <div v-if="checkOut">
            <span class="font-medium">Check-out:</span> 
            {{ checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
          </div>
          <div v-if="checkIn && checkOut" class="pt-2 border-t border-blue-200">
            <span class="text-blue-700 font-bold text-sm">{{ nights }} night{{ nights !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>

    <!-- Items -->
    <div v-if="items.length > 0" class="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="relative p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition group"
      >
        <!-- Remove Button -->
        <button
          @click="emit('remove', item.item.id)"
          class="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full hover:bg-red-600 transition flex items-center justify-center shadow-md z-10 opacity-0 group-hover:opacity-100"
        >
          <i class="fas fa-times text-xs"></i>
        </button>

        <div class="flex gap-3">
          <!-- Item Image -->
          <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 shadow-sm">
            <img 
              v-if="item.item.imgs && item.item.imgs[0]" 
              :src="item.item.imgs[0]" 
              :alt="item.item.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <i class="fas fa-image text-gray-400 text-xl"></i>
            </div>
          </div>

          <!-- Item Details -->
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-gray-800 text-sm mb-2 truncate">{{ item.item.name }}</h4>
            <div class="space-y-1.5 text-xs text-gray-600">
              <div class="flex items-center gap-2">
                <i class="fas fa-cubes text-blue-500 w-3"></i>
                <span>Qty: <span class="font-semibold text-gray-800">{{ item.qty }}</span></span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-users text-blue-500 w-3"></i>
                <span><span class="font-semibold text-gray-800">{{ item.guests }}</span> Guest{{ item.guests > 1 ? 's' : '' }}</span>
              </div>
              <div v-if="item.item.perNight && nights > 0" class="flex items-center gap-2">
                <i class="fas fa-moon text-blue-500 w-3"></i>
                <span><span class="font-semibold text-gray-800">{{ nights }}</span> night{{ nights > 1 ? 's' : '' }}</span>
              </div>
            </div>
            
            <!-- Price -->
            <div class="mt-3 pt-2 border-t border-blue-100 flex items-center justify-between">
              <span class="text-xs text-gray-500">
                ₱{{ item.item.price.toLocaleString() }}{{ item.item.perNight ? '/night' : '' }}
              </span>
              <span class="font-bold text-blue-700 text-sm">₱{{ getLineTotal(item).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="text-center py-16 px-4">
      <div class="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center shadow-inner">
        <i class="fas fa-cart-plus text-4xl text-blue-400"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-800 mb-2">Start Your Reservation</h3>
      <p class="text-sm text-gray-500 leading-relaxed">Browse our rooms, cottages, and services below to begin planning your perfect stay</p>
      <div class="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
        <i class="fas fa-arrow-down animate-bounce"></i>
        <span>Select items below</span>
      </div>
    </div>

    <!-- Totals -->
    <div v-if="items.length > 0" class="border-t-2 border-gray-200 pt-5 space-y-3">
      <div class="space-y-2.5 text-sm">
        <div class="flex justify-between items-center">
          <span class="text-gray-600 flex items-center gap-2">
            <i class="fas fa-calculator text-blue-500"></i>
            Subtotal
          </span>
          <span class="font-semibold text-gray-800">₱{{ subtotal.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-500 flex items-center gap-2">
            <i class="fas fa-receipt text-blue-500"></i>
            Service Fee & Taxes
          </span>
          <span class="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Included</span>
        </div>
      </div>
      
      <div class="bg-gradient-to-r from-blue-600 to-blue-500 p-5 rounded-xl shadow-lg">
        <div class="flex justify-between items-center text-white">
          <span class="font-bold text-base">Total Amount</span>
          <span class="text-3xl font-bold">₱{{ total.toLocaleString() }}</span>
        </div>
      </div>
      
      <!-- Checkout Button -->
      <button 
        @click="emit('checkout')"
        class="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition transform flex items-center justify-center gap-3 group">
        <i class="fas fa-check-circle group-hover:scale-110 transition"></i>
        <span>Proceed to Checkout</span>
        <i class="fas fa-arrow-right group-hover:translate-x-1 transition"></i>
      </button>
      
      <!-- Security Badge -->
      <div class="flex items-center justify-center gap-2 text-xs text-gray-500 mt-3 bg-gray-50 py-2 rounded-lg">
        <i class="fas fa-shield-alt text-green-600"></i>
        <span>Secure & Encrypted Payment</span>
      </div>
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

const emit = defineEmits(['remove', 'clear'])

// Calculate number of nights
const nights = computed(() => {
  if (!props.checkIn || !props.checkOut) return 0
  const diff = props.checkOut - props.checkIn
  return Math.ceil(diff / 86400000)
})

// Calculate line total for each item
const getLineTotal = (item) => {
  const n = item.item.perNight && nights.value > 0 ? nights.value : 1
  return item.item.price * item.qty * n
}
</script>

<style src="../assets/booking-styles.css"></style>
