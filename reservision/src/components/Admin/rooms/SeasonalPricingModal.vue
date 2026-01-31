<template>
  <div class="overlay">
    <div class="modal">
      <h3>Seasonal Pricing</h3>

      <input v-model="season.name" placeholder="Season Name" />
      <input v-model.number="season.multiplier" type="number" step="0.1" />

      <div class="actions">
        <button @click="$emit('close')">Cancel</button>
        <button class="primary" @click="$emit('save', season)">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const season = reactive({
  name: '',
  multiplier: 1.2
})
</script>

<style scoped>
/* SAME STRUCTURE BUT ISOLATED */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 24px;
  width: 100%;
  max-width: 520px;
  border-radius: 20px;
}
</style>
