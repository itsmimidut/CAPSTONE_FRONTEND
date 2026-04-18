<template>
  <div class="entrance-rates-admin">
    <!-- Header Section -->
    <div class="admin-header">
      <div class="header-top">
        <h1 class="page-title">
          <i class="fas fa-gate"></i> Entrance Rates Configuration
        </h1>
        <button @click="handleAddNew" class="btn-primary btn-add">
          <i class="fas fa-plus"></i> Add New Rate
        </button>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-group">
          <div class="filter-input">
            <i class="fas fa-search"></i>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Search by rate name..."
              class="search-input"
            />
          </div>

          <select v-model="selectedDayType" @change="handleFilterChange" class="filter-select">
            <option value="">All Day Types</option>
            <option value="weekday">Weekday</option>
            <option value="weekend">Weekend</option>
            <option value="holiday">Holiday</option>
          </select>

          <select v-model="selectedStatus" @change="handleFilterChange" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>

          <button v-if="hasFilters" @click="handleClearFilters" class="btn-secondary">
            <i class="fas fa-times"></i> Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading entrance rates...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-banner">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="handleRetry" class="btn-tertiary">Retry</button>
    </div>

    <!-- Table Section -->
    <div v-else class="table-section">
      <div class="table-wrap">
        <table class="rates-table">
          <thead>
            <tr>
              <th>Rate Name</th>
              <th>Day Type</th>
              <th>Price (PHP)</th>
              <th>Age Range</th>
              <th>Time Range</th>
              <th>Status</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredRates.length === 0">
              <td colspan="7">
                <div class="empty-state">
                  <div class="empty-icon"><i class="fas fa-inbox"></i></div>
                  <p class="empty-title">No entrance rates found</p>
                  <p class="empty-text">Create your first entrance rate to get started.</p>
                </div>
              </td>
            </tr>
            <tr v-else v-for="rate in paginatedRates" :key="rate.id" class="rate-row">
              <td>
                <div class="rate-name-cell">
                  <span class="rate-name">{{ rate.name }}</span>
                </div>
              </td>
              <td>
                <span class="day-badge" :class="`day-badge--${rate.day_type}`">
                  {{ formatDayType(rate.day_type) }}
                </span>
              </td>
              <td>
                <span class="price-cell">₱ {{ formatPrice(rate.price) }}</span>
              </td>
              <td>
                <span v-if="rate.age_min || rate.age_max" class="age-range">
                  {{ rate.age_min || 0 }} - {{ rate.age_max || '∞' }} yrs
                </span>
                <span v-else class="age-range-all">All ages</span>
              </td>
              <td>
                <span v-if="rate.start_time && rate.end_time" class="time-range">
                  {{ formatTime(rate.start_time) }} - {{ formatTime(rate.end_time) }}
                </span>
                <span v-else class="time-all">All day</span>
              </td>
              <td>
                <button
                  @click="handleToggleStatus(rate)"
                  :class="['status-badge', `status-${rate.status}`]"
                >
                  {{ formatStatus(rate.status) }}
                </button>
              </td>
              <td class="actions-cell">
                <div class="actions-group">
                  <button
                    @click="handleEdit(rate)"
                    class="action-btn action-edit"
                    title="Edit rate"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="handleDelete(rate)"
                    class="action-btn action-delete"
                    title="Delete rate"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <button
          @click="handlePrevPage"
          :disabled="pagination.currentPage === 1"
          class="pagination-btn"
        >
          <i class="fas fa-chevron-left"></i> Previous
        </button>

        <div class="page-info">
          Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
          <span class="record-count">({{ pagination.totalRecords }} total)</span>
        </div>

        <button
          @click="handleNextPage"
          :disabled="!pagination.hasNextPage"
          class="pagination-btn"
        >
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="modal-overlay" @click="handleCloseModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>
              <i :class="modalMode === 'edit' ? 'fas fa-edit' : 'fas fa-plus'"></i>
              {{ modalMode === 'edit' ? 'Edit Entrance Rate' : 'Add New Entrance Rate' }}
            </h2>
            <button @click="handleCloseModal" class="modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="handleSaveRate" class="rate-form">
              <!-- Rate Name -->
              <div class="form-group">
                <label for="name">Rate Name</label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  placeholder="e.g., Adult, Child, Senior"
                  class="form-input"
                  required
                />
              </div>

              <!-- Price -->
              <div class="form-group">
                <label for="price">Price (PHP)</label>
                <input
                  id="price"
                  v-model.number="formData.price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="form-input"
                  required
                />
              </div>

              <!-- Day Type -->
              <div class="form-group">
                <label for="day_type">Day Type</label>
                <select id="day_type" v-model="formData.day_type" class="form-select" required>
                  <option value="">Select day type</option>
                  <option value="weekday">Weekday</option>
                  <option value="weekend">Weekend</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>

              <!-- Age Range -->
              <div class="form-row">
                <div class="form-group">
                  <label for="age_min">Min Age</label>
                  <input
                    id="age_min"
                    v-model.number="formData.age_min"
                    type="number"
                    min="0"
                    max="150"
                    placeholder="Optional"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label for="age_max">Max Age</label>
                  <input
                    id="age_max"
                    v-model.number="formData.age_max"
                    type="number"
                    min="0"
                    max="150"
                    placeholder="Optional"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Time Range -->
              <div class="form-row">
                <div class="form-group">
                  <label for="start_time">Start Time</label>
                  <input
                    id="start_time"
                    v-model="formData.start_time"
                    type="time"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label for="end_time">End Time</label>
                  <input
                    id="end_time"
                    v-model="formData.end_time"
                    type="time"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" @click="handleCloseModal" class="btn-secondary">
                  Cancel
                </button>
                <button type="submit" :disabled="formLoading" class="btn-primary">
                  <i v-if="formLoading" class="fas fa-spinner fa-spin"></i>
                  {{ formLoading ? 'Saving...' : modalMode === 'edit' ? 'Update Rate' : 'Create Rate' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click="handleCloseDeleteConfirm">
        <div class="modal-content modal-small" @click.stop>
          <div class="modal-header">
            <h2><i class="fas fa-exclamation-triangle"></i> Confirm Delete</h2>
            <button @click="handleCloseDeleteConfirm" class="modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <p class="confirm-text">
              Are you sure you want to delete <strong>{{ rateToDelete?.name }}</strong>? This action cannot be undone.
            </p>

            <div class="form-actions">
              <button @click="handleCloseDeleteConfirm" class="btn-secondary">
                Cancel
              </button>
              <button
                @click="handleConfirmDelete"
                :disabled="deleteLoading"
                class="btn-danger"
              >
                <i v-if="deleteLoading" class="fas fa-spinner fa-spin"></i>
                {{ deleteLoading ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast Notification -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
          <i :class="getToastIcon(toast.type)"></i>
          <p>{{ toast.message }}</p>
          <button @click="toast.show = false" class="toast-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useEntranceRatesStore } from '../../stores/entranceRatesStore';

const store = useEntranceRatesStore();

// UI State
const loading = ref(false);
const error = ref(null);
const isModalOpen = ref(false);
const modalMode = ref('create');
const showDeleteConfirm = ref(false);
const formLoading = ref(false);
const deleteLoading = ref(false);

// Search & Filter State
const searchQuery = ref('');
const selectedDayType = ref('');
const selectedStatus = ref('');

// Form Data
const formData = ref({
  name: '',
  price: null,
  day_type: '',
  age_min: null,
  age_max: null,
  start_time: '',
  end_time: ''
});

const rateToDelete = ref(null);

// Toast Notification
const toast = ref({
  show: false,
  message: '',
  type: 'success' // success, error, warning
});

// Computed Properties
const filteredRates = computed(() => store.rates);
const pagination = computed(() => store.paginationInfo);

const paginatedRates = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize;
  return filteredRates.value;
});

const hasFilters = computed(() => {
  return searchQuery.value || selectedDayType.value || selectedStatus.value;
});

// Methods
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

const getToastIcon = (type) => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-warning'
  };
  return icons[type] || 'fas fa-info-circle';
};

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

