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
            
            <button @click="downloadAnalyticsData" class="btn-download" :disabled="isDownloadingReport">
              <i class="fas fa-download"></i>
              {{ isDownloadingReport ? 'Downloading...' : 'Download Report' }}
            </button>
            <button @click="openSalesReportPreview" class="btn-preview" :disabled="isGeneratingSalesPreview">
              <i class="fas fa-file-lines"></i>
              {{ isGeneratingSalesPreview ? 'Generating...' : 'Preview Report' }}
            </button>
          </div>
        </div>

        <div class="sales-inline-filters">
          <div class="sales-filter-field">
            <label for="dashboardReportFrom">From</label>
            <input id="dashboardReportFrom" v-model="salesReportFilters.from" type="date" />
          </div>
          <div class="sales-filter-field">
            <label for="dashboardReportTo">To</label>
            <input id="dashboardReportTo" v-model="salesReportFilters.to" type="date" />
          </div>
          <div class="sales-filter-field">
            <label for="dashboardReportStatus">Status</label>
            <select id="dashboardReportStatus" v-model="salesReportFilters.status">
              <option value="all">All statuses</option>
              <option v-for="status in reportStatusOptions" :key="status" :value="status">
                {{ toStatusLabel(status) }}
              </option>
            </select>
          </div>
          <div class="sales-filter-field sales-filter-field--search">
            <label for="dashboardReportSearch">Search</label>
            <input
              id="dashboardReportSearch"
              v-model.trim="salesReportFilters.search"
              type="text"
              placeholder="Name, email, booking code"
            />
          </div>
          <div class="sales-filter-actions">
            <button class="btn-filter-apply" @click="handleGenerateInlineSalesPreview" :disabled="isGeneratingSalesPreview">
              <i class="fas" :class="isGeneratingSalesPreview ? 'fa-spinner fa-spin' : 'fa-magnifying-glass-chart'"></i>
              Apply
            </button>
            <button class="btn-filter-reset" @click="resetInlineSalesFilters" :disabled="isGeneratingSalesPreview">
              <i class="fas fa-rotate-left"></i>
              Reset
            </button>
          </div>
        </div>
        <p v-if="salesPreviewError" class="sales-preview-error">{{ salesPreviewError }}</p>

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

      <div v-if="showSalesPreviewModal && generatedSalesReport" class="sales-preview-overlay" @click.self="showSalesPreviewModal = false">
        <div class="sales-preview-modal">
          <div class="sales-preview-toolbar">
            <div>
              <h3>Sales Report Preview</h3>
              <p>Single-view report preview from Dashboard filters</p>
            </div>
            <div class="sales-preview-actions">
              <button class="btn-download" @click="printInlineSalesReport">
                <i class="fas fa-print"></i>
                Print Report
              </button>
              <button class="btn-preview" @click="showSalesPreviewModal = false">
                <i class="fas fa-xmark"></i>
                Close
              </button>
            </div>
          </div>

          <div class="sales-preview-scroll">
            <article class="sales-report-print" id="sales-report-print-dashboard">
              <header class="srp-header">
                <div class="srp-logo">ER</div>
                <div>
                  <h2>Eduardo's Resort</h2>
                  <p>Reservation and POS Sales Report</p>
                </div>
                <div class="srp-meta">
                  <span>Generated</span>
                  <strong>{{ generatedSalesReport.generatedAt }}</strong>
                </div>
              </header>

              <section class="srp-section">
                <div class="srp-title-row">
                  <div>
                    <h3>Sales Report</h3>
                    <p>{{ generatedSalesReport.dateRange }}</p>
                  </div>
                  <div class="srp-applied">
                    <div><span>Status</span><strong>{{ generatedSalesReport.applied.status }}</strong></div>
                    <div><span>Search</span><strong>{{ generatedSalesReport.applied.search }}</strong></div>
                  </div>
                </div>
              </section>

              <section class="srp-cards">
                <div class="srp-card"><span>Total Bookings</span><strong>{{ generatedSalesReport.totalBookings }}</strong></div>
                <div class="srp-card"><span>Total Revenue</span><strong>{{ generatedSalesReport.totalRevenue }}</strong></div>
                <div class="srp-card"><span>Peak Day</span><strong>{{ generatedSalesReport.peakDay }}</strong></div>
                <div class="srp-card"><span>Top Service</span><strong>{{ generatedSalesReport.topService }}</strong></div>
              </section>

              <section class="srp-section">
                <h4>Status Breakdown</h4>
                <table class="srp-table">
                  <thead><tr><th>Status</th><th>Bookings</th><th>Revenue</th></tr></thead>
                  <tbody>
                    <tr v-for="row in generatedSalesReport.statusBreakdown" :key="row.status">
                      <td>{{ toStatusLabel(row.status) }}</td>
                      <td>{{ row.count }}</td>
                      <td>{{ row.revenue }}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="srp-grid">
                <div class="srp-section">
                  <h4>Category Breakdown</h4>
                  <table class="srp-table">
                    <thead><tr><th>Category</th><th>Bookings</th><th>Revenue</th></tr></thead>
                    <tbody>
                      <tr v-for="row in generatedSalesReport.categoryBreakdown" :key="row.category">
                        <td>{{ row.category }}</td>
                        <td>{{ row.count }}</td>
                        <td>{{ row.revenue }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="srp-section">
                  <h4>Payment Summary</h4>
                  <table class="srp-table">
                    <thead><tr><th>Method</th><th>Count</th><th>Amount</th></tr></thead>
                    <tbody>
                      <tr v-for="row in generatedSalesReport.paymentSummary" :key="row.method">
                        <td>{{ row.method }}</td>
                        <td>{{ row.count }}</td>
                        <td>{{ row.amount }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section class="srp-section" v-if="generatedSalesReport.topBookedItemsByCategory.length">
                <h4>Top Booked Items by Category (Room, Cottage, Event)</h4>
                <table class="srp-table">
                  <thead><tr><th>Category</th><th>Top Item</th><th>Bookings</th></tr></thead>
                  <tbody>
                    <tr v-for="row in generatedSalesReport.topBookedItemsByCategory" :key="row.category">
                      <td>{{ row.category }}</td>
                      <td>{{ row.name }}</td>
                      <td>{{ row.count }}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="srp-section" v-if="generatedSalesReport.channelSummary.length">
                <h4>Sales Channels Summary (Reservations, POS, E-Shop)</h4>
                <table class="srp-table">
                  <thead><tr><th>Channel</th><th>Transactions</th><th>Revenue</th></tr></thead>
                  <tbody>
                    <tr v-for="row in generatedSalesReport.channelSummary" :key="row.channel">
                      <td>{{ row.channel }}</td>
                      <td>{{ row.count }}</td>
                      <td>{{ row.amount }}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="srp-section" v-if="generatedSalesReport.topPosItems.length">
                <h4>Top POS Items</h4>
                <table class="srp-table">
                  <thead><tr><th>Item</th><th>Sales</th></tr></thead>
                  <tbody>
                    <tr v-for="row in generatedSalesReport.topPosItems" :key="row.name">
                      <td>{{ row.name }}</td>
                      <td>{{ row.sales }}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </article>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
// exceljs is loaded dynamically in downloadAnalyticsData
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
const isDownloadingReport = ref(false)
const isGeneratingSalesPreview = ref(false)
const showSalesPreviewModal = ref(false)
const salesPreviewError = ref('')
const generatedSalesReport = ref(null)

const reportStatusOptions = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']
const salesReportFilters = ref({ from: '', to: '', status: 'all', search: '' })

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

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const safeCurrency = (value) => {
  return `₱${toFiniteNumber(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const safeDateLabel = (dateValue) => {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime()) || date.getFullYear() === 1970) return null
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

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

        const date = safeDateLabel(booking.check_in_date)
        if (!date) return
        
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
      const rawTransactions = await response.json()
      const transactions = Array.isArray(rawTransactions) ? rawTransactions : []
      
      // Calculate Restaurant stats
      const restaurantTrans = transactions.filter(t => t.type === 'Restaurant' || !t.type)
      const restaurantTotal = restaurantTrans.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0)
      restaurantStats.value = {
        sales: safeCurrency(restaurantTotal),
        orders: restaurantTrans.length,
        trend: 0 // Would calculate from previous period
      }

      // Calculate POS stats
      const posTrans = transactions.filter(t => t.type === 'POS')
      const posTotal = posTrans.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0)
      posStats.value = {
        sales: safeCurrency(posTotal),
        transactions: posTrans.length,
        trend: 0
      }

      // Calculate E-Shop stats
      const eshopTrans = transactions.filter(t => t.type === 'E-Shop')
      const eshopTotal = eshopTrans.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0)
      eshopStats.value = {
        sales: safeCurrency(eshopTotal),
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
              current.sales += toFiniteNumber(item.subtotal || item.total_price || 0)
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
          sales: safeCurrency(item.sales)
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

const formatDateTime = (dateValue) => {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-PH', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const toStatusLabel = (status) => {
  if (!status) return 'Unknown'
  return String(status).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const normalizeStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_')
  if (normalized === 'noshow') return 'no_show'
  return normalized || 'pending'
}

const detectCategoryFromSummary = (itemsSummary) => {
  const text = String(itemsSummary || '').toLowerCase()
  if (text.includes('swimming')) return 'Swimming'
  if (text.includes('room')) return 'Room'
  if (text.includes('cottage')) return 'Cottage'
  if (text.includes('event')) return 'Event'
  return 'Other'
}

const parseCurrencyAmount = (value) => {
  const cleaned = String(value || '').replace(/[^0-9.-]/g, '')
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

const extractTopBookedItemName = (itemsSummary, category) => {
  const parts = String(itemsSummary || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

  if (parts.length === 0) return null

  const categoryKeywordMap = {
    Room: ['room'],
    Cottage: ['cottage'],
    Event: ['event']
  }

  const keywords = categoryKeywordMap[category] || []
  const matched = parts.find(part => keywords.some(keyword => part.toLowerCase().includes(keyword)))
  return matched || parts[0]
}

const getCurrentPeriodRange = () => {
  const now = new Date()
  const toIso = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  if (currentPeriod.value.period === 'day') {
    const day = toIso(now)
    return { from: day, to: day }
  }
  if (currentPeriod.value.period === 'month') {
    return {
      from: toIso(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: toIso(now)
    }
  }
  if (currentPeriod.value.period === 'year') {
    return {
      from: toIso(new Date(now.getFullYear(), 0, 1)),
      to: toIso(now)
    }
  }
  return { from: '', to: '' }
}

const getEffectiveReportDateRange = () => {
  const periodRange = getCurrentPeriodRange()
  return {
    from: salesReportFilters.value.from || periodRange.from,
    to: salesReportFilters.value.to || periodRange.to
  }
}

const fetchReportBookings = async () => {
  const rows = []
  let page = 1
  let totalPages = 1

  const { from, to } = getEffectiveReportDateRange()

  do {
    const params = new URLSearchParams({ page: String(page), limit: '200' })
    if (from) params.append('startDate', from)
    if (to) params.append('endDate', to)
    if (salesReportFilters.value.status !== 'all') params.append('status', salesReportFilters.value.status)
    if (salesReportFilters.value.search) params.append('search', salesReportFilters.value.search)

    const response = await fetch(`${API_BASE}/bookings/admin/reservations?${params}`)
    const payload = await response.json()

    if (!payload.success) {
      throw new Error(payload.message || 'Failed to fetch report data')
    }

    const mappedRows = (Array.isArray(payload.data) ? payload.data : []).map(item => ({
      id: item.booking_id,
      status: normalizeStatus(item.booking_status),
      reservationCode: item.booking_reference || 'N/A',
      guestName: `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email || 'Guest',
      email: item.email || '',
      paymentMethod: String(item.payment_method || 'Unknown').toUpperCase(),
      category: detectCategoryFromSummary(item.items_summary),
      itemName: extractTopBookedItemName(item.items_summary, detectCategoryFromSummary(item.items_summary)),
      total: toFiniteNumber(item.total),
      checkIn: item.check_in_date
    }))

    rows.push(...mappedRows)
    totalPages = toFiniteNumber(payload.pagination?.totalPages, 1)
    page += 1
  } while (page <= totalPages)

  return rows
}

