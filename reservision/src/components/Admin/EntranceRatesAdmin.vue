<template>
  <div class="er-layout">

    <!-- ── Sidebar ── -->
    <AdminSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <!-- ── Header ── -->
    <AdminHeader
      title="Entrance Rates Configuration"
      subtitle="Manage resort entry fees and rates"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <!-- ── Main ── -->
    <main class="er-main" :class="{ 'er-main--shifted': sidebarCollapsed }">
      <div class="er-container">

        <!-- ── Page Hero ── -->
        <div class="er-hero">
          <div class="er-hero__left">
            <div class="er-hero__icon">
              <i class="fas fa-ticket-alt"></i>
            </div>
            <div>
              <h1 class="er-hero__title">Entrance Rates</h1>
              <p class="er-hero__sub">Configure pricing for weekdays, weekends &amp; holidays</p>
            </div>
          </div>
          <div class="er-hero__stats">
            <div class="er-stat">
              <span class="er-stat__val">{{ filteredRates.length }}</span>
              <span class="er-stat__lbl">Total Rates</span>
            </div>
            <div class="er-stat er-stat--active">
              <span class="er-stat__val">{{ activeCount }}</span>
              <span class="er-stat__lbl">Active</span>
            </div>
            <div class="er-stat er-stat--hidden">
              <span class="er-stat__val">{{ hiddenCount }}</span>
              <span class="er-stat__lbl">Hidden</span>
            </div>
          </div>
        </div>

        <!-- ── Toolbar ── -->
        <div class="er-toolbar">
          <div class="er-toolbar__filters">

            <!-- Search -->
            <div class="er-search">
              <i class="fas fa-search er-search__icon"></i>
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                placeholder="Search rate name…"
                class="er-search__input"
              />
              <button v-if="searchQuery" @click="searchQuery = ''; handleSearch()" class="er-search__clear">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Day Type -->
            <div class="er-select-wrap">
              <i class="fas fa-calendar-alt er-select-wrap__icon"></i>
              <select v-model="selectedDayType" @change="handleFilterChange" class="er-select">
                <option value="">All Day Types</option>
                <option value="weekday">Weekday</option>
                <option value="weekend">Weekend</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>

            <!-- Status -->
            <div class="er-select-wrap">
              <i class="fas fa-toggle-on er-select-wrap__icon"></i>
              <select v-model="selectedStatus" @change="handleFilterChange" class="er-select">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <!-- Clear -->
            <button v-if="hasFilters" @click="handleClearFilters" class="er-btn er-btn--ghost">
              <i class="fas fa-times"></i> Clear
            </button>
          </div>

          <button
            v-if="filteredRates.length > 0"
            @click="handleAddNew"
            class="er-btn er-btn--primary"
          >
            <i class="fas fa-plus"></i>
            <span>Add New Rate</span>
          </button>
        </div>

        <!-- ── Loading ── -->
        <div v-if="loading" class="er-state">
          <div class="er-spinner"></div>
          <p>Loading entrance rates…</p>
        </div>

        <!-- ── Error ── -->
        <div v-else-if="error" class="er-error">
          <div class="er-error__icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="er-error__content">
            <p class="er-error__title">⚠️ Failed to load rates</p>
            <p class="er-error__msg">{{ error }}</p>
            <p class="er-error__hint"><strong>Hint:</strong> Make sure the backend server is running on http://localhost:8000</p>
          </div>
          <button @click="handleRetry" class="er-btn er-btn--ghost">
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>

        <!-- ── Table ── -->
        <div v-else class="er-card">

          <!-- Empty -->
          <div v-if="filteredRates.length === 0" class="er-empty">
            <div class="er-empty__icon"><i class="fas fa-tags"></i></div>
            <p class="er-empty__title">No entrance rates found</p>
            <p class="er-empty__sub">
              {{ hasFilters ? 'Try adjusting your filters.' : 'Create your first entrance rate to get started.' }}
            </p>
            <button v-if="!hasFilters" @click="handleAddNew" class="er-btn er-btn--primary">
              <i class="fas fa-plus"></i> Create First Rate
            </button>
          </div>

          <!-- Table -->
          <div v-else class="er-table-wrap">
            <table class="er-table">
              <thead>
                <tr>
                  <th>Rate Name</th>
                  <th>Day Type</th>
                  <th>Price</th>
                  <th>Age Range</th>
                  <th>Time Range</th>
                  <th>Status</th>
                  <th class="er-table__th--center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(rate, idx) in paginatedRates"
                  :key="rate.id"
                  class="er-table__row"
                  :style="`animation-delay: ${idx * 40}ms`"
                >
                  <!-- Rate Name -->
                  <td>
                    <div class="er-name-cell">
                      <div class="er-name-cell__dot" :class="`er-dot--${rate.day_type}`"></div>
                      <span class="er-name-cell__text">{{ rate.name }}</span>
                    </div>
                  </td>

                  <!-- Day Type -->
                  <td>
                    <span class="er-day-badge" :class="`er-day-badge--${rate.day_type}`">
                      <i :class="getDayIcon(rate.day_type)"></i>
                      {{ formatDayType(rate.day_type) }}
                    </span>
                  </td>

                  <!-- Price -->
                  <td>
                    <div class="er-price">
                      <span class="er-price__currency">₱</span>
                      <span class="er-price__amount">{{ formatPrice(rate.price) }}</span>
                    </div>
                  </td>

                  <!-- Age Range -->
                  <td>
                    <span v-if="rate.age_min || rate.age_max" class="er-meta">
                      <i class="fas fa-user-friends"></i>
                      {{ rate.age_min || 0 }}–{{ rate.age_max || '∞' }} yrs
                    </span>
                    <span v-else class="er-meta er-meta--all">
                      <i class="fas fa-users"></i> All ages
                    </span>
                  </td>

                  <!-- Time Range -->
                  <td>
                    <span v-if="rate.start_time && rate.end_time" class="er-meta">
                      <i class="fas fa-clock"></i>
                      {{ formatTime(rate.start_time) }}–{{ formatTime(rate.end_time) }}
                    </span>
                    <span v-else class="er-meta er-meta--all">
                      <i class="fas fa-sun"></i> All day
                    </span>
                  </td>

                  <!-- Status toggle -->
                  <td>
                    <button
                      @click="handleToggleStatus(rate)"
                      :class="['er-status', `er-status--${rate.status}`]"
                      :title="`Click to set ${rate.status === 'active' ? 'Hidden' : 'Active'}`"
                    >
                      <span class="er-status__dot"></span>
                      {{ formatStatus(rate.status) }}
                    </button>
                  </td>

                  <!-- Actions -->
                  <td class="er-table__td--center">
                    <div class="er-actions">
                      <button @click="handleEdit(rate)" class="er-act er-act--edit" title="Edit">
                        <i class="fas fa-pen"></i>
                      </button>
                      <button @click="handleDelete(rate)" class="er-act er-act--del" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="er-pagination">
            <button
              @click="handlePrevPage"
              :disabled="pagination.currentPage === 1"
              class="er-pg-btn"
            >
              <i class="fas fa-chevron-left"></i>
            </button>

            <div class="er-pg-info">
              <span class="er-pg-info__current">{{ pagination.currentPage }}</span>
              <span class="er-pg-info__sep">/</span>
              <span class="er-pg-info__total">{{ pagination.totalPages }}</span>
              <span class="er-pg-info__records">({{ pagination.totalRecords }} records)</span>
            </div>

            <button
              @click="handleNextPage"
              :disabled="!pagination.hasNextPage"
              class="er-pg-btn"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

        </div>
      </div>

      <!-- ══════════════════════════════════
           IMAGE UPLOAD SECTION (BELOW TABLE)
      ══════════════════════════════════ -->
      <div class="er-container">
        <div class="er-card er-upload-section">
          <div class="er-upload-section__header">
            <div class="er-upload-section__icon">
              <i class="fas fa-images"></i>
            </div>
            <div>
              <h3 class="er-upload-section__title">Upload Rates Images for Website</h3>
              <p class="er-upload-section__sub">Upload images that will be displayed on the rates page</p>
            </div>
          </div>

          <div class="er-upload-section__content">
            <!-- Upload Area -->
            <div class="er-upload-main">
              <input
                type="file"
                multiple
                accept="image/*"
                @change="handleBulkImageUpload"
                class="er-upload-main__file"
                ref="bulkImageInput"
              />
              <label class="er-upload-main__label">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>Click to upload images or drag here</span>
                <small>You can upload multiple images at once • Max 5MB each</small>
              </label>
            </div>

            <!-- Upload Progress/Preview -->
            <div v-if="uploadingImages.length > 0" class="er-upload-list">
              <div class="er-upload-list__header">
                <h4 class="er-upload-list__title">Uploading...</h4>
                <span class="er-upload-list__count">{{ uploadedImagesCount }}/{{ uploadingImages.length }}</span>
              </div>
              <div class="er-upload-list__items">
                <div v-for="(img, idx) in uploadingImages" :key="idx" class="er-upload-item">
                  <div class="er-upload-item__preview">
                    <img :src="img.preview" :alt="`Image ${idx + 1}`" />
                  </div>
                  <div class="er-upload-item__info">
                    <p class="er-upload-item__name">{{ img.name }}</p>
                    <p class="er-upload-item__size">{{ (img.file.size / 1024 / 1024).toFixed(2) }}MB</p>
                  </div>
                  <div class="er-upload-item__status">
                    <i v-if="img.uploaded" class="fas fa-check-circle er-upload-item__success"></i>
                    <i v-else class="fas fa-spinner fa-spin er-upload-item__loading"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Uploaded Images Gallery -->
            <div v-if="uploadedImages.length > 0" class="er-uploaded-gallery">
              <div class="er-uploaded-gallery__header">
                <h4 class="er-uploaded-gallery__title">
                  <i class="fas fa-check-circle"></i> Uploaded Images
                </h4>
                <span class="er-uploaded-gallery__count">{{ uploadedImages.length }}</span>
              </div>
              <div class="er-uploaded-gallery__grid">
                <div v-for="(img, idx) in uploadedImages" :key="idx" class="er-gallery-item">
                  <div class="er-gallery-item__image">
                    <img :src="img" :alt="`Uploaded image ${idx + 1}`" />
                  </div>
                  <div class="er-gallery-item__actions">
                    <button 
                      @click="openAssignImageModal(img)" 
                      class="er-gallery-item__assign"
                      title="Assign to rate"
                    >
                      <i class="fas fa-link"></i>
                    </button>
                    <button 
                      @click="handleDeleteUploadedImage(idx)" 
                      class="er-gallery-item__delete"
                      title="Delete image"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ══════════════════════════════════
         ADD / EDIT MODAL
    ══════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="er-modal">
        <div v-if="isModalOpen" class="er-overlay" @click="handleCloseModal">
          <div class="er-modal" @click.stop>

            <div class="er-modal__header">
              <div class="er-modal__header-left">
                <div class="er-modal__icon">
                  <i :class="modalMode === 'edit' ? 'fas fa-pen' : 'fas fa-plus'"></i>
                </div>
                <div>
                  <h2 class="er-modal__title">
                    {{ modalMode === 'edit' ? 'Edit Rate' : 'New Entrance Rate' }}
                  </h2>
                  <p class="er-modal__sub">
                    {{ modalMode === 'edit' ? 'Update pricing details' : 'Set pricing for a new rate category' }}
                  </p>
                </div>
              </div>
              <button @click="handleCloseModal" class="er-modal__close">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="er-modal__body">
              <form @submit.prevent="handleSaveRate" class="er-form">

                <div class="er-form__row">
                  <div class="er-form__group er-form__group--full">
                    <label class="er-form__label">
                      <i class="fas fa-tag"></i> Rate Name
                    </label>
                    <input
                      v-model="formData.name"
                      type="text"
                      placeholder="e.g., Adult, Child, Senior Citizen"
                      class="er-form__input"
                      required
                    />
                  </div>
                </div>

                <div class="er-form__row">
                  <div class="er-form__group">
                    <label class="er-form__label">
                      <i class="fas fa-peso-sign"></i> Price (PHP)
                    </label>
                    <input
                      v-model.number="formData.price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      class="er-form__input"
                      required
                    />
                  </div>

                  <div class="er-form__group">
                    <label class="er-form__label">
                      <i class="fas fa-calendar-alt"></i> Day Type
                    </label>
                    <select v-model="formData.day_type" class="er-form__select" required>
                      <option value="">Select day type</option>
                      <option value="weekday">Weekday</option>
                      <option value="weekend">Weekend</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </div>
                </div>

                <div class="er-form__section-label">Age Range <span>(optional)</span></div>
                <div class="er-form__row">
                  <div class="er-form__group">
                    <label class="er-form__label"><i class="fas fa-sort-amount-down"></i> Min Age</label>
                    <input v-model.number="formData.age_min" type="number" min="0" max="150" placeholder="0" class="er-form__input" />
                  </div>
                  <div class="er-form__group">
                    <label class="er-form__label"><i class="fas fa-sort-amount-up"></i> Max Age</label>
                    <input v-model.number="formData.age_max" type="number" min="0" max="150" placeholder="∞" class="er-form__input" />
                  </div>
                </div>

                <div class="er-form__section-label">Time Range <span>(optional)</span></div>
                <div class="er-form__row">
                  <div class="er-form__group">
                    <label class="er-form__label"><i class="fas fa-clock"></i> Start Time</label>
                    <input v-model="formData.start_time" type="time" class="er-form__input" />
                  </div>
                  <div class="er-form__group">
                    <label class="er-form__label"><i class="fas fa-clock"></i> End Time</label>
                    <input v-model="formData.end_time" type="time" class="er-form__input" />
                  </div>
                </div>

                <div class="er-form__actions">
                  <button type="button" @click="handleCloseModal" class="er-btn er-btn--ghost">
                    Cancel
                  </button>
                  <button type="submit" :disabled="formLoading" class="er-btn er-btn--primary">
                    <i v-if="formLoading" class="fas fa-spinner fa-spin"></i>
                    <i v-else :class="modalMode === 'edit' ? 'fas fa-save' : 'fas fa-plus'"></i>
                    {{ formLoading ? 'Saving…' : modalMode === 'edit' ? 'Update Rate' : 'Create Rate' }}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════
         ASSIGN IMAGE TO RATE MODAL
    ══════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="er-modal">
        <div v-if="assignImageModal.show" class="er-overlay" @click="closeAssignImageModal">
          <div class="er-modal er-modal--sm" @click.stop>
            <div class="er-modal__header">
              <div class="er-modal__icon">
                <i class="fas fa-link"></i>
              </div>
              <div>
                <h2 class="er-modal__title">Assign Image to Rate</h2>
                <p class="er-modal__sub">Select a rate category to assign this image</p>
              </div>
              <button @click="closeAssignImageModal" class="er-modal__close">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="er-modal__body">
              <!-- Image Preview -->
              <div class="er-assign-preview">
                <img :src="assignImageModal.imageUrl" :alt="assignImageModal.imageUrl" />
              </div>

              <!-- Rate Selector -->
              <div class="er-form-group">
                <label class="er-form-label">Select Rate Category:</label>
                <select v-model="assignImageModal.selectedRateId" class="er-form-input">
                  <option value="">-- Choose a rate --</option>
                  <option v-for="rate in allRates" :key="rate.id" :value="rate.id">
                    {{ rate.name }} (₱{{ rate.price }})
                  </option>
                </select>
              </div>

              <!-- Actions -->
              <div class="er-form__actions">
                <button @click="closeAssignImageModal" class="er-btn er-btn--ghost">Cancel</button>
                <button 
                  @click="handleAssignImage" 
                  :disabled="!assignImageModal.selectedRateId || assignImageModal.loading"
                  class="er-btn er-btn--primary"
                >
                  <i v-if="assignImageModal.loading" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-check"></i>
                  {{ assignImageModal.loading ? 'Assigning…' : 'Assign Image' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════
         DELETE CONFIRM MODAL
    ══════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="er-modal">
        <div v-if="showDeleteConfirm" class="er-overlay" @click="handleCloseDeleteConfirm">
          <div class="er-modal er-modal--sm" @click.stop>
            <div class="er-modal__header er-modal__header--danger">
              <div class="er-modal__icon er-modal__icon--danger">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <div>
                <h2 class="er-modal__title er-modal__title--light">Delete Rate</h2>
                <p class="er-modal__sub er-modal__sub--light">This action cannot be undone</p>
              </div>
              <button @click="handleCloseDeleteConfirm" class="er-modal__close er-modal__close--light">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="er-modal__body">
              <div class="er-confirm">
                <p>Are you sure you want to delete</p>
                <p class="er-confirm__name">"{{ rateToDelete?.name }}"</p>
                <p>All associated data will be permanently removed.</p>
              </div>
              <div class="er-form__actions">
                <button @click="handleCloseDeleteConfirm" class="er-btn er-btn--ghost">Cancel</button>
                <button @click="handleConfirmDelete" :disabled="deleteLoading" class="er-btn er-btn--danger">
                  <i v-if="deleteLoading" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-trash-alt"></i>
                  {{ deleteLoading ? 'Deleting…' : 'Yes, Delete' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════
         TOAST
    ══════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="er-toast">
        <div v-if="toast.show" :class="['er-toast', `er-toast--${toast.type}`]">
          <div class="er-toast__icon">
            <i :class="getToastIcon(toast.type)"></i>
          </div>
          <p class="er-toast__msg">{{ toast.message }}</p>
          <button @click="toast.show = false" class="er-toast__close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEntranceRatesStore } from '../../stores/entranceRatesStore'
import AdminSidebar from './AdminSidebar.vue'
import AdminHeader from './AdminHeader.vue'

const store = useEntranceRatesStore()

/* ── Sidebar ── */
const sidebarOpen      = ref(false)
const sidebarCollapsed = ref(false)

/* ── State ── */
const loading           = ref(false)
const error             = ref(null)
const isModalOpen       = ref(false)
const modalMode         = ref('create')
const showDeleteConfirm = ref(false)
const formLoading       = ref(false)
const deleteLoading     = ref(false)
const rateToDelete      = ref(null)
const uploadingImages = ref([])
const uploadedImages = ref([])
const uploadedImagesCount = ref(0)

/* ── Assign Image Modal ── */
const assignImageModal = ref({
  show: false,
  imageUrl: '',
  selectedRateId: '',
  loading: false
})
const allRates = ref([])

/* ── Filters ── */
const searchQuery    = ref('')
const selectedDayType = ref('')
const selectedStatus  = ref('')

/* ── Form ── */
const formData = ref({
  name: '', price: null, day_type: '',
  age_min: null, age_max: null,
  start_time: '', end_time: '',
  image: null, image_url: null
})

/* ── Toast ── */
const toast = ref({ show: false, message: '', type: 'success' })

/* ── Computed ── */
const filteredRates = computed(() => store.rates)
const pagination    = computed(() => store.paginationInfo)

const paginatedRates = computed(() => {
  const { currentPage, pageSize } = pagination.value
  const start = (currentPage - 1) * pageSize
  return filteredRates.value.slice(start, start + pageSize)
})

const hasFilters = computed(() =>
  searchQuery.value || selectedDayType.value || selectedStatus.value
)

const activeCount = computed(() =>
  filteredRates.value.filter(r => r.status === 'active').length
)
const hiddenCount = computed(() =>
  filteredRates.value.filter(r => r.status !== 'active').length
)

/* ── Helpers ── */
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

const getToastIcon = type => ({
  success: 'fas fa-check-circle',
  error:   'fas fa-exclamation-circle',
  warning: 'fas fa-exclamation-triangle'
}[type] || 'fas fa-info-circle')

const formatPrice   = p => parseFloat(p).toFixed(2)
const formatDayType = d => ({ weekday: 'Weekday', weekend: 'Weekend', holiday: 'Holiday' }[d] || d)
const formatStatus  = s => s === 'active' ? 'Active' : 'Hidden'
const formatTime    = t => { if (!t) return ''; const [h, m] = t.split(':'); return `${h}:${m}` }

const getDayIcon = d => ({
  weekday: 'fas fa-briefcase',
  weekend: 'fas fa-umbrella-beach',
  holiday: 'fas fa-star'
}[d] || 'fas fa-calendar')

/* ── Data loading ── */
const loadRates = async () => {
  loading.value = true
  error.value = null
  try {
    console.log('📥 Loading entrance rates...')
    await store.fetchRates(1)
    console.log('✅ Rates loaded:', store.rates.length, 'records')
    
    // Load all rates for the assign image modal dropdown
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    try {
      const response = await fetch(`${apiUrl}/entrance-rates?page=1&per_page=1000`)
      const data = await response.json()
      if (data.success && data.data) {
        allRates.value = data.data
      }
    } catch (e) {
      console.warn('Could not load all rates for dropdown:', e)
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Failed to load entrance rates'
    error.value = `${msg}. Check if the backend server is running on port 8000.`
    console.error('❌ Load error:', { message: msg, status: err.response?.status, url: err.config?.url })
  } finally {
    loading.value = false
  }
}

/* ── Filters ── */
const handleSearch = () => handleFilterChange()

const handleFilterChange = async () => {
  try {
    await store.updateFilters({
      search:   searchQuery.value,
      day_type: selectedDayType.value,
      status:   selectedStatus.value
    })
  } catch { error.value = 'Failed to apply filters' }
}

const handleClearFilters = async () => {
  searchQuery.value = ''; selectedDayType.value = ''; selectedStatus.value = ''
  await store.clearFilters()
}

/* ── Pagination ── */
const handlePrevPage = async () => { await store.goToPage(pagination.value.currentPage - 1) }
const handleNextPage = async () => { await store.goToPage(pagination.value.currentPage + 1) }

/* ── Modal ── */
const resetForm = () => {
  formData.value = { name: '', price: null, day_type: '', age_min: null, age_max: null, start_time: '', end_time: '', image: null, image_url: null }
}

const handleAddNew = () => { modalMode.value = 'create'; resetForm(); isModalOpen.value = true }
const handleEdit   = r  => { modalMode.value = 'edit';   formData.value = { ...r }; isModalOpen.value = true }
const handleCloseModal = () => { isModalOpen.value = false; resetForm() }

/* ── Image Handling ── */
const handleImageSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image size must be less than 5MB', 'error')
    return
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file', 'error')
    return
  }
  
  // Convert to base64
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.image = e.target?.result
    formData.value.image_url = null // Clear old URL when uploading new image
  }
  reader.readAsDataURL(file)
}

const handleRemoveImage = () => {
  formData.value.image = null
  formData.value.image_url = null
}

/* ── Bulk Image Upload ── */
const handleBulkImageUpload = async (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return

  const validFiles = []
  for (const file of files) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(`${file.name} is too large (max 5MB)`, 'error')
      continue
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast(`${file.name} is not a valid image`, 'error')
      continue
    }

    validFiles.push(file)
  }

  if (validFiles.length === 0) return

  // Convert to base64 and add to uploading list
  for (const file of validFiles) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadingImages.value.push({
        name: file.name,
        file: file,
        preview: e.target?.result,
        uploaded: false
      })
    }
    reader.readAsDataURL(file)
  }

  // Upload images immediately
  await uploadAllImages()

  // Clear input
  if (event.target) {
    event.target.value = ''
  }
}

