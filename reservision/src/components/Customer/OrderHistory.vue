<template>
  <div class="order-history-container">
    <!-- Header (only show for standalone mode) -->
    <div v-if="showHeader" class="history-header">
      <div class="header-left">
        <span class="header-icon">📜</span>
        <h2 class="header-title">My Order History</h2>
      </div>
      <button class="close-btn" @click="$emit('close')">✕</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your orders...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">😢</span>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchOrders">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="empty-state">
      <span class="empty-icon">🛒</span>
      <h3>No orders yet</h3>
      <p>Your order history will appear here</p>
      <button v-if="showHeader" class="browse-btn" @click="$emit('close')">Browse Menu</button>
    </div>

    <!-- Orders List -->
    <div v-else class="orders-list">
      <!-- Sidebar Layout: Left Actions / Right Orders -->
      <div class="orders-layout">
        <!-- My Orders Actions (Left, Vertical) -->
        <div class="orders-actions" aria-label="My Orders actions">
          <button class="action-btn action-refresh" @click="refreshOrders">
            <span class="action-icon">⟳</span>
            Refresh
          </button>
          <button class="action-btn action-delete-all" @click="deleteAllOrders">
            <span class="action-icon">🗑️</span>
            Delete All
          </button>
          <button class="action-btn action-delete-one" @click="deleteSelectedOrder">
            <span class="action-icon">✕</span>
            Delete Specific Order
          </button>

          <div class="orders-actions-hint">
            <span class="hint-dot"></span>
            <span class="hint-text">Tip: Open an order to select it before deleting.</span>
          </div>
        </div>

        <!-- Orders (Right) -->
        <div class="orders-feed">
          <div 
            v-for="order in orders" 
            :key="order.id"
            class="order-card"
            :class="{ expanded: expandedOrder === order.id }"
          >
            <!-- Order Header -->
            <div class="order-header" @click="toggleOrder(order.id)">
              <div class="order-info">
                <div class="receipt-badge">
                  <span class="receipt-icon">🧾</span>
                  <span class="receipt-no">{{ order.receipt_no }}</span>

                  <!-- Restored Date (same line as Order ID) -->
                  <span class="order-date-inline">{{ formatDate(order.transaction_date) }}</span>
                </div>

                <!-- Keep existing meta in DOM (for responsiveness / future use) -->
                <div class="order-meta">
                  <span class="order-date">{{ formatDate(order.transaction_date) }}</span>
                  <span class="order-time">{{ formatTime(order.transaction_time) }}</span>
                </div>
              </div>

              <div class="order-summary">
                <div class="order-total">₱{{ order.total_amount }}</div>

                <!-- Keep status in DOM (can be shown on wider layouts if needed) -->
                <div class="order-status" :class="getStatusClass(order.type)">
                  {{ order.type }}
                </div>

                <button class="expand-icon">
                  {{ expandedOrder === order.id ? '▼' : '▶' }}
                </button>
              </div>
            </div>

            <!-- Order Details (Expandable) -->
            <div v-if="expandedOrder === order.id" class="order-details">
              <!-- Delivery Location -->
              <div v-if="order.location_type" class="detail-section">
                <h4 class="section-title">
                  <span class="section-icon">📍</span>
                  Delivery Location
                </h4>
                <div class="location-info">
                  <span class="location-type">{{ order.location_type }}</span>
                  <span v-if="order.location_number" class="location-number">
                    #{{ order.location_number }}
                  </span>
                </div>
                <p v-if="order.delivery_notes" class="delivery-notes">
                  <em>"{{ order.delivery_notes }}"</em>
                </p>
              </div>

              <!-- Items Ordered -->
              <div class="detail-section">
                <h4 class="section-title">
                  <span class="section-icon">🍽️</span>
                  Items Ordered
                </h4>
                <div class="items-list">
                  <div 
                    v-for="(item, idx) in parseItems(order.items)"
                    :key="idx"
                    class="order-item"
                  >
                    <div class="item-info">
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-qty">× {{ item.quantity }}</span>
                    </div>
                    <span class="item-price">₱{{ item.subtotal }}</span>
                  </div>
                </div>
              </div>

              <!-- Payment Info -->
              <div class="detail-section payment-section">
                <div class="payment-row">
                  <span>Payment Method:</span>
                  <span class="payment-value">{{ order.payment_method }}</span>
                </div>
                <div class="payment-row total-row">
                  <span>Total Amount:</span>
                  <span class="total-value">₱{{ order.total_amount }}</span>
                </div>
              </div>

              <!-- Reorder Button -->
              <button class="reorder-btn" @click="reorder(order)">
                <span class="btn-icon">🔄</span>
                Order Again
              </button>
            </div>
          </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

  if (filters.value.dateFrom) {
    result = result.filter(
      o => new Date(o.transaction_date) >= new Date(filters.value.dateFrom)
    )
  }

  if (filters.value.dateTo) {
    result = result.filter(
      o => new Date(o.transaction_date) <= new Date(filters.value.dateTo)
    )
  }

  if (filters.value.amountMin != null && filters.value.amountMin !== '') {
    result = result.filter(
      o => parseFloat(o.total_amount) >= filters.value.amountMin
    )
  }

  if (filters.value.amountMax != null && filters.value.amountMax !== '') {
    result = result.filter(
      o => parseFloat(o.total_amount) <= filters.value.amountMax
    )
  }

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
      .sort(
        (a, b) =>
          new Date(`${b.transaction_date} ${b.transaction_time}`) -
          new Date(`${a.transaction_date} ${a.transaction_time}`)
      )

    const existingIds = orders.value.map(o => o.id)
    const incomingIds = filtered.map(o => o.id)
    const newIds = incomingIds.filter(id => !existingIds.includes(id))

    if (newIds.length > 0 && orders.value.length > 0) {
      newOrderIds.value = newIds
      setTimeout(() => {
        newOrderIds.value = []
      }, 3000)
    }

    orders.value = filtered
  } catch (err) {
    if (!silent) {
      error.value = 'Failed to load order history. Please try again.'
    }
    console.error('Error fetching orders:', err)
  } finally {
    isLoading.value = false
  }
}

