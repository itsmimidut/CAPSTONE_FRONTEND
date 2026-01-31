<template>
  <div class="action-buttons">
    <button 
      v-for="action in actions"
      :key="action.action"
      @click="$emit('action', action.action)"
      :class="['btn-action', action.class]"
      :title="action.label"
    >
      <i :class="action.icon"></i>
    </button>
  </div>
</template>

<script setup>
defineProps({
  actions: Array,
})

defineEmits(['action'])
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-action {
  border: none;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-action.approve { background: linear-gradient(135deg, #22C55E, #16a34a); }
.btn-action.pay { background: linear-gradient(135deg, #F59E0B, #d97706); }
.btn-action.edit { background: linear-gradient(135deg, #3B82F6, #2563eb); }
.btn-action.delete { background: linear-gradient(135deg, #EF4444, #dc2626); }
</style>