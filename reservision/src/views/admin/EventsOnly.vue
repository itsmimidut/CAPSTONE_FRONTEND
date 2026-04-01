<template>
  <div class="admin-dashboard">
    <AdminSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <AdminHeader
      title="Events"
      subtitle="Manage resort events and activities"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <main class="main-content">
      <div class="content-container">

        <!-- ── Stats ── -->
        <div class="stats-grid">
          <StatCard icon="fa-calendar"     color="blue"   :value="stats.total"       label="Total Events" />
          <StatCard icon="fa-check-circle" color="green"  :value="stats.available"   label="Available" />
          <StatCard icon="fa-users"        color="orange" :value="stats.occupied"    label="Occupied" />
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
                placeholder="Search events…"
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

            <button class="btn-add" @click="openEventModal()">
              <i class="fas fa-plus"></i>
              <span>Add New Event</span>
            </button>
            <button class="btn-add" @click="openPromoModal()">
              <i class="fas fa-tags"></i> <span class="hidden sm:inline">Manage Promos</span><span class="sm:hidden">Promos</span>
            </button>
          </div>
        </div>

        <!-- ── Summary pill ── -->
        <div class="rooms-summary">
          <i class="fas fa-calendar summary-icon"></i>
          Showing <strong>{{ filteredEvents.length }}</strong> event(s)
        </div>

        <!-- ── Events Grid ── -->
        <div class="room-grid">
          <EventCard
            v-for="event in filteredEvents"
            :key="event.item_id"
            :event="event"
            @promo="openPromoModalForEvent(event)"
            @edit="openEventModal(event)"
            @delete="deleteEvent(event.item_id)"
          />

          <div v-if="filteredEvents.length === 0" class="empty-state">
            <div class="empty-icon-wrap">
              <i class="fas fa-calendar"></i>
            </div>
            <p class="empty-title">No events found</p>
            <p class="empty-sub">Try adjusting your filters or add a new event.</p>
            <button class="btn-add" @click="openEventModal()">
              <i class="fas fa-plus"></i> Add Your First Event
            </button>
          </div>
        </div>

      </div>
    </main>

    <RoomModal
      v-model:show="showEventModal"
      :initial-room="mappedEvent"
      @save="handleSaveEvent"
      @close="closeEventModal"
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
import RoomModal from '../../components/RCE/Modals/RoomModal.vue'
import EventCard from '../../components/RCE/EventCard.vue'
import PromoFormModal from '../../components/RCE/Modals/PromoModal.vue'

const roomsStore = useRoomsStore()

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const showEventModal = ref(false)
const promoModal = ref({ show: false, data: null })

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

const openPromoModal = (promo = null) => {
  promoModal.value = { show: true, data: promo ? { ...promo } : null }
}

const openPromoModalForEvent = (event) => {
  const eventNumber = String(event?.room_number || '').trim()
  const eventLabel = eventNumber ? `${event.name} (${eventNumber})` : event?.name || 'Selected Event'
  promoModal.value = {
    show: true,
    data: {
      name: `${event?.name || 'Event'} Promo`,
      code: '',
      description: `Promo for ${eventLabel}.`,
      discount_type: 'percent',
      discount_value: 0,
      applies_to_category: 'events',
      item_ids: event?.item_id ? [String(event.item_id)] : [],
      min_subtotal: 0,
      usage_limit: null,
      is_active: true
    }
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

/* ── Events Grid ── */
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

/* ── EventCard deep overrides ── */
:deep(.event-card) {
  border-radius: 16px;
  overflow: hidden;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 10px rgba(3, 105, 161, 0.07);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  background: var(--color-white);
}
:deep(.event-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(3, 105, 161, 0.14);
  border-color: rgba(244, 196, 0, 0.4);
}

:deep(.event-card .event-header) {
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
  padding: 0.85rem 1rem;
}
:deep(.event-card .event-title) {
  font-weight: 700;
  font-size: 0.95rem;
}
:deep(.event-card .event-price) {
  color: var(--color-gold);
  font-weight: 700;
  font-size: 0.9rem;
}

:deep(.event-card .event-status) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}
:deep(.event-card .event-status.Available) {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
  border: 1px solid rgba(22, 163, 74, 0.25);
}
:deep(.event-card .event-status.Occupied) {
  background: rgba(31, 141, 191, 0.1);
  color: var(--color-primary-light);
  border: 1px solid rgba(31, 141, 191, 0.25);
}
:deep(.event-card .event-status.Under\ Maintenance) {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.22);
}

:deep(.event-card .event-body) {
  padding: 1rem;
}

:deep(.event-card .event-footer) {
  border-top: 1px solid var(--color-gray-border);
  background: var(--color-gray-bg);
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
}

:deep(.event-card .btn-action) {
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
:deep(.event-card .btn-action:hover) { transform: translateY(-1px); }

:deep(.event-card .btn-action.edit-btn) {
  color: var(--color-primary-light);
}
:deep(.event-card .btn-action.edit-btn:hover) {
  background: var(--color-primary-light);
  color: var(--color-white);
  border-color: var(--color-primary-light);
}

:deep(.event-card .btn-action.delete-btn) {
  color: #ef4444;
}
:deep(.event-card .btn-action.delete-btn:hover) {
  background: #ef4444;
  color: var(--color-white);
  border-color: #ef4444;
}
</style>