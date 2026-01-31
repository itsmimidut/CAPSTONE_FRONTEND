<template>
  <div class="orders-section">
    <!-- Header with Controls -->
    <div class="section-header">
      <div>
        <h2 class="section-title">Active Orders</h2>
        <p class="section-subtitle">Manage and track restaurant orders in real-time</p>
      </div>
      <button class="btn-refresh" @click="refreshOrders" title="Refresh orders">
        <i class="fas fa-sync-alt"></i> Refresh
      </button>
    </div>

    <!-- Stats Container -->
    <div class="stats-container">
      <StatCard 
        label="Total Orders"
        :count="orders.length"
        class="stat-total"
        icon="fas fa-receipt"
        color="primary"
      />
      <StatCard 
        label="Pending"
        :count="orders.filter(o => o.status === 'pending').length"
        class="stat-pending"
        icon="fas fa-hourglass-start"
        color="warning"
      />
      <StatCard 
        label="Preparing"
        :count="orders.filter(o => o.status === 'preparing').length"
        class="stat-preparing"
        icon="fas fa-fire"
        color="info"
      />
      <StatCard 
        label="Ready"
        :count="orders.filter(o => o.status === 'ready').length"
        class="stat-ready"
        icon="fas fa-check-circle"
        color="success"
      />
    </div>

    <!-- Search and Filter -->
    <div class="controls-container">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by table or order ID..."
          class="search-input"
        />
      </div>
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="preparing">Preparing</option>
        <option value="ready">Ready</option>
      </select>
      <select v-model="sortBy" class="filter-select">
        <option value="recent">Most Recent</option>
        <option value="oldest">Oldest First</option>
        <option value="table">By Table</option>
      </select>
      <button 
        class="btn-print"
        @click="printOrders"
        title="Print orders"
      >
        <i class="fas fa-print"></i> Print
      </button>
    </div>

    <!-- Orders Display -->
    <div class="orders-container">
      <div v-if="filteredOrders.length > 0" class="orders-grid">
        <div 
          v-for="order in sortedOrders" 
          :key="order.id" 
          class="order-card"
          :class="`status-${order.status}`"
        >
          <div class="card-header">
            <div class="order-info">
              <span class="order-id">#{{ order.id }}</span>
              <span class="table-number">Table {{ order.tableNum }}</span>
            </div>
            <StatusBadge :status="order.status" />
          </div>

          <div class="order-items">
            <div class="items-label">Items:</div>
            <p class="items-text">{{ order.items }}</p>
          </div>

          <div v-if="order.specialReq" class="special-requests">
            <i class="fas fa-sticky-note"></i>
            <span>{{ order.specialReq }}</span>
          </div>

          <div class="progress-indicator">
            <div class="progress-label">
              <span>Order Progress</span>
              <span class="progress-percentage">{{ getProgressPercentage(order.status) }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getProgressPercentage(order.status) + '%' }"></div>
            </div>
          </div>

          <div class="order-footer">
            <div class="time-info">
              <i class="fas fa-clock"></i>
              <span>{{ order.time }}</span>
            </div>
            <div class="action-buttons">
              <button 
                v-if="order.status === 'pending'"
                class="btn-action btn-primary"
                @click="handleAction(order.id, 'preparing')"
                title="Start preparing"
              >
                <i class="fas fa-clock"></i> Prepare
              </button>
              <button 
                v-else-if="order.status === 'preparing'"
                class="btn-action btn-success"
                @click="handleAction(order.id, 'ready')"
                title="Mark ready"
              >
                <i class="fas fa-check"></i> Ready
              </button>
              <button 
                v-else-if="order.status === 'ready'"
                class="btn-action btn-success"
                @click="handleAction(order.id, 'served')"
                title="Mark served"
              >
                <i class="fas fa-check-double"></i> Served
              </button>
              <button 
                class="btn-action btn-edit"
                @click="handleEdit(order)"
                title="Edit order"
              >
                <i class="fas fa-edit"></i> Edit
              </button>
              <button 
                class="btn-action btn-danger"
                @click="handleCancel(order)"
                title="Cancel order"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No orders found</p>
      </div>
    </div>

    <!-- Edit Order Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Order #{{ editingOrder?.id }}</h3>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleEditSubmit" class="modal-form">
          <div class="form-group">
            <label for="orderTable">Table Number *</label>
            <input 
              id="orderTable"
              v-model.number="editingOrder.tableNum"
              type="number" 
              placeholder="e.g., 1"
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="orderItems">Items *</label>
            <textarea 
              id="orderItems"
              v-model="editingOrder.items"
              placeholder="e.g., Caesar Salad x2, Grilled Salmon"
              required
              class="form-input"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="orderStatus">Status *</label>
            <select 
              id="orderStatus"
              v-model="editingOrder.status"
              required
              class="form-input"
            >
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="served">Served</option>
            </select>
          </div>

          <div class="form-group">
            <label for="orderSpecialReq">Special Requests</label>
            <textarea 
              id="orderSpecialReq"
              v-model="editingOrder.specialReq"
              placeholder="e.g., No croutons"
              class="form-input"
              rows="2"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="btn-submit">
              <i class="fas fa-save"></i> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
import StatCard from './StatCard.vue'

const props = defineProps({
  orders: Array,
})

const emit = defineEmits(['update-order-status', 'delete-order', 'update-order'])

const searchQuery = ref('')
const filterStatus = ref('')
const sortBy = ref('recent')
const showEditModal = ref(false)
const editingOrder = ref(null)

