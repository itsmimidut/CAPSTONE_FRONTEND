<template>
  <div class="tables-section">
    <!-- Section Header -->
    <div class="section-header">
      <div>
        <h2 class="section-title">
          <i class="fas fa-chair"></i> Table Management
        </h2>
        <p class="section-subtitle">Manage dining tables and seating</p>
      </div>
      <button class="btn-add" @click="showAddModal = true">
        <i class="fas fa-plus"></i> Add Table
      </button>
    </div>

    <!-- Stats Container -->
    <div class="stats-container">
      <StatCard
        label="Total Tables"
        :count="totalTables"
        icon="fas fa-chair"
        color="primary"
      />
      <StatCard
        label="Available"
        :count="availableCount"
        icon="fas fa-check-circle"
        color="success"
      />
      <StatCard
        label="Occupied"
        :count="occupiedCount"
        icon="fas fa-user-friends"
        color="warning"
      />
      <StatCard
        label="Reserved"
        :count="reservedCount"
        icon="fas fa-clock"
        color="info"
      />
    </div>

    <!-- Controls -->
    <div class="controls-container">
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search tables by number or notes..."
          class="search-input"
        />
      </div>
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="available">Available</option>
        <option value="occupied">Occupied</option>
        <option value="reserved">Reserved</option>
      </select>
    </div>

    <!-- Tables Grid -->
    <div class="tables-grid">
      <div v-if="filteredTables.length === 0" class="empty-state">
        <i class="fas fa-chair empty-icon"></i>
        <p>No tables found</p>
        <button class="btn-add-empty" @click="showAddModal = true">
          <i class="fas fa-plus"></i> Add Your First Table
        </button>
      </div>

      <div 
        v-for="table in filteredTables" 
        :key="table.id"
        :class="['table-card', `status-${table.status}`]"
      >
        <!-- Card Header -->
        <div class="card-header">
          <div class="table-info">
            <h3 class="table-number">Table {{ table.number }}</h3>
            <StatusBadge :status="table.status" />
          </div>
          <div class="capacity-badge">
            <i class="fas fa-users"></i>
            <span>{{ table.guests }}/{{ table.capacity }}</span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <div class="table-details">
            <div class="detail-item">
              <span class="detail-label">
                <i class="fas fa-chair"></i> Capacity
              </span>
              <span class="detail-value">{{ table.capacity }} guests</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">
                <i class="fas fa-clock"></i> Seated
              </span>
              <span class="detail-value">{{ table.orderedTime || '—' }}</span>
            </div>
          </div>
          <div v-if="table.notes" class="notes-box">
            <i class="fas fa-sticky-note"></i>
            <p>{{ table.notes }}</p>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="card-footer">
          <div class="action-buttons">
            <button 
              @click="editTable(table)"
              class="btn-action btn-edit"
              title="Edit table"
            >
              <i class="fas fa-edit"></i> Edit
            </button>
            <button 
              @click="deleteTable(table)"
              class="btn-action btn-delete"
              title="Delete table"
            >
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Table Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title-section">
            <i class="fas fa-chair"></i>
            <div>
              <h3>Add New Table</h3>
              <p>Create a new dining table</p>
            </div>
          </div>
          <button class="btn-close" @click="showAddModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="addNewTable" class="modal-body">
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="table-number">
                <i class="fas fa-hashtag"></i> Table Number *
              </label>
              <input 
                id="table-number"
                v-model.number="newTable.number"
                type="number"
                placeholder="e.g., 1, 2, 3..."
                required
              />
            </div>

            <div class="form-group">
              <label for="table-capacity">
                <i class="fas fa-users"></i> Capacity *
              </label>
              <input 
                id="table-capacity"
                v-model.number="newTable.capacity"
                type="number"
                min="1"
                max="20"
                placeholder="e.g., 4"
                required
              />
            </div>

            <div class="form-group">
              <label for="table-status">
                <i class="fas fa-info-circle"></i> Status
              </label>
              <select id="table-status" v-model="newTable.status">
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="table-notes">
                <i class="fas fa-sticky-note"></i> Notes
              </label>
              <textarea 
                id="table-notes"
                v-model="newTable.notes"
                placeholder="Any special information about this table..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="showAddModal = false">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button type="submit" class="btn-submit">
              <i class="fas fa-plus"></i> Add Table
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Table Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title-section">
            <i class="fas fa-chair"></i>
            <div>
              <h3>Edit Table</h3>
              <p>Update table information</p>
            </div>
          </div>
          <button class="btn-close" @click="showEditModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveEditTable" class="modal-body">
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="edit-table-number">
                <i class="fas fa-hashtag"></i> Table Number *
              </label>
              <input 
                id="edit-table-number"
                v-model.number="editingTable.number"
                type="number"
                placeholder="e.g., 1, 2, 3..."
                required
              />
            </div>

            <div class="form-group">
              <label for="edit-table-capacity">
                <i class="fas fa-users"></i> Capacity *
              </label>
              <input 
                id="edit-table-capacity"
                v-model.number="editingTable.capacity"
                type="number"
                min="1"
                max="20"
                placeholder="e.g., 4"
                required
              />
            </div>

            <div class="form-group">
              <label for="edit-table-status">
                <i class="fas fa-info-circle"></i> Status
              </label>
              <select id="edit-table-status" v-model="editingTable.status">
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="edit-table-notes">
                <i class="fas fa-sticky-note"></i> Notes
              </label>
              <textarea 
                id="edit-table-notes"
                v-model="editingTable.notes"
                placeholder="Any special information about this table..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="showEditModal = false">
              <i class="fas fa-times"></i> Cancel
            </button>
            <button type="submit" class="btn-submit">
              <i class="fas fa-save"></i> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal-content modal-confirm">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>Table {{ deleteTarget?.number }}</strong>?</p>
          <p class="warning">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteConfirm = false">Cancel</button>
          <button class="btn-submit btn-danger" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>

    <!-- Clear Confirmation Modal -->
    <div v-if="showClearConfirm" class="modal-overlay" @click.self="showClearConfirm = false">
      <div class="modal-content modal-confirm">
        <div class="modal-header">
          <h3>Clear Table</h3>
        </div>
        <div class="modal-body">
          <p>Clear <strong>Table {{ clearTarget?.number }}</strong> and mark as available?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showClearConfirm = false">Cancel</button>
          <button class="btn-submit" @click="confirmClear">Clear Table</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StatCard from './StatCard.vue'
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  tables: Array,
})

