<template>
  <section class="reservations-section">

    <!-- ══════════════════════════════════════════ -->
    <!-- TOP BAR — count + filter toggle            -->
    <!-- ══════════════════════════════════════════ -->
    <div class="top-bar">
      <p class="results-count">
        Showing
        <strong>{{ filteredBookings.length }}</strong>
        <span v-if="filteredBookings.length !== bookings.length" class="of-total">
          of {{ bookings.length }}
        </span>
        reservation{{ bookings.length !== 1 ? 's' : '' }}
      </p>

      <button
        class="filter-toggle-btn"
        :class="{ active: showFilters || hasActiveFilters }"
        @click="showFilters = !showFilters"
      >
        <i class="fas fa-sliders-h"></i>
        Filters
        <span v-if="hasActiveFilters" class="filter-badge">{{ activeFilterCount }}</span>
      </button>
    </div>

    <!-- ══════════════════════════════════════════ -->
    <!-- FILTER PANEL                               -->
    <!-- ══════════════════════════════════════════ -->
    <transition name="filter-slide">
      <div v-show="showFilters" class="filter-panel">

        <!-- Row 1: Search + Status -->
        <div class="filter-grid-2">
          <div class="filter-group">
            <label class="filter-label"><i class="fas fa-search"></i> Search</label>
            <div class="input-wrap">
              <i class="fas fa-search fi"></i>
              <input v-model="filters.search" type="text" class="filter-input" placeholder="Reference, item name…" />
              <button v-if="filters.search" class="input-clear" @click="filters.search = ''"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <div class="filter-group">
            <label class="filter-label"><i class="fas fa-tag"></i> Booking Status</label>
            <div class="input-wrap">
              <i class="fas fa-tag fi"></i>
              <select v-model="filters.status" class="filter-input filter-select">
                <option value="">All Statuses</option>
                <option v-for="s in uniqueStatuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Row 2: Date Range -->
        <div class="filter-grid-2">
          <div class="filter-group">
            <label class="filter-label"><i class="fas fa-calendar-alt"></i> Check-in From</label>
            <div class="input-wrap">
              <i class="fas fa-calendar-alt fi"></i>
              <input type="date" v-model="filters.dateFrom" class="filter-input date-input" />
            </div>
          </div>
          <div class="filter-group">
            <label class="filter-label"><i class="fas fa-calendar-check"></i> Check-in To</label>
            <div class="input-wrap">
              <i class="fas fa-calendar-check fi"></i>
              <input type="date" v-model="filters.dateTo" class="filter-input date-input" />
            </div>
          </div>
        </div>

        <!-- Row 3: Amount + Sort -->
        <div class="filter-grid-3">
          <div class="filter-group">
            <label class="filter-label"><i class="fas fa-peso-sign"></i> Min Amount</label>
            <div class="input-wrap">
              <i class="fas fa-peso-sign fi"></i>
              <input type="number" v-model.number="filters.amountMin" placeholder="0" min="0" class="filter-input" />
            </div>
          </div>
          <div class="filter-group">
            <label class="filter-label"><i class="fas fa-peso-sign"></i> Max Amount</label>
            <div class="input-wrap">
              <i class="fas fa-peso-sign fi"></i>
              <input type="number" v-model.number="filters.amountMax" placeholder="Any" min="0" class="filter-input" />
            </div>
          </div>
          <div class="filter-group">
            <label class="filter-label"><i class="fas fa-sort"></i> Sort By</label>
            <div class="input-wrap">
              <i class="fas fa-sort fi"></i>
              <select v-model="filters.sortBy" class="filter-input filter-select">
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="amount_desc">Amount: High → Low</option>
                <option value="amount_asc">Amount: Low → High</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Active filter tags -->
        <div v-if="hasActiveFilters" class="active-tags">
          <span class="tags-label">Active:</span>
          <span v-if="filters.search" class="filter-tag">
            "{{ filters.search }}"
            <button @click="filters.search = ''"><i class="fas fa-times"></i></button>
          </span>
          <span v-if="filters.status" class="filter-tag">
            {{ filters.status }}
            <button @click="filters.status = ''"><i class="fas fa-times"></i></button>
          </span>
          <span v-if="filters.dateFrom" class="filter-tag">
            From {{ filters.dateFrom }}
            <button @click="filters.dateFrom = ''"><i class="fas fa-times"></i></button>
          </span>
          <span v-if="filters.dateTo" class="filter-tag">
            To {{ filters.dateTo }}
            <button @click="filters.dateTo = ''"><i class="fas fa-times"></i></button>
          </span>
          <span v-if="filters.amountMin" class="filter-tag">
            ≥ ₱{{ filters.amountMin.toLocaleString() }}
            <button @click="filters.amountMin = null"><i class="fas fa-times"></i></button>
          </span>
          <span v-if="filters.amountMax" class="filter-tag">
            ≤ ₱{{ filters.amountMax.toLocaleString() }}
            <button @click="filters.amountMax = null"><i class="fas fa-times"></i></button>
          </span>
          <button class="clear-all-btn" @click="clearFilters">
            <i class="fas fa-times-circle"></i> Clear All
          </button>
        </div>

      </div>
    </transition>

    <!-- ══════════════════════════════════════════ -->
    <!-- STATES                                     -->
    <!-- ══════════════════════════════════════════ -->

    <!-- Loading -->
    <div v-if="loading" class="state-container">
      <div class="resort-spinner">
        <div v-for="n in 4" :key="n" class="spinner-wave" :style="`animation-delay:${(n-1)*0.15}s`"></div>
      </div>
      <p class="state-text">Loading your reservations…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-container">
      <div class="state-icon error-icon"><i class="fas fa-exclamation-circle"></i></div>
      <p class="state-title">Something went wrong</p>
      <p class="state-text">{{ error }}</p>
    </div>

    <!-- No bookings -->
    <div v-else-if="bookings.length === 0" class="state-container">
      <div class="state-icon"><i class="fas fa-suitcase-rolling"></i></div>
      <p class="state-title">No reservations yet</p>
      <p class="state-text">Start your adventure at Eduardo's Resort!</p>
    </div>

    <!-- No filter results -->
    <div v-else-if="filteredBookings.length === 0" class="state-container">
      <div class="state-icon"><i class="fas fa-filter"></i></div>
      <p class="state-title">No matching reservations</p>
      <p class="state-text">Try adjusting or clearing your filters.</p>
      <button class="ghost-btn" @click="clearFilters">
        <i class="fas fa-times-circle"></i> Clear Filters
      </button>
    </div>

    <!-- ══════════════════════════════════════════ -->
    <!-- BOOKING CARDS                              -->
    <!-- ══════════════════════════════════════════ -->
    <div v-else class="bookings-list">
      <div
        v-for="(booking, idx) in filteredBookings"
        :key="booking.booking_id"
        class="booking-card"
        :style="`animation-delay:${idx * 0.06}s`"
      >

        <!-- Card Header -->
        <div class="booking-card-header">
          <div class="header-left">
            <div class="ref-icon-wrap"><i class="fas fa-file-invoice"></i></div>
            <div class="ref-info">
              <p class="ref-label">Booking Reference</p>
              <p class="ref-value">{{ booking.booking_reference }}</p>
            </div>
          </div>
          <div class="header-right">
            <span class="status-chip" :class="getStatusChipClass(booking.booking_status)">
              <span class="status-dot"></span>
              {{ booking.booking_status }}
            </span>
          </div>
        </div>

        <!-- Card Body — 2-column: details + QR -->
        <div class="booking-card-body">

          <!-- LEFT: Dates + Items + Total -->
          <div class="detail-col">

            <!-- Dates -->
            <div v-if="booking.check_in_date" class="detail-block">
              <p class="detail-block-label"><i class="fas fa-calendar-alt"></i> Dates</p>
              <div class="dates-strip">
                <div class="date-item">
                  <p class="date-sub">Check-in</p>
                  <p class="date-val">{{ formatDate(booking.check_in_date) }}</p>
                </div>
                <div class="dates-arrow"><i class="fas fa-arrow-right"></i></div>
                <div class="date-item">
                  <p class="date-sub">Check-out</p>
                  <p class="date-val">{{ formatDate(booking.check_out_date) }}</p>
                </div>
              </div>
            </div>

            <!-- Items -->
            <div class="detail-block">
              <p class="detail-block-label"><i class="fas fa-concierge-bell"></i> Items Booked</p>
              <div class="items-list">
                <div v-for="(item, i) in booking.items" :key="i" class="item-row">
                  <div class="item-avatar">{{ item.item_name?.charAt(0) || '?' }}</div>
                  <span class="item-name">{{ item.item_name }}</span>
                  <span class="item-qty">×{{ item.quantity }}</span>
                  <span class="item-price">₱{{ item.total_price?.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="total-pill">
              <span class="total-label">Total</span>
              <span class="total-val">₱{{ (Number(booking.total) || 0).toLocaleString() }}</span>
            </div>

          </div>

          <!-- RIGHT: QR Code -->
          <div class="qr-col">
            <p class="qr-label"><i class="fas fa-qrcode"></i> QR Code</p>

            <div class="qr-frame" v-if="getQRCode(booking.booking_reference)">
              <img
                :src="getQRCode(booking.booking_reference)"
                :alt="`QR ${booking.booking_reference}`"
                class="qr-image"
                @error="onQRError($event, booking.booking_reference)"
              />
            </div>
            <div v-else class="qr-placeholder">
              <i class="fas fa-qrcode"></i>
            </div>

            <p class="qr-hint">Show at check-in</p>

            <div class="qr-actions">
              <button class="qr-btn primary-qr" @click="downloadQRCode(booking.booking_reference)">
                <i class="fas fa-download"></i> Save
              </button>
              <button class="qr-btn ghost-qr" @click="viewQRCode(booking.booking_reference)">
                <i class="fas fa-eye"></i> View
              </button>
            </div>
          </div>

        </div>

        <!-- Card Footer — payment info -->
        <div class="booking-card-footer">
          <span v-if="booking.payment_status" class="payment-status" :class="getPaymentStatusClass(booking.payment_status)">
            <i :class="getPaymentIcon(booking.payment_status)"></i>
            {{ booking.payment_status }}
          </span>
          <span class="booked-on">Booked on {{ formatDate(booking.created_at) }}</span>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════ -->
    <!-- QR VIEWER MODAL                            -->
    <!-- ══════════════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="showQRViewer" class="modal-overlay" @click.self="showQRViewer = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3 class="modal-title">Booking QR Code</h3>
            <button class="modal-close" @click="showQRViewer = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-qr-wrap">
            <img :src="currentQRCode" :alt="currentQRReference" class="modal-qr-img" />
          </div>

          <div class="modal-ref">
            <p class="modal-ref-label">Reference</p>
            <p class="modal-ref-val">{{ currentQRReference }}</p>
          </div>

          <div class="modal-actions">
            <button class="modal-primary-btn" @click="downloadQRCode(currentQRReference)">
              <i class="fas fa-download"></i> Download
            </button>
            <button class="modal-ghost-btn" @click="showQRViewer = false">Close</button>
          </div>
        </div>
      </div>
    </transition>

  </section>
</template>

<script>
import QRCode from 'qrcode'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'CustomerReservationsSection',
  setup() {
    const auth = useAuthStore()
    return { auth }
  },
  props: {
    customerId: { type: [String, Number], default: null }
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
        search: '', status: '',
        dateFrom: '', dateTo: '',
        amountMin: null, amountMax: null,
        sortBy: 'date_desc'
      }
    }
  },
  computed: {
    uniqueStatuses() {
      return [...new Set(this.bookings.map(b => b.booking_status).filter(Boolean))].sort()
    },
    hasActiveFilters() {
      const f = this.filters
      return !!(f.search || f.status || f.dateFrom || f.dateTo || f.amountMin || f.amountMax)
    },
    activeFilterCount() {
      const f = this.filters
      return [f.search, f.status, f.dateFrom, f.dateTo, f.amountMin, f.amountMax].filter(Boolean).length
    },
    filteredBookings() {
      const f = this.filters
      let result = [...this.bookings]

      if (f.search) {
        const q = f.search.toLowerCase()
        result = result.filter(b =>
          (b.booking_reference || '').toLowerCase().includes(q) ||
          (b.items || []).some(i => (i.item_name || '').toLowerCase().includes(q))
        )
      }
      if (f.status) result = result.filter(b => b.booking_status === f.status)
      if (f.dateFrom) {
        const from = new Date(f.dateFrom)
        result = result.filter(b => b.check_in_date && new Date(b.check_in_date) >= from)
      }
      if (f.dateTo) {
        const to = new Date(f.dateTo); to.setHours(23,59,59,999)
        result = result.filter(b => b.check_in_date && new Date(b.check_in_date) <= to)
      }
      if (f.amountMin !== null && f.amountMin !== '') result = result.filter(b => (b.total || 0) >= f.amountMin)
      if (f.amountMax !== null && f.amountMax !== '') result = result.filter(b => (b.total || 0) <= f.amountMax)

      result.sort((a, b) => {
        switch (f.sortBy) {
          case 'date_asc':    return new Date(a.created_at) - new Date(b.created_at)
          case 'amount_desc': return (b.total || 0) - (a.total || 0)
          case 'amount_asc':  return (a.total || 0) - (b.total || 0)
          default:            return new Date(b.created_at) - new Date(a.created_at)
        }
      })
      return result
    }
  },
  methods: {
    clearFilters() {
      this.filters = { search: '', status: '', dateFrom: '', dateTo: '', amountMin: null, amountMax: null, sortBy: 'date_desc' }
    },

    async fetchBookingHistory() {
      try {
        this.loading = true; this.error = null
        const userId = this.auth?.user?.id || null
        let email = this.auth?.user?.email || null
        if (!email) {
          try { email = JSON.parse(localStorage.getItem('user') || '{}').email || null } catch {}
        }
        let url
        if (userId)      url = `http://localhost:8000/api/bookings/user/${userId}/history`
        else if (email)  url = `http://localhost:8000/api/bookings/email/${encodeURIComponent(email)}/history`
        else { this.error = 'Please log in to view your reservations.'; this.loading = false; return }

        const res  = await fetch(url)
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Failed to load bookings')
        this.bookings = data.data.bookings || []
        await this.preloadQRCodes(this.bookings)
      } catch (err) {
        this.error = err.message || 'Failed to load your reservations. Please try again.'
      } finally {
        this.loading = false
      }
    },

    async generateQRCode(ref) {
      try {
        return await QRCode.toDataURL(ref, {
          errorCorrectionLevel: 'H', type: 'image/png', width: 200, margin: 1,
          color: { dark: '#0C3B5E', light: '#FFFFFF' }
        })
      } catch { return null }
    },

    async preloadQRCodes(bookings = []) {
      await Promise.all(
        bookings.map(b => b?.booking_reference).filter(Boolean).filter(r => !this.qrCodeCache[r])
          .map(async ref => { const qr = await this.generateQRCode(ref); if (qr) this.qrCodeCache[ref] = qr })
      )
    },

    getQRCode(ref) { return this.qrCodeCache[ref] || null },

    onQRError(event, ref) { if (ref) delete this.qrCodeCache[ref]; event.target.style.display = 'none' },

    async viewQRCode(ref) {
      this.currentQRReference = ref
      let qr = this.getQRCode(ref)
      if (!qr) { qr = await this.generateQRCode(ref); if (qr) this.qrCodeCache[ref] = qr }
      this.currentQRCode = qr
      this.showQRViewer = true
    },

    async downloadQRCode(ref) {
      let qr = this.getQRCode(ref)
      if (!qr) { qr = await this.generateQRCode(ref); if (qr) this.qrCodeCache[ref] = qr }
      if (!qr) { alert('QR code not available'); return }
      const a = document.createElement('a'); a.href = qr; a.download = `${ref}-qr-code.png`; a.click()
    },

    formatDate(d) {
      if (!d) return 'N/A'
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },

    getStatusChipClass(status) {
      return {
        'Pending':   'chip-pending',
        'Confirmed': 'chip-confirmed',
        'Completed': 'chip-completed',
        'Cancelled': 'chip-cancelled'
      }[status] || 'chip-default'
    },

    getPaymentIcon(status) {
      return { paid: 'fas fa-check-circle', pending: 'fas fa-clock', failed: 'fas fa-times-circle' }[status] || 'fas fa-question-circle'
    },

    getPaymentStatusClass(status) {
      return { paid: 'pay-paid', pending: 'pay-pending', failed: 'pay-failed' }[status] || 'pay-default'
    }
  },

  mounted() {
    this.fetchBookingHistory()
    this._pollInterval = setInterval(() => { if (!document.hidden) this.fetchBookingHistory() }, 5000)
  },
  beforeUnmount() { clearInterval(this._pollInterval); this._pollInterval = null }
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

