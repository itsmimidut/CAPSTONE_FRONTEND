<template>
  <div class="stats-grid">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="stat-card"
      :class="stat.type"
    >
      <div class="flex justify-between items-start">
        <div>
          <p class="text-xs text-gray-500 font-medium">{{ stat.label }}</p>
          <h3 class="text-xl font-bold text-gray-800 mt-1">{{ stat.value }}</h3>
        </div>
        <div
          class="stat-icon"
          :class="`bg-${stat.color}-50 text-${stat.color}-600`"
        >
          <i :class="stat.icon"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Array,
    required: true
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
  padding: 1rem;
  border-left: 4px solid #63B3ED;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.confirmed {
  border-left-color: #10B981;
}

.stat-card.pending {
  border-left-color: #F59E0B;
}

.stat-card.cancelled {
  border-left-color: #EF4444;
}

.stat-icon {
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
}
</style>