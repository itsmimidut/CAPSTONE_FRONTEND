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
              :subtitle="`Welcome back, ${roleDisplayName}`"
              @toggle-sidebar="sidebarOpen = !sidebarOpen"
            />
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
        <!-- Stats Grid (Admin and Receptionist) -->
        <StatsGrid v-if="canViewBookings" :stats="statsData" />

        <!-- Sales Reports Header with Filter -->
        <div class="sales-reports-header">
          <h2 class="section-title">
            <i class="fas fa-chart-bar"></i>
            Sales Reports
          </h2>
          
          <div class="filter-controls">
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
            
            <button @click="downloadAnalyticsData" class="btn-download">
              <i class="fas fa-download"></i>
              Download Report
            </button>
          </div>
        </div>

        <!-- Charts Row (Admin and Receptionist) -->
        <div v-if="canViewBookings" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <ChartCard
            title="Revenue Chart"
            canvas-id="revenueChart"
            type="line"
            :data="revenueChartData"
            :options="revenueChartOptions"
          />
          
          <div class="bookings-chart-wrapper">
            <div class="chart-header">
              <h3 class="chart-title">Bookings Overview</h3>
              <div class="category-filter">
                <button 
                  @click="selectBookingCategory('all')"
                  :class="['category-btn', { active: selectedBookingCategory === 'all' }]"
                >
                  All
                </button>
                <button 
                  @click="selectBookingCategory('room')"
                  :class="['category-btn', { active: selectedBookingCategory === 'room' }]"
                >
                  Rooms
                </button>
                <button 
                  @click="selectBookingCategory('cottage')"
                  :class="['category-btn', { active: selectedBookingCategory === 'cottage' }]"
                >
                  Cottages
                </button>
                <button 
                  @click="selectBookingCategory('event')"
                  :class="['category-btn', { active: selectedBookingCategory === 'event' }]"
                >
                  Events
                </button>
                <button 
                  @click="selectBookingCategory('swimming')"
                  :class="['category-btn', { active: selectedBookingCategory === 'swimming' }]"
                >
                  Swimming
                </button>
              </div>
            </div>
            <ChartCard
              title=""
              canvas-id="bookingsChart"
              type="bar"
              :data="filteredBookingsChartData"
              :options="bookingsChartOptions"
            />
          </div>
        </div>

        <!-- Restaurant & POS Analytics Section (Admin and Restaurant Staff) -->
        <div v-if="canViewRestaurant" class="analytics-section">
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

        <!-- Quick Actions (Admin Only) -->
        <QuickActions v-if="isAdmin" @action="handleQuickAction" />

        <!-- Booking Forecast (Admin and Receptionist) -->
        <BookingForecast v-if="canViewBookings" />
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

// User role
const userRole = ref('')

// Period filter state
const currentPeriod = ref({
  period: 'month',
  startDate: null,
  endDate: null
})

// Role-based access control
const canViewBookings = computed(() => {
  return userRole.value === 'admin' || userRole.value === 'receptionist'
})

const canViewRestaurant = computed(() => {
  return userRole.value === 'admin' || userRole.value === 'restaurant_staff'
})

const isAdmin = computed(() => {
  return userRole.value === 'admin'
})

const roleDisplayName = computed(() => {
  const roleNames = {
    'admin': 'Admin',
    'receptionist': 'Receptionist',
    'restaurant_staff': 'Restaurant Staff'
  }
  return roleNames[userRole.value] || 'User'
})

