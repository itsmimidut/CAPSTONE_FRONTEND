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
        <AdminHeader 
          title="Dashboard"
          subtitle="Welcome back, Admin"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

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

      <!-- Quick Actions -->
      <QuickActions @action="handleQuickAction" />

      <!-- Booking Forecast -->
      <BookingForecast />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import StatsGrid from '../../components/admin/StatsGrid.vue'
import ChartCard from '../../components/admin/ChartCard.vue'
import QuickActions from '../../components/admin/QuickActions.vue'
import BookingForecast from '../../components/admin/BookingForecast.vue'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const statsData = [
  {
    label: 'Total Revenue',
    value: '₱1,250,000',
    progress: 75,
    type: 'revenue',
    trend: 12.5
  },
  {
    label: 'Bookings',
    value: '350',
    progress: 65,
    type: 'bookings',
    trend: 8.3
  },
  {
    label: 'Occupancy',
    value: '78%',
    progress: 78,
    type: 'occupancy',
    trend: 5.2
  },
  {
    label: 'Guests',
    value: '280',
    progress: 70,
    type: 'guests',
    trend: -3.1
  }
]

const revenueChartData = {
  labels: ['Dec 1', 'Dec 2', 'Dec 3', 'Dec 4', 'Dec 5', 'Dec 6', 'Dec 7'],
  datasets: [{
    label: 'Revenue',
    data: [12000, 15000, 10000, 18000, 20000, 22000, 25000],
    borderColor: '#2B6CB0',
    backgroundColor: 'rgba(43,108,176,0.1)',
    tension: 0.3,
    fill: true
  }]
}

const bookingsChartData = {
  labels: ['Deluxe', 'Suite', 'Cottage', 'Standard', 'Villa'],
  datasets: [{
    label: 'Bookings',
    data: [50, 70, 30, 90, 40],
    backgroundColor: '#63B3ED',
    borderRadius: 5
  }]
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
  margin-top:  30px;
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