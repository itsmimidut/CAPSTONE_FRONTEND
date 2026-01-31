<template>
  <div class="admin-layout">
    <AdminSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      current-path="/admin/rooms"
      @close="sidebarOpen = false"
    />

    <main class="main-content" :class="{ shifted: sidebarCollapsed }">
      <div class="header-container">
        <AdminHeader
          title="Room & Cottage Management"
          subtitle="Manage your resort rooms and cottages"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

      <div class="p-4 md:p-6">
        <!-- Stats -->
        <div class="stats-section grid gap-4 mb-6 md:grid-cols-4 grid-cols-2">
          <StatCard icon="fa-bed" color="blue" :value="stats.total" label="Total Rooms" />
          <StatCard icon="fa-check-circle" color="green" :value="stats.available" label="Available" />
          <StatCard icon="fa-user-friends" color="orange" :value="stats.occupied" label="Occupied" />
          <StatCard icon="fa-tools" color="yellow" :value="stats.maintenance" label="Under Maintenance" />
        </div>

        <!-- Controls - Rooms Filter & Add -->
        <div class="page-controls mb-6">
          <div class="search-filter flex flex-wrap gap-3 items-center">
            <input v-model="searchQuery" class="search-box" placeholder="Search rooms..." />
            <select v-model="typeFilter" class="filter-select">
              <option value="all">All Types</option>
              <option value="Standard Room">Standard Room</option>
              <option value="Deluxe Room">Deluxe Room</option>
              <option value="Cottage">Cottage</option>
              <option value="Suite">Suite</option>
            </select>
            <select v-model="statusFilter" class="filter-select">
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
            <button class="btn btn-primary" @click="openRoomModal()">
              <i class="fas fa-plus"></i> Add New Room
            </button>
          </div>
        </div>

        <!-- Rooms -->
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

        <!-- Promo Section -->
        <div class="promo-section mt-10">
          <div class="promo-header">
            <div>
              <h3 class="promo-title">Promo & Pricing Management</h3>
              <p class="promo-subtitle">Create and manage promotional offers</p>
            </div>
            <button class="btn btn-secondary" @click="openPromoModal()">
              <i class="fas fa-plus"></i> New Promo
            </button>
          </div>
          <input v-model="promoSearch" class="search-box mb-4" placeholder="Search promos..." />
          <div class="promo-list">
            <PromoCard
              v-for="promo in filteredPromos"
              :key="promo.promo_id"
              :promo="promo"
              @edit="openPromoModal(promo)"
              @delete="deletePromo(promo.promo_id)"
            />
            <div v-if="filteredPromos.length === 0" class="promo-empty">
              <i class="fas fa-gift"></i>
              <p>No promos yet. Create one to get started!</p>
            </div>
          </div>
        </div>

        <!-- Seasonal Pricing Section -->
        <div class="seasonal-section mt-10">
          <div class="seasonal-header">
            <div>
              <h3 class="seasonal-title">Seasonal Pricing</h3>
              <p class="seasonal-subtitle">Manage seasonal rates for rooms</p>
            </div>
            <button class="btn btn-outline" @click="seasonalModalOpen = true">
              <i class="fas fa-calendar-day"></i> Configure Pricing
            </button>
          </div>
          <div class="seasonal-info">
            <p>Set different pricing rates for different seasons to optimize revenue based on demand.</p>
          </div>
        </div>

      </div>
    </main>

    <!-- Modals -->
    <RoomFormModal
      v-model:show="roomModal.show"
      :initial-room="roomModal.data"
      @save="saveRoom"
    />
    <PromoFormModal
      v-model:show="promoModal.show"
      :initial-promo="promoModal.data"
      @save="savePromo"
    />
    <SeasonalPricingModal
      v-model:show="seasonalModalOpen"
      @save="saveSeasonal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoomsStore } from '../../stores/rooms'

import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import StatCard from '../../components/RCE/StatCard.vue'
import RoomCard from '../../components/RCE/RoomCard.vue'
import PromoCard from '../../components/RCE/PromoCard.vue'
import RoomFormModal from '../../components/RCE/Modals/RoomModal.vue'
import PromoFormModal from '../../components/RCE/Modals/PromoModal.vue'
import SeasonalPricingModal from '../../components/RCE/Modals/SeasonalModal.vue'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const roomsStore = useRoomsStore()

const searchQuery = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')
const promoSearch = ref('')

const roomModal = ref({ show: false, data: null })
const promoModal = ref({ show: false, data: null })
const seasonalModalOpen = ref(false)

onMounted(async () => {
  try {
    await roomsStore.fetchRooms()
    await roomsStore.fetchPromos()
    await roomsStore.fetchSeasons()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

const filteredRooms = computed(() => {
  // Ensure unique items by id to avoid duplicates from backend/local merges
  const uniqueMap = new Map()
  ;(roomsStore.rooms || []).forEach(r => {
    const key = r.item_id || r.id || r.room_number || r.name
    if (!uniqueMap.has(key)) uniqueMap.set(key, r)
  })
  let list = Array.from(uniqueMap.values())
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      String(r.room_number || '').includes(q)
    )
  }
  if (typeFilter.value !== 'all') list = list.filter(r => r.category === typeFilter.value)
  if (statusFilter.value !== 'all') list = list.filter(r => r.status === statusFilter.value)
  return list
})

const filteredPromos = computed(() => {
  if (!promoSearch.value) return roomsStore.promos || []
  const q = promoSearch.value.toLowerCase()
  return roomsStore.promos.filter(p =>
    p.code.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  )
})

const stats = computed(() => ({
  total: roomsStore.rooms.length || 0,
  available: roomsStore.rooms.filter(r => r.status === 'Available').length,
  occupied: roomsStore.rooms.filter(r => r.status === 'Occupied').length,
  maintenance: roomsStore.rooms.filter(r => r.status === 'Under Maintenance').length
}))

const openRoomModal = (room = null) => {
  console.log('openRoomModal called with room:', room) // Debug log
  roomModal.value = { show: true, data: room ? { ...room } : null }
  console.log('roomModal.value after update:', roomModal.value) // Debug log
}

const openPromoModal = (promo = null) => {
  promoModal.value = { show: true, data: promo ? { ...promo } : null }
}

const saveRoom = async (roomData) => {
  try {
    console.log('saveRoom in RoomAndCottage called with:', roomData)
    await roomsStore.saveRoom(roomData)
    console.log('Room saved successfully!')
    roomModal.value = { show: false, data: null }
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

const savePromo = async (promoData) => {
  try {
    await roomsStore.savePromo(promoData)
    promoModal.value = { show: false, data: null }
  } catch (error) {
    console.error('Error saving promo:', error)
  }
}

const deletePromo = async (id) => {
  if (!confirm('Delete promo?')) return
  try {
    await roomsStore.deletePromo(id)
  } catch (error) {
    console.error('Error deleting promo:', error)
  }
}

const saveSeasonal = async (season) => {
  try {
    await roomsStore.saveSeason(season)
    seasonalModalOpen.value = false
  } catch (error) {
    console.error('Error saving season:', error)
  }
}

// Removed mock data code - use real data from backend instead
// onMounted(() => {
//   if (roomsStore.rooms.length === 0) {
//     const mockRooms = [...]
//     mockRooms.forEach(room => roomsStore.saveRoom(room))
//   }
// })
</script>

<style src="../../assets/room.css"></style>
