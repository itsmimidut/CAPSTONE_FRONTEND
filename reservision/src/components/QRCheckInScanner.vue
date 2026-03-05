<template>
  <div class="qr-scanner-modal" v-if="isOpen">
    <div class="scanner-overlay" @click="closeScanner"></div>
    <div class="scanner-container">
      <!-- Header -->
      <div class="scanner-header">
        <h2>Check-In Guest</h2>
        <button class="close-btn" @click="closeScanner">✕</button>
      </div>

      <!-- Scanner/Input Tabs -->
      <div class="scanner-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: scanMode === 'camera' }"
          @click="scanMode = 'camera'"
        >
          <i class="fas fa-camera mr-2"></i>Scan QR
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: scanMode === 'manual' }"
          @click="scanMode = 'manual'"
        >
          <i class="fas fa-keyboard mr-2"></i>Manual Entry
        </button>
      </div>

      <!-- Camera Scanner -->
      <div v-if="scanMode === 'camera'" class="scanner-content">
        <div id="qr-scanner" class="qr-scanner-box"></div>
        <p class="scanner-hint">Point your device camera at the QR code</p>
        <div v-if="scanError" class="error-message">
          <i class="fas fa-exclamation-circle mr-2"></i>{{ scanError }}
        </div>
      </div>

      <!-- Manual Entry -->
      <div v-if="scanMode === 'manual'" class="scanner-content">
        <div class="input-group">
          <label>Booking Reference</label>
          <input 
            v-model="manualReference"
            type="text"
            placeholder="Enter booking reference (e.g., BK-2024-00001)"
            @keyup.enter="validateReference"
            class="reference-input"
          >
        </div>
        <button @click="validateReference" class="btn-validate">
          <i class="fas fa-check mr-2"></i>Validate
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isValidating" class="loading-overlay">
        <div class="spinner"></div>
        <p>Validating booking...</p>
      </div>
    </div>

    <!-- Booking Details Modal (after successful scan) -->
    <div v-if="scannedBooking" class="booking-details-modal">
      <div class="details-overlay" @click="closeScanResult"></div>
      <div class="details-container">
        <!-- Header -->
        <div class="details-header">
          <h2>Confirm Check-In</h2>
          <button class="close-btn" @click="closeScanResult">✕</button>
        </div>

        <!-- Booking Info -->
        <div class="booking-info">
          <!-- Guest Info -->
          <div class="info-section">
            <h3><i class="fas fa-user mr-2"></i>Guest Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Name</label>
                <p>{{ scannedBooking.guest_name }}</p>
              </div>
              <div class="info-item">
                <label>Email</label>
                <p>{{ scannedBooking.booking_email }}</p>
              </div>
              <div class="info-item">
                <label>Phone</label>
                <p>{{ scannedBooking.guest_phone || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Stay Details -->
          <div class="info-section">
            <h3><i class="fas fa-calendar mr-2"></i>Stay Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Check-In Date</label>
                <p>{{ formatDate(scannedBooking.check_in_date) }}</p>
              </div>
              <div class="info-item">
                <label>Check-Out Date</label>
                <p>{{ formatDate(scannedBooking.check_out_date) }}</p>
              </div>
              <div class="info-item">
                <label>Booking Reference</label>
                <p class="reference-badge">{{ scannedBooking.booking_reference }}</p>
              </div>
            </div>
          </div>

          <!-- Items Booked -->
          <div class="info-section">
            <h3><i class="fas fa-home mr-2"></i>Items Booked</h3>
            <div class="items-list">
              <div v-for="item in scannedBooking.items_list" :key="item.item_id" class="item-row">
                <span>{{ item.item_name }}</span>
                <span class="qty">×{{ item.qty }}</span>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="info-section">
            <div class="status-display">
              <label>Current Status</label>
              <span :class="getStatusClass(scannedBooking.booking_status)">
                {{ scannedBooking.booking_status }}
              </span>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="checkInError" class="error-message">
            <i class="fas fa-exclamation-circle mr-2"></i>{{ checkInError }}
          </div>

          <!-- Success Message -->
          <div v-if="checkInSuccess" class="success-message-large">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3>✅ Check-In Successful!</h3>
            <p>Guest {{ scannedBooking.guest_name }} has been checked in.</p>
            <small>Redirecting in 3 seconds...</small>
          </div>
        </div>

        <!-- Actions -->
        <div class="details-actions">
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
              <i class="fas fa-spinner fa-spin mr-2"></i>Processing...
            </span>
            <span v-else>
              <i class="fas fa-check-circle mr-2"></i>Confirm Check-In
            </span>
          </button>
          <button 
            v-else
            @click="resetScanner" 
            class="btn btn-primary"
          >
            <i class="fas fa-plus mr-2"></i>Scan Another
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'check-in-success'])

// State
const scanMode = ref('camera')
const manualReference = ref('')
const scannedBooking = ref(null)
const isValidating = ref(false)
const isCheckingIn = ref(false)
const scanError = ref('')
const checkInError = ref('')
const checkInSuccess = ref(false)

