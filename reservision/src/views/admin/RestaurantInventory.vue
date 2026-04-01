<template>
  <div class="admin-dashboard">
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <AdminHeader 
      title="Restaurant Inventory"
      subtitle="Manage stock levels and suppliers"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <main class="main-content">
      <div class="content-container">

    <!-- ── Stats Cards ── -->
    <div class="stats-row">
      <div class="stat-card stat-card--blue" style="--index: 0">
        <div class="stat-icon-wrap stat-icon--blue">
          <i class="fas fa-boxes"></i>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ inventory.length }}</div>
          <div class="stat-label">Total Items</div>
        </div>
        <div class="stat-watermark">
          <i class="fas fa-boxes"></i>
        </div>
      </div>

      <div class="stat-card stat-card--green" style="--index: 1">
        <div class="stat-icon-wrap stat-icon--green">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ inventory.filter(i => i.status === 'good').length }}</div>
          <div class="stat-label">Well Stocked</div>
        </div>
        <div class="stat-watermark">
          <i class="fas fa-check-circle"></i>
        </div>
      </div>

      <div class="stat-card stat-card--orange" style="--index: 2">
        <div class="stat-icon-wrap stat-icon--orange">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ inventory.filter(i => i.status === 'low').length }}</div>
          <div class="stat-label">Low Stock</div>
        </div>
        <div class="stat-watermark">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
      </div>

      <div class="stat-card stat-card--red" style="--index: 3">
        <div class="stat-icon-wrap stat-icon--red">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ inventory.filter(i => i.status === 'critical').length }}</div>
          <div class="stat-label">Critical</div>
        </div>
        <div class="stat-watermark">
          <i class="fas fa-times-circle"></i>
        </div>
      </div>
    </div>

        <InventorySection 
          :inventory="inventory"
          @update-stock="updateStock"
          @add-item="addInventoryItem"
          @edit-item="editInventoryItem"
          @update-item="updateInventoryItem"
          @delete-item="deleteInventoryItem"
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
import InventorySection from '../../components/Restaurant/InventorySection.vue'

const restaurant = useRestaurantStore()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const inventory = computed(() =>
  restaurant.inventory.map(i => ({
    id: i.inventory_id,
    item: i.item_name,
    category: i.category || '',
    quantity: i.quantity,
    unit: i.unit,
    threshold: i.threshold,
    status: i.status,
    supplier: i.supplier || '',
    last_updated: i.last_updated,
    image_url: i.image_url || ''
  }))
)

const updateStock = async (id, quantity, operation = 'set') => {
  try { await restaurant.updateInventoryQuantity(id, quantity, operation) }
  catch (error) { console.error('Error updating stock:', error) }
}

const addInventoryItem = async (item) => {
  try { await restaurant.createInventoryItem(item) }
  catch (error) { console.error('Error adding inventory item:', error) }
}

const editInventoryItem = (item) => {}

const updateInventoryItem = async (item) => {
  try {
    const itemId = item.inventory_id || item.id
    await restaurant.updateInventoryItem(itemId, item)
  } catch (error) { console.error('Error updating inventory item:', error) }
}

const deleteInventoryItem = async (id) => {
  try { await restaurant.deleteInventoryItem(id) }
  catch (error) { console.error('Error deleting inventory item:', error) }
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
  --color-white-soft:    rgba(255,255,255,0.1);
  --color-gray-bg:       #EEF5FB;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

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

/* ───────────────── Stats Row ───────────────── */
.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

@media (min-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(4, 1fr);
  }
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.35rem;
  background: var(--color-white);
  border-radius: 16px;
  border: 1px solid var(--color-gray-border);
  box-shadow: 0 2px 10px rgba(3, 105, 161, 0.07);
  overflow: hidden;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  animation: cardIn 0.4s ease both;
  animation-delay: calc(var(--index) * 70ms);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(3, 105, 161, 0.14);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 16px 16px 0 0;
}

.stat-card--blue::before   { background: var(--color-primary-light); }
.stat-card--green::before  { background: #16a34a; }
.stat-card--orange::before { background: #ea580c; }
.stat-card--red::before    { background: #dc2626; }

/* Icon */
.stat-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  transition: transform 0.22s ease;
}

.stat-card:hover .stat-icon-wrap {
  transform: scale(1.1) rotate(-4deg);
}

.stat-icon--blue {
  background: rgba(31, 141, 191, 0.12);
  color: var(--color-primary-light);
}

.stat-icon--green {
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
}

.stat-icon--orange {
  background: rgba(234, 88, 12, 0.1);
  color: #ea580c;
}

.stat-icon--red {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

/* Body */
.stat-body {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.85rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-text-dark);
}

.stat-card--blue .stat-value   { color: var(--color-primary-light); }
.stat-card--green .stat-value  { color: #16a34a; }
.stat-card--orange .stat-value { color: #ea580c; }
.stat-card--red .stat-value    { color: #dc2626; }

.stat-label {
  font-size: 0.72rem;
  color: var(--color-text-light);
  margin-top: 0.35rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* Watermark */
.stat-watermark {
  position: absolute;
  right: -10px;
  bottom: -10px;
  font-size: 4rem;
  opacity: 0.04;
  pointer-events: none;
  transition: opacity 0.22s ease;
}

.stat-card:hover .stat-watermark {
  opacity: 0.08;
}

/* Mobile */
@media (max-width: 480px) {
  .stat-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .stat-icon-wrap {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
  }

  .stat-value {
    font-size: 1.45rem;
  }
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


</style>