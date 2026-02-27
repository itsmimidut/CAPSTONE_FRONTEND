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

    <!-- Pagination -->
    <div v-if="orders.length > 0" class="pagination">
      <span class="pagination-info">
        Showing {{ orders.length }} of {{ totalOrders }} orders
      </span>
      <button 
        v-if="hasMore" 
        class="load-more-btn"
        @click="loadMore"
      >
        Load More
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_BASE = 'http://localhost:8000/api/pos'

// Props & Emits
const props = defineProps({
  showHeader: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'reorder'])

// State
const orders = ref([])
const isLoading = ref(false)
const error = ref('')
const expandedOrder = ref(null)
const totalOrders = ref(0)
const hasMore = ref(false)

// Methods
const fetchOrders = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    // For now, fetch all E-Shop orders
    // TODO: Filter by customer_id when user authentication is implemented
    const response = await fetch(`${API_BASE}/transactions`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }

    const allTransactions = await response.json()
    
    // Filter only E-Shop orders
    orders.value = allTransactions
      .filter(t => t.type === 'E-Shop')
      .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
    
    totalOrders.value = orders.value.length
    
  } catch (err) {
    console.error('Error fetching orders:', err)
    error.value = 'Failed to load order history. Please try again.'
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
  totalOrders.value = 0
  hasMore.value = false
}

const deleteSelectedOrder = () => {
  if (!expandedOrder.value) {
    return alert('Please open an order first to select it, then try again.')
  }

  const selectedId = expandedOrder.value
  const selected = orders.value.find(o => o.id === selectedId)

  const label = selected?.receipt_no ? `Receipt ${selected.receipt_no}` : 'this order'
  const ok = window.confirm(`Delete ${label} from the list?`)
  if (!ok) return

  const idx = orders.value.findIndex(o => o.id === selectedId)
  if (idx >= 0) {
    orders.value.splice(idx, 1)
    totalOrders.value = orders.value.length
  }

  expandedOrder.value = null
}

const toggleOrder = (orderId) => {
  expandedOrder.value = expandedOrder.value === orderId ? null : orderId
}

const parseItems = (itemsJson) => {
  // If already an array, return it
  if (Array.isArray(itemsJson)) {
    return itemsJson
  }
  
  // Otherwise, try to parse JSON string
  try {
    return JSON.parse(itemsJson)
  } catch (e) {
    return []
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr.substring(0, 5) // HH:MM
}

const getStatusClass = (type) => {
  return {
    'status-eshop': type === 'E-Shop',
    'status-walkin': type === 'Walk-in',
    'status-delivery': type === 'Delivery'
  }
}

/* Send selected order items back to Cart via existing emit pathway */
const reorder = (order) => {
  const items = parseItems(order.items)
  emit('reorder', items)
  emit('close')
}

const loadMore = () => {
  // TODO: Implement pagination
  console.log('Load more orders')
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-history-container {
  background: transparent;
  min-height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Header */
.history-header {
  background: white;
  padding: 1.05rem 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  position: sticky;
  top: 0;
  z-index: 10;
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
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f1f3f5;
  border: none;
  color: #495057;
  font-size: 1.15rem;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e9ecef;
  transform: scale(1.06);
}

/* Loading State */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
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
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 0.9rem;
}

.retry-btn {
  background: #1e40af;
  color: white;
  border: 1px solid #1e40af;
  padding: 0.62rem 1.5rem;
  border-radius: 10px;
  font-weight: 900;
  cursor: pointer;
  margin-top: 0.8rem;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 8px 14px rgba(30, 64, 175, 0.18);
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
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 0.8rem;
}

.empty-state h3 {
  font-size: 1.35rem;
  color: #2c3e50;
  margin-bottom: 0.35rem;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

.browse-btn {
  background: #1e40af;
  color: white;
  border: 1px solid #1e40af;
  padding: 0.62rem 1.5rem;
  border-radius: 10px;
  font-weight: 900;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
}

.browse-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 8px 14px rgba(30, 64, 175, 0.18);
}

/* Orders List (maximize visible content; tighter, not crowded) */
.orders-list {
  flex: 1;
  padding: 0.85rem 1.05rem;
}

/* Layout: actions left, orders right */
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

/* Buttons: uniform width; prevent wrapping for long label */
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
  transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s;
  white-space: nowrap;
}

.action-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.18);
}

.action-icon {
  font-size: 0.95rem;
  line-height: 1;
  flex: 0 0 auto;
}

/* Solid palette */
.action-refresh {
  background: #ffffff;
  color: #1e40af;
  border-color: rgba(30, 64, 175, 0.22);
}

.action-refresh:hover {
  background: rgba(30, 64, 175, 0.06);
  border-color: rgba(30, 64, 175, 0.35);
  transform: translateY(-1px);
}

.action-delete-all {
  background: #1e40af;
  color: #ffffff;
  border-color: #1e40af;
  box-shadow: 0 7px 12px rgba(30, 64, 175, 0.14);
}

.action-delete-all:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 10px 16px rgba(30, 64, 175, 0.18);
}

.action-delete-one {
  background: #d4af37;
  color: #1e3a8a;
  border-color: rgba(212, 175, 55, 0.95);
}

.action-delete-one:hover {
  background: #b8941f;
  border-color: #b8941f;
  transform: translateY(-1px);
}

