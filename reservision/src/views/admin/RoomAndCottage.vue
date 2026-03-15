<template>
  <div class="admin-layout">
    <AdminSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      current-path="/admin/rooms"
      @close="sidebarOpen = false"
    />

    <main class="main-content" :class="{ shifted: sidebarCollapsed }">

      <AdminHeader
        title="Room & Cottage Management"
        subtitle="Manage your resort rooms and cottages"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />

      <div class="content-container">

        <!-- ── Stats ── -->
        <div class="stats-grid">
          <StatCard icon="fa-bed"          color="blue"   :value="stats.total"       label="Total Rooms" />
          <StatCard icon="fa-check-circle" color="green"  :value="stats.available"   label="Available" />
          <StatCard icon="fa-user-friends" color="orange" :value="stats.occupied"    label="Occupied" />
          <StatCard icon="fa-tools"        color="yellow" :value="stats.maintenance" label="Under Maintenance" />
        </div>

        <!-- ── Rooms Section ── -->
        <div class="section-card">

          <!-- Section header -->
          <div class="section-header">
            <div class="section-header-left">
              <h2 class="section-title">Rooms & Cottages</h2>
              <p class="section-subtitle">Browse and manage all room listings</p>
            </div>
            <button class="btn-primary" @click="openRoomModal()">
              <i class="fas fa-plus"></i>
              <span>Add New Room</span>
            </button>
          </div>

          <!-- Controls bar -->
          <div class="controls-bar">
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="searchQuery"
                class="search-input"
                placeholder="Search rooms…"
              />
              <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>
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
          </div>

          <!-- Summary pill -->
          <div class="rooms-summary">
            <i class="fas fa-bed summary-icon"></i>
            Showing <strong>{{ filteredRooms.length }}</strong> room(s)
          </div>

          <!-- Rooms grid -->
          <div class="room-grid">
            <RoomCard
              v-for="room in filteredRooms"
              :key="room.item_id"
              :room="room"
              @edit="openRoomModal(room)"
              @delete="deleteRoom(room.item_id)"
            />
            <div v-if="filteredRooms.length === 0" class="empty-state">
              <div class="empty-icon-wrap">
                <i class="fas fa-bed"></i>
              </div>
              <p class="empty-title">No rooms found</p>
              <p class="empty-sub">Try adjusting your filters or add a new room.</p>
              <button class="btn-primary" @click="openRoomModal()">
                <i class="fas fa-plus"></i> Add Your First Room
              </button>
            </div>
          </div>

        </div>

        <!-- ── Promo Section ── -->
        <div class="section-card">

          <div class="section-header">
            <div class="section-header-left">
              <h2 class="section-title">Promo & Pricing</h2>
              <p class="section-subtitle">Create and manage promotional offers</p>
            </div>
            <button class="btn-primary" @click="openPromoModal()">
              <i class="fas fa-plus"></i>
              <span>New Promo</span>
            </button>
          </div>

          <div class="controls-bar controls-bar--slim">
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="promoSearch"
                class="search-input"
                placeholder="Search promos…"
              />
              <button v-if="promoSearch" class="search-clear" @click="promoSearch = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div class="promo-list">
            <PromoCard
              v-for="promo in filteredPromos"
              :key="promo.promo_id"
              :promo="promo"
              @edit="openPromoModal(promo)"
              @delete="deletePromo(promo.promo_id)"
            />
            <div v-if="filteredPromos.length === 0" class="empty-state">
              <div class="empty-icon-wrap">
                <i class="fas fa-gift"></i>
              </div>
              <p class="empty-title">No promos yet</p>
              <p class="empty-sub">Create a promo to start offering deals to guests.</p>
              <button class="btn-primary" @click="openPromoModal()">
                <i class="fas fa-plus"></i> Create First Promo
              </button>
            </div>
          </div>

        </div>

        <!-- ── Seasonal Pricing Section ── -->
        <div class="section-card section-card--seasonal">

          <div class="section-header">
            <div class="section-header-left">
              <h2 class="section-title">Seasonal Pricing</h2>
              <p class="section-subtitle">Manage seasonal rates for rooms</p>
            </div>
            <button class="btn-outline" @click="seasonalModalOpen = true">
              <i class="fas fa-calendar-day"></i>
              <span>Configure Pricing</span>
            </button>
          </div>

          <div class="seasonal-info-row">
            <div class="seasonal-info-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="seasonal-info-body">
              <p class="seasonal-info-title">Dynamic Pricing Strategy</p>
              <p class="seasonal-info-text">
                Set different pricing rates for peak, off-peak, and holiday seasons
                to optimize revenue based on demand and occupancy trends.
              </p>
            </div>
            <button class="btn-outline seasonal-cta" @click="seasonalModalOpen = true">
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>

        </div>

      </div>
    </main>

    <!-- ── Modals ── -->
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