const buildInlineSalesReport = (rows) => {
  const totalBookings = rows.length
  const totalRevenueNumber = rows.reduce((sum, row) => sum + row.total, 0)

  const statusMap = {}
  const categoryMap = {}
  const paymentMap = {}
  const dayMap = {}
  const topItemMap = {
    Room: {},
    Cottage: {},
    Event: {}
  }

  for (const row of rows) {
    if (!statusMap[row.status]) statusMap[row.status] = { count: 0, revenue: 0 }
    if (!categoryMap[row.category]) categoryMap[row.category] = { count: 0, revenue: 0 }
    if (!paymentMap[row.paymentMethod]) paymentMap[row.paymentMethod] = { count: 0, amount: 0 }

    statusMap[row.status].count += 1
    statusMap[row.status].revenue += row.total

    categoryMap[row.category].count += 1
    categoryMap[row.category].revenue += row.total

    paymentMap[row.paymentMethod].count += 1
    paymentMap[row.paymentMethod].amount += row.total

    const dayLabel = formatDate(row.checkIn)
    if (!dayMap[dayLabel]) dayMap[dayLabel] = { count: 0 }
    dayMap[dayLabel].count += 1

    if (topItemMap[row.category] && row.itemName) {
      topItemMap[row.category][row.itemName] = (topItemMap[row.category][row.itemName] || 0) + 1
    }
  }

  const statusBreakdown = reportStatusOptions.map(status => ({
    status,
    count: statusMap[status]?.count || 0,
    revenue: safeCurrency(statusMap[status]?.revenue || 0)
  }))

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, values]) => ({ category, count: values.count, revenue: safeCurrency(values.revenue), revenueRaw: values.revenue }))
    .sort((a, b) => b.revenueRaw - a.revenueRaw)

  const paymentSummary = Object.entries(paymentMap)
    .map(([method, values]) => ({ method, count: values.count, amount: safeCurrency(values.amount), amountRaw: values.amount }))
    .sort((a, b) => b.amountRaw - a.amountRaw)

  const topService = categoryBreakdown[0]?.category || 'N/A'
  const peakDayEntry = Object.entries(dayMap).sort((a, b) => b[1].count - a[1].count)[0]
  const peakDay = peakDayEntry ? `${peakDayEntry[0]} (${peakDayEntry[1].count})` : 'N/A'

  const channelSummary = [
    {
      channel: 'Reservations',
      count: totalBookings,
      amountRaw: totalRevenueNumber
    }
  ]

  if (canViewRestaurant.value) {
    channelSummary.push(
      {
        channel: 'Restaurant',
        count: toFiniteNumber(restaurantStats.value.orders),
        amountRaw: parseCurrencyAmount(restaurantStats.value.sales)
      },
      {
        channel: 'POS',
        count: toFiniteNumber(posStats.value.transactions),
        amountRaw: parseCurrencyAmount(posStats.value.sales)
      },
      {
        channel: 'E-Shop',
        count: toFiniteNumber(eshopStats.value.orders),
        amountRaw: parseCurrencyAmount(eshopStats.value.sales)
      }
    )
  }

  const channelSummaryFormatted = channelSummary.map(item => ({
    channel: item.channel,
    count: item.count,
    amount: safeCurrency(item.amountRaw),
    amountRaw: item.amountRaw
  }))

  const topBookedItemsByCategory = ['Room', 'Cottage', 'Event'].map(category => {
    const entries = Object.entries(topItemMap[category] || {})
      .sort((a, b) => b[1] - a[1])
    if (entries.length === 0) {
      return {
        category,
        name: 'N/A',
        count: 0
      }
    }
    return {
      category,
      name: entries[0][0],
      count: entries[0][1]
    }
  })

  const { from, to } = getEffectiveReportDateRange()

  return {
    generatedAt: formatDateTime(new Date()),
    dateRange: from || to ? `${from || 'Start'} to ${to || 'Today'}` : 'All dates',
    applied: {
      status: salesReportFilters.value.status === 'all' ? 'All statuses' : toStatusLabel(salesReportFilters.value.status),
      search: salesReportFilters.value.search || 'None'
    },
    totalBookings,
    totalRevenue: safeCurrency(totalRevenueNumber),
    peakDay,
    topService,
    statusBreakdown,
    categoryBreakdown,
    paymentSummary,
    channelSummary: channelSummaryFormatted,
    topBookedItemsByCategory,
    topPosItems: topPOSItems.value.slice(0, 5)
  }
}

