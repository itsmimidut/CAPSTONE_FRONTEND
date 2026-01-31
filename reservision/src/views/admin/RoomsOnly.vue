<template>
  <div class="admin-dashboard">
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <!-- Header -->
    <AdminHeader 
      title="Rooms"
      subtitle="Manage your resort rooms"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">
        <div class="p-3 md:p-4 lg:p-6">
          <!-- Stats -->
          <div class="stats-section grid gap-3 mb-4 grid-cols-2 md:grid-cols-4">
            <StatCard icon="fa-bed" color="blue" :value="stats.total" label="Total Rooms" />
            <StatCard icon="fa-check-circle" color="green" :value="stats.available" label="Available" />
            <StatCard icon="fa-user-friends" color="orange" :value="stats.occupied" label="Occupied" />
            <StatCard icon="fa-tools" color="yellow" :value="stats.maintenance" label="Maintenance" />
          </div>

          <!-- Controls -->
          <div class="page-controls mb-4">
            <div class="search-filter flex flex-wrap gap-2 items-center">
              <input v-model="searchQuery" class="search-box" placeholder="Search rooms..." />
              <select v-model="typeFilter" class="filter-select">
                <option value="all">All Types</option>
                <option value="Standard Room">Standard</option>
                <option value="Deluxe Room">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Family Room">Family</option>
              </select>
              <select v-model="statusFilter" class="filter-select">
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Under Maintenance">Maintenance</option>
              </select>
              <button class="btn btn-primary" @click="openRoomModal()">
                <i class="fas fa-plus"></i> <span class="hidden sm:inline">Add New Room</span><span class="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="section-summary">Showing {{ filteredRooms.length }} room(s)</div>

          <!-- Rooms Grid -->
          <div class="room-grid">
            <RoomCard
              v-for="room in filteredRooms"
              :key="room.item_id"
              :room="room"
              @edit="openRoomModal(room)"
              @delete="deleteRoom(room.item_id)"
            />
            <div v-if="filteredRooms.length === 0" class="text-center py-10 text-gray-500 col-span-full">
              No rooms found.
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Room Modal -->
    <RoomModal
      v-model:show="showRoomModal"
      :initial-room="editingRoom"
      @save="handleSaveRoom"
      @close="closeRoomModal"
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
const typeFilter = ref('all')
const statusFilter = ref('all')
const showRoomModal = ref(false)
const editingRoom = ref(null)

const roomsOnly = computed(() =>
  roomsStore.rooms.filter(r => {
    const category = r.category || r.category_type || r.room_type
    return category !== 'Cottage' && category !== 'cottage' && r.category_type !== 'event'
  })
)

const stats = computed(() => ({
  total: roomsOnly.value.length,
  available: roomsOnly.value.filter(r => r.status === 'Available').length,
  occupied: roomsOnly.value.filter(r => r.status === 'Occupied').length,
  maintenance: roomsOnly.value.filter(r => r.status === 'Under Maintenance').length
}))

const filteredRooms = computed(() => {
  return roomsOnly.value.filter(room => {
    const name = (room.name || room.room_name || '').toLowerCase()
    const category = room.category || room.category_type || room.room_type
    const matchSearch = name.includes(searchQuery.value.toLowerCase())
    const matchType = typeFilter.value === 'all' || category === typeFilter.value
    const matchStatus = statusFilter.value === 'all' || room.status === statusFilter.value
    return matchSearch && matchType && matchStatus
  })
})

const openRoomModal = (room = null) => {
  editingRoom.value = room
  showRoomModal.value = true
}

const closeRoomModal = () => {
  showRoomModal.value = false
  editingRoom.value = null
}

const handleSaveRoom = async (roomData) => {
  try {
    await roomsStore.saveRoom(roomData)
    closeRoomModal()
  } catch (error) {
    console.error('Error saving room:', error)
    alert('Error saving room: ' + (error.response?.data?.message || error.message))
  }
}

const deleteRoom = async (id) => {
  if (!confirm('Delete room?')) return
  try {
    await roomsStore.deleteRoom(id)
  } catch (error) {
    console.error('Error deleting room:', error)
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
  padding-top: 3.5rem;
  transition: margin-left 0.3s ease;
}

@media (min-width: 768px) {
  .main-content {
    margin-left: 260px;
    padding-top: 4.5rem;
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
  gap: 0.75rem;
}

.page-controls {
  background: white;
  padding: 0.875rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

@media (min-width: 768px) {
  .page-controls {
    padding: 1.25rem;
  }
}

.search-filter {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  align-items: center;
}

.search-box {
  flex: 1;
  width: auto;
  padding: 0.625rem 0.875rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .search-box {
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
  }
}

.filter-select {
  padding: 0.625rem 0.875rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .filter-select {
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
  }
}

.btn {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s;
  white-space: nowrap;
}

@media (min-width: 640px) {
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
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 0.75rem;
}

@media (min-width: 768px) {
  .section-summary {
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
}

.room-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .room-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .room-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 1280px) {
  .room-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
}
</style>
