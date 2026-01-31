<template>
  <span :class="['status-badge', statusClass]">
    {{ statusLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: String,
})

const statusClass = computed(() => {
  const status = props.status?.toLowerCase()
  const classMap = {
    'occupied': 'occupied',
    'available': 'available',
    'reserved': 'reserved',
    'preparing': 'preparing',
    'ready': 'ready',
    'pending': 'pending',
    'low': 'low',
    'good': 'good',
    'unavailable': 'unavailable',
  }
  return classMap[status] || 'default'
})

const statusLabel = computed(() => {
  return props.status?.charAt(0).toUpperCase() + props.status?.slice(1)
})
</script>

<style scoped>
.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  display: inline-block;
}

.occupied { background: #fee2e2; color: #991b1b; }
.available { background: #dcfce7; color: #166534; }
.reserved { background: #dbeafe; color: #1e40af; }
.preparing { background: #fef3c7; color: #92400e; }
.ready { background: #dcfce7; color: #166534; }
.pending { background: #f3f4f6; color: #374151; }
.low { background: #fee2e2; color: #991b1b; }
.good { background: #dcfce7; color: #166534; }
.unavailable { background: #fee2e2; color: #991b1b; }
.default { background: #f3f4f6; color: #374151; }
</style>
