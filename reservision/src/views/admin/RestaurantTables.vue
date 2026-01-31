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
        <TablesSection 
          :tables="tables"
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
