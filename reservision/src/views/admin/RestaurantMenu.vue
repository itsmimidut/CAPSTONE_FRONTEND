<template>
  <div class="admin-dashboard">
    <AdminSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <AdminHeader
      title="Restaurant Menu"
      subtitle="Manage menu items and pricing"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <main class="main-content">
      <div class="content-container">

        <!-- ── Stats Cards ── -->
        <div class="stats-grid">

          <div class="stat-card">
            <div class="stat-icon stat-icon--blue">
              <i class="fas fa-utensils"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value stat-value--blue">{{ menu.length }}</div>
              <div class="stat-label">Total Items</div>
            </div>
            <div class="stat-card-bg">
              <i class="fas fa-utensils"></i>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon--green">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value stat-value--green">{{ availableCount }}</div>
              <div class="stat-label">Available</div>
            </div>
            <div class="stat-card-bg">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon--navy">
              <i class="fas fa-tags"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value stat-value--navy">{{ categoryCount }}</div>
              <div class="stat-label">Categories</div>
            </div>
            <div class="stat-card-bg">
              <i class="fas fa-tags"></i>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stat-icon--gold">
              <i class="fas fa-peso-sign"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value stat-value--gold">₱{{ avgPrice }}</div>
              <div class="stat-label">Avg. Price</div>
            </div>
            <div class="stat-card-bg">
              <i class="fas fa-peso-sign"></i>
            </div>
          </div>

        </div>

        <!-- ── Menu Section ── -->
        <MenuSection
          :menu="menu"
          @add-item="addMenuItem"
          @toggle-availability="toggleMenuAvailability"
          @edit-item="editMenuItem"
          @update-item="updateMenuItem"
          @delete-item="deleteMenuItem"
        />

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRestaurantStore } from '../../stores/restaurant.js'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'
import MenuSection from '../../components/Restaurant/MenuSection.vue'

const restaurant      = useRestaurantStore()
const sidebarOpen      = ref(false)
const sidebarCollapsed = ref(false)

const menu = computed(() =>
  restaurant.menuItems.map(m => ({
    menu_id:   m.menu_id,
    id:        m.menu_id,
    name:      m.name,
    price:     m.price,
    category:  m.category,
    available: m.available,
    sizes: Array.isArray(m.sizes) ? m.sizes : [],
    addons: Array.isArray(m.addons) ? m.addons : [],
  }))
)

const availableCount = computed(() =>
  menu.value.filter(item => item.available).length
)

const categoryCount = computed(() => {
  const categories = new Set(menu.value.map(item => item.category))
  return categories.size
})

const avgPrice = computed(() => {
  if (menu.value.length === 0) return '0'
  const total = menu.value.reduce((sum, item) => sum + Number(item.price), 0)
  return Math.round(total / menu.value.length)
})

const addMenuItem = async (item) => {
  try { await restaurant.createMenuItem(item) }
  catch (error) { console.error('Error adding menu item:', error) }
}

const toggleMenuAvailability = async (id, available) => {
  try { await restaurant.toggleMenuItemAvailability(id, available) }
  catch (error) { console.error('Error toggling menu availability:', error) }
}

const editMenuItem = (item) => {}

const updateMenuItem = async (item) => {
  try {
    const itemId = item.menu_id || item.id
    await restaurant.updateMenuItem(itemId, item)
  } catch (error) { console.error('Error updating menu item:', error) }
}

const deleteMenuItem = async (id) => {
  try { await restaurant.deleteMenuItem(id) }
  catch (error) { console.error('Error deleting menu item:', error) }
}

onMounted(() => {
  restaurant.fetchTables()
  restaurant.fetchMenuItems()
  restaurant.fetchInventory()
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
  --color-white-soft:    rgba(255, 255, 255, 0.1);
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
  padding-top: 60px;
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

.stat-card {
  background: var(--color-white);
  border-radius: 16px;
  padding: 1.25rem 1.4rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 10px rgba(3, 105, 161, 0.07);
  position: relative;
  overflow: hidden;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(3, 105, 161, 0.14);
}

/* Watermark background icon */
.stat-card-bg {
  position: absolute;
  right: -10px; bottom: -10px;
  font-size: 4rem;
  opacity: 0.04;
  pointer-events: none;
  transition: opacity 0.22s;
}
.stat-card:hover .stat-card-bg { opacity: 0.07; }

/* Top accent bar */
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 16px 16px 0 0;
}
.stat-card:nth-child(1)::before { background: var(--color-primary-light); }
.stat-card:nth-child(2)::before { background: #16a34a; }
.stat-card:nth-child(3)::before { background: var(--color-navy); }
.stat-card:nth-child(4)::before { background: var(--color-gold); }

/* Stat icons */
.stat-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  transition: transform 0.22s ease;
}
.stat-card:hover .stat-icon { transform: scale(1.1) rotate(-4deg); }

.stat-icon--blue  { background: rgba(31, 141, 191, 0.12); color: var(--color-primary-light); }
.stat-icon--green { background: rgba(22, 163, 74, 0.12);  color: #16a34a; }
.stat-icon--navy  { background: rgba(12, 59, 94, 0.1);    color: var(--color-navy); }
.stat-icon--gold  { background: rgba(244, 196, 0, 0.15);  color: #92700a; }

/* Stat values */
.stat-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-text-dark);
}
.stat-value--blue  { color: var(--color-primary-light); }
.stat-value--green { color: #16a34a; }
.stat-value--navy  { color: var(--color-navy); }
.stat-value--gold  { color: #92700a; }

.stat-label {
  font-size: 0.7rem;
  color: var(--color-text-light);
  margin-top: 0.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .stat-card  { padding: 1rem; }
  .stat-icon  { width: 44px; height: 44px; font-size: 1.1rem; }
  .stat-value { font-size: 1.5rem; }
}
</style>