const uploadAllImages = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  
  for (let i = 0; i < uploadingImages.value.length; i++) {
    const img = uploadingImages.value[i]
    if (!img.uploaded) {
      try {
        // Generate unique filename
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const ext = img.name.substring(img.name.lastIndexOf('.'))
        const filename = `rates-${timestamp}-${randomStr}${ext}`
        
        // Send to backend API
        const response = await fetch(`${apiUrl}/entrance-rates/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: img.preview, // base64 string
            filename: filename
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          uploadedImages.value.push(data.data.url)
          img.uploaded = true
          uploadedImagesCount.value++
          showToast(`✨ Image "${img.name}" uploaded successfully!`, 'success')
        } else {
          showToast(`❌ Failed to upload ${img.name}: ${data.message || 'Unknown error'}`, 'error')
          console.error('Upload failed:', data)
        }
      } catch (err) {
        showToast(`❌ Failed to upload ${img.name}: ${err.message}`, 'error')
        console.error('Upload error:', err)
      }
    }
  }

  // Clear uploading list after all done
  setTimeout(() => {
    uploadingImages.value = []
    uploadedImagesCount.value = 0
  }, 1500)
}

const handleDeleteUploadedImage = async (index) => {
  const imageUrl = uploadedImages.value[index]
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  
  try {
    // Extract filename from URL (e.g., /uploads/entrance-rates/filename.jpg -> filename.jpg)
    const filename = imageUrl.split('/').pop()
    
    // Delete from backend
    const response = await fetch(`${apiUrl}/entrance-rates/images/${filename}`, {
      method: 'DELETE'
    })
    
    const data = await response.json()
    
    if (data.success) {
      uploadedImages.value.splice(index, 1)
      showToast('✅ Image deleted successfully', 'success')
    } else {
      showToast(`❌ Failed to delete image: ${data.message || 'Unknown error'}`, 'error')
    }
  } catch (err) {
    showToast(`❌ Failed to delete image: ${err.message}`, 'error')
    console.error('Delete error:', err)
  }
}

// Open assign image modal
const openAssignImageModal = (imageUrl) => {
  assignImageModal.value.imageUrl = imageUrl
  assignImageModal.value.selectedRateId = ''
  assignImageModal.value.show = true
  assignImageModal.value.loading = false
}

// Close assign image modal
const closeAssignImageModal = () => {
  assignImageModal.value.show = false
  assignImageModal.value.imageUrl = ''
  assignImageModal.value.selectedRateId = ''
}

// Assign image to rate
const handleAssignImage = async () => {
  if (!assignImageModal.value.selectedRateId) return
  
  assignImageModal.value.loading = true
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  
  try {
    const response = await fetch(
      `${apiUrl}/entrance-rates/images/assign/${assignImageModal.value.selectedRateId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: assignImageModal.value.imageUrl })
      }
    )
    
    const data = await response.json()
    
    if (data.success) {
      showToast('✅ Image assigned to rate successfully!', 'success')
      closeAssignImageModal()
      // Reload rates
      await store.fetchRates()
    } else {
      showToast(`❌ Failed to assign image: ${data.message || 'Unknown error'}`, 'error')
    }
  } catch (err) {
    showToast(`❌ Error: ${err.message}`, 'error')
    console.error('Assign error:', err)
  } finally {
    assignImageModal.value.loading = false
  }
}

