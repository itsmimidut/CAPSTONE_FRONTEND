<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <!-- Main Content -->
    <main 
      class="main-content"
      :class="{ shifted: sidebarCollapsed }"
    >
      <!-- Header -->
      <div class="header-container">
        <div class="header-content">
          <div class="header-text">
            <AdminHeader 
              title="Dashboard"
              subtitle="Welcome back, Admin"
              @toggle-sidebar="sidebarOpen = !sidebarOpen"
            />
          </div>
          
          <!-- Period Filter Buttons -->
          <div class="period-filter-buttons">
            <button 
              @click="selectPeriod('day')"
              :class="['period-btn', { active: currentPeriod.period === 'day' }]"
            >
              Day
            </button>
            <button 
              @click="selectPeriod('month')"
              :class="['period-btn', { active: currentPeriod.period === 'month' }]"
            >
              Month
            </button>
            <button 
              @click="selectPeriod('year')"
              :class="['period-btn', { active: currentPeriod.period === 'year' }]"
            >
              Year
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading analytics data...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-container">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="fetchAllData" class="btn-retry">
          <i class="fas fa-redo"></i>
          Retry
        </button>
      </div>

      <!-- Dashboard Content -->
      <div v-if="!isLoading && !error">
        <!-- Stats Grid -->
        <StatsGrid :stats="statsData" />

        <!-- Charts Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <ChartCard
            title="Revenue Chart"
            canvas-id="revenueChart"
            type="line"
            :data="revenueChartData"
            :options="{ plugins: { legend: { display: false } } }"
          />
          <ChartCard
            title="Bookings Chart"
            canvas-id="bookingsChart"
            type="bar"
            :data="bookingsChartData"
            :options="{ plugins: { legend: { display: false } } }"
          />
        </div>

        <!-- Restaurant & POS Analytics Section -->
        <div class="analytics-section">
          <h2 class="section-title">
            <i class="fas fa-chart-line"></i>
            Restaurant & POS Analytics
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <!-- Restaurant Stats -->
            <div class="analytics-card">
              <div class="card-header">
                <i class="fas fa-utensils"></i>
                <h3>Restaurant Sales</h3>
              </div>
              <div class="card-value">{{ restaurantStats.sales }}</div>
              <div class="card-detail">
                <span>Orders: {{ restaurantStats.orders }}</span>
                <span :class="restaurantStats.trend > 0 ? 'text-green' : 'text-red'">
                  <i :class="restaurantStats.trend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ Math.abs(restaurantStats.trend) }}%
                </span>
              </div>
            </div>

            <!-- POS Stats -->
            <div class="analytics-card">
              <div class="card-header">
                <i class="fas fa-cash-register"></i>
                <h3>POS Sales</h3>
              </div>
              <div class="card-value">{{ posStats.sales }}</div>
              <div class="card-detail">
                <span>Transactions: {{ posStats.transactions }}</span>
                <span :class="posStats.trend > 0 ? 'text-green' : 'text-red'">
                  <i :class="posStats.trend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ Math.abs(posStats.trend) }}%
                </span>
              </div>
            </div>

            <!-- E-Shop Stats -->
            <div class="analytics-card">
              <div class="card-header">
                <i class="fas fa-shopping-cart"></i>
                <h3>E-Shop Orders</h3>
              </div>
              <div class="card-value">{{ eshopStats.sales }}</div>
              <div class="card-detail">
                <span>Orders: {{ eshopStats.orders }}</span>
                <span :class="eshopStats.trend > 0 ? 'text-green' : 'text-red'">
                  <i :class="eshopStats.trend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ Math.abs(eshopStats.trend) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Top Selling Items -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="top-items-card">
              <h3 class="card-title">
                <i class="fas fa-trophy"></i>
                Top Selling Menu Items
              </h3>
              <div class="items-list">
                <div v-for="(item, index) in topMenuItems" :key="index" class="item-row">
                  <span class="item-rank">{{ index + 1 }}</span>
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-sales">{{ item.sales }}</span>
                </div>
              </div>
            </div>

            <div class="top-items-card">
              <h3 class="card-title">
                <i class="fas fa-fire"></i>
                Top POS Items
              </h3>
              <div class="items-list">
                <div v-for="(item, index) in topPOSItems" :key="index" class="item-row">
                  <span class="item-rank">{{ index + 1 }}</span>
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-sales">{{ item.sales }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <QuickActions @action="handleQuickAction" />

        <!-- Booking Forecast -->
        <BookingForecast />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import StatsGrid from '../../components/admin/StatsGrid.vue'
import ChartCard from '../../components/admin/ChartCard.vue'
import QuickActions from '../../components/admin/QuickActions.vue'
import BookingForecast from '../../components/admin/BookingForecast.vue'

const API_BASE = 'http://localhost:8000/api'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const isLoading = ref(false)
const error = ref('')