// Filtered bookings chart data based on selected category
const filteredBookingsChartData = computed(() => {
  console.log('🔄 Computing filteredBookingsChartData', {
    selectedCategory: selectedBookingCategory.value,
    rawData: bookingsChartData.value
  })
  
  if (selectedBookingCategory.value === 'all') {
    console.log('✅ Returning ALL bookings data:', bookingsChartData.value)
    return bookingsChartData.value
  }
  
  // Map category names to match backend data (case-insensitive)
  const categoryNameMap = {
    'room': 'Room',
    'cottage': 'Cottage',
    'event': 'Event',
    'swimming': 'Swimming'
  }
  
  const targetCategory = categoryNameMap[selectedBookingCategory.value]
  if (!targetCategory) {
    console.warn('⚠️ Unknown category:', selectedBookingCategory.value)
    return bookingsChartData.value
  }
  
  // Find the index of the selected category in labels
  const labels = bookingsChartData.value.labels || []
  const index = labels.findIndex(label => 
    label.toLowerCase() === targetCategory.toLowerCase()
  )
  
  console.log('🔍 Filter Debug:', {
    selectedCategory: selectedBookingCategory.value,
    targetCategory,
    allLabels: labels,
    foundIndex: index,
    allData: bookingsChartData.value.datasets[0]?.data
  })
  
  if (index === -1) {
    // Category not found in data, return empty chart
    console.warn(`⚠️ Category "${targetCategory}" not found in data`)
    return {
      labels: [targetCategory],
      datasets: [{
        label: 'Bookings',
        data: [0],
        backgroundColor: bookingsChartData.value.datasets[0]?.backgroundColor || '#63B3ED',
        borderRadius: 8
      }]
    }
  }
  
  // Return filtered data with only the selected category
  const originalDataset = bookingsChartData.value.datasets[0]
  const filteredValue = originalDataset.data[index] || 0
  
  console.log(`✅ Filtered data for ${targetCategory}:`, filteredValue)
  
  return {
    labels: [labels[index]],
    datasets: [{
      label: 'Bookings',
      data: [filteredValue],
      backgroundColor: Array.isArray(originalDataset.backgroundColor) 
        ? originalDataset.backgroundColor[index] 
        : originalDataset.backgroundColor,
      borderColor: Array.isArray(originalDataset.borderColor)
        ? originalDataset.borderColor[index]
        : originalDataset.borderColor,
      borderWidth: originalDataset.borderWidth || 2,
      borderRadius: originalDataset.borderRadius || 8,
      hoverBackgroundColor: Array.isArray(originalDataset.hoverBackgroundColor)
        ? originalDataset.hoverBackgroundColor[index]
        : originalDataset.hoverBackgroundColor
    }]
  }
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
const recentBookings = ref([])

const revenueChartData = ref({
  labels: [],
  datasets: [{
    label: 'Revenue',
    data: [],
    borderColor: '#2B6CB0',
    backgroundColor: 'rgba(43,108,176,0.1)',
    borderWidth: 3,
    tension: 0.4,
    fill: true,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: '#2B6CB0',
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
    pointHoverBackgroundColor: '#2B6CB0',
    pointHoverBorderColor: '#ffffff',
    pointHoverBorderWidth: 3
  }]
})

const bookingsChartData = ref({
  labels: [],
  datasets: [{
    label: 'Bookings',
    data: [],
    backgroundColor: [
      'rgba(99, 179, 237, 0.8)',
      'rgba(56, 178, 172, 0.8)',
      'rgba(129, 140, 248, 0.8)',
      'rgba(251, 146, 60, 0.8)'
    ],
    borderColor: [
      'rgb(99, 179, 237)',
      'rgb(56, 178, 172)',
      'rgb(129, 140, 248)',
      'rgb(251, 146, 60)'
    ],
    borderWidth: 2,
    borderRadius: 8,
    hoverBackgroundColor: [
      'rgba(99, 179, 237, 1)',
      'rgba(56, 178, 172, 1)',
      'rgba(129, 140, 248, 1)',
      'rgba(251, 146, 60, 1)'
    ]
  }]
})

// Category filter for bookings chart
const selectedBookingCategory = ref('all')

// Individual category charts (keeping for data structure, not displaying separately)
const roomBookingsChartData = ref({
  labels: [],
  datasets: [{
    label: 'Room Bookings',
    data: [],
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    borderColor: 'rgb(16, 185, 129)',
    borderWidth: 2,
    borderRadius: 8
  }]
})

const cottageBookingsChartData = ref({
  labels: [],
  datasets: [{
    label: 'Cottage Bookings',
    data: [],
    backgroundColor: 'rgba(251, 191, 36, 0.8)',
    borderColor: 'rgb(251, 191, 36)',
    borderWidth: 2,
    borderRadius: 8
  }]
})

const eventBookingsChartData = ref({
  labels: [],
  datasets: [{
    label: 'Event Bookings',
    data: [],
    backgroundColor: 'rgba(129, 140, 248, 0.8)',
    borderColor: 'rgb(129, 140, 248)',
    borderWidth: 2,
    borderRadius: 8
  }]
})

const swimmingBookingsChartData = ref({
  labels: [],
  datasets: [{
    label: 'Swimming Bookings',
    data: [],
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderColor: 'rgb(59, 130, 246)',
    borderWidth: 2,
    borderRadius: 8
  }]
})

// Professional chart options
const revenueChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      },
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: function(context) {
          return 'Revenue: ₱' + context.parsed.y.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        color: '#718096',
        font: {
          size: 11,
          weight: '500'
        },
        padding: 8,
        callback: function(value) {
          return '₱' + value.toLocaleString('en-PH')
        }
      },
      border: {
        display: false
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#718096',
        font: {
          size: 11,
          weight: '500'
        },
        padding: 8,
        maxRotation: 45,
        minRotation: 0
      },
      border: {
        display: false
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart'
  }
}))

const bookingsChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      },
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      boxWidth: 12,
      boxHeight: 12,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || ''
          const value = context.parsed.y
          return label + ': ' + value + ' booking' + (value !== 1 ? 's' : '')
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        color: '#718096',
        font: {
          size: 11,
          weight: '500'
        },
        padding: 8,
        stepSize: 1,
        precision: 0
      },
      border: {
        display: false
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#718096',
        font: {
          size: 11,
          weight: '500'
        },
        padding: 8
      },
      border: {
        display: false
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart'
  }
}))

const categoryChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      },
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: function(context) {
          return context.dataset.label + ': ' + context.parsed.y + ' booking' + (context.parsed.y !== 1 ? 's' : '')
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        color: '#718096',
        font: {
          size: 11,
          weight: '500'
        },
        padding: 8,
        stepSize: 1,
        precision: 0
      },
      border: {
        display: false
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#718096',
        font: {
          size: 11,
          weight: '500'
        },
        padding: 8,
        maxRotation: 45,
        minRotation: 0
      },
      border: {
        display: false
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart'
  }
}))

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
    
    if (!response.ok) {
      console.warn('Failed to fetch statistics')
      return
    }

    const data = await response.json()
    
    if (data) {
      statsData.value = [
        data.revenue || statsData.value[0],
        data.bookings || statsData.value[1],
        data.occupancy || statsData.value[2],
        data.guests || statsData.value[3]
      ]
    }
  } catch (err) {
    console.error('Error fetching stats:', err)
    // Don't throw - allow other data to load
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
    
    if (!response.ok) {
      console.warn('Failed to fetch revenue chart')
      return
    }

    const chartData = await response.json()
    if (chartData) {
      revenueChartData.value = chartData
    }
  } catch (err) {
    console.error('Error fetching revenue chart:', err)
    // Don't throw - allow other data to load
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
    
    if (!response.ok) {
      console.warn('Failed to fetch bookings chart')
      return
    }

    const chartData = await response.json()
    console.log('📊 Bookings Chart Data from Backend:', chartData)
    if (chartData) {
      bookingsChartData.value = chartData
      console.log('✅ Bookings chart updated:', bookingsChartData.value)
    }
  } catch (err) {
    console.error('Error fetching bookings chart:', err)
    // Don't throw - allow other data to load
  }
}