const emit = defineEmits(['update-table-status', 'edit-table', 'delete-table', 'add-table', 'update-table'])

// UI State
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showClearConfirm = ref(false)
const deleteTarget = ref(null)
const clearTarget = ref(null)

// Filter & Search
const searchQuery = ref('')
const filterStatus = ref('')

// Form Data
const newTable = ref({
  number: '',
  capacity: '',
  status: 'available',
  notes: '',
})

const editingTable = ref({
  id: null,
  number: '',
  capacity: '',
  status: 'available',
  notes: '',
})

// Computed Properties
const totalTables = computed(() => props.tables?.length || 0)

const availableCount = computed(() => 
  props.tables?.filter(t => t.status === 'available').length || 0
)

const occupiedCount = computed(() => 
  props.tables?.filter(t => t.status === 'occupied').length || 0
)

const reservedCount = computed(() => 
  props.tables?.filter(t => t.status === 'reserved').length || 0
)

const filteredTables = computed(() => {
  let result = props.tables || []

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(table => 
      table.number.toString().includes(query) ||
      table.notes?.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value) {
    result = result.filter(table => table.status === filterStatus.value)
  }

  return result
})

// Methods
const addNewTable = () => {
  if (newTable.value.number && newTable.value.capacity) {
    const tableToAdd = {
      table_number: parseInt(newTable.value.number),
      capacity: parseInt(newTable.value.capacity),
      status: newTable.value.status || 'available',
      notes: newTable.value.notes || '',
    }
    emit('add-table', tableToAdd)
    
    newTable.value = {
      number: '',
      capacity: '',
      status: 'available',
      notes: '',
    }
    showAddModal.value = false
  }
}

