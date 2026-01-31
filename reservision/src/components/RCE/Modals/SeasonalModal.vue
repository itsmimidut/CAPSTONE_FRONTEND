<!-- src/components/SeasonalPricingModal.vue -->
<template>
  <div class="modal" :class="{ show }" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <i class="fas fa-calendar-day"></i>
          Seasonal Pricing Setup
        </h3>
        <button class="close-modal" @click="close">×</button>
      </div>

      <div class="modal-body">
        <!-- Season Details -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-sun"></i>
            <div>
              <h4>Season Details</h4>
              <p>Configure seasonal pricing parameters</p>
            </div>
          </div>
          <div class="input-group">
            <div class="form-group">
              <label for="seasonName"><i class="fas fa-signature"></i> Season Name</label>
              <input
                id="seasonName"
                v-model="form.name"
                type="text"
                class="form-control"
                placeholder="e.g., Peak Season"
                required
              />
            </div>
            <div class="form-group">
              <label for="seasonMultiplier"><i class="fas fa-chart-line"></i> Price Multiplier</label>
              <input
                id="seasonMultiplier"
                v-model.number="form.multiplier"
                type="number"
                step="0.1"
                min="0.1"
                class="form-control"
                placeholder="e.g., 1.2"
                required
              />
            </div>
          </div>
        </div>

        <!-- Date Range -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-calendar-range"></i>
            <div>
              <h4>Date Range</h4>
              <p>Set seasonal period</p>
            </div>
          </div>
          <div class="date-inputs">
            <div class="date-group">
              <label>Start Date</label>
              <input type="date" v-model="form.startDate" class="form-control" required />
            </div>
            <div class="date-group">
              <label>End Date</label>
              <input type="date" v-model="form.endDate" class="form-control" required />
            </div>
          </div>
        </div>

        <!-- Apply To Room Types -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-bed"></i>
            <div>
              <h4>Apply To Room Types</h4>
              <p>Select which room types this affects</p>
            </div>
          </div>
          <div class="form-group">
            <label><i class="fas fa-layer-group"></i> Room Types</label>
            <input
              type="text"
              v-model="form.applyTo"
              class="form-control"
              placeholder="e.g., Suite,Cottage or all"
            />
            <div class="room-type-tags">
              <span
                v-for="tag in roomTypeTags"
                :key="tag.value"
                class="room-type-tag"
                :class="{ active: isTagActive(tag.value) }"
                @click="toggleTag(tag.value)"
              >
                {{ tag.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="form-section" style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe);">
          <div class="form-section-header">
            <i class="fas fa-info-circle"></i>
            <div>
              <h4>Information</h4>
              <p>How seasonal pricing works</p>
            </div>
          </div>
          <p style="color: var(--text-light); font-size: 0.875rem; line-height: 1.5; margin: 0;">
            This feature stores seasonal pricing locally so the UI can apply the multiplier when showing prices.
            Integrate with backend later to persist globally.
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-creative btn-creative-outline" @click="close">
          <i class="fas fa-times"></i> Cancel
        </button>
        <button class="btn-creative btn-creative-primary" @click="handleSave">
          <i class="fas fa-save"></i> Save Seasonal Pricing
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['update:show', 'save', 'close'])

const form = ref({
  name: '',
  multiplier: 1.2,
  startDate: '',
  endDate: '',
  applyTo: 'all'
})

const roomTypeTags = [
  { value: 'all', label: 'All Rooms' },
  { value: 'suite', label: 'Suite' },
  { value: 'cottage', label: 'Cottage' },
  { value: 'deluxe', label: 'Deluxe Room' },
  { value: 'standard', label: 'Standard Room' }
]

const isTagActive = (value) => {
  if (form.value.applyTo === 'all') return value === 'all'
  return form.value.applyTo.split(',').map(s => s.trim()).includes(value)
}

const toggleTag = (value) => {
  if (value === 'all') {
    form.value.applyTo = 'all'
    return
  }

  let current = form.value.applyTo === 'all' ? [] : form.value.applyTo.split(',').map(s => s.trim())
  if (current.includes(value)) {
    current = current.filter(t => t !== value)
  } else {
    current.push(value)
  }
  form.value.applyTo = current.length ? current.join(',') : 'all'
}

const resetForm = () => {
  const today = new Date().toISOString().split('T')[0]
  const future = new Date()
  future.setDate(future.getDate() + 90)
  const futureStr = future.toISOString().split('T')[0]

  form.value = {
    name: '',
    multiplier: 1.2,
    startDate: today,
    endDate: futureStr,
    applyTo: 'all'
  }
}

const validate = () => {
  if (!form.value.name.trim()) return 'Season name is required'
  if (!form.value.multiplier || form.value.multiplier <= 0) return 'Multiplier must be greater than 0'
  if (!form.value.startDate || !form.value.endDate) return 'Dates are required'
  if (new Date(form.value.startDate) > new Date(form.value.endDate)) {
    return 'End date must be after start date'
  }
  return null
}

const handleSave = () => {
  const error = validate()
  if (error) {
    alert(error)
    return
  }
  emit('save', { ...form.value })
  close()
}

const close = () => {
  emit('update:show', false)
  emit('close')
}

// Initialize dates when modal opens
watch(() => props.show, (val) => {
  if (val) resetForm()
})
</script>
<style scoped src="../../../assets/room.css"></style>