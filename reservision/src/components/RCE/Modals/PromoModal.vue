<!-- src/components/PromoFormModal.vue -->
<template>
  <div class="modal" :class="{ show }" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <i class="fas fa-gift"></i>
          <span>{{ editing ? 'Edit Promo' : 'Add New Promo' }}</span>
        </h3>
        <button class="close-modal" @click="close">×</button>
      </div>

      <div class="modal-body">
        <!-- Promo Code -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-ticket-alt"></i>
            <div>
              <h4>Promo Code</h4>
              <p>Create a unique promotion code</p>
            </div>
          </div>
          <div class="form-group">
            <label for="promoCode"><i class="fas fa-hashtag"></i> Code</label>
            <input
              id="promoCode"
              v-model="form.code"
              type="text"
              class="form-control"
              placeholder="e.g., SUMMER25"
              required
            />
          </div>
        </div>

        <!-- Type & Value -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-percentage"></i>
            <div>
              <h4>Type & Value</h4>
              <p>Set discount type and amount</p>
            </div>
          </div>
          <div class="input-group">
            <div class="form-group">
              <label for="promoType"><i class="fas fa-cog"></i> Type</label>
              <div class="select-wrapper">
                <select id="promoType" v-model="form.type" class="form-control">
                  <option value="percent">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="promoValue"><i class="fas fa-dollar-sign"></i> Value</label>
              <input
                id="promoValue"
                v-model.number="form.value"
                type="number"
                min="0"
                step="0.01"
                class="form-control"
                placeholder="e.g., 25"
                required
              />
              <div class="value-display">
                {{ form.type === 'percent' ? `${form.value || 0}% OFF` : `$${form.value || 0} OFF` }}
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-align-left"></i>
            <div>
              <h4>Description</h4>
              <p>Details about the promo</p>
            </div>
          </div>
          <div class="textarea-group">
            <textarea
              id="promoDesc"
              v-model="form.description"
              placeholder="Summer special discount for all room types..."
            ></textarea>
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- Date Range -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-calendar-alt"></i>
            <div>
              <h4>Date Range</h4>
              <p>Set promotion start and end dates</p>
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

        <!-- Usage Limit -->
        <div class="form-section">
          <div class="form-section-header">
            <i class="fas fa-chart-line"></i>
            <div>
              <h4>Usage Limit (optional)</h4>
              <p>Total uses allowed</p>
            </div>
          </div>
          <div class="form-group">
            <label for="promoUsage"><i class="fas fa-users"></i> Maximum Uses</label>
            <input
              id="promoUsage"
              v-model.number="form.usageLimit"
              type="number"
              min="1"
              class="form-control"
              placeholder="Leave empty for unlimited uses"
            />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-creative btn-creative-outline" @click="close">
          <i class="fas fa-times"></i> Cancel
        </button>
        <button class="btn-creative btn-creative-primary" @click="handleSave">
          <i class="fas fa-save"></i> Save Promo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  initialPromo: Object
})

const emit = defineEmits(['update:show', 'save', 'close'])

const form = ref({
  code: '',
  type: 'percent',
  value: null,
  description: '',
  startDate: '',
  endDate: '',
  usageLimit: null
})

const editing = ref(false)

watch(
  () => props.show,
  (val) => {
    if (val && !props.initialPromo) resetForm()
  }
)

watch(
  () => props.initialPromo,
  (promo) => {
    if (promo) {
      editing.value = true
      Object.assign(form.value, promo)
    }
  },
  { immediate: true }
)

const resetForm = () => {
  form.value = {
    code: '',
    type: 'percent',
    value: null,
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: null
  }
  editing.value = false
}

const validate = () => {
  if (!form.value.code?.trim()) return 'Code is required'
  if (!form.value.value || form.value.value <= 0) return 'Value must be greater than 0'
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
</script>
<style scoped src="../../../assets/room.css"></style>