<template>
  <div class="payment-return-bg">
    <div class="payment-card">

      <!-- Loading -->
      <div v-if="loading" class="state-block">
        <div class="spinner-ring">
          <div class="spinner-inner">
            <i class="fas fa-credit-card"></i>
          </div>
        </div>
        <h2 class="state-title">Verifying Payment</h2>
        <p class="state-sub">Please keep this page open. We're confirming your payment securely.</p>
        <!-- <p class="state-msg">{{ message }}</p>
        <div v-if="hasBookingMeta" class="meta-box">
          <div v-if="bookingReference" class="meta-row"><span>Reference:</span> <strong>{{ bookingReference }}</strong></div>
          <div v-if="bookingId" class="meta-row"><span>Booking ID:</span> <strong>{{ bookingId }}</strong></div>
          <div v-if="email" class="meta-row"><span>Email:</span> <strong>{{ email }}</strong></div>
        </div> -->
      </div>

      <!-- Success -->
      <div v-else-if="success" class="state-block">
        <div class="success-ring">
          <i class="fas fa-check"></i>
        </div>
        <h2 class="state-title success">Payment Confirmed!</h2>
        <p class="state-sub">Your booking is secured. Redirecting you now&hellip;</p>
      </div>

      <!-- Failed / Timeout -->
      <div v-else class="state-block">
        <div class="warn-ring">
          <i class="fas fa-clock"></i>
        </div>
        <h2 class="state-title warn">Still Processing&hellip;</h2>
        <p class="state-sub">{{ errorMessage }}</p>
        <p class="state-hint">If you completed the payment, it may still be finalising. Check your email for a confirmation, or tap below to try again.</p>
        <div v-if="hasBookingMeta" class="meta-box">
          <div v-if="bookingReference" class="meta-row"><span>Reference:</span> <strong>{{ bookingReference }}</strong></div>
          <div v-if="bookingId" class="meta-row"><span>Booking ID:</span> <strong>{{ bookingId }}</strong></div>
          <div v-if="email" class="meta-row"><span>Email:</span> <strong>{{ email }}</strong></div>
        </div>
        <div class="action-btns">
          <button @click="checkPaymentStatus" class="btn-primary">
            <i class="fas fa-sync-alt"></i> Check Again
          </button>
          <router-link to="/customer?activeSection=bookings" class="btn-outline">
            <i class="fas fa-list"></i> My Bookings
          </router-link>
          <router-link to="/" class="btn-ghost">Back to Home</router-link>
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
const bookingId = ref('')
const paymentLinkId = ref('')
const email = ref('')
const bookingReference = ref('')
const hasBookingMeta = ref(false)

