<template>
  <div class="admin-dashboard">
    <AdminSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <AdminHeader
      title="Cottages"
      subtitle="Manage your resort cottages"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <main class="main-content">
      <div class="content-container">

        <!-- ── Stats ── -->
        <div class="stats-grid">
          <StatCard icon="fa-home"         color="blue"   :value="stats.total"       label="Total Cottages" />
          <StatCard icon="fa-check-circle" color="green"  :value="stats.available"   label="Available" />
          <StatCard icon="fa-user-friends" color="orange" :value="stats.occupied"    label="Occupied" />
          <StatCard icon="fa-tools"        color="yellow" :value="stats.maintenance" label="Maintenance" />
        </div>

        <!-- ── Controls ── -->
        <div class="controls-card">
          <div class="controls-bar">
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="searchQuery"
                class="search-input"
                placeholder="Search cottages…"
              />
              <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <select v-model="statusFilter" class="filter-select">
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Under Maintenance">Maintenance</option>
            </select>

            <button class="btn-add" @click="openCottageModal()">
              <i class="fas fa-plus"></i>
              <span>Add New Cottage</span>
            </button>
            <button class="btn-add" @click="openPromoModal()">
              <i class="fas fa-tags"></i> <span class="hidden sm:inline">Manage Promos</span><span class="sm:hidden">Promos</span>
            </button>
          </div>
        </div>

        <!-- ── Summary pill ── -->
        <div class="rooms-summary">
          <i class="fas fa-home summary-icon"></i>
          Showing <strong>{{ filteredCottages.length }}</strong> cottage(s)
        </div>

        <!-- ── Cottages Grid ── -->
        <div class="room-grid">
          <RoomCard
            v-for="cottage in filteredCottages"
            :key="cottage.item_id"
            :room="cottage"
            @promo="openPromoModalForCottage(cottage)"
            @edit="openCottageModal(cottage)"
            @delete="deleteCottage(cottage.item_id)"
          />

          <div v-if="filteredCottages.length === 0" class="empty-state">
            <div class="empty-icon-wrap">
              <i class="fas fa-home"></i>
            </div>
            <p class="empty-title">No cottages found</p>
            <p class="empty-sub">Try adjusting your filters or add a new cottage.</p>
            <button class="btn-add" @click="openCottageModal()">
              <i class="fas fa-plus"></i> Add Your First Cottage
            </button>
          </div>
        </div>

      </div>
    </main>

    <RoomModal
      v-model:show="showCottageModal"
      :initial-room="editingCottage"
      @save="handleSaveCottage"
      @close="closeCottageModal"
    />

    <PromoFormModal
      v-model:show="promoModal.show"
      :initial-promo="promoModal.data"
      :available-items="roomsStore.rooms"
      @save="savePromo"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoomsStore } from '../../stores/rooms.js'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue' 
import StatCard from '../../components/RCE/StatCard.vue'
import RoomCard from '../../components/RCE/RoomCard.vue'
import RoomModal from '../../components/RCE/Modals/RoomModal.vue'
import PromoFormModal from '../../components/RCE/Modals/PromoModal.vue'

const roomsStore = useRoomsStore()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const showCottageModal = ref(false)
const editingCottage = ref(null)
const promoModal = ref({ show: false, data: null })

const cottagesOnly = computed(() =>
  roomsStore.rooms.filter(r =>
    r.category === 'Cottage' ||
    r.category_type === 'cottage' ||
    r.room_type === 'Cottage'
  )
)

const stats = computed(() => {
  const cottages = cottagesOnly.value
  return {
    total: cottages.length,
    available: cottages.filter(r => r.status === 'Available').length,
    occupied: cottages.filter(r => r.status === 'Occupied').length,
    maintenance: cottages.filter(r => r.status === 'Under Maintenance').length
  }
})

