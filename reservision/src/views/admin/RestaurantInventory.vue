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
// RestaurantInventory.vue - Main container component for restaurant inventory management
// Purpose: Acts as a page-level component that manages the inventory view layout with sidebar and header
// Functionality: Fetches inventory data from store, transforms it into displayable format, and emits CRUD operations

import { ref, onMounted, computed } from 'vue'
import { useRestaurantStore } from '../../stores/restaurant.js'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue' 
import InventorySection from '../../components/Restaurant/InventorySection.vue'

// Initialize the Pinia store for restaurant data management
const restaurant = useRestaurantStore()

// Sidebar state management
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

/**
 * Computed property that transforms raw inventory data from the store
 * Maps backend field names to frontend-friendly field names
 * 
 * Fields:
 * - id: Unique inventory item identifier (from inventory_id)
 * - item: Display name of the inventory item
 * - category: Product category for organization (optional, defaults to '')
 * - quantity: Current stock quantity
 * - unit: Unit of measurement (kg, L, pcs, etc)
 * - threshold: Reorder level alert threshold (uses backend threshold field)
 * - status: Backend-calculated status (good/low/critical based on threshold logic)
 * - supplier: Supplier information for the item (optional, defaults to '')
 * - last_updated: Timestamp of last inventory update
 * - image_url: Optional product image URL
 */
const inventory = computed(() =>
  restaurant.inventory.map(i => ({
    id: i.inventory_id,
    item: i.item_name,
    category: i.category || '',
    quantity: i.quantity,
    unit: i.unit,
    threshold: i.threshold,
    status: i.status, // Use backend-calculated status (good/low/critical)
    supplier: i.supplier || '',
    last_updated: i.last_updated,
    image_url: i.image_url || ''
  }))
)

const updateStock = async (id, quantity, operation = 'set') => {
  // Updates the quantity of an inventory item
  // operation: 'set' (replace), 'add' (increase), 'subtract' (decrease)
  try {
    await restaurant.updateInventoryQuantity(id, quantity, operation)
  } catch (error) {
    console.error('Error updating stock:', error)
  }
}

const addInventoryItem = async (item) => {
  // Adds a new inventory item to the restaurant inventory
  // Called from InventorySection when user submits add item form
  try {
    await restaurant.createInventoryItem(item)
  } catch (error) {
    console.error('Error adding inventory item:', error)
  }
}

const editInventoryItem = (item) => {
  // Handler for edit action - currently handled in the InventorySection component
}

const updateInventoryItem = async (item) => {
  // Updates an existing inventory item with new data
  // Supports field updates: item_name, quantity, unit, threshold
  try {
    const itemId = item.inventory_id || item.id
    await restaurant.updateInventoryItem(itemId, item)
  } catch (error) {
    console.error('Error updating inventory item:', error)
  }
}

const deleteInventoryItem = async (id) => {
  // Removes an inventory item from the database
  // Called after user confirmation in the InventorySection component
  try {
    await restaurant.deleteInventoryItem(id)
  } catch (error) {
    console.error('Error deleting inventory item:', error)
  }
}

// Lifecycle hook: Executes when component mounts
// Fetches initial data from the backend for tables, menu items, and inventory
onMounted(() => {
  restaurant.fetchTables()
  restaurant.fetchMenuItems()
  restaurant.fetchInventory()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #F3F4F6;
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
</style>
