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
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">Restaurant Menu</h1>
            <p class="page-subtitle">Manage your menu items, pricing, and availability</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" @click="addNewItem">
              <i class="fas fa-plus"></i> Add Menu Item
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-utensils"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ menu.length }}</div>
              <div class="stat-label">Total Items</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon available">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ availableCount }}</div>
              <div class="stat-label">Available</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon categories">
              <i class="fas fa-tags"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ categoryCount }}</div>
              <div class="stat-label">Categories</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon avg-price">
              <i class="fas fa-peso-sign"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">₱{{ avgPrice }}</div>
              <div class="stat-label">Avg. Price</div>
            </div>
          </div>
        </div>

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

const addNewItem = () => {
  // This will trigger the add item modal in MenuSection
  // The actual implementation will depend on how MenuSection handles this
}

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
  margin-bottom: 2.5rem;
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
  background: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
  transition: all 0.3s ease;
}

.stat-icon.available {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
}

.stat-icon.categories {
  background: rgba(30, 136, 182, 0.1);
  color: #1E88B6;
}

.stat-icon.avg-price {
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
}
</style>