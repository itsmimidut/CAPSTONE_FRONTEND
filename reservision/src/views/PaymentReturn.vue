<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div class="inline-flex items-center justify-center">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 bg-gradient-to-r from-primary-blue to-accent-blue rounded-full animate-spin" style="opacity: 0.25;"></div>
            <div class="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <i class="fas fa-credit-card text-2xl text-primary-blue"></i>
            </div>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-text-dark">Processing Payment</h2>
        <p class="text-text-muted">Please wait while we verify your payment...</p>
        <p class="text-sm text-text-muted mt-4">{{ message }}</p>
      </div>

      <div v-else-if="success" class="space-y-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <i class="fas fa-check text-3xl text-green-600"></i>
        </div>
        <h2 class="text-2xl font-bold text-green-600">Payment Confirmed!</h2>
        <p class="text-text-muted">Redirecting to confirmation page...</p>
      </div>

      <div v-else class="space-y-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
          <i class="fas fa-times text-3xl text-red-600"></i>
        </div>
        <h2 class="text-2xl font-bold text-red-600">{{ errorMessage }}</h2>
        <div class="space-y-2">
          <router-link to="/booking-confirmation" class="block w-full py-2 bg-primary-blue text-white rounded-lg font-medium hover:bg-accent-blue transition">
            Try Again
          </router-link>
          <router-link to="/" class="block w-full py-2 border border-primary-blue text-primary-blue rounded-lg font-medium hover:bg-blue-50 transition">
            Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const success = ref(false)
const message = ref('Connecting to payment gateway...')
const errorMessage = ref('')

const checkPaymentStatus = async () => {
  try {
    // Get all URL params for debugging
    const searchParams = new URLSearchParams(window.location.search)
    const allParams = {}
    searchParams.forEach((value, key) => {
      allParams[key] = value
    })
    console.log('🔍 URL Parameters received:', allParams)

    // Try multiple possible parameter names
    const paymentLinkId = searchParams.get('payment_link_id') 
      || searchParams.get('link_id')
      || searchParams.get('id')
    const bookingId = searchParams.get('bookingId')

    console.log('📋 Extracted:', { paymentLinkId, bookingId })

    // If no payment link ID, try to get from backend using bookingId
    if (!paymentLinkId && bookingId) {
      message.value = 'Verifying booking payment...'
      
      // Get booking details from backend
      const bookingResponse = await fetch(`http://localhost:8000/api/bookings/${bookingId}`)
      const bookingData = await bookingResponse.json()
      
      console.log('📦 Booking data:', bookingData)
      
      if (bookingData.success && bookingData.data.payment_status === 'Paid') {
        // Payment already confirmed!
        const email = bookingData.data.email || ''
        const bookingRef = bookingData.data.booking_reference || ''
        success.value = true
        loading.value = false
        message.value = 'Payment verified!'
        
        setTimeout(() => {
          router.push(`/confirmation?bookingId=${bookingId}&email=${encodeURIComponent(email)}&bookingRef=${encodeURIComponent(bookingRef)}`)
        }, 2000)
        return
      }
    }

    if (!paymentLinkId) {
      throw new Error('Payment link ID not found. Payment may already be processed.')
    }

    // Check payment status via PayMongo API
    let attempts = 0
    const maxAttempts = 30

    while (attempts < maxAttempts) {
      message.value = `Checking payment status... (${attempts + 1}/${maxAttempts})`
      
      const response = await fetch(`http://localhost:8000/api/paymongo/payment-status/${paymentLinkId}`)
      const data = await response.json()

      console.log('💳 Payment status:', data)

      if (data.success && data.isPaid) {
        // Payment successful!
        // Fetch booking data to get email
        const bookingResponse = await fetch(`http://localhost:8000/api/bookings/${bookingId}`)
        const bookingResult = await bookingResponse.json()
        const email = bookingResult.data?.email || ''
        const bookingRef = bookingResult.data?.booking_reference || ''
        
        success.value = true
        loading.value = false
        message.value = 'Payment verified!'

        // Redirect to confirmation page after 2 seconds
        setTimeout(() => {
          router.push(`/confirmation?bookingId=${bookingId}&email=${encodeURIComponent(email)}&bookingRef=${encodeURIComponent(bookingRef)}`)
        }, 2000)
        return
      }

      attempts++
      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // If we get here, payment wasn't confirmed in time
    throw new Error('Payment confirmation timed out. Please check your payment status.')

  } catch (error) {
    loading.value = false
    success.value = false
    errorMessage.value = error.message || 'Payment verification failed'
    console.error('❌ Payment check error:', error)
  }
}

onMounted(() => {
  checkPaymentStatus()
})
</script>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 2s linear infinite;
}
</style>