let html5QrCode = null

// Initialize scanner
const initScanner = async () => {
  try {
    // Destroy previous instance if it exists
    if (html5QrCode) {
      if (html5QrCode.isScanning) {
        await html5QrCode.stop()
      }
      html5QrCode.clear()
      html5QrCode = null
    }

    html5QrCode = new Html5Qrcode('qr-scanner')
    const cameras = await Html5Qrcode.getCameras()

    if (cameras && cameras.length) {
      await html5QrCode.start(
        cameras[0].id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      )
      scanError.value = ''
    } else {
      scanError.value = 'No camera found on this device'
    }
  } catch (err) {
    console.error('Scanner initialization error:', err)
    scanError.value = 'Unable to access camera. Please enable camera permissions.'
  }
}

const stopScanner = async () => {
  if (html5QrCode) {
    try {
      if (html5QrCode.isScanning) {
        await html5QrCode.stop()
      }
      html5QrCode.clear()
    } catch (err) {
      console.error('Error stopping scanner:', err)
    }
    html5QrCode = null
  }
}

const onScanSuccess = async (decodedText) => {
  if (!isValidating.value) {
    const bookingRef = decodedText.trim()
    await validateReference(bookingRef)
  }
}

const onScanError = (error) => {
  // Ignore constant scan errors, they fire every frame when no QR is detected
}

const validateReference = async (reference = null) => {
  const refToValidate = reference || manualReference.value

  if (!refToValidate.trim()) {
    scanError.value = 'Please enter a booking reference'
    return
  }

  isValidating.value = true
  scanError.value = ''
  checkInError.value = ''

  try {
    await stopScanner()

    const response = await fetch(
      `http://localhost:8000/api/bookings/validate/${encodeURIComponent(refToValidate)}`
    )

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const data = await response.json()

    if (!data.success) {
      checkInError.value = data.error || 'Booking not found'
      if (scanMode.value === 'camera') {
        await nextTick()
        await initScanner()
      }
      return
    }

    scannedBooking.value = data.data
    manualReference.value = ''
  } catch (error) {
    console.error('Validation error:', error)
    checkInError.value = error.message || 'Failed to validate booking'
    if (scanMode.value === 'camera') {
      await nextTick()
      await initScanner()
    }
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

  if (scanMode.value === 'camera') {
    await nextTick()
    await initScanner()
  }
}

const resetScanner = async () => {
  manualReference.value = ''
  scannedBooking.value = null
  checkInError.value = ''
  checkInSuccess.value = false
  scanError.value = ''
  scanMode.value = 'camera'

  await nextTick()
  await initScanner()
}

const closeScanner = async () => {
  await stopScanner()
  emit('close')
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
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

// Watch for modal open/close
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    await nextTick() // ← wait for DOM to render #qr-scanner
    await initScanner()
  } else {
    await stopScanner()
  }
})

// Watch for tab switching
watch(scanMode, async (newVal) => {
  if (newVal === 'camera') {
    await nextTick() // ← wait for DOM to render #qr-scanner
    await initScanner()
  } else {
    await stopScanner()
  }
})

onUnmounted(async () => {
  await stopScanner()
})
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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.scanner-container {
  position: relative;
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
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
  padding: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.scanner-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.scanner-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  color: #666;
}

.tab-btn.active {
  background: white;
  border-color: #667eea;
  color: #667eea;
}

.tab-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.scanner-content {
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.qr-scanner-box {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #000;
}

.scanner-hint {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.error-message {
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 0.5rem;
  color: #c00;
  font-size: 0.9rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.reference-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  transition: all 0.2s;
}

.reference-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-validate {
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-validate:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border-radius: 1rem;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Booking Details Modal */
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

.details-container {
  position: relative;
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: sticky;
  top: 0;
}

.details-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.booking-info {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-section h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  display: flex;
  align-items: center;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
}

.info-item p {
  margin: 0;
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

.reference-badge {
  display: inline-block;
  background: #f0f0f0;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.qty {
  color: #666;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-display {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-display label {
  font-weight: 600;
  color: #333;
}

.status-display span {
  padding: 0.35rem 0.85rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
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

.success-message {
  padding: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 0.5rem;
  color: #155724;
  font-size: 0.95rem;
  font-weight: 500;
}

.success-message-large {
  padding: 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 0.75rem;
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: successPulse 0.6s ease;
}

.success-message-large h3 {
  margin: 0.5rem 0 0 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.success-message-large p {
  margin: 0.5rem 0;
  font-size: 1rem;
  opacity: 0.95;
}

.success-message-large small {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 0.5rem;
}

.success-icon {
  font-size: 3rem;
  animation: iconBounce 0.6s ease;
}

@keyframes successPulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes iconBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.details-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  position: sticky;
  bottom: 0;
}

.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-outline {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .scanner-container {
    max-width: 100%;
    border-radius: 1rem 1rem 0 0;
  }

  .details-container {
    max-width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>