const handleSaveRate = async () => {
  formLoading.value = true
  try {
    console.log(`💾 ${modalMode.value === 'create' ? 'Creating' : 'Updating'} rate: ${formData.value.name}`)
    if (modalMode.value === 'create') {
      await store.createRate(formData.value)
      showToast(`✨ Rate "${formData.value.name}" created successfully!`, 'success')
    } else {
      await store.updateRate(formData.value.id, formData.value)
      showToast(`📝 Rate "${formData.value.name}" updated successfully!`, 'success')
    }
    handleCloseModal()
    await loadRates()
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Failed to save rate'
    showToast(`❌ ${msg}`, 'error')
    console.error('Save error:', err)
  } finally { formLoading.value = false }
}

/* ── Delete ── */
const handleDelete             = r  => { rateToDelete.value = r; showDeleteConfirm.value = true }
const handleCloseDeleteConfirm = ()  => { showDeleteConfirm.value = false; rateToDelete.value = null }

const handleConfirmDelete = async () => {
  deleteLoading.value = true
  try {
    console.log(`🗑️ Deleting rate: ${rateToDelete.value.name}`)
    await store.deleteRate(rateToDelete.value.id)
    showToast(`🗑️ Rate "${rateToDelete.value.name}" deleted successfully!`, 'success')
    handleCloseDeleteConfirm()
    await loadRates()
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Failed to delete rate'
    showToast(`❌ ${msg}`, 'error')
    console.error('Delete error:', err)
  } finally { deleteLoading.value = false }
}