.reservations-section {
  font-family: Inter, 'Segoe UI', system-ui, sans-serif;
  color: #1f2937;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Top Bar ────────────────────────────────────────────────── */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: #fff;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  padding: 0.62rem 0.9rem;
}

.results-count { font-size: 0.83rem; color: #6b7280; }
.results-count strong { color: #0C3B5E; font-weight: 800; }
.of-total { color: #0369a1; font-weight: 600; }

.filter-toggle-btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.48rem 1rem;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 50px;
  font-family: inherit; font-size: 0.8rem; font-weight: 700;
  color: #6b7280; cursor: pointer;
  transition: all 0.2s;
}

.filter-toggle-btn:hover { border-color: #0369a1; color: #0369a1; background: #eff6ff; }

.filter-toggle-btn.active {
  background: #0369a1; border-color: #0369a1; color: #fff;
}

.filter-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  background: #F4C400; color: #0C3B5E;
  border-radius: 50%; font-size: 0.65rem; font-weight: 800;
}

/* ── Filter Panel ───────────────────────────────────────────── */
.filter-panel {
  background: #fff;
  border: 1px solid #dbeafe;
  border-top: 2px solid #F4C400;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  box-shadow: 0 2px 8px rgba(3,105,161,0.06);
}

.filter-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.filter-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }

.filter-group { display: flex; flex-direction: column; gap: 0.32rem; }

.filter-label {
  font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.07em;
  color: #0C3B5E;
  display: flex; align-items: center; gap: 0.3rem;
}

.input-wrap { position: relative; display: flex; align-items: center; }

.fi {
  position: absolute; left: 0.72rem;
  color: #0369a1; font-size: 0.7rem; pointer-events: none;
}

.filter-input {
  width: 100%;
  padding: 0.52rem 0.8rem 0.52rem 2.1rem;
  border: 1.5px solid #dbeafe;
  border-radius: 8px;
  font-family: inherit; font-size: 0.83rem;
  color: #1f2937; background: #f0f7ff;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  outline: none;
}

.filter-input:focus {
  border-color: #0369a1; background: #fff;
  box-shadow: 0 0 0 3px rgba(3,105,161,0.1);
}

.filter-select { appearance: none; cursor: pointer; }
.date-input    { cursor: pointer; }

.input-clear {
  position: absolute; right: 0.6rem;
  background: none; border: none;
  color: #9ca3af; font-size: 0.7rem; cursor: pointer;
  transition: color 0.15s; padding: 2px;
}
.input-clear:hover { color: #0369a1; }

/* Active tags */
.active-tags {
  display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;
  padding-top: 0.65rem; border-top: 1px solid #dbeafe;
}

.tags-label { font-size: 0.72rem; font-weight: 700; color: #6b7280; }

.filter-tag {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: #eff6ff; color: #0369a1;
  border: 1px solid #bfdbfe;
  border-radius: 20px; padding: 0.18rem 0.6rem;
  font-size: 0.72rem; font-weight: 600;
}

.filter-tag button {
  background: none; border: none; color: #93c5fd;
  font-size: 0.6rem; cursor: pointer; padding: 0;
  transition: color 0.15s;
}
.filter-tag button:hover { color: #0369a1; }

.clear-all-btn {
  margin-left: auto;
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: none; border: none;
  font-family: inherit; font-size: 0.75rem; font-weight: 600;
  color: #ef4444; cursor: pointer; transition: color 0.15s;
}
.clear-all-btn:hover { color: #dc2626; }

/* Filter slide transition */
.filter-slide-enter-active,
.filter-slide-leave-active { transition: all 0.25s ease; overflow: hidden; }
.filter-slide-enter-from,
.filter-slide-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.filter-slide-enter-to,
.filter-slide-leave-from { opacity: 1; max-height: 600px; }

/* ── State containers ───────────────────────────────────────── */
.state-container {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 4rem 1.5rem; gap: 0.85rem; text-align: center;
  background: #fff; border-radius: 14px; border: 1px solid #dbeafe;
}

.state-icon {
  width: 56px; height: 56px; border-radius: 14px;
  background: #eff6ff; color: #0369a1; font-size: 1.4rem;
  display: flex; align-items: center; justify-content: center;
}

.state-icon.error-icon { background: #fef2f2; color: #ef4444; }

.state-title { font-size: 1rem; font-weight: 800; color: #0C3B5E; }
.state-text  { font-size: 0.83rem; color: #6b7280; max-width: 260px; line-height: 1.5; }

/* Wave spinner */
.resort-spinner { display: flex; gap: 5px; align-items: flex-end; height: 36px; }
.spinner-wave {
  width: 7px; background: #0369a1; border-radius: 4px;
  animation: waveAnim 0.9s ease-in-out infinite alternate;
}
.spinner-wave:nth-child(1) { height: 18px; }
.spinner-wave:nth-child(2) { height: 30px; }
.spinner-wave:nth-child(3) { height: 24px; }
.spinner-wave:nth-child(4) { height: 36px; }

@keyframes waveAnim {
  from { opacity: 0.4; transform: scaleY(0.6); }
  to   { opacity: 1;   transform: scaleY(1); }
}

.ghost-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  background: #fff; border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-family: inherit; font-size: 0.83rem; font-weight: 600;
  color: #6b7280; cursor: pointer; transition: all 0.2s;
}
.ghost-btn:hover { border-color: #0369a1; color: #0369a1; background: #eff6ff; }

/* ── Bookings List ──────────────────────────────────────────── */
.bookings-list { display: flex; flex-direction: column; gap: 0.9rem; }

.booking-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-left: 4px solid #0369a1;
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  animation: cardIn 0.35s ease both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.booking-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 4px 16px rgba(3,105,161,0.1);
  transform: translateY(-1px);
}

/* Card Header */
.booking-card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.9rem 1.25rem;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.header-left { display: flex; align-items: center; gap: 0.75rem; }

.ref-icon-wrap {
  width: 36px; height: 36px; border-radius: 9px;
  background: #0369a1; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.88rem; flex-shrink: 0;
}

.ref-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #6b7280; }
.ref-value { font-size: 0.95rem; font-weight: 800; color: #0C3B5E; margin-top: 1px; }

/* Status chips */
.status-chip {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: 20px; font-size: 0.72rem; font-weight: 700;
  white-space: nowrap;
}

.status-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}

.chip-pending   { background: #fef9c3; color: #854d0e; }
.chip-pending .status-dot { background: #eab308; }

.chip-confirmed { background: #d1fae5; color: #065f46; }
.chip-confirmed .status-dot { background: #10b981; }

.chip-completed { background: #eff6ff; color: #0369a1; }
.chip-completed .status-dot { background: #0369a1; }

.chip-cancelled { background: #fee2e2; color: #991b1b; }
.chip-cancelled .status-dot { background: #ef4444; }

.chip-default   { background: #f3f4f6; color: #6b7280; }
.chip-default .status-dot { background: #9ca3af; }

/* Card body — 2-col */
.booking-card-body {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 0;
}

.detail-col {
  padding: 1.1rem 1.25rem;
  border-right: 1px solid #e5e7eb;
  display: flex; flex-direction: column; gap: 0.9rem;
}

/* Detail blocks */
.detail-block { display: flex; flex-direction: column; gap: 0.5rem; }

.detail-block-label {
  font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.07em;
  color: #0369a1;
  display: flex; align-items: center; gap: 0.35rem;
}

/* Dates strip */
.dates-strip {
  display: flex; align-items: center; gap: 0.75rem;
  background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 8px; padding: 0.6rem 0.9rem;
}

.date-item { flex: 1; }
.date-sub  { font-size: 0.65rem; color: #6b7280; margin-bottom: 2px; }
.date-val  { font-size: 0.85rem; font-weight: 700; color: #0C3B5E; }
.dates-arrow { color: #9ca3af; font-size: 0.75rem; flex-shrink: 0; }

/* Items list */
.items-list { display: flex; flex-direction: column; gap: 0.4rem; }

.item-row {
  display: flex; align-items: center; gap: 0.65rem;
  padding: 0.5rem 0.7rem;
  background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 7px;
  transition: background 0.15s;
}
.item-row:hover { background: #eff6ff; border-color: #bfdbfe; }

.item-avatar {
  width: 28px; height: 28px; border-radius: 7px;
  background: linear-gradient(135deg, #0369a1, #1F8DBF);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.72rem; flex-shrink: 0;
}

.item-name  { flex: 1; font-size: 0.82rem; font-weight: 600; color: #1f2937; }
.item-qty   { font-size: 0.72rem; color: #6b7280; min-width: 28px; text-align: center; }
.item-price { font-size: 0.82rem; font-weight: 700; color: #0369a1; min-width: 70px; text-align: right; }

/* Total pill */
.total-pill {
  display: flex; align-items: center; justify-content: space-between;
  background: #eff6ff; border: 1px solid #dbeafe;
  border-radius: 8px; padding: 0.6rem 0.9rem;
}

.total-label { font-size: 0.8rem; font-weight: 700; color: #0C3B5E; }
.total-val   { font-size: 1.05rem; font-weight: 800; color: #0369a1; }

/* QR Column */
.qr-col {
  padding: 1.1rem;
  background: #f9fafb;
  display: flex; flex-direction: column; align-items: center; gap: 0.55rem;
}

.qr-label {
  font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.07em;
  color: #0369a1;
  display: flex; align-items: center; gap: 0.35rem;
}

.qr-frame {
  background: #fff; border: 2px solid #dbeafe;
  border-radius: 10px; padding: 6px;
  box-shadow: 0 2px 6px rgba(3,105,161,0.08);
}

.qr-image { width: 120px; height: 120px; display: block; border-radius: 6px; }

.qr-placeholder {
  width: 120px; height: 120px;
  background: #eff6ff; border: 2px dashed #bfdbfe; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; color: #93c5fd;
}

.qr-hint { font-size: 0.7rem; color: #6b7280; text-align: center; }

.qr-actions { display: flex; gap: 0.45rem; width: 100%; }

.qr-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.3rem;
  padding: 0.45rem 0.5rem;
  border: none; border-radius: 7px;
  font-family: inherit; font-size: 0.72rem; font-weight: 700;
  cursor: pointer; transition: all 0.18s;
}

.primary-qr { background: #0369a1; color: #fff; }
.primary-qr:hover { background: #0C3B5E; transform: translateY(-1px); }

.ghost-qr { background: #fff; color: #6b7280; border: 1.5px solid #e5e7eb; }
.ghost-qr:hover { border-color: #0369a1; color: #0369a1; background: #eff6ff; }

/* Card footer */
.booking-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.6rem 1.25rem;
  background: #fafafa; border-top: 1px solid #e5e7eb;
  font-size: 0.75rem;
}

.payment-status {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-weight: 600;
}

.pay-paid    { color: #059669; }
.pay-pending { color: #d97706; }
.pay-failed  { color: #ef4444; }
.pay-default { color: #6b7280; }

.booked-on { color: #9ca3af; font-size: 0.72rem; }

/* ── QR Viewer Modal ────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(12,59,94,0.55); backdrop-filter: blur(5px);
  z-index: 100; display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.22s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-box {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 380px;
  padding: 1.5rem;
  box-shadow: 0 20px 50px rgba(12,59,94,0.25);
  border-top: 4px solid #F4C400;
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(18px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.1rem;
}

.modal-title { font-size: 1rem; font-weight: 800; color: #0C3B5E; }

.modal-close {
  width: 30px; height: 30px; border-radius: 8px;
  background: #f3f4f6; border: none; color: #6b7280;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.78rem; transition: all 0.15s;
}
.modal-close:hover { background: #fee2e2; color: #ef4444; }

.modal-qr-wrap {
  background: #eff6ff; border: 2px solid #dbeafe;
  border-radius: 12px; padding: 1.25rem;
  display: flex; justify-content: center; margin-bottom: 0.85rem;
}

.modal-qr-img { width: 160px; height: 160px; border-radius: 8px; }

.modal-ref {
  background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 8px; padding: 0.65rem 0.9rem;
  text-align: center; margin-bottom: 1rem;
}

.modal-ref-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: #6b7280; }
.modal-ref-val   { font-size: 0.95rem; font-weight: 800; color: #0C3B5E; margin-top: 2px; }

.modal-actions { display: flex; gap: 0.65rem; }

.modal-primary-btn {
  flex: 1; padding: 0.72rem;
  background: #0369a1; color: #fff;
  border: none; border-radius: 9px;
  font-family: inherit; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  transition: background 0.2s, transform 0.15s;
}
.modal-primary-btn:hover { background: #0C3B5E; transform: translateY(-1px); }

.modal-ghost-btn {
  flex: 1; padding: 0.72rem;
  background: #fff; color: #6b7280;
  border: 1.5px solid #e5e7eb; border-radius: 9px;
  font-family: inherit; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.modal-ghost-btn:hover { border-color: #0369a1; color: #0369a1; }

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .reservations-section { gap: 0.85rem; }

  .top-bar {
    gap: 0.6rem;
  }

  .results-count {
    font-size: 0.78rem;
  }

  .filter-toggle-btn {
    padding: 0.44rem 0.8rem;
    font-size: 0.75rem;
  }

  .filter-grid-2 { grid-template-columns: 1fr; }
  .filter-grid-3 { grid-template-columns: 1fr 1fr; }

  .booking-card-body { grid-template-columns: 1fr; }

  .detail-col {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .qr-col {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
  }
}

@media (max-width: 640px) {
  .reservations-section {
    gap: 0.75rem;
    padding-bottom: calc(74px + env(safe-area-inset-bottom, 0px));
  }

  .top-bar {
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    flex-direction: row;
    background: #071E2F;
    border: none;
    border-radius: 12px;
    padding: 0.62rem 0.72rem;
    box-shadow: 0 3px 12px rgba(7,30,47,0.3);
  }

  .results-count {
    font-size: 0.7rem;
    line-height: 1.35;
    color: rgba(255,255,255,0.75);
    max-width: 62%;
  }

  .results-count strong,
  .of-total {
    color: #F4C400;
  }

  .filter-toggle-btn {
    width: auto;
    justify-content: center;
    min-height: 36px;
    border-radius: 12px;
    font-size: 0.72rem;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.14);
    color: rgba(255,255,255,0.85);
    padding: 0.38rem 0.68rem;
    flex-shrink: 0;
  }

  .filter-toggle-btn.active {
    background: rgba(244,196,0,0.18);
    border-color: #F4C400;
    color: #F4C400;
  }

  .filter-badge {
    width: 16px;
    height: 16px;
    font-size: 0.58rem;
    background: #F4C400;
    color: #071E2F;
  }

  .filter-panel {
    position: sticky;
    top: 62px;
    z-index: 18;
    background: #071E2F;
    border: none;
    border-top: none;
    box-shadow: 0 3px 14px rgba(7,30,47,0.28);
    border-radius: 12px;
    padding: 0.78rem 0.82rem;
    gap: 0.72rem;
  }

  .filter-grid-3 {
    grid-template-columns: 1fr;
  }

  .filter-label {
    font-size: 0.62rem;
    color: rgba(255,255,255,0.52);
  }

  .fi {
    color: rgba(255,255,255,0.45);
  }

  .filter-input {
    min-height: 38px;
    font-size: 0.82rem;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
  }

  .filter-input::placeholder {
    color: rgba(255,255,255,0.42);
  }

  .filter-input:focus {
    border-color: #F4C400;
    background: rgba(255,255,255,0.14);
    box-shadow: none;
  }

  .filter-select option {
    background: #0C3B5E;
    color: #fff;
  }

  .input-clear {
    color: rgba(255,255,255,0.4);
  }

  .input-clear:hover {
    color: #F4C400;
  }

  .active-tags {
    gap: 0.38rem;
    padding-top: 0.55rem;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .tags-label,
  .filter-tag,
  .clear-all-btn {
    font-size: 0.68rem;
  }

  .tags-label {
    color: rgba(255,255,255,0.5);
  }

  .filter-tag {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.14);
    color: #e2edff;
  }

  .filter-tag button {
    color: rgba(255,255,255,0.6);
  }

  .filter-tag button:hover {
    color: #F4C400;
  }

  .clear-all-btn {
    margin-left: 0;
    color: rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 20px;
    padding: 0.16rem 0.5rem;
  }

  .clear-all-btn:hover { color: #fff; }

  .state-container {
    padding: 2.5rem 1rem;
    border-radius: 12px;
  }

  .state-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    font-size: 1.15rem;
  }

  .state-title {
    font-size: 0.9rem;
  }

  .state-text {
    font-size: 0.76rem;
  }

  .booking-card {
    border-radius: 12px;
    border-left: 4px solid #0369a1;
  }

  .booking-card-header {
    padding: 0.72rem 0.82rem;
    align-items: flex-start;
    gap: 0.55rem;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
  }

  .header-left {
    min-width: 0;
    gap: 0.55rem;
  }

  .ref-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    font-size: 0.76rem;
  }

  .ref-label {
    font-size: 0.58rem;
  }

  .ref-value {
    font-size: 0.82rem;
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-chip {
    font-size: 0.64rem;
    padding: 0.22rem 0.55rem;
    margin-top: 1px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
  }

  .detail-col {
    padding: 0.78rem 0.82rem;
    gap: 0.72rem;
  }

  .detail-block {
    gap: 0.42rem;
  }

  .detail-block-label {
    font-size: 0.62rem;
  }

  .dates-strip {
    padding: 0.52rem 0.58rem;
    gap: 0.45rem;
    flex-direction: column;
    align-items: stretch;
  }

  .date-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .dates-arrow {
    transform: rotate(90deg);
    align-self: center;
    font-size: 0.66rem;
    margin: -2px 0;
  }

  .date-sub,
  .date-val {
    margin: 0;
  }

  .date-sub {
    font-size: 0.6rem;
  }

  .date-val {
    font-size: 0.78rem;
  }

  .items-list {
    gap: 0.35rem;
  }

  .item-row {
    padding: 0.45rem 0.55rem;
    gap: 0.48rem;
  }

  .item-avatar {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    font-size: 0.64rem;
  }

  .item-name {
    font-size: 0.74rem;
  }

  .item-qty {
    font-size: 0.66rem;
    min-width: 20px;
  }

  .item-price {
    font-size: 0.7rem;
    min-width: 58px;
  }

  .total-pill {
    padding: 0.5rem 0.62rem;
  }

  .total-label {
    font-size: 0.72rem;
  }

  .total-val {
    font-size: 0.9rem;
  }

  .qr-col {
    padding: 0.72rem 0.82rem 0.8rem;
    gap: 0.5rem;
    justify-content: flex-start;
  }

  .qr-label {
    width: 100%;
    justify-content: center;
    font-size: 0.62rem;
  }

  .qr-frame,
  .qr-placeholder {
    margin: 0 auto;
  }

  .qr-image,
  .qr-placeholder {
    width: 94px;
    height: 94px;
  }

  .qr-hint {
    width: 100%;
    text-align: center;
    font-size: 0.64rem;
  }

  .qr-actions {
    width: 100%;
    gap: 0.42rem;
  }

  .qr-btn {
    min-height: 34px;
    padding: 0.35rem 0.4rem;
    font-size: 0.66rem;
    border-radius: 8px;
  }

  .booking-card-footer {
    padding: 0.48rem 0.82rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
    font-size: 0.68rem;
    background: #fafafa;
  }

  .booked-on {
    font-size: 0.64rem;
  }

  .modal-box {
    max-width: 320px;
    border-radius: 14px;
    padding: 1rem;
  }

  .modal-title {
    font-size: 0.92rem;
  }

  .modal-qr-wrap {
    padding: 0.9rem;
    margin-bottom: 0.72rem;
  }

  .modal-qr-img {
    width: 130px;
    height: 130px;
  }

  .modal-ref {
    padding: 0.56rem 0.65rem;
    margin-bottom: 0.78rem;
  }

  .modal-ref-val {
    font-size: 0.84rem;
  }

  .modal-actions {
    gap: 0.48rem;
  }

  .modal-primary-btn,
  .modal-ghost-btn {
    padding: 0.6rem;
    font-size: 0.78rem;
    border-radius: 8px;
  }
}

@media (max-width: 400px) {
  .ref-value {
    max-width: 150px;
  }

  .status-chip {
    font-size: 0.6rem;
    padding: 0.2rem 0.48rem;
  }

  .item-row {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) auto;
    gap: 0.42rem;
  }

  .item-price {
    grid-column: 3;
  }

  .item-qty {
    grid-column: 2;
    justify-self: end;
  }
}
</style>