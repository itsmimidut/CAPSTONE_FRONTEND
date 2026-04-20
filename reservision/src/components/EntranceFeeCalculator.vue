<template>
  <div class="entrance-fee-calculator">
    <!-- Header -->
    <div class="calculator-header">
      <h3 class="calculator-title">
        <i class="fas fa-gate"></i> Entrance Fee
      </h3>
      <p class="calculator-subtitle">Calculate entry fees for your visit</p>
    </div>

    <!-- Date Selection -->
    <div class="date-section">
      <label for="visit-date" class="section-label">
        <i class="fas fa-calendar"></i> Visit Date
      </label>
      <input
        id="visit-date"
        v-model="visitDate"
        @change="handleDateChange"
        type="date"
        class="date-input"
        :min="minDate"
      />
      <div v-if="dayTypeInfo" class="day-type-badge" :class="`badge-${dayTypeInfo.type}`">
        <i :class="dayTypeInfo.icon"></i>
        {{ dayTypeInfo.label }}
      </div>
    </div>

    <!-- Guest Count Selection -->
    <div class="guests-section">
      <label class="section-label">
        <i class="fas fa-users"></i> Guests
      </label>

      <!-- Adults -->
      <div class="guest-row">
        <div class="guest-info">
          <span class="guest-type">Adults</span>
          <span class="guest-age">18+ years</span>
        </div>
        <div class="guest-controls">
          <button @click="decreaseCount('adults')" class="count-btn" :disabled="guestCounts.adults === 0">
            <i class="fas fa-minus"></i>
          </button>
          <input
            v-model.number="guestCounts.adults"
            @change="handleCountChange"
            type="number"
            class="count-input"
            min="0"
          />
          <button @click="increaseCount('adults')" class="count-btn">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>

      <!-- Children -->
      <div class="guest-row">
        <div class="guest-info">
          <span class="guest-type">Children</span>
          <span class="guest-age">5-17 years</span>
        </div>
        <div class="guest-controls">
          <button @click="decreaseCount('children')" class="count-btn" :disabled="guestCounts.children === 0">
            <i class="fas fa-minus"></i>
          </button>
          <input
            v-model.number="guestCounts.children"
            @change="handleCountChange"
            type="number"
            class="count-input"
            min="0"
          />
          <button @click="increaseCount('children')" class="count-btn">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>

      <!-- Seniors -->
      <div class="guest-row">
        <div class="guest-info">
          <span class="guest-type">Seniors</span>
          <span class="guest-age">60+ years</span>
        </div>
        <div class="guest-controls">
          <button @click="decreaseCount('seniors')" class="count-btn" :disabled="guestCounts.seniors === 0">
            <i class="fas fa-minus"></i>
          </button>
          <input
            v-model.number="guestCounts.seniors"
            @change="handleCountChange"
            type="number"
            class="count-input"
            min="0"
          />
          <button @click="increaseCount('seniors')" class="count-btn">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Rates Display -->
    <div v-if="applicableRates.length > 0" class="rates-section">
      <label class="section-label">
        <i class="fas fa-tag"></i> Applicable Rates
      </label>
      <div class="rates-grid">
        <div v-for="rate in applicableRates" :key="rate.id" class="rate-card">
          <div class="rate-header">
            <span class="rate-name">{{ rate.name }}</span>
            <span class="rate-price">₱{{ formatPrice(rate.price) }}</span>
          </div>
          <div class="rate-info">
            <span v-if="rate.age_min || rate.age_max" class="rate-detail">
              {{ rate.age_min || 0 }}-{{ rate.age_max || '∞' }} yrs
            </span>
            <span v-if="rate.start_time && rate.end_time" class="rate-detail">
              {{ formatTime(rate.start_time) }} - {{ formatTime(rate.end_time) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading rates...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
    </div>

    <!-- Calculation Result -->
    <div v-if="!loading && calculationResult" class="result-section">
      <!-- Breakdown -->
      <div class="breakdown">
        <div class="breakdown-row">
          <span class="breakdown-label">
            <i class="fas fa-user"></i> Adults ({{ guestCounts.adults }} × ₱{{ formatPrice(calculationResult.breakdown.adults.price) }})
          </span>
          <span class="breakdown-value">₱{{ formatPrice(calculationResult.breakdown.adults.subtotal) }}</span>
        </div>

        <div v-if="guestCounts.children > 0" class="breakdown-row">
          <span class="breakdown-label">
            <i class="fas fa-child"></i> Children ({{ guestCounts.children }} × ₱{{ formatPrice(calculationResult.breakdown.children.price) }})
          </span>
          <span class="breakdown-value">₱{{ formatPrice(calculationResult.breakdown.children.subtotal) }}</span>
        </div>

        <div v-if="guestCounts.seniors > 0" class="breakdown-row">
          <span class="breakdown-label">
            <i class="fas fa-user-tie"></i> Seniors ({{ guestCounts.seniors }} × ₱{{ formatPrice(calculationResult.breakdown.seniors.price) }})
          </span>
          <span class="breakdown-value">₱{{ formatPrice(calculationResult.breakdown.seniors.subtotal) }}</span>
        </div>
      </div>

      <!-- Total -->
      <div class="total-section">
        <div class="total-row">
          <span class="total-label">Total Entrance Fee</span>
          <span class="total-value">₱{{ formatPrice(calculationResult.total) }}</span>
        </div>
        <p class="total-note">{{ totalGuests }} guest{{ totalGuests !== 1 ? 's' : '' }} on {{ formatDateDisplay(visitDate) }}</p>
      </div>

      <!-- Button -->
      <slot name="action" :total="calculationResult.total" :breakdown="calculationResult.breakdown">
        <button @click="handleAddToCart" class="btn-add-to-booking">
          <i class="fas fa-check-circle"></i> Add to Booking (₱{{ formatPrice(calculationResult.total) }})
        </button>
      </slot>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && totalGuests === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>Select guests to calculate entrance fee</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useEntranceRatesStore } from '../stores/entranceRatesStore';

const store = useEntranceRatesStore();

const emit = defineEmits(['fee-calculated', 'add-to-booking']);

// State
const guestCounts = ref({
  adults: 0,
  children: 0,
  seniors: 0
});

const visitDate = ref(new Date().toISOString().split('T')[0]);
const calculationResult = ref(null);
const loading = ref(false);
const error = ref(null);

// Computed
const minDate = computed(() => new Date().toISOString().split('T')[0]);

const totalGuests = computed(() => {
  return guestCounts.value.adults + guestCounts.value.children + guestCounts.value.seniors;
});

const dayTypeInfo = computed(() => {
  const date = new Date(visitDate.value);
  const day = date.getDay();

  if (day === 0 || day === 6) {
    return {
      type: 'weekend',
      label: 'Weekend Rate',
      icon: 'fas fa-sun'
    };
  }

  return {
    type: 'weekday',
    label: 'Weekday Rate',
    icon: 'fas fa-calendar-day'
  };
});

const applicableRates = computed(() => {
  return (store.rates || []).filter(r => r.status === 'active');
});

// Methods
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

const formatDateDisplay = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const increaseCount = (type) => {
  guestCounts.value[type]++;
  handleCountChange();
};

const decreaseCount = (type) => {
  if (guestCounts.value[type] > 0) {
    guestCounts.value[type]--;
    handleCountChange();
  }
};

const handleCountChange = async () => {
  if (totalGuests.value > 0) {
    await calculate();
  } else {
    calculationResult.value = null;
  }
};

const handleDateChange = async () => {
  if (totalGuests.value > 0) {
    await calculate();
  }
};

const calculate = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Fetch rates for the specific date
    const ratesData = await store.fetchRatesByDate(visitDate.value);

    // Calculate fee
    const result = {
      success: true,
      total: 0,
      breakdown: {
        adults: { count: guestCounts.value.adults, price: 0, subtotal: 0 },
        children: { count: guestCounts.value.children, price: 0, subtotal: 0 },
        seniors: { count: guestCounts.value.seniors, price: 0, subtotal: 0 }
      },
      ratesUsed: {}
    };

    // Find rates for each category
    const adultRate = ratesData.find(r => r.name.toLowerCase().includes('adult') || r.age_min === null);
    const childRate = ratesData.find(r => r.name.toLowerCase().includes('child'));
    const seniorRate = ratesData.find(r => r.name.toLowerCase().includes('senior'));

    // Calculate subtotals
    if (adultRate) {
      result.breakdown.adults.price = adultRate.price;
      result.breakdown.adults.subtotal = adultRate.price * guestCounts.value.adults;
    }

    if (childRate) {
      result.breakdown.children.price = childRate.price;
      result.breakdown.children.subtotal = childRate.price * guestCounts.value.children;
    }

    if (seniorRate) {
      result.breakdown.seniors.price = seniorRate.price;
      result.breakdown.seniors.subtotal = seniorRate.price * guestCounts.value.seniors;
    }

    // Calculate total
    result.total = 
      result.breakdown.adults.subtotal +
      result.breakdown.children.subtotal +
      result.breakdown.seniors.subtotal;

    calculationResult.value = result;
    emit('fee-calculated', result);
  } catch (err) {
    error.value = 'Unable to calculate entrance fee. Please try again.';
    console.error('Calculation error:', err);
  } finally {
    loading.value = false;
  }
};

