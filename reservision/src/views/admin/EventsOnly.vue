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
            <StatCard icon="fa-calendar" color="blue" :value="stats.total" label="Total Events" />
            <StatCard icon="fa-check-circle" color="green" :value="stats.available" label="Available" />
            <StatCard icon="fa-users" color="yellow" :value="stats.occupied" label="Occupied" />
            <StatCard icon="fa-tools" color="orange" :value="stats.maintenance" label="Maintenance" />
          </div>

          <!-- Controls -->
          <div class="controls-container">
            <div class="search-filter">
              <div class="search-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input v-model="searchQuery" class="search-input" placeholder="Search events..." />
              </div>
              <select v-model="statusFilter" class="filter-select">
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Under Maintenance">Maintenance</option>
              </select>
              <button class="btn-add" @click="openEventModal()">
                <i class="fas fa-plus"></i> <span class="hidden sm:inline">Add New Event</span><span class="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="events-summary">
            <i class="fas fa-calendar" style="color: #F4C400; margin-right: 0.5rem;"></i>
            Showing <span style="color: #F4C400; font-weight: 700;">{{ filteredEvents.length }}</span> event(s)
          </div>

          <!-- Events Grid -->
          <div class="event-grid">
            <EventCard
              v-for="event in filteredEvents"
              :key="event.item_id"
              :event="event"
              @edit="openEventModal(event)"
              @delete="deleteEvent(event.item_id)"
            />
            <div v-if="filteredEvents.length === 0" class="empty-state col-span-full">
              <i class="fas fa-calendar"></i>
              <p>No events found</p>
              <button @click="openEventModal()" class="btn-add mt-3">
                <i class="fas fa-plus"></i> Add Your First Event
              </button>
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
import RoomModal from '../../components/RCE/Modals/RoomModal.vue'
import EventCard from '../../components/RCE/EventCard.vue'

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

/* Events Summary */
.events-summary {
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
  .events-summary {
    font-size: 0.95rem;
    margin-bottom: 1rem;
    padding: 0.5rem 1.25rem;
  }
}

/* Events Grid */
.event-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .event-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .event-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.75rem;
  }
}

@media (min-width: 1280px) {
  .event-grid {
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

/* EventCard Customization - will be applied to the component */
:deep(.event-card) {
  border-left: 4px solid #1F8DBF;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
}

:deep(.event-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(31, 141, 191, 0.15);
  border-left-color: #F4C400;
}

:deep(.event-card .event-header) {
  background: linear-gradient(to right, rgba(31, 141, 191, 0.05), rgba(244, 196, 0, 0.05));
  border-bottom: 2px solid #F4C400;
}

:deep(.event-card .event-title) {
  color: #1F8DBF;
  font-weight: 700;
}

:deep(.event-card .event-price) {
  color: #F4C400;
  font-weight: 700;
}

:deep(.event-card .event-status.Available) {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
  border: 1px solid #1F8DBF;
}

:deep(.event-card .event-status.Occupied) {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  border: 1px solid #F4C400;
}

:deep(.event-card .event-status.Under\\ Maintenance) {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid #ef4444;
}

:deep(.event-card .event-footer) {
  border-top: 2px solid rgba(244, 196, 0, 0.2);
  background: rgba(31, 141, 191, 0.02);
}

:deep(.event-card .btn-action) {
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

:deep(.event-card .btn-action.edit-btn) {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
}

:deep(.event-card .btn-action.edit-btn:hover) {
  background: #1F8DBF;
  color: white;
  transform: scale(1.1);
}

:deep(.event-card .btn-action.delete-btn) {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}

:deep(.event-card .btn-action.delete-btn:hover) {
  background: #F4C400;
  color: #1F8DBF;
  transform: scale(1.1);
}

:deep(.event-card .event-location) {
  color: #6b7280;
  font-size: 0.875rem;
}

:deep(.event-card .event-datetime) {
  color: #1F8DBF;
  font-size: 0.875rem;
  font-weight: 500;
}

:deep(.event-card .event-description) {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>