const refreshOrders = () => {
  fetchOrders()
}

const deleteAllOrders = () => {
  const ok = window.confirm('Delete all orders from the list? This will clear the current view.')
  if (!ok) return

  orders.value = []
  expandedOrder.value = null
}

const deleteSelectedOrder = () => {
  if (!expandedOrder.value) {
    alert('Please open an order first to select it, then try again.')
    return
  }

  const selectedId = expandedOrder.value
  const selected = orders.value.find(o => o.id === selectedId)
  const label = selected?.receipt_no ? `Receipt ${selected.receipt_no}` : 'this order'

  const ok = window.confirm(`Delete ${label} from the list?`)
  if (!ok) return

  orders.value = orders.value.filter(o => o.id !== selectedId)
  expandedOrder.value = null
}

const toggleOrder = (id) => {
  expandedOrder.value = expandedOrder.value === id ? null : id
}

const parseItems = (items) => {
  if (Array.isArray(items)) return items

  try {
    return JSON.parse(items)
  } catch {
    return []
  }
}

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (t) => {
  if (!t) return ''
  return t.substring(0, 5)
}

const clearFilters = () => {
  filters.value = {
    search: '',
    dateFrom: '',
    dateTo: '',
    amountMin: null,
    amountMax: null,
    sortBy: 'date_desc'
  }
}

const reorder = (order) => {
  emit('reorder', parseItems(order.items))
  emit('close')
}

const confirmDelete = (id) => {
  const ok = window.confirm('Delete this order? This action cannot be undone.')
  if (ok) deleteOrder(id)
}

const deleteOrder = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!res.ok) throw new Error('Delete failed')

    orders.value = orders.value.filter(o => o.id !== id)

    if (expandedOrder.value === id) {
      expandedOrder.value = null
    }
  } catch (err) {
    console.error('Delete error:', err)
    alert('Failed to delete order. Please try again.')
  }
}

const startPolling = () => {
  stopPolling()
  isPolling.value = true

  pollingInterval = setInterval(() => {
    fetchOrders(true)
  }, 10000)
}

