<template>
  <section>
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