/* ── Status toggle ── */
const handleToggleStatus = async rate => {
  try {
    const newStatus = rate.status === 'active' ? 'Hidden' : 'Active'
    console.log(`🔄 Toggling status for ${rate.name}: ${newStatus}`)
    await store.toggleRateStatus(rate.id)
    showToast(`🔄 ${rate.name} is now ${newStatus}!`, 'success')
    await loadRates()
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Failed to update status'
    showToast(`❌ ${msg}`, 'error')
    console.error('Status toggle error:', err)
  }
}

const handleRetry = () => loadRates()

/* ── Load existing images ── */
const loadExistingImages = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  
  try {
    const response = await fetch(`${apiUrl}/entrance-rates/images`)
    const data = await response.json()
    
    if (data.success && data.data) {
      uploadedImages.value = data.data.map(img => img.url)
    }
  } catch (err) {
    console.error('Failed to load existing images:', err)
  }
}

onMounted(() => {
  loadRates()
  loadExistingImages()
})
</script>

<style scoped>
/* ══════════════════════════════════════
   DESIGN TOKENS — Eduardo's Resort
══════════════════════════════════════ */
.er-layout {
  --primary:       #0369a1;
  --primary-light: #1F8DBF;
  --navy:          #0C3B5E;
  --gold:          #F4C400;
  --gold-dark:     #F2C200;
  --bg:            #EEF5FB;
  --surface:       #ffffff;
  --border:        #dbeafe;
  --border-soft:   #e5e7eb;
  --text:          #1f2937;
  --text-mid:      #374151;
  --text-sub:      #6b7280;
  --green:         #16a34a;
  --green-bg:      rgba(22,163,74,0.1);
  --red:           #dc2626;
  --red-bg:        rgba(220,38,38,0.1);
  --shadow-sm:     0 1px 4px rgba(3,105,161,0.08);
  --shadow-md:     0 4px 18px rgba(3,105,161,0.12);
  --shadow-lg:     0 12px 36px rgba(12,59,94,0.18);
  --radius:        14px;
  --radius-sm:     8px;
  --header-h:      70px;

  display: flex;
  min-height: 100vh;
  background: var(--bg);
  font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
  color: var(--text);
}

