<template>
  <div class="period-selector">
    <div class="selector-header">
      <h3 class="selector-title">
        <i class="fas fa-calendar-alt"></i>
        Analytics Period
      </h3>
      <button 
        v-if="showCustomRange"
        @click="closeCustomRange"
        class="btn-close-custom"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Quick Period Buttons -->
    <div class="period-buttons" v-if="!showCustomRange">
      <button
        v-for="period in periods"
        :key="period.value"
        @click="selectPeriod(period.value)"
        :class="['period-btn', { active: selectedPeriod === period.value }]"
      >
        <i :class="period.icon"></i>
        <span>{{ period.label }}</span>
      </button>
      <button
        @click="openCustomRange"
        :class="['period-btn', { active: selectedPeriod === 'custom' }]"
      >
        <i class="fas fa-calendar-check"></i>
        <span>Custom</span>
      </button>
    </div>

    <!-- Custom Date Range Picker -->
    <div class="custom-range" v-if="showCustomRange">
      <div class="date-inputs">
        <div class="input-group">
          <label for="startDate">Start Date</label>
          <input
            id="startDate"
            type="date"
            v-model="customStart"
            :max="customEnd || today"
            class="date-input"
          />
        </div>
        <div class="input-group">
          <label for="endDate">End Date</label>
          <input
            id="endDate"
            type="date"
            v-model="customEnd"
            :min="customStart"
            :max="today"
            class="date-input"
          />
        </div>
      </div>
      <div class="custom-actions">
        <button @click="applyCustomRange" class="btn-apply">
          <i class="fas fa-check"></i>
          Apply
        </button>
        <button @click="closeCustomRange" class="btn-cancel">
          <i class="fas fa-times"></i>
          Cancel
        </button>
      </div>
    </div>

    <!-- Selected Range Display -->
    <div class="selected-range" v-if="displayRange">
      <i class="fas fa-info-circle"></i>
      <span>{{ displayRange }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['period-changed'])

const periods = [
  { value: 'day', label: 'Today', icon: 'fas fa-sun' },
  { value: 'week', label: 'Week', icon: 'fas fa-calendar-week' },
  { value: 'month', label: 'Month', icon: 'fas fa-calendar' },
  { value: 'year', label: 'Year', icon: 'fas fa-calendar-alt' }
]

const selectedPeriod = ref('month')
const showCustomRange = ref(false)
const customStart = ref('')
const customEnd = ref('')

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const displayRange = computed(() => {
  if (selectedPeriod.value === 'custom' && customStart.value && customEnd.value) {
    const start = new Date(customStart.value).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
    const end = new Date(customEnd.value).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
    return `${start} - ${end}`
  }
  
  const period = periods.find(p => p.value === selectedPeriod.value)
  if (period) {
    const now = new Date()
    switch (selectedPeriod.value) {
      case 'day':
        return now.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        })
      case 'week':
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        return `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      case 'month':
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      case 'year':
        return now.toLocaleDateString('en-US', { year: 'numeric' })
    }
  }
  
  return ''
})

const selectPeriod = (period) => {
  selectedPeriod.value = period
  showCustomRange.value = false
  customStart.value = ''
  customEnd.value = ''
  emit('period-changed', { period, startDate: null, endDate: null })
}

const openCustomRange = () => {
  showCustomRange.value = true
  selectedPeriod.value = 'custom'
  
  // Set default to current month
  const now = new Date()
  customEnd.value = now.toISOString().split('T')[0]
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  customStart.value = firstDay.toISOString().split('T')[0]
}

const closeCustomRange = () => {
  showCustomRange.value = false
  if (!customStart.value || !customEnd.value) {
    selectedPeriod.value = 'month'
    emit('period-changed', { period: 'month', startDate: null, endDate: null })
  }
}

const applyCustomRange = () => {
  if (customStart.value && customEnd.value) {
    showCustomRange.value = false
    emit('period-changed', { 
      period: 'custom', 
      startDate: customStart.value, 
      endDate: customEnd.value 
    })
  }
}
</script>

<style scoped>
.period-selector {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.selector-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.selector-title i {
  color: #2B6CB0;
}

.btn-close-custom {
  background: #F56565;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-close-custom:hover {
  background: #E53E3E;
  transform: scale(1.05);
}

.period-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.period-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #F7FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4A5568;
}

.period-btn i {
  font-size: 1.25rem;
  color: #718096;
}

.period-btn:hover {
  background: #EDF2F7;
  border-color: #CBD5E0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.period-btn.active {
  background: linear-gradient(135deg, #2B6CB0 0%, #2C5282 100%);
  border-color: #2B6CB0;
  color: white;
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

.period-btn.active i {
  color: white;
}

.custom-range {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4A5568;
}

.date-input {
  padding: 0.75rem;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: #2B6CB0;
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.1);
}

.custom-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-apply,
.btn-cancel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-apply {
  background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
  color: white;
}

.btn-apply:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.btn-cancel {
  background: #E2E8F0;
  color: #4A5568;
}

.btn-cancel:hover {
  background: #CBD5E0;
  transform: scale(1.05);
}

.selected-range {
  margin-top: 1rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #EBF8FF 0%, #E6FFFA 100%);
  border-left: 4px solid #2B6CB0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #2D3748;
}

.selected-range i {
  color: #2B6CB0;
}

@media (max-width: 768px) {
  .period-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .date-inputs {
    grid-template-columns: 1fr;
  }
  
  .custom-actions {
    flex-direction: column;
  }
  
  .btn-apply,
  .btn-cancel {
    width: 100%;
    justify-content: center;
  }
}
</style>
