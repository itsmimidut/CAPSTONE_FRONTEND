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
            </div>
            <div class="order-meta">
              <span class="order-date">{{ formatDate(order.transaction_date) }}</span>
              <span class="order-time">{{ formatTime(order.transaction_time) }}</span>
            </div>
          </div>
          <div class="order-summary">
            <div class="order-total">₱{{ order.total_amount }}</div>
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

const toggleOrder = (orderId) => {
  expandedOrder.value = expandedOrder.value === orderId ? null : orderId
}

const parseItems = (itemsJson) => {
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
  padding: 1.5rem 2rem;
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
  gap: 0.75rem;
}

.header-icon {
  font-size: 1.8rem;
}

.header-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1f3f5;
  border: none;
  color: #495057;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e9ecef;
  transform: scale(1.1);
}

/* Loading State */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
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
  padding: 4rem 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #5568d3;
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.browse-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.browse-btn:hover {
  background: #5568d3;
}

/* Orders List */
.orders-list {
  flex: 1;
  padding: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.order-card.expanded {
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.15);
}

/* Order Header */
.order-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.2s;
}

.order-header:hover {
  background: #f8f9fa;
}

.order-info {
  flex: 1;
}

.receipt-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.receipt-icon {
  font-size: 1.2rem;
}

.receipt-no {
  font-weight: 700;
  color: #2c3e50;
  font-size: 0.95rem;
}

.order-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.order-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.order-total {
  font-size: 1.2rem;
  font-weight: 800;
  color: #667eea;
}

.order-status {
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
}

.status-eshop {
  background: #e3f2fd;
  color: #1976d2;
}

.status-walkin {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-delivery {
  background: #e8f5e9;
  color: #388e3c;
}

.expand-icon {
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem;
}

/* Order Details */
.order-details {
  padding: 0 1.5rem 1.5rem;
  border-top: 2px solid #f1f3f5;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 1000px;
  }
}

.detail-section {
  margin-top: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.section-icon {
  font-size: 1.2rem;
}

.location-info {
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.location-type {
  font-weight: 600;
  color: #495057;
}

.location-number {
  background: #667eea;
  color: white;
  padding: 0.2rem 0.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
}

.delivery-notes {
  margin-top: 0.5rem;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-style: italic;
}

.items-list {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.order-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  gap: 0.75rem;
}

.item-name {
  font-weight: 600;
  color: #2c3e50;
}

.item-qty {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.item-price {
  font-weight: 700;
  color: #667eea;
}

.payment-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: #495057;
}

.payment-value {
  font-weight: 600;
}

.total-row {
  border-top: 2px solid #dee2e6;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
}

.total-value {
  color: #667eea;
  font-size: 1.3rem;
}

.reorder-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #5b8dee 100%);
  color: white;
  border: none;
  padding: 0.85rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.reorder-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-icon {
  font-size: 1.1rem;
}

/* Pagination */
.pagination {
  background: white;
  padding: 1.5rem 2rem;
  border-top: 2px solid #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.load-more-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.load-more-btn:hover {
  background: #5568d3;
}
</style>
