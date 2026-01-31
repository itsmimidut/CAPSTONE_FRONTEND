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
      />
      <StatCard
        label="Available"
        :count="availableCount"
      />
      <StatCard
        label="Occupied"
        :count="occupiedCount"
      />
      <StatCard
        label="Reserved"
        :count="reservedCount"
      />
    </div>

    <!-- Controls -->
    <div class="controls-container">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search tables by number or notes..."
        />
      </div>
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Statuses</option>
        <option value="available">Available</option>
        <option value="occupied">Occupied</option>
        <option value="reserved">Reserved</option>
      </select>
    </div>

    <!-- Tables Grid -->
    <div class="tables-grid">
      <div v-if="filteredTables.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No tables found</p>
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
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
  border-radius: 12px;
  min-height: 100vh;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0.5rem 0 0 0;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
}

.btn-add i {
  font-size: 1rem;
}

.btn-print {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-print:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.4);
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Controls */
.controls-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.95rem;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Tables Grid */
.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid #cbd5e1;
  display: flex;
  flex-direction: column;
}

.table-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.table-card.status-available {
  border-left-color: #10B981;
}

.table-card.status-occupied {
  border-left-color: #F59E0B;
}

.table-card.status-reserved {
  border-left-color: #8B5CF6;
}

/* Card Header */
.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.table-info {
  flex: 1;
}

.table-number {
  margin: 0;
  font-size: 1.4rem;
  color: #1e293b;
  font-weight: 700;
}

.capacity-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
  color: #0c4a6e;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
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
  color: #64748b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.detail-label i {
  font-size: 0.8rem;
}

.detail-value {
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 600;
}

.notes-box {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fcd34d;
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #92400e;
}

.notes-box i {
  flex-shrink: 0;
  margin-top: 0.15rem;
  font-size: 0.9rem;
}

.notes-box p {
  margin: 0;
  line-height: 1.4;
}

/* Card Footer */
.card-footer {
  padding: 1.25rem;
  border-top: 1px solid #e2e8f0;
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
  border-radius: 6px;
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

.btn-occupy {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: white;
}

.btn-occupy:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.btn-clear {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
}

.btn-clear:hover {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  transform: translateY(-1px);
}

.btn-release {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
}

.btn-release:hover {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
}

.btn-edit {
  background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
  color: white;
}

.btn-edit:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

.btn-delete {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
}

.btn-delete:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-confirm {
  max-width: 380px;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 2px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
}

.modal-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.modal-title-section i {
  font-size: 1.5rem;
  color: #3B82F6;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.modal-title-section h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #1e293b;
  font-weight: 700;
}

.modal-title-section p {
  margin: 0.3rem 0 0 0;
  font-size: 0.85rem;
  color: #64748b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
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
  background: #f1f5f9;
  color: #1e293b;
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
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.form-group label i {
  font-size: 0.9rem;
  color: #3B82F6;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: white;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #cbd5e1;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #f8fafc;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 2px solid #f1f5f9;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: #f8fafc;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #475569;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.btn-submit {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-submit:hover {
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.btn-danger {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
}

.btn-danger:hover {
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.4);
}

.warning {
  color: #DC2626;
  font-size: 0.9rem;
  font-weight: 500;
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

  .tables-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
  }

  .btn-action {
    flex: 1;
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
  }

  .capacity-badge {
    width: 100%;
    justify-content: center;
  }

  .action-buttons {
    width: 100%;
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
    gap: 1.2rem;
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