<template>
  <section>
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="text-sm text-gray-500">
        Showing <span class="font-semibold text-gray-800">{{ filteredBookings.length }}</span>
        <span v-if="filteredBookings.length !== bookings.length" class="text-blue-600"> of {{ bookings.length }}</span>
        reservation{{ bookings.length !== 1 ? 's' : '' }}
      </div>
      <button
        @click="showFilters = !showFilters"
        :class="['flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition border', hasActiveFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400']"
      >
        <i class="fas fa-filter text-xs"></i>
        Filters
        <span v-if="hasActiveFilters" class="bg-white text-blue-600 rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">{{ activeFilterCount }}</span>
      </button>
    </div>

    <!-- Filter Panel -->
    <transition name="filter-slide">
      <div v-show="showFilters" class="bg-white border border-blue-100 rounded-2xl shadow-sm p-4 mb-5 space-y-4">
        <!-- Row 1: Search + Status -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Search -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1"><i class="fas fa-search mr-1 text-blue-500"></i>Search</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Reference, item name…"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition"
            />
          </div>
          <!-- Status -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1"><i class="fas fa-tag mr-1 text-blue-500"></i>Booking Status</label>
            <select v-model="filters.status" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition bg-white">
              <option value="">All Statuses</option>
              <option v-for="s in uniqueStatuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <!-- Row 2: Date Range -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1"><i class="fas fa-calendar-alt mr-1 text-blue-500"></i>Check-in From</label>
            <input type="date" v-model="filters.dateFrom" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1"><i class="fas fa-calendar-check mr-1 text-blue-500"></i>Check-in To</label>
            <input type="date" v-model="filters.dateTo" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition" />
          </div>
        </div>

        <!-- Row 3: Amount Range + Sort -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1"><i class="fas fa-peso-sign mr-1 text-blue-500"></i>Min Amount (₱)</label>
            <input type="number" v-model.number="filters.amountMin" placeholder="0" min="0" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1"><i class="fas fa-peso-sign mr-1 text-blue-500"></i>Max Amount (₱)</label>
            <input type="number" v-model.number="filters.amountMax" placeholder="Any" min="0" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1"><i class="fas fa-sort mr-1 text-blue-500"></i>Sort By</label>
            <select v-model="filters.sortBy" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition bg-white">
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Amount: High → Low</option>
              <option value="amount_asc">Amount: Low → High</option>
            </select>
          </div>
        </div>

        <!-- Active filter tags + Clear -->
        <div v-if="hasActiveFilters" class="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
          <span class="text-xs text-gray-500 font-medium">Active:</span>
          <span v-if="filters.search" class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200">
            "{{ filters.search }}" <button @click="filters.search = ''" class="hover:text-blue-900"><i class="fas fa-times"></i></button>
          </span>
          <span v-if="filters.status" class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200">
            {{ filters.status }} <button @click="filters.status = ''" class="hover:text-blue-900"><i class="fas fa-times"></i></button>
          </span>
          <span v-if="filters.dateFrom" class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200">
            From {{ filters.dateFrom }} <button @click="filters.dateFrom = ''" class="hover:text-blue-900"><i class="fas fa-times"></i></button>
          </span>
          <span v-if="filters.dateTo" class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200">
            To {{ filters.dateTo }} <button @click="filters.dateTo = ''" class="hover:text-blue-900"><i class="fas fa-times"></i></button>
          </span>
          <span v-if="filters.amountMin" class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200">
            ≥ ₱{{ filters.amountMin.toLocaleString() }} <button @click="filters.amountMin = null" class="hover:text-blue-900"><i class="fas fa-times"></i></button>
          </span>
          <span v-if="filters.amountMax" class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200">
            ≤ ₱{{ filters.amountMax.toLocaleString() }} <button @click="filters.amountMax = null" class="hover:text-blue-900"><i class="fas fa-times"></i></button>
          </span>
          <button @click="clearFilters" class="ml-auto text-xs text-red-500 hover:text-red-700 font-medium transition">
            <i class="fas fa-times-circle mr-1"></i>Clear All
          </button>
        </div>
      </div>
    </transition>

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

      <!-- No Results after filtering -->
      <div v-else-if="filteredBookings.length === 0" class="bg-white shadow-sm rounded-2xl border border-blue-100 p-8 text-center">
        <i class="fas fa-filter text-4xl text-gray-300 mb-3"></i>
        <p class="text-gray-500 font-medium">No reservations match your filters.</p>
        <button @click="clearFilters" class="mt-3 text-sm text-blue-600 hover:underline font-medium">
          <i class="fas fa-times-circle mr-1"></i>Clear Filters
        </button>
      </div>

      <!-- Booking Cards -->
      <div v-for="booking in filteredBookings" :key="booking.booking_id" class="bg-white shadow-sm rounded-2xl border border-blue-100 overflow-hidden hover:shadow-md transition">
        
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
    </div>
  </section>
