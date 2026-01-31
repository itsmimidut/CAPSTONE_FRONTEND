<template>
  <div class="dashboard-card p-5">
    <h2 class="text-lg font-bold mb-4">{{ title }}</h2>
    <canvas :id="canvasId"></canvas>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  title: String,
  canvasId: String,
  type: {
    type: String,
    default: 'line'
  },
  data: Object,
  options: Object
})

let chartInstance = null

onMounted(() => {
  const ctx = document.getElementById(props.canvasId)
  
  if (ctx) {
    chartInstance = new Chart(ctx, {
      type: props.type,
      data: props.data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: props.options?.legend?.display ?? false
          }
        },
        ...props.options
      }
    })
  }
})
</script>

<style scoped>
.dashboard-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(45,74,67,0.08);
  border: 1px solid rgba(125,161,142,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.dashboard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(45,74,67,0.12);
}
</style>