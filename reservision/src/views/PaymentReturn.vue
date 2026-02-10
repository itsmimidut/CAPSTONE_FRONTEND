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
        
        <!-- Progress indicator -->
        <div class="max-w-md mx-auto mt-4">
          <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              class="bg-gradient-to-r from-primary-blue to-accent-blue h-full transition-all duration-500 rounded-full"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <p class="text-xs text-text-muted mt-2">
            This usually takes 5-30 seconds
          </p>
        </div>
      </div>

      <div v-else-if="success" class="space-y-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <i class="fas fa-check text-3xl text-green-600"></i>
        </div>
        <h2 class="text-2xl font-bold text-green-600">Payment Confirmed!</h2>
        <p class="text-text-muted">Redirecting to confirmation page...</p>
      </div>

      <div v-else class="space-y-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
          <i class="fas fa-clock text-3xl text-yellow-600"></i>
        </div>
        <h2 class="text-2xl font-bold text-yellow-600">Payment Processing...</h2>
        <p class="text-text-muted max-w-md mx-auto">
          {{ errorMessage }}
        </p>
        <p class="text-sm text-text-muted max-w-md mx-auto">
          If you completed the payment, it may still be processing. 
          Please wait a moment and try refreshing, or check your email for confirmation.
        </p>
        <div class="space-y-2">
          <button 
            @click="checkPaymentStatus" 
            class="block w-full py-3 bg-primary-blue text-white rounded-lg font-medium hover:bg-accent-blue transition shadow-md"
          >
            <i class="fas fa-sync-alt mr-2"></i>Check Payment Again
          </button>
          <router-link to="/customer?activeSection=bookings" class="block w-full py-2 border border-primary-blue text-primary-blue rounded-lg font-medium hover:bg-blue-50 transition">
            <i class="fas fa-list mr-2"></i>View My Bookings
          </router-link>
          <router-link to="/" class="block w-full py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition">
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
const progressPercentage = ref(0)

