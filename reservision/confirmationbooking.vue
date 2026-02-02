<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-white/95 backdrop-blur-md border-b border-blue-50 sticky top-0 z-50">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <a href="/" class="flex items-center space-x-2">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-blue to-accent-blue flex items-center justify-center text-white font-bold text-base">
              Ed
            </div>
            <div class="text-lg font-bold text-primary-blue">Eduardo's</div>
          </a>
          <div class="text-xs text-text-muted font-medium hidden sm:block">
            Complete Booking
          </div>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="container mx-auto px-4 py-5 max-w-7xl">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left: Forms -->
        <div class="space-y-5">
          <!-- Guest Info -->
          <div class="section-card reveal">
            <h2 class="text-lg font-bold text-text-dark mb-3 flex items-center gap-2">
              <i class="fas fa-user-circle text-primary-blue text-lg"></i>
              Guest Information
            </h2>
            <div class="mobile-grid grid-cols-1 sm:grid-cols-2">
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1.5">First Name *</label>
                <input type="text" class="form-input" placeholder="Juan" v-model="guest.firstName">
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1.5">Last Name *</label>
                <input type="text" class="form-input" placeholder="Dela Cruz" v-model="guest.lastName">
              </div>
            </div>
            <div class="mt-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1.5">Adults</label>
                <div class="flex items-center justify-center gap-2 bg-neutral-gray rounded-xl p-2">
                  <button @click="decrementAdults" class="counter-btn"><i class="fas fa-minus"></i></button>
                  <span class="font-semibold text-sm w-6">{{ guest.adults }}</span>
                  <button @click="incrementAdults" class="counter-btn"><i class="fas fa-plus"></i></button>
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1.5">Children</label>
                <div class="flex items-center justify-center gap-2 bg-neutral-gray rounded-xl p-2">
                  <button @click="decrementChildren" class="counter-btn"><i class="fas fa-minus"></i></button>
                  <span class="font-semibold text-sm w-6">{{ guest.children }}</span>
                  <button @click="incrementChildren" class="counter-btn"><i class="fas fa-plus"></i></button>
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1.5">Arrival</label>
                <select class="form-input text-sm" v-model="guest.arrivalTime">
                  <option>2 PM</option>
                  <option>3 PM</option>
                  <option>4 PM</option>
                  <option>5 PM</option>
                </select>
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-xs font-medium text-text-muted mb-1.5">Special Requests</label>
              <textarea class="form-input h-20 text-sm" placeholder="Late check-in, dietary needs..." v-model="guest.specialRequests"></textarea>
            </div>
          </div>

          <!-- Contact & Billing -->
          <div class="section-card reveal">
            <h2 class="text-lg font-bold text-text-dark mb-3 flex items-center gap-2">
              <i class="fas fa-address-book text-primary-blue text-lg"></i>
              Contact & Billing
            </h2>
            <div class="mobile-grid grid-cols-1">
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1.5">Phone Number *</label>
                <div class="flex gap-2">
                  <span class="flex items-center justify-center w-16 bg-gray-100 rounded-l-xl border border-r-0 border-gray-300 text-sm font-medium">+63</span>
                  <input type="tel" class="form-input rounded-l-none flex-1" placeholder="912 345 6789" v-model="guest.phone">
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1.5">Email *</label>
                <input type="email" class="form-input" placeholder="juan@example.com" v-model="guest.email">
              </div>
            </div>
            <div class="mt-4 mobile-grid grid-cols-1">
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1.5">Street Address *</label>
                <input type="text" class="form-input" placeholder="123 Resort St." v-model="guest.address">
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1.5">City *</label>
                <input type="text" class="form-input" placeholder="Calapan" v-model="guest.city">
              </div>
            </div>
            <div class="mt-4 mobile-grid grid-cols-1 sm:grid-cols-2">
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1.5">Country *</label>
                <select class="form-input text-sm" v-model="guest.country">
                  <option>Philippines</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-text-muted mb-1.5">Postal Code *</label>
                <input type="text" class="form-input" placeholder="5200" v-model="guest.postal">
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Summary + Payment -->
        <div class="space-y-5">
          <!-- Summary -->
          <div class="section-card reveal">
            <div class="flex justify-between items-center mb-3">
              <h2 class="text-lg font-bold text-text-dark">Booking Summary</h2>
              <a href="reservation.html" class="text-primary-blue text-xs font-medium flex items-center gap-1 hover:underline">
                <i class="fas fa-edit"></i> Edit
              </a>
            </div>
            <div class="space-y-2 text-sm">
              <div v-for="(item, index) in bookedItems" :key="index" class="flex justify-between items-start p-2 bg-blue-50 rounded-lg text-xs">
                <div class="flex-1">
                  <div class="font-medium">{{ item.name }}</div>
                  <div class="text-text-muted text-xs">
                    ×{{ item.qty }} • {{ item.guests }} Guest{{ item.guests > 1 ? 's' : '' }}
                    <span v-if="item.perNight"> • {{ item.nights }} night{{ item.nights > 1 ? 's' : '' }}</span>
                  </div>
                </div>
                <div class="text-right ml-2">
                  <div class="font-medium">₱{{ item.lineTotal.toLocaleString() }}</div>
                  <div v-if="item.perNight" class="text-text-muted text-xs">₱{{ item.price.toLocaleString() }}/night</div>
                </div>
              </div>
            </div>
            <div class="border-t pt-3 mt-4 space-y-1.5 text-sm">
              <div class="flex justify-between">
                <span class="text-text-muted">Subtotal</span>
                <span>₱{{ subtotal.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-text-muted">Taxes & Fees</span>
                <span>Included</span>
              </div>
              <div class="border-t pt-2 flex justify-between items-center">
                <span class="font-bold text-base">Total</span>
                <span class="text-xl font-bold text-primary-blue">₱{{ subtotal.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Payment -->
          <div class="section-card reveal">
            <h2 class="text-lg font-bold text-text-dark mb-3">Payment Method</h2>
            <div class="space-y-2.5">
              <div 
                v-for="method in paymentMethods" 
                :key="method.id"
                @click="selectPayment(method.id)"
                class="payment-option"
                :class="{ 'selected': selectedPayment === method.id }"
              >
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center mr-3" :class="method.bgClass">
                    <i :class="method.iconClass"></i>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-text-dark text-sm">{{ method.name }}</div>
                    <div class="text-xs text-text-muted">{{ method.description }}</div>
                  </div>
                </div>
                <i class="fas fa-check-circle text-primary-blue text-lg check-icon"></i>
              </div>
            </div>

            <div class="mt-4 flex items-start">
              <input type="checkbox" v-model="termsAgreed" class="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue mt-0.5 mr-2">
              <label class="text-xs text-text-muted leading-tight">
                I agree to the <a href="#" class="text-primary-blue hover:underline font-medium">Terms & Conditions</a>
              </label>
            </div>

            <button @click="payNow" :disabled="loading" class="btn-primary mt-4 text-sm" :class="{ 'btn-loading': loading }">
              <span class="btn-text"><i class="fas fa-lock"></i> Pay Now & Confirm</span>
            </button>

            <div class="text-center mt-3 text-xs text-text-muted">
              <i class="fas fa-undo-alt mr-1"></i> Free cancellation until 24 hrs before
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Confirmation Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <i class="fas fa-check text-3xl text-green-600"></i>
        </div>
        <h3 class="text-xl font-bold text-text-dark mb-2">Payment Confirmed!</h3>
        <p class="text-sm text-text-muted mb-5">
          Your booking is secured. A confirmation email has been sent to 
          <span class="font-medium text-text-dark">{{ guest.email }}</span>.
        </p>
        <div class="space-y-2">
          <a href="/confirmation" class="block w-full py-2.5 bg-primary-blue text-white rounded-lg font-medium text-sm hover:bg-accent-blue transition">
            View Booking Details
          </a>
          <a href="/" class="block w-full py-2.5 border border-primary-blue text-primary-blue rounded-lg font-medium text-sm hover:bg-blue-50 transition">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmationBooking',
  data() {
    return {
      guest: {
        firstName: '',
        lastName: '',
        adults: 2,
        children: 0,
        arrivalTime: '3 PM',
        specialRequests: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        country: 'Philippines',
        postal: ''
      },
      paymentMethods: [
        { id: 'paymaya', name: 'PayMaya', description: 'E-wallet', iconClass: 'fas fa-mobile-alt text-green-600 text-lg', bgClass: 'bg-green-50' },
        { id: 'gcash', name: 'GCash', description: 'E-wallet', iconClass: 'fas fa-wallet text-green-600 text-lg', bgClass: 'bg-green-50' },
        { id: 'bank', name: 'Bank Transfer', description: 'BDO, BPI, etc.', iconClass: 'fas fa-university text-blue-600 text-lg', bgClass: 'bg-blue-50' }
      ],
      selectedPayment: 'gcash',
      termsAgreed: false,
      loading: false,
      showModal: false,
      bookedItems: [],
      subtotal: 0,
      bookingData: {}
    }
  },
  mounted() {
    this.loadBookingData()
    this.revealAnimation()
  },
  methods: {
    incrementAdults() {
      this.guest.adults++
    },
    decrementAdults() {
      if (this.guest.adults > 1) {
        this.guest.adults--
      }
    },
    incrementChildren() {
      this.guest.children++
    },
    decrementChildren() {
      if (this.guest.children > 0) {
        this.guest.children--
      }
    },
    selectPayment(method) {
      this.selectedPayment = method
      const data = JSON.parse(localStorage.getItem('eduardosBooking') || '{}')
      localStorage.setItem('eduardosBooking', JSON.stringify({ ...data, selectedPayment: method }))
    },
    loadBookingData() {
      const data = JSON.parse(localStorage.getItem('eduardosBooking') || '{}')
      this.bookingData = data
      
      const { items = [], checkIn, checkOut, selectedPayment = 'gcash' } = data
      this.selectedPayment = selectedPayment
      
      let total = 0
      const processedItems = items.map(b => {
        const nights = b.item.perNight && checkIn && checkOut 
          ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000) 
          : 1
        const lineTotal = b.item.price * b.qty * (b.item.perNight ? nights : 1)
        total += lineTotal
        
        return {
          name: b.item.name,
          qty: b.qty,
          guests: b.guests,
          perNight: b.item.perNight,
          nights,
          price: b.item.price,
          lineTotal
        }
      })
      
      this.bookedItems = processedItems
      this.subtotal = total
    },
    async payNow() {
      // Validation
      if (!this.guest.firstName || !this.guest.lastName || !this.guest.phone || 
          !this.guest.email || !this.guest.address || !this.guest.city || !this.guest.postal) {
        alert('Please fill all required fields!')
        return
      }
      if (!this.termsAgreed) {
        alert('Please agree to the Terms & Conditions')
        return
      }

      this.loading = true

      const finalBooking = {
        ...this.bookingData,
        guest: {
          firstName: this.guest.firstName,
          lastName: this.guest.lastName,
          fullName: `${this.guest.firstName} ${this.guest.lastName}`,
          adults: this.guest.adults,
          children: this.guest.children,
          arrivalTime: this.guest.arrivalTime,
          specialRequests: this.guest.specialRequests || '',
          phone: '+63' + this.guest.phone,
          email: this.guest.email,
          address: `${this.guest.address}, ${this.guest.city} ${this.guest.postal}`
        },
        selectedPayment: this.selectedPayment,
        total: this.subtotal,
        bookingId: 'EDU' + Date.now().toString().slice(-8)
      }

      try {
        const res = await fetch('http://localhost:3000/api/bookings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalBooking)
        })

        const result = await res.json()

        if (res.ok) {
          localStorage.removeItem('eduardosBooking')
          this.showModal = true
          console.log('SUCCESS! Booking ID:', result.bookingId)
        } else {
          alert(result.error || 'Booking failed')
          this.loading = false
        }
      } catch (err) {
        console.error('Connection error:', err)
        alert('Cannot connect to server. Is backend running?')
        this.loading = false
      }
    },
    revealAnimation() {
      setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'))
      }, 100)
    }
  }
}
</script>

