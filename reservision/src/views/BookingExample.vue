<template>
  <div class="booking-page">
    <!-- Booking Header -->
    <div class="booking-header">
      <h1>Complete Your Booking</h1>
      <div class="booking-steps">
        <div :class="['step', currentStep >= 1 && 'active']">
          <span class="step-number">1</span>
          <span>Room Selection</span>
        </div>
        <div :class="['step', currentStep >= 2 && 'active']">
          <span class="step-number">2</span>
          <span>Guest Information</span>
        </div>
        <div :class="['step', currentStep >= 3 && 'active']">
          <span class="step-number">3</span>
          <span>Entrance Fees</span>
        </div>
        <div :class="['step', currentStep >= 4 && 'active']">
          <span class="step-number">4</span>
          <span>Review & Confirm</span>
        </div>
      </div>
    </div>

    <!-- Booking Content -->
    <div class="booking-container">
      <div class="booking-main">
        <!-- Room Selection -->
        <section v-if="currentStep === 1" class="booking-section">
          <h2>Select Your Room</h2>
          <div class="rooms-grid">
            <div v-for="room in availableRooms" :key="room.id" class="room-card">
              <div class="room-image">
                <img :src="room.image" :alt="room.name" />
              </div>
              <div class="room-info">
                <h3>{{ room.name }}</h3>
                <p class="room-desc">{{ room.description }}</p>
                <div class="room-details">
                  <span><i class="fas fa-users"></i> {{ room.capacity }} guests</span>
                  <span><i class="fas fa-ruler"></i> {{ room.size }} m²</span>
                </div>
                <div class="room-footer">
                  <span class="room-price">₱{{ room.price.toLocaleString() }}/night</span>
                  <button
                    @click="selectRoom(room)"
                    :class="['btn-select', selectedRoom?.id === room.id && 'selected']"
                  >
                    {{ selectedRoom?.id === room.id ? 'Selected' : 'Select' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="booking-actions">
            <button @click="currentStep = 2" :disabled="!selectedRoom" class="btn-next">
              Continue <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </section>

        <!-- Guest Information -->
        <section v-if="currentStep === 2" class="booking-section">
          <h2>Guest Information</h2>
          <form @submit.prevent="handleGuestStep" class="guest-form">
            <div class="form-group">
              <label for="checkout-in">Check-In Date</label>
              <input v-model="guestInfo.checkIn" id="checkout-in" type="date" class="form-input" required />
            </div>

            <div class="form-group">
              <label for="checkout-out">Check-Out Date</label>
              <input v-model="guestInfo.checkOut" id="checkout-out" type="date" class="form-input" required />
            </div>

            <div class="form-group">
              <label for="guest-name">Guest Name</label>
              <input
                v-model="guestInfo.name"
                id="guest-name"
                type="text"
                placeholder="Full name"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="guest-email">Email</label>
              <input
                v-model="guestInfo.email"
                id="guest-email"
                type="email"
                placeholder="your@email.com"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="guest-phone">Phone Number</label>
              <input
                v-model="guestInfo.phone"
                id="guest-phone"
                type="tel"
                placeholder="+63 9XX XXXX XXX"
                class="form-input"
                required
              />
            </div>

            <div class="booking-actions">
              <button type="button" @click="currentStep = 1" class="btn-back">
                <i class="fas fa-arrow-left"></i> Back
              </button>
              <button type="submit" class="btn-next">
                Continue <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </form>
        </section>

        <!-- Entrance Fees -->
        <section v-if="currentStep === 3" class="booking-section">
          <h2>Add Entrance Fees</h2>
          <p class="section-description">
            Calculate and add entrance fees for your resort visit
          </p>
          <EntranceFeeCalculator
            @fee-calculated="handleFeeCalculated"
            @add-to-booking="handleAddEntranceFee"
          >
            <template #action="{ total }">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <button type="button" @click="skipEntranceFee" class="btn-secondary">
                  Skip Entrance Fees
                </button>
                <button type="button" @click="currentStep = 4" class="btn-next">
                  Continue Review <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </template>
          </EntranceFeeCalculator>

          <div class="booking-actions">
            <button @click="currentStep = 2" class="btn-back">
              <i class="fas fa-arrow-left"></i> Back
            </button>
          </div>
        </section>

        <!-- Review & Confirm -->
        <section v-if="currentStep === 4" class="booking-section">
          <h2>Review Your Booking</h2>

          <!-- Room Summary -->
          <div class="review-card">
            <h3>Room Booking</h3>
            <div class="review-details">
              <div class="detail-row">
                <span class="label">Room:</span>
                <span class="value">{{ selectedRoom?.name }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-In:</span>
                <span class="value">{{ formatDate(guestInfo.checkIn) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-Out:</span>
                <span class="value">{{ formatDate(guestInfo.checkOut) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Nights:</span>
                <span class="value">{{ calculateNights(guestInfo.checkIn, guestInfo.checkOut) }}</span>
              </div>
            </div>
          </div>

          <!-- Guest Summary -->
          <div class="review-card">
            <h3>Guest Information</h3>
            <div class="review-details">
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">{{ guestInfo.name }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">{{ guestInfo.email }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">{{ guestInfo.phone }}</span>
              </div>
            </div>
          </div>

          <!-- Charges Summary -->
          <div class="review-card">
            <h3>Charges Summary</h3>
            <div class="charges">
              <div class="charge-row">
                <span class="charge-label">
                  Room ({{ calculateNights(guestInfo.checkIn, guestInfo.checkOut) }} nights × ₱{{ selectedRoom?.price.toLocaleString() }})
                </span>
                <span class="charge-value">₱{{ calculateRoomTotal(guestInfo.checkIn, guestInfo.checkOut).toLocaleString() }}</span>
              </div>
              <div v-if="bookingItems.entranceFee" class="charge-row">
                <span class="charge-label">Entrance Fees</span>
                <span class="charge-value">₱{{ bookingItems.entranceFee.total.toLocaleString() }}</span>
              </div>
              <div class="charge-row total">
                <span class="charge-label">Total</span>
                <span class="charge-value">₱{{ calculateTotal().toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div class="terms-section">
            <label class="terms-checkbox">
              <input v-model="agreedTerms" type="checkbox" />
              <span>I agree to the <a href="#" @click.prevent>Terms and Conditions</a></span>
            </label>
          </div>

          <!-- Actions -->
          <div class="booking-actions">
            <button @click="currentStep = 3" class="btn-back">
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <button
              @click="handleConfirmBooking"
              :disabled="!agreedTerms || submitting"
              class="btn-confirm"
            >
              <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
              {{ submitting ? 'Processing...' : 'Confirm Booking' }}
            </button>
          </div>
        </section>
      </div>

      <!-- Booking Sidebar -->
      <aside class="booking-sidebar">
        <div class="sidebar-card">
          <h3>Booking Summary</h3>
          <div class="summary-details">
            <div class="summary-row">
              <span>Room:</span>
              <span>{{ selectedRoom?.name || '—' }}</span>
            </div>
            <div class="summary-row">
              <span>Nights:</span>
              <span>{{ calculateNights(guestInfo.checkIn, guestInfo.checkOut) || '—' }}</span>
            </div>
            <div class="summary-row">
              <span>Guests:</span>
              <span>{{ guestInfo.name || '—' }}</span>
            </div>
            <div v-if="bookingItems.entranceFee" class="summary-row">
              <span>Entrance Fees:</span>
              <span>Yes</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-total">
              <span>Total Amount:</span>
              <span class="price">₱{{ calculateTotal().toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-card">
          <h3>Current Step</h3>
          <div class="step-progress">
            <p class="progress-text">Step {{ currentStep }} of 4</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: currentStep * 25 + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Trust Badges -->
        <div class="sidebar-card trust">
          <div class="trust-badge">
            <i class="fas fa-lock"></i>
            <span>Secure Payment</span>
          </div>
          <div class="trust-badge">
            <i class="fas fa-shield-alt"></i>
            <span>Data Protected</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- Success Modal -->
    <Teleport to="body">
      <div v-if="showSuccess" class="modal-overlay">
        <div class="modal-success">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>Booking Confirmed!</h2>
          <p>Confirmation details have been sent to {{ guestInfo.email }}</p>
          <p class="booking-ref">Booking Reference: <strong>#2026041812345</strong></p>
          <button @click="handleReturnHome" class="btn-primary">
            Return to Home
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import EntranceFeeCalculator from '@/components/EntranceFeeCalculator.vue';

// State
const currentStep = ref(1);
const selectedRoom = ref(null);
const agreedTerms = ref(false);
const submitting = ref(false);
const showSuccess = ref(false);

const guestInfo = ref({
  checkIn: '',
  checkOut: '',
  name: '',
  email: '',
  phone: ''
});

const bookingItems = ref({
  entranceFee: null
});

// Sample data
const availableRooms = ref([
  {
    id: 1,
    name: 'Deluxe Suite',
    description: 'Spacious room with ocean view',
    capacity: 2,
    size: 45,
    price: 5000,
    image: '/images/rooms/deluxe.jpg'
  },
  {
    id: 2,
    name: 'Standard Room',
    description: 'Comfortable room, perfect for couples',
    capacity: 2,
    size: 30,
    price: 3000,
    image: '/images/rooms/standard.jpg'
  },
  {
    id: 3,
    name: 'Family Suite',
    description: 'Ideal for families with children',
    capacity: 4,
    size: 60,
    price: 7500,
    image: '/images/rooms/family.jpg'
  }
]);

// Methods
const selectRoom = (room) => {
  selectedRoom.value = room;
};

const handleGuestStep = () => {
  if (guestInfo.value.name && guestInfo.value.email && guestInfo.value.checkIn && guestInfo.value.checkOut) {
    currentStep.value = 3;
  }
};

const handleFeeCalculated = (result) => {
  console.log('Fee calculated:', result);
};

const handleAddEntranceFee = (feeData) => {
  bookingItems.value.entranceFee = feeData;
};

const skipEntranceFee = () => {
  bookingItems.value.entranceFee = null;
  currentStep.value = 4;
};

const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, nights);
};

const calculateRoomTotal = (checkIn, checkOut) => {
  return (selectedRoom.value?.price || 0) * calculateNights(checkIn, checkOut);
};

const calculateTotal = () => {
  let total = calculateRoomTotal(guestInfo.value.checkIn, guestInfo.value.checkOut);
  if (bookingItems.value.entranceFee) {
    total += bookingItems.value.entranceFee.total;
  }
  return total;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const handleConfirmBooking = async () => {
  submitting.value = true;

  // Simulate API call
  setTimeout(() => {
    submitting.value = false;
    showSuccess.value = true;
  }, 2000);
};

const handleReturnHome = () => {
  // Navigate to home
  window.location.href = '/';
};
</script>

<style scoped>
.booking-page {
  background: var(--color-bg);
  min-height: 100vh;
  padding: 2rem 0;
}

/* Header */
.booking-header {
  background: white;
  padding: 2rem;
  border-bottom: 1px solid rgba(125, 161, 142, 0.1);
  margin-bottom: 2rem;
}

.booking-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0 0 1.5rem 0;
}

.booking-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--color-gray-bg);
  position: relative;
  transition: all 0.3s;
}

.step::after {
  content: '';
  position: absolute;
  right: -0.5rem;
  width: 2px;
  height: 100%;
  background: rgba(125, 161, 142, 0.2);
}

.step:last-child::after {
  display: none;
}

.step.active {
  background: rgba(43, 108, 176, 0.1);
  border: 1px solid rgba(43, 108, 176, 0.3);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-gray);
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
}

.step.active .step-number {
  background: var(--color-primary);
}

.step span:last-child {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-light);
}

.step.active span:last-child {
  color: var(--color-primary);
}

/* Container */
.booking-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.booking-main {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.booking-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-description {
  color: var(--color-text-light);
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
}

/* Rooms Grid */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.room-card {
  border: 1px solid rgba(125, 161, 142, 0.15);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.room-card:hover {
  border-color: rgba(43, 108, 176, 0.3);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.1);
}

.room-image {
  width: 100%;
  height: 180px;
  background: var(--color-gray-bg);
  overflow: hidden;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-info {
  padding: 1rem;
}

.room-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-dark);
}

.room-desc {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.room-details {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-light);
  margin-bottom: 0.75rem;
}

.room-details span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-price {
  font-weight: 700;
  color: var(--color-primary);
}

.btn-select {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(43, 108, 176, 0.3);
  background: white;
  color: var(--color-primary);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-select:hover {
  background: rgba(43, 108, 176, 0.1);
}

.btn-select.selected {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Forms */
.guest-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text-dark);
  font-size: 0.95rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid rgba(125, 161, 142, 0.2);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--color-text-dark);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
}

/* Review Cards */
.review-card {
  background: var(--color-gray-bg);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.review-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.review-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(125, 161, 142, 0.1);
  font-size: 0.95rem;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: var(--color-text-light);
  font-weight: 600;
}

.detail-row .value {
  color: var(--color-text-dark);
  font-weight: 600;
}

/* Charges */
.charges {
  border-top: 2px solid rgba(244, 196, 0, 0.2);
  padding-top: 1rem;
}

.charge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  font-size: 0.95rem;
}

.charge-row.total {
  border-top: 2px solid rgba(244, 196, 0, 0.2);
  padding-top: 1rem;
  margin-top: 0.5rem;
  font-weight: 700;
}

.charge-label {
  color: var(--color-text-dark);
}

.charge-value {
  color: var(--color-primary);
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

/* Terms */
.terms-section {
  background: transparent;
  padding: 1.5rem 0;
  border-top: 1px solid rgba(125, 161, 142, 0.1);
  margin-bottom: 1.5rem;
}

.terms-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  color: var(--color-text-dark);
  font-size: 0.95rem;
}

.terms-checkbox input {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.terms-checkbox a {
  color: var(--color-primary);
  text-decoration: none;
}

.terms-checkbox a:hover {
  text-decoration: underline;
}

/* Actions */
.booking-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(125, 161, 142, 0.1);
}

.btn-back,
.btn-next,
.btn-secondary,
.btn-confirm,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-back {
  background: var(--color-gray-bg);
  color: var(--color-text-dark);
  border: 1px solid rgba(125, 161, 142, 0.2);
}

.btn-back:hover {
  background: rgba(125, 161, 142, 0.1);
}

.btn-next,
.btn-confirm,
.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-next:hover,
.btn-confirm:hover,
.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

.btn-next:disabled,
.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: var(--color-primary);
  border: 1px solid rgba(43, 108, 176, 0.3);
}

.btn-secondary:hover {
  background: rgba(43, 108, 176, 0.1);
}

/* Sidebar */
.booking-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(125, 161, 142, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sidebar-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-dark);
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  color: var(--color-text-dark);
}

.summary-row span:first-child {
  color: var(--color-text-light);
}

.summary-divider {
  height: 1px;
  background: rgba(125, 161, 142, 0.1);
  margin: 0.5rem 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-primary);
}

.summary-total .price {
  font-size: 1.5rem;
  font-family: 'Courier New', monospace;
}

.step-progress {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-light);
}

.progress-bar {
  height: 6px;
  background: rgba(125, 161, 142, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s;
}

.trust {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
}

.trust-badge {
  text-align: center;
  color: var(--color-primary);
}

.trust-badge i {
  display: block;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.trust-badge span {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-success {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  max-width: 450px;
  animation: slideUp 0.3s ease-out;
}

.success-icon {
  font-size: 60px;
  color: #22c55e;
  margin-bottom: 1rem;
}

.modal-success h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--color-text-dark);
}

.modal-success p {
  color: var(--color-text-light);
  margin: 0.5rem 0;
}

.booking-ref {
  background: var(--color-gray-bg);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0 1.5rem;
  font-family: monospace;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .booking-container {
    grid-template-columns: 1fr;
  }

  .booking-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .booking-header {
    padding: 1rem;
  }

  .booking-main {
    padding: 1rem;
  }

  .booking-steps {
    grid-template-columns: 2fr 2fr;
  }

  .booking-container {
    padding: 0 1rem;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
  }

  .guest-form {
    grid-template-columns: 1fr;
  }

  .booking-actions {
    flex-direction: column-reverse;
  }

  .btn-back,
  .btn-next {
    width: 100%;
    justify-content: center;
  }
}
</style>