/* ── Layout ── */
.er-main {
  flex: 1;
  min-width: 0;
  padding-top: 5px;
  transition: margin-left 0.3s ease;
  overflow-x: hidden;
}

@media (min-width: 768px) {
  .er-main          { margin-left: 0px; }
  .er-main--shifted { margin-left: 20px; }
}

.er-container {
  max-width: 1380px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .er-container { padding: 1rem 1rem ; gap: 1rem; }
}

/* ══════════════════════════════════════
   HERO STRIP
══════════════════════════════════════ */
.er-hero {
  background: linear-gradient(135deg, var(--navy) 0%, var(--primary) 100%);
  border-radius: var(--radius);
  padding: 2rem 2.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(244,196,0,0.15);
}

.er-hero::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 160px; height: 160px;
  border-radius: 50%;
  background: rgba(244,196,0,0.1);
  pointer-events: none;
}

.er-hero::after {
  content: '';
  position: absolute;
  bottom: -30px; left: 30%;
  width: 100px; height: 100px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  pointer-events: none;
}

.er-hero__left {
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1;
}

.er-hero__icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  color: var(--gold);
  font-size: 1.4rem;
  flex-shrink: 0;
}

.er-hero__title {
  font-size: 1.3rem;
  font-weight: 800;
  color: white;
  margin: 0 0 2px;
  letter-spacing: -0.02em;
}

.er-hero__sub {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.65);
  margin: 0;
}