// Period filter state
const currentPeriod = ref({
  period: 'month',
  startDate: null,
  endDate: null
})

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Analytics Data
const statsData = ref([
  {
    label: 'Total Revenue',
    value: '₱0.00',
    progress: 0,
    type: 'revenue',
    trend: 0
  },
  {
    label: 'Bookings',
    value: '0',
    progress: 0,
    type: 'bookings',
    trend: 0
  },
  {
    label: 'Occupancy',
    value: '0%',
    progress: 0,
    type: 'occupancy',
    trend: 0
  },
  {
    label: 'Guests',
    value: '0',
    progress: 0,
    type: 'guests',
    trend: 0
  }
])

// Restaurant & POS Analytics
const restaurantStats = ref({
  sales: '₱0.00',
  orders: 0,
  trend: 0
})

const posStats = ref({
  sales: '₱0.00',
  transactions: 0,
  trend: 0
})

const eshopStats = ref({
  sales: '₱0.00',
  orders: 0,
  trend: 0
})

const topMenuItems = ref([])
const topPOSItems = ref([])

const revenueChartData = ref({
  labels: [],
  datasets: [{
    label: 'Revenue',
    data: [],
    borderColor: '#2B6CB0',
    backgroundColor: 'rgba(43,108,176,0.1)',
    tension: 0.3,
    fill: true
  }]
})

const bookingsChartData = ref({
  labels: [],
  datasets: [{
    label: 'Bookings',
    data: [],
    backgroundColor: '#63B3ED',
    borderRadius: 5
  }]
})

// Fetch functions
const fetchStats = async () => {
  try {
    const params = new URLSearchParams({
      period: currentPeriod.value.period
    })
    
    if (currentPeriod.value.startDate) {
      params.append('startDate', currentPeriod.value.startDate)
    }
    if (currentPeriod.value.endDate) {
      params.append('endDate', currentPeriod.value.endDate)
    }

    const response = await fetch(`${API_BASE}/analytics/stats?${params}`)
    
    if (!response.ok) throw new Error('Failed to fetch statistics')

    const data = await response.json()
    
    statsData.value = [
      data.revenue,
      data.bookings,
      data.occupancy,
      data.guests
    ]
  } catch (err) {
    console.error('Error fetching stats:', err)
    throw err
  }
}

const fetchRevenueChart = async () => {
  try {
    const params = new URLSearchParams({
      period: currentPeriod.value.period
    })
    
    if (currentPeriod.value.startDate) {
      params.append('startDate', currentPeriod.value.startDate)
    }
    if (currentPeriod.value.endDate) {
      params.append('endDate', currentPeriod.value.endDate)
    }

    const response = await fetch(`${API_BASE}/analytics/revenue-chart?${params}`)
    
    if (!response.ok) throw new Error('Failed to fetch revenue chart')

    revenueChartData.value = await response.json()
  } catch (err) {
    console.error('Error fetching revenue chart:', err)
    throw err
  }
}

const fetchBookingsChart = async () => {
  try {
    const params = new URLSearchParams({
      period: currentPeriod.value.period
    })
    
    if (currentPeriod.value.startDate) {
      params.append('startDate', currentPeriod.value.startDate)
    }
    if (currentPeriod.value.endDate) {
      params.append('endDate', currentPeriod.value.endDate)
    }

    const response = await fetch(`${API_BASE}/analytics/bookings-by-type?${params}`)
    
    if (!response.ok) throw new Error('Failed to fetch bookings chart')

    bookingsChartData.value = await response.json()
  } catch (err) {
    console.error('Error fetching bookings chart:', err)
    throw err
  }
}

const fetchRestaurantPOSData = async () => {
  try {
    const params = new URLSearchParams({
      period: currentPeriod.value.period
    })
    
    if (currentPeriod.value.startDate) {
      params.append('startDate', currentPeriod.value.startDate)
    }
    if (currentPeriod.value.endDate) {
      params.append('endDate', currentPeriod.value.endDate)
    }

    // This would call a new backend endpoint for restaurant/POS analytics
    // For now, we'll use POS transactions data
    const response = await fetch(`${API_BASE}/pos/transactions?${params}`)
    
    if (response.ok) {
      const transactions = await response.json()
      
      // Calculate Restaurant stats
      const restaurantTrans = transactions.filter(t => t.type === 'Restaurant' || !t.type)
      const restaurantTotal = restaurantTrans.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0)
      restaurantStats.value = {
        sales: `₱${restaurantTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
        orders: restaurantTrans.length,
        trend: 0 // Would calculate from previous period
      }

      // Calculate POS stats
      const posTrans = transactions.filter(t => t.type === 'POS')
      const posTotal = posTrans.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0)
      posStats.value = {
        sales: `₱${posTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
        transactions: posTrans.length,
        trend: 0
      }

      // Calculate E-Shop stats
      const eshopTrans = transactions.filter(t => t.type === 'E-Shop')
      const eshopTotal = eshopTrans.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0)
      eshopStats.value = {
        sales: `₱${eshopTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
        orders: eshopTrans.length,
        trend: 0
      }

      // Get top items (simplified - would need proper grouping from backend)
      const itemCounts = new Map()
      transactions.forEach(t => {
        if (t.items && Array.isArray(t.items)) {
          t.items.forEach(item => {
            const name = item.name || item.item_name
            if (name) {
              const current = itemCounts.get(name) || { name, quantity: 0, sales: 0 }
              current.quantity += item.quantity || 1
              current.sales += parseFloat(item.subtotal || item.total_price || 0)
              itemCounts.set(name, current)
            }
          })
        }
      })

      const sortedItems = Array.from(itemCounts.values())
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)
        .map(item => ({
          name: item.name,
          sales: `₱${item.sales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
        }))

      topMenuItems.value = sortedItems
      topPOSItems.value = sortedItems
    }
  } catch (err) {
    console.error('Error fetching restaurant/POS data:', err)
    // Don't throw - allow other data to load
  }
}

