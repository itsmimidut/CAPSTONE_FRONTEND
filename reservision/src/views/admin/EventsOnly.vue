<template>
  <div class="admin-dashboard">
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <!-- Header -->
    <AdminHeader 
      title="Events"
      subtitle="Manage resort events and activities"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">
        <div class="p-3 md:p-4 lg:p-6">
          <!-- Stats -->
          <div class="stats-section grid gap-3 mb-4 grid-cols-2 md:grid-cols-4">
            <StatCard icon="fa-calendar" color="purple" :value="stats.total" label="Total Events" />
            <StatCard icon="fa-check-circle" color="green" :value="stats.available" label="Available" />
            <StatCard icon="fa-users" color="blue" :value="stats.occupied" label="Occupied" />
            <StatCard icon="fa-tools" color="yellow" :value="stats.maintenance" label="Maintenance" />
          </div>

          <!-- Controls -->
          <div class="page-controls mb-4">
            <div class="search-filter flex flex-wrap gap-2 items-center">
              <input v-model="searchQuery" class="search-box" placeholder="Search events..." />
              <select v-model="statusFilter" class="filter-select">
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Under Maintenance">Maintenance</option>
              </select>
              <button class="btn btn-primary" @click="openEventModal()">
                <i class="fas fa-plus"></i> <span class="hidden sm:inline">Add New Event</span><span class="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          <!-- Events Grid -->
          <div class="section-summary">Showing {{ filteredEvents.length }} event(s)</div>

          <div class="room-grid">
            <RoomCard
              v-for="event in filteredEvents"
              :key="event.item_id"
              :room="event"
              @edit="openEventModal(event)"
              @delete="deleteEvent(event.item_id)"
            />
            <div v-if="filteredEvents.length === 0" class="text-center py-10 text-gray-500 col-span-full">
              No events found.
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Use shared RoomModal for events (category_type = event) -->
    <RoomModal
      v-model:show="showEventModal"
      :initial-room="mappedEvent"
      @save="handleSaveEvent"
      @close="closeEventModal"
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
const showEventModal = ref(false)

// Get events from roomsStore (filtered by category_type = 'event')
const events = computed(() => {
  console.log('All rooms in store:', roomsStore.rooms)
  const filtered = roomsStore.rooms.filter(r => r.category_type === 'event')
  console.log('Filtered events:', filtered)
  return filtered
})
const eventForm = ref({
  id: null,
  name: '',
  description: '',
  date: '',
  time: '',
  location: '',
  status: 'Available',
  category: 'Event',
  price: 0,
  max_guests: 0,
  images: []
})

// Map event data to RoomModal shape
const mappedEvent = computed(() => ({
  item_id: eventForm.value.id,
  name: eventForm.value.name,
  description: eventForm.value.description,
  category: eventForm.value.category || 'Event',
  category_type: 'event',
  status: eventForm.value.status,
  room_number: eventForm.value.location,
  date: eventForm.value.date,
  time: eventForm.value.time,
  price: eventForm.value.price || 0,
  max_guests: eventForm.value.max_guests || 0,
  promo: false,
  images: eventForm.value.images || []
}))

const stats = computed(() => ({
  total: events.value.length,
  available: events.value.filter(e => e.status === 'Available').length,
  occupied: events.value.filter(e => e.status === 'Occupied').length,
  maintenance: events.value.filter(e => e.status === 'Under Maintenance').length
}))

const filteredEvents = computed(() => {
  return events.value.filter(event => {
    const matchSearch = event.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchStatus = statusFilter.value === 'all' || event.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

const openEventModal = (event = null) => {
  if (event) {
    eventForm.value = {
      id: event.item_id,
      name: event.name,
      description: event.description,
      date: event.date || '',
      time: event.time || '',
      location: event.room_number,
      status: event.status,
      category: event.category,
      price: event.price || 0,
      max_guests: event.max_guests || 0,
      images: event.images || []
    }
  } else {
    eventForm.value = {
      id: null,
      name: '',
      description: '',
      date: '',
      time: '',
      location: '',
      status: 'Available',
      category: 'Event',
      price: 0,
      max_guests: 0,
      images: []
    }
  }
  showEventModal.value = true
}

const closeEventModal = () => {
  showEventModal.value = false
}

const handleSaveEvent = async (roomData) => {
  try {
    // Ensure category_type is 'event'
    const eventData = {
      ...roomData,
      category_type: 'event',
      category: roomData.category || 'Event'
    }
    
    console.log('Saving event with data:', eventData)
    await roomsStore.saveRoom(eventData)
    closeEventModal()
  } catch (error) {
    console.error('Error saving event:', error)
    alert('Error saving event: ' + (error.response?.data?.message || error.message))
  }
}

const deleteEvent = async (id) => {
  if (!confirm('Delete event?')) return
  try {
    await roomsStore.deleteRoom(id)
  } catch (error) {
    console.error('Error deleting event:', error)
    alert('Error deleting event: ' + (error.response?.data?.message || error.message))
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