.er-hero__stats {
  display: flex;
  gap: 1.25rem;
  z-index: 1;
  flex-wrap: wrap;
}

.er-stat {
  background: rgba(255,255,255,0.12);
  border: 1.5px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 0.8rem 1.35rem;
  text-align: center;
  min-width: 90px;
  transition: all 0.25s ease;
}

.er-stat:hover {
  background: rgba(255,255,255,0.18);
  border-color: rgba(244,196,0,0.35);
  transform: translateY(-2px);
}

.er-stat--active { 
  border-color: rgba(34,197,94,0.5); 
  background: rgba(34,197,94,0.15); 
}

.er-stat--hidden { 
  border-color: rgba(107,114,128,0.35); 
  background: rgba(107,114,128,0.12); 
}

.er-stat__val {
  display: block;
  font-size: 1.35rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.er-stat__lbl {
  display: block;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.55);
  margin-top: 3px;
}

/* ══════════════════════════════════════
   TOOLBAR
══════════════════════════════════════ */
.er-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  background: var(--surface);
  border: 1.5px solid var(--border-soft);
  border-radius: var(--radius);
  padding: 1.2rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  flex-wrap: wrap;
  transition: all 0.2s ease;
}

.er-toolbar__filters {
  display: flex;
  gap: 0.65rem;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
}

/* Search */
.er-search {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 200px;
  flex: 1;
  max-width: 280px;
}

.er-search__icon {
  position: absolute; left: 11px;
  color: var(--text-sub); font-size: 0.8rem;
  pointer-events: none;
}

.er-search__input {
  width: 100%;
  padding: 0.62rem 2rem 0.62rem 2.2rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--text);
  background: #f8fbff;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.er-search__input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(3,105,161,0.1);
  background: white;
}

.er-search__clear {
  position: absolute; right: 8px;
  background: none; border: none;
  color: var(--text-sub); font-size: 0.75rem;
  cursor: pointer; padding: 4px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}
.er-search__clear:hover { color: var(--red); background: var(--red-bg); }

/* Select wrap */
.er-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.er-select-wrap__icon {
  position: absolute; left: 10px;
  color: var(--primary); font-size: 0.75rem;
  pointer-events: none;
}

.er-select {
  padding: 0.62rem 0.75rem 0.62rem 2rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--text);
  background: #f8fbff;
  cursor: pointer;
  appearance: none;
  outline: none;
  transition: border-color 0.15s;
}
.er-select:focus { border-color: var(--primary); }

/* ══════════════════════════════════════
   BUTTONS
══════════════════════════════════════ */
.er-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.62rem 1.25rem;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.er-btn--primary {
  background: linear-gradient(135deg, var(--navy) 0%, var(--primary) 100%);
  color: white;
  box-shadow: 0 3px 12px rgba(12,59,94,0.3);
  font-weight: 700;
  letter-spacing: 0.01em;
}
.er-btn--primary:hover { 
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  transform: translateY(-2px); 
  box-shadow: 0 6px 20px rgba(3,105,161,0.35);
}
.er-btn--primary i { color: var(--gold); font-weight: 700; }

.er-btn--ghost {
  background: transparent;
  color: var(--text-sub);
  border: 1.5px solid var(--border-soft);
}
.er-btn--ghost:hover { border-color: var(--primary); color: var(--primary); background: rgba(3,105,161,0.05); }

.er-btn--danger {
  background: var(--red);
  color: white;
  box-shadow: 0 2px 8px rgba(220,38,38,0.25);
}
.er-btn--danger:hover { background: #b91c1c; transform: translateY(-1px); }
.er-btn--danger:disabled,
.er-btn--primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

/* ══════════════════════════════════════
   CARD / TABLE
══════════════════════════════════════ */
.er-card {
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.er-table-wrap { overflow-x: auto; }

.er-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.er-table thead th {
  padding: 0.9rem 1.1rem;
  text-align: left;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-sub);
  background: #f4f8fc;
  border-bottom: 2px solid rgba(244,196,0,0.3);
  white-space: nowrap;
}

.er-table__th--center,
.er-table__td--center { text-align: center; }

.er-table__row {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.12s;
  animation: rowFadeIn 0.3s ease both;
}

@keyframes rowFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.er-table__row:hover { background: rgba(3,105,161,0.03); }
.er-table__row:last-child { border-bottom: none; }

.er-table tbody td {
  padding: 0.85rem 1.1rem;
  color: var(--text);
  vertical-align: middle;
}

/* Name cell */
.er-name-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.er-name-cell__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.er-dot--weekday { background: #3b82f6; }
.er-dot--weekend { background: #f43f5e; }
.er-dot--holiday { background: #f97316; }

.er-name-cell__text {
  font-weight: 700;
  color: var(--navy);
}

/* Day badge */
.er-day-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.er-day-badge--weekday { background: rgba(59,130,246,0.1); color: #1e40af; border: 1px solid rgba(59,130,246,0.25); }
.er-day-badge--weekend { background: rgba(244,63,94,0.1);  color: #881337; border: 1px solid rgba(244,63,94,0.25); }
.er-day-badge--holiday { background: rgba(249,115,22,0.1); color: #7c2d12; border: 1px solid rgba(249,115,22,0.25); }

/* Price */
.er-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.er-price__currency {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-sub);
}

.er-price__amount {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--navy);
  font-family: 'Courier New', monospace;
}

/* Meta */
.er-meta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  color: var(--text-sub);
}

.er-meta i { font-size: 0.72rem; color: var(--primary); }

.er-meta--all { font-style: italic; }

/* Status toggle */
.er-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  border: none;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.02em;
}

.er-status--active {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid rgba(22,163,74,0.25);
}
.er-status--active:hover { background: rgba(22,163,74,0.2); }

.er-status--hidden {
  background: rgba(107,114,128,0.1);
  color: #4b5563;
  border: 1px solid rgba(107,114,128,0.2);
}
.er-status--hidden:hover { background: rgba(107,114,128,0.18); }

.er-status__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Actions */
.er-actions { display: flex; gap: 0.4rem; justify-content: center; }

.er-act {
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-soft);
  background: transparent;
  font-size: 0.78rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.18s;
}

.er-act--edit { color: var(--primary); }
.er-act--edit:hover { background: rgba(3,105,161,0.1); border-color: rgba(3,105,161,0.3); transform: translateY(-1px); }

.er-act--del { color: var(--red); }
.er-act--del:hover { background: var(--red-bg); border-color: rgba(220,38,38,0.3); transform: translateY(-1px); }

/* ══════════════════════════════════════
   STATES
══════════════════════════════════════ */
.er-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 5rem 2rem;
  color: var(--text-sub);
  background: var(--surface);
  border-radius: var(--radius);
  border: 1.5px solid var(--border-soft);
  animation: fadeIn 0.3s ease;
}

.er-state p {
  font-size: 0.95rem;
  margin: 0;
}

.er-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-right-color: var(--gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.er-error {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fef5f2 100%);
  border: 1.5px solid rgba(220,38,38,0.3);
  border-radius: var(--radius);
  color: #991b1b;
  flex-wrap: wrap;
}

.er-error__icon { 
  font-size: 1.5rem; 
  flex-shrink: 0; 
  color: #dc2626;
}

.er-error__content {
  flex: 1;
  min-width: 250px;
}

.er-error__title { 
  font-weight: 800; 
  font-size: 1rem; 
  margin: 0 0 0.5rem; 
  color: #991b1b;
}

.er-error__msg   { 
  font-size: 0.9rem; 
  opacity: 0.85; 
  margin: 0 0 0.75rem;
  line-height: 1.5;
}

.er-error__hint {
  font-size: 0.85rem;
  margin: 0.5rem 0 0;
  padding: 0.75rem;
  background: rgba(220,38,38,0.08);
  border-radius: 6px;
  color: #7c2d12;
  border-left: 3px solid #f97316;
}

.er-empty {
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.er-empty__icon {
  width: 80px; height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(3,105,161,0.1) 0%, rgba(31,141,191,0.08) 100%);
  color: var(--primary);
  font-size: 2rem;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 12px rgba(3,105,161,0.12);
}

.er-empty__title { font-size: 1.15rem; font-weight: 800; color: var(--navy); margin: 0; }
.er-empty__sub   { font-size: 0.9rem; color: var(--text-sub); margin: 0; max-width: 320px; line-height: 1.5; }

.er-empty .er-btn {
  margin-top: 0.5rem;
  padding: 0.75rem 1.75rem;
  font-size: 0.95rem;
}

.er-empty .er-btn--primary {
  background: linear-gradient(135deg, var(--navy) 0%, var(--primary) 100%);
  box-shadow: 0 4px 16px rgba(3,105,161,0.3);
}

.er-empty .er-btn--primary:hover {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  box-shadow: 0 6px 20px rgba(3,105,161,0.4);
}

/* ══════════════════════════════════════
   PAGINATION
══════════════════════════════════════ */
.er-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-soft);
  background: #fafcff;
}

