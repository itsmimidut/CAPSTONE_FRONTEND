<template>
  <div class="overlay">
    <div class="modal">
      <h3>Promo Setup</h3>

      <input v-model="promo.code" placeholder="Promo Code" />
      <input v-model.number="promo.value" type="number" placeholder="Value" />

      <div class="actions">
        <button @click="$emit('close')">Cancel</button>
        <button class="primary" @click="$emit('save', promo)">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const promo = reactive({
  code: '',
  value: 0
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal {
  background: white;
  width: 100%;
  max-width: 500px;
  padding: 24px;
  border-radius: 20px;
}

.modal h3 {
  margin-bottom: 16px;
}

.modal input {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.primary {
  background: #0ea5e9;
  color: white;
}
</style>