const filteredCottages = computed(() => {
  return cottagesOnly.value.filter(cottage => {
    const name = (cottage.name || cottage.room_name || '').toLowerCase()
    const matchSearch = name.includes(searchQuery.value.toLowerCase())
    const matchStatus = statusFilter.value === 'all' || cottage.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

const openCottageModal = (cottage = null) => {
  editingCottage.value = {
    ...cottage,
    category: cottage?.category || 'Cottage',
    category_type: 'cottage'
  }
  showCottageModal.value = true
}

const openPromoModal = () => {
  promoModal.value = { show: true, data: null }
}

const openPromoModalForCottage = (cottage) => {
  const cottageNumber = String(cottage?.room_number || '').trim()
  const cottageLabel = cottageNumber ? `${cottage.name} (${cottageNumber})` : cottage?.name || 'Selected Cottage'
  promoModal.value = {
    show: true,
    data: {
      name: `${cottage?.name || 'Cottage'} Promo`,
      code: '',
      description: `Promo for ${cottageLabel}.`,
      discount_type: 'percent',
      discount_value: 0,
      applies_to_category: 'cottages',
      item_ids: cottage?.item_id ? [String(cottage.item_id)] : [],
      min_subtotal: 0,
      usage_limit: null,
      is_active: true
    }
  }
}

const deleteCottage = async (id) => {
  if (!confirm('Delete cottage?')) return
  try {
    await roomsStore.deleteRoom(id)
  } catch (error) {
    console.error('Error deleting cottage:', error)
  }
}

const closeCottageModal = () => {
  showCottageModal.value = false
  editingCottage.value = null
}

const handleSaveCottage = async (cottageData) => {
  try {
    const payload = {
      ...cottageData,
      category: cottageData.category || 'Cottage',
      category_type: 'cottage'
    }
    await roomsStore.saveRoom(payload)
    closeCottageModal()
  } catch (error) {
    console.error('Error saving cottage:', error)
    alert('Error saving cottage: ' + (error.response?.data?.message || error.message))
  }
}

const savePromo = async (promoData) => {
  try {
    await roomsStore.savePromo(promoData)
    promoModal.value = { show: false, data: null }
  } catch (error) {
    console.error('Error saving promo:', error)
    alert('Error saving promo: ' + (error.response?.data?.error || error.message))
  }
}

onMounted(() => {
  roomsStore.fetchRooms()
})
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.admin-dashboard {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #EEF5FB;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

/* ── Layout ── */
.admin-dashboard {
  min-height: 100vh;
  background: var(--color-gray-bg);
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.main-content {
  margin-left: 0;
  padding-top: 64px;
  transition: margin-left 0.3s ease;
}
@media (min-width: 768px) {
  .main-content { margin-left: 262px; }
}

.content-container {
  padding: 1.5rem 1.75rem;
  max-width: 1400px;
  margin: 0 auto;
}
@media (max-width: 768px) {
  .content-container { padding: 0.85rem; }
}

/* ── Stats Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .stats-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; } }

/* ── Controls Card ── */
.controls-card {
  background: var(--color-white);
  border-radius: 16px;
  padding: 1.1rem 1.4rem;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 10px rgba(3, 105, 161, 0.07);
  margin-bottom: 1.25rem;
  position: relative;
  overflow: hidden;
}

/* Gold + blue top accent bar */
.controls-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary-light) 50%, var(--color-gold) 50%);
  border-radius: 16px 16px 0 0;
}

.controls-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

/* Search */
.search-wrapper {
  position: relative;
  flex: 2;
  min-width: 220px;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-light);
  font-size: 0.82rem;
  pointer-events: none;
}
.search-input {
  width: 100%;
  height: 38px;
  padding: 0 36px;
  border: 1.5px solid var(--color-gray-border);
  border-radius: 10px;
  font-size: 0.875rem;
  color: var(--color-text-dark);
  background: var(--color-white);
  outline: none;
  transition: all 0.15s;
}
.search-input:focus {
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(31, 141, 191, 0.1);
}
.search-input::placeholder { color: var(--color-text-light); }
.search-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--color-text-light);
  font-size: 0.7rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: color 0.15s;
}
.search-clear:hover { color: #ef4444; }

/* Selects */
.filter-select {
  height: 38px;
  padding: 0 0.9rem;
  border: 1.5px solid var(--color-gray-border);
  border-radius: 10px;
  background: var(--color-white);
  color: var(--color-text-dark);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 145px;
  transition: border-color 0.15s;
}
.filter-select:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(31, 141, 191, 0.08);
}