.er-pg-btn {
  width: 34px; height: 34px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: white;
  color: var(--primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.18s;
}
.er-pg-btn:hover:not(:disabled) { background: var(--gold); border-color: var(--gold); color: var(--navy); }
.er-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.er-pg-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-sub);
}

.er-pg-info__current { font-size: 1rem; font-weight: 800; color: var(--navy); }
.er-pg-info__sep     { color: var(--text-sub); }
.er-pg-info__total   { font-weight: 600; color: var(--text-mid); }
.er-pg-info__records { font-size: 0.75rem; margin-left: 4px; }

/* ══════════════════════════════════════
   MODAL
══════════════════════════════════════ */
.er-overlay {
  position: fixed; inset: 0;
  background: rgba(12,59,94,0.5);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.er-modal {
  background: white;
  border-radius: 18px;
  max-width: 520px;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-soft);
}

.er-modal--sm { max-width: 420px; }

.er-modal__header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.4rem 1.5rem;
  border-bottom: 2px solid var(--gold);
  background: linear-gradient(135deg, #f0f7ff 0%, #fafcff 100%);
}

.er-modal__header--danger {
  background: linear-gradient(135deg, var(--navy) 0%, var(--primary) 100%);
  border-bottom-color: rgba(255,255,255,0.15);
}

.er-modal__icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: rgba(3,105,161,0.1);
  color: var(--primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.er-modal__icon--danger {
  background: rgba(255,255,255,0.18);
  color: var(--gold);
}

.er-modal__title {
  font-size: 1.05rem; font-weight: 800;
  color: var(--navy); margin: 0 0 2px;
}
.er-modal__title--light { color: white; }

.er-modal__sub { font-size: 0.78rem; color: var(--text-sub); margin: 0; }
.er-modal__sub--light { color: rgba(255,255,255,0.65); }

.er-modal__close {
  margin-left: auto;
  width: 32px; height: 32px;
  border-radius: 8px;
  background: rgba(0,0,0,0.06);
  border: none;
  color: var(--text-sub);
  font-size: 0.85rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.er-modal__close:hover { background: var(--red-bg); color: var(--red); }
.er-modal__close--light { background: rgba(255,255,255,0.15); color: white; }
.er-modal__close--light:hover { background: rgba(220,38,38,0.4); }

.er-modal__body { padding: 1.5rem; }

/* ── Form ── */
.er-form { display: flex; flex-direction: column; gap: 1rem; }

.er-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.er-form__group--full { grid-column: 1 / -1; }

.er-form__section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary);
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
  margin-top: 0.25rem;
}

.er-form__section-label span {
  color: var(--text-sub);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.72rem;
}

.er-form__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 5px;
}

.er-form__label i { color: var(--primary); font-size: 0.72rem; }

.er-form__input,
.er-form__select {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--text);
  background: #f8fbff;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  outline: none;
}

.er-form__input:focus,
.er-form__select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(3,105,161,0.1);
  background: white;
}

.er-form__select { cursor: pointer; }

.er-form__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--border-soft);
  margin-top: 0.25rem;
}

/* Delete confirm */
.er-confirm {
  background: #fef2f2;
  border: 1px solid rgba(220,38,38,0.2);
  border-radius: var(--radius-sm);
  padding: 1.1rem 1.25rem;
  margin-bottom: 1.25rem;
  text-align: center;
}

.er-confirm p { font-size: 0.875rem; color: var(--text-mid); margin: 0 0 4px; }
.er-confirm__name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--red);
  margin: 6px 0 !important;
}

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
.er-toast {
  position: fixed;
  bottom: 2rem; right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.16);
  z-index: 9999;
  min-width: 260px;
  max-width: 380px;
  background: white;
  border-left: 4px solid transparent;
}

