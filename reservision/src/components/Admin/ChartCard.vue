<template>
  <div class="dashboard-card">
    <div class="card-header">
      <h2 class="card-title">{{ title }}</h2>
    </div>
    <div class="card-body">
      <canvas :id="canvasId"></canvas>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
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

const createChart = () => {
  const ctx = document.getElementById(props.canvasId)
  
  if (ctx) {
    // Destroy existing chart if it exists
    if (chartInstance) {
      chartInstance.destroy()
    }
    
    chartInstance = new Chart(ctx, {
      type: props.type,
      data: props.data,
      options: props.options || {
        responsive: true,
        maintainAspectRatio: true
      }
    })
  }
}

onMounted(() => {
  createChart()
})

// Watch for data changes and update chart
watch(() => props.data, () => {
  if (chartInstance) {
    chartInstance.data = props.data
    chartInstance.update('active')
  }
}, { deep: true })

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #E2E8F0;
  transition: all 0.3s ease;
  overflow: hidden;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #CBD5E0;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #E2E8F0;
  background: linear-gradient(to bottom, #ffffff, #F7FAFC);
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 20px;
  background: linear-gradient(to bottom, #2B6CB0, #2C5282);
  border-radius: 2px;
}

.card-body {
  padding: 1.5rem;
  background: white;
}

canvas {
  max-height: 300px;
}
</style>