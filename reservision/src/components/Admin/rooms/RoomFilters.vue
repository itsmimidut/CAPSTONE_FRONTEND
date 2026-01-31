<template>
  <div class="page-controls">
    <div class="search-filter">
      <input
        v-model="localSearch"
        type="text"
        class="search-box"
        placeholder="Search rooms or promos..."
        @input="handleSearchChange"
      />
      <select
        v-model="localType"
        class="filter-select"
        @change="handleTypeChange"
      >
        <option value="all">All Types</option>
        <option value="Standard Room">Standard Room</option>
        <option value="Deluxe Room">Deluxe Room</option>
        <option value="Cottage">Cottage</option>
        <option value="Suite">Suite</option>
      </select>
      <select
        v-model="localStatus"
        class="filter-select"
        @change="handleStatusChange"
      >
        <option value="all">All Status</option>
        <option value="Available">Available</option>
        <option value="Occupied">Occupied</option>
        <option value="Under Maintenance">Maintenance</option>
      </select>
    </div>
    
    <div class="action-buttons">
      <button class="btn btn-primary" @click="$emit('add-room')">
        <i class="fas fa-plus"></i> Add New Room
      </button>
      <button class="btn btn-outline" @click="$emit('open-seasonal')">
        <i class="fas fa-calendar-day"></i> Seasonal Pricing
      </button>
      <button class="btn btn-secondary" @click="$emit('add-promo')">
        <i class="fas fa-plus"></i> New Promo
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoomStore } from '@/stores/roomStore'

defineEmits(['add-room', 'open-seasonal', 'add-promo'])

const roomStore = useRoomStore()

const localSearch = ref(roomStore.filters.search)
const localType = ref(roomStore.filters.type)
const localStatus = ref(roomStore.filters.status)

const handleSearchChange = () => {
  roomStore.setFilter('search', localSearch.value)
}

const handleTypeChange = () => {
  roomStore.setFilter('type', localType.value)
}

const handleStatusChange = () => {
  roomStore.setFilter('status', localStatus.value)
}
</script>

<style scoped>
.page-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.search-box,
.filter-select {
  padding: 0.625rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-box {
  width: 20rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.3-4.3'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 0.9375rem center;
  padding-left: 2.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 0.625rem;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #2B6CB0;
  color: white;
}

.btn-primary:hover {
  background: #1e4976;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #C2A68C;
  color: #1A2E28;
}

.btn-secondary:hover {
  background: #a08a72;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #6B8A7E;
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: #2B6CB0;
  color: #2B6CB0;
}

@media (max-width: 768px) {
  .search-box {
    width: 100%;
  }
  
  .page-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    width: 100%;
  }
  
  .btn {
    flex: 1;
  }
}
</style>