const handleAddToCart = () => {
  if (calculationResult.value) {
    emit('add-to-booking', {
      type: 'entrance_fee',
      visitDate: visitDate.value,
      guestCounts: guestCounts.value,
      breakdown: calculationResult.value.breakdown,
      total: calculationResult.value.total
    });
  }
};

// Lifecycle
onMounted(async () => {
  // Load all active rates for display
  try {
    await store.fetchRates(1);
  } catch (err) {
    console.error('Failed to load rates:', err);
  }
});
</script>

<style scoped>
.entrance-fee-calculator {
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(125, 161, 142, 0.15);
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Header */
.calculator-header {
  margin-bottom: 1.5rem;
  border-bottom: 2px solid rgba(244, 196, 0, 0.2);
  padding-bottom: 1rem;
}

.calculator-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.calculator-title i {
  color: var(--color-primary);
}

.calculator-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-light);
}

/* Sections */
.date-section,
.guests-section,
.rates-section {
  margin-bottom: 1.5rem;
}

.section-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-dark);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-label i {
  color: var(--color-primary);
  font-size: 0.95rem;
}

/* Date Input */
.date-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(125, 161, 142, 0.2);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--color-text-dark);
  background: white;
  transition: all 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
}

.day-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.75rem;
}

.badge-weekday {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-weekend {
  background: rgba(244, 63, 94, 0.1);
  color: #991b1b;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

/* Guests Section */
.guest-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-gray-bg);
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.guest-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.guest-type {
  font-weight: 600;
  color: var(--color-text-dark);
  font-size: 0.95rem;
}

.guest-age {
  font-size: 0.8rem;
  color: var(--color-text-light);
}

.guest-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border-radius: 6px;
  border: 1px solid rgba(125, 161, 142, 0.15);
  padding: 0.25rem;
}