const handleGenerateInlineSalesPreview = async () => {
  salesPreviewError.value = ''
  if (salesReportFilters.value.from && salesReportFilters.value.to && salesReportFilters.value.from > salesReportFilters.value.to) {
    salesPreviewError.value = 'Invalid date range. From date must be earlier than To date.'
    return
  }

  isGeneratingSalesPreview.value = true
  try {
    const rows = await fetchReportBookings()
    generatedSalesReport.value = buildInlineSalesReport(rows)
    showSalesPreviewModal.value = true
  } catch (err) {
    salesPreviewError.value = err?.message || 'Failed to generate sales preview.'
  } finally {
    isGeneratingSalesPreview.value = false
  }
}

const resetInlineSalesFilters = () => {
  salesReportFilters.value = { from: '', to: '', status: 'all', search: '' }
  salesPreviewError.value = ''
}

const printInlineSalesReport = () => {
  window.print()
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

const downloadAnalyticsData = async () => {
  try {
    isDownloadingReport.value = true

    if (salesReportFilters.value.from && salesReportFilters.value.to && salesReportFilters.value.from > salesReportFilters.value.to) {
      throw new Error('Invalid date range. From date must be earlier than To date.')
    }

    const rows = await fetchReportBookings()
    const report = buildInlineSalesReport(rows)
    generatedSalesReport.value = report

    // ---- ExcelJS: single styled sheet mirroring the preview modal ----
    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Eduardo's Resort"
    workbook.created = new Date()

    const ws = workbook.addWorksheet('Sales Report', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 }
    })

    // 7 columns: A-C left tables, D spacer, E-G right tables
    ws.columns = [
      { width: 28 }, // A
      { width: 14 }, // B
      { width: 20 }, // C
      { width: 3  }, // D – spacer
      { width: 28 }, // E
      { width: 14 }, // F
      { width: 20 }, // G
    ]

    // ---- Design tokens (matches preview CSS: #0c3b5e, #f0f6fb, #dce8f3, #64748b) ----
    const C_DARK_BLUE = 'FF0C3B5E' // preview h2, h4, th color
    const C_MED_BLUE  = 'FF1A6090' // softer accent for subtitle
    const C_LOGO_BG   = 'FF0C3B5E' // srp-logo bg
    const C_HDR_BG    = 'FFE8F4FD' // srp-header area (very light blue)
    const C_TBL_HDR   = 'FFF0F6FB' // preview .srp-table th background
    const C_SEC_BG    = 'FFF6FAFF' // section name row background (barely blue)
    const C_CARD_BDR  = 'FFDCE8F3' // preview border #dce8f3
    const C_WHITE     = 'FFFFFFFF'
    const C_ROW_ALT   = 'FFF8FBFF' // subtle alternating row
    const C_GREY_TEXT = 'FF64748B' // preview .srp-card span / .srp-applied span

    const bdr = (c) => ({ style: 'thin', color: { argb: c } })
    const cardBorder = { top: bdr(C_CARD_BDR), bottom: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR) }

    // Section h4-equivalent: dark blue bold text, very light bg, bottom border accent
    const secHdr = (cell, text) => {
      cell.value     = text
      cell.font      = { bold: true, size: 10, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } }
      cell.border    = cardBorder
      cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    }

    // Table column header: matches .srp-table th
    const th = (cell, text, right = false) => {
      cell.value     = text
      cell.font      = { bold: true, size: 10, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } }
      cell.border    = cardBorder
      cell.alignment = { horizontal: right ? 'right' : 'left', indent: right ? 0 : 1 }
    }

    // Data cell: matches .srp-table td
    const td = (cell, value, right = false, bold = false, alt = false) => {
      cell.value     = value
      cell.font      = { size: 10, name: 'Calibri', bold }
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: alt ? C_ROW_ALT : C_WHITE } }
      cell.border    = cardBorder
      cell.alignment = { horizontal: right ? 'right' : 'left', indent: right ? 0 : 1 }
    }

    let r = 1

    // ===== HEADER – matches .srp-header =====
    // ER logo cell + resort name
    ws.getCell(`A${r}`).value     = 'ER'
    ws.getCell(`A${r}`).font      = { bold: true, size: 14, color: { argb: C_WHITE }, name: 'Calibri' }
    ws.getCell(`A${r}`).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_LOGO_BG } }
    ws.getCell(`A${r}`).alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getCell(`A${r}`).border    = cardBorder

    ws.mergeCells(`B${r}:E${r}`)
    ws.getCell(`B${r}`).value     = "Eduardo's Resort"
    ws.getCell(`B${r}`).font      = { bold: true, size: 15, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`B${r}`).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`B${r}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }

    ws.getCell(`F${r}`).value     = 'Generated'
    ws.getCell(`F${r}`).font      = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`F${r}`).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`F${r}`).alignment = { horizontal: 'right' }

    ws.getCell(`G${r}`).value     = report.generatedAt
    ws.getCell(`G${r}`).font      = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`G${r}`).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`G${r}`).alignment = { horizontal: 'right' }
    ws.getRow(r).height = 28
    r++

    ws.mergeCells(`A${r}:G${r}`)
    ws.getCell(`A${r}`).value     = 'Reservation and POS Sales Report'
    ws.getCell(`A${r}`).font      = { italic: true, size: 10, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`A${r}`).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } }
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.getRow(r).height = 16
    r++

    r++ // blank

    // ===== TITLE ROW – matches .srp-title-row =====
    // Left: "Sales Report" title + date range
    ws.mergeCells(`A${r}:C${r}`)
    ws.getCell(`A${r}`).value     = 'Sales Report'
    ws.getCell(`A${r}`).font      = { bold: true, size: 12, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 }
    // Right: filters box – matches .srp-applied
    ws.getCell(`E${r}`).value     = 'Status'
    ws.getCell(`E${r}`).font      = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`E${r}`).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
    ws.getCell(`E${r}`).border    = cardBorder
    ws.getCell(`E${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.mergeCells(`F${r}:G${r}`)
    ws.getCell(`F${r}`).value     = report.applied.status
    ws.getCell(`F${r}`).font      = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`F${r}`).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
    ws.getCell(`F${r}`).border    = cardBorder
    ws.getRow(r).height = 18
    r++

    ws.mergeCells(`A${r}:C${r}`)
    ws.getCell(`A${r}`).value     = report.dateRange
    ws.getCell(`A${r}`).font      = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.getCell(`E${r}`).value     = 'Search'
    ws.getCell(`E${r}`).font      = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
    ws.getCell(`E${r}`).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
    ws.getCell(`E${r}`).border    = cardBorder
    ws.getCell(`E${r}`).alignment = { horizontal: 'left', indent: 1 }
    ws.mergeCells(`F${r}:G${r}`)
    ws.getCell(`F${r}`).value     = report.applied.search
    ws.getCell(`F${r}`).font      = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
    ws.getCell(`F${r}`).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
    ws.getCell(`F${r}`).border    = cardBorder
    ws.getRow(r).height = 16
    r++

    r++ // blank

    // ===== SUMMARY CARDS – matches .srp-cards (4 equal cards) =====
    // Cards displayed as 2-row pairs (label on top, bold value below) at cols A, C, E, G
    const cards = [
      { label: 'TOTAL BOOKINGS', value: String(report.totalBookings) },
      { label: 'TOTAL REVENUE',  value: report.totalRevenue },
      { label: 'PEAK DAY',       value: report.peakDay },
      { label: 'TOP SERVICE',    value: report.topService },
    ]
    const cardCols = ['A', 'C', 'E', 'G']

    // Label row
    cards.forEach(({ label }, i) => {
      const cell = ws.getCell(`${cardCols[i]}${r}`)
      cell.value     = label
      cell.font      = { size: 8, color: { argb: C_GREY_TEXT }, name: 'Calibri' }
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
      cell.border    = { top: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR), bottom: { style: 'hair', color: { argb: C_CARD_BDR } } }
      cell.alignment = { horizontal: 'left', indent: 1 }
    })
    ws.getRow(r).height = 14
    r++

    // Value row
    cards.forEach(({ value }, i) => {
      const cell = ws.getCell(`${cardCols[i]}${r}`)
      cell.value     = value
      cell.font      = { bold: true, size: 12, color: { argb: C_DARK_BLUE }, name: 'Calibri' }
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } }
      cell.border    = { bottom: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR), top: { style: 'hair', color: { argb: C_CARD_BDR } } }
      cell.alignment = { horizontal: 'left', indent: 1, vertical: 'middle' }
    })
    ws.getRow(r).height = 22
    r++

    r++ // blank

    // ===== STATUS BREAKDOWN – full-width (matches standalone srp-section in preview) =====
    ws.mergeCells(`A${r}:G${r}`)
    secHdr(ws.getCell(`A${r}`), 'Status Breakdown')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Status')
    th(ws.getCell(`B${r}`), 'Bookings', true)
    th(ws.getCell(`C${r}`), 'Revenue',  true)
    r++

    report.statusBreakdown.forEach((row, i) => {
      const alt = i % 2 === 1
      td(ws.getCell(`A${r}`), toStatusLabel(row.status), false, false, alt)
      td(ws.getCell(`B${r}`), row.count,   true, false, alt)
      td(ws.getCell(`C${r}`), row.revenue, true, false, alt)
      r++
    })

    r++ // blank

    // ===== CATEGORY BREAKDOWN (left) | PAYMENT SUMMARY (right) – matches .srp-grid =====
    ws.mergeCells(`A${r}:C${r}`)
    secHdr(ws.getCell(`A${r}`), 'Category Breakdown')
    ws.mergeCells(`E${r}:G${r}`)
    secHdr(ws.getCell(`E${r}`), 'Payment Summary')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Category')
    th(ws.getCell(`B${r}`), 'Bookings', true)
    th(ws.getCell(`C${r}`), 'Revenue',  true)
    th(ws.getCell(`E${r}`), 'Method')
    th(ws.getCell(`F${r}`), 'Count',    true)
    th(ws.getCell(`G${r}`), 'Amount',   true)
    r++

    const catRows = report.categoryBreakdown
    const payRows = report.paymentSummary
    const maxCPRows = Math.max(catRows.length, payRows.length, 1)
    for (let i = 0; i < maxCPRows; i++) {
      const alt = i % 2 === 1
      if (catRows[i]) {
        td(ws.getCell(`A${r}`), catRows[i].category, false, false, alt)
        td(ws.getCell(`B${r}`), catRows[i].count,    true,  false, alt)
        td(ws.getCell(`C${r}`), catRows[i].revenue,  true,  false, alt)
      }
      if (payRows[i]) {
        td(ws.getCell(`E${r}`), payRows[i].method, false, false, alt)
        td(ws.getCell(`F${r}`), payRows[i].count,  true,  false, alt)
        td(ws.getCell(`G${r}`), payRows[i].amount, true,  false, alt)
      }
      r++
    }

    r++ // blank

    // ===== TOP BOOKED ITEMS BY CATEGORY – matches srp-section =====
    ws.mergeCells(`A${r}:G${r}`)
    secHdr(ws.getCell(`A${r}`), 'Top Booked Items by Category (Room, Cottage, Event)')
    ws.getRow(r).height = 16
    r++

    th(ws.getCell(`A${r}`), 'Category')
    th(ws.getCell(`B${r}`), 'Top Item')
    th(ws.getCell(`C${r}`), 'Bookings', true)
    r++

    report.topBookedItemsByCategory.forEach((row, i) => {
      const alt = i % 2 === 1
      td(ws.getCell(`A${r}`), row.category, false, false, alt)
      td(ws.getCell(`B${r}`), row.name,     false, false, alt)
      td(ws.getCell(`C${r}`), row.count,    true,  false, alt)
      r++
    })

    r++ // blank

    // ===== SALES CHANNELS SUMMARY – matches srp-section =====
    if (report.channelSummary.length) {
      ws.mergeCells(`A${r}:G${r}`)
      secHdr(ws.getCell(`A${r}`), 'Sales Channels Summary (Reservations, POS, E-Shop)')
      ws.getRow(r).height = 16
      r++

      th(ws.getCell(`A${r}`), 'Channel')
      th(ws.getCell(`B${r}`), 'Transactions', true)
      th(ws.getCell(`C${r}`), 'Revenue',      true)
      r++

      report.channelSummary.forEach((row, i) => {
        const alt = i % 2 === 1
        td(ws.getCell(`A${r}`), row.channel, false, false, alt)
        td(ws.getCell(`B${r}`), row.count,   true,  false, alt)
        td(ws.getCell(`C${r}`), row.amount,  true,  false, alt)
        r++
      })

      r++ // blank
    }

    // ===== TOP POS ITEMS – matches srp-section =====
    if (report.topPosItems.length) {
      ws.mergeCells(`A${r}:G${r}`)
      secHdr(ws.getCell(`A${r}`), 'Top POS Items')
      ws.getRow(r).height = 16
      r++

      th(ws.getCell(`A${r}`), 'Item')
      th(ws.getCell(`B${r}`), 'Sales', true)
      r++

      report.topPosItems.forEach((row, i) => {
        const alt = i % 2 === 1
        td(ws.getCell(`A${r}`), row.name,  false, false, alt)
        td(ws.getCell(`B${r}`), row.sales, true,  false, alt)
        r++
      })
    }

    // ---- Download ----
    const buffer = await workbook.xlsx.writeBuffer()
    const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url    = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href  = url
    const ts     = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    anchor.download = `Eduardos-Resort-SalesReport-${ts}.xlsx`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)

    console.log('Sales report downloaded successfully')
  } catch (err) {
    console.error('Error downloading analytics data:', err)
    alert('Failed to download report. Please try again.')
  } finally {
    isDownloadingReport.value = false
  }
}