const formatDayType = (dayType) => {
  const map = { weekday: 'Weekday', weekend: 'Weekend', holiday: 'Holiday' };
  return map[dayType] || dayType;
};

const formatStatus = (status) => {
  return status === 'active' ? 'Active' : 'Hidden';
};

const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

// Load initial data
const loadRates = async () => {
  loading.value = true;
  error.value = null;
  try {
    await store.fetchRates(1);
  } catch (err) {
    error.value = 'Failed to load entrance rates. Please try again.';
    console.error('Load error:', err);
  } finally {
    loading.value = false;
  }
};

// Filters
const handleSearch = () => {
  handleFilterChange();
};

const handleFilterChange = async () => {
  try {
    await store.updateFilters({
      search: searchQuery.value,
      day_type: selectedDayType.value,
      status: selectedStatus.value
    });
  } catch (err) {
    error.value = 'Failed to apply filters';
  }
};

const handleClearFilters = async () => {
  searchQuery.value = '';
  selectedDayType.value = '';
  selectedStatus.value = '';
  await store.clearFilters();
};

// Pagination
const handlePrevPage = async () => {
  await store.goToPage(pagination.value.currentPage - 1);
};

const handleNextPage = async () => {
  await store.goToPage(pagination.value.currentPage + 1);
};

