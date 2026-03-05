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
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">Restaurant Operations</h1>
            <p class="page-subtitle">Comprehensive management for your restaurant</p>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon tables-icon">
              <i class="fas fa-chair"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ tables.length }}</div>
              <div class="stat-label">Active Tables</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon menu-icon">
              <i class="fas fa-utensils"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ menu.length }}</div>
              <div class="stat-label">Menu Items</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon inventory-icon">
              <i class="fas fa-boxes"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ inventory.length }}</div>
              <div class="stat-label">Inventory Items</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orders-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ occupiedTables }}</div>
              <div class="stat-label">Active Orders</div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <div class="tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab"
              @click="activeTab = tab"
              :class="{ active: activeTab === tab }"
            >
              <i :class="getTabIcon(tab)"></i>
              {{ tab }}
            </button>
          </div>
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

const occupiedTables = computed(() => 
  tables.value.filter(t => t.status === 'Occupied').length
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
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%);
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
  border-bottom: 3px solid #F4C400;
  top: 0;
  z-index: 50;
  margin-bottom: 10px;
  margin-left: 260px;
  box-shadow: 0 2px 8px rgba(31, 141, 191, 0.08);
}

/* Page Header */
.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(244, 196, 0, 0.3);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1F8DBF;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #1E88B6;
  opacity: 0.8;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  border-left: 4px solid;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(31, 141, 191, 0.15);
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, transparent 50%, rgba(244, 196, 0, 0.05) 50%);
  border-radius: 0 0 0 60px;
}

.stat-card:nth-child(1) {
  border-left-color: #1F8DBF;
}
.stat-card:nth-child(2) {
  border-left-color: #F4C400;
}
.stat-card:nth-child(3) {
  border-left-color: #1E88B6;
}
.stat-card:nth-child(4) {
  border-left-color: #F2C200;
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.stat-icon.tables-icon {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
}

.stat-icon.menu-icon {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}

.stat-icon.inventory-icon {
  background: rgba(30, 136, 182, 0.1);
  color: #1E88B6;
}

.stat-icon.orders-icon {
  background: rgba(242, 194, 0, 0.1);
  color: #F2C200;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat-card:nth-child(1) .stat-value,
.stat-card:nth-child(3) .stat-value {
  color: #1F8DBF;
}

.stat-card:nth-child(2) .stat-value,
.stat-card:nth-child(4) .stat-value {
  color: #F4C400;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Tabs Container */
.tabs-container {
  background: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 2rem;
  border: 1px solid #f0f0f0;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tabs button i {
  font-size: 1rem;
  color: #1F8DBF;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.tabs button:hover {
  color: #1F8DBF;
  background: rgba(31, 141, 191, 0.05);
}

.tabs button:hover i {
  opacity: 1;
  color: #F4C400;
}

.tabs button.active {
  color: #1F8DBF;
  background: rgba(244, 196, 0, 0.1);
  border-bottom: 2px solid #F4C400;
}

.tabs button.active i {
  opacity: 1;
  color: #F4C400;
}

.tab-content {
  min-height: 400px;
}

/* Section Title (for nested components) */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1F8DBF;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 1.5rem;
  background: linear-gradient(180deg, #1F8DBF, #F4C400);
  border-radius: 2px;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .header-container {
    margin-left: 0;
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1.25rem;
  }
  
  .stat-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .tabs-container {
    padding: 0.5rem;
  }
  
  .tabs button {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .tabs {
    flex-direction: column;
  }
  
  .tabs button {
    width: 100%;
    justify-content: center;
  }
}
</style>