const checkPaymentStatus = async () => {
  try {
    // Get payment tracking info from localStorage (sessionStorage is per-tab and
    // won't be available when PayMongo redirects back into a newly opened tab)
    const paymentTrackingData = localStorage.getItem('paymentTracking') || sessionStorage.getItem('paymentTracking')
    let resolvedBookingId, resolvedPaymentLinkId, resolvedEmail
    
    // If no tracking data yet, wait up to 15s for CustomerBookingConfirmation
    // to finish its async operations and write it (happens when router.push
    // fires before the await chain completes).
    if (!paymentTrackingData) {
      let waited = 0
      while (!localStorage.getItem('paymentTracking') && waited < 15000) {
        await new Promise(resolve => setTimeout(resolve, 500))
        waited += 500
      }
      paymentTrackingData = localStorage.getItem('paymentTracking') || sessionStorage.getItem('paymentTracking')
    }

    if (paymentTrackingData) {
      const tracking = JSON.parse(paymentTrackingData)
      resolvedBookingId = tracking.bookingId
      resolvedPaymentLinkId = tracking.paymentLinkId
      resolvedEmail = tracking.email
      bookingReference.value = tracking.bookingReference || ''
      console.log('✅ Retrieved payment tracking from localStorage:', tracking)
    }
    
    // Fallback: Try to get from URL params (in case sessionStorage was cleared)
    if (!resolvedBookingId || !resolvedPaymentLinkId) {
      const searchParams = new URLSearchParams(window.location.search)
      resolvedBookingId = searchParams.get('bookingId')
      resolvedPaymentLinkId = searchParams.get('paymentLinkId') 
        || searchParams.get('payment_link_id')
        || searchParams.get('link_id')
        || searchParams.get('id')
      resolvedEmail = resolvedEmail || searchParams.get('email') || ''
      console.log('🔍 Fallback - URL Parameters:', { bookingId: resolvedBookingId, paymentLinkId: resolvedPaymentLinkId })
    }

    bookingId.value = resolvedBookingId || ''
    paymentLinkId.value = resolvedPaymentLinkId || ''
    email.value = resolvedEmail || ''
    hasBookingMeta.value = Boolean(bookingId.value || bookingReference.value || email.value)

    console.log('📦 Final values:', { bookingId: bookingId.value, paymentLinkId: paymentLinkId.value })

    // If we have bookingId but no paymentLinkId, try to check booking status directly
    if (bookingId.value && !paymentLinkId.value) {
      message.value = 'Checking booking payment status...'
      
      const bookingResponse = await fetch(`http://localhost:8000/api/bookings/${bookingId.value}`)
      const bookingData = await bookingResponse.json()
      
      console.log('📦 Booking data:', bookingData)
      
      if (bookingData.success && bookingData.data.payment_status === 'Paid') {
        // Payment already confirmed!
        const confirmedEmail = bookingData.data.email || ''
        const bookingRef = bookingData.data.booking_reference || ''
        email.value = confirmedEmail
        bookingReference.value = bookingRef
        success.value = true
        loading.value = false
        message.value = 'Payment verified!'
        
        // Clear tracking data from both storages
        localStorage.removeItem('paymentTracking');
        sessionStorage.removeItem('paymentTracking')
        
        setTimeout(() => {
          router.push(`/confirmation?bookingId=${bookingId.value}&email=${encodeURIComponent(confirmedEmail)}&bookingRef=${encodeURIComponent(bookingRef)}`)
        }, 1500)
        return
      }
    }

    if (!bookingId.value) {
      throw new Error('Booking ID not found. Please check your email or contact support.')
    }
    
    if (!paymentLinkId.value) {
      throw new Error('Payment link ID not found. Checking booking status instead...')
    }

    // Check payment status via PayMongo API
    let attempts = 0
    const maxAttempts = 60  // Increased from 30 to 60 (2 minutes total)

    while (attempts < maxAttempts) {
      try {
        // First, check booking database directly (this is updated by webhook)
        if (bookingId.value) {
          const bookingResponse = await fetch(`http://localhost:8000/api/bookings/${bookingId.value}`)
          const bookingData = await bookingResponse.json()
          
          console.log(`[Attempt ${attempts + 1}] 📦 Booking status:`, bookingData.data?.payment_status)
          if (bookingData?.data?.booking_reference) bookingReference.value = bookingData.data.booking_reference
          if (bookingData?.data?.email && !email.value) email.value = bookingData.data.email
          hasBookingMeta.value = Boolean(bookingId.value || bookingReference.value || email.value)
          
          // Check if webhook already updated the database
          if (bookingData.success && bookingData.data.payment_status === 'Paid') {
            console.log('✅ Payment confirmed via database!')
            const email = bookingData.data?.email || ''
            const bookingRef = bookingData.data?.booking_reference || ''
            
            success.value = true
            loading.value = false
            message.value = 'Payment verified!'
            
            // Clear payment tracking
            localStorage.removeItem('paymentTracking')
            sessionStorage.removeItem('paymentTracking')
            
            setTimeout(() => {
              router.push(`/confirmation?bookingId=${bookingId.value}&email=${encodeURIComponent(email)}&bookingRef=${encodeURIComponent(bookingRef)}`)
            }, 1500)
            return
          }
        }
        
        // Second, check PayMongo API directly (in case webhook is delayed)
        const response = await fetch(`http://localhost:8000/api/paymongo/payment-status/${paymentLinkId.value}`)
        const data = await response.json()

        console.log(`[Attempt ${attempts + 1}] 💳 PayMongo status:`, data)

        if (data.success && data.isPaid) {
          console.log('✅ Payment confirmed via PayMongo API!')
          // Payment successful!
          // Fetch booking data to get email
          const bookingResponse = await fetch(`http://localhost:8000/api/bookings/${bookingId.value}`)
          const bookingResult = await bookingResponse.json()
          const email = bookingResult.data?.email || ''
          const bookingRef = bookingResult.data?.booking_reference || ''
          bookingReference.value = bookingRef
          
          success.value = true
          loading.value = false
          message.value = 'Payment verified!'

          // Clear payment tracking
          localStorage.removeItem('paymentTracking')
          sessionStorage.removeItem('paymentTracking')

          // Redirect to confirmation page after 1.5 seconds
          setTimeout(() => {
            router.push(`/confirmation?bookingId=${bookingId.value}&email=${encodeURIComponent(email)}&bookingRef=${encodeURIComponent(bookingRef)}`)
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
.payment-return-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f6ff 0%, #e8eeff 100%);
  padding: 1.5rem;
}

.payment-card {
  background: #fff;
  border-radius: 20px;
  padding: 3rem 2.5rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 40px rgba(31, 141, 191, 0.12);
  text-align: center;
}

.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}

/* Spinner */
.spinner-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #e8f4fb;
  border-top-color: #1F8DBF;
  animation: spin 0.9s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 0.5rem;
}
.spinner-inner {
  width: 54px;
  height: 54px;
  background: #f0f8fd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spinner-inner i { font-size: 1.4rem; color: #1F8DBF; }

/* Success ring */
.success-ring {
  width: 80px;
  height: 80px;
  background: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.success-ring i { font-size: 2rem; color: #16a34a; }

/* Warning ring */
.warn-ring {
  width: 80px;
  height: 80px;
  background: #fef9c3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.warn-ring i { font-size: 2rem; color: #ca8a04; }

/* Text */
.state-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.state-title.success { color: #16a34a; }
.state-title.warn    { color: #b45309; }

.state-sub {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  max-width: 300px;
  line-height: 1.5;
}

.state-msg {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
}

.state-hint {
  font-size: 0.8rem;
  color: #94a3b8;
  max-width: 320px;
  line-height: 1.5;
  margin: 0;
}

.meta-box {
  width: 100%;
  max-width: 340px;
  margin-top: 0.25rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid #dbeafe;
  background: #f8fbff;
  border-radius: 10px;
  text-align: left;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.5;
}

.meta-row strong {
  color: #0f172a;
  font-weight: 600;
  max-width: 60%;
  text-align: right;
  word-break: break-word;
}

/* Action Buttons */
.action-btns {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
  margin-top: 0.5rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.8rem 1rem;
  background: #1F8DBF;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover { background: #1677a3; }

.btn-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #1F8DBF;
  color: #1F8DBF;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-outline:hover { background: #f0f8fd; }

.btn-ghost {
  display: block;
  width: 100%;
  padding: 0.6rem 1rem;
  border: 1.5px solid #e2e8f0;
  color: #64748b;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-ghost:hover { background: #f8fafc; }

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
