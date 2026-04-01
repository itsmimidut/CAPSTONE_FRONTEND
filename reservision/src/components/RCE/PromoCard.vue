<!-- src/components/PromoCard.vue -->
<template>
  <div class="promo-card" :data-id="promo.promo_id || promo.id">
    <div class="promo-meta">
      <div>
        <div class="promo-title">{{ promo.name || promo.code }}</div>
        <div class="text-xs text-gray-500">{{ promo.code }}</div>
      </div>
      <div
        class="promo-badge"
        :style="{
          background: isActive ? 'var(--success)' : '#e5e7eb',
          color: isActive ? 'white' : '#6b7280'
        }"
      >
        {{ isActive ? 'Active' : 'Expired' }}
      </div>
    </div>

    <div class="promo-desc">{{ promo.description || 'No description provided.' }}</div>

    <div class="promo-footer">
      <span class="text-sm font-semibold">
        {{ discountLabel }}
      </span>
      <div class="flex gap-2">
        <button class="text-xs text-blue-600" @click="$emit('edit')">Edit</button>
        <button class="text-xs text-red-600" @click="$emit('delete')">Delete</button>
      </div>
    </div>

    <div class="text-xs text-gray-500 mt-2">
      {{ scopeLabel }} • {{ formatDate(startDate) }} - {{ formatDate(endDate) }} • {{ usageText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  promo: { type: Object, required: true }
})

defineEmits(['edit', 'delete'])

const startDate = computed(() => props.promo.start_date || props.promo.startDate)
const endDate = computed(() => props.promo.end_date || props.promo.endDate)
const discountType = computed(() => props.promo.discount_type || props.promo.type || 'percent')
const discountValue = computed(() => Number(props.promo.discount_value ?? props.promo.value ?? 0))

const isActive = computed(() => {
  if (props.promo.is_active === false || props.promo.is_active === 0) return false
  if (!endDate.value) return true
  return new Date(endDate.value) >= new Date()
})

const discountLabel = computed(() => {
  return discountType.value === 'percent'
    ? `${discountValue.value}% OFF`
    : `₱${discountValue.value.toLocaleString()} OFF`
})

const scopeLabel = computed(() => {
  const scope = String(props.promo.applies_to_category || 'all')
  return `Applies to ${scope}`
})

const usageText = computed(() => {
  const usageLimit = props.promo.usage_limit ?? props.promo.usageLimit
  if (!usageLimit) return 'Unlimited uses'
  return `${props.promo.used || 0}/${usageLimit} uses`
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'Open-ended'
  const date = new Date(dateStr)
  return Number.isNaN(date.getTime()) ? 'Open-ended' : date.toLocaleDateString()
}
</script>
<style scoped src="../../assets/room.css"></style>