const openSalesReportPreview = () => {
  handleGenerateInlineSalesPreview()
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

.sales-inline-filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr)) auto;
  gap: 0.75rem;
  align-items: end;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.85rem;
  margin-bottom: 1rem;
}

.sales-filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.sales-filter-field label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sales-filter-field input,
.sales-filter-field select {
  height: 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 0.65rem;
  font-size: 0.84rem;
  color: #1f2937;
  background: #fff;
}

.sales-filter-field input:focus,
.sales-filter-field select:focus {
  outline: none;
  border-color: #2b6cb0;
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.12);
}

.sales-filter-actions {
  display: flex;
  gap: 0.45rem;
}

.btn-filter-apply,
.btn-filter-reset {
  height: 36px;
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0 0.85rem;
  font-size: 0.82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}

.btn-filter-apply {
  background: #1f8dbf;
  color: #fff;
}

.btn-filter-apply:hover {
  background: #1e88b6;
}

.btn-filter-reset {
  background: #fff;
  border-color: #cbd5e1;
  color: #334155;
}

.btn-filter-reset:hover {
  border-color: #2b6cb0;
  color: #2b6cb0;
}

.sales-preview-error {
  margin-top: -0.45rem;
  margin-bottom: 0.95rem;
  color: #b91c1c;
  font-size: 0.82rem;
  font-weight: 600;
}

