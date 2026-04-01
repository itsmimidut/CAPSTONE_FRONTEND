<template>
  <div v-if="show" class="promo-modal-backdrop" @click.self="close">
    <div class="promo-modal-shell">
      <div class="promo-modal-header">
        <div>
          <p class="promo-kicker">Admin Pricing Controls</p>
          <h3>{{ isEditing ? 'Edit Promo' : 'Create Promo' }}</h3>
          <p class="promo-subtitle">Build discounts manually and keep the final decision in admin hands.</p>
        </div>
        <button type="button" class="promo-close-btn" @click="close" aria-label="Close promo modal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="promo-modal-body">
        <div class="promo-form-grid">
          <section class="promo-card-section">
            <div class="section-title-row">
              <div class="section-icon"><i class="fas fa-pen-nib"></i></div>
              <div>
                <h4>Basic Information</h4>
                <p>Name the promo and describe how it should be used.</p>
              </div>
            </div>

            <div class="field-grid two-col">
              <label class="field-block field-block--wide">
                <span>Promo Name</span>
                <input v-model.trim="form.name" type="text" class="field-input" placeholder="Summer Escape Sale" />
              </label>
              <label class="field-block">
                <span>Promo Code <strong>*</strong></span>
                <input
                  :value="form.code"
                  type="text"
                  class="field-input"
                  placeholder="SUMMER20"
                  @input="handleCodeInput"
                />
                <small v-if="errors.code" class="field-error">{{ errors.code }}</small>
              </label>
            </div>

            <label class="field-block">
              <span>Description</span>
              <textarea v-model.trim="form.description" rows="4" class="field-input field-input--textarea" placeholder="20% off for room bookings during April."></textarea>
            </label>
          </section>

          <section class="promo-card-section">
            <div class="section-title-row">
              <div class="section-icon"><i class="fas fa-percent"></i></div>
              <div>
                <h4>Discount Setup</h4>
                <p>Define how the discount is calculated.</p>
              </div>
            </div>

            <div class="field-grid three-col">
              <label class="field-block">
                <span>Discount Type <strong>*</strong></span>
                <select v-model="form.discount_type" class="field-input">
                  <option value="percent">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
                <small v-if="errors.discount_type" class="field-error">{{ errors.discount_type }}</small>
              </label>

              <label class="field-block">
                <span>Discount Value <strong>*</strong></span>
                <input v-model.number="form.discount_value" type="number" min="0" step="0.01" class="field-input" placeholder="10" />
                <small v-if="errors.discount_value" class="field-error">{{ errors.discount_value }}</small>
              </label>

              <label class="field-block">
                <span>Minimum Subtotal</span>
                <input v-model.number="form.min_subtotal" type="number" min="0" step="0.01" class="field-input" placeholder="3000" />
              </label>
            </div>
          </section>

          <section class="promo-card-section">
            <div class="section-title-row">
              <div class="section-icon"><i class="fas fa-layer-group"></i></div>
              <div>
                <h4>Scope / Applicability</h4>
                <p>Choose where this promo can be applied.</p>
              </div>
            </div>

            <div class="field-grid two-col">
              <label class="field-block">
                <span>Applies To</span>
                <select v-model="form.applies_to_category" class="field-input">
                  <option value="all">All</option>
                  <option value="rooms">Rooms</option>
                  <option value="cottages">Cottages</option>
                  <option value="events">Events</option>
                  <option value="food">Food</option>
                </select>
              </label>

              <label class="field-block">
                <span>Specific Items</span>
                <select v-model="form.item_ids" multiple class="field-input field-input--multiselect">
                  <option v-for="item in filteredItemOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </option>
                </select>
                <small class="field-help">
                  {{ filteredItemOptions.length ? 'Optional. Leave blank to allow all items in the chosen scope.' : 'No item options loaded for this scope yet.' }}
                </small>
              </label>
            </div>
          </section>

          <section class="promo-card-section">
            <div class="section-title-row">
              <div class="section-icon"><i class="fas fa-calendar-check"></i></div>
              <div>
                <h4>Validity Period</h4>
                <p>Control when the promo starts, ends, and whether it is active now.</p>
              </div>
            </div>

            <div class="field-grid three-col">
              <label class="field-block">
                <span>Start Date</span>
                <input v-model="form.start_date" type="date" class="field-input" />
              </label>

              <label class="field-block">
                <span>End Date</span>
                <input v-model="form.end_date" type="date" class="field-input" />
                <small v-if="errors.date_range" class="field-error">{{ errors.date_range }}</small>
              </label>

              <label class="field-block field-block--toggle">
                <span>Active Toggle</span>
                <button type="button" class="toggle-pill" :class="{ 'toggle-pill--on': form.is_active }" @click="form.is_active = !form.is_active">
                  <span class="toggle-dot"></span>
                  <strong>{{ form.is_active ? 'Active' : 'Inactive' }}</strong>
                </button>
              </label>
            </div>
          </section>

          <section class="promo-card-section">
            <div class="section-title-row">
              <div class="section-icon"><i class="fas fa-shield-alt"></i></div>
              <div>
                <h4>Limits</h4>
                <p>Set optional restrictions for how often the promo may be used.</p>
              </div>
            </div>

            <div class="field-grid two-col">
              <label class="field-block">
                <span>Usage Limit</span>
                <input v-model.number="form.usage_limit" type="number" min="1" class="field-input" placeholder="Leave blank for unlimited" />
              </label>

              <div class="preview-card">
                <div class="preview-card__label">Promo Summary Preview</div>
                <div class="preview-card__text">{{ promoSummary }}</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div class="promo-modal-footer">
        <button type="button" class="btn-secondary" @click="close">Cancel</button>
        <button type="button" class="btn-primary btn-primary--ghost" @click="submitForm(true)">Save &amp; Activate</button>
        <button type="button" class="btn-primary" @click="submitForm(false)">Save Promo</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { computed, reactive, ref, watch } from 'vue'

