<template>
  <div class="stat-card" :class="$attrs.class">
    <p class="stat-label">{{ label }}</p>
    <p class="stat-count">{{ count }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  count: [Number, String],
})
</script>

<style scoped>
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.08);
  border: 1px solid #e2e8f0;
}

.stat-card.low-stock {
  border-left: 4px solid #EF4444;
}

.stat-card.good-stock {
  border-left: 4px solid #22C55E;
}

.stat-label {
  color: #718096;
  font-size: 0.95rem;
  margin: 0 0 0.5rem 0;
}

.stat-count {
  font-size: 2rem;
  font-weight: 700;
  color: #2D3748;
  margin: 0;
}

.stat-card.low-stock .stat-count {
  color: #EF4444;
}

.stat-card.good-stock .stat-count {
  color: #22C55E;
}
</style>