.er-toast--success { border-left-color: var(--green); }
.er-toast--error   { border-left-color: var(--red);   }
.er-toast--warning { border-left-color: #f59e0b;      }

.er-toast__icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.er-toast--success .er-toast__icon { background: var(--green-bg); color: var(--green); }
.er-toast--error   .er-toast__icon { background: var(--red-bg);   color: var(--red); }
.er-toast--warning .er-toast__icon { background: #fffbeb;         color: #92400e; }

.er-toast__msg {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.er-toast__close {
  background: none; border: none;
  color: var(--text-sub); font-size: 0.78rem;
  cursor: pointer; padding: 4px; border-radius: 4px;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}
.er-toast__close:hover { color: var(--red); background: var(--red-bg); }

/* ══════════════════════════════════════
   IMAGE UPLOAD
══════════════════════════════════════ */
.er-image-preview {
  position: relative;
  width: 100%;
  max-width: 200px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--border-soft);
}

.er-image-preview__img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.er-image-preview__remove {
  position: absolute;
  top: 8px; right: 8px;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--red);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.75rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}
.er-image-preview__remove:hover {
  background: darken(var(--red), 10%);
  transform: scale(1.1);
}

.er-image-input {
  position: relative;
}

.er-image-input__file {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 2;
}

.er-image-input__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: rgba(3,105,161,0.03);
  transition: all 0.2s ease;
  text-align: center;
}

.er-image-input__label i {
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.er-image-input__label span {
  font-size: 0.875rem;
  color: var(--text-mid);
  font-weight: 600;
}

.er-image-input:hover .er-image-input__label {
  border-color: var(--primary);
  background: rgba(3,105,161,0.08);
}

/* ══════════════════════════════════════
   BULK IMAGE UPLOAD SECTION
══════════════════════════════════════ */
.er-upload-section {
  margin-top: 2rem;
}

.er-upload-section__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border);
}

.er-upload-section__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(3,105,161,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-size: 1.3rem;
}

.er-upload-section__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.25rem;
}

.er-upload-section__sub {
  font-size: 0.85rem;
  color: var(--text-sub);
  margin: 0;
}

.er-upload-section__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Upload Main Area */
.er-upload-main {
  position: relative;
}

.er-upload-main__file {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 2;
}

.er-upload-main__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  border: 2.5px dashed var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  background: rgba(3,105,161,0.03);
  transition: all 0.2s ease;
  text-align: center;
}

.er-upload-main__label i {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 0.75rem;
}

.er-upload-main__label span {
  font-size: 1rem;
  color: var(--text-mid);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.er-upload-main__label small {
  font-size: 0.8rem;
  color: var(--text-sub);
}

.er-upload-main:hover .er-upload-main__label {
  border-color: var(--primary);
  background: rgba(3,105,161,0.1);
}

/* Upload List (During Upload) */
.er-upload-list {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.er-upload-list__header {
  background: var(--border-soft);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.er-upload-list__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.er-upload-list__count {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary);
  background: rgba(3,105,161,0.15);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
}

.er-upload-list__items {
  display: flex;
  flex-direction: column;
  max-height: 300px;
  overflow-y: auto;
}

.er-upload-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--border-soft);
  transition: background 0.15s ease;
}

.er-upload-item:hover {
  background: rgba(3,105,161,0.03);
}

.er-upload-item__preview {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--border-soft);
}

.er-upload-item__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.er-upload-item__info {
  flex: 1;
  min-width: 0;
}

.er-upload-item__name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.er-upload-item__size {
  font-size: 0.75rem;
  color: var(--text-sub);
  margin: 0;
}

.er-upload-item__status {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.er-upload-item__loading {
  color: var(--primary);
  font-size: 1rem;
}

.er-upload-item__success {
  color: var(--green);
  font-size: 1.1rem;
}

/* Uploaded Images Gallery */
.er-uploaded-gallery {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.er-uploaded-gallery__header {
  background: var(--green-bg);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(22,163,74,0.2);
}

.er-uploaded-gallery__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--green);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.er-uploaded-gallery__count {
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  background: var(--green);
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
}

.er-uploaded-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.er-gallery-item {
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--border-soft);
  aspect-ratio: 1;
  transition: transform 0.2s ease;
}

.er-gallery-item:hover {
  transform: scale(1.02);
}

.er-gallery-item__image {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.er-gallery-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.er-gallery-item__actions {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.er-gallery-item:hover .er-gallery-item__actions {
  opacity: 1;
}

.er-gallery-item__assign,
.er-gallery-item__delete {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.er-gallery-item__assign {
  background: #0066cc;
}

.er-gallery-item__assign:hover {
  background: #0052a3;
  transform: scale(1.1);
}

.er-gallery-item__delete {
  background: var(--red);
}

.er-gallery-item__delete:hover {
  background: darken(var(--red), 10%);
  transform: scale(1.1);
}

/* ── Assign Image Modal ── */
.er-assign-preview {
  width: 100%;
  height: 200px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--border-soft);
  margin-bottom: 1.5rem;
}

.er-assign-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.er-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.er-form-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.er-form-input {
  padding: 0.75rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  color: var(--text-primary);
  background: white;
  transition: all 0.2s ease;
}

.er-form-input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

/* ── Transitions ── */
.er-modal-enter-active, .er-modal-leave-active { transition: opacity 0.22s ease; }
.er-modal-enter-active .er-modal, .er-modal-leave-active .er-modal { transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease; }
.er-modal-enter-from { opacity: 0; }
.er-modal-leave-to   { opacity: 0; }
.er-modal-enter-from .er-modal { transform: translateY(20px) scale(0.97); opacity: 0; }
.er-modal-leave-to   .er-modal { transform: translateY(10px) scale(0.98); opacity: 0; }

.er-toast-enter-active, .er-toast-leave-active { transition: all 0.3s ease; }
.er-toast-enter-from { opacity: 0; transform: translateX(20px); }
.er-toast-leave-to   { opacity: 0; transform: translateX(20px); }

/* ── Mobile ── */
@media (max-width: 640px) {
  .er-hero { padding: 1.1rem 1.25rem; }
  .er-hero__stats { gap: 0.6rem; }
  .er-stat { padding: 0.55rem 0.75rem; min-width: 60px; }
  .er-toolbar { flex-direction: column; align-items: stretch; }
  .er-toolbar__filters { flex-direction: column; }
  .er-search { max-width: 100%; }
  .er-form__row { grid-template-columns: 1fr; }
  .er-toast { right: 1rem; left: 1rem; bottom: 1rem; }
}
</style>