// Modal handlers
const handleAddNew = () => {
  modalMode.value = 'create';
  formData.value = {
    name: '',
    price: null,
    day_type: '',
    age_min: null,
    age_max: null,
    start_time: '',
    end_time: ''
  };
  isModalOpen.value = true;
};

const handleEdit = async (rate) => {
  modalMode.value = 'edit';
  formData.value = { ...rate };
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  formData.value = {
    name: '',
    price: null,
    day_type: '',
    age_min: null,
    age_max: null,
    start_time: '',
    end_time: ''
  };
};

const handleSaveRate = async () => {
  formLoading.value = true;
  try {
    if (modalMode.value === 'create') {
      await store.createRate(formData.value);
      showToast(`Rate "${formData.value.name}" created successfully!`);
    } else {
      await store.updateRate(formData.value.id, formData.value);
      showToast(`Rate "${formData.value.name}" updated successfully!`);
    }
    handleCloseModal();
    await loadRates();
  } catch (err) {
    showToast(err.response?.data?.message || 'Failed to save rate', 'error');
  } finally {
    formLoading.value = false;
  }
};

// Delete handlers
const handleDelete = (rate) => {
  rateToDelete.value = rate;
  showDeleteConfirm.value = true;
};

const handleCloseDeleteConfirm = () => {
  showDeleteConfirm.value = false;
  rateToDelete.value = null;
};

const handleConfirmDelete = async () => {
  deleteLoading.value = true;
  try {
    await store.deleteRate(rateToDelete.value.id);
    showToast(`Rate "${rateToDelete.value.name}" deleted successfully!`);
    handleCloseDeleteConfirm();
    await loadRates();
  } catch (err) {
    showToast('Failed to delete rate', 'error');
  } finally {
    deleteLoading.value = false;
  }
};

