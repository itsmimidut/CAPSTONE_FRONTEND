<template>
  <section>
<<<<<<< HEAD
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div class="text-sm text-gray-500 items-left">Total: <span class="font-semibold text-gray-800">{{ bookings.length }}</span></div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white shadow-sm rounded-2xl border border-blue-100 p-8 text-center">
      <div class="inline-block">
        <div class="animate-spin h-8 w-8 border-4 border-blue-300 border-t-blue-600 rounded-full"></div>
      </div>
      <p class="text-gray-500 mt-4">Loading your reservations...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
      <p class="text-red-700 text-sm"><i class="fas fa-exclamation-circle mr-2"></i>{{ error }}</p>
    </div>

    <!-- Bookings List -->
    <div v-else class="space-y-4">
      <!-- No Bookings -->
      <div v-if="bookings.length === 0" class="bg-white shadow-sm rounded-2xl border border-blue-100 p-8 text-center">
        <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
        <p class="text-gray-500">No reservations found. Start your adventure!</p>
      </div>

      <!-- Booking Cards -->
      <div v-for="booking in bookings" :key="booking.booking_id" class="bg-white shadow-sm rounded-2xl border border-blue-100 overflow-hidden hover:shadow-md transition">
        
        <!-- Booking Header -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-blue-200">
          <div class="flex items-center justify-between mb-2">
            <div>
              <p class="text-xs text-blue-600 font-semibold uppercase">Booking Reference</p>
              <p class="text-lg font-bold text-gray-800">{{ booking.booking_reference }}</p>
            </div>
            <span 
              :class="['px-3 py-1 rounded-full text-xs font-semibold', getStatusClass(booking.booking_status)]"
            >
              {{ booking.booking_status }}
            </span>
          </div>
        </div>

        <!-- Booking Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-gray-200">
          <!-- Left Column: Dates and Items -->
          <div class="space-y-4">
            <!-- Check-in/Check-out -->
            <div v-if="booking.check_in_date" class="space-y-2">
              <p class="text-xs font-semibold text-gray-600 uppercase">📅 Dates</p>
              <div class="flex items-center gap-2">
                <div class="flex-1">
                  <p class="text-xs text-gray-600">Check-in</p>
                  <p class="font-medium text-gray-800">{{ formatDate(booking.check_in_date) }}</p>
                </div>
                <i class="fas fa-arrow-right text-gray-400"></i>
                <div class="flex-1">
                  <p class="text-xs text-gray-600">Check-out</p>
                  <p class="font-medium text-gray-800">{{ formatDate(booking.check_out_date) }}</p>
                </div>
              </div>
            </div>

            <!-- Items -->
            <div class="space-y-2">
              <p class="text-xs font-semibold text-gray-600 uppercase">🏠 Items Booked</p>
              <div class="space-y-1">
                <div v-for="(item, idx) in booking.items" :key="idx" class="text-sm text-gray-700 flex justify-between">
                  <div>
                    <span class="font-medium">{{ item.item_name }}</span>
                    <span class="text-gray-500 text-xs"> (×{{ item.quantity }})</span>
                  </div>
                  <span class="text-gray-600 font-medium">₱{{ item.total_price?.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p class="text-sm text-blue-700 font-semibold">
                Total: <span class="text-lg">₱{{ booking.total.toLocaleString() }}</span>
              </p>
            </div>
          </div>

          <!-- Right Column: QR Code -->
          <div class="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-xs font-semibold text-blue-700 mb-3">📱 QR Code</p>
            
            <!-- QR Code Display -->
            <div v-if="booking.qrCode" class="mb-3">
              <img 
                :src="getQRCode(booking.booking_reference)"
                :alt="`QR Code for ${booking.booking_reference}`"
                class="w-32 h-32 border-2 border-white rounded-lg shadow-sm"
                @error="onQRError"
              >
            </div>
            <p class="text-xs text-blue-600 text-center mb-3">Show at check-in</p>
            
            <!-- QR Actions -->
            <div class="flex gap-2 w-full">
              <button 
                class="flex-1 text-xs px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                @click="downloadQRCode(booking.booking_reference)"
              >
                <i class="fas fa-download mr-1"></i>Save
              </button>
              <button 
                class="flex-1 text-xs px-2 py-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                @click="viewQRCode(booking.booking_reference)"
              >
                <i class="fas fa-eye mr-1"></i>View
              </button>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm">
          <div class="text-gray-600">
            <span v-if="booking.payment_status" :class="getPaymentStatusClass(booking.payment_status)">
              <i :class="getPaymentIcon(booking.payment_status)" class="mr-1"></i>
              {{ booking.payment_status }}
            </span>
          </div>
          <span class="text-xs text-gray-500">Booked on {{ formatDate(booking.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- QR Viewer Modal -->
    <div v-if="showQRViewer" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-800">Booking QR Code</h3>
          <button @click="showQRViewer = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="bg-blue-50 p-6 rounded-lg flex justify-center mb-4">
          <img 
            :src="currentQRCode"
            :alt="currentQRReference"
            class="w-48 h-48 border-2 border-white rounded-lg"
          >
        </div>

        <div class="bg-gray-100 rounded-lg p-3 mb-4 text-center">
          <p class="text-xs text-gray-600">Reference</p>
          <p class="font-bold text-gray-800">{{ currentQRReference }}</p>
        </div>

        <div class="flex gap-2">
          <button 
            @click="downloadQRCode(currentQRReference)"
            class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            <i class="fas fa-download mr-2"></i>Download
          </button>
          <button 
            @click="showQRViewer = false"
            class="flex-1 px-4 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
=======
    <div class="flex flex-wrap items-center justify-end gap-3 mb-3">
      <div class="text-sm text-gray-500">
        Total: <span class="font-semibold text-gray-800">{{ reservations.length }}</span>
      </div>
    </div>

    <div class="bg-white shadow-sm rounded-2xl border border-blue-100 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-blue-50 text-blue-900">
          <tr>
            <th class="px-4 sm:px-6 py-2.5 text-xs uppercase tracking-wide font-extrabold">Room Type</th>
            <th class="px-4 sm:px-6 py-2.5 text-xs uppercase tracking-wide font-extrabold">Check-in</th>
            <th class="px-4 sm:px-6 py-2.5 text-xs uppercase tracking-wide font-extrabold">Check-out</th>
            <th class="px-4 sm:px-6 py-2.5 text-xs uppercase tracking-wide font-extrabold">Status</th>
          </tr>
        </thead>

        <tbody class="bg-white">
          <tr v-if="reservations.length === 0">
            <td colspan="4" class="px-4 sm:px-6 py-8 text-center text-gray-400">No reservations found.</td>
          </tr>

          <tr
            v-for="row in reservations"
            :key="row.roomType + row.checkIn"
            class="border-b border-blue-100/70 bg-white hover:bg-blue-50/40 transition"
          >
            <td class="px-4 sm:px-6 py-2.5 font-semibold text-gray-900">
              {{ row.roomType }}
            </td>
            <td class="px-4 sm:px-6 py-2.5 text-gray-600 whitespace-nowrap">
              {{ row.checkIn }}
            </td>
            <td class="px-4 sm:px-6 py-2.5 text-gray-600 whitespace-nowrap">
              {{ row.checkOut }}
            </td>
            <td class="px-4 sm:px-6 py-2.5">
              <span
                class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700"
                :class="row.statusClass"
              >
                {{ row.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
>>>>>>> 2829b61470aabef8517c64e175c13455e10fbeb0
    </div>
  </section>
</template>

<script>
import QRCode from 'qrcode';

export default {
  name: 'CustomerReservationsSection',
  props: {
    customerId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      bookings: [],
      loading: true,
      error: null,
      showQRViewer: false,
      currentQRCode: null,
      currentQRReference: null,
      qrCodeCache: {}
    };
  },
  methods: {
    async fetchBookingHistory() {
      try {
        this.loading = true;
        this.error = null;

        // Get email from localStorage
        let email = null;
        let stored = {};
        try {
          stored = JSON.parse(
            localStorage.getItem('user') || 
            localStorage.getItem('userProfile') || 
            localStorage.getItem('userData') || 
            '{}'
          ) || {};
        } catch (e) {
          stored = {};
        }

        // Extract email from stored data
        email = stored.email || null;

        if (!email) {
          this.error = 'Email not found. Please log in.';
          this.loading = false;
          return;
        }

        // Fetch booking history by email
        console.log(`📧 Fetching bookings for email: ${email}`);
        const encodedEmail = encodeURIComponent(email);
        const response = await fetch(`http://localhost:8000/api/bookings/email/${encodedEmail}/history`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load bookings');
        }

        this.bookings = data.data.bookings || [];
        console.log('✅ Loaded bookings:', this.bookings);

      } catch (error) {
        console.error('Error fetching bookings:', error);
        this.error = error.message || 'Failed to load your reservations. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async getQRCode(bookingReference) {
      // Check cache first
      if (this.qrCodeCache[bookingReference]) {
        return this.qrCodeCache[bookingReference];
      }

      try {
        // Generate QR code on frontend from booking reference
        const qrCodeData = await QRCode.toDataURL(bookingReference, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 200,
          margin: 1,
          color: {
            dark: '#2B6CB0',
            light: '#FFFFFF'
          }
        });
        this.qrCodeCache[bookingReference] = qrCodeData;
        return qrCodeData;
      } catch (error) {
        console.warn('Failed to generate QR code for', bookingReference, error);
      }

      return null;
    },

    onQRError(event) {
      console.warn('Failed to load QR code image');
      event.target.style.display = 'none';
    },

    async viewQRCode(bookingReference) {
      this.currentQRReference = bookingReference;
      this.currentQRCode = await this.getQRCode(bookingReference);
      this.showQRViewer = true;
    },

    async downloadQRCode(bookingReference) {
      try {
        const qrCodeData = await this.getQRCode(bookingReference);
        
        if (!qrCodeData) {
          alert('QR code not available');
          return;
        }

        // Create download link
        const link = document.createElement('a');
        link.href = qrCodeData;
        link.download = `${bookingReference}-qr-code.png`;
        link.click();
      } catch (error) {
        console.error('Error downloading QR code:', error);
        alert('Failed to download QR code');
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },

    getStatusClass(status) {
      const classes = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Confirmed': 'bg-green-100 text-green-800',
        'Completed': 'bg-blue-100 text-blue-800',
        'Cancelled': 'bg-red-100 text-red-800'
      };
      return classes[status] || 'bg-gray-100 text-gray-800';
    },

    getPaymentIcon(status) {
      const icons = {
        'paid': 'fas fa-check-circle text-green-600',
        'pending': 'fas fa-clock text-yellow-600',
        'failed': 'fas fa-times-circle text-red-600'
      };
      return icons[status] || 'fas fa-question-circle text-gray-600';
    },

    getPaymentStatusClass(status) {
      const classes = {
        'paid': 'text-green-700 font-semibold',
        'pending': 'text-yellow-700 font-semibold',
        'failed': 'text-red-700 font-semibold'
      };
      return classes[status] || 'text-gray-700';
    }
  },

  mounted() {
    this.fetchBookingHistory();
  }
};
</script>

<style scoped>
<<<<<<< HEAD
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
=======
/* Apply SAME Tropical Resort Palette (Color-only)
   - Ocean Blue (primary):    #1E88B6
   - Ocean Blue (light):      #4AA3D0
   - Ocean Blue (dark):       #166B8F
   - Ocean Blue (pale):       #E3F2F9
   - Sunflower Gold (accent): #F2C200
   - Sunflower Gold (light):  #FFD633
   - Sunflower Gold (dark):   #C99F00
   - Text on dark:            #FFFFFF
   - Text on light:           #0B2230
*/
</style>
>>>>>>> 2829b61470aabef8517c64e175c13455e10fbeb0
