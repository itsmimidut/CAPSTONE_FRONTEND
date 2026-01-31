<template>
  <div class="stats-grid">
    <div 
      v-for="stat in stats" 
      :key="stat.label"
      class="stat-card"
      :class="stat.type"
    >
      <small>{{ stat.label }}</small>
      <h3>{{ stat.value }}</h3>
      <div class="progress-bar mt-2">
        <div 
          class="progress-fill" 
          :style="{ width: stat.progress + '%' }"
        ></div>
      </div>
      <div class="stat-footer">
        <span :class="stat.trend > 0 ? 'text-green-600' : 'text-red-600'">
          <i :class="stat.trend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          {{ Math.abs(stat.trend) }}%
        </span>
        <span class="text-gray-500 text-xs">vs last month</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Array,
    default: () => [
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
  }
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
  grid-template-columns: 1fr 1fr;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background: linear-gradient(135deg, white 0%, #f8fdf9 100%);
  border-radius: 0.75rem;
  padding: 1.25rem;
  border-left: 4px solid #63B3ED;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.stat-card.revenue {
  border-left-color: #10B981;
}

.stat-card.bookings {
  border-left-color: #63B3ED;
}

.stat-card.occupancy {
  border-left-color: #C2A68C;
}

.stat-card.guests {
  border-left-color: #F59E0B;
}

.stat-card small {
  color: #6B7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-card h3 {
  margin: 0.5rem 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
}

.progress-bar {
  height: 8px;
  border-radius: 4px;
  background: rgba(43, 108, 176, 0.1);
  overflow: hidden;
  margin-top: 0.75rem;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #63B3ED 0%, #2B6CB0 100%);
  transition: width 0.6s ease;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .stat-card h3 {
    font-size: 1.5rem;
  }
}
</style>