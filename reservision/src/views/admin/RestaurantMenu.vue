<template>
  <div class="admin-dashboard">
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <!-- Header -->
    <AdminHeader 
      title="Restaurant Menu"
      subtitle="Manage menu items and pricing"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-container">
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

const restaurant = useRestaurantStore()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

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

const addMenuItem = async (item) => {
  try {
    await restaurant.createMenuItem(item)
  } catch (error) {
    console.error('Error adding menu item:', error)
  }
}

const toggleMenuAvailability = async (id, available) => {
  try {
    await restaurant.toggleMenuItemAvailability(id, available)
  } catch (error) {
    console.error('Error toggling menu availability:', error)
  }
}

const editMenuItem = (item) => {
  // handled in component
}

const updateMenuItem = async (item) => {
  try {
    const itemId = item.menu_id || item.id
    await restaurant.updateMenuItem(itemId, item)
  } catch (error) {
    console.error('Error updating menu item:', error)
  }
}

const deleteMenuItem = async (id) => {
  try {
    await restaurant.deleteMenuItem(id)
  } catch (error) {
    console.error('Error deleting menu item:', error)
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