const editTable = (table) => {
  editingTable.value = { ...table }
  showEditModal.value = true
}

const saveEditTable = () => {
  if (editingTable.value.number && editingTable.value.capacity) {
    const tableId = editingTable.value.table_id || editingTable.value.id
    const tableToUpdate = {
      table_id: tableId,
      table_number: parseInt(editingTable.value.number),
      capacity: parseInt(editingTable.value.capacity),
      status: editingTable.value.status || 'available',
      notes: editingTable.value.notes || '',
    }
    emit('update-table', tableToUpdate)
    showEditModal.value = false
  }
}

const deleteTable = (table) => {
  deleteTarget.value = table
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    emit('delete-table', deleteTarget.value.id)
    showDeleteConfirm.value = false
    deleteTarget.value = null
  }
}

const handleClearTable = (table) => {
  clearTarget.value = table
  showClearConfirm.value = true
}

const confirmClear = () => {
  if (clearTarget.value) {
    emit('update-table-status', clearTarget.value.id, 'available')
    showClearConfirm.value = false
    clearTarget.value = null
  }
}

const printTables = () => {
  window.print()
}
</script>

<style scoped>
.tables-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  border: 1px solid rgba(31, 141, 191, 0.1);
  min-height: 100vh;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #F4C400;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F8DBF;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title i {
  color: #F4C400;
  font-size: 1.5rem;
}

.section-subtitle {
  margin: 0.5rem 0 0 0;
  color: #1E88B6;
  font-size: 0.95rem;
  opacity: 0.8;
}

.btn-add {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.3);
}

.btn-add i {
  color: #F4C400;
  font-size: 1rem;
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Controls Container */
.controls-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  border: 2px solid #F4C400;
}

.search-wrapper {
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid rgba(31, 141, 191, 0.2);
  transition: all 0.3s ease;
  padding: 0 0.75rem;
  height: 46px;
}

.search-wrapper:focus-within {
  border-color: #F4C400;
  box-shadow: 0 0 0 3px rgba(244, 196, 0, 0.15);
}

.search-icon {
  color: #F4C400;
  font-size: 0.95rem;
  margin-right: 0.75rem;
  width: 16px;
  text-align: center;
}

.search-input {
  border: none;
  background: transparent;
  padding: 0.75rem 0;
  flex: 1;
  font-size: 0.95rem;
  outline: none;
  color: #1F8DBF;
  font-weight: 500;
  height: 100%;
}

.search-input::placeholder {
  color: rgba(31, 141, 191, 0.4);
  font-weight: normal;
}

.filter-select {
  padding: 0 1.25rem;
  border: 1px solid rgba(31, 141, 191, 0.2);
  border-radius: 8px;
  background: white;
  color: #1F8DBF;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
  font-weight: 500;
  min-width: 160px;
  height: 46px;
}

.filter-select:hover {
  border-color: #1F8DBF;
}

.filter-select:focus {
  outline: none;
  border-color: #F4C400;
  box-shadow: 0 0 0 3px rgba(244, 196, 0, 0.15);
}

/* Tables Grid */
.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #F4C400;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  color: #1F8DBF;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #F4C400;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: #1F8DBF;
}

.btn-add-empty {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
}

.btn-add-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.3);
}

.btn-add-empty i {
  color: #F4C400;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(31, 141, 191, 0.1);
}

.table-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(31, 141, 191, 0.15);
}

.table-card.status-available {
  border-left-color: #1F8DBF;
}

.table-card.status-occupied {
  border-left-color: #F4C400;
}

.table-card.status-reserved {
  border-left-color: #F4C400;
  opacity: 0.9;
}

/* Card Header */
.card-header {
  padding: 1.25rem;
  border-bottom: 2px solid rgba(244, 196, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: rgba(31, 141, 191, 0.02);
}

.table-info {
  flex: 1;
}

.table-number {
  margin: 0 0 0.5rem 0;
  font-size: 1.4rem;
  color: #1F8DBF;
  font-weight: 700;
}

.capacity-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  border: 1px solid rgba(244, 196, 0, 0.2);
}

