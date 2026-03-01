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
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-chart-pie mr-2 text-[#1F8DBF]"></i>Sales Breakdown by Category
              <span class="ml-2 text-xs text-[#1F8DBF] opacity-60" title="See which categories contribute most to your revenue">(info)</span>
            </h2>
            <p class="text-[#1E88B6] text-sm mb-3 opacity-70">See which categories contribute most to your revenue.</p>
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
                  <tr v-for="cat in breakdown" :key="cat.category" class="hover:bg-[#F4C400]/10 transition">
                    <td class="text-[#1F8DBF]">{{ cat.category }}</td>
                    <td class="text-[#1E88B6]">₱{{ cat.revenue?.toLocaleString() }}</td>
                    <td class="text-[#1E88B6]">{{ cat.count }}</td>
                    <td class="text-[#1F8DBF] font-semibold">{{ cat.percent }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Top-Selling Items -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-utensils mr-2 text-[#F4C400]"></i>Top-Selling Restaurant Items
              <span class="ml-2 text-xs text-[#1F8DBF] opacity-60" title="Most popular menu items">(info)</span>
            </h2>
            <p class="text-[#1E88B6] text-sm mb-3 opacity-70">Most popular menu items among guests.</p>
            <ol class="top-items">
              <li v-for="item in topItems" :key="item.name" class="py-1 flex justify-between hover:bg-[#F4C400]/10 px-2 rounded transition">
                <span class="item-name text-[#1F8DBF]">{{ item.name }}</span>
                <span class="item-count text-[#F4C400]">{{ item.count }} sold</span>
              </li>
            </ol>
          </div>

          <!-- Revenue Trend -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-chart-line mr-2 text-[#1F8DBF]"></i>Daily Revenue Trend (Last 30 Days)
              <span class="ml-2 text-xs text-[#1F8DBF] opacity-60" title="Visualize sales trends">(info)</span>
            </h2>
            <p class="text-[#1E88B6] text-sm mb-3 opacity-70">Visualize sales trends and spot peaks or dips.</p>
            <div class="trend-list">
              <div v-for="trend in trends" :key="trend.period" class="trend-bar-wrap group">
                <span class="trend-date text-[#1F8DBF]">{{ trend.period }}</span>
                <div class="trend-bar group-hover:ring-2 group-hover:ring-[#F4C400] transition">
                  <div class="trend-bar-inner" :style="{width: (trend.sales / (summary.totalSales/2) * 100) + '%'}"></div>
                </div>
                <span class="trend-sales text-[#F4C400]">₱{{ trend.sales?.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Room Metrics -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-bed mr-2 text-[#1F8DBF]"></i>Room Metrics
              <span class="ml-2 text-xs text-[#1F8DBF] opacity-60" title="Key performance indicators for rooms">(info)</span>
            </h2>
            <p class="text-[#1E88B6] text-sm mb-3 opacity-70">Key performance indicators for rooms.</p>
            <div class="metrics-grid">
              <div class="metric hover:bg-[#F4C400]/10 transition rounded-lg">
                <div class="metric-label text-[#1F8DBF]">Occupancy Rate</div>
                <div class="metric-value text-[#1E88B6]">{{ rooms.occupancyRate?.toFixed(1) }}%</div>
              </div>
              <div class="metric hover:bg-[#F4C400]/10 transition rounded-lg">
                <div class="metric-label text-[#1F8DBF]">ADR</div>
                <div class="metric-value text-[#1E88B6]">₱{{ rooms.adr?.toLocaleString(undefined, {maximumFractionDigits:2}) }}</div>
              </div>
              <div class="metric hover:bg-[#F4C400]/10 transition rounded-lg">
                <div class="metric-label text-[#1F8DBF]">RevPAR</div>
                <div class="metric-value text-[#1E88B6]">₱{{ rooms.revpar?.toLocaleString(undefined, {maximumFractionDigits:2}) }}</div>
              </div>
              <div class="metric hover:bg-[#F4C400]/10 transition rounded-lg">
                <div class="metric-label text-[#1F8DBF]">Total Rooms</div>
                <div class="metric-value text-[#1E88B6]">{{ rooms.totalRooms }}</div>
              </div>
              <div class="metric hover:bg-[#F4C400]/10 transition rounded-lg">
                <div class="metric-label text-[#1F8DBF]">Total Room Nights</div>
                <div class="metric-value text-[#1E88B6]">{{ rooms.totalRoomNights }}</div>
              </div>
            </div>
          </div>

          <!-- Guest Data -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-users mr-2 text-[#F4C400]"></i>Customer & Guest Data
              <span class="ml-2 text-xs text-[#1F8DBF] opacity-60" title="Guest and customer breakdown">(info)</span>
            </h2>
            <p class="text-[#1E88B6] text-sm mb-3 opacity-70">Guest and customer breakdown.</p>
            <div class="guest-grid">
              <div class="guest-metric hover:bg-[#F4C400]/10 transition rounded-lg">
                <span class="guest-label text-[#1F8DBF]">Total Guests</span>
                <span class="guest-value text-[#1E88B6]">{{ guests.total }}</span>
              </div>
              <div class="guest-metric hover:bg-[#F4C400]/10 transition rounded-lg">
                <span class="guest-label text-[#1F8DBF]">Unique Customers</span>
                <span class="guest-value text-[#1E88B6]">{{ guests.unique }}</span>
              </div>
              <div class="guest-metric hover:bg-[#F4C400]/10 transition rounded-lg">
                <span class="guest-label text-[#1F8DBF]">Walk-in Bookings</span>
                <span class="guest-value text-[#1E88B6]">{{ guests.walkins }}</span>
              </div>
              <div class="guest-metric hover:bg-[#F4C400]/10 transition rounded-lg">
                <span class="guest-label text-[#1F8DBF]">Online Bookings</span>
                <span class="guest-value text-[#1E88B6]">{{ guests.online }}</span>
              </div>
            </div>
          </div>

          <!-- Expenses & Net Income -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-money-bill-wave mr-2 text-[#1F8DBF]"></i>Expenses & Net Income
              <span class="ml-2 text-xs text-[#1F8DBF] opacity-60" title="Financial summary">(info)</span>
            </h2>
            <p class="text-[#1E88B6] text-sm mb-3 opacity-70">Financial summary for the period.</p>
            <div class="finance-grid">
              <div class="finance-metric hover:bg-[#F4C400]/10 transition rounded-lg">
                <span class="finance-label text-[#1F8DBF]">Total Expenses</span>
                <span class="finance-value text-[#F4C400]">₱{{ expenses?.toLocaleString() }}</span>
              </div>
              <div class="finance-metric hover:bg-[#F4C400]/10 transition rounded-lg">
                <span class="finance-label text-[#1F8DBF]">Net Income</span>
                <span class="finance-value text-[#1F8DBF]">₱{{ netIncome?.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Observations & Recommendations -->
          <div class="card p-5 mb-6 shadow-md">
            <h2 class="font-bold text-lg mb-1 flex items-center"><i class="fas fa-lightbulb mr-2 text-[#F4C400]"></i>Observations & Recommendations
              <span class="ml-2 text-xs text-[#1F8DBF] opacity-60" title="Insights and suggestions">(info)</span>
            </h2>
            <p class="text-[#1E88B6] text-sm mb-3 opacity-70">Insights and suggestions to improve performance.</p>
            <ul class="recommend-list">
              <li class="text-[#1F8DBF]">Room occupancy is higher every Saturday.</li>
              <li class="text-[#1F8DBF]">Weekday promotions are recommended.</li>
              <li class="text-[#1F8DBF]">Top-selling food item: <span class="text-[#F4C400] font-semibold" v-if="topItems[0]">{{ topItems[0].name }}</span></li>
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
/* Modern Sales Report Styles - Tropical Resort Palette */
.sales-report {
  max-width: 900px;
  margin: 2.5rem auto;
  background: #f8fafc;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(31, 141, 191, 0.1);
  padding: 2.5rem 2rem 2rem 2rem;
  font-family: 'Segoe UI', Arial, sans-serif;
}
.report-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1F8DBF;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.icon {
  font-size: 1.5rem;
  vertical-align: middle;
  color: #F4C400;
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
  box-shadow: 0 2px 8px rgba(31, 141, 191, 0.1);
  padding: 1.2rem 1.5rem;
  min-width: 180px;
  flex: 1 1 180px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  border: 1px solid rgba(31, 141, 191, 0.1);
}
.card-main {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: #fff;
  box-shadow: 0 4px 16px rgba(31, 141, 191, 0.3);
  border: none;
}
.card-label {
  font-size: 1rem;
  opacity: 0.9;
  color: inherit;
}
.card-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0.2rem;
  color: inherit;
}
.card-desc {
  font-size: 0.85rem;
  color: #1E88B6;
  margin-top: 0.2rem;
}
.card-main .card-desc {
  color: rgba(255, 255, 255, 0.8);
}
.section {
  margin-bottom: 2.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(31, 141, 191, 0.1);
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
  border: 1px solid rgba(31, 141, 191, 0.1);
}
.breakdown-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(31, 141, 191, 0.2);
}
.breakdown-table th, .breakdown-table td {
  padding: 0.7rem 1rem;
  text-align: left;
}
.breakdown-table th {
  background: #1F8DBF;
  color: #fff;
  font-weight: 600;
}
.breakdown-table tr:nth-child(even) {
  background: rgba(31, 141, 191, 0.05);
}
.top-items {
  margin: 1rem 0 0 1.2rem;
  padding: 0;
  list-style: decimal inside;
}
.item-name {
  font-weight: 500;
  color: #1F8DBF;
}
.item-count {
  color: #F4C400;
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
  color: #1F8DBF;
}
.trend-bar {
  flex: 1;
  background: rgba(31, 141, 191, 0.1);
  border-radius: 6px;
  height: 16px;
  overflow: hidden;
}
.trend-bar-inner {
  background: linear-gradient(90deg, #1F8DBF 60%, #F4C400 100%);
  height: 100%;
  border-radius: 6px;
}
.trend-sales {
  width: 110px;
  text-align: right;
  font-weight: 500;
  color: #F4C400;
}
.metrics-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 1.2rem;
}
.metric {
  background: rgba(31, 141, 191, 0.05);
  border-radius: 8px;
  padding: 1rem 1.2rem;
  min-width: 140px;
  flex: 1 1 140px;
  text-align: center;
  border: 1px solid rgba(31, 141, 191, 0.1);
}
.metric-label {
  font-size: 1rem;
  color: #1F8DBF;
}
.metric-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1E88B6;
}
.guest-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 1.2rem;
}
.guest-metric {
  background: rgba(31, 141, 191, 0.05);
  border-radius: 8px;
  padding: 1rem 1.2rem;
  min-width: 140px;
  flex: 1 1 140px;
  text-align: center;
  border: 1px solid rgba(31, 141, 191, 0.1);
}
.guest-label {
  font-size: 1rem;
  color: #1F8DBF;
}
.guest-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1E88B6;
}
.finance-grid {
  display: flex;
  gap: 2rem;
  margin-top: 1.2rem;
}
.finance-metric {
  background: rgba(31, 141, 191, 0.05);
  border-radius: 8px;
  padding: 1rem 1.2rem;
  min-width: 180px;
  flex: 1 1 180px;
  text-align: center;
  border: 1px solid rgba(31, 141, 191, 0.1);
}
.finance-label {
  font-size: 1rem;
  color: #1F8DBF;
}
.finance-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: #F4C400;
}
.recommend-list {
  margin: 1rem 0 0 1.2rem;
  padding: 0;
  list-style: disc inside;
}
.recommend-list li {
  color: #1F8DBF;
  margin-bottom: 0.3rem;
}
.loading {
  color: #1F8DBF;
  font-size: 1.2rem;
  text-align: center;
  margin: 2rem 0;
}
.error {
  color: #F4C400;
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