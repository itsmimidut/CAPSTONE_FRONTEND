<template>
  <section class="gallery-controls">
    <div class="controls-container">
      <!-- Search Bar -->
      <div class="search-bar">
        <input 
          type="text" 
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          placeholder="Search images (e.g., 'pool', 'cottage')..." 
        />
        <button type="button" aria-label="Search">
          <i class="fas fa-search"></i>
        </button>
      </div>

      <!-- Filter Categories -->
      <div class="filter-categories">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="$emit('update:activeFilter', category.id)"
          class="filter-btn"
          :class="{ active: activeFilter === category.id }"
        >
          <i :class="category.icon" class="mr-1"></i>
          {{ category.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  searchQuery: String,
  activeFilter: String
})

defineEmits(['update:searchQuery', 'update:activeFilter'])

const categories = [
  { id: 'all', label: 'All', icon: 'fas fa-th' },
  { id: 'resort', label: 'Resort', icon: 'fas fa-hotel' },
  { id: 'rooms', label: 'Cottages', icon: 'fas fa-home' },
  { id: 'pool', label: 'Pool', icon: 'fas fa-swimming-pool' },
  { id: 'restaurant', label: 'Dining', icon: 'fas fa-utensils' },
  { id: 'events', label: 'Events', icon: 'fas fa-calendar-alt' }
]
</script>

<style scoped>
.gallery-controls {
  background: white;
  padding: 2rem 1rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  margin-bottom: 2rem;
}

.controls-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .controls-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.search-bar {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 50px;
  overflow: hidden;
}

.search-bar input {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  font-size: 1rem;
  outline: none;
  background: #f8fafc;
}

.search-bar input:focus {
  background: white;
}

.search-bar button {
  background: linear-gradient(135deg, #2B6CB0, #1e40af);
  color: white;
  border: none;
  padding: 0 1.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-bar button:hover {
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
}

.filter-categories {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-btn {
  padding: 0.65rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.95rem;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.filter-btn:hover {
  border-color: #2B6CB0;
  color: #2B6CB0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.2);
}

.filter-btn.active {
  background: linear-gradient(135deg, #2B6CB0, #1e40af);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

@media (max-width: 640px) {
  .filter-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}
</style>