const fetchCategoryCharts = async () => {
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

    // Fetch bookings data
    const response = await fetch(`${API_BASE}/bookings?${params}`)
    
    if (!response.ok) {
      console.warn('Failed to fetch category bookings')
      return
    }

    const bookings = await response.json()
    
    // Process bookings by category and date
    const categories = {
      room: {},
      cottage: {},
      event: {},
      swimming: {}
    }
    
    if (Array.isArray(bookings) && bookings.length > 0) {
      bookings.forEach(booking => {
        if (!booking.check_in_date) return
        
        const date = new Date(booking.check_in_date).toLocaleDateString('en-PH', { 
          month: 'short', 
          day: 'numeric' 
        })
        
        if (booking.booking_items && booking.booking_items.length > 0) {
          booking.booking_items.forEach(item => {
            if (item.room_id) {
              categories.room[date] = (categories.room[date] || 0) + 1
            } else if (item.cottage_id) {
              categories.cottage[date] = (categories.cottage[date] || 0) + 1
            } else if (item.type === 'event') {
              categories.event[date] = (categories.event[date] || 0) + 1
            } else if (item.type === 'swimming') {
              categories.swimming[date] = (categories.swimming[date] || 0) + 1
            }
          })
        }
      })
    }
    
    // Convert to chart data
    const sortedDates = [...new Set(Object.keys({...categories.room, ...categories.cottage, ...categories.event, ...categories.swimming}))].sort()
    
    // If no dates, use empty array
    const labels = sortedDates.length > 0 ? sortedDates : ['No Data']
    
    roomBookingsChartData.value = {
      labels: labels,
      datasets: [{
        label: 'Room Bookings',
        data: sortedDates.length > 0 ? sortedDates.map(date => categories.room[date] || 0) : [0],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 8
      }]
    }
    
    cottageBookingsChartData.value = {
      labels: labels,
      datasets: [{
        label: 'Cottage Bookings',
        data: sortedDates.length > 0 ? sortedDates.map(date => categories.cottage[date] || 0) : [0],
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgb(251, 191, 36)',
        borderWidth: 2,
        borderRadius: 8
      }]
    }
    
    eventBookingsChartData.value = {
      labels: labels,
      datasets: [{
        label: 'Event Bookings',
        data: sortedDates.length > 0 ? sortedDates.map(date => categories.event[date] || 0) : [0],
        backgroundColor: 'rgba(129, 140, 248, 0.8)',
        borderColor: 'rgb(129, 140, 248)',
        borderWidth: 2,
        borderRadius: 8
      }]
    }
    
    swimmingBookingsChartData.value = {
      labels: labels,
      datasets: [{
        label: 'Swimming Bookings',
        data: sortedDates.length > 0 ? sortedDates.map(date => categories.swimming[date] || 0) : [0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8
      }]
    }
  } catch (err) {
    console.error('Error fetching category charts:', err)
    // Don't throw - allow other data to load
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

const fetchRecentBookings = async () => {
  try {
    const params = new URLSearchParams({
      period: currentPeriod.value.period,
      limit: 10
    })
    
    if (currentPeriod.value.startDate) {
      params.append('startDate', currentPeriod.value.startDate)
    }
    if (currentPeriod.value.endDate) {
      params.append('endDate', currentPeriod.value.endDate)
    }

    const response = await fetch(`${API_BASE}/bookings?${params}`)
    
    if (response.ok) {
      const bookings = await response.json()
      
      // Ensure bookings is an array
      if (!Array.isArray(bookings)) {
        console.warn('Bookings response is not an array')
        recentBookings.value = []
        return
      }
      
      // Process bookings to include items and format data
      recentBookings.value = bookings.slice(0, 10).map(booking => {
        // Determine booking type based on items
        let type = 'General'
        const items = []
        
        if (booking.booking_items && booking.booking_items.length > 0) {
          booking.booking_items.forEach(item => {
            if (item.room_id) {
              type = 'Room'
              items.push({
                name: item.room_name || `Room #${item.room_id}`,
                quantity: 1
              })
            } else if (item.cottage_id) {
              type = 'Cottage'
              items.push({
                name: item.cottage_name || `Cottage #${item.cottage_id}`,
                quantity: 1
              })
            } else if (item.type === 'event') {
              type = 'Event'
              items.push({
                name: item.name || 'Event Booking',
                quantity: item.quantity || 1
              })
            } else if (item.type === 'swimming') {
              type = 'Swimming'
              items.push({
                name: `Swimming Pool`,
                quantity: item.quantity || booking.adults + booking.children
              })
            }
          })
        }
        
        // If no items found, create a generic entry
        if (items.length === 0) {
          items.push({
            name: 'Booking',
            quantity: 1
          })
        }
        
        return {
          id: booking.id,
          booking_reference: booking.booking_reference || `#${booking.id}`,
          customer_name: `${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'N/A',
          type: type,
          items: items,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          total_amount: `₱${parseFloat(booking.total || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
          status: booking.status || 'Pending'
        }
      })
    }
  } catch (err) {
    console.error('Error fetching recent bookings:', err)
    // Don't throw - allow other data to load
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchAllData = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const fetchPromises = []
    
    // Admin and Receptionist - fetch bookings data
    if (canViewBookings.value) {
      fetchPromises.push(fetchStats())
      fetchPromises.push(fetchRevenueChart())
      fetchPromises.push(fetchBookingsChart())
      fetchPromises.push(fetchCategoryCharts())
      fetchPromises.push(fetchRecentBookings())
    }
    
    // Admin and Restaurant Staff - fetch restaurant/POS data
    if (canViewRestaurant.value) {
      fetchPromises.push(fetchRestaurantPOSData())
    }
    
    await Promise.all(fetchPromises)
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

const selectBookingCategory = (category) => {
  selectedBookingCategory.value = category
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

const downloadAnalyticsData = () => {
  try {
    // Prepare professional CSV with proper formatting
    const csvData = []
    const separator = ','
    
    // Header with styling info
    csvData.push(['================================================='])
    csvData.push(['EDUARDO\'S RESORT - ANALYTICS REPORT'])
    csvData.push(['================================================='])
    csvData.push([''])
    csvData.push(['Report Period', currentPeriod.value.period.toUpperCase()])
    csvData.push(['Generated Date', new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })])
    csvData.push(['Generated Time', new Date().toLocaleTimeString('en-PH')])
    csvData.push(['Generated By', userRole.value.toUpperCase().replace('_', ' ')])
    csvData.push([''])
    csvData.push(['================================================='])
    csvData.push([''])
    
    // Stats Summary (for admin and receptionist)
    if (canViewBookings.value) {
      csvData.push(['SUMMARY STATISTICS'])
      csvData.push(['================================================='])
      csvData.push(['Metric', 'Value', 'Trend (vs. previous period)'])
      csvData.push(['-------------------------------------------------'])
      statsData.value.forEach(stat => {
        const trendText = stat.trend > 0 ? `↑ +${stat.trend}%` : stat.trend < 0 ? `↓ ${stat.trend}%` : '— 0%'
        csvData.push([stat.label, stat.value, trendText])
      })
      csvData.push([''])
      csvData.push([''])
    }
    
    // Restaurant & POS Analytics (for admin and restaurant staff)
    if (canViewRestaurant.value) {
      csvData.push(['RESTAURANT & POS ANALYTICS'])
      csvData.push(['================================================='])
      csvData.push(['Category', 'Total Sales', 'Transaction Count', 'Trend'])
      csvData.push(['-------------------------------------------------'])
      csvData.push([
        'Restaurant', 
        restaurantStats.value.sales, 
        `${restaurantStats.value.orders} orders`,
        `${restaurantStats.value.trend > 0 ? '↑' : restaurantStats.value.trend < 0 ? '↓' : '—'} ${Math.abs(restaurantStats.value.trend)}%`
      ])
      csvData.push([
        'POS', 
        posStats.value.sales, 
        `${posStats.value.transactions} transactions`,
        `${posStats.value.trend > 0 ? '↑' : posStats.value.trend < 0 ? '↓' : '—'} ${Math.abs(posStats.value.trend)}%`
      ])
      csvData.push([
        'E-Shop', 
        eshopStats.value.sales, 
        `${eshopStats.value.orders} orders`,
        `${eshopStats.value.trend > 0 ? '↑' : eshopStats.value.trend < 0 ? '↓' : '—'} ${Math.abs(eshopStats.value.trend)}%`
      ])
      csvData.push([''])
      csvData.push([''])
      
      // Top Menu Items
      if (topMenuItems.value.length > 0) {
        csvData.push(['TOP SELLING MENU ITEMS'])
        csvData.push(['================================================='])
        csvData.push(['Rank', 'Item Name', 'Total Sales'])
        csvData.push(['-------------------------------------------------'])
        topMenuItems.value.forEach((item, index) => {
          csvData.push([`#${index + 1}`, item.name, item.sales])
        })
        csvData.push([''])
        csvData.push([''])
      }
      
      // Top POS Items
      if (topPOSItems.value.length > 0) {
        csvData.push(['TOP POS ITEMS'])
        csvData.push(['================================================='])
        csvData.push(['Rank', 'Item Name', 'Total Sales'])
        csvData.push(['-------------------------------------------------'])
        topPOSItems.value.forEach((item, index) => {
          csvData.push([`#${index + 1}`, item.name, item.sales])
        })
        csvData.push([''])
        csvData.push([''])
      }
    }
    
    // Revenue Chart Data (for admin and receptionist)
    if (canViewBookings.value && revenueChartData.value.labels && revenueChartData.value.labels.length > 0) {
      csvData.push(['REVENUE TREND ANALYSIS'])
      csvData.push(['================================================='])
      csvData.push(['Period', 'Revenue Amount'])
      csvData.push(['-------------------------------------------------'])
      revenueChartData.value.labels.forEach((label, index) => {
        const value = revenueChartData.value.datasets[0].data[index]
        csvData.push([label, `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`])
      })
      csvData.push([''])
      csvData.push([''])
    }
    
    // Bookings Chart Data (for admin and receptionist)
    if (canViewBookings.value && bookingsChartData.value.labels && bookingsChartData.value.labels.length > 0) {
      csvData.push(['BOOKINGS BY TYPE'])
      csvData.push(['================================================='])
      csvData.push(['Booking Type', 'Number of Bookings'])
      csvData.push(['-------------------------------------------------'])
      bookingsChartData.value.labels.forEach((label, index) => {
        const value = bookingsChartData.value.datasets[0].data[index]
        csvData.push([label, value])
      })
      csvData.push([''])
      csvData.push([''])
    }
    
    // Footer
    csvData.push(['================================================='])
    csvData.push(['End of Report'])
    csvData.push(['© Eduardo\'s Resort ' + new Date().getFullYear()])
    csvData.push(['================================================='])
    
    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma or newline
        const cellStr = String(cell || '')
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(',')
    ).join('\n')
    
    // Create download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
    const filename = `Eduardos-Resort-Analytics-${currentPeriod.value.period}-${timestamp}.csv`
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log('Analytics report downloaded successfully')
  } catch (err) {
    console.error('Error downloading analytics data:', err)
    alert('Failed to download report. Please try again.')
  }
}

onMounted(() => {
  // Get user role from localStorage
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      userRole.value = user.role || 'admin'
    } catch (err) {
      console.error('Error parsing user data:', err)
      userRole.value = 'admin'
    }
  } else {
    userRole.value = 'admin'
  }
  
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
  /* background-color: #ffffff; */
  border-bottom: 1px solid #e2e8f0;
  top: 0;
  z-index: 50;
  margin-bottom: 20px;
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
  flex: 0 1 auto;
  min-width: 200px;
}

.sales-reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.period-filter-buttons {
  display: inline-flex;
  gap: 0;
  background: #E2E8F0;
  border-radius: 6px;
  padding: 4px;
}

.btn-download {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #2B6CB0 0%, #2C5282 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(43, 108, 176, 0.2);
}

.btn-download:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(43, 108, 176, 0.3);
}

.btn-download:active {
  transform: translateY(0);
}

.btn-download i {
  font-size: 1rem;
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

.sales-reports-header .section-title {
  margin-bottom: 0;
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

.booking-details-section {
  margin: 2rem 0;
}

.recent-bookings-section {
  margin: 2rem 0;
}

.bookings-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
}

.bookings-table thead {
  background: linear-gradient(to bottom, #F7FAFC, #EDF2F7);
  border-bottom: 2px solid #E2E8F0;
}

.bookings-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2D3748;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bookings-table tbody tr {
  border-bottom: 1px solid #E2E8F0;
  transition: all 0.2s;
}

.bookings-table tbody tr:hover {
  background: #F7FAFC;
}

.bookings-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #4A5568;
  vertical-align: top;
}

.no-data {
  text-align: center;
  padding: 3rem !important;
  color: #A0AEC0;
  font-style: italic;
}

.booking-id {
  font-family: monospace;
  font-weight: 600;
  color: #2B6CB0;
  background: #EBF8FF;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.type-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-room {
  background: #E6FFFA;
  color: #047857;
  border: 1px solid #A7F3D0;
}

.type-cottage {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
}

.type-event {
  background: #E0E7FF;
  color: #3730A3;
  border: 1px solid #C7D2FE;
}

.type-swimming {
  background: #DBEAFE;
  color: #1E40AF;
  border: 1px solid #BFDBFE;
}

.type-general {
  background: #F3F4F6;
  color: #4B5563;
  border: 1px solid #D1D5DB;
}

.items-list-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 300px;
}

.item-chip {
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #2D3748;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-confirmed,
.status-paid {
  background: #D1FAE5;
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.status-pending {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
}

.status-cancelled {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FECACA;
}

.status-completed {
  background: #E0E7FF;
  color: #3730A3;
  border: 1px solid #C7D2FE;
}

/* Bookings Chart Wrapper */
.bookings-chart-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #f3f4f6;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.category-filter {
  display: flex;
  gap: 0.5rem;
  border-radius: 8px;
  background: #f9fafb;
  padding: 4px;
}

.category-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.category-btn.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
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
  
  .bookings-table-container {
    overflow-x: auto;
  }
  
  .bookings-table {
    min-width: 900px;
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