.count-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 4px;
}

.count-btn:hover:not(:disabled) {
  background: rgba(43, 108, 176, 0.1);
}

.count-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.count-input {
  width: 50px;
  text-align: center;
  border: none;
  background: transparent;
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text-dark);
}

.count-input:focus {
  outline: none;
}

/* Rates Grid */
.rates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.rate-card {
  background: var(--color-gray-bg);
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid rgba(125, 161, 142, 0.15);
  transition: all 0.2s;
}

.rate-card:hover {
  border-color: rgba(43, 108, 176, 0.3);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.1);
}

.rate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.rate-name {
  font-weight: 600;
  color: var(--color-text-dark);
  font-size: 0.9rem;
}

.rate-price {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1rem;
}

.rate-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rate-detail {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

/* Loading & Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-light);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(43, 108, 176, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  background: rgba(220, 38, 38, 0.1);
  border-radius: 8px;
  color: #991b1b;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.error-state i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

/* Breakdown */
.breakdown {
  background: var(--color-gray-bg);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.95rem;
  border-bottom: 1px solid rgba(125, 161, 142, 0.1);
}

.breakdown-row:last-child {
  border-bottom: none;
}

.breakdown-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-dark);
}

.breakdown-label i {
  color: var(--color-primary);
  font-size: 0.9rem;
}

.breakdown-value {
  font-weight: 600;
  color: var(--color-text-dark);
  font-family: 'Courier New', monospace;
}

/* Total Section */
.total-section {
  border-top: 2px solid rgba(244, 196, 0, 0.2);
  padding-top: 1rem;
  margin-bottom: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.total-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-dark);
}

.total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  font-family: 'Courier New', monospace;
}

.total-note {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: var(--color-text-light);
}

/* Button */
.btn-add-to-booking {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-add-to-booking:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-light);
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.4;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

@media (max-width: 640px) {
  .entrance-fee-calculator {
    padding: 1rem;
  }

  .rates-grid {
    grid-template-columns: 1fr;
  }

  .guest-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