<style scoped>
body { 
  font-family: 'Inter', sans-serif; 
  background: linear-gradient(to bottom, #E0F7FA, #FFFFFF); 
  overflow-x: hidden; 
}

/* Card */
.section-card {
  background: white;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  border: 1px solid rgba(43, 108, 176, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
@media (min-width: 640px) {
  .section-card { padding: 1.5rem; }
}
@media (min-width: 768px) {
  .section-card { padding: 2rem; border-radius: 20px; }
}

/* Input */
.form-input {
  width: 100%;
  padding: 0.75rem 0.875rem;
  border: 2px solid #E8F0EB;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(248, 250, 249, 0.8);
}
.form-input:focus {
  outline: none;
  border-color: #2B6CB0;
  background: white;
}
@media (min-width: 640px) {
  .form-input { padding: 0.875rem 1rem; }
}
@media (min-width: 768px) {
  .form-input { padding: 1rem 1.25rem; border-radius: 12px; }
}

/* Button */
.btn-primary {
  background: linear-gradient(135deg, #2B6CB0, #63B3ED);
  color: white;
  padding: 0.875rem 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(43,108,176,.3);
  width: 100%;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  cursor: pointer;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(43,108,176,.4);
}
@media (min-width: 640px) {
  .btn-primary { padding: 1rem 1.5rem; }
}
@media (min-width: 768px) {
  .btn-primary { padding: 1rem 2rem; }
}

/* Loading State */
.btn-loading {
  pointer-events: none;
  opacity: 0.8;
}
.btn-loading .btn-text { opacity: 0; }
.btn-loading::after {
  content: '';
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid transparent;
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Payment Option */
.payment-option {
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.payment-option:hover {
  background: #f1f5f9;
}
.payment-option.selected {
  border-color: #2B6CB0;
  background: rgba(43,108,176,0.05);
}
.payment-option .check-icon { display: none; }
.payment-option.selected .check-icon { display: block; }

/* Counter */
.counter-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 2px solid #2B6CB0;
  color: #2B6CB0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  cursor: pointer;
  background: transparent;
}
.counter-btn:hover {
  background: #2B6CB0;
  color: white;
}

.reveal { 
  opacity: 0;
  transform: translateY(15px);
  transition: opacity .6s ease, transform .6s ease;
}
.reveal.visible { 
  opacity: 1;
  transform: translateY(0);
}

.mobile-grid { 
  display: grid;
  gap: 0.75rem;
}
@media (min-width: 640px) { 
  .mobile-grid { gap: 1rem; }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal-content {
  background: white;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 20rem;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(2, 8, 20, 0.12);
  text-align: center;
}
@media (min-width: 640px) {
  .modal-content { 
    padding: 2rem;
    max-width: 24rem;
  }
}

.text-primary-blue { color: #2B6CB0; }
.text-text-dark { color: #2D3748; }
.text-text-muted { color: #718096; }
.bg-neutral-gray { background: #F5F5F5; }
</style>
