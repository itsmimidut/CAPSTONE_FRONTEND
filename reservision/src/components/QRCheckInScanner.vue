<template>
  <div class="qr-scanner-modal" v-if="isOpen">
    <div class="scanner-overlay" @click="closeScanner"></div>
    <div class="scanner-container">
      <!-- Header -->
      <div class="scanner-header">
        <h2>Check-In Guest</h2>
        <button class="close-btn" @click="closeScanner">✕</button>
      </div>

      <!-- Scanner Input - Compact Layout -->
      <div class="scanner-content">
        <div class="compact-scan-area">
          <div class="barcode-icon">
            <i class="fas fa-barcode"></i>
          </div>
          <div class="scan-input-wrapper">
            <label>
              <i class="fas fa-qrcode"></i> Scan QR Code
            </label>
            <input 
              ref="scannerInput"
              v-model="scannedReference"
              type="text"
              placeholder="Scan booking QR code..."
              @keyup.enter="validateReference"
              class="scanner-input"
              autocomplete="off"
            >
            <p class="hint">Auto-submits when scanned</p>
          </div>
        </div>

        <!-- Divider -->
        <div class="or-divider">
          <span>OR</span>
        </div>

        <!-- Manual Entry - Compact -->
        <div class="compact-manual-area">
          <div class="manual-input-wrapper">
            <label>
              <i class="fas fa-keyboard"></i> Manual Reference
            </label>
            <div class="manual-input-group">
              <input 
                v-model="manualReference"
                type="text"
                placeholder="BK-2024-00001"
                @keyup.enter="validateManualReference"
                class="reference-input"
              >
              <button @click="validateManualReference" class="btn-validate">
                <i class="fas fa-search"></i> Validate
              </button>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="scanError" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ scanError }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isValidating" class="loading-overlay">
        <div class="spinner"></div>
        <p>Validating booking...</p>
      </div>
    </div>

    <!-- Booking Details Modal - Compact & Scroll-free -->
    <div v-if="scannedBooking" class="booking-details-modal">
      <div class="details-overlay" @click="closeScanResult"></div>
      <div class="details-container compact-details">
        <!-- Header -->
        <div class="details-header">
          <h2><i class="fas fa-check-circle"></i> Confirm Check-In</h2>
          <button class="close-btn" @click="closeScanResult">✕</button>
        </div>

        <!-- Compact Booking Info -->
        <div class="booking-info-compact">
          <!-- Row 1: Guest Info -->
          <div class="info-row">
            <div class="info-icon"><i class="fas fa-user"></i></div>
            <div class="info-content">
              <span class="info-label">Guest</span>
              <strong>{{ scannedBooking.first_name }} {{ scannedBooking.last_name }}</strong>
            </div>
            <div class="info-divider"></div>
            <div class="info-content">
              <span class="info-label">Reference</span>
              <code class="ref-code">{{ scannedBooking.booking_reference }}</code>
            </div>
          </div>

          <!-- Row 2: Contact Info -->
          <div class="info-row">
            <div class="info-icon"><i class="fas fa-envelope"></i></div>
            <div class="info-content">
              <span class="info-label">Email</span>
              <span>{{ scannedBooking.email }}</span>
            </div>
            <div class="info-divider"></div>
            <div class="info-content">
              <span class="info-label">Phone</span>
              <span>{{ scannedBooking.phone || 'N/A' }}</span>
            </div>
          </div>

          <!-- Row 3: Dates -->
          <div class="info-row">
            <div class="info-icon"><i class="fas fa-calendar"></i></div>
            <div class="info-content">
              <span class="info-label">Check-In</span>
              <strong>{{ formatDate(scannedBooking.check_in_date) }}</strong>
            </div>
            <div class="info-divider"></div>
            <div class="info-content">
              <span class="info-label">Check-Out</span>
              <strong>{{ formatDate(scannedBooking.check_out_date) }}</strong>
            </div>
          </div>

          <!-- Row 4: Items Booked -->
          <div class="info-row items-row">
            <div class="info-icon"><i class="fas fa-home"></i></div>
            <div class="items-scroll">
              <span class="info-label">Items</span>
              <div class="items-tags">
                <span v-for="item in scannedBooking.items_list" :key="item.item_id" class="item-tag">
                  {{ item.item_name }} <span class="qty-badge">×{{ item.qty }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Row 5: Status & Actions -->
          <div class="action-row">
            <div class="status-chip" :class="getStatusClass(scannedBooking.booking_status)">
              <i class="fas" :class="getStatusIcon(scannedBooking.booking_status)"></i>
              {{ scannedBooking.booking_status }}
            </div>

            <div v-if="checkInError" class="error-compact">
              <i class="fas fa-exclamation-triangle"></i> {{ checkInError }}
            </div>

            <div v-if="checkInSuccess" class="success-compact">
              <i class="fas fa-check-circle"></i> Checked in successfully!
            </div>
          </div>
        </div>

        <!-- Action Buttons - Fixed at bottom -->
        <div class="details-actions-compact">
          <button @click="closeScanResult" class="btn btn-outline">
            Cancel
          </button>
          <button 
            v-if="!checkInSuccess"
            @click="confirmCheckIn" 
            class="btn btn-primary"
            :disabled="isCheckingIn"
          >
            <span v-if="isCheckingIn">
              <i class="fas fa-spinner fa-spin"></i> Processing...
            </span>
            <span v-else>
              <i class="fas fa-check-circle"></i> Confirm Check-In
            </span>
          </button>
          <button 
            v-else
            @click="resetScanner" 
            class="btn btn-primary"
          >
            <i class="fas fa-plus"></i> Scan Another
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'check-in-success'])

