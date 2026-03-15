<template>
  <div class="booking-page">
    <main class="booking-grid">

      <!-- ══════════════════════════════════════════ -->
      <!-- LEFT COLUMN — Forms                        -->
      <!-- ══════════════════════════════════════════ -->
      <div class="forms-col">

        <!-- Guest Information -->
        <div class="section-card reveal">
          <div class="card-header-bar">
            <span class="card-header-icon"><i class="fas fa-user-circle"></i></span>
            <h2 class="card-title">Guest Information</h2>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">First Name <span class="req">*</span></label>
              <div class="input-wrap">
                <i class="fas fa-user input-icon"></i>
                <input type="text" class="form-input" v-model="guest.firstName" placeholder="Juan" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Last Name <span class="req">*</span></label>
              <div class="input-wrap">
                <i class="fas fa-user input-icon"></i>
                <input type="text" class="form-input" v-model="guest.lastName" placeholder="Dela Cruz" />
              </div>
            </div>
          </div>

          <div v-if="!isSwimmingOnly" class="guest-counters">
            <div class="counter-group">
              <label class="form-label">Adults</label>
              <div class="counter-control">
                <button class="counter-btn" @click="decrement('adults')"><i class="fas fa-minus"></i></button>
                <span class="counter-val">{{ guest.adults }}</span>
                <button class="counter-btn" @click="increment('adults')"><i class="fas fa-plus"></i></button>
              </div>
            </div>
            <div class="counter-group">
              <label class="form-label">Children</label>
              <div class="counter-control">
                <button class="counter-btn" @click="decrement('children')"><i class="fas fa-minus"></i></button>
                <span class="counter-val">{{ guest.children }}</span>
                <button class="counter-btn" @click="increment('children')"><i class="fas fa-plus"></i></button>
              </div>
            </div>
            <div class="counter-group">
              <label class="form-label">Arrival</label>
              <div class="input-wrap">
                <i class="fas fa-clock input-icon"></i>
                <select class="form-input form-select" v-model="guest.arrivalTime">
                  <option>2 PM</option>
                  <option>3 PM</option>
                  <option>4 PM</option>
                  <option>5 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group mt-field">
            <label class="form-label">Special Requests <span class="opt">(optional)</span></label>
            <div class="input-wrap">
              <i class="fas fa-pencil-alt input-icon ta-icon"></i>
              <textarea class="form-input form-textarea" v-model="guest.specialRequests" placeholder="Late check-in, dietary needs, accessibility…"></textarea>
            </div>
          </div>
        </div>

        <!-- Contact & Billing -->
        <div class="section-card reveal">
          <div class="card-header-bar">
            <span class="card-header-icon"><i class="fas fa-address-book"></i></span>
            <h2 class="card-title">Contact &amp; Billing</h2>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Phone Number <span class="req">*</span></label>
              <div class="phone-input-wrap">
                <span class="phone-prefix">+63</span>
                <input type="tel" class="form-input phone-field" v-model="guest.phone" placeholder="912 345 6789" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Postal Code <span class="req">*</span></label>
              <div class="input-wrap">
                <i class="fas fa-map-pin input-icon"></i>
                <input type="text" class="form-input" v-model="guest.postal" placeholder="5200" />
              </div>
            </div>
          </div>

          <div class="form-grid-2 mt-field">
            <div class="form-group">
              <label class="form-label">Email <span class="req">*</span></label>
              <div class="input-wrap">
                <i class="fas fa-envelope input-icon"></i>
                <input type="email" class="form-input" v-model="guest.email" placeholder="juan@example.com" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Street Address <span class="req">*</span></label>
              <div class="input-wrap">
                <i class="fas fa-map-marker-alt input-icon"></i>
                <input type="text" class="form-input" v-model="guest.address" placeholder="123 Resort St." />
              </div>
            </div>
          </div>

          <div class="form-grid-2 mt-field">
            <div class="form-group">
              <label class="form-label">City <span class="req">*</span></label>
              <div class="input-wrap">
                <i class="fas fa-city input-icon"></i>
                <input type="text" class="form-input" v-model="guest.city" placeholder="Calapan" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Country <span class="req">*</span></label>
              <div class="input-wrap">
                <i class="fas fa-globe-asia input-icon"></i>
                <select class="form-input form-select" v-model="guest.country">
                  <option>Philippines</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ══════════════════════════════════════════ -->
      <!-- RIGHT COLUMN — Summary + Payment           -->
      <!-- ══════════════════════════════════════════ -->
      <div class="summary-col">

        <!-- Booking Summary -->
        <div class="section-card reveal">
          <div class="card-header-bar">
            <span class="card-header-icon"><i class="fas fa-receipt"></i></span>
            <h2 class="card-title">Booking Summary</h2>
            <button class="edit-link" @click="editBooking">
              <i class="fas fa-pen"></i> Edit
            </button>
          </div>

          <!-- Dates strip -->
          <div v-if="!isSwimmingOnly && checkIn && checkOut" class="dates-strip">
            <div class="date-block">
              <p class="date-block-label">Check-in</p>
              <p class="date-block-value">
                <i class="fas fa-calendar-check date-icon"></i>
                {{ formatDate(checkIn) }}
              </p>
            </div>
            <div class="dates-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="date-block text-right">
              <p class="date-block-label">Check-out</p>
              <p class="date-block-value">
                <i class="fas fa-calendar-times date-icon"></i>
                {{ formatDate(checkOut) }}
              </p>
            </div>
            <div v-if="nights" class="nights-badge">
              <i class="fas fa-moon"></i> {{ nights }} Night{{ nights > 1 ? 's' : '' }}
            </div>
          </div>

          <!-- Items -->
          <div class="items-list">
            <div v-for="(item, index) in items" :key="index" class="booking-item">

              <!-- Swimming item -->
              <div v-if="item.swimmingDetails">
                <div class="item-row">
                  <div class="item-avatar swimming-avatar"><i class="fas fa-swimmer"></i></div>
                  <div class="item-info">
                    <p class="item-name">{{ item.item.name }}</p>
                    <p class="item-meta">
                      {{ item.swimmingDetails.participants }} participant{{ item.swimmingDetails.participants > 1 ? 's' : '' }} ·
                      {{ item.swimmingDetails.totalSessions }} sessions
                    </p>
                  </div>
                  <p class="item-price">₱{{ item.lineTotal.toLocaleString() }}</p>
                </div>
                <div class="swimming-details">
                  <div class="swimming-detail-row">
                    <i class="fas fa-clock sd-icon"></i>
                    <span><strong>Time:</strong> {{ item.swimmingDetails.time }}</span>
                  </div>
                  <div class="swimming-detail-row">
                    <i class="fas fa-calendar-alt sd-icon"></i>
                    <div>
                      <strong>Dates:</strong>
                      <div class="date-chips">
                        <span
                          v-for="(date, di) in item.swimmingDetails.dates.slice(0, 3)"
                          :key="di"
                          class="date-chip"
                        >{{ formatCompactSwimmingDate(date) }}</span>
                        <span v-if="item.swimmingDetails.dates.length > 3" class="date-chip more-chip">
                          +{{ item.swimmingDetails.dates.length - 3 }} more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Regular item -->
              <div v-else class="item-row">
                <div class="item-avatar">{{ item.item.name.charAt(0) }}</div>
                <div class="item-info">
                  <p class="item-name">{{ item.item.name }}</p>
                  <p class="item-meta">
                    ×{{ item.qty }} · {{ item.guests }} Guest{{ item.guests > 1 ? 's' : '' }}
                    <span v-if="item.item.perNight"> · {{ item.nights }} night{{ item.nights > 1 ? 's' : '' }}</span>
                  </p>
                </div>
                <div class="item-price-col">
                  <p class="item-price">₱{{ item.lineTotal.toLocaleString() }}</p>
                  <p v-if="item.item.perNight" class="item-per-night">₱{{ item.item.price.toLocaleString() }}/night</p>
                </div>
              </div>

            </div>
          </div>

          <!-- Totals -->
          <div class="totals-block">
            <div class="total-row">
              <span class="total-label">Subtotal</span>
              <span class="total-val">₱{{ subtotal.toLocaleString() }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Taxes &amp; Fees</span>
              <span class="total-val muted">Included</span>
            </div>
            <div class="total-divider"></div>
            <div class="total-row grand-total">
              <span>Total</span>
              <span class="grand-val">₱{{ subtotal.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="section-card reveal">
          <div class="card-header-bar">
            <span class="card-header-icon"><i class="fas fa-credit-card"></i></span>
            <h2 class="card-title">Payment Method</h2>
          </div>

          <div class="payment-methods">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-option"
              :class="{ selected: selectedPayment === method.id }"
              @click="selectPayment(method.id)"
            >
              <div class="payment-method-left">
                <div class="payment-icon-wrap" :class="method.bgClass">
                  <i :class="[method.iconClass, method.iconColor]"></i>
                </div>
                <div class="payment-info">
                  <p class="payment-name">{{ method.name }}</p>
                  <p class="payment-desc">{{ method.description }}</p>
                </div>
              </div>
              <div class="payment-check" :class="{ visible: selectedPayment === method.id }">
                <i class="fas fa-check"></i>
              </div>
            </div>
          </div>

          <!-- Terms -->
          <label class="terms-row">
            <input type="checkbox" class="terms-checkbox" v-model="termsAgreed" />
            <span class="terms-text">
              I agree to the
              <a href="#" class="terms-link">Terms &amp; Conditions</a>
            </span>
          </label>

          <!-- Pay button -->
          <button
            class="pay-btn"
            :class="{ 'pay-btn--loading': loading }"
            @click="initiatePayment"
          >
            <span class="pay-btn-text">
              <i class="fas fa-lock"></i> Pay Now &amp; Confirm
            </span>
            <span class="pay-btn-spinner"></span>
          </button>

          <p class="cancellation-note">
            <i class="fas fa-undo-alt"></i> Free cancellation until 24 hrs before
          </p>
        </div>

      </div>
    </main>

    <!-- ══════════════════════════════════════════ -->
    <!-- CONFIRMATION MODAL                         -->
    <!-- ══════════════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-box">
          <div class="modal-success-icon">
            <i class="fas fa-check"></i>
          </div>
          <h3 class="modal-title">Booking Confirmed!</h3>
          <p class="modal-body">
            Your booking is secured. A confirmation email has been sent to
            <strong>{{ guest.email }}</strong>.
          </p>
          <div class="modal-actions">
            <button @click="viewBookingDetails" class="modal-primary-btn">
              <i class="fas fa-calendar-check"></i> View Booking Details
            </button>
            <button @click="showModal = false" class="modal-ghost-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Email Verification Modal -->
    <EmailVerificationModal
      :show="showVerificationModal"
      :initialEmail="guest.email"
      @verified="onEmailVerified"
      @proceed-payment="proceedWithPayment"
      @close="showVerificationModal = false"
    />

  </div>
</template>

<script>
import EmailVerificationModal from '../EmailVerificationModal.vue'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'CustomerBookingConfirmation',
  components: { EmailVerificationModal },
  setup() {
    const auth = useAuthStore()
    return { auth }
  },
  data() {
    const bookingData = JSON.parse(localStorage.getItem('pendingBooking') || '{}')
    const items = bookingData.items?.map(b => {
      const nights = b.item.perNight && bookingData.checkIn && bookingData.checkOut
        ? Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / 86400000)
        : 1
      const lineTotal = b.swimmingDetails
        ? b.item.price
        : b.item.price * b.qty * (b.item.perNight ? nights : 1)
      return { ...b, nights, lineTotal }
    }) || []
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)

    return {
      guest: {
        firstName: '', lastName: '',
        adults: bookingData.adults || 2,
        children: bookingData.children || 0,
        arrivalTime: '3 PM',
        specialRequests: '',
        phone: '', email: '', address: '', city: '',
        country: 'Philippines', postal: ''
      },
      items,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      nights: bookingData.nights,
      subtotal,
      paymentMethods: [
        { id: 'paymaya', name: 'PayMaya',       description: 'E-wallet',       iconClass: 'fas fa-mobile-alt', iconColor: 'text-green',  bgClass: 'bg-green'  },
        { id: 'gcash',   name: 'GCash',         description: 'E-wallet',       iconClass: 'fas fa-wallet',     iconColor: 'text-green',  bgClass: 'bg-green'  },
        { id: 'bank',    name: 'Bank Transfer', description: 'BDO, BPI, etc.', iconClass: 'fas fa-university', iconColor: 'text-primary', bgClass: 'bg-primary' }
      ],
      selectedPayment: bookingData.selectedPayment || 'gcash',
      termsAgreed: false,
      loading: false,
      showModal: false,
      showVerificationModal: false,
      emailVerified: false,
      verifiedEmail: ''
    }
  },
  computed: {
    hasSwimmingItems() { return this.items.some(i => i.swimmingDetails) },
    isSwimmingOnly()   { return this.items.length > 0 && this.items.every(i => i.swimmingDetails) }
  },
  methods: {
    increment(type) { this.guest[type]++ },
    decrement(type) {
      if (type === 'adults'   && this.guest.adults   > 1) this.guest.adults--
      if (type === 'children' && this.guest.children > 0) this.guest.children--
    },
    selectPayment(id) { this.selectedPayment = id },

    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    formatCompactSwimmingDate(d) {
      if (!d) return ''
      return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    },

    editBooking() {
      const bookingData = {
        items: this.items.map(item => ({
          item: {
            item_id: item.item.item_id || item.item.id,
            id: item.item.id, name: item.item.name,
            category: item.item.category, category_type: item.item.category_type,
            price: item.item.price, perNight: item.item.perNight,
            image: item.item.image,
            imgs: item.item.imgs || (item.item.image ? [item.item.image] : []),
            description: item.item.description
          },
          qty: item.qty, guests: item.guests, nights: item.nights, lineTotal: item.lineTotal,
          ...(item.swimmingDetails && { swimmingDetails: item.swimmingDetails })
        })),
        checkIn: this.checkIn, checkOut: this.checkOut, nights: this.nights,
        adults: this.guest.adults, children: this.guest.children,
        selectedPayment: this.selectedPayment
      }
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      this.$emit('close')
    },

    viewBookingDetails() { this.showModal = false; this.$emit('view-reservations') },

    async initiatePayment() {
      const required = ['firstName','lastName','phone','email','address','city','postal']
      for (const key of required) {
        if (!this.guest[key].trim()) { alert('Please fill all required fields!'); return }
      }
      if (!this.termsAgreed) { alert('Please agree to the Terms & Conditions'); return }
      if (!this.isSwimmingOnly && (!this.checkIn || !this.checkOut)) {
        alert('Please select check-in and check-out dates for your booking'); return
      }
      try {
        const res  = await fetch(`http://localhost:8000/api/customers/check-email/${encodeURIComponent(this.guest.email)}`)
        const data = await res.json()
        if (data.success && data.exists) {
          this.emailVerified = true; this.verifiedEmail = this.guest.email; await this.payNow()
        } else { this.showVerificationModal = true }
      } catch { this.showVerificationModal = true }
    },

    onEmailVerified(email) { this.emailVerified = true; this.verifiedEmail = email; this.guest.email = email },

    async proceedWithPayment(email) { this.showVerificationModal = false; await this.payNow() },

    async payNow() {
      this.loading = true
      const paymentTab = window.open('', '_blank')
      this.$router.push({ name: 'PaymentReturn' })
      const bookingData = JSON.parse(localStorage.getItem('pendingBooking') || '{}')
      try {
        const bookingRes = await fetch('http://localhost:8000/api/bookings/confirm', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.auth.user?.id || null,
            guest: { ...this.guest, phone: '+63' + this.guest.phone },
            checkIn: this.isSwimmingOnly ? null : bookingData.checkIn,
            checkOut: this.isSwimmingOnly ? null : bookingData.checkOut,
            isSwimmingOnly: this.isSwimmingOnly,
            items: this.items.map(item => ({
              item_id: item.item.item_id || item.item.id, name: item.item.name,
              category: item.item.category || 'Room', qty: item.qty, guests: item.guests,
              price: item.item.price, perNight: item.item.perNight,
              ...(item.swimmingDetails && { swimmingDetails: item.swimmingDetails })
            })),
            paymentMethod: this.selectedPayment, total: this.subtotal
          })
        })
        const bookingResult = await bookingRes.json()
        if (!bookingRes.ok || !bookingResult.success) throw new Error(bookingResult.error || 'Failed to create booking')
        const { bookingId, bookingReference, paymentReference } = bookingResult.data
        const payRes = await fetch('http://localhost:8000/api/paymongo/create-payment-link', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: this.subtotal,
            description: `Eduardo's Resort Booking - ${bookingReference}`,
            bookingId, email: this.guest.email, paymentMethod: this.selectedPayment
          })
        })
        const payData = await payRes.json()
        if (!payRes.ok || !payData.success) throw new Error(payData.error || 'Failed to create payment link')
        await fetch('http://localhost:8000/api/bookings/update-payment', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId, paymentReference, status: 'pending',
            paymentIntentId: payData.payment_intent_id, checkoutUrl: payData.checkout_url
          })
        })
        localStorage.removeItem('pendingBooking')
        localStorage.setItem('paymentTracking', JSON.stringify({
          bookingId, bookingReference, paymentLinkId: payData.payment_id,
          email: this.guest.email, timestamp: new Date().toISOString()
        }))
        if (paymentTab) paymentTab.location.href = payData.checkout_url
        else window.location.href = payData.checkout_url
      } catch (err) {
        if (paymentTab && !paymentTab.closed) paymentTab.close()
        alert(err.message || 'Failed to process booking. Please try again.')
        this.loading = false
      }
    },

    async loadCustomerProfile() {
      if (!this.auth.user?.email) return
      try {
        const res = await fetch(`http://localhost:8000/api/customers/profile/${encodeURIComponent(this.auth.user.email)}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.success && data.customer) {
          const p = data.customer
          this.guest.firstName = p.firstName || ''
          this.guest.lastName  = p.lastName  || ''
          this.guest.email     = p.email     || this.auth.user.email
          this.guest.phone     = p.phone     || ''
          this.guest.address   = p.address   || ''
          this.guest.city      = p.city      || ''
          this.guest.country   = p.country   || 'Philippines'
          this.guest.postal    = p.postalCode || ''
        }
      } catch (e) { console.error('Error loading customer profile:', e) }
    }
  },
  mounted() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target) }
      })
    }, { threshold: 0.05 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    this.loadCustomerProfile()
  }
}
</script>

<style scoped>
/* ── Design Tokens ──────────────────────────────────────────── */
:root {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #f9fafb;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.booking-page {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #EEF5FB;
  min-height: 100vh;
  color: #1f2937;
  padding: 1.5rem;
}

/* ── Layout Grid ────────────────────────────────────────────── */
.booking-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

.forms-col,
.summary-col {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

/* ── Section Card ───────────────────────────────────────────── */
.section-card {
  background: #fff;
  border-radius: 14px;
  padding: 1.4rem;
  border: 1px solid #dbeafe;
  box-shadow: 0 2px 10px rgba(3,105,161,0.07);
  transition: box-shadow 0.2s, transform 0.2s;
}

.section-card:hover {
  box-shadow: 0 6px 20px rgba(3,105,161,0.12);
  transform: translateY(-2px);
}

/* Reveal animation */
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s;
}
.reveal.visible { opacity: 1; transform: translateY(0); }

/* ── Card Header Bar ────────────────────────────────────────── */
.card-header-bar {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #F4C400;
}

.card-header-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: #eff6ff;
  color: #0369a1;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.88rem;
  flex-shrink: 0;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0C3B5E;
  flex: 1;
}

.edit-link {
  display: inline-flex; align-items: center; gap: 0.3rem;
  font-size: 0.75rem; font-weight: 700;
  color: #0369a1;
  background: #eff6ff;
  border: none; border-radius: 20px;
  padding: 0.25rem 0.7rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.edit-link:hover { background: #0369a1; color: #fff; }

/* ── Form Fields ────────────────────────────────────────────── */
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.mt-field   { margin-top: 0.85rem; }

.form-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #0C3B5E;
}

.req { color: #ef4444; margin-left: 2px; }
.opt { font-weight: 400; color: #9ca3af; text-transform: none; letter-spacing: 0; font-size: 0.68rem; }

.input-wrap { position: relative; }

.input-icon {
  position: absolute;
  left: 0.75rem; top: 50%; transform: translateY(-50%);
  color: #0369a1; font-size: 0.72rem;
  pointer-events: none;
}

.ta-icon { top: 0.8rem; transform: none; }

.form-input {
  width: 100%;
  padding: 0.6rem 0.8rem 0.6rem 2.2rem;
  border: 1.5px solid #dbeafe;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.85rem;
  color: #1f2937;
  background: #f0f7ff;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  outline: none;
}

.form-input:focus {
  border-color: #0369a1;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(3,105,161,0.1);
}

.form-select { appearance: none; cursor: pointer; }
.form-textarea { resize: vertical; min-height: 80px; }

/* Phone prefix */
.phone-input-wrap { display: flex; }

.phone-prefix {
  display: flex; align-items: center; justify-content: center;
  padding: 0 0.75rem;
  background: #eff6ff;
  border: 1.5px solid #dbeafe;
  border-right: none;
  border-radius: 8px 0 0 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #0369a1;
  white-space: nowrap;
  flex-shrink: 0;
}

.phone-field {
  border-radius: 0 8px 8px 0;
  padding-left: 0.75rem;
}

/* Guest counters */
.guest-counters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
  margin-top: 0.85rem;
}

.counter-group { display: flex; flex-direction: column; gap: 0.35rem; }

.counter-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: #f0f7ff;
  border: 1.5px solid #dbeafe;
  border-radius: 8px;
  padding: 0.55rem;
}

.counter-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1.5px solid #0369a1;
  background: #fff;
  color: #0369a1;
  font-size: 0.6rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, transform 0.15s;
  flex-shrink: 0;
}

.counter-btn:hover { background: #0369a1; color: #fff; transform: scale(1.1); }

.counter-val { font-size: 0.9rem; font-weight: 800; color: #0C3B5E; min-width: 20px; text-align: center; }

/* ── Dates Strip ────────────────────────────────────────────── */
.dates-strip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  margin-bottom: 0.9rem;
  flex-wrap: wrap;
  position: relative;
}

.date-block { flex: 1; min-width: 80px; }
.date-block.text-right { text-align: right; }

.date-block-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.date-block-value {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0C3B5E;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.date-block.text-right .date-block-value { justify-content: flex-end; }

.date-icon { color: #0369a1; font-size: 0.72rem; }

.dates-arrow { color: #9ca3af; font-size: 0.8rem; flex-shrink: 0; }

.nights-badge {
  width: 100%;
  text-align: center;
  padding-top: 0.6rem;
  border-top: 1px solid #dbeafe;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0369a1;
}

/* ── Booking Items ──────────────────────────────────────────── */
.items-list { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 0.9rem; }

.booking-item {
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 9px;
  padding: 0.75rem 0.9rem;
  transition: border-color 0.2s, background 0.2s;
}

.booking-item:hover { border-color: #bfdbfe; background: #eff6ff; }

.item-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-avatar {
  width: 34px; height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, #0369a1, #1F8DBF);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.88rem;
  flex-shrink: 0;
}

.swimming-avatar { background: linear-gradient(135deg, #0C3B5E, #0369a1); font-size: 0.75rem; }

.item-info { flex: 1; min-width: 0; }

.item-name { font-size: 0.85rem; font-weight: 700; color: #0C3B5E; }
.item-meta { font-size: 0.72rem; color: #6b7280; margin-top: 2px; }

.item-price-col { text-align: right; }
.item-price     { font-size: 0.9rem; font-weight: 800; color: #0369a1; }
.item-per-night { font-size: 0.68rem; color: #6b7280; }

/* Swimming details sub-section */
.swimming-details {
  margin-top: 0.6rem;
  padding: 0.6rem 0.75rem;
  background: #fff;
  border-radius: 7px;
  border: 1px solid #dbeafe;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.swimming-detail-row {
  display: flex; align-items: flex-start; gap: 0.5rem;
  font-size: 0.75rem; color: #1f2937;
}

.sd-icon { color: #0369a1; font-size: 0.72rem; margin-top: 1px; flex-shrink: 0; }

.date-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.35rem; }

.date-chip {
  background: #eff6ff; color: #0369a1;
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
  font-size: 0.68rem; font-weight: 700;
}

.more-chip { background: #f3f4f6; color: #6b7280; }

/* ── Totals Block ───────────────────────────────────────────── */
.totals-block {
  border-top: 1.5px solid #e5e7eb;
  padding-top: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.83rem;
  color: #6b7280;
}

.total-label { color: #6b7280; }
.total-val   { font-weight: 600; color: #1f2937; }
.total-val.muted { color: #9ca3af; }

.total-divider { height: 1px; background: #e5e7eb; margin: 0.2rem 0; }

.grand-total {
  font-size: 1rem;
  font-weight: 800;
  color: #0C3B5E;
  margin-top: 0.1rem;
}

.grand-val { font-size: 1.25rem; font-weight: 800; color: #0369a1; }

/* ── Payment Methods ────────────────────────────────────────── */
.payment-methods { display: flex; flex-direction: column; gap: 0.6rem; }

.payment-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  background: #f9fafb;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.18s;
}

.payment-option:hover {
  border-color: #bfdbfe;
  background: #eff6ff;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(3,105,161,0.08);
}

.payment-option.selected {
  border-color: #0369a1;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(3,105,161,0.1);
}

.payment-method-left { display: flex; align-items: center; gap: 0.75rem; }

.payment-icon-wrap {
  width: 38px; height: 38px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

/* colour helpers */
.bg-green   { background: #d1fae5; }
.bg-primary { background: #eff6ff; }
.text-green   { color: #059669 !important; }
.text-primary { color: #0369a1 !important; }

.payment-info { min-width: 0; }
.payment-name { font-size: 0.85rem; font-weight: 700; color: #0C3B5E; }
.payment-desc { font-size: 0.72rem; color: #6b7280; }

.payment-check {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem;
  transition: background 0.2s, color 0.2s, transform 0.25s;
  flex-shrink: 0;
}

.payment-check.visible {
  background: #0369a1;
  color: #fff;
  transform: scale(1.1);
  animation: checkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkPop {
  0%   { transform: scale(0); }
  70%  { transform: scale(1.2); }
  100% { transform: scale(1.1); }
}

/* ── Terms ──────────────────────────────────────────────────── */
.terms-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-top: 0.9rem;
  cursor: pointer;
}

.terms-checkbox {
  width: 16px; height: 16px;
  accent-color: #0369a1;
  margin-top: 2px;
  flex-shrink: 0;
  cursor: pointer;
}

.terms-text { font-size: 0.78rem; color: #6b7280; line-height: 1.4; }
.terms-link { color: #0369a1; font-weight: 700; text-decoration: none; }
.terms-link:hover { text-decoration: underline; }

/* ── Pay Button ─────────────────────────────────────────────── */
.pay-btn {
  position: relative;
  width: 100%;
  margin-top: 1rem;
  padding: 0.85rem;
  background: #F4C400;
  color: #0C3B5E;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.2s, transform 0.18s, box-shadow 0.2s;
  box-shadow: 0 4px 14px rgba(244,196,0,0.35);
  overflow: hidden;
}

.pay-btn:hover:not(.pay-btn--loading) {
  background: #F2C200;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(244,196,0,0.4);
}

.pay-btn--loading {
  pointer-events: none;
  opacity: 0.85;
}

.pay-btn--loading .pay-btn-text { opacity: 0; }

.pay-btn-spinner {
  display: none;
  width: 18px; height: 18px;
  border: 2.5px solid rgba(12,59,94,0.2);
  border-top-color: #0C3B5E;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  position: absolute;
}

.pay-btn--loading .pay-btn-spinner { display: block; }

@keyframes spin { to { transform: rotate(360deg); } }

.cancellation-note {
  text-align: center;
  margin-top: 0.65rem;
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

/* ── Confirmation Modal ─────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(12,59,94,0.55);
  backdrop-filter: blur(6px);
  z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-box {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 50px rgba(12,59,94,0.25);
  border-top: 4px solid #F4C400;
  animation: modalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-success-icon {
  width: 60px; height: 60px;
  border-radius: 50%;
  background: #d1fae5;
  color: #059669;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem;
  margin: 0 auto 1rem;
  animation: checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0C3B5E;
  margin-bottom: 0.6rem;
}

.modal-body {
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.55;
  margin-bottom: 1.25rem;
}

.modal-body strong { color: #0C3B5E; }

.modal-actions { display: flex; flex-direction: column; gap: 0.6rem; }

.modal-primary-btn {
  width: 100%; padding: 0.75rem;
  background: #0369a1; color: #fff;
  border: none; border-radius: 9px;
  font-family: inherit; font-size: 0.88rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.45rem;
  transition: background 0.2s, transform 0.15s;
}
.modal-primary-btn:hover { background: #0C3B5E; transform: translateY(-1px); }

.modal-ghost-btn {
  width: 100%; padding: 0.72rem;
  background: #fff; color: #6b7280;
  border: 1.5px solid #e5e7eb; border-radius: 9px;
  font-family: inherit; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: border-color 0.2s, color 0.2s;
}
.modal-ghost-btn:hover { border-color: #0369a1; color: #0369a1; }

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 900px) {
  .booking-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .booking-page   { padding: 0.85rem; }
  .form-grid-2    { grid-template-columns: 1fr; }
  .guest-counters { grid-template-columns: 1fr 1fr; }
  .section-card   { padding: 1rem; }
}
</style>