const stopPolling = () => {
  isPolling.value = false

  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
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
/* ========================================
   Apply SAME Tropical Resort Palette (Color-only)
   - Ocean Blue (primary):    #1E88B6
   - Ocean Blue (light):      #4AA3D0
   - Ocean Blue (dark):       #166B8F
   - Ocean Blue (pale):       #E3F2F9
   - Sunflower Gold (accent): #F2C200
   - Sunflower Gold (light):  #FFD633
   - Sunflower Gold (dark):   #C99F00
   - Text on dark:            #FFFFFF
   - Text on light:           #0B2230 (deep teal-ish)
   ======================================== */

.order-history-container {
  background: #E3F2F9; /* pale ocean surface */
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
  color: #0B2230; /* readable on pale bg */
}

/* Header */
.history-header {
  background: #166B8F; /* ocean dark */
  padding: 1.05rem 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid rgba(242, 194, 0, 0.35); /* gold hint */
  box-shadow: 0 10px 18px rgba(22, 107, 143, 0.18);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.header-icon {
  font-size: 1.65rem;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff; /* white text on dark header */
  margin: 0;
}

.close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 1.15rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(242, 194, 0, 0.20);
  border-color: rgba(242, 194, 0, 0.55);
  color: #ffffff;
  transform: scale(1.06);
}

/* ── Orders List ── */
.list-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.1rem;
  color: #0B2230;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(30, 136, 182, 0.18); /* ocean ring */
  border-top: 4px solid #F2C200; /* gold */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.8rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.1rem;
  text-align: center;
  color: #0B2230;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 0.9rem;
}

.retry-btn {
  background: #1E88B6; /* ocean primary */
  color: #ffffff;
  border: 1px solid #1E88B6;
  padding: 0.62rem 1.5rem;
  border-radius: 10px;
  font-weight: 900;
  cursor: pointer;
  margin-top: 0.8rem;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s, border-color 0.2s;
  box-shadow: 0 10px 16px rgba(22, 107, 143, 0.18);
}

.retry-btn:hover {
  background: #4AA3D0; /* ocean light */
  border-color: #4AA3D0;
  transform: translateY(-1px);
  box-shadow: 0 14px 22px rgba(22, 107, 143, 0.22);
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.1rem;
  text-align: center;
  color: #0B2230;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 0.8rem;
}

.empty-state h3 {
  font-size: 1.35rem;
  color: #0B2230;
  margin-bottom: 0.35rem;
}

.empty-state p {
  color: rgba(11, 34, 48, 0.75);
  margin-bottom: 1.5rem;
}

.browse-btn {
  background: #F2C200;
  color: #0B2230;
  border: 1px solid #F2C200;
  padding: 0.62rem 1.5rem;
  border-radius: 10px;
  font-weight: 900;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s, border-color 0.2s;
  box-shadow: 0 12px 18px rgba(242, 194, 0, 0.22);
}

.browse-btn:hover {
  background: #FFD633;
  border-color: #FFD633;
  transform: translateY(-1px);
  box-shadow: 0 16px 22px rgba(242, 194, 0, 0.26);
}

/* Orders List */
.orders-list {
  flex: 1;
  padding: 0.85rem 1.05rem;
}

/* Layout */
.orders-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 0.8rem;
  align-items: start;
}

/* Actions */
.orders-actions {
  position: sticky;
  top: 72px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
}

.action-btn {
  width: 200px;
  max-width: 200px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.52rem 0.72rem;
  border-radius: 10px;
  font-weight: 900;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s, color 0.2s;
  white-space: nowrap;
}

.action-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 136, 182, 0.22);
}

.action-icon {
  font-size: 0.95rem;
  line-height: 1;
  flex: 0 0 auto;
}

/* Refresh */
.action-refresh {
  background: rgba(255, 255, 255, 0.92);
  color: #166B8F;
  border-color: rgba(22, 107, 143, 0.22);
}

.action-refresh:hover {
  background: rgba(30, 136, 182, 0.10);
  border-color: rgba(30, 136, 182, 0.35);
  transform: translateY(-1px);
}

/* Delete All */
.action-delete-all {
  background: #1E88B6;
  color: #ffffff;
  border-color: #1E88B6;
  box-shadow: 0 10px 16px rgba(22, 107, 143, 0.18);
}

.action-delete-all:hover {
  background: #4AA3D0;
  border-color: #4AA3D0;
  transform: translateY(-1px);
  box-shadow: 0 14px 22px rgba(22, 107, 143, 0.22);
}

/* Delete One */
.action-delete-one {
  background: #F2C200;
  color: #0B2230;
  border-color: #F2C200;
  box-shadow: 0 12px 18px rgba(242, 194, 0, 0.22);
}