const checkPaymentStatus = async () => {
  try {
    // Get payment tracking info from sessionStorage (set before redirect to PayMongo)
    const paymentTrackingData = sessionStorage.getItem('paymentTracking')
    let bookingId, paymentLinkId, email
    
    if (paymentTrackingData) {
      const tracking = JSON.parse(paymentTrackingData)
      bookingId = tracking.bookingId
      paymentLinkId = tracking.paymentLinkId
      email = tracking.email
      console.log('📋 Retrieved payment tracking from sessionStorage:', tracking)
    }
    
    // Fallback: Try to get from URL params (in case sessionStorage was cleared)
    if (!bookingId || !paymentLinkId) {
      const searchParams = new URLSearchParams(window.location.search)
      bookingId = searchParams.get('bookingId')
      paymentLinkId = searchParams.get('paymentLinkId') 
        || searchParams.get('payment_link_id')
        || searchParams.get('link_id')
        || searchParams.get('id')
      console.log('🔍 Fallback - URL Parameters:', { bookingId, paymentLinkId })
    }

    console.log('📦 Final values:', { bookingId, paymentLinkId })

    // If we have bookingId but no paymentLinkId, try to check booking status directly
    if (bookingId && !paymentLinkId) {
      message.value = 'Checking booking payment status...'
      
      const bookingResponse = await fetch(`http://localhost:8000/api/bookings/${bookingId}`)
      const bookingData = await bookingResponse.json()
      
      console.log('📦 Booking data:', bookingData)
      
      if (bookingData.success && bookingData.data.payment_status === 'Paid') {
        // Payment already confirmed!
        const email = bookingData.data.email || ''
        const bookingRef = bookingData.data.booking_reference || ''
        progressPercentage.value = 100
        success.value = true
        loading.value = false
        message.value = 'Payment verified!'
        
        // Clear sessionStorage
        sessionStorage.removeItem('paymentTracking')
        
        setTimeout(() => {
          router.push(`/confirmation?bookingId=${bookingId}&email=${encodeURIComponent(email)}&bookingRef=${encodeURIComponent(bookingRef)}`)
        }, 1500)
        return
      }
    }

    if (!bookingId) {
      throw new Error('Booking ID not found. Please check your email or contact support.')
    }
    
    if (!paymentLinkId) {
      throw new Error('Payment link ID not found. Checking booking status instead...')
    }

    // Check payment status via PayMongo API
    let attempts = 0
    const maxAttempts = 60  // Increased from 30 to 60 (2 minutes total)

    while (attempts < maxAttempts) {
      const secondsElapsed = attempts * 2
      progressPercentage.value = Math.min((attempts / maxAttempts) * 100, 95) // Cap at 95% until confirmed
      message.value = `Checking payment status... (${secondsElapsed}s elapsed)`
      
      try {
        // First, check booking database directly (this is updated by webhook)
        if (bookingId) {
          const bookingResponse = await fetch(`http://localhost:8000/api/bookings/${bookingId}`)
          const bookingData = await bookingResponse.json()
          
          console.log(`[Attempt ${attempts + 1}] 📦 Booking status:`, bookingData.data?.payment_status)
          
          // Check if webhook already updated the database
          if (bookingData.success && bookingData.data.payment_status === 'Paid') {
            console.log('✅ Payment confirmed via database!')
            const email = bookingData.data?.email || ''
            const bookingRef = bookingData.data?.booking_reference || ''
            
            progressPercentage.value = 100
            success.value = true
            loading.value = false
            message.value = 'Payment verified!'
            
            // Clear payment tracking from sessionStorage
            sessionStorage.removeItem('paymentTracking')
            
            setTimeout(() => {
              router.push(`/confirmation?bookingId=${bookingId}&email=${encodeURIComponent(email)}&bookingRef=${encodeURIComponent(bookingRef)}`)
            }, 1500)
            return
          }
        }
        
        // Second, check PayMongo API directly (in case webhook is delayed)
        const response = await fetch(`http://localhost:8000/api/paymongo/payment-status/${paymentLinkId}`)
        const data = await response.json()

        console.log(`[Attempt ${attempts + 1}] 💳 PayMongo status:`, data)

        if (data.success && data.isPaid) {
          console.log('✅ Payment confirmed via PayMongo API!')
          // Payment successful!
          // Fetch booking data to get email
          const bookingResponse = await fetch(`http://localhost:8000/api/bookings/${bookingId}`)
          const bookingResult = await bookingResponse.json()
          const email = bookingResult.data?.email || ''
          const bookingRef = bookingResult.data?.booking_reference || ''
          
          progressPercentage.value = 100
          success.value = true
          loading.value = false
          message.value = 'Payment verified!'

          // Clear payment tracking from sessionStorage
          sessionStorage.removeItem('paymentTracking')

          // Redirect to confirmation page after 1.5 seconds
          setTimeout(() => {
            router.push(`/confirmation?bookingId=${bookingId}&email=${encodeURIComponent(email)}&bookingRef=${encodeURIComponent(bookingRef)}`)
          }, 1500)
          return
        }
      } catch (pollError) {
        console.warn(`[Attempt ${attempts + 1}] ⚠️ Polling error:`, pollError)
        // Continue polling even if one attempt fails
      }

      attempts++
      
      // Progressive delay: faster checks initially, slower later
      const delay = attempts < 10 ? 2000 : attempts < 20 ? 3000 : 4000
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    // If we get here, payment wasn't confirmed in time
    loading.value = false
    success.value = false
    errorMessage.value = 'Payment verification is taking longer than expected. Your payment may still be processing. Please check again in a moment or view your bookings.'
    console.warn('⏱️ Payment polling timeout - but payment may still be processing')

  } catch (error) {
    loading.value = false
    success.value = false
    errorMessage.value = error.message || 'Payment verification encountered an issue. Please check your bookings or contact support.'
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
