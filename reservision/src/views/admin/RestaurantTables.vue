<template>
  <div class="admin-dashboard">
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <!-- Header -->
    <AdminHeader 
      title="Restaurant Tables"
      subtitle="Manage table reservations and availability"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">Restaurant Tables</h1>
            <p class="page-subtitle">Manage your table layout, reservations, and availability</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" @click="openAddTableModal">
              <i class="fas fa-plus"></i> Add New Table
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card total-card">
            <div class="stat-icon">
              <i class="fas fa-utensils"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ tables.length }}</div>
              <div class="stat-label">Total Tables</div>
            </div>
          </div>
          <div class="stat-card available-card">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ availableCount }}</div>
              <div class="stat-label">Available</div>
            </div>
          </div>
          <div class="stat-card occupied-card">
            <div class="stat-icon">
              <i class="fas fa-user-friends"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ occupiedCount }}</div>
              <div class="stat-label">Occupied</div>
            </div>
          </div>
          <div class="stat-card reserved-card">
            <div class="stat-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ reservedCount }}</div>
              <div class="stat-label">Reserved</div>
            </div>
          </div>
        </div>

        <!-- Quick Filters -->
        <div class="filters-container">
          <div class="filter-group">
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                class="search-input" 
                placeholder="Search tables..."
              >
            </div>
            <select v-model="statusFilter" class="filter-select">
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
            </select>
            <select v-model="capacityFilter" class="filter-select">
              <option value="all">Any Capacity</option>
              <option value="2">2 pax</option>
              <option value="4">4 pax</option>
              <option value="6">6 pax</option>
              <option value="8">8 pax</option>
            </select>
          </div>
        </div>

        <!-- Summary -->
        <div class="tables-summary">
          <span>Showing {{ filteredTables.length }} of {{ tables.length }} tables</span>
          <span class="total-capacity">Total Capacity: {{ totalCapacity }} guests</span>
        </div>

        <TablesSection 
          :tables="filteredTables"
          @update-table-status="updateTableStatus"
          @add-table="addTable"
          @update-table="updateTable"
          @delete-table="deleteTable"
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
import TablesSection from '../../components/Restaurant/TableSection.vue'

const restaurant = useRestaurantStore()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const capacityFilter = ref('all')

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

const availableCount = computed(() => 
  tables.value.filter(t => t.status === 'Available').length
)

const occupiedCount = computed(() => 
  tables.value.filter(t => t.status === 'Occupied').length
)

const reservedCount = computed(() => 
  tables.value.filter(t => t.status === 'Reserved').length
)

const totalCapacity = computed(() => 
  tables.value.reduce((sum, t) => sum + t.capacity, 0)
)

const filteredTables = computed(() => {
  return tables.value.filter(table => {
    const matchesSearch = !searchQuery.value || 
      table.number.toString().includes(searchQuery.value) ||
      table.notes?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === 'all' || 
      table.status === statusFilter.value
    
    const matchesCapacity = capacityFilter.value === 'all' || 
      table.capacity === parseInt(capacityFilter.value)
    
    return matchesSearch && matchesStatus && matchesCapacity
  })
})

const openAddTableModal = () => {
  // This will trigger the add table modal in TablesSection
  // The actual implementation will depend on how TablesSection handles this
}

const updateTableStatus = (id, status) => {
  restaurant.updateTableStatus(id, status)
}

const addTable = async (table) => {
  try {
    await restaurant.createTable(table)
  } catch (error) {
    console.error('Error adding table:', error)
  }
}

const updateTable = async (table) => {
  try {
    const tableId = table.table_id || table.id
    await restaurant.updateTable(tableId, table)
  } catch (error) {
    console.error('Error updating table:', error)
  }
}

const deleteTable = async (id) => {
  try {
    await restaurant.deleteTable(id)
  } catch (error) {
    console.error('Error deleting table:', error)
  }
}

onMounted(() => {
  restaurant.fetchTables()
  restaurant.fetchMenuItems()
  restaurant.fetchInventory()
})
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%);
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

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #F4C400;
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1E88B6 0%, #1F8DBF 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.3);
}

.btn-primary i {
  font-size: 1rem;
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

.total-card {
  border-left-color: #1F8DBF;
}
.available-card {
  border-left-color: #F4C400;
}
.occupied-card {
  border-left-color: #1E88B6;
}
.reserved-card {
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

.total-card .stat-icon {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
}
.available-card .stat-icon {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}
.occupied-card .stat-icon {
  background: rgba(30, 136, 182, 0.1);
  color: #1E88B6;
}
.reserved-card .stat-icon {
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

.total-card .stat-value,
.occupied-card .stat-value {
  color: #1F8DBF;
}

.available-card .stat-value,
.reserved-card .stat-value {
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

/* Filters Container */
.filters-container {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 1.5rem;
  border: 1px solid #f0f0f0;
}

.filter-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 2;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 0.875rem;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.2rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #1F8DBF;
  box-shadow: 0 0 0 3px rgba(31, 141, 191, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.filter-select {
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  color: #374151;
  min-width: 150px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #1F8DBF;
  box-shadow: 0 0 0 3px rgba(31, 141, 191, 0.1);
}

/* Tables Summary */
.tables-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0 0.25rem;
}

.total-capacity {
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
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
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-wrapper {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .tables-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>