.sales-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem;
}

.sales-preview-modal {
  background: #eef5fb;
  width: min(1280px, 99vw);
  max-height: 98vh;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sales-preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 0.85rem;
  border-bottom: 1px solid #d7e4ef;
  background: #fff;
}

.sales-preview-toolbar h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #1f2937;
}

.sales-preview-toolbar p {
  margin: 0.2rem 0 0;
  font-size: 0.72rem;
  color: #64748b;
}

.sales-preview-actions {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.sales-preview-scroll {
  overflow: hidden;
  padding: 0.55rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sales-report-print {
  width: min(1140px, 100%);
  min-height: auto;
  margin: 0 auto;
  background: #fff;
  color: #0f172a;
  padding: 7mm;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.16);
}

.srp-header {
  display: grid;
  grid-template-columns: 52px 1fr auto;
  gap: 0.55rem;
  align-items: center;
  border-bottom: 2px solid #0c3b5e;
  padding-bottom: 0.4rem;
}

.srp-logo {
  width: 44px;
  height: 44px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0c3b5e;
  color: #f4c400;
  font-weight: 800;
}

.srp-header h2 {
  margin: 0;
  font-size: 0.92rem;
}

.srp-header p {
  margin: 0.2rem 0 0;
  font-size: 0.7rem;
  color: #64748b;
}

.srp-meta {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
}

.srp-meta span {
  font-size: 0.62rem;
  color: #64748b;
}

.srp-meta strong {
  font-size: 0.72rem;
}

.srp-section {
  margin-top: 0.45rem;
}

.srp-title-row {
  display: flex;
  justify-content: space-between;
  gap: 0.45rem;
}

.srp-title-row h3 {
  margin: 0;
  font-size: 0.88rem;
}

.srp-title-row p {
  margin: 0.2rem 0 0;
  font-size: 0.68rem;
  color: #64748b;
}

.srp-applied {
  border: 1px solid #dce8f3;
  border-radius: 8px;
  padding: 0.34rem 0.46rem;
  min-width: 190px;
}

.srp-applied div {
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
  font-size: 0.64rem;
}

.srp-applied span {
  color: #64748b;
}

.srp-cards {
  margin-top: 0.4rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
}

.srp-card {
  border: 1px solid #dce8f3;
  border-radius: 8px;
  padding: 0.34rem 0.4rem;
}

.srp-card span {
  display: block;
  font-size: 0.62rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.srp-card strong {
  display: block;
  margin-top: 0.14rem;
  font-size: 0.8rem;
}

.srp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}

.srp-section h4 {
  margin: 0 0 0.2rem;
  color: #0c3b5e;
  font-size: 0.74rem;
}

.srp-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #dce8f3;
}

