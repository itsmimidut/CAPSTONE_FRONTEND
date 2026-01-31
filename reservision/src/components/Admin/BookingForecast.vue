<template>
  <div class="dashboard-card p-5 mb-6">
    <h2 class="text-lg font-bold mb-4">Booking Forecast</h2>

    <!-- Input Form -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="text-sm font-medium block mb-1">Select Date</label>
        <input 
          v-model="predictDate"
          type="date" 
          class="input-field"
        />
      </div>
      <div>
        <label class="text-sm font-medium block mb-1">Today's Bookings</label>
        <input 
          v-model.number="todayBookings"
          type="number" 
          placeholder="e.g. 85" 
          class="input-field"
        />
      </div>
      <div class="flex items-end">
        <button 
          @click="generateForecast"
          :disabled="isLoading"
          class="btn w-full"
        >
          <i class="fas fa-chart-line mr-2"></i>
          {{ isLoading ? 'Generating...' : 'Generate Forecast' }}
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle mr-2"></i>
      {{ error }}
    </div>

    <!-- Main Prediction Result -->
    <div 
      v-if="prediction"
      class="prediction-result"
    >
      <div class="text-center md:text-left">
        <div class="text-2xl font-bold mb-2">Tomorrow's Forecast</div>
        <div class="text-6xl font-bold text-blue-700 my-4">
          {{ prediction.next_day.prediction }}
        </div>
        <div class="text-xl text-gray-600 mb-4">
          bookings on {{ formatDate(prediction.next_day.date) }}
        </div>
        <div class="metrics-row">
          <div class="metric">
            <span class="metric-label">MAE</span>
            <span class="metric-value">{{ prediction.mae.toFixed(1) }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">RMSE</span>
            <span class="metric-value">{{ prediction.rmse.toFixed(1) }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">R²</span>
            <span class="metric-value">{{ prediction.r2.toFixed(3) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 7-Day Forecast Chart -->
    <div v-if="prediction" class="mt-8">
      <h3 class="text-xl font-bold mb-4 text-gray-800">7-Day Booking Forecast</h3>
      <div class="chart-container">
        <canvas ref="chart7dayRef"></canvas>
      </div>
    </div>

    <!-- 30-Day Forecast Chart -->
    <div v-if="prediction" class="mt-8">
      <h3 class="text-xl font-bold mb-4 text-gray-800">30-Day Booking Trend</h3>
      <div class="chart-container">
        <canvas ref="chart30dayRef"></canvas>
      </div>
    </div>

    <!-- Raw Data (Collapsible) -->
    <details v-if="prediction" class="mt-6 text-sm">
      <summary class="cursor-pointer font-semibold text-blue-700 hover:text-blue-900">
        View Raw Prediction Data
      </summary>
      <div class="raw-data">
        <pre>{{ JSON.stringify(prediction, null, 2) }}</pre>
      </div>
    </details>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'

const predictDate = ref('')
const todayBookings = ref(85)
const isLoading = ref(false)
const error = ref(null)
const prediction = ref(null)
const chart7dayRef = ref(null)
const chart30dayRef = ref(null)

let chart7day = null
let chart30day = null

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const generateForecast = async () => {
  if (!predictDate.value) {
    error.value = 'Please select a date'
    return
  }

  if (isNaN(todayBookings.value) || todayBookings.value < 0) {
    error.value = 'Invalid bookings number'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const response = await axios.post('http://127.0.0.1:5000/predict', {
      date: predictDate.value,
      today_bookings: todayBookings.value
    })

    prediction.value = response.data

    // Render charts after data is loaded
    setTimeout(() => {
      renderCharts()
    }, 100)

  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to connect to Flask server. Make sure it\'s running on port 5000.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const renderCharts = () => {
  if (!prediction.value) return

  // 7-Day Chart
  const weekLabels = prediction.value.next_week.map(d => 
    d.date.slice(5).replace('-', '/')
  )
  const weekValues = prediction.value.next_week.map(d => d.pred)

  if (chart7day) chart7day.destroy()
  if (chart7dayRef.value) {
    chart7day = new Chart(chart7dayRef.value, {
      type: 'line',
      data: {
        labels: weekLabels,
        datasets: [{
          label: '7-Day Forecast',
          data: weekValues,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 7,
          pointHoverRadius: 10,
          pointBackgroundColor: '#1D4ED8'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    })
  }

  // 30-Day Chart
  const monthLabels = prediction.value.next_month.map(d => 
    d.date.slice(5).replace('-', '/')
  )
  const monthValues = prediction.value.next_month.map(d => d.pred)

  if (chart30day) chart30day.destroy()
  if (chart30dayRef.value) {
    chart30day = new Chart(chart30dayRef.value, {
      type: 'line',
      data: {
        labels: monthLabels,
        datasets: [{
          label: '30-Day Trend',
          data: monthValues,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139,92,246,0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true },
          x: { ticks: { maxTicksLimit: 15 } }
        }
      }
    })
  }
}

// Set default date to today
const today = new Date().toISOString().split('T')[0]
predictDate.value = today
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 0.625rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #2B6CB0;
  ring: 2px;
  ring-color: rgba(43, 108, 176, 0.2);
}

.btn {
  background: linear-gradient(135deg, #2B6CB0, #1e40af);
  color: white;
  border: none;
  padding: 0.625rem 1rem;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(43, 108, 176, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 1rem;
  background: #FEE2E2;
  border-left: 4px solid #EF4444;
  border-radius: 0.5rem;
  color: #991B1B;
  margin-bottom: 1rem;
}

.prediction-result {
  padding: 2rem;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-left: 4px solid #2563EB;
  border-radius: 0.75rem;
  margin-top: 1.5rem;
}

.metrics-row {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .metrics-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
}

.metric-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid rgba(125,161,142,0.1);
}

.raw-data {
  margin-top: 1rem;
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 0.5rem;
  border: 1px solid #E5E7EB;
  overflow-x: auto;
  max-height: 400px;
}

.raw-data pre {
  font-size: 0.75rem;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.dashboard-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(45,74,67,0.08);
  border: 1px solid rgba(125,161,142,0.1);
}
</style>