/* Add Button */
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0 1.25rem;
  height: 38px;
  background: var(--color-navy);
  color: var(--color-white);
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(12, 59, 94, 0.22);
  transition: all 0.18s ease;
}
.btn-add:hover {
  background: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(3, 105, 161, 0.28);
}
.btn-add i {
  color: var(--color-gold);
  font-size: 0.8rem;
  transition: transform 0.2s;
}
.btn-add:hover i { transform: rotate(90deg); }

/* ── Summary Pill ── */
.rooms-summary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 0.45rem 1.1rem;
  background: var(--color-white);
  border-radius: 30px;
  border: 0.5px solid var(--color-gray-border);
  color: var(--color-text-dark);
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(3, 105, 161, 0.06);
}
.summary-icon { color: var(--color-gold); font-size: 0.9rem; }
.rooms-summary strong { color: var(--color-primary-light); font-weight: 700; }

/* ── Cottages Grid ── */
.room-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
@media (min-width: 640px)  { .room-grid { grid-template-columns: repeat(2, 1fr); gap: 1.4rem; } }
@media (min-width: 1024px) { .room-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; } }
@media (min-width: 1280px) { .room-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.75rem; } }

/* ── Empty State ── */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--color-white);
  border-radius: 16px;
  border: 2px dashed rgba(244, 196, 0, 0.4);
  box-shadow: 0 2px 10px rgba(3, 105, 161, 0.06);
}
.empty-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(3, 105, 161, 0.08);
  color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}
.empty-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0;
}
.empty-sub {
  font-size: 0.82rem;
  color: var(--color-text-light);
  margin: 0;
}

/* ── RoomCard deep overrides ── */
:deep(.room-card) {
  border-radius: 16px;
  overflow: hidden;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 10px rgba(3, 105, 161, 0.07);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  background: var(--color-white);
}
:deep(.room-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(3, 105, 161, 0.14);
  border-color: rgba(244, 196, 0, 0.4);
}

:deep(.room-card .room-header) {
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
  padding: 0.85rem 1rem;
}
:deep(.room-card .room-title) {
  font-weight: 700;
  font-size: 0.95rem;
}
:deep(.room-card .room-price) {
  color: var(--color-gold);
  font-weight: 700;
  font-size: 0.9rem;
}

:deep(.room-card .room-status) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}
:deep(.room-card .room-status.Available) {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
  border: 1px solid rgba(22, 163, 74, 0.25);
}
:deep(.room-card .room-status.Occupied) {
  background: rgba(31, 141, 191, 0.1);
  color: var(--color-primary-light);
  border: 1px solid rgba(31, 141, 191, 0.25);
}
:deep(.room-card .room-status.Under\ Maintenance) {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.22);
}

:deep(.room-card .room-body) {
  padding: 1rem;
}
:deep(.room-card .room-type) {
  color: var(--color-text-light);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
:deep(.room-card .room-description) {
  color: var(--color-text-dark);
  font-size: 0.875rem;
  line-height: 1.55;
  margin-top: 0.35rem;
}

:deep(.room-card .room-footer) {
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-gray-bg);
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
}

:deep(.room-card .btn-action) {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--color-gray-border);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  transition: all 0.15s ease;
  background: var(--color-white);
}
:deep(.room-card .btn-action:hover) { transform: translateY(-1px); }

:deep(.room-card .btn-action.edit-btn) {
  color: var(--color-primary-light);
}
:deep(.room-card .btn-action.edit-btn:hover) {
  background: var(--color-primary-light);
  color: var(--color-white);
  border-color: var(--color-primary-light);
}

:deep(.room-card .btn-action.delete-btn) {
  color: #ef4444;
}
:deep(.room-card .btn-action.delete-btn:hover) {
  background: #ef4444;
  color: var(--color-white);
  border-color: #ef4444;
}
</style>