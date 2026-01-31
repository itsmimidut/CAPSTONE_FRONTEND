<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <div class="header-container">
      <AdminHeader 
        title="Restaurant Management"
        subtitle="Manage Tables, Orders, Menu & Inventory"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />
    </div>

    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">
        <!-- Tabs -->
        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab"
            @click="activeTab = tab"
            :class="{ active: activeTab === tab }"
          >
            <i :class="getTabIcon(tab)" style="margin-right: 0.5rem;"></i>
            {{ tab }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Tables Tab -->
          <TablesSection 
            v-if="activeTab === 'Tables'"
            :tables="tables"
            @update-table-status="updateTableStatus"
            @add-table="addTable"
            @update-table="updateTable"
            @delete-table="deleteTable"
          />

          <!-- Menu Tab -->
          <MenuSection 
            v-if="activeTab === 'Menu'"
            :menu="menu"
            @add-item="addMenuItem"
            @toggle-availability="toggleMenuAvailability"
            @edit-item="editMenuItem"
            @update-item="updateMenuItem"
            @delete-item="deleteMenuItem"
          />

          <!-- Inventory Tab -->
          <InventorySection 
            v-if="activeTab === 'Inventory'"
            :inventory="inventory"
            @update-stock="updateStock"
            @add-item="addInventoryItem"
            @edit-item="editInventoryItem"
            @update-item="updateInventoryItem"
            @delete-item="deleteInventoryItem"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRestaurantStore } from '../../stores/restaurant.js'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue' 
import TablesSection from '../../components/Restaurant/TableSection.vue'
import MenuSection from '../../components/Restaurant/MenuSection.vue'
import InventorySection from '../../components/Restaurant/InventorySection.vue'

const restaurant = useRestaurantStore()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const activeTab = ref('Tables')
const tabs = ['Tables', 'Menu', 'Inventory']

// Computed properties to get data from store
const tables = computed(() => 
  restaurant.tables.map(t => ({
    id: t.table_id,
    number: t.table_number,
    capacity: t.capacity,
    status: t.status,
    guests: t.guests || 0,
    orderedTime: t.ordered_time || '',
    notes: t.notes || ''
  }))
)

const menu = computed(() =>
  restaurant.menuItems.map(m => ({
    menu_id: m.menu_id,
    id: m.menu_id,
    name: m.name,
    price: m.price,
    category: m.category,
    available: m.available,
    prepTime: m.prep_time || '15min',
    prep_time: m.prep_time,
    image_url: m.image_url || ''
  }))
)

const inventory = computed(() =>
  restaurant.inventory.map(i => ({
    id: i.inventory_id,
    item: i.item_name,
    quantity: i.quantity,
    unit: i.unit,
    threshold: i.threshold,
    status: i.status
  }))
)

// Load data on mount
onMounted(async () => {
  try {
    await restaurant.initializeRestaurantData()
  } catch (error) {
    console.error('Failed to load restaurant data:', error)
    alert('Error loading restaurant data. Please refresh the page.')
  }
})

// Tab helper function
const getTabIcon = (tab) => {
  const icons = {
    'Tables': 'fas fa-chair',
    'Orders': 'fas fa-clipboard-list',
    'Menu': 'fas fa-utensils',
    'Inventory': 'fas fa-boxes',
  }
  return icons[tab] || 'fas fa-info-circle'
}

// Table actions
const updateTableStatus = async (id, newStatus) => {
  try {
    await restaurant.updateTableStatus(id, newStatus)
  } catch (error) {
    console.error('Failed to update table status:', error)
    alert('Error updating table status')
  }
}

const addTable = async (newTableData) => {
  try {
    await restaurant.createTable(newTableData)
  } catch (error) {
    console.error('Failed to add table:', error)
    alert('Error adding table')
  }
}

const updateTable = async (updatedTable) => {
  try {
    const tableId = updatedTable.table_id || updatedTable.id
    await restaurant.updateTable(tableId, updatedTable)
  } catch (error) {
    console.error('Failed to update table:', error)
    alert('Error updating table')
  }
}

