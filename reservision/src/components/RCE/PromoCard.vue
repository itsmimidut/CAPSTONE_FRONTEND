<!-- src/components/PromoCard.vue -->
<template>
  <div class="promo-card" :data-id="promo.id">
    <div class="promo-meta">
      <div class="promo-title">{{ promo.code }}</div>
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

    <div class="promo-desc">{{ promo.description }}</div>

    <div class="promo-footer">
      <span class="text-sm font-semibold">
        {{ promo.type === 'percent' ? `${promo.value}% OFF` : `$${promo.value} OFF` }}
      </span>
      <div class="flex gap-2">
        <button class="text-xs text-blue-600" @click="$emit('edit')">Edit</button>
        <button class="text-xs text-red-600" @click="$emit('delete')">Delete</button>
      </div>
    </div>

    <div class="text-xs text-gray-500 mt-2">
      {{ formatDate(promo.startDate) }} - {{ formatDate(promo.endDate) }} •
      {{ usageText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  promo: { type: Object, required: true }
})

defineEmits(['edit', 'delete'])

const isActive = computed(() => new Date(props.promo.endDate) >= new Date())

const usageText = computed(() => {
  if (!props.promo.usageLimit) return 'Unlimited uses'
  return `${props.promo.used || 0}/${props.promo.usageLimit} uses`
})

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString()
</script>
<style scoped src="../../assets/room.css"></style>