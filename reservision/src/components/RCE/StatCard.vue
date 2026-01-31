<!-- src/components/StatCard.vue -->
<template>
  <div class="stat-card">
    <div class="stat-icon" :class="color">
      <i :class="`fas ${icon}`"></i>
    </div>
    <div class="stat-info">
      <h3>{{ value }}</h3>
      <p>{{ label }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  color: { type: String, required: true }, // blue, green, orange, yellow
  value: { type: [Number, String], required: true },
  label: { type: String, required: true }
})
</script>

<style scoped>
.stat-info {
  flex: 1;
}
.stat-info h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
}
.stat-info p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--text-light);
}
</style>
<style scoped src="../../assets/room.css"></style>