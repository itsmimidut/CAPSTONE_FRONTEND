<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar :is-open="sidebarOpen" :is-collapsed="sidebarCollapsed" @close="sidebarOpen = false" />

    <!-- Main Content -->
    <main class="main-content" :class="{ shifted: sidebarCollapsed }" style="margin-top: 80px;">
      <div class="header-container">
        <AdminHeader
          title="Sales Report"
          subtitle="Comprehensive Resort Sales Overview"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

      <div class="container mx-auto py-6 px-2">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else>
          <!-- Executive Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="card card-main shadow-lg hover:shadow-xl transition-shadow cursor-pointer" title="Total sales for the selected period">
              <div class="card-label">Total Sales</div>
              <div class="card-value">₱{{ summary.totalSales?.toLocaleString() }}</div>
              <div class="card-desc">All revenue sources combined</div>
            </div>
            <div class="card shadow hover:shadow-lg transition-shadow cursor-pointer" title="Day with the highest sales">
              <div class="card-label">Peak Day</div>
              <div class="card-value">{{ summary.peakDay }}</div>
              <div class="card-desc">Most profitable day</div>
            </div>
            <div class="card shadow hover:shadow-lg transition-shadow cursor-pointer" title="Key highlights for this period">
              <div class="card-label">Key Highlights</div>
              <div class="card-value">{{ summary.keyHighlights }}</div>
            </div>
            <div class="card shadow hover:shadow-lg transition-shadow cursor-pointer" v-if="summary.comparison" title="Comparison to previous period">
              <div class="card-label">Comparison vs Previous</div>
              <div class="card-value">{{ summary.comparison }}</div>
            </div>
          </div>

          <!-- Sales Breakdown by Category -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-chart-pie mr-2"></i>Sales Breakdown by Category
              <span class="ml-2 text-xs text-gray-400" title="See which categories contribute most to your revenue">(info)</span>
            </h2>
            <p class="text-gray-500 text-sm mb-3">See which categories contribute most to your revenue.</p>
            <div class="overflow-x-auto rounded-lg">
              <table class="breakdown-table w-full">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Revenue</th>
                    <th>Count</th>
                    <th>% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cat in breakdown" :key="cat.category" class="hover:bg-blue-50 transition">
                    <td>{{ cat.category }}</td>
                    <td>₱{{ cat.revenue?.toLocaleString() }}</td>
                    <td>{{ cat.count }}</td>
                    <td>{{ cat.percent }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Top-Selling Items -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-utensils mr-2"></i>Top-Selling Restaurant Items
              <span class="ml-2 text-xs text-gray-400" title="Most popular menu items">(info)</span>
            </h2>
            <p class="text-gray-500 text-sm mb-3">Most popular menu items among guests.</p>
            <ol class="top-items">
              <li v-for="item in topItems" :key="item.name" class="py-1 flex justify-between hover:bg-blue-50 px-2 rounded transition">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-count">{{ item.count }} sold</span>
              </li>
            </ol>
          </div>

          <!-- Revenue Trend -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-chart-line mr-2"></i>Daily Revenue Trend (Last 30 Days)
              <span class="ml-2 text-xs text-gray-400" title="Visualize sales trends">(info)</span>
            </h2>
            <p class="text-gray-500 text-sm mb-3">Visualize sales trends and spot peaks or dips.</p>
            <div class="trend-list">
              <div v-for="trend in trends" :key="trend.period" class="trend-bar-wrap group">
                <span class="trend-date">{{ trend.period }}</span>
                <div class="trend-bar group-hover:ring-2 group-hover:ring-blue-300 transition">
                  <div class="trend-bar-inner" :style="{width: (trend.sales / (summary.totalSales/2) * 100) + '%'}"></div>
                </div>
                <span class="trend-sales">₱{{ trend.sales?.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Room Metrics -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-bed mr-2"></i>Room Metrics
              <span class="ml-2 text-xs text-gray-400" title="Key performance indicators for rooms">(info)</span>
            </h2>
            <p class="text-gray-500 text-sm mb-3">Key performance indicators for rooms.</p>
            <div class="metrics-grid">
              <div class="metric hover:bg-blue-50 transition rounded-lg">
                <div class="metric-label">Occupancy Rate</div>
                <div class="metric-value">{{ rooms.occupancyRate?.toFixed(1) }}%</div>
              </div>
              <div class="metric hover:bg-blue-50 transition rounded-lg">
                <div class="metric-label">ADR</div>
                <div class="metric-value">₱{{ rooms.adr?.toLocaleString(undefined, {maximumFractionDigits:2}) }}</div>
              </div>
              <div class="metric hover:bg-blue-50 transition rounded-lg">
                <div class="metric-label">RevPAR</div>
                <div class="metric-value">₱{{ rooms.revpar?.toLocaleString(undefined, {maximumFractionDigits:2}) }}</div>
              </div>
              <div class="metric hover:bg-blue-50 transition rounded-lg">
                <div class="metric-label">Total Rooms</div>
                <div class="metric-value">{{ rooms.totalRooms }}</div>
              </div>
              <div class="metric hover:bg-blue-50 transition rounded-lg">
                <div class="metric-label">Total Room Nights</div>
                <div class="metric-value">{{ rooms.totalRoomNights }}</div>
              </div>
            </div>
          </div>

          <!-- Guest Data -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-users mr-2"></i>Customer & Guest Data
              <span class="ml-2 text-xs text-gray-400" title="Guest and customer breakdown">(info)</span>
            </h2>
            <p class="text-gray-500 text-sm mb-3">Guest and customer breakdown.</p>
            <div class="guest-grid">
              <div class="guest-metric hover:bg-blue-50 transition rounded-lg">
                <span class="guest-label">Total Guests</span>
                <span class="guest-value">{{ guests.total }}</span>
              </div>
              <div class="guest-metric hover:bg-blue-50 transition rounded-lg">
                <span class="guest-label">Unique Customers</span>
                <span class="guest-value">{{ guests.unique }}</span>
              </div>
              <div class="guest-metric hover:bg-blue-50 transition rounded-lg">
                <span class="guest-label">Walk-in Bookings</span>
                <span class="guest-value">{{ guests.walkins }}</span>
              </div>
              <div class="guest-metric hover:bg-blue-50 transition rounded-lg">
                <span class="guest-label">Online Bookings</span>
                <span class="guest-value">{{ guests.online }}</span>
              </div>
            </div>
          </div>

          <!-- Expenses & Net Income -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-money-bill-wave mr-2"></i>Expenses & Net Income
              <span class="ml-2 text-xs text-gray-400" title="Financial summary">(info)</span>
            </h2>
            <p class="text-gray-500 text-sm mb-3">Financial summary for the period.</p>
            <div class="finance-grid">
              <div class="finance-metric hover:bg-blue-50 transition rounded-lg">
                <span class="finance-label">Total Expenses</span>
                <span class="finance-value">₱{{ expenses?.toLocaleString() }}</span>
              </div>
              <div class="finance-metric hover:bg-blue-50 transition rounded-lg">
                <span class="finance-label">Net Income</span>
                <span class="finance-value">₱{{ netIncome?.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Observations & Recommendations -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-lightbulb mr-2"></i>Observations & Recommendations
              <span class="ml-2 text-xs text-gray-400" title="Insights and suggestions">(info)</span>
            </h2>
            <p class="text-gray-500 text-sm mb-3">Insights and suggestions to improve performance.</p>
            <ul class="recommend-list">
              <li>Room occupancy is higher every Saturday.</li>
              <li>Weekday promotions are recommended.</li>
              <li>Top-selling food item: <span v-if="topItems[0]">{{ topItems[0].name }}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '../../components/Admin/AdminSidebar.vue';
import AdminHeader from '../../components/Admin/AdminHeader.vue';
import axios from 'axios';

export default {
  name: 'SalesReport',
  components: { AdminSidebar, AdminHeader },
  data() {
    return {
      sidebarOpen: true,
      sidebarCollapsed: false,
      summary: {
        totalSales: 0,
        peakDay: '',
        keyHighlights: '',
        comparison: ''
      },
      breakdown: [],
      topItems: [],
      trends: [],
      rooms: {
        occupancyRate: 0,
        adr: 0,
        revpar: 0,
        totalRooms: 0,
        totalRoomNights: 0
      },
      guests: {
        total: 0,
        unique: 0,
        walkins: 0,
        online: 0
      },
      expenses: 0,
      netIncome: 0,
      loading: true,
      error: null
    };
  },
  mounted() {
    this.fetchSalesReport();
    // Remove persistent focus highlight from header after navigation
    this.$nextTick(() => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
    });
  },
  methods: {
    async fetchSalesReport() {
      this.loading = true;
      this.error = null;
      try {
        // Adjust the API endpoint as needed for your backend
        const response = await axios.get('/api/restaurant/sales/report');
        const data = response.data;
        // Populate all metrics from backend response
        this.summary = data.summary || this.summary;
        this.breakdown = data.breakdown || [];
        this.topItems = data.topItems || [];
        this.trends = data.trends || [];
        this.rooms = data.rooms || this.rooms;
        this.guests = data.guests || this.guests;
        this.expenses = data.expenses ?? 0;
        this.netIncome = data.netIncome ?? 0;
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Failed to load sales report.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.main-content {
  margin-top: 80px;
}
/* Modern Sales Report Styles */
.sales-report {
  max-width: 900px;
  margin: 2.5rem auto;
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 4px 24px #0002;
  padding: 2.5rem 2rem 2rem 2rem;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.report-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.icon {
  font-size: 1.5rem;
  vertical-align: middle;
}
.summary-cards {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #0001;
  padding: 1.2rem 1.5rem;
  min-width: 180px;
  flex: 1 1 180px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
.card-main {
  background: linear-gradient(90deg, #2563eb 60%, #60a5fa 100%);
  color: #fff;
  box-shadow: 0 4px 16px #2563eb22;
}
.card-label {
  font-size: 1rem;
  opacity: 0.8;
}
.card-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0.2rem;
}
.card-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.2rem;
}
.section {
  margin-bottom: 2.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #0001;
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
}
.breakdown-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}
.breakdown-table th, .breakdown-table td {
  padding: 0.7rem 1rem;
  text-align: left;
}
.breakdown-table th {
  background: #2563eb;
  color: #fff;
  font-weight: 600;
}
.breakdown-table tr:nth-child(even) {
  background: #e0e7ef;
}
.top-items {
  margin: 1rem 0 0 1.2rem;
  padding: 0;
  list-style: decimal inside;
}
.item-name {
  font-weight: 500;
}
.item-count {
  color: #2563eb;
  margin-left: 0.5rem;
}
.trend-list {
  margin-top: 1.2rem;
}
.trend-bar-wrap {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.5rem;
}
.trend-date {
  width: 90px;
  font-size: 0.95rem;
  color: #64748b;
}
.trend-bar {
  flex: 1;
  background: #e0e7ef;
  border-radius: 6px;
  height: 16px;
  overflow: hidden;
}
.trend-bar-inner {
  background: linear-gradient(90deg, #2563eb 60%, #60a5fa 100%);
  height: 100%;
  border-radius: 6px;
}
.trend-sales {
  width: 110px;
  text-align: right;
  font-weight: 500;
  color: #2563eb;
}
.metrics-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 1.2rem;
}
.metric {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  min-width: 140px;
  flex: 1 1 140px;
  text-align: center;
}
.metric-label {
  font-size: 1rem;
  color: #64748b;
}
.metric-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2563eb;
}
.guest-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 1.2rem;
}
.guest-metric {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  min-width: 140px;
  flex: 1 1 140px;
  text-align: center;
}
.guest-label {
  font-size: 1rem;
  color: #64748b;
}
.guest-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2563eb;
}
.finance-grid {
  display: flex;
  gap: 2rem;
  margin-top: 1.2rem;
}
.finance-metric {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  min-width: 180px;
  flex: 1 1 180px;
  text-align: center;
}
.finance-label {
  font-size: 1rem;
  color: #64748b;
}
.finance-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: #16a34a;
}
.recommend-list {
  margin: 1rem 0 0 1.2rem;
  padding: 0;
  list-style: disc inside;
}
.loading {
  color: #2563eb;
  font-size: 1.2rem;
  text-align: center;
  margin: 2rem 0;
}
.error {
  color: #dc2626;
  font-size: 1.1rem;
  text-align: center;
  margin: 2rem 0;
}
@media (max-width: 700px) {
  .sales-report {
    padding: 1rem 0.2rem;
  }
  .summary-cards, .metrics-grid, .guest-grid, .finance-grid {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