// State
const scannerInput = ref(null)
const scannedReference = ref('')
const manualReference = ref('')
const scannedBooking = ref(null)
const isValidating = ref(false)
const isCheckingIn = ref(false)
const scanError = ref('')
const checkInError = ref('')
const checkInSuccess = ref(false)

// Focus scanner input when modal opens
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        if (scannerInput.value) {
          scannerInput.value.focus()
        }
      })
      scanError.value = ''
      manualReference.value = ''
      scannedReference.value = ''
    }
  }
)

// Validate reference from 2D scanner
const validateReference = async () => {
  const refToValidate = scannedReference.value.trim()

  if (!refToValidate) {
    scanError.value = 'Please scan a booking QR code'
    return
  }

  isValidating.value = true
  scanError.value = ''
  checkInError.value = ''

  try {
    const response = await fetch(
      `http://localhost:8000/api/bookings/validate/${encodeURIComponent(refToValidate)}`
    )

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const data = await response.json()

    if (!data.success) {
      checkInError.value = data.error || 'Booking not found'
      scannedReference.value = ''
      nextTick(() => {
        if (scannerInput.value) {
          scannerInput.value.focus()
        }
      })
      return
    }

    scannedBooking.value = data.data
    scannedReference.value = ''
  } catch (error) {
    console.error('Validation error:', error)
    checkInError.value = error.message || 'Failed to validate booking'
    scannedReference.value = ''
    nextTick(() => {
      if (scannerInput.value) {
        scannerInput.value.focus()
      }
    })
  } finally {
    isValidating.value = false
  }
}

// Validate manually entered reference
const validateManualReference = async () => {
  const refToValidate = manualReference.value.trim()

  if (!refToValidate) {
    scanError.value = 'Please enter a booking reference'
    return
  }

  isValidating.value = true
  scanError.value = ''
  checkInError.value = ''

  try {
    const response = await fetch(
      `http://localhost:8000/api/bookings/validate/${encodeURIComponent(refToValidate)}`
    )

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const data = await response.json()

    if (!data.success) {
      checkInError.value = data.error || 'Booking not found'
      return
    }

    scannedBooking.value = data.data
    manualReference.value = ''
  } catch (error) {
    console.error('Validation error:', error)
    checkInError.value = error.message || 'Failed to validate booking'
  } finally {
    isValidating.value = false
  }
}

const confirmCheckIn = async () => {
  if (!scannedBooking.value) return

  isCheckingIn.value = true
  checkInError.value = ''

  try {
    const response = await fetch(
      `http://localhost:8000/api/bookings/${scannedBooking.value.id}/check-in`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checked_in_by: 'admin',
          checked_in_time: new Date().toISOString()
        })
      }
    )

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const data = await response.json()

    if (!data.success) {
      checkInError.value = data.error || 'Failed to check in'
      return
    }

    checkInSuccess.value = true
    scannedBooking.value.booking_status = 'Checked-in'
    emit('check-in-success', scannedBooking.value)

    // Show success message for 3 seconds before resetting
    setTimeout(() => {
      resetScanner()
    }, 3000)
  } catch (error) {
    console.error('Check-in error:', error)
    checkInError.value = error.message || 'Failed to check in guest'
  } finally {
    isCheckingIn.value = false
  }
}

const closeScanResult = async () => {
  scannedBooking.value = null
  checkInError.value = ''
  checkInSuccess.value = false
  nextTick(() => {
    if (scannerInput.value) {
      scannerInput.value.focus()
    }
  })
}

