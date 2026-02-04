<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
      <div class="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <i class="fas fa-check text-4xl text-green-600"></i>
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-3">Payment Confirmed!</h2>

      <p class="text-gray-600 mb-6">
        Your booking is secured. A confirmation email has been sent to
        <span class="font-semibold text-gray-800 block mt-2 break-all">{{ displayEmail }}</span>
      </p>

      <div v-if="bookingId" class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div class="text-sm text-gray-500 mb-1">Booking Reference</div>
        <div class="text-2xl font-bold text-blue-600">{{ bookingReference || bookingId }}</div>
      </div>

      <div v-if="paymentMethod" class="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
        <div class="text-sm text-gray-500 mb-1">Payment Method</div>
        <div class="text-lg font-semibold text-gray-800">{{ paymentMethod }}</div>
      </div>

      <div class="space-y-3">
        <router-link
          to="/"
          class="block w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md"
        >
          <i class="fas fa-home mr-2"></i>Back to Home
        </router-link>
        
        <router-link
          to="/reservation"
          class="block w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
        >
          <i class="fas fa-calendar-plus mr-2"></i>Make Another Booking
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const email = ref('')
const bookingId = ref('')
const bookingReference = ref('')
const paymentMethod = ref('')

// Display email with fallback
const displayEmail = computed(() => {
  return email.value || 'your email'
})

onMounted(async () => {
  console.log('🔍 Route query params:', route.query)
  
  // Get all params from URL
  bookingId.value = route.query.bookingId || ''
  
  // Try to get email from URL first (it's passed from PaymentReturn)
  if (route.query.email) {
    email.value = decodeURIComponent(route.query.email)
    console.log('📧 Email from URL:', email.value)
  }
  
  bookingReference.value = route.query.bookingRef ? decodeURIComponent(route.query.bookingRef) : ''
  
  // If we have bookingId but still missing email, fetch from backend as fallback
  if (bookingId.value && !email.value) {
    try {
      console.log('📡 Fetching booking details for ID:', bookingId.value)
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId.value}`)
      const result = await response.json()
      
      console.log('📦 Booking response:', result)
      
      if (result.success && result.data) {
        email.value = result.data.email || ''
        bookingReference.value = result.data.booking_reference || ''
        paymentMethod.value = result.data.payment_method || ''
        
        console.log('✅ Fetched email:', email.value)
      }
    } catch (error) {
      console.error('❌ Error fetching booking details:', error)
    }
  } else if (bookingId.value && email.value) {
    // Email is already set from URL, just fetch payment method if needed
    try {
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId.value}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        if (!bookingReference.value) {
          bookingReference.value = result.data.booking_reference || ''
        }
        paymentMethod.value = result.data.payment_method || ''
      }
    } catch (error) {
      console.error('Error fetching payment method:', error)
    }
  }
})
</script>

<style scoped>
/* Additional styling if needed */
</style>
