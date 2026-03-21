<template>
  <div class="orders-page">

    <!-- ══════════════════════════════════════════ -->
    <!-- FILTER PANEL                               -->
    <!-- ══════════════════════════════════════════ -->
    <div class="filter-panel" v-if="!isLoading || orders.length > 0">
      <div class="filter-grid">

        <!-- Search -->
        <div class="filter-group">
          <label class="filter-label">Receipt / Order ID</label>
          <div class="input-wrapper">
            <i class="fas fa-search input-icon"></i>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search receipt number..."
              class="filter-input"
            />
            <button v-if="filters.search" class="clear-input" @click="filters.search = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Date From -->
        <div class="filter-group">
          <label class="filter-label">Date From</label>
          <div class="input-wrapper">
            <i class="fas fa-calendar-alt input-icon"></i>
            <input v-model="filters.dateFrom" type="date" class="filter-input date-input" />
          </div>
        </div>

        <!-- Date To -->
        <div class="filter-group">
          <label class="filter-label">Date To</label>
          <div class="input-wrapper">
            <i class="fas fa-calendar-alt input-icon"></i>
            <input v-model="filters.dateTo" type="date" class="filter-input date-input" />
          </div>
        </div>

        <!-- Amount Range -->
        <div class="filter-group">
          <label class="filter-label">Amount Range</label>
          <div class="amount-range">
            <input v-model.number="filters.amountMin" type="number" placeholder="Min ₱" class="filter-input amount-input" min="0" />
            <span class="range-sep">–</span>
            <input v-model.number="filters.amountMax" type="number" placeholder="Max ₱" class="filter-input amount-input" min="0" />
          </div>
        </div>

        <!-- Sort -->
        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <div class="input-wrapper">
            <i class="fas fa-sort input-icon"></i>
            <select v-model="filters.sortBy" class="filter-input filter-select">
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

      </div>

      <!-- Active Filters Footer -->
      <div class="filter-footer" v-if="hasActiveFilters">
        <div class="active-filter-tags">
          <span class="filter-count">
            <i class="fas fa-filter"></i>
            {{ filteredOrders.length }} result{{ filteredOrders.length !== 1 ? 's' : '' }}
          </span>
          <button class="clear-all-btn" @click="clearFilters">
            <i class="fas fa-times"></i> Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════ -->
    <!-- CONTENT AREA                               -->
    <!-- ══════════════════════════════════════════ -->
    <div class="content-area">

      <!-- Loading -->
      <div v-if="isLoading && orders.length === 0" class="state-container">
        <div class="resort-spinner">
          <div v-for="n in 4" :key="n" class="spinner-wave" :style="`animation-delay:${(n-1)*0.15}s`"></div>
        </div>
        <p class="state-text">Loading your orders…</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-container">
        <div class="state-icon error-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h3 class="state-title">Unable to load orders</h3>
        <p class="state-text">{{ error }}</p>
        <button class="primary-btn" @click="fetchOrders">
          <i class="fas fa-redo"></i> Try Again
        </button>
      </div>

      <!-- No orders at all -->
      <div v-else-if="orders.length === 0" class="state-container">
        <div class="state-icon">
          <i class="fas fa-receipt"></i>
        </div>
        <h3 class="state-title">No orders yet</h3>
        <p class="state-text">Your order history will appear here once you place an order.</p>
        <button class="primary-btn" @click="$emit('close')">
          <i class="fas fa-utensils"></i> Browse Menu
        </button>
      </div>

      <!-- No filter results -->
      <div v-else-if="filteredOrders.length === 0" class="state-container">
        <div class="state-icon">
          <i class="fas fa-search"></i>
        </div>
        <h3 class="state-title">No matching orders</h3>
        <p class="state-text">Try adjusting your filters to find what you're looking for.</p>
        <button class="ghost-btn" @click="clearFilters">
          <i class="fas fa-times"></i> Clear Filters
        </button>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-list">

        <!-- Summary Row -->
        <div class="list-summary">
          <span class="summary-count">
            <i class="fas fa-list-ul"></i>
            {{ filteredOrders.length }} order{{ filteredOrders.length !== 1 ? 's' : '' }}
          </span>
          <span class="summary-total">
            Total: <strong>₱{{ totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</strong>
          </span>
        </div>

        <!-- Order Cards -->
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-card"
          :class="{ 'is-expanded': expandedOrder === order.id, 'is-new': newOrderIds.includes(order.id) }"
        >
          <!-- Card Header -->
          <div class="card-header" @click="toggleOrder(order.id)">
            <div class="card-left">
              <div class="receipt-icon-wrap">
                <i class="fas fa-file-invoice"></i>
              </div>
              <div class="card-info">
                <div class="receipt-number">{{ order.receipt_no }}</div>
                <div class="order-datetime">
                  <span>{{ formatDate(order.transaction_date) }}</span>
                  <span class="dot-sep">·</span>
                  <span>{{ formatTime(order.transaction_time) }}</span>
                </div>
              </div>
            </div>
            <div class="card-right">
              <div class="order-amount">₱{{ parseFloat(order.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</div>
              <span class="type-badge" :class="`badge-${(order.type || '').toLowerCase().replace('-', '')}`">
                {{ order.type }}
              </span>
              <div class="expand-icon" :class="{ rotated: expandedOrder === order.id }">
                <i class="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>

          <!-- Expanded Details -->
          <transition name="card-expand">
            <div v-if="expandedOrder === order.id" class="card-body">

              <!-- Delivery Info -->
              <div v-if="order.location_type" class="detail-block">
                <div class="detail-label">
                  <i class="fas fa-map-marker-alt"></i> Delivery Location
                </div>
                <div class="location-row">
                  <span class="location-type-tag">{{ order.location_type }}</span>
                  <span v-if="order.location_number" class="location-num">
                    <i class="fas fa-hashtag"></i>{{ order.location_number }}
                  </span>
                </div>
                <p v-if="order.delivery_notes" class="delivery-note">
                  <i class="fas fa-quote-left"></i> {{ order.delivery_notes }}
                </p>
              </div>

              <!-- Items Ordered -->
              <div class="detail-block">
                <div class="detail-label">
                  <i class="fas fa-utensils"></i> Items Ordered
                </div>
                <div class="items-table">
                  <div v-for="(item, idx) in parseItems(order.items)" :key="idx" class="item-row">
                    <div class="item-avatar">{{ item.name.charAt(0) }}</div>
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-qty">×{{ item.quantity }}</span>
                    <span class="item-price">₱{{ parseFloat(item.subtotal).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Summary -->
              <div class="detail-block">
                <div class="detail-label">
                  <i class="fas fa-credit-card"></i> Payment
                </div>
                <div class="payment-card">
                  <div class="payment-row">
                    <span>Payment Method</span>
                    <span class="pay-value">{{ order.payment_method }}</span>
                  </div>
                  <div class="payment-divider"></div>
                  <div class="payment-row total-row">
                    <span>Order Total</span>
                    <span class="pay-total">₱{{ parseFloat(order.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="card-actions">
                <button class="card-btn reorder-btn" @click="reorder(order)">
                  <i class="fas fa-redo"></i> Order Again
                </button>
                <button class="card-btn delete-btn" @click="confirmDelete(order.id)">
                  <i class="fas fa-trash-alt"></i> Delete
                </button>
              </div>

            </div>
          </transition>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const API_BASE = 'http://localhost:8000/api/pos'

const props = defineProps({
  showHeader: { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'reorder'])

const orders        = ref([])
const isLoading     = ref(false)
const error         = ref('')
const expandedOrder = ref(null)
const isPolling     = ref(false)
const newOrderIds   = ref([])
let pollingInterval = null

const filters = ref({
  search: '',
  dateFrom: '',
  dateTo: '',
  amountMin: null,
  amountMax: null,
  sortBy: 'date_desc'
})

const hasActiveFilters = computed(() =>
  filters.value.search ||
  filters.value.dateFrom ||
  filters.value.dateTo ||
  filters.value.amountMin ||
  filters.value.amountMax
)

const filteredOrders = computed(() => {
  let result = [...orders.value]

  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    result = result.filter(o => o.receipt_no?.toLowerCase().includes(q))
  }

  if (filters.value.dateFrom)
    result = result.filter(o => new Date(o.transaction_date) >= new Date(filters.value.dateFrom))

  if (filters.value.dateTo)
    result = result.filter(o => new Date(o.transaction_date) <= new Date(filters.value.dateTo))

  if (filters.value.amountMin != null && filters.value.amountMin !== '')
    result = result.filter(o => parseFloat(o.total_amount) >= filters.value.amountMin)

  if (filters.value.amountMax != null && filters.value.amountMax !== '')
    result = result.filter(o => parseFloat(o.total_amount) <= filters.value.amountMax)

  const [sortField, sortDir] = filters.value.sortBy.split('_')

  result.sort((a, b) => {
    const va = sortField === 'date'
      ? new Date(`${a.transaction_date} ${a.transaction_time}`)
      : parseFloat(a.total_amount)
    const vb = sortField === 'date'
      ? new Date(`${b.transaction_date} ${b.transaction_time}`)
      : parseFloat(b.total_amount)
    return sortDir === 'desc' ? vb - va : va - vb
  })

  return result
})

const totalAmount = computed(() =>
  filteredOrders.value.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0)
)

const fetchOrders = async (silent = false) => {
  if (!silent) isLoading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE}/transactions`)
    if (!res.ok) throw new Error('Failed to fetch orders')
    const all = await res.json()
    const filtered = all
      .filter(t => t.type === 'E-Shop')
      .sort((a, b) =>
        new Date(`${b.transaction_date} ${b.transaction_time}`) -
        new Date(`${a.transaction_date} ${a.transaction_time}`)
      )
    const existingIds = orders.value.map(o => o.id)
    const newIds = filtered.map(o => o.id).filter(id => !existingIds.includes(id))
    if (newIds.length > 0 && orders.value.length > 0) {
      newOrderIds.value = newIds
      setTimeout(() => newOrderIds.value = [], 3000)
    }
    orders.value = filtered
  } catch (err) {
    if (!silent) error.value = 'Failed to load order history. Please try again.'
    console.error('Error fetching orders:', err)
  } finally {
    isLoading.value = false
  }
}

const stopPolling = () => {
  isPolling.value = false
  if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null }
}

const startPolling = () => {
  stopPolling()
  isPolling.value = true
  pollingInterval = setInterval(() => fetchOrders(true), 10000)
}

const toggleOrder = (id) => {
  expandedOrder.value = expandedOrder.value === id ? null : id
}

const parseItems = (items) => {
  if (Array.isArray(items)) return items
  try { return JSON.parse(items) } catch { return [] }
}

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatTime = (t) => t ? t.substring(0, 5) : ''

const clearFilters = () => {
  filters.value = { search: '', dateFrom: '', dateTo: '', amountMin: null, amountMax: null, sortBy: 'date_desc' }
}

const reorder = (order) => { emit('reorder', parseItems(order.items)); emit('close') }

const confirmDelete = (id) => {
  if (window.confirm('Delete this order? This action cannot be undone.')) deleteOrder(id)
}

const deleteOrder = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error('Delete failed')
    orders.value = orders.value.filter(o => o.id !== id)
    if (expandedOrder.value === id) expandedOrder.value = null
  } catch (err) {
    console.error('Delete error:', err)
    alert('Failed to delete order. Please try again.')
  }
}

onMounted(() => { fetchOrders(); startPolling() })
onUnmounted(() => stopPolling())

defineExpose({ fetchOrders })
</script>

<style scoped>
/* ── Design Tokens (Eduardo's Resort) ──────────────────────── */
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

.orders-page {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #EEF5FB;
  min-height: 100vh;
  color: #1f2937;
}

/* ── Filter Panel ───────────────────────────────────────────── */
.filter-panel {
  background: #fff;
  border-bottom: 2px solid #F4C400;
  padding: 1.1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(3,105,161,0.06);
  position: sticky;
  top: 0;
  z-index: 20;
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
  gap: 0.85rem;
  align-items: end;
}

.filter-group { display: flex; flex-direction: column; gap: 0.35rem; }

.filter-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #0C3B5E;
}

/* Input wrapper */
.input-wrapper { position: relative; display: flex; align-items: center; }

.input-icon {
  position: absolute;
  left: 0.75rem;
  color: #0369a1;
  font-size: 0.75rem;
  pointer-events: none;
  flex-shrink: 0;
}

.filter-input {
  width: 100%;
  padding: 0.55rem 0.8rem 0.55rem 2.2rem;
  border: 1.5px solid #dbeafe;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.83rem;
  color: #1f2937;
  background: #f0f7ff;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  outline: none;
}

.filter-input:focus {
  border-color: #0369a1;
  box-shadow: 0 0 0 3px rgba(3,105,161,0.1);
  background: #fff;
}

.filter-select { padding-left: 2.2rem; cursor: pointer; appearance: none; }
.date-input    { cursor: pointer; }

.clear-input {
  position: absolute; right: 0.6rem;
  background: none; border: none;
  font-size: 0.72rem; color: #6b7280;
  cursor: pointer; padding: 3px;
  transition: color 0.15s;
  display: flex; align-items: center;
}
.clear-input:hover { color: #0369a1; }

/* Amount range */
.amount-range { display: flex; align-items: center; gap: 0.35rem; }
.amount-input { padding-left: 0.7rem; flex: 1; }
.range-sep    { color: #6b7280; font-size: 0.88rem; flex-shrink: 0; }

/* Filter footer */
.filter-footer {
  margin-top: 0.75rem;
  padding-top: 0.65rem;
  border-top: 1px solid #dbeafe;
}

.active-filter-tags {
  display: flex; align-items: center; gap: 1rem;
}

.filter-count {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.78rem; color: #0369a1; font-weight: 700;
}

.clear-all-btn {
  display: flex; align-items: center; gap: 0.35rem;
  background: none; border: none;
  font-family: inherit;
  font-size: 0.78rem; font-weight: 600;
  color: #6b7280; cursor: pointer;
  transition: color 0.15s;
}
.clear-all-btn:hover { color: #ef4444; }

/* ── Content Area ───────────────────────────────────────────── */
.content-area {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* ── State containers ───────────────────────────────────────── */
.state-container {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 5rem 2rem; text-align: center; gap: 0.9rem;
}

.state-icon {
  width: 60px; height: 60px;
  background: #eff6ff; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: #0369a1; font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.state-icon.error-icon { background: #fef2f2; color: #ef4444; }

.state-title { font-size: 1.1rem; font-weight: 800; color: #0C3B5E; }
.state-text  { font-size: 0.85rem; color: #6b7280; max-width: 260px; line-height: 1.5; }

/* Wave spinner */
.resort-spinner {
  display: flex; gap: 5px; align-items: flex-end; height: 38px; margin-bottom: 0.5rem;
}

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

/* ── Buttons ────────────────────────────────────────────────── */
.primary-btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.65rem 1.4rem;
  background: #0369a1; color: #fff;
  border: none; border-radius: 8px;
  font-family: inherit; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.primary-btn:hover { background: #0C3B5E; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(3,105,161,0.22); }

.ghost-btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.65rem 1.4rem;
  background: #fff; color: #6b7280;
  border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-family: inherit; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.ghost-btn:hover { border-color: #0369a1; color: #0369a1; background: #eff6ff; }

/* ── List Summary ───────────────────────────────────────────── */
.list-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.7rem 1rem;
  background: #fff;
  border-radius: 9px;
  border: 1px solid #dbeafe;
}

.summary-count {
  display: flex; align-items: center; gap: 0.45rem;
  font-size: 0.8rem; color: #0369a1; font-weight: 700;
}

.summary-total {
  font-size: 0.82rem; color: #6b7280; font-weight: 500;
}

.summary-total strong { color: #0C3B5E; font-weight: 800; font-size: 0.88rem; }

/* ── Order Cards ────────────────────────────────────────────── */
.orders-list { display: flex; flex-direction: column; gap: 0.65rem; }

.order-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.order-card:hover { border-color: #bfdbfe; box-shadow: 0 2px 10px rgba(3,105,161,0.08); }

.order-card.is-expanded {
  border-color: #0369a1;
  box-shadow: 0 4px 18px rgba(3,105,161,0.12);
}

.order-card.is-new { animation: newFlash 3s ease; }

@keyframes newFlash {
  0%   { background: #eff6ff; border-color: #0369a1; }
  100% { background: #fff;    border-color: #e5e7eb; }
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.card-header:hover { background: #f9fafb; }

.card-left  { display: flex; align-items: center; gap: 0.85rem; }

/* Receipt icon tile */
.receipt-icon-wrap {
  width: 38px; height: 38px;
  background: #eff6ff;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  color: #0369a1; font-size: 1rem;
  flex-shrink: 0;
  transition: background 0.2s;
}

.order-card.is-expanded .receipt-icon-wrap { background: #0369a1; color: #fff; }

.receipt-number {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0C3B5E;
  letter-spacing: 0.01em;
}

.order-datetime {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.2rem;
  display: flex; align-items: center; gap: 0.1rem;
}

.dot-sep { margin: 0 0.25rem; color: #d1d5db; }

.card-right { display: flex; align-items: center; gap: 0.75rem; }

.order-amount {
  font-size: 1rem;
  font-weight: 800;
  color: #0369a1;
  letter-spacing: -0.2px;
}

/* Type badges */
.type-badge {
  padding: 0.22rem 0.65rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.badge-eshop    { background: #eff6ff; color: #0369a1; }
.badge-walkin   { background: #fdf4ff; color: #7c3aed; }
.badge-delivery { background: #f0fdf4; color: #16a34a; }

/* Expand chevron */
.expand-icon {
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  color: #9ca3af; font-size: 0.75rem;
  border-radius: 6px;
  transition: transform 0.25s, color 0.2s, background 0.2s;
}

.expand-icon.rotated { transform: rotate(180deg); color: #0369a1; }
.card-header:hover .expand-icon { color: #0369a1; background: #eff6ff; }

/* Card Body */
.card-body {
  border-top: 1.5px solid #e5e7eb;
  padding: 1.25rem;
}

.card-expand-enter-active { animation: expandDown 0.22s ease; }
.card-expand-leave-active  { animation: expandDown 0.18s ease reverse; }

@keyframes expandDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Detail Blocks */
.detail-block { margin-bottom: 1.1rem; }
.detail-block:last-of-type { margin-bottom: 0; }

.detail-label {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.07em;
  color: #0369a1; margin-bottom: 0.6rem;
}

/* Location row */
.location-row {
  display: flex; align-items: center; gap: 0.55rem;
  padding: 0.6rem 0.85rem;
  background: #f9fafb;
  border: 1px solid #dbeafe;
  border-radius: 8px;
}

.location-type-tag {
  font-weight: 700; color: #0C3B5E; font-size: 0.85rem;
}

.location-num {
  display: inline-flex; align-items: center; gap: 0.25rem;
  background: #0369a1; color: #fff;
  padding: 0.15rem 0.6rem; border-radius: 20px;
  font-size: 0.72rem; font-weight: 700;
}

.delivery-note {
  margin-top: 0.5rem; padding: 0.5rem 0.75rem;
  background: #fffbeb; border-left: 3px solid #F4C400;
  border-radius: 0 6px 6px 0;
  color: #92400e; font-size: 0.8rem; font-style: italic;
  display: flex; align-items: flex-start; gap: 0.4rem;
}

/* Items table */
.items-table {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  overflow: hidden;
}

.item-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.15s;
}

.item-row:last-child { border-bottom: none; }
.item-row:hover { background: #eff6ff; }

/* Item avatar initial tile */
.item-avatar {
  width: 28px; height: 28px;
  border-radius: 7px;
  background: linear-gradient(135deg, #0369a1, #1F8DBF);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.72rem;
  flex-shrink: 0;
}

.item-name  { flex: 1; font-size: 0.85rem; font-weight: 600; color: #1f2937; }
.item-qty   { color: #6b7280; font-size: 0.78rem; min-width: 28px; text-align: center; }
.item-price { font-weight: 700; color: #0369a1; font-size: 0.85rem; min-width: 80px; text-align: right; }

/* Payment card */
.payment-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  padding: 0.75rem 1rem;
}

.payment-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.3rem 0;
  font-size: 0.83rem; color: #6b7280;
}

.pay-value { font-weight: 600; color: #1f2937; }

.payment-divider { height: 1px; background: #e5e7eb; margin: 0.35rem 0; }

.total-row { font-size: 0.9rem; font-weight: 700; color: #0C3B5E; }

.pay-total { font-size: 1rem; font-weight: 800; color: #0369a1; }

/* Card Actions */
.card-actions {
  display: flex; gap: 0.75rem; margin-top: 1.1rem;
}

.card-btn {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 0.45rem;
  padding: 0.68rem;
  border: none; border-radius: 8px;
  font-family: inherit; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}

/* Reorder = gold (key action) */
.reorder-btn {
  background: #F4C400;
  color: #0C3B5E;
}
.reorder-btn:hover { background: #F2C200; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(244,196,0,0.3); }

/* Delete = soft red */
.delete-btn {
  background: #fef2f2;
  color: #ef4444;
  border: 1.5px solid #fee2e2;
}
.delete-btn:hover { background: #ef4444; color: #fff; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(239,68,68,0.2); }

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 900px) {
  .filter-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 640px) {
  .filter-panel { padding: 0.9rem 1rem; }
  .content-area { padding: 1rem; }
  .filter-grid  { grid-template-columns: 1fr; gap: 0.65rem; }
  .card-actions { flex-direction: column; }
  .card-right   { gap: 0.45rem; }
  .order-amount { font-size: 0.92rem; }
  .type-badge   { display: none; }
}
</style>