</template>

<script>
import QRCode from 'qrcode';
import { useAuthStore } from '../../stores/auth';

export default {
  name: 'CustomerReservationsSection',
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
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
      qrCodeCache: {},
      showFilters: false,
      filters: {
        search: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        amountMin: null,
        amountMax: null,
        sortBy: 'date_desc'
      }
    };
  },
  computed: {
    uniqueStatuses() {
      const statuses = this.bookings.map(b => b.booking_status).filter(Boolean);
      return [...new Set(statuses)].sort();
    },
    hasActiveFilters() {
      const f = this.filters;
      return !!(f.search || f.status || f.dateFrom || f.dateTo || f.amountMin || f.amountMax);
    },
    activeFilterCount() {
      const f = this.filters;
      return [f.search, f.status, f.dateFrom, f.dateTo, f.amountMin, f.amountMax].filter(Boolean).length;
    },
    filteredBookings() {
      const f = this.filters;
      let result = [...this.bookings];

      // Search: booking reference OR any item name
      if (f.search) {
        const q = f.search.toLowerCase();
        result = result.filter(b =>
          (b.booking_reference || '').toLowerCase().includes(q) ||
          (b.items || []).some(item => (item.item_name || '').toLowerCase().includes(q))
        );
      }

      // Booking status
      if (f.status) {
        result = result.filter(b => b.booking_status === f.status);
      }

      // Date from (check-in >= dateFrom)
      if (f.dateFrom) {
        const from = new Date(f.dateFrom);
        result = result.filter(b => b.check_in_date && new Date(b.check_in_date) >= from);
      }

      // Date to (check-in <= dateTo)
      if (f.dateTo) {
        const to = new Date(f.dateTo);
        to.setHours(23, 59, 59, 999);
        result = result.filter(b => b.check_in_date && new Date(b.check_in_date) <= to);
      }

      // Amount min
      if (f.amountMin !== null && f.amountMin !== '') {
        result = result.filter(b => (b.total || 0) >= f.amountMin);
      }

      // Amount max
      if (f.amountMax !== null && f.amountMax !== '') {
        result = result.filter(b => (b.total || 0) <= f.amountMax);
      }

      // Sort
      result.sort((a, b) => {
        switch (f.sortBy) {
          case 'date_asc':    return new Date(a.created_at) - new Date(b.created_at);
          case 'amount_desc': return (b.total || 0) - (a.total || 0);
          case 'amount_asc':  return (a.total || 0) - (b.total || 0);
          default:            return new Date(b.created_at) - new Date(a.created_at); // date_desc
        }
      });

      return result;
    }
  },
  methods: {
    clearFilters() {
      this.filters = {
        search: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        amountMin: null,
        amountMax: null,
        sortBy: 'date_desc'
      };
    },
    async fetchBookingHistory() {
      try {
        this.loading = true;
        this.error = null;

        // Priority 1: use Pinia auth store (set at login, always in sync)
        // Priority 2: fall back to localStorage 'user' key (set by LoginForm.vue)
        const userId = this.auth?.user?.id || null;
        let email = this.auth?.user?.email || null;

        if (!email) {
          try {
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            email = stored.email || null;
          } catch (e) { /* ignore parse errors */ }
        }

        let url;
        if (userId) {
          // Best path: query directly by user_id — no email ambiguity
          url = `http://localhost:8000/api/bookings/user/${userId}/history`;
          console.log(`🔑 Fetching bookings for user_id: ${userId}`);
        } else if (email) {
          // Fallback: query by email
          url = `http://localhost:8000/api/bookings/email/${encodeURIComponent(email)}/history`;
          console.log(`📧 Fetching bookings for email: ${email}`);
        } else {
          this.error = 'Please log in to view your reservations.';
          this.loading = false;
          return;
        }

        const response = await fetch(url);
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
    // Auto-poll every 30 seconds so data stays fresh
    this._pollInterval = setInterval(() => {
      this.fetchBookingHistory();
    }, 30000);
  },
  beforeUnmount() {
    if (this._pollInterval) {
      clearInterval(this._pollInterval);
      this._pollInterval = null;
    }
  }
};
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.filter-slide-enter-active,
.filter-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.filter-slide-enter-from,
.filter-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.filter-slide-enter-to,
.filter-slide-leave-from {
  opacity: 1;
  max-height: 600px;
}
</style>