.action-delete-one:hover {
  background: #FFD633;
  border-color: #FFD633;
  transform: translateY(-1px);
  box-shadow: 0 16px 22px rgba(242, 194, 0, 0.26);
}

/* Hint */
.orders-actions-hint {
  width: 200px;
  max-width: 200px;
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin-top: 0.08rem;
  padding-top: 0.45rem;
  border-top: 1px solid rgba(22, 107, 143, 0.18);
}

.hint-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #F2C200;
  margin-top: 0.25rem;
  flex: 0 0 auto;
  box-shadow: 0 0 0 3px rgba(242, 194, 0, 0.16);
}

.hint-text {
  font-size: 0.82rem;
  color: rgba(11, 34, 48, 0.70);
  font-weight: 800;
  line-height: 1.25;
}

/* Orders Feed */
.orders-feed {
  min-width: 0;
}

/* Order Cards */
.order-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 12px;
  margin-bottom: 0.6rem;
  border: 1px solid rgba(22, 107, 143, 0.16);
  box-shadow: 0 10px 18px rgba(22, 107, 143, 0.10);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s, background 0.2s;
}

.order-card:hover {
  border-color: rgba(30, 136, 182, 0.26);
  box-shadow: 0 14px 24px rgba(22, 107, 143, 0.14);
  transform: translateY(-1px);
}

.order-card.expanded {
  border-color: rgba(242, 194, 0, 0.55);
  box-shadow: 0 16px 26px rgba(22, 107, 143, 0.16);
  background: #ffffff;
}