const API_BASE = 'http://localhost:8000/api'

const props = defineProps({
  show: { type: Boolean, default: false },
  initialPromo: { type: Object, default: null },
  suggestedPromo: { type: Object, default: null },
  availableItems: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:show', 'close', 'save'])

const form = ref(createEmptyForm())
const errors = reactive({})
const loadedItems = ref([])

const isEditing = computed(() => Boolean(form.value.promo_id))

const filteredItemOptions = computed(() => {
  if (form.value.applies_to_category === 'all') return loadedItems.value
  return loadedItems.value.filter(item => item.category === form.value.applies_to_category)
})

const promoSummary = computed(() => {
  const valueText = form.value.discount_type === 'fixed'
    ? `₱${Number(form.value.discount_value || 0).toLocaleString()}`
    : `${Number(form.value.discount_value || 0)}%`
  const scopeMap = {
    all: 'all bookings',
    rooms: 'rooms',
    cottages: 'cottages',
    events: 'events',
    food: 'food orders'
  }
  const scopeText = scopeMap[form.value.applies_to_category] || 'selected bookings'
  const start = formatDateLabel(form.value.start_date)
  const end = formatDateLabel(form.value.end_date)
  const minSubtotal = Number(form.value.min_subtotal || 0) > 0
    ? `, minimum ₱${Number(form.value.min_subtotal).toLocaleString()}`
    : ''
  return `${valueText} off on ${scopeText}, valid from ${start} to ${end}${minSubtotal}`
})

watch(
  () => props.show,
  async (show) => {
    if (!show) return
    hydrateForm(props.initialPromo || props.suggestedPromo)
    clearErrors()
    await loadSelectableItems()
  },
  { immediate: true }
)

watch(
  () => props.initialPromo,
  (promo) => {
    if (props.show) hydrateForm(promo || props.suggestedPromo)
  }
)

watch(
  () => props.suggestedPromo,
  (promo) => {
    if (!props.initialPromo && props.show) hydrateForm(promo)
  }
)

watch(
  () => form.value.applies_to_category,
  () => {
    const validValues = new Set(filteredItemOptions.value.map(item => item.value))
    form.value.item_ids = form.value.item_ids.filter(itemId => validValues.has(itemId))
  }
)

function createEmptyForm() {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  return {
    promo_id: null,
    name: '',
    code: '',
    description: '',
    discount_type: 'percent',
    discount_value: 0,
    applies_to_category: 'all',
    item_ids: [],
    min_subtotal: 0,
    start_date: today,
    end_date: thirtyDaysLater,
    usage_limit: null,
    is_active: true
  }
}

function normalizePromo(source = null) {
  if (!source) return createEmptyForm()
  return {
    ...createEmptyForm(),
    promo_id: source.promo_id || source.id || null,
    name: source.name || '',
    code: String(source.code || '').toUpperCase(),
    description: source.description || '',
    discount_type: source.discount_type || source.type || 'percent',
    discount_value: Number(source.discount_value ?? source.value ?? 0),
    applies_to_category: source.applies_to_category || 'all',
    item_ids: normalizeItemIds(source.item_ids),
    min_subtotal: Number(source.min_subtotal ?? 0),
    start_date: source.start_date || source.startDate || createEmptyForm().start_date,
    end_date: source.end_date || source.endDate || createEmptyForm().end_date,
    usage_limit: source.usage_limit ?? source.usageLimit ?? null,
    is_active: source.is_active ?? true
  }
}

function normalizeItemIds(value) {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.map(String) : []
    } catch {
      return []
    }
  }
  return []
}