import AdminSidebar        from '../../components/admin/AdminSidebar.vue'
import AdminHeader         from '../../components/admin/AdminHeader.vue'
import StatCard            from '../../components/RCE/StatCard.vue'
import RoomCard            from '../../components/RCE/RoomCard.vue'
import PromoCard           from '../../components/RCE/PromoCard.vue'
import RoomFormModal       from '../../components/RCE/Modals/RoomModal.vue'
import PromoFormModal      from '../../components/RCE/Modals/PromoModal.vue'
import SeasonalPricingModal from '../../components/RCE/Modals/SeasonalModal.vue'

const sidebarOpen      = ref(false)
const sidebarCollapsed = ref(false)
const roomsStore       = useRoomsStore()

const searchQuery      = ref('')
const typeFilter       = ref('all')
const statusFilter     = ref('all')
const promoSearch      = ref('')

const roomModal         = ref({ show: false, data: null })
const promoModal        = ref({ show: false, data: null })
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
  if (typeFilter.value   !== 'all') list = list.filter(r => r.category === typeFilter.value)
  if (statusFilter.value !== 'all') list = list.filter(r => r.status   === statusFilter.value)
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
  total:       roomsStore.rooms.length || 0,
  available:   roomsStore.rooms.filter(r => r.status === 'Available').length,
  occupied:    roomsStore.rooms.filter(r => r.status === 'Occupied').length,
  maintenance: roomsStore.rooms.filter(r => r.status === 'Under Maintenance').length
}))

const openRoomModal  = (room = null)  => { roomModal.value  = { show: true, data: room  ? { ...room  } : null } }
const openPromoModal = (promo = null) => { promoModal.value = { show: true, data: promo ? { ...promo } : null } }

const saveRoom = async (roomData) => {
  try {
    await roomsStore.saveRoom(roomData)
    roomModal.value = { show: false, data: null }
  } catch (error) {
    console.error('Error saving room:', error)
    alert('Error saving room: ' + (error.response?.data?.message || error.message))
  }
}

const deleteRoom = async (id) => {
  if (!confirm('Delete room?')) return
  try { await roomsStore.deleteRoom(id) }
  catch (error) { console.error('Error deleting room:', error) }
}

const savePromo = async (promoData) => {
  try {
    await roomsStore.savePromo(promoData)
    promoModal.value = { show: false, data: null }
  } catch (error) { console.error('Error saving promo:', error) }
}

const deletePromo = async (id) => {
  if (!confirm('Delete promo?')) return
  try { await roomsStore.deletePromo(id) }
  catch (error) { console.error('Error deleting promo:', error) }
}

const saveSeasonal = async (season) => {
  try {
    await roomsStore.saveSeason(season)
    seasonalModalOpen.value = false
  } catch (error) { console.error('Error saving season:', error) }
}
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.admin-layout {
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
.admin-layout {
  min-height: 100vh;
  background: var(--color-gray-bg);
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.main-content {
  margin-left: 0;
  padding-top: 64px;
  transition: margin-left 0.3s ease;
}
.main-content.shifted { margin-left: 72px; }

@media (min-width: 768px) {
  .main-content { margin-left: 262px; }
}

.content-container {
  padding: 1.5rem 1.75rem;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
@media (max-width: 768px) {
  .content-container { padding: 0.85rem; gap: 1rem; }
}

/* ── Stats Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .stats-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; } }

/* ── Section Card ── */
.section-card {
  background: var(--color-white);
  border-radius: 20px;
  padding: 1.5rem 1.75rem;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 16px rgba(3, 105, 161, 0.07);
}
@media (max-width: 768px) {
  .section-card { padding: 1rem; border-radius: 14px; }
}

/* Seasonal section gets a subtle gold tint */
.section-card--seasonal {
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(244,196,0,0.03) 100%);
  border-color: rgba(244, 196, 0, 0.25);
}

/* ── Section Header ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid rgba(244, 196, 0, 0.3);
}
.section-header-left { flex: 1; min-width: 0; }

.section-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0 0 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 1.1em;
  background: var(--color-gold);
  border-radius: 3px;
  flex-shrink: 0;
}
.section-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-light);
  margin: 0;
  padding-left: 0.75rem;
}

/* ── Buttons ── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1.2rem;
  height: 38px;
  background: var(--color-navy);
  color: var(--color-white);
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(12, 59, 94, 0.22);
  transition: all 0.18s ease;
}
.btn-primary:hover {
  background: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(3, 105, 161, 0.28);
}
.btn-primary i { color: var(--color-gold); font-size: 0.8rem; transition: transform 0.2s; }
.btn-primary:hover i { transform: rotate(90deg); }

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1.2rem;
  height: 38px;
  background: var(--color-white);
  color: var(--color-primary);
  border: 1.5px solid rgba(3, 105, 161, 0.3);
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.18s ease;
}
.btn-outline:hover {
  background: var(--color-gray-bg);
  border-color: var(--color-gold);
  color: var(--color-navy);
  transform: translateY(-1px);
}
.btn-outline i { font-size: 0.85rem; }

/* ── Controls Bar ── */
.controls-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  padding: 0.85rem 1rem;
  background: var(--color-gray-bg);
  border-radius: 14px;
  border: 0.5px solid var(--color-gray-border);
  margin-bottom: 1rem;
}
.controls-bar--slim { margin-bottom: 1rem; }

.search-wrapper {
  position: relative;
  flex: 2;
  min-width: 200px;
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
  min-width: 148px;
  transition: border-color 0.15s;
}
.filter-select:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(31, 141, 191, 0.08);
}