// Toggle Status
const handleToggleStatus = async (rate) => {
  try {
    await store.toggleRateStatus(rate.id);
    showToast(`Rate status updated to ${rate.status === 'active' ? 'Hidden' : 'Active'}`);
    await loadRates();
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
};

const handleRetry = () => {
  loadRates();
};

// Lifecycle
onMounted(() => {
  loadRates();
});
</script>

<style scoped>
.entrance-rates-admin {
  padding: 2rem;
  background: var(--color-bg);
  min-height: 100vh;
}

/* Header */
.admin-header {
  margin-bottom: 2rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-dark);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title i {
  color: var(--color-primary);
}

/* Filters */
.filters-section {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(125, 161, 142, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 1rem;
  align-items: flex-end;
}

.filter-input {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-input i {
  position: absolute;
  left: 12px;
  color: var(--color-text-light);
  font-size: 0.9rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid rgba(125, 161, 142, 0.2);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(125, 161, 142, 0.2);
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: var(--color-text-dark);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
}

@media (max-width: 1024px) {
  .filter-group {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .filter-group {
    grid-template-columns: 1fr;
  }

  .header-top {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Table */
.table-section {
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(125, 161, 142, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

.rates-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.rates-table thead th {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  background: var(--color-gray-bg);
  border-bottom: 2px solid rgba(244, 196, 0, 0.25);
  position: sticky;
  top: 0;
  z-index: 2;
}

.rates-table thead th:first-child {
  border-radius: 12px 0 0 0;
}

.rates-table thead th:last-child {
  border-radius: 0 12px 0 0;
}

.rates-table tbody tr {
  border-bottom: 1px solid var(--color-gray-border);
  transition: background 0.12s;
}

.rates-table tbody tr:hover {
  background: rgba(3, 105, 161, 0.03);
}

.rates-table tbody tr:last-child {
  border-bottom: none;
}

.rates-table td {
  padding: 0.75rem 1rem;
  color: var(--color-text-dark);
  vertical-align: middle;
}

/* Table Cells */
.rate-name-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rate-name {
  font-weight: 600;
  color: var(--color-primary);
}

.day-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.day-badge--weekday {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.day-badge--weekend {
  background: rgba(244, 63, 94, 0.1);
  color: #991b1b;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.day-badge--holiday {
  background: rgba(249, 115, 22, 0.1);
  color: #92400e;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.price-cell {
  font-weight: 700;
  color: var(--color-text-dark);
  font-family: 'Courier New', monospace;
}

.age-range {
  color: var(--color-text-light);
  font-size: 0.85rem;
}

.age-range-all {
  color: var(--color-text-light);
  font-size: 0.85rem;
  font-style: italic;
}

.time-range {
  color: var(--color-text-light);
  font-size: 0.85rem;
}

.time-all {
  color: var(--color-text-light);
  font-size: 0.85rem;
  font-style: italic;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.status-active {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}

.status-active:hover {
  background: rgba(34, 197, 94, 0.2);
}

.status-hidden {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}

.status-hidden:hover {
  background: rgba(107, 114, 128, 0.2);
}

/* Actions */
.actions-cell {
  text-align: center;
}

.actions-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.action-edit {
  color: var(--color-primary);
}

.action-edit:hover {
  background: rgba(43, 108, 176, 0.1);
  color: var(--color-primary-dark);
}

.action-delete {
  color: #dc2626;
}

.action-delete:hover {
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-gray);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-dark);
  margin-bottom: 0.5rem;
}

.empty-text {
  color: var(--color-text-light);
  font-size: 0.95rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(125, 161, 142, 0.1);
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(43, 108, 176, 0.3);
  background: white;
  color: var(--color-primary);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(43, 108, 176, 0.1);
  border-color: var(--color-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--color-text-dark);
  font-weight: 600;
  font-size: 0.95rem;
}

.record-count {
  color: var(--color-text-light);
  font-weight: 400;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

/* Loading & Error States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--color-text-light);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(43, 108, 176, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-banner {
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #991b1b;
  margin-bottom: 2rem;
}

.error-banner i {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.error-banner p {
  flex: 1;
  margin: 0;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-tertiary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-gray-bg);
  color: var(--color-text-dark);
  border: 1px solid rgba(125, 161, 142, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(125, 161, 142, 0.1);
  border-color: rgba(125, 161, 142, 0.4);
}

.btn-tertiary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-tertiary:hover {
  background: rgba(43, 108, 176, 0.1);
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #991b1b;
  transform: translateY(-2px);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-add {
  white-space: nowrap;
}

/* Modal */
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
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
}

.modal-small {
  max-width: 400px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(125, 161, 142, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text-dark);
}

.modal-header h2 i {
  color: var(--color-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-light);
  transition: color 0.2s;
}

.modal-close:hover {
  color: var(--color-text-dark);
}

.modal-body {
  padding: 1.5rem;
}

/* Form */
.rate-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text-dark);
  font-size: 0.95rem;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid rgba(125, 161, 142, 0.2);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--color-text-dark);
  font-family: inherit;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
}

.form-select {
  background: white;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid rgba(125, 161, 142, 0.1);
}

.confirm-text {
  color: var(--color-text-dark);
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.confirm-text strong {
  color: var(--color-primary);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  max-width: 400px;
  font-weight: 600;
}

.toast i {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.toast p {
  margin: 0;
}

.toast-success {
  color: #15803d;
  border-left: 4px solid #22c55e;
}

.toast-error {
  color: #991b1b;
  border-left: 4px solid #dc2626;
}

.toast-warning {
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.text-center {
  text-align: center;
}

@media (max-width: 640px) {
  .entrance-rates-admin {
    padding: 1rem;
  }

  .header-top {
    flex-direction: column;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .toast {
    right: 1rem;
    left: 1rem;
    bottom: 1rem;
  }

  .rates-table {
    font-size: 0.8rem;
  }

  .rates-table td,
  .rates-table th {
    padding: 0.5rem;
  }
}
</style>