.srp-table th,
.srp-table td {
  border: 1px solid #dce8f3;
  padding: 0.24rem 0.3rem;
  font-size: 0.64rem;
  text-align: left;
}

.srp-table th {
  background: #f0f6fb;
  color: #0c3b5e;
  font-weight: 700;
}

@media (min-width: 1024px) {
  .sales-report-print {
    zoom: 0.8;
  }
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

.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 4px rgba(43, 108, 176, 0.2);
}

.btn-download i {
  font-size: 1rem;
}

.btn-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #ffffff;
  color: #2C5282;
  border: 1px solid #2B6CB0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview:hover {
  background: #EBF8FF;
  border-color: #2C5282;
  transform: translateY(-1px);
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

  .sales-inline-filters {
    grid-template-columns: 1fr;
  }

  .sales-filter-actions {
    justify-content: flex-start;
  }

  .sales-preview-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .srp-title-row,
  .srp-grid {
    display: grid;
    grid-template-columns: 1fr;
  }

  .srp-cards {
    grid-template-columns: 1fr 1fr;
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

<style>
@media print {
  body * {
    visibility: hidden !important;
  }

  .sales-report-print,
  .sales-report-print * {
    visibility: visible !important;
  }

  .sales-report-print {
    position: absolute;
    top: 0;
    left: 0;
    width: 210mm;
    min-height: 297mm;
    margin: 0;
    padding: 9mm;
    box-shadow: none !important;
    background: #fff !important;
    color: #000 !important;
  }

  .sales-report-print .srp-table,
  .sales-report-print .srp-table th,
  .sales-report-print .srp-table td,
  .sales-report-print .srp-card,
  .sales-report-print .srp-applied {
    border-color: #000 !important;
  }

  @page {
    size: A4 portrait;
    margin: 8mm;
  }
}
</style>