function hydrateForm(source) {
  form.value = normalizePromo(source)
}

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key])
}

function handleCodeInput(event) {
  form.value.code = String(event.target.value || '').toUpperCase()
}

function validateForm() {
  clearErrors()
  if (!form.value.code.trim()) errors.code = 'Promo code is required.'
  if (!form.value.discount_type) errors.discount_type = 'Discount type is required.'
  if (!(Number(form.value.discount_value) > 0)) errors.discount_value = 'Discount value must be greater than 0.'
  if (form.value.discount_type === 'percent' && Number(form.value.discount_value) > 100) {
    errors.discount_value = 'Percent discount cannot be greater than 100.'
  }
  if (form.value.start_date && form.value.end_date && new Date(form.value.end_date) < new Date(form.value.start_date)) {
    errors.date_range = 'End date must not be earlier than start date.'
  }
  return Object.keys(errors).length === 0
}

async function loadSelectableItems() {
  const localOptions = normalizeAvailableItems(props.availableItems)
  const remoteOptions = await fetchRemoteOptions()
  const merged = [...localOptions, ...remoteOptions]
  const unique = new Map()
  merged.forEach(item => {
    if (!unique.has(item.value)) unique.set(item.value, item)
  })
  loadedItems.value = Array.from(unique.values())
}

function normalizeAvailableItems(items) {
  return (items || []).map(item => {
    const category = normalizeCategory(item.category_type || item.category)
    return {
      value: String(item.item_id || item.id || `${category}:${item.name}`),
      label: item.name || item.room_number || 'Unnamed item',
      category
    }
  })
}

async function fetchRemoteOptions() {
  try {
    const [roomsRes, posRes] = await Promise.all([
      axios.get(`${API_BASE}/rooms`),
      axios.get(`${API_BASE}/pos/items`)
    ])

    const roomOptions = (roomsRes.data || []).map(item => ({
      value: String(item.item_id || item.id || `${normalizeCategory(item.category_type || item.category)}:${item.name}`),
      label: item.name || item.room_number || 'Unnamed item',
      category: normalizeCategory(item.category_type || item.category)
    }))

    const foodOptions = (posRes.data || [])
      .filter(item => String(item.category || '').toLowerCase() === 'restaurant')
      .map(item => ({
        value: String(item.menu_id || item.id || `food:${item.name}`),
        label: item.name || 'Food item',
        category: 'food'
      }))

    return [...roomOptions, ...foodOptions]
  } catch {
    return []
  }
}

function normalizeCategory(rawCategory) {
  const value = String(rawCategory || '').toLowerCase()
  if (value.includes('cottage')) return 'cottages'
  if (value.includes('event')) return 'events'
  if (value.includes('room')) return 'rooms'
  if (value.includes('food') || value.includes('restaurant')) return 'food'
  return 'all'
}

function submitForm(forceActivate) {
  if (forceActivate) form.value.is_active = true
  if (!validateForm()) return

  emit('save', {
    ...form.value,
    code: form.value.code.trim().toUpperCase(),
    item_ids: [...form.value.item_ids],
    usage_limit: form.value.usage_limit ? Number(form.value.usage_limit) : null,
    min_subtotal: Number(form.value.min_subtotal || 0),
    discount_value: Number(form.value.discount_value || 0)
  })
}

function close() {
  emit('update:show', false)
  emit('close')
}

