<template>
  <div class="admin-dashboard">
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <!-- Header -->
    <AdminHeader 
      title="Cottages"
      subtitle="Manage your resort cottages"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">
        <div class="p-4 md:p-6">
          <!-- Stats -->
          <div class="stats-section grid gap-3 mb-4 md:grid-cols-4 grid-cols-2">
            <StatCard icon="fa-home" color="blue" :value="stats.total" label="Total Cottages" />
            <StatCard icon="fa-check-circle" color="green" :value="stats.available" label="Available" />
            <StatCard icon="fa-user-friends" color="orange" :value="stats.occupied" label="Occupied" />
            <StatCard icon="fa-tools" color="yellow" :value="stats.maintenance" label="Maintenance" />
          </div>

          <!-- Controls -->
          <div class="page-controls mb-4">
            <div class="search-filter flex flex-wrap gap-2 items-center">
              <input v-model="searchQuery" class="search-box" placeholder="Search cottages..." />
              <select v-model="statusFilter" class="filter-select">
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Under Maintenance">Maintenance</option>
              </select>
              <button class="btn btn-primary" @click="openCottageModal()">
                <i class="fas fa-plus"></i> <span class="hidden sm:inline">Add New </span>Cottage
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="section-summary">Showing {{ filteredCottages.length }} cottage(s)</div>

          <!-- Cottages Grid -->
          <div class="cottage-grid">
            <RoomCard
              v-for="cottage in filteredCottages"
              :key="cottage.item_id"
              :room="cottage"
              @edit="openCottageModal(cottage)"
              @delete="deleteCottage(cottage.item_id)"
            />
            <div v-if="filteredCottages.length === 0" class="text-center py-10 text-gray-500 col-span-full">
              No cottages found.
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Cottage Modal -->
    <RoomModal
      v-model:show="showCottageModal"
      :initial-room="editingCottage"
      @save="handleSaveCottage"
      @close="closeCottageModal"
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

const roomsStore = useRoomsStore()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const showCottageModal = ref(false)
const editingCottage = ref(null)

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

onMounted(() => {
  roomsStore.fetchRooms()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #F3F4F6;
}

.main-content {
  margin-left: 0;
  padding-top: 4.5rem;
  transition: margin-left 0.3s ease;
}

@media (min-width: 768px) {
  .main-content {
    margin-left: 260px;
  }
}

.content-container {
  padding: 0.75rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .content-container {
    padding: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .content-container {
    padding: 2rem;
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .stats-section {
    gap: 1rem;
  }
}

@media (min-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .stats-section {
    gap: 1.5rem;
  }
}

.page-controls {
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .page-controls {
    padding: 1rem;
  }
}

@media (min-width: 1024px) {
  .page-controls {
    padding: 1.5rem;
    border-radius: 8px;
  }
}

.search-filter {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  align-items: center;
}

@media (min-width: 640px) {
  .search-filter {
    gap: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .search-filter {
    gap: 1rem;
  }
}

.search-box {
  padding: 0.5rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.875rem;
  flex: 1;
  width: auto;
}

@media (min-width: 640px) {
  .search-box {
    padding: 0.625rem 0.875rem;
    font-size: 0.9rem;
  }
}

@media (min-width: 1024px) {
  .search-box {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .filter-select {
    padding: 0.625rem 0.875rem;
    font-size: 0.9rem;
  }
}

@media (min-width: 1024px) {
  .filter-select {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.9rem;
  }
}

@media (min-width: 1024px) {
  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
}

.btn-primary {
  background: #10B981;
  color: white;
}

.btn-primary:hover {
  background: #059669;
  transform: translateY(-2px);
}

.section-summary {
  margin-bottom: 1rem;
  color: #6B7280;
  font-size: 0.875rem;
}

@media (min-width: 1024px) {
  .section-summary {
    font-size: 0.95rem;
  }
}

.cottage-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .cottage-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .cottage-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1280px) {
  .cottage-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
</style>