const filteredOrders = computed(() => {
  return props.orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchQuery.value) ||
      order.tableNum.toString().includes(searchQuery.value) ||
      order.items.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !filterStatus.value || order.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

const sortedOrders = computed(() => {
  const sorted = [...filteredOrders.value]
  
  if (sortBy.value === 'oldest') {
    return sorted.reverse()
  } else if (sortBy.value === 'table') {
    return sorted.sort((a, b) => a.tableNum - b.tableNum)
  }
  
  return sorted // recent (default)
})

const handleAction = (id, action) => {
  emit('update-order-status', id, action)
}

const handleCancel = (order) => {
  if (confirm(`Cancel order #${order.id} from table ${order.tableNum}?`)) {
    emit('delete-order', order.id)
  }
}

const handleEdit = (order) => {
  editingOrder.value = { ...order }
  showEditModal.value = true
}

const handleEditSubmit = () => {
  if (editingOrder.value) {
    emit('update-order', editingOrder.value)
    closeModal()
  }
}

const closeModal = () => {
  showEditModal.value = false
  editingOrder.value = null
}

const getProgressPercentage = (status) => {
  const progressMap = {
    'pending': 25,
    'preparing': 75,
    'ready': 100,
    'served': 100
  }
  return progressMap[status] || 0
}

const refreshOrders = () => {
  console.log('Refreshing orders...')
}

const printOrders = () => {
  window.print()
}
</script>

<style scoped>
.orders-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 2rem;
  background: linear-gradient(180deg, #EF4444, #F97316);
  border-radius: 2px;
}

.section-subtitle {
  margin: 0.5rem 0 0 0;
  color: #6B7280;
  font-size: 0.95rem;
}

.btn-refresh {
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-refresh:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-print {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-print:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.controls-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  background: #F3F4F6;
  border-radius: 8px;
  padding: 0 1rem;
  border: 1px solid #E5E7EB;
}

.search-box i {
  color: #9CA3AF;
}

.search-input {
  border: none;
  background: transparent;
  padding: 0.75rem;
  flex: 1;
  font-size: 0.95rem;
  outline: none;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.filter-select:hover {
  border-color: #EF4444;
}

.filter-select:focus {
  outline: none;
  border-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.orders-container {
  margin-bottom: 2rem;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.order-card {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.order-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #E5E7EB;
}

.order-card.status-pending {
  border-left: 4px solid #F59E0B;
}

.order-card.status-pending::before {
  background: #F59E0B;
}

.order-card.status-preparing {
  border-left: 4px solid #3B82F6;
}

.order-card.status-preparing::before {
  background: #3B82F6;
}

.order-card.status-ready {
  border-left: 4px solid #10B981;
}

.order-card.status-ready::before {
  background: #10B981;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-id {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1F2937;
}

.table-number {
  font-size: 0.9rem;
  color: #6B7280;
  font-weight: 600;
}

.order-items {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.items-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.items-text {
  margin: 0;
  color: #1F2937;
  font-size: 0.95rem;
  line-height: 1.5;
}

.special-requests {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #FEF3C7;
  border-left: 3px solid #F59E0B;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #92400E;
}

.special-requests i {
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.progress-indicator {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6B7280;
}

.progress-percentage {
  color: #10B981;
  font-weight: 700;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3B82F6, #10B981);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6B7280;
  font-size: 0.9rem;
  font-weight: 600;
}

.time-info i {
  color: #9CA3AF;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  white-space: nowrap;
  flex: 1;
}

.btn-primary {
  background: #DBEAFE;
  color: #0284C7;
}

.btn-primary:hover {
  background: #BFDBFE;
  transform: translateY(-1px);
}

.btn-success {
  background: #DCFCE7;
  color: #15803D;
}

.btn-success:hover {
  background: #BBFBDC;
  transform: translateY(-1px);
}

.btn-danger {
  background: #FEE2E2;
  color: #DC2626;
}

.btn-danger:hover {
  background: #FECACA;
  transform: translateY(-1px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9CA3AF;
  text-align: center;
  background: #F9FAFB;
  border-radius: 8px;
  border: 2px dashed #E5E7EB;
}

.empty-state i {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  color: #6B7280;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1F2937;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6B7280;
  font-size: 1.5rem;
  padding: 0;
}

.btn-close:hover {
  color: #1F2937;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-input,
.form-checkbox {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.btn-submit,
.btn-cancel {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-submit {
  background: #3B82F6;
  color: white;
}

.btn-submit:hover {
  background: #2563EB;
  transform: translateY(-1px);
}

.btn-cancel {
  background: #E5E7EB;
  color: #374151;
}

.btn-cancel:hover {
  background: #D1D5DB;
}

.btn-edit {
  background: #DBEAFE;
  color: #0284C7;
}

.btn-edit:hover {
  background: #BFDBFE;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .orders-section {
    padding: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-refresh {
    width: 100%;
    justify-content: center;
  }

  .btn-print {
    width: 100%;
    justify-content: center;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .controls-container {
    flex-direction: column;
  }

  .search-box {
    min-width: auto;
  }

  .filter-select {
    width: 100%;
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .order-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
  }

  .btn-action {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .orders-section {
    padding: 1rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
  }

  .action-buttons {
    width: 100%;
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  @media print {
    .section-header,
    .controls-container,
    .btn-refresh,
    .btn-print,
    .action-buttons {
      display: none;
    }

    .orders-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