.capacity-badge i {
  font-size: 0.85rem;
}

/* Card Body */
.card-body {
  padding: 1.25rem;
  flex: 1;
}

.table-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.detail-label {
  font-size: 0.85rem;
  color: #1F8DBF;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-label i {
  font-size: 0.8rem;
  color: #F4C400;
}

.detail-value {
  font-size: 0.95rem;
  color: #1E88B6;
  font-weight: 600;
}

.notes-box {
  background: rgba(244, 196, 0, 0.05);
  border: 1px solid rgba(244, 196, 0, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #1F8DBF;
}

.notes-box i {
  flex-shrink: 0;
  margin-top: 0.15rem;
  font-size: 0.9rem;
  color: #F4C400;
}

.notes-box p {
  margin: 0;
  line-height: 1.4;
}

/* Card Footer */
.card-footer {
  padding: 1.25rem;
  border-top: 2px solid rgba(244, 196, 0, 0.2);
  background: rgba(31, 141, 191, 0.02);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-action {
  flex: 1;
  min-width: 90px;
  padding: 0.6rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-action i {
  font-size: 0.85rem;
}

.btn-edit {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
  border: 1px solid rgba(31, 141, 191, 0.2);
}

.btn-edit:hover {
  background: #1F8DBF;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(31, 141, 191, 0.2);
}

.btn-delete {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  border: 1px solid rgba(244, 196, 0, 0.2);
}

.btn-delete:hover {
  background: #F4C400;
  color: #1F8DBF;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 196, 0, 0.3);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(31, 141, 191, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(31, 141, 191, 0.15);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  border: 2px solid #F4C400;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-confirm {
  max-width: 400px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid #F4C400;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1F8DBF;
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.modal-title-section i {
  font-size: 1.5rem;
  color: #F4C400;
  background: rgba(244, 196, 0, 0.1);
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.modal-title-section h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1F8DBF;
  font-weight: 700;
}

.modal-title-section p {
  margin: 0.3rem 0 0 0;
  font-size: 0.85rem;
  color: #1E88B6;
  opacity: 0.8;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #1F8DBF;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}

.modal-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group {
  margin-bottom: 0;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1F8DBF;
  font-size: 0.95rem;
}

.form-group label i {
  font-size: 0.9rem;
  color: #F4C400;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid rgba(31, 141, 191, 0.2);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
  color: #1E88B6;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(31, 141, 191, 0.3);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #F4C400;
  box-shadow: 0 0 0 3px rgba(244, 196, 0, 0.15);
  background: white;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 2px solid rgba(244, 196, 0, 0.3);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: rgba(31, 141, 191, 0.02);
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.btn-cancel {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
  border: 1px solid rgba(31, 141, 191, 0.2);
}

.btn-cancel:hover {
  background: #F4C400;
  color: #1F8DBF;
  border-color: #F4C400;
}

.btn-submit {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.3);
}

.btn-submit i {
  color: #F4C400;
}

.btn-danger {
  background: linear-gradient(135deg, #F4C400 0%, #F4C400 100%);
  color: #1F8DBF;
}

.btn-danger:hover {
  box-shadow: 0 8px 16px rgba(244, 196, 0, 0.4);
}

.warning {
  color: #F4C400;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .tables-section {
    padding: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-add {
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

  .search-wrapper {
    min-width: auto;
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .tables-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .modal-content {
    max-width: 90%;
  }
}

@media (max-width: 480px) {
  .tables-section {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .capacity-badge {
    width: 100%;
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  .modal-content {
    max-width: 95%;
  }
}

@media print {
  .tables-section {
    background: white;
    padding: 0;
  }

  .section-header,
  .controls-container,
  .btn-add,
  .btn-print {
    display: none;
  }

  .tables-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-card {
    box-shadow: none;
    page-break-inside: avoid;
  }
}
</style>