/* Hint (compact) */
.orders-actions-hint {
  width: 200px;
  max-width: 200px;
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin-top: 0.08rem;
  padding-top: 0.45rem;
  border-top: 1px solid rgba(30, 64, 175, 0.12);
}

.hint-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(30, 64, 175, 0.45);
  margin-top: 0.25rem;
  flex: 0 0 auto;
}

.hint-text {
  font-size: 0.82rem;
  color: #6b7280;
  font-weight: 800;
  line-height: 1.25;
}

/* Orders Feed */
.orders-feed {
  min-width: 0;
}

/* Slim Order Cards with separation */
.order-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  margin-bottom: 0.6rem;
  border: 1px solid rgba(30, 64, 175, 0.14);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s, background 0.2s;
}

.order-card:hover {
  border-color: rgba(30, 64, 175, 0.26);
  box-shadow: 0 7px 14px rgba(30, 64, 175, 0.10);
  transform: translateY(-1px);
}

.order-card.expanded {
  border-color: rgba(212, 175, 55, 0.55);
  box-shadow: 0 9px 16px rgba(30, 64, 175, 0.12);
  background: #ffffff;
}

/* Compact header: [Order ID] [Date] in same line */
.order-header {
  padding: 0.58rem 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.2s;
}

.order-header:hover {
  background: rgba(30, 64, 175, 0.03);
}

.order-info {
  flex: 1;
  min-width: 0;
}

.receipt-badge {
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
  color: #111827;
  font-size: 0.92rem;
  line-height: 1.1;
  flex: 0 0 auto;
}

.order-date-inline {
  font-size: 0.86rem;
  font-weight: 800;
  color: #6b7280;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

/* Keep meta hidden in compact list view (still functional in DOM) */
.order-meta {
  display: none;
}

.order-summary {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex: 0 0 auto;
}

.order-total {
  font-size: 1.02rem;
  font-weight: 900;
  color: #1e40af;
  line-height: 1.1;
}

/* Hide status chip in compact list view (kept in DOM) */
.order-status {
  display: none;
}

.expand-icon {
  background: rgba(30, 64, 175, 0.06);
  border: 1px solid rgba(30, 64, 175, 0.12);
  color: #1e40af;
  font-size: 0.82rem;
  cursor: pointer;
  padding: 0.34rem 0.46rem;
  border-radius: 10px;
}

/* Order Details */
.order-details {
  padding: 0 0.9rem 0.9rem;
  border-top: 1px solid rgba(30, 64, 175, 0.10);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 1000px; }
}

.detail-section {
  margin-top: 0.85rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.96rem;
  font-weight: 900;
  color: #111827;
  margin-bottom: 0.6rem;
}

.section-icon {
  font-size: 1.2rem;
}

.location-info {
  background: rgba(30, 64, 175, 0.04);
  padding: 0.6rem 0.85rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(30, 64, 175, 0.10);
}

.location-type {
  font-weight: 900;
  color: #374151;
}

.location-number {
  background: #1e40af;
  color: white;
  padding: 0.18rem 0.7rem;
  border-radius: 999px;
  font-weight: 900;
  font-size: 0.9rem;
}

.delivery-notes {
  margin-top: 0.4rem;
  color: #6b7280;
  font-size: 0.9rem;
  font-style: italic;
}

.items-list {
  background: rgba(30, 64, 175, 0.04);
  padding: 0.6rem;
  border-radius: 10px;
  border: 1px solid rgba(30, 64, 175, 0.10);
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.65rem;
  background: #ffffff;
  border: 1px solid rgba(30, 64, 175, 0.08);
  border-radius: 8px;
  margin-bottom: 0.45rem;
}

.order-item:last-child {
  margin-bottom: 0;
}

.item-info {
  display: flex;
  gap: 0.75rem;
}

.item-name {
  font-weight: 900;
  color: #111827;
}

.item-qty {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 800;
}

.item-price {
  font-weight: 900;
  color: #1e40af;
}

.payment-section {
  background: rgba(212, 175, 55, 0.10);
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.20);
}

.payment-row {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  color: #374151;
  font-weight: 800;
}

.payment-value {
  font-weight: 900;
  color: #111827;
}

.total-row {
  border-top: 1px solid rgba(212, 175, 55, 0.25);
  margin-top: 0.4rem;
  padding-top: 0.6rem;
  font-weight: 900;
  font-size: 1.05rem;
}

.total-value {
  color: #1e40af;
  font-size: 1.2rem;
}

/* Order Again button */
.reorder-btn {
  width: 100%;
  background: #1e40af;
  color: white;
  border: 1px solid #1e40af;
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
}

.reorder-btn:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 10px 14px rgba(30, 64, 175, 0.18);
}

.btn-icon {
  font-size: 1.05rem;
}

/* Pagination */
.pagination {
  background: white;
  padding: 0.9rem 1.05rem;
  border-top: 1px solid rgba(30, 64, 175, 0.10);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 800;
}

.load-more-btn {
  background: #1e40af;
  color: white;
  border: 1px solid #1e40af;
  padding: 0.55rem 1.0rem;
  border-radius: 10px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s, background 0.2s, border-color 0.2s;
}

.load-more-btn:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 10px 14px rgba(30, 64, 175, 0.18);
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

  /* Show status on wider stacked layout if helpful */
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