/* Order Header */
.order-header {
  padding: 0.58rem 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.order-header:hover {
  background: rgba(30, 136, 182, 0.08);
}

.order-info {
  flex: 1;
  min-width: 0;
}

.receipt-icon-wrap {
  width: 38px;
  height: 38px;
  background: #eff6ff;
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0;
  min-width: 0;
}

.receipt-icon {
  font-size: 1.05rem;
  flex: 0 0 auto;
}

.receipt-no {
  font-weight: 900;
  color: #0B2230;
  font-size: 0.92rem;
  line-height: 1.1;
  flex: 0 0 auto;
}

.order-date-inline {
  font-size: 0.86rem;
  font-weight: 800;
  color: rgba(11, 34, 48, 0.65);
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.order-meta {
  display: none;
}

.card-right {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex: 0 0 auto;
}

.order-total {
  font-size: 1.02rem;
  font-weight: 900;
  color: #166B8F;
  line-height: 1.1;
}

.order-status {
  display: none;
}

.expand-icon {
  background: rgba(30, 136, 182, 0.10);
  border: 1px solid rgba(30, 136, 182, 0.18);
  color: #166B8F;
  font-size: 0.82rem;
  cursor: pointer;
  padding: 0.34rem 0.46rem;
  border-radius: 10px;
  transition: background 0.2s, border-color 0.2s, transform 0.15s, color 0.2s;
}

.expand-icon:hover {
  background: rgba(242, 194, 0, 0.20);
  border-color: rgba(242, 194, 0, 0.55);
  color: #0B2230;
  transform: translateY(-1px);
}

/* Order Details */
.order-details {
  padding: 0 0.9rem 0.9rem;
  border-top: 1px solid rgba(22, 107, 143, 0.12);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 1000px; }
}

.detail-section {
  margin-top: 0.85rem;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.96rem;
  font-weight: 900;
  color: #0B2230;
  margin-bottom: 0.6rem;
}

.section-icon {
  font-size: 1.2rem;
}

/* Location */
.location-info {
  background: rgba(30, 136, 182, 0.08);
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(30, 136, 182, 0.16);
}

.location-type {
  font-weight: 900;
  color: #0B2230;
}

.location-number {
  background: #F2C200;
  color: #0B2230;
  padding: 0.18rem 0.7rem;
  border-radius: 999px;
  font-weight: 900;
  font-size: 0.9rem;
  border: 1px solid rgba(242, 194, 0, 0.75);
}

.delivery-notes {
  margin-top: 0.4rem;
  color: rgba(11, 34, 48, 0.70);
  font-size: 0.9rem;
  font-style: italic;
}

/* Items */
.items-list {
  background: rgba(30, 136, 182, 0.08);
  padding: 0.6rem;
  border-radius: 10px;
  border: 1px solid rgba(30, 136, 182, 0.16);
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.65rem;
  background: #ffffff;
  border: 1px solid rgba(22, 107, 143, 0.10);
  border-radius: 8px;
  margin-bottom: 0.45rem;
}

.order-item:last-child {
  margin-bottom: 0;
}

.item-name { flex: 1; font-weight: 600; color: #1a1d27; }
.item-qty { color: #8b92a9; margin-right: 1.5rem; font-size: 0.82rem; }
.item-price { font-weight: 700; color: #3d6bfd; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }

.item-name {
  font-weight: 900;
  color: #0B2230;
}

.item-qty {
  color: rgba(11, 34, 48, 0.65);
  font-size: 0.9rem;
  font-weight: 800;
}

.item-price {
  font-weight: 900;
  color: #166B8F;
}

/* Payment */
.payment-section {
  background: rgba(30, 136, 182, 0.08);
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid rgba(30, 136, 182, 0.18);
}

.payment-row {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  color: rgba(11, 34, 48, 0.80);
  font-weight: 800;
}

.payment-value {
  font-weight: 900;
  color: #0B2230;
}

.total-row {
  border-top: 2px solid rgba(242, 194, 0, 0.55);
  margin-top: 0.4rem;
  padding-top: 0.6rem;
  font-weight: 900;
  font-size: 1.05rem;
}

.total-value {
  color: #166B8F;
  font-size: 1.2rem;
}

/* Order Again */
.reorder-btn {
  width: 100%;
  background: #F2C200;
  color: #0B2230;
  border: 1px solid #F2C200;
  padding: 0.72rem;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
  margin-top: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.15s, box-shadow 0.2s, background 0.2s, border-color 0.2s;
  box-shadow: 0 14px 20px rgba(242, 194, 0, 0.22);
}

.reorder-btn:hover {
  background: #FFD633;
  border-color: #FFD633;
  transform: translateY(-1px);
  box-shadow: 0 18px 26px rgba(242, 194, 0, 0.26);
}

.btn-icon {
  font-size: 1.05rem;
}

/* Pagination */
.pagination {
  background: rgba(255, 255, 255, 0.92);
  padding: 0.9rem 1.05rem;
  border-top: 1px solid rgba(22, 107, 143, 0.14);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-info {
  color: rgba(11, 34, 48, 0.70);
  font-size: 0.9rem;
  font-weight: 800;
}

.load-more-btn {
  background: #1E88B6;
  color: #ffffff;
  border: 1px solid #1E88B6;
  padding: 0.55rem 1.0rem;
  border-radius: 10px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s, background 0.2s, border-color 0.2s;
  box-shadow: 0 10px 16px rgba(22, 107, 143, 0.18);
}

.load-more-btn:hover {
  background: #4AA3D0;
  border-color: #4AA3D0;
  transform: translateY(-1px);
  box-shadow: 0 14px 22px rgba(22, 107, 143, 0.22);
}

/* Status chips (kept for responsive/wider layouts) */
.status-eshop {
  background: rgba(242, 194, 0, 0.20);
  border-color: rgba(242, 194, 0, 0.45);
  color: #0B2230;
}

.status-walkin,
.status-delivery {
  background: rgba(30, 136, 182, 0.12);
  border-color: rgba(30, 136, 182, 0.22);
  color: #0B2230;
}

/* Responsive */
@media (max-width: 768px) {
  .orders-list {
    padding: 0.8rem 0.95rem;
  }

  .orders-layout {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .orders-actions {
    position: static;
    top: auto;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .action-btn {
    width: auto;
    max-width: none;
    flex: 1 1 180px;
    min-width: 180px;
  }

  .orders-actions-hint {
    width: 100%;
    max-width: none;
    border-top: none;
    padding-top: 0;
    margin-top: 0.1rem;
  }

  .order-status {
    display: inline-flex;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    font-weight: 900;
    font-size: 0.76rem;
    border: 1px solid transparent;
  }
}

@media (max-width: 480px) {
  .orders-list {
    padding: 0.75rem;
  }

  .order-header {
    padding: 0.55rem 0.8rem;
    gap: 0.6rem;
  }

  .order-summary {
    gap: 0.5rem;
  }

  .expand-icon {
    padding: 0.32rem 0.44rem;
  }

  .order-status {
    display: none;
  }

  .order-date-inline {
    font-size: 0.83rem;
  }
}
</style>