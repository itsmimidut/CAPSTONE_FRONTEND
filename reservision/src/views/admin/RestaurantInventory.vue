<template>
  <div class="admin-dashboard">
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <!-- Header -->
    <AdminHeader 
      title="Restaurant Inventory"
      subtitle="Manage stock levels and suppliers"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">
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
  try {
    await restaurant.updateInventoryQuantity(id, quantity, operation)
  } catch (error) {
    console.error('Error updating stock:', error)
  }
}

const addInventoryItem = async (item) => {
  try {
    await restaurant.createInventoryItem(item)
  } catch (error) {
    console.error('Error adding inventory item:', error)
  }
}

const editInventoryItem = (item) => {}

const updateInventoryItem = async (item) => {
  try {
    const itemId = item.inventory_id || item.id
    await restaurant.updateInventoryItem(itemId, item)
  } catch (error) {
    console.error('Error updating inventory item:', error)
  }
}

const deleteInventoryItem = async (id) => {
  try {
    await restaurant.deleteInventoryItem(id)
  } catch (error) {
    console.error('Error deleting inventory item:', error)
  }
}

onMounted(() => {
  restaurant.fetchTables()
  restaurant.fetchMenuItems()
  restaurant.fetchInventory()
})
</script>

<style scoped>
/* APPLIED POSTER PALETTE - ONLY THESE 4 COLORS */
:root {
  /* Blues */
  --blue-deep: #1E88B6;     /* Slightly deeper cerulean */
  --blue-bright: #1F8DBF;    /* Brighter cerulean */
  
  /* Yellows */
  --yellow-rich: #F2C200;    /* Rich golden yellow */
  --yellow-bright: #F4C400;   /* Brighter golden yellow */
  
  /* Neutrals (using only the palette colors with opacity) */
  --white: #FFFFFF;
  --bg-light: rgba(30, 136, 182, 0.03);
  --border-light: rgba(30, 136, 182, 0.1);
  --text-dark: #1E1E1E;
  --text-light: #4A4A4A;
}

.admin-dashboard {
  min-height: 100vh;
  background: var(--bg-light);
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
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .content-container {
    padding: 1rem;
  }
}

/* Page Controls Styling */
:deep(.page-controls) {
  background: var(--white);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--border-light);
  box-shadow: 0 2px 8px rgba(30, 136, 182, 0.05);
}

:deep(.search-box),
:deep(.filter-select) {
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 0.625rem 1rem;
  background: var(--white);
  transition: all 0.2s ease;
}

:deep(.search-box:focus),
:deep(.filter-select:focus) {
  outline: none;
  border-color: var(--blue-deep);
  box-shadow: 0 0 0 3px rgba(30, 136, 182, 0.1);
}

:deep(.filter-select) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20' stroke='%231E88B6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  appearance: none;
}

/* Button Styling */
:deep(.btn) {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

:deep(.btn-primary) {
  background: var(--yellow-rich);
  color: var(--text-dark);
  box-shadow: 0 2px 8px rgba(242, 194, 0, 0.2);
}

:deep(.btn-primary:hover) {
  background: var(--yellow-bright);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 194, 0, 0.3);
}

:deep(.btn-secondary) {
  background: transparent;
  border: 1px solid var(--blue-deep);
  color: var(--blue-deep);
}

:deep(.btn-secondary:hover) {
  background: var(--blue-deep);
  color: var(--white);
}

/* Card Styling */
:deep(.inventory-card) {
  background: var(--white);
  border-radius: 12px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

:deep(.inventory-card:hover) {
  border-color: var(--blue-bright);
  box-shadow: 0 4px 12px rgba(30, 136, 182, 0.1);
}

/* Status Badges */
:deep(.status-good) {
  background: rgba(30, 136, 182, 0.1);
  color: var(--blue-deep);
  border: 1px solid rgba(30, 136, 182, 0.2);
}

:deep(.status-low) {
  background: rgba(242, 194, 0, 0.1);
  color: var(--yellow-rich);
  border: 1px solid rgba(242, 194, 0, 0.2);
}

:deep(.status-critical) {
  background: rgba(242, 194, 0, 0.15);
  color: #B45309;
  border: 1px solid var(--yellow-rich);
}

/* Table Styling */
:deep(th) {
  background: rgba(30, 136, 182, 0.03);
  color: var(--blue-deep);
  font-weight: 600;
  border-bottom: 2px solid var(--blue-deep);
}

:deep(tr:hover td) {
  background: rgba(30, 136, 182, 0.02);
}

/* Section Headers */
:deep(.section-header) {
  border-left: 4px solid var(--yellow-rich);
  padding-left: 1rem;
}

:deep(.section-header h2) {
  color: var(--blue-deep);
}

/* Modal Styling */
:deep(.modal-header) {
  background: var(--blue-deep);
  color: var(--white);
}

:deep(.modal-header h3) {
  color: var(--white);
}

:deep(.close-modal) {
  color: var(--white);
}

:deep(.close-modal:hover) {
  background: rgba(255, 255, 255, 0.1);
}

/* Pagination */
:deep(.pagination button) {
  border: 1px solid var(--border-light);
  background: var(--white);
  color: var(--text-light);
}

:deep(.pagination button:hover) {
  border-color: var(--blue-deep);
  color: var(--blue-deep);
}

:deep(.pagination button.active) {
  background: var(--blue-deep);
  color: var(--white);
  border-color: var(--blue-deep);
}

/* Scrollbar */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: var(--bg-light);
}

.main-content::-webkit-scrollbar-thumb {
  background: var(--blue-deep);
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: var(--blue-bright);
}
</style>