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
  --color-gray-bg:       #f9fafb;
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
  padding-top: 60px;
  transition: margin-left 0.3s ease;
}
@media (min-width: 768px) {
  .main-content { margin-left: 262px; }
}

.content-container {
  padding: 1.25rem 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}
@media (max-width: 768px) {
  .content-container { padding: 0.75rem; }
}
</style>