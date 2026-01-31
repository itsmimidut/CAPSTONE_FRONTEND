<template>
  <div class="min-h-screen">

    <!-- Header -->
    <header class="bg-white/95 backdrop-blur-md border-b border-blue-50 sticky top-0 z-50">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" class="flex items-center space-x-2">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-blue to-accent-blue flex items-center justify-center text-white font-bold text-base">
            Ed
          </div>
          <div class="text-lg font-bold text-primary-blue">Eduardo's</div>
        </a>
        <div class="text-xs text-text-muted font-medium hidden sm:block">
          Complete Booking
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="container mx-auto px-4 py-5 max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6">

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
              <input type="text" class="form-input" v-model="guest.firstName" placeholder="Juan">
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5">Last Name *</label>
              <input type="text" class="form-input" v-model="guest.lastName" placeholder="Dela Cruz">
            </div>
          </div>
          <div class="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5">Adults</label>
              <div class="flex items-center justify-center gap-2 bg-neutral-gray rounded-xl p-2">
                <button class="counter-btn" @click="decrement('adults')"><i class="fas fa-minus"></i></button>
                <span class="font-semibold text-sm w-6">{{ guest.adults }}</span>
                <button class="counter-btn" @click="increment('adults')"><i class="fas fa-plus"></i></button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5">Children</label>
              <div class="flex items-center justify-center gap-2 bg-neutral-gray rounded-xl p-2">
                <button class="counter-btn" @click="decrement('children')"><i class="fas fa-minus"></i></button>
                <span class="font-semibold text-sm w-6">{{ guest.children }}</span>
                <button class="counter-btn" @click="increment('children')"><i class="fas fa-plus"></i></button>
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
            <textarea class="form-input h-20 text-sm
            " v-model="guest.specialRequests" placeholder="Late check-in, dietary needs..."></textarea>
          </div>
        </div>

        <!-- Contact & Billing -->
        <div class="section-card reveal">
          <h2 class="text-lg font-bold text-text-dark mb-3 flex items-center gap-2">
            <i class="fas fa-address-book text-primary-blue text-lg"></i>
            Contact & Billing
          </h2>
          <div class="mobile-grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5">Phone Number *</label>
              <div class="flex gap-2">
                <span class="flex items-center justify-center w-16 bg-gray-100 rounded-l-xl border border-r-0 border-gray-300 text-sm font-medium">+63</span>
                <input type="tel" class="form-input rounded-l-none flex-1" v-model="guest.phone" placeholder="912 345 6789">
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5">Postal Code *</label>
              <input type="text" class="form-input" v-model="guest.postal" placeholder="5200">
            </div>
          </div>

          <div class="mt-4 mobile-grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5">Email *</label>
              <input type="email" class="form-input" v-model="guest.email" placeholder="juan@example.com">
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5">Street Address *</label>
              <input type="text" class="form-input" v-model="guest.address" placeholder="123 Resort St.">
            </div>
          </div>

          <div class="mt-4 mobile-grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5">City *</label>
              <input type="text" class="form-input" v-model="guest.city" placeholder="Calapan">
            </div>
            <div>
              <label class="block text-xs font-medium text-text-muted mb-1.5">Country *</label>
              <select class="form-input text-sm" v-model="guest.country">
                <option>Philippines</option>
              </select>
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
            <div v-for="(item, index) in items" :key="index" class="flex justify-between items-start p-2 bg-blue-50 rounded-lg text-xs">
              <div class="flex-1">
                <div class="font-medium">{{ item.item.name }}</div>
                <div class="text-text-muted text-xs">
                  ×{{ item.qty }} • {{ item.guests }} Guest{{ item.guests > 1 ? 's' : '' }}
                  <span v-if="item.item.perNight"> • {{ item.nights }} night{{ item.nights > 1 ? 's' : '' }}</span>
                </div>
              </div>
              <div class="text-right ml-2">
                <div class="font-medium">₱{{ item.lineTotal.toLocaleString() }}</div>
                <div v-if="item.item.perNight" class="text-text-muted text-xs">₱{{ item.item.price.toLocaleString() }}/night</div>
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
              :class="['payment-option', { selected: selectedPayment === method.id }]" 
              @click="selectPayment(method.id)">
              <div class="flex items-center">
                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center mr-3', method.bgClass]">
                  <i :class="[method.iconClass, method.iconColor, 'text-lg']"></i>
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
            <input type="checkbox" id="terms" class="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue mt-0.5 mr-2" v-model="termsAgreed">
            <label for="terms" class="text-xs text-text-muted leading-tight">
              I agree to the <a href="#" class="text-primary-blue hover:underline font-medium">Terms & Conditions</a>
            </label>
          </div>

          <button class="btn-primary mt-4 text-sm" :class="{ 'btn-loading': loading }" @click="payNow">
            <span class="btn-text"><i class="fas fa-lock"></i> Pay Now & Confirm</span>
          </button>

          <div class="text-center mt-3 text-xs text-text-muted">
            <i class="fas fa-undo-alt mr-1"></i> Free cancellation until 24 hrs before
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
          Your booking is secured. A confirmation email has been sent to <span class="font-medium text-text-dark">{{ guest.email }}</span>.
        </p>
        <div class="space-y-2">
          <router-link to="/confirmation" class="block w-full py-2.5 bg-primary-blue text-white rounded-lg font-medium text-sm hover:bg-accent-blue transition">
            View Booking Details
          </router-link>
          <router-link to="/" class="block w-full py-2.5 border border-primary-blue text-primary-blue rounded-lg font-medium text-sm hover:bg-blue-50 transition">
            Back to Home
          </router-link>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'BookingPage',
  data() {
    const bookingData = JSON.parse(localStorage.getItem('eduardosBooking') || '{}');
    const items = bookingData.items?.map(b => {
      const nights = b.item.perNight && bookingData.checkIn && bookingData.checkOut
        ? Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / 86400000)
        : 1;
      return {
        ...b,
        nights,
        lineTotal: b.item.price * b.qty * (b.item.perNight ? nights : 1)
      };
    }) || [];
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

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
      items,
      subtotal,
      paymentMethods: [
        { id: 'paymaya', name: 'PayMaya', description: 'E-wallet', iconClass: 'fas fa-mobile-alt', iconColor: 'text-green-600', bgClass: 'bg-green-50' },
        { id: 'gcash', name: 'GCash', description: 'E-wallet', iconClass: 'fas fa-wallet', iconColor: 'text-green-600', bgClass: 'bg-green-50' },
        { id: 'bank', name: 'Bank Transfer', description: 'BDO, BPI, etc.', iconClass: 'fas fa-university', iconColor: 'text-blue-600', bgClass: 'bg-blue-50' }
      ],
      selectedPayment: bookingData.selectedPayment || 'gcash',
      termsAgreed: false,
      loading: false,
      showModal: false
    };
  },
  methods: {
    increment(type) { this.guest[type]++; },
    decrement(type) {
      if (type === 'adults' && this.guest.adults > 1) this.guest.adults--;
      if (type === 'children' && this.guest.children > 0) this.guest.children--;
    },
    selectPayment(id) { this.selectedPayment = id; },
    async payNow() {
      const required = ['firstName','lastName','phone','email','address','city','postal'];
      for (const key of required) {
        if (!this.guest[key].trim()) return alert('Please fill all required fields!');
      }
      if (!this.termsAgreed) return alert('Please agree to the Terms & Conditions');

      this.loading = true;

      const finalBooking = {
        ...JSON.parse(localStorage.getItem('eduardosBooking') || '{}'),
        guest: {
          ...this.guest,
          fullName: this.guest.firstName + ' ' + this.guest.lastName,
          phone: '+63' + this.guest.phone
        },
        selectedPayment: this.selectedPayment,
        total: this.subtotal,
        bookingId: 'EDU' + Date.now().toString().slice(-8)
      };

      try {
        const res = await fetch('http://localhost:3000/api/bookings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalBooking)
        });
        const result = await res.json();
        if (res.ok) {
          localStorage.removeItem('eduardosBooking');
          this.showModal = true;
        } else {
          alert(result.error || 'Booking failed');
        }
      } catch (err) {
        console.error('Connection error:', err);
        alert('Cannot connect to server. Is backend running?');
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    // Animate reveal elements
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
};
</script>

<style scoped>
/* Enhanced Design with Depth & Sophistication */
:root {
  --primary-blue: #2B6CB0; 
  --accent-blue: #63B3ED; 
  --warm-brown: #C19A6B; 
  --deep-brown: #8B5E3C;
  --white: #ffffff; 
  --neutral-gray: #F5F5F5; 
  --text-dark: #2D3748; 
  --text-muted: #718096;
  --shadow: 0 4px 12px rgba(2, 8, 20, 0.08); 
  --shadow-lg: 0 10px 30px rgba(2, 8, 20, 0.12);
  --shadow-xl: 0 20px 40px rgba(2, 8, 20, 0.15);
  --shadow-2xl: 0 30px 60px rgba(2, 8, 20, 0.2);
  --radius: 16px; 
  --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: #63B3ED;
}

    body { 
      font-family: 'Inter', sans-serif; 
      background: linear-gradient(to bottom, #5895bd, var(--white)); 
      overflow-x: hidden; 
    }

/* Enhanced Card with Gradient Background & Elevated Shadow */
.section-card { 
  background: linear-gradient(135deg, #ffffff 0%, #F8FBFF 100%);
  border-radius: 16px;
  padding: 1.5rem; 
  box-shadow: 0 8px 32px rgba(43, 108, 176, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(43, 108, 176, 0.15);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.section-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  opacity: 0.8;
}

.section-card:hover {
  box-shadow: 0 12px 40px rgba(43, 108, 176, 0.18), 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-4px);
}

/* Enhanced Form Input with Gradient Border & Glow (compact) */
.form-input {
  width: 100%;
  max-width: auto;
  box-sizing: border-box;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  font-size: 0.96rem;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(248,250,252,0.95) 0%, rgba(240,245,250,0.92) 100%);
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);
  position: relative;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  background: linear-gradient(135deg, #FFFFFF 0%, rgba(240, 245, 250, 0.95) 100%);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.02),
    0 0 0 3px rgba(43, 108, 176, 0.1),
    0 4px 12px rgba(43, 108, 176, 0.15);
  transform: translateY(-2px);
}

/* Labels: slightly smaller to reduce visual weight */
.section-card label { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.35rem; display: block; }

.form-input:hover:not(:focus) {
  border-color: #CBD5E0;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
}

/* Enhanced Primary Button with Gradient & Shadow (compact) */
.primarybtn- {
  background: linear-gradient(135deg, #2B6CB0 0%, #1D4A7A 60%);
  color: white;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  transition: var(--transition);
  box-shadow: 0 8px 24px rgba(43,108,176,0.28);
  width: 100%;
  max-width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  margin-left: 0;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.btn-primary:hover:not(.btn-loading) {
  transform: translateY(-3px);
  box-shadow: 
    0 12px 32px rgba(43, 108, 176, 0.45),
    0 6px 16px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.btn-primary:hover:not(.btn-loading)::before {
  left: 100%;
}

.btn-primary:active:not(.btn-loading) {
  transform: translateY(-1px);
  box-shadow: 
    0 6px 16px rgba(43, 108, 176, 0.3),
    inset 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-loading { 
  pointer-events: none; 
  opacity: 0.9; 
}

.btn-loading .btn-text { 
  opacity: 0; 
}

.btn-loading::after { 
  content: ''; 
  position: absolute; 
  width: 1.25rem; 
  height: 1.25rem; 
  border: 2px solid transparent; 
  border-top-color: white; 
  border-right-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%; 
  animation: spin 0.8s linear infinite; 
}

@keyframes spin { 
  to { 
    transform: rotate(360deg); 
  } 
}

/* Enhanced Payment Options with Gradient & 3D Effect */
.payment-option { 
  border: 2px solid transparent;
  border-radius: 14px; 
  padding: 1rem; 
  cursor: pointer; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #F8FAFC 0%, #F0F4F8 100%);
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.payment-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
}

.payment-option:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 6px 20px rgba(43, 108, 176, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.06);
  border-color: rgba(43, 108, 176, 0.2);
}

.payment-option.selected { 
  border-color: var(--primary-blue);
  background: linear-gradient(135deg, rgba(43, 108, 176, 0.08) 0%, rgba(99, 179, 237, 0.05) 100%);
  box-shadow: 
    0 8px 24px rgba(43, 108, 176, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
}

.payment-option .check-icon { 
  display: none;
  animation: checkPulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.payment-option.selected .check-icon { 
  display: block;
}

@keyframes checkPulse {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

/* Enhanced Counter Button with Gradient */
.counter-btn { 
  width: 2.25rem; 
  height: 2.25rem; 
  border-radius: 50%; 
  border: 2px solid var(--primary-blue);
  color: var(--primary-blue); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 0.875rem; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%);
  box-shadow: 0 2px 6px rgba(43, 108, 176, 0.12);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.counter-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(43, 108, 176, 0.2) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.counter-btn:hover {
  background: linear-gradient(135deg, var(--primary-blue) 0%, #1D4A7A 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(43, 108, 176, 0.28);
}

.counter-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(43, 108, 176, 0.15);
}

/* Reveal Animation with Stagger */
.reveal { 
  opacity: 0; 
  transform: translateY(20px); 
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, 
              transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s; 
}

.reveal.visible { 
  opacity: 1; 
  transform: translateY(0);
}

/* Enhanced Modal with Backdrop Blur & Animation */
.modal-overlay { 
  position: fixed; 
  inset: 0; 
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%);
  backdrop-filter: blur(8px);
  z-index: 50; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 1rem;
  animation: modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

.modal-content { 
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FBFF 100%);
  border-radius: 20px; 
  width: 100%; 
  max-width: 25rem; 
  padding: 2rem; 
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 10px 30px rgba(43, 108, 176, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  text-align: center;
  animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(43, 108, 176, 0.3), transparent);
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Success Icon Enhancement */
.modal-content .w-16 {
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.25), 
              0 0 0 1px rgba(34, 197, 94, 0.1);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0) rotate(-45deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

/* Mobile adjustments: reduce padding, font-size and avoid large controls */
@media (max-width: 640px) {
  .section-card { padding: 0.75rem; border-radius: calc(var(--radius) - 8px); }
  .form-input { padding: 0.6rem 0.75rem; font-size: 0.95rem; border-radius: 12px; }
  .btn-primary { padding: 0.7rem 0.9rem; font-size: 0.95rem; border-radius: 12px; }
  .payment-option { padding: 0.65rem; }
  .counter-btn { width: 2rem; height: 2rem; font-size: 0.85rem; }
  .mobile-grid { gap: 0.5rem; }
  .space-y-5 > * { margin-bottom: 0.9rem; }
  .modal-content { padding: 1rem; max-width: 20rem; }
  .section-card::before, .payment-option::before, .modal-content::before { display: none; }
}

/* Prevent hover lifts on touch devices, only enable on hover-capable devices */
@media (hover: hover) and (pointer: fine) {
  .section-card:hover { transform: translateY(-4px); }
  .payment-option:hover { transform: translateY(-3px); }
  .btn-primary:hover { transform: translateY(-3px); }
}

</style>