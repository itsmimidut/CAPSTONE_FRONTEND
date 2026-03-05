<template>
  <div class="orders-page">
    <!-- Filter Panel -->
    <div class="filter-panel" v-if="!isLoading || orders.length > 0">
      <div class="filter-grid">
        <!-- Search by ID -->
        <div class="filter-group">
          <label class="filter-label">Receipt / Order ID</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search receipt number..."
              class="filter-input"
            />
            <button v-if="filters.search" class="clear-input" @click="filters.search = ''">×</button>
          </div>
        </div>

        <!-- Date From -->
        <div class="filter-group">
          <label class="filter-label">Date From</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <input v-model="filters.dateFrom" type="date" class="filter-input date-input" />
          </div>
        </div>

        <!-- Date To -->
        <div class="filter-group">
          <label class="filter-label">Date To</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
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
            <select v-model="filters.sortBy" class="filter-input filter-select">
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Active Filters + Clear -->
      <div class="filter-footer" v-if="hasActiveFilters">
        <div class="active-filter-tags">
          <span class="filter-count">{{ filteredOrders.length }} result{{ filteredOrders.length !== 1 ? 's' : '' }}</span>
          <button class="clear-all-btn" @click="clearFilters">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-area">
      <!-- Loading -->
      <div v-if="isLoading && orders.length === 0" class="state-container">
        <div class="loader">
          <div class="loader-ring"></div>
          <div class="loader-ring"></div>
          <div class="loader-ring"></div>
        </div>
        <p class="state-text">Loading your orders...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-container">
        <div class="state-icon error-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <h3 class="state-title">Unable to load orders</h3>
        <p class="state-text">{{ error }}</p>
        <button class="action-btn primary-btn" @click="fetchOrders">Try Again</button>
      </div>

      <!-- Empty (no orders at all) -->
      <div v-else-if="orders.length === 0" class="state-container">
        <div class="state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <h3 class="state-title">No orders yet</h3>
        <p class="state-text">Your order history will appear here once you place an order.</p>
        <button class="action-btn primary-btn" @click="$emit('close')">Browse Menu</button>
      </div>

      <!-- No Filter Results -->
      <div v-else-if="filteredOrders.length === 0" class="state-container">
        <div class="state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <h3 class="state-title">No matching orders</h3>
        <p class="state-text">Try adjusting your filters to find what you're looking for.</p>
        <button class="action-btn secondary-btn" @click="clearFilters">Clear Filters</button>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-list">
        <!-- Summary Row -->
        <div class="list-summary">
          <span class="summary-count">{{ filteredOrders.length }} order{{ filteredOrders.length !== 1 ? 's' : '' }}</span>
          <span class="summary-total">Total: <strong>₱{{ totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</strong></span>
        </div>

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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
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
              <span class="type-badge" :class="`badge-${(order.type || '').toLowerCase().replace('-','')}`">{{ order.type }}</span>
              <div class="expand-btn" :class="{ rotated: expandedOrder === order.id }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Expanded Details -->
          <div v-if="expandedOrder === order.id" class="card-body">
            <!-- Delivery Info -->
            <div v-if="order.location_type" class="detail-block">
              <div class="detail-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Delivery Location
              </div>
              <div class="location-row">
                <span class="location-label">{{ order.location_type }}</span>
                <span v-if="order.location_number" class="location-num">#{{ order.location_number }}</span>
              </div>
              <p v-if="order.delivery_notes" class="delivery-note">"{{ order.delivery_notes }}"</p>
            </div>

            <!-- Items -->
            <div class="detail-block">
              <div class="detail-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
                Items Ordered
              </div>
              <div class="items-table">
                <div v-for="(item, idx) in parseItems(order.items)" :key="idx" class="item-row">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-qty">×{{ item.quantity }}</span>
                  <span class="item-price">₱{{ parseFloat(item.subtotal).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
                </div>
              </div>
            </div>

            <!-- Payment -->
            <div class="detail-block payment-block">
              <div class="payment-row">
                <span>Payment Method</span>
                <span class="pay-value">{{ order.payment_method }}</span>
              </div>
              <div class="payment-row total-row">
                <span>Order Total</span>
                <span class="pay-total">₱{{ parseFloat(order.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="card-actions">
              <button class="card-btn reorder-btn" @click="reorder(order)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
                </svg>
                Order Again
              </button>
              <button class="card-btn delete-btn" @click="confirmDelete(order.id)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const API_BASE = 'http://localhost:8000/api/pos'

const props = defineProps({
  showHeader: { type: Boolean, default: true }
})
const emit = defineEmits(['close', 'reorder'])

// State
const orders = ref([])
const isLoading = ref(false)
const error = ref('')
const expandedOrder = ref(null)
const isPolling = ref(false)
const newOrderIds = ref([])
let pollingInterval = null

// Filters
const filters = ref({
  search: '',
  dateFrom: '',
  dateTo: '',
  amountMin: null,
  amountMax: null,
  sortBy: 'date_desc'
})

// Computed
const hasActiveFilters = computed(() =>
  filters.value.search || filters.value.dateFrom || filters.value.dateTo ||
  filters.value.amountMin || filters.value.amountMax
)

const filteredOrders = computed(() => {
  let result = [...orders.value]

  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    result = result.filter(o => o.receipt_no?.toLowerCase().includes(q))
  }

  if (filters.value.dateFrom) {
    result = result.filter(o => new Date(o.transaction_date) >= new Date(filters.value.dateFrom))
  }

  if (filters.value.dateTo) {
    result = result.filter(o => new Date(o.transaction_date) <= new Date(filters.value.dateTo))
  }

  if (filters.value.amountMin != null && filters.value.amountMin !== '') {
    result = result.filter(o => parseFloat(o.total_amount) >= filters.value.amountMin)
  }

  if (filters.value.amountMax != null && filters.value.amountMax !== '') {
    result = result.filter(o => parseFloat(o.total_amount) <= filters.value.amountMax)
  }

  // Sort
  const [sortField, sortDir] = filters.value.sortBy.split('_')
  result.sort((a, b) => {
    let va, vb
    if (sortField === 'date') {
      va = new Date(`${a.transaction_date} ${a.transaction_time}`)
      vb = new Date(`${b.transaction_date} ${b.transaction_time}`)
    } else {
      va = parseFloat(a.total_amount)
      vb = parseFloat(b.total_amount)
    }
    return sortDir === 'desc' ? vb - va : va - vb
  })

  return result
})

const totalAmount = computed(() =>
  filteredOrders.value.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
)

// Methods
const fetchOrders = async (silent = false) => {
  if (!silent) isLoading.value = true
  error.value = ''

  try {
    const response = await fetch(`${API_BASE}/transactions`)
    if (!response.ok) throw new Error('Failed to fetch orders')

    const all = await response.json()
    const filtered = all
      .filter(t => t.type === 'E-Shop')
      .sort((a, b) => new Date(`${b.transaction_date} ${b.transaction_time}`) - new Date(`${a.transaction_date} ${a.transaction_time}`))

    // Detect new orders for animation
    const existingIds = orders.value.map(o => o.id)
    const incoming = filtered.map(o => o.id)
    const newIds = incoming.filter(id => !existingIds.includes(id))
    if (newIds.length > 0 && orders.value.length > 0) {
      newOrderIds.value = newIds
      setTimeout(() => { newOrderIds.value = [] }, 3000)
    }

    orders.value = filtered

  } catch (err) {
    if (!silent) error.value = 'Failed to load order history. Please try again.'
    console.error('Error fetching orders:', err)
  } finally {
    isLoading.value = false
  }
}

// Polling for real-time updates (every 10 seconds)
const startPolling = () => {
  isPolling.value = true
  pollingInterval = setInterval(() => fetchOrders(true), 10000)
}

const stopPolling = () => {
  isPolling.value = false
  clearInterval(pollingInterval)
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

const formatTime = (t) => {
  if (!t) return ''
  return t.substring(0, 5)
}

const clearFilters = () => {
  filters.value = { search: '', dateFrom: '', dateTo: '', amountMin: null, amountMax: null, sortBy: 'date_desc' }
}

const reorder = (order) => {
  emit('reorder', parseItems(order.items))
  emit('close')
}

const confirmDelete = (id) => {
  if (confirm('Delete this order? This action cannot be undone.')) deleteOrder(id)
}

const deleteOrder = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error()
    orders.value = orders.value.filter(o => o.id !== id)
    if (expandedOrder.value === id) expandedOrder.value = null
  } catch {
    alert('Failed to delete order. Please try again.')
  }
}

onMounted(() => {
  fetchOrders()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.orders-page {
  font-family: 'Outfit', sans-serif;
  background: #f5f6fa;
  min-height: 100vh;
  color: #1a1d27;
}

/* ── Filter Panel ── */
.filter-panel {
  background: #fff;
  border-bottom: 1px solid #eaedf3;
  padding: 1.25rem 2rem;
}

.filter-grid {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
  gap: 1rem;
  align-items: end;
}

.filter-group { display: flex; flex-direction: column; gap: 0.4rem; }

.filter-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8b92a9;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 10px;
  color: #8b92a9;
  pointer-events: none;
  flex-shrink: 0;
}

.filter-input {
  width: 100%;
  padding: 0.55rem 0.75rem 0.55rem 2rem;
  border: 1.5px solid #eaedf3;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  color: #1a1d27;
  background: #fafbfc;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.filter-input:focus {
  border-color: #3d6bfd;
  box-shadow: 0 0 0 3px rgba(61, 107, 253, 0.1);
  background: #fff;
}

.filter-select { padding-left: 0.75rem; cursor: pointer; }

.date-input { cursor: pointer; }

.clear-input {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #8b92a9;
  cursor: pointer;
  line-height: 1;
}

.amount-range {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.amount-input {
  padding-left: 0.65rem;
  flex: 1;
}

.range-sep { color: #8b92a9; font-size: 0.9rem; flex-shrink: 0; }

.filter-footer {
  max-width: 960px;
  margin: 0.75rem auto 0;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f1f5;
}

.active-filter-tags {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-count {
  font-size: 0.82rem;
  color: #3d6bfd;
  font-weight: 700;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #8b92a9;
  cursor: pointer;
  transition: color 0.15s;
}

.clear-all-btn:hover { color: #ef4444; }

/* ── Content Area ── */
.content-area {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 2rem 3rem;
}

/* ── States ── */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.state-icon {
  width: 64px;
  height: 64px;
  background: #f0f1f5;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b92a9;
  margin-bottom: 1.25rem;
}

.state-icon.error-icon { background: #fef2f2; color: #ef4444; }

.state-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1d27;
  margin-bottom: 0.4rem;
}

.state-text {
  font-size: 0.88rem;
  color: #8b92a9;
  max-width: 280px;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

/* Loader */
.loader {
  position: relative;
  width: 48px;
  height: 48px;
  margin-bottom: 1.25rem;
}

.loader-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  animation: loader-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.loader-ring:nth-child(1) { border-top-color: #3d6bfd; animation-delay: -0.45s; }
.loader-ring:nth-child(2) { border-top-color: #a5b4fc; animation-delay: -0.3s; }
.loader-ring:nth-child(3) { border-top-color: #e0e7ff; animation-delay: -0.15s; }

@keyframes loader-spin { to { transform: rotate(360deg); } }

/* Buttons */
.action-btn {
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.primary-btn { background: #3d6bfd; color: #fff; }
.primary-btn:hover { background: #2d5bf0; }
.secondary-btn { background: #f0f1f5; color: #1a1d27; }
.secondary-btn:hover { background: #e5e7ef; }

/* ── Orders List ── */
.list-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.83rem;
  color: #8b92a9;
  font-weight: 500;
}

.summary-total strong { color: #1a1d27; }

.order-card {
  background: #fff;
  border: 1.5px solid #eaedf3;
  border-radius: 12px;
  margin-bottom: 0.65rem;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.order-card:hover { border-color: #c7d2fe; box-shadow: 0 2px 12px rgba(61, 107, 253, 0.06); }
.order-card.is-expanded { border-color: #3d6bfd; box-shadow: 0 4px 20px rgba(61, 107, 253, 0.1); }

.order-card.is-new {
  animation: new-order-flash 3s ease;
}

@keyframes new-order-flash {
  0% { background: #eff6ff; border-color: #3d6bfd; }
  100% { background: #fff; border-color: #eaedf3; }
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

.card-header:hover { background: #fafbfc; }

.card-left { display: flex; align-items: center; gap: 0.85rem; }

.receipt-icon-wrap {
  width: 38px;
  height: 38px;
  background: #eff6ff;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3d6bfd;
  flex-shrink: 0;
}

.receipt-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.88rem;
  font-weight: 500;
  color: #1a1d27;
}

.order-datetime {
  font-size: 0.78rem;
  color: #8b92a9;
  margin-top: 0.2rem;
}

.dot-sep { margin: 0 0.3rem; }

.card-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.order-amount {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1a1d27;
  letter-spacing: -0.3px;
}

.type-badge {
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.badge-eshop { background: #eff6ff; color: #2563eb; }
.badge-walkin { background: #fdf4ff; color: #7c3aed; }
.badge-delivery { background: #f0fdf4; color: #16a34a; }

.expand-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b92a9;
  transition: transform 0.25s;
}

.expand-btn.rotated { transform: rotate(180deg); }

/* Card Body */
.card-body {
  border-top: 1.5px solid #eaedf3;
  padding: 1.25rem;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-block { margin-bottom: 1.25rem; }
.detail-block:last-of-type { margin-bottom: 0; }

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.73rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #8b92a9;
  margin-bottom: 0.65rem;
}

.location-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-label { font-weight: 600; color: #1a1d27; font-size: 0.9rem; }

.location-num {
  background: #3d6bfd;
  color: #fff;
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.delivery-note {
  margin-top: 0.4rem;
  color: #8b92a9;
  font-size: 0.83rem;
  font-style: italic;
}

/* Items Table */
.items-table {
  background: #fafbfc;
  border: 1px solid #eaedf3;
  border-radius: 8px;
  overflow: hidden;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid #eaedf3;
  font-size: 0.87rem;
}

.item-row:last-child { border-bottom: none; }

.item-name { flex: 1; font-weight: 600; color: #1a1d27; }
.item-qty { color: #8b92a9; margin-right: 1.5rem; font-size: 0.82rem; }
.item-price { font-weight: 700; color: #3d6bfd; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }

/* Payment Block */
.payment-block {
  background: #fafbfc;
  border: 1px solid #eaedf3;
  border-radius: 8px;
  padding: 0.75rem 0.9rem;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0;
  font-size: 0.87rem;
  color: #4b5168;
}

.pay-value { font-weight: 600; color: #1a1d27; }

.total-row {
  border-top: 1px solid #eaedf3;
  margin-top: 0.35rem;
  padding-top: 0.6rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1a1d27;
}

.pay-total {
  color: #3d6bfd;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.05rem;
  font-weight: 700;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.card-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem;
  border: none;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.reorder-btn {
  background: #3d6bfd;
  color: #fff;
}
.reorder-btn:hover { background: #2d5bf0; transform: translateY(-1px); }

.delete-btn {
  background: #fef2f2;
  color: #ef4444;
  border: 1.5px solid #fee2e2;
}
.delete-btn:hover { background: #ef4444; color: #fff; transform: translateY(-1px); }

/* ── Responsive ── */
@media (max-width: 900px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .page-header, .filter-panel { padding: 1rem; }
  .content-area { padding: 1rem; }
  .filter-grid { grid-template-columns: 1fr; gap: 0.75rem; }
  .header-content { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .card-actions { flex-direction: column; }
  .card-right { gap: 0.5rem; }
  .order-amount { font-size: 0.95rem; }
}
</style>