function formatDateLabel(value) {
  if (!value) return 'no end date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'unspecified date'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.promo-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(12, 28, 45, 0.55);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.promo-modal-shell {
  width: min(1080px, 100%);
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 28px;
  background: linear-gradient(180deg, #fdfefe 0%, #f3f8fc 100%);
  box-shadow: 0 28px 80px rgba(12, 59, 94, 0.22);
  border: 1px solid rgba(12, 59, 94, 0.08);
}

.promo-modal-header,
.promo-modal-footer {
  padding: 1.2rem 1.4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.promo-modal-header {
  border-bottom: 1px solid rgba(12, 59, 94, 0.08);
  background: linear-gradient(135deg, #0c3b5e 0%, #135f96 100%);
  color: #fff;
}

.promo-kicker {
  margin: 0 0 0.25rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

.promo-modal-header h3 {
  margin: 0;
  font-size: 1.55rem;
  line-height: 1.1;
}

.promo-subtitle {
  margin: 0.35rem 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.95rem;
}

.promo-close-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
}

.promo-modal-body {
  overflow: auto;
  padding: 1.35rem;
}

.promo-form-grid {
  display: grid;
  gap: 1rem;
}

.promo-card-section {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(12, 59, 94, 0.08);
  border-radius: 22px;
  padding: 1rem;
  box-shadow: 0 8px 20px rgba(12, 59, 94, 0.05);
}

.section-title-row {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.section-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #eaf5ff 0%, #d9eefc 100%);
  color: #0c3b5e;
}

.section-title-row h4,
.section-title-row p {
  margin: 0;
}

.section-title-row h4 {
  color: #16324a;
  font-size: 1rem;
}

.section-title-row p {
  color: #657789;
  margin-top: 0.18rem;
  font-size: 0.88rem;
}

.field-grid {
  display: grid;
  gap: 0.9rem;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.three-col {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
}

.field-block--wide {
  grid-column: span 2;
}

.field-block span {
  font-size: 0.86rem;
  font-weight: 700;
  color: #27445b;
}

.field-block strong {
  color: #d14343;
}

.field-input {
  width: 100%;
  border: 1px solid #cfe0eb;
  border-radius: 14px;
  background: #fff;
  padding: 0.82rem 0.95rem;
  font-size: 0.95rem;
  color: #173247;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field-input:focus {
  border-color: #1f8dbf;
  box-shadow: 0 0 0 4px rgba(31, 141, 191, 0.14);
}

.field-input--textarea {
  resize: vertical;
  min-height: 120px;
}

.field-input--multiselect {
  min-height: 140px;
}

.field-help,
.field-error {
  font-size: 0.78rem;
}

.field-help {
  color: #70869a;
}

.field-error {
  color: #c0392b;
}

.field-block--toggle {
  justify-content: flex-end;
}

.toggle-pill {
  border: 1px solid #d6e6ef;
  background: #eef4f8;
  border-radius: 999px;
  padding: 0.4rem 0.55rem;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: #446074;
  cursor: pointer;
}

.toggle-pill--on {
  background: rgba(31, 141, 191, 0.12);
  border-color: rgba(31, 141, 191, 0.35);
  color: #0c3b5e;
}

.toggle-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #a1b7c7;
}

.toggle-pill--on .toggle-dot {
  background: #1f8dbf;
}

.preview-card {
  border-radius: 18px;
  border: 1px solid rgba(244, 196, 0, 0.38);
  background: linear-gradient(135deg, rgba(244, 196, 0, 0.12), rgba(255, 255, 255, 0.95));
  padding: 0.95rem 1rem;
}

.preview-card__label {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a6d00;
}

.preview-card__text {
  margin-top: 0.4rem;
  color: #27394a;
  font-size: 0.96rem;
  line-height: 1.45;
}

.promo-modal-footer {
  border-top: 1px solid rgba(12, 59, 94, 0.08);
  background: rgba(255, 255, 255, 0.86);
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 14px;
  padding: 0.82rem 1.1rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary {
  background: #eaf0f4;
  color: #294357;
}

.btn-primary {
  background: linear-gradient(135deg, #0c3b5e 0%, #1f8dbf 100%);
  color: #fff;
}

.btn-primary--ghost {
  background: linear-gradient(135deg, #f4c400 0%, #f2a900 100%);
  color: #1e2e3b;
}

@media (max-width: 900px) {
  .two-col,
  .three-col {
    grid-template-columns: 1fr;
  }

  .field-block--wide {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .promo-modal-backdrop {
    padding: 0.5rem;
  }

  .promo-modal-shell {
    max-height: calc(100vh - 1rem);
    border-radius: 22px;
  }

  .promo-modal-header,
  .promo-modal-footer,
  .promo-modal-body {
    padding: 1rem;
  }

  .promo-modal-footer {
    flex-wrap: wrap;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>