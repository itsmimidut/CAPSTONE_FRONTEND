<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
    <button
      v-for="action in actions"
      :key="action.label"
      @click="handleAction(action.key)"
      class="quick-action"
    >
      <i :class="action.icon" class="text-4xl mb-2" :style="{ color: action.color }"></i>
      <span class="text-sm font-medium">{{ action.label }}</span>
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['action'])

const actions = [
  {
    key: 'new-reservation',
    label: 'New Reservation',
    icon: 'fas fa-calendar-check',
    color: '#3B82F6'
  },
  {
    key: 'add-room',
    label: 'Add Room',
    icon: 'fas fa-bed',
    color: '#10B981'
  },
  {
    key: 'add-user',
    label: 'Add User',
    icon: 'fas fa-users',
    color: '#8B5CF6'
  },
  {
    key: 'generate-report',
    label: 'Generate Report',
    icon: 'fas fa-file-alt',
    color: '#F59E0B'
  }
]

const handleAction = (key) => {
  emit('action', key)
}
</script>

<style scoped>
.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  border-radius: 0.75rem;
  background: white;
  border: 1px solid rgba(125,161,142,0.1);
  transition: all 0.3s ease;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.quick-action:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #2B6CB0;
}

@media (max-width: 640px) {
  .quick-action {
    padding: 1rem 0.5rem;
  }
  
  .quick-action i {
    font-size: 2rem !important;
  }
  
  .quick-action span {
    font-size: 0.75rem;
  }
}
</style>