const fetchAllData = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    await Promise.all([
      fetchStats(),
      fetchRevenueChart(),
      fetchBookingsChart(),
      fetchRestaurantPOSData()
    ])
  } catch (err) {
    error.value = 'Failed to load analytics data'
    console.error('Error loading dashboard data:', err)
  } finally {
    isLoading.value = false
  }
}

const selectPeriod = (period) => {
  currentPeriod.value.period = period
  currentPeriod.value.startDate = null
  currentPeriod.value.endDate = null
  fetchAllData()
}

const handleQuickAction = (actionKey) => {
  console.log('Quick action triggered:', actionKey)
  
  switch(actionKey) {
    case 'new-reservation':
      alert('Redirecting to new reservation form...')
      break
    case 'add-room':
      alert('Redirecting to add room form...')
      break
    case 'add-user':
      alert('Redirecting to add user form...')
      break
    case 'generate-report':
      alert('Generating report...')
      break
  }
}

onMounted(() => {
  fetchAllData()
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: linear-gradient(to bottom, #F8F7F4, #FFFFFF);
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
}

@media (min-width: 768px) {
  .admin-layout {
    grid-template-columns: 260px 1fr;
    grid-template-rows: 1fr;
  }
}

.admin-layout > :nth-child(1) {
  grid-column: 1;
  grid-row: 1;
  z-index: 30;
}

@media (min-width: 768px) {
  .admin-layout > :nth-child(1) {
    grid-row: 1 / -1;
  }
}

.main-content {
  margin-left: 0;
  min-height: 100vh;
  background-color: #F8F7F4;
  transition: margin-left 0.3s ease;
  padding: 0.75rem;
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
}

.header-container {
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  top: 0;
  z-index: 50;
  margin-bottom: 10px;
  margin-top: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-text {
  flex: 1;
  min-width: 200px;
}

.period-filter-buttons {
  display: inline-flex;
  gap: 0;
  background: #E2E8F0;
  border-radius: 6px;
  padding: 4px;
  flex-shrink: 0;
}

.period-btn {
  padding: 0.5rem 1.5rem;
  border: none;
  background: transparent;
  color: #4A5568;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.period-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.period-btn.active {
  background: #2D3748;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analytics-section {
  margin: 2rem 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #2B6CB0;
}

.analytics-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.analytics-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-header i {
  font-size: 1.5rem;
  color: #2B6CB0;
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2D3748;
  margin-bottom: 0.5rem;
}

.card-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #718096;
}

.text-green {
  color: #48BB78;
  font-weight: 600;
}

.text-red {
  color: #F56565;
  font-weight: 600;
}

.top-items-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title i {
  color: #F59E0B;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #F7FAFC;
  border-radius: 8px;
  transition: all 0.2s;
}

.item-row:hover {
  background: #EDF2F7;
  transform: translateX(4px);
}

.item-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #2B6CB0 0%, #2C5282 100%);
  color: white;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 700;
}

.item-name {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2D3748;
}

.item-sales {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2B6CB0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E2E8F0;
  border-top-color: #2B6CB0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: #718096;
  font-size: 1rem;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  background: #FFF5F5;
  border-radius: 12px;
  margin: 1rem;
}

.error-container i {
  font-size: 3rem;
  color: #F56565;
}

.error-container p {
  color: #C53030;
  font-size: 1rem;
  text-align: center;
}

.btn-retry {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2B6CB0 0%, #2C5282 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .period-filter-buttons {
    width: 100%;
  }
  
  .period-btn {
    flex: 1;
  }
}

@media (min-width: 768px) {
  .main-content {
    grid-column: 2;
    grid-row: 1;
    padding: 1.5rem;
  }
  
  .main-content.shifted {
    grid-column: 2;
  }
}
</style>