const deleteTable = async (id) => {
  if(confirm('Delete this table?')) {
    try {
      await restaurant.deleteTable(id)
    } catch (error) {
      console.error('Failed to delete table:', error)
      alert('Error deleting table')
    }
  }
}

// Menu actions
const toggleMenuAvailability = async (id) => {
  try {
    const item = restaurant.menuItems.find(m => m.menu_id === id)
    if(item) {
      await restaurant.toggleMenuItemAvailability(id, !item.available)
    }
  } catch (error) {
    console.error('Failed to toggle menu item availability:', error)
    alert('Error updating menu item')
  }
}

const addMenuItem = async (newMenuData) => {
  try {
    await restaurant.createMenuItem(newMenuData)
  } catch (error) {
    console.error('Failed to add menu item:', error)
    alert('Error adding menu item')
  }
}

const editMenuItem = (id) => {
  alert(`Edit menu item ${id}`)
}

const updateMenuItem = async (updatedItem) => {
  try {
    const menuId = updatedItem.menu_id || updatedItem.id
    await restaurant.updateMenuItem(menuId, updatedItem)
  } catch (error) {
    console.error('Failed to update menu item:', error)
    alert('Error updating menu item')
  }
}

const deleteMenuItem = async (id) => {
  if(confirm('Delete this item?')) {
    try {
      await restaurant.deleteMenuItem(id)
    } catch (error) {
      console.error('Failed to delete menu item:', error)
      alert('Error deleting menu item')
    }
  }
}

// Inventory actions
const updateStock = async (id, quantity) => {
  try {
    await restaurant.updateInventoryQuantity(id, quantity, 'set')
  } catch (error) {
    console.error('Failed to update stock:', error)
    alert('Error updating stock')
  }
}

const addInventoryItem = async (newItemData) => {
  try {
    await restaurant.createInventoryItem(newItemData)
  } catch (error) {
    console.error('Failed to add inventory item:', error)
    alert('Error adding inventory item')
  }
}

const editInventoryItem = (id) => {
  alert(`Edit inventory item ${id}`)
}

const updateInventoryItem = async (updatedItem) => {
  try {
    await restaurant.updateInventoryItem(updatedItem.id, updatedItem)
  } catch (error) {
    console.error('Failed to update inventory item:', error)
    alert('Error updating inventory item')
  }
}

const deleteInventoryItem = async (id) => {
  try {
    await restaurant.deleteInventoryItem(id)
  } catch (error) {
    console.error('Failed to delete inventory item:', error)
    alert('Error deleting inventory item')
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc, #f0f4f8);
  display: flex;
  flex-direction: column;
  position: relative;
}

.admin-dashboard > :first-child {
  position: sticky;
  top: 0;
  z-index: 40;
}

.main-content {
  margin-left: 0;
  padding: 2rem 1rem;
  transition: margin-left 0.3s ease;
  flex: 1;
  z-index: 1;
}

@media (min-width: 768px) {
  .main-content {
    margin-left: 260px;
    padding: 2rem;
  }
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

.header-container {
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  top: 0;
  z-index: 50;
  margin-bottom: 10px;
  margin-left: 260px;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tabs button {
  padding: 0.75rem 1.25rem;
  border-radius: 8px 8px 0 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: #718096;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  border-bottom: 3px solid transparent;
}

.tabs button:hover {
  color: #2B6CB0;
  background: #f7fafc;
}

.tabs button.active {
  color: #2B6CB0;
  border-bottom-color: #2B6CB0;
  background: #f0f4f8;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #2D3748;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 1.5rem;
  background: linear-gradient(180deg, #2B6CB0, #63B3ED);
  border-radius: 2px;
}

@media (max-width: 640px) {
  .main-content {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .tabs {
    gap: 0.25rem;
  }

  .tabs button {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style>