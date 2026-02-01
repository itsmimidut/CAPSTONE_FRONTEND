<template>
  <div class="contact-billing-container">
    <!-- Contact & Billing Section -->
    <div class="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-8 mb-6 border border-blue-100 relative z-10">
      <!-- Header with Icon -->
      <div class="mb-8 pb-4 border-b-2 border-blue-200">
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
            <i class="fas fa-address-book text-white text-xl"></i>
          </div>
          <span class="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Contact & Billing Informations
          </span>
        </h2>
        <p class="text-sm text-gray-600 mt-2 ml-15">Please fill in your details for the reservation</p>
      </div>

      <!-- Personal Information Section -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide flex items-center gap-2">
          <i class="fas fa-user text-blue-600"></i>
          Personal Information
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              First Name <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-user text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                :value="firstName"
                @input="$emit('update:firstName', $event.target.value)"
                class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-blue-400"
                placeholder="Juan"
              />
            </div>
          </div>
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Last Name <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-user text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                :value="lastName"
                @input="$emit('update:lastName', $event.target.value)"
                class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-blue-400"
                placeholder="Dela Cruz"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information Section -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide flex items-center gap-2">
          <i class="fas fa-phone text-blue-600"></i>
          Contact Details
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-0">
              <div class="flex items-center justify-center px-4 bg-blue-600 rounded-l-xl text-sm font-bold text-white shadow-sm">
                +63
              </div>
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-mobile-alt text-gray-400 text-sm"></i>
                </div>
                <input
                  type="tel"
                  :value="phone"
                  @input="$emit('update:phone', $event.target.value)"
                  class="w-full pl-10 pr-4 py-3 border-2 border-l-0 border-gray-300 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-blue-400"
                  placeholder="912 345 6789"
                  maxlength="10"
                />
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Email Address <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-envelope text-gray-400 text-sm"></i>
              </div>
              <input
                type="email"
                :value="email"
                @input="$emit('update:email', $event.target.value)"
                class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-blue-400"
                placeholder="juan@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Address Information Section -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide flex items-center gap-2">
          <i class="fas fa-map-marker-alt text-blue-600"></i>
          Address Information
        </h3>
        <!-- Street Address - Full Width -->
        <div class="mb-5">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Street Address <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="fas fa-home text-gray-400 text-sm"></i>
            </div>
            <input
              type="text"
              :value="address"
              @input="$emit('update:address', $event.target.value)"
              class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-blue-400"
              placeholder="123 Resort Street, Barangay Name"
            />
          </div>
        </div>

        <!-- City, Country, Postal - Three Columns -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              City <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-city text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                :value="city"
                @input="$emit('update:city', $event.target.value)"
                class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-blue-400"
                placeholder="Calapan"
              />
            </div>
          </div>
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Country <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-globe text-gray-400 text-sm"></i>
              </div>
              <select
                :value="country"
                @change="$emit('update:country', $event.target.value)"
                class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-blue-400 appearance-none cursor-pointer"
              >
                <option>Philippines</option>
                <option>United States</option>
                <option>Singapore</option>
                <option>Japan</option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Postal Code <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-mail-bulk text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                :value="postal"
                @input="$emit('update:postal', $event.target.value)"
                class="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-blue-400"
                placeholder="5200"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Special Requests Section -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
        <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-comment-dots text-blue-600"></i>
          </div>
          <span>Special Requests or Instructions <span class="text-gray-500 font-normal">(Optional)</span></span>
        </label>
        <textarea
          :value="specialRequests"
          @input="$emit('update:specialRequests', $event.target.value)"
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 bg-white hover:border-blue-400"
          placeholder="Let us know about any special requests, dietary restrictions, accessibility needs, or specific preferences for your stay..."
          rows="4"
        ></textarea>
        <div class="flex items-center gap-2 mt-3">
          <div class="w-1 h-1 bg-blue-500 rounded-full"></div>
          <p class="text-xs text-gray-500">
            We'll do our best to accommodate your requests based on availability
          </p>
        </div>
      </div>
    </div>

    <!-- Booking Summary Section -->
    <div v-if="items && items.length > 0" class="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg p-8 border border-purple-100 relative z-10">
      <!-- Header -->
      <div class="mb-6 pb-4 border-b-2 border-purple-200">
        <h3 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-md">
            <i class="fas fa-shopping-cart text-white text-xl"></i>
          </div>
          <span class="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Booking Summary
          </span>
        </h3>
      </div>

      <!-- Date Info Card -->
      <div v-if="checkIn && checkOut" class="mb-6 p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md text-white">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <i class="fas fa-calendar-alt text-white text-lg"></i>
          </div>
          <span class="font-bold text-lg">Stay Duration</span>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-white bg-opacity-10 rounded-lg p-3">
            <div class="text-xs text-blue-100 mb-1">Check-in</div>
            <div class="font-bold text-sm">{{ formatDate(checkIn) }}</div>
          </div>
          <div class="bg-white bg-opacity-10 rounded-lg p-3">
            <div class="text-xs text-blue-100 mb-1">Check-out</div>
            <div class="font-bold text-sm">{{ formatDate(checkOut) }}</div>
          </div>
        </div>
        <div class="bg-white bg-opacity-20 rounded-lg p-3 text-center">
          <span class="font-bold text-lg">{{ nights }} night{{ nights !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Items List -->
      <div class="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div class="flex gap-4">
            <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 shadow-sm">
              <img 
                v-if="item.item.imgs && item.item.imgs[0]" 
                :src="item.item.imgs[0]" 
                :alt="item.item.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <i class="fas fa-image text-gray-400 text-2xl"></i>
              </div>
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-gray-800 text-base mb-2">{{ item.item.name }}</h4>
              <div class="flex flex-wrap gap-3 mb-3">
                <div class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <i class="fas fa-layer-group mr-1"></i>
                  Qty: {{ item.qty }}
                </div>
                <div class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <i class="fas fa-users mr-1"></i>
                  {{ item.guests }} Guests
                </div>
                <div v-if="item.item.perNight && nights > 0" class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <i class="fas fa-moon mr-1"></i>
                  {{ nights }} night{{ nights > 1 ? 's' : '' }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="font-bold text-purple-700 text-xl">₱{{ getLineTotal(item).toLocaleString() }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Section -->
      <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
        <div class="flex justify-between items-center mb-3 pb-3 border-b border-purple-400">
          <span class="text-purple-100 font-semibold text-base">Subtotal</span>
          <span class="font-bold text-white text-lg">₱{{ calculatedSubtotal.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between items-center">
          <div>
            <div class="font-bold text-white text-xl mb-1">Total Amount</div>
            <div class="text-purple-200 text-xs">Including all items</div>
          </div>
          <div class="bg-white rounded-lg px-4 py-2 shadow-md">
            <div class="font-bold text-purple-700 text-3xl">₱{{ calculatedTotal.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  country: String,
  postal: String,
  specialRequests: String,
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

defineEmits([
  'update:firstName',
  'update:lastName',
  'update:phone',
  'update:email',
  'update:address',
  'update:city',
  'update:country',
  'update:postal',
  'update:specialRequests'
])

// Calculate nights
const nights = computed(() => {
  if (!props.checkIn || !props.checkOut) return 0
  const start = typeof props.checkIn === 'string' ? new Date(props.checkIn) : props.checkIn
  const end = typeof props.checkOut === 'string' ? new Date(props.checkOut) : props.checkOut
  const diff = end - start
  return Math.ceil(diff / 86400000)
})

// Format date
const formatDate = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Calculate line total
const getLineTotal = (item) => {
  const n = item.item.perNight && nights.value > 0 ? nights.value : 1
  return item.item.price * item.qty * n
}

// Recalculate accurate subtotal
const calculatedSubtotal = computed(() => {
  if (!props.items || props.items.length === 0) return 0
  return props.items.reduce((sum, item) => sum + getLineTotal(item), 0)
})

// Recalculate accurate total (same as subtotal for now, can add taxes/fees later)
const calculatedTotal = computed(() => {
  return calculatedSubtotal.value
})
</script>

<style scoped>
/* Main container with proper overflow handling */
.contact-billing-container {
  width: 100%;
  max-width: 100%;
  overflow: visible;
  position: relative;
  margin: 0 auto;
  padding: 20px 0;
  z-index: 1;
}

.form-group {
  position: relative;
  z-index: 1;
}

/* Prevent any overflow issues */
* {
  box-sizing: border-box;
}

/* Ensure all child elements stay within bounds */
.contact-billing-container > div {
  max-width: 100%;
  position: relative;
  z-index: 2;
}

/* Custom scrollbar for main container */
div::-webkit-scrollbar {
  width: 10px;
}

div::-webkit-scrollbar-track {
  background: transparent;
}

div::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

div::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #1d4ed8);
  background-clip: padding-box;
}

/* Custom scrollbar for items list */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #9333ea, #7c3aed);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #7c3aed, #6d28d9);
}

/* Input animations */
input:focus,
textarea:focus,
select:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Gradient text animation */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>