/* ── Summary Pill ── */
.rooms-summary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.45rem 1.1rem;
  background: var(--color-gray-bg);
  border-radius: 30px;
  border: 0.5px solid var(--color-gray-border);
  color: var(--color-text-dark);
  font-size: 0.875rem;
  font-weight: 500;
}
.summary-icon { color: var(--color-gold); font-size: 0.9rem; }
.rooms-summary strong { color: var(--color-primary-light); font-weight: 700; }

/* ── Room Grid ── */
.room-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
@media (min-width: 640px)  { .room-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .room-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .room-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); } }

/* ── Promo List ── */
.promo-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

/* ── Empty State ── */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3.5rem 2rem;
  text-align: center;
  border: 2px dashed rgba(244, 196, 0, 0.4);
  border-radius: 16px;
  background: rgba(244, 196, 0, 0.02);
}
.empty-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: rgba(3, 105, 161, 0.08);
  color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}
.empty-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0;
}
.empty-sub {
  font-size: 0.8rem;
  color: var(--color-text-light);
  margin: 0;
}

/* ── Seasonal Info Row ── */
.seasonal-info-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--color-gray-bg);
  border-radius: 14px;
  border: 0.5px solid rgba(244, 196, 0, 0.25);
}
.seasonal-info-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(244, 196, 0, 0.12);
  color: #92700a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.seasonal-info-body { flex: 1; min-width: 0; }
.seasonal-info-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 0.2rem;
}
.seasonal-info-text {
  font-size: 0.8rem;
  color: var(--color-text-light);
  line-height: 1.55;
  margin: 0;
}
.seasonal-cta {
  height: 36px;
  width: 36px;
  padding: 0;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
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
:deep(.room-card .room-title)  { color: var(--color-white); font-weight: 700; font-size: 0.95rem; }
:deep(.room-card .room-price)  { color: var(--color-gold); font-weight: 700; font-size: 0.9rem; }
:deep(.room-card .room-status) {
  display: inline-flex; align-items: center; padding: 3px 10px;
  border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
}
:deep(.room-card .room-status.Available)         { background: rgba(22,163,74,.1);   color: #15803d;  border: 1px solid rgba(22,163,74,.25); }
:deep(.room-card .room-status.Occupied)          { background: rgba(31,141,191,.1);  color: var(--color-primary-light); border: 1px solid rgba(31,141,191,.25); }
:deep(.room-card .room-status.Under\ Maintenance){ background: rgba(239,68,68,.1);   color: #dc2626;  border: 1px solid rgba(239,68,68,.22); }
:deep(.room-card .room-body)       { padding: 1rem; }
:deep(.room-card .room-type)       { color: var(--color-text-light); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
:deep(.room-card .room-description){ color: var(--color-text-dark); font-size: 0.875rem; line-height: 1.55; margin-top: 0.35rem; }
:deep(.room-card .room-footer)     { border-top: 1px solid var(--color-gray-border); background: var(--color-gray-bg); padding: 0.65rem 1rem; display: flex; align-items: center; justify-content: flex-end; gap: 0.4rem; }
:deep(.room-card .btn-action)      { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--color-gray-border); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 0.78rem; transition: all 0.15s ease; background: var(--color-white); }
:deep(.room-card .btn-action:hover){ transform: translateY(-1px); }
:deep(.room-card .btn-action.edit-btn)          { color: var(--color-primary-light); }
:deep(.room-card .btn-action.edit-btn:hover)    { background: var(--color-primary-light); color: var(--color-white); border-color: var(--color-primary-light); }
:deep(.room-card .btn-action.delete-btn)        { color: #ef4444; }
:deep(.room-card .btn-action.delete-btn:hover)  { background: #ef4444; color: var(--color-white); border-color: #ef4444; }

/* ── PromoCard deep overrides ── */
:deep(.promo-card) {
  background: var(--color-white);
  border-radius: 14px;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 8px rgba(3, 105, 161, 0.06);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
:deep(.promo-card:hover) {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(3, 105, 161, 0.12);
  border-color: rgba(244, 196, 0, 0.35);
}
:deep(.promo-card .promo-header)  { background: var(--color-navy); border-bottom: 3px solid var(--color-gold); padding: 0.8rem 1rem; }
:deep(.promo-card .promo-code)    { color: var(--color-gold); font-size: 1rem; font-weight: 800; letter-spacing: 1px; }
:deep(.promo-card .promo-discount){ color: var(--color-white); font-size: 0.8rem; }
:deep(.promo-card .promo-body)    { padding: 0.85rem 1rem; }
:deep(.promo-card .promo-desc)    { font-size: 0.875rem; color: var(--color-text-dark); line-height: 1.5; }
:deep(.promo-card .promo-footer)  { border-top: 1px solid var(--color-gray-border); background: var(--color-gray-bg); padding: 0.6rem 1rem; display: flex; justify-content: flex-end; gap: 0.4rem; }
</style>