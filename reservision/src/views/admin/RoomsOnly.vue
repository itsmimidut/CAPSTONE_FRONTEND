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
          <div class="controls-container">
            <div class="search-filter">
              <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input v-model="searchQuery" class="search-input" placeholder="Search rooms..." />
              </div>
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
              <button class="btn-add" @click="openRoomModal()">
                <i class="fas fa-plus"></i> <span class="hidden sm:inline">Add New Room</span><span class="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="rooms-summary">
            <i class="fas fa-bed" style="color: #F4C400; margin-right: 0.5rem;"></i>
            Showing <span style="color: #F4C400; font-weight: 700;">{{ filteredRooms.length }}</span> room(s)
          </div>

          <!-- Rooms Grid -->
          <div class="room-grid">
            <RoomCard
              v-for="room in filteredRooms"
              :key="room.item_id"
              :room="room"
              @edit="openRoomModal(room)"
              @delete="deleteRoom(room.item_id)"
            />
            <div v-if="filteredRooms.length === 0" class="empty-state col-span-full">
              <i class="fas fa-bed"></i>
              <p>No rooms found</p>
              <button @click="openRoomModal()" class="btn-add mt-3">
                <i class="fas fa-plus"></i> Add Your First Room
              </button>
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
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%);
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
  margin-bottom: 1.5rem;
}

/* Controls Container */
.controls-container {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  margin-bottom: 1.5rem;
  border: 1px solid rgba(31, 141, 191, 0.1);
  position: relative;
  overflow: hidden;
}

.controls-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #1F8DBF 50%, #F4C400 50%);
}

.search-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.search-wrapper {
  position: relative;
  flex: 2;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #F4C400;
  font-size: 0.875rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid rgba(31, 141, 191, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: white;
  color: #1F8DBF;
  font-weight: 500;
}

.search-input:focus {
  outline: none;
  border-color: #F4C400;
  box-shadow: 0 0 0 3px rgba(244, 196, 0, 0.15);
}

.search-input::placeholder {
  color: rgba(31, 141, 191, 0.4);
  font-weight: normal;
}

@media (min-width: 640px) {
  .search-input {
    font-size: 0.95rem;
    padding: 0.875rem 1rem 0.875rem 2.5rem;
  }
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid rgba(244, 196, 0, 0.3);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
  color: #1F8DBF;
  font-weight: 500;
  min-width: 140px;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #1F8DBF;
  box-shadow: 0 0 0 3px rgba(31, 141, 191, 0.15);
}

@media (min-width: 640px) {
  .filter-select {
    font-size: 0.95rem;
    padding: 0.875rem 1rem;
  }
}

.btn-add {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
}

.btn-add:hover {
  background: linear-gradient(135deg, #1E88B6 0%, #1F8DBF 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.3);
}

.btn-add i {
  font-size: 0.875rem;
  color: #F4C400;
  transition: all 0.3s ease;
}

.btn-add:hover i {
  transform: rotate(90deg);
}

@media (min-width: 640px) {
  .btn-add {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}

/* Rooms Summary */
.rooms-summary {
  margin-bottom: 1.25rem;
  padding: 0.5rem 1rem;
  background: rgba(244, 196, 0, 0.05);
  border-radius: 30px;
  display: inline-block;
  border: 1px solid rgba(31, 141, 191, 0.2);
  color: #1F8DBF;
  font-size: 0.875rem;
  font-weight: 500;
}

@media (min-width: 768px) {
  .rooms-summary {
    font-size: 0.95rem;
    margin-bottom: 1rem;
    padding: 0.5rem 1.25rem;
  }
}

/* Rooms Grid */
.room-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .room-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .room-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.75rem;
  }
}

@media (min-width: 1280px) {
  .room-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #F4C400;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #1F8DBF;
  opacity: 0.3;
}

.empty-state p {
  font-size: 1rem;
  color: #1F8DBF;
  margin-bottom: 1rem;
}

.empty-state .btn-add {
  display: inline-flex;
  margin-top: 0.5rem;
}

/* RoomCard Customization - applied to the component */
:deep(.room-card) {
  border-left: 4px solid #1F8DBF;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
}

:deep(.room-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(31, 141, 191, 0.15);
  border-left-color: #F4C400;
}

:deep(.room-card .room-header) {
  background: linear-gradient(to right, rgba(31, 141, 191, 0.05), rgba(244, 196, 0, 0.05));
  border-bottom: 2px solid #F4C400;
}

:deep(.room-card .room-title) {
  color: #1F8DBF;
  font-weight: 700;
}

:deep(.room-card .room-price) {
  color: #F4C400;
  font-weight: 700;
}

:deep(.room-card .room-status.Available) {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
  border: 1px solid #1F8DBF;
}

:deep(.room-card .room-status.Occupied) {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  border: 1px solid #F4C400;
}

:deep(.room-card .room-status.Under\\ Maintenance) {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid #ef4444;
}

:deep(.room-card .room-footer) {
  border-top: 2px solid rgba(244, 196, 0, 0.2);
  background: rgba(31, 141, 191, 0.02);
}

:deep(.room-card .btn-action) {
  transition: all 0.2s ease;
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.room-card .btn-action.edit-btn) {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
}

:deep(.room-card .btn-action.edit-btn:hover) {
  background: #1F8DBF;
  color: white;
  transform: scale(1.1);
}

:deep(.room-card .btn-action.delete-btn) {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}

:deep(.room-card .btn-action.delete-btn:hover) {
  background: #F4C400;
  color: #1F8DBF;
  transform: scale(1.1);
}

:deep(.room-card .room-type) {
  color: #6b7280;
  font-size: 0.875rem;
}

:deep(.room-card .room-description) {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>