const resetScanner = async () => {
  manualReference.value = ''
  scannedReference.value = ''
  scannedBooking.value = null
  checkInError.value = ''
  checkInSuccess.value = false
  scanError.value = ''

  nextTick(() => {
    if (scannerInput.value) {
      scannerInput.value.focus()
    }
  })
}

const closeScanner = () => {
  emit('close')
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const getStatusClass = (status) => {
  const classes = {
    'Pending': 'status-pending',
    'Confirmed': 'status-confirmed',
    'Checked-in': 'status-checked-in',
    'Completed': 'status-completed',
    'Cancelled': 'status-cancelled'
  }
  return classes[status] || 'status-pending'
}

const getStatusIcon = (status) => {
  const icons = {
    'Pending': 'fa-clock',
    'Confirmed': 'fa-check-circle',
    'Checked-in': 'fa-check-double',
    'Completed': 'fa-flag-checkered',
    'Cancelled': 'fa-ban'
  }
  return icons[status] || 'fa-info-circle'
}
</script>

<style scoped>
.qr-scanner-modal {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.scanner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Scanner Container - Compact */
.scanner-container {
  position: relative;
  background: white;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scanner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
}

.scanner-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

.scanner-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.compact-scan-area {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f3f7 100%);
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e3e8ef;
}

.barcode-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.scan-input-wrapper {
  flex: 1;
}

.scan-input-wrapper label {
  font-weight: 700;
  color: #1e3c72;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.scanner-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e3e8ef;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  transition: all 0.2s ease;
  background: white;
}

.scanner-input:focus {
  outline: none;
  border-color: #2a5298;
  box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
}

.hint {
  font-size: 0.7rem;
  color: #999;
  margin: 0.25rem 0 0;
}

.or-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.25rem 0;
}

.or-divider::before,
.or-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e3e8ef;
}

.or-divider span {
  color: #999;
  font-weight: 600;
  font-size: 0.8rem;
}

.compact-manual-area {
  background: #f8f9fb;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e3e8ef;
}

.manual-input-wrapper label {
  font-weight: 700;
  color: #2c3e50;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.manual-input-group {
  display: flex;
  gap: 0.5rem;
}

.reference-input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e3e8ef;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  background: white;
}

.reference-input:focus {
  outline: none;
  border-color: #2a5298;
}

.btn-validate {
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-validate:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(30, 60, 114, 0.2);
}

.error-message {
  padding: 0.6rem 0.75rem;
  background: #fee;
  border: 1px solid #f8a5a5;
  border-radius: 0.5rem;
  color: #c33;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  z-index: 10;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e3e8ef;
  border-top-color: #2a5298;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Booking Details - Compact & Scroll-free */
.booking-details-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.details-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
}

.details-container.compact-details {
  position: relative;
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 560px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
}

.details-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.booking-info-compact {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-of-type {
  border-bottom: none;
}

.info-icon {
  width: 32px;
  height: 32px;
  background: #f0f3f7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2a5298;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.65rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-content strong {
  font-size: 0.9rem;
  color: #1e3c72;
}

.info-content span {
  font-size: 0.85rem;
  color: #333;
}

.ref-code {
  font-family: 'Courier New', monospace;
  background: #f0f3f7;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2a5298;
}

.info-divider {
  width: 1px;
  height: 30px;
  background: #e3e8ef;
}

.items-row {
  align-items: flex-start;
}

.items-scroll {
  flex: 1;
}

.items-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.item-tag {
  background: #f0f3f7;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2c3e50;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.qty-badge {
  background: #2a5298;
  color: white;
  padding: 0.1rem 0.3rem;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
}

.action-row {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending {
  background: #ffeaa7;
  color: #d63031;
}

.status-confirmed {
  background: #74b9ff;
  color: #0984e3;
}

.status-checked-in {
  background: #55efc4;
  color: #00b894;
}

.status-completed {
  background: #a29bfe;
  color: #6c5ce7;
}

.status-cancelled {
  background: #fab1a0;
  color: #d63031;
}

.error-compact {
  background: #fee;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  color: #c33;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.success-compact {
  background: #d4edda;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  color: #155724;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.details-actions-compact {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.details-actions-compact .btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-outline {
  background: white;
  color: #2a5298;
  border: 1px solid #2a5298;
}

.btn-outline:hover:not(:disabled) {
  background: #f0f3f7;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(30, 60, 114, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .scanner-container,
  .details-container.compact-details {
    max-width: calc(100% - 1rem);
    margin: 0 0.5rem;
  }
  
  .compact-scan-area {
    flex-direction: column;
    text-align: center;
  }
  
  .info-row {
    flex-wrap: wrap;
  }
  
  .info-divider {
    display: none;
  }
  
  .action-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .status-chip {
    justify-content: center;
  }
}
</style>