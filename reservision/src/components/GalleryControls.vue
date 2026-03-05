<template>
  <section class="gallery-controls">
    <div class="controls-container">
      <!-- Search Bar -->
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          placeholder="Search images (e.g., 'pool', 'cottage')..." 
          class="search-input"
        />
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
          <i :class="category.icon"></i>
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
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  border: 1px solid rgba(31, 141, 191, 0.1);
}

.controls-container {
  max-width: 1400px;
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
  
  .gallery-controls {
    padding: 1.5rem 2rem;
  }
}

/* Search Wrapper - Matching table management style */
.search-wrapper {
  flex: 1;
  min-width: 280px;
  max-width: 400px;
  display: flex;
  align-items: center;
  background: #F9FAFB;
  border-radius: 8px;
  border: 2px solid rgba(30, 136, 182, 0.2);
  transition: all 0.3s ease;
  padding: 0 0.75rem;
  height: 48px;
}

.search-wrapper:focus-within {
  border-color: #F2C200;
  box-shadow: 0 0 0 3px rgba(242, 194, 0, 0.15);
}

.search-icon {
  color: #F2C200;
  font-size: 0.95rem;
  margin-right: 0.75rem;
  width: 16px;
  text-align: center;
}

.search-input {
  border: none;
  background: transparent;
  padding: 0.75rem 0;
  flex: 1;
  font-size: 0.95rem;
  outline: none;
  color: #1E88B6;
  font-weight: 500;
  height: 100%;
}

.search-input::placeholder {
  color: rgba(30, 136, 182, 0.4);
  font-weight: normal;
}

/* Filter Categories */
.filter-categories {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-btn {
  padding: 0.65rem 1.5rem;
  background: white;
  border: 2px solid rgba(30, 136, 182, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1E88B6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.filter-btn i {
  color: #F2C200;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #F2C200;
  color: #1E88B6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 194, 0, 0.2);
  background: rgba(242, 194, 0, 0.05);
}

.filter-btn:hover i {
  color: #1F8DBF;
}

.filter-btn.active {
  background: linear-gradient(135deg, #1E88B6 0%, #1F8DBF 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(30, 136, 182, 0.3);
}

.filter-btn.active i {
  color: #F4C400;
}

.filter-btn.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(30, 136, 182, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .gallery-controls {
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .search-wrapper {
    max-width: 100%;
    min-width: auto;
  }

  .filter-categories {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    margin-bottom: -0.5rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: #F2C200 rgba(30, 136, 182, 0.1);
  }

  .filter-categories::-webkit-scrollbar {
    height: 4px;
  }

  .filter-categories::-webkit-scrollbar-track {
    background: rgba(30, 136, 182, 0.1);
    border-radius: 4px;
  }

  .filter-categories::-webkit-scrollbar-thumb {
    background: #F2C200;
    border-radius: 4px;
  }

  .filter-btn {
    padding: 0.5rem 1.25rem;
    font-size: 0.9rem;
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .gallery-controls {
    padding: 1rem;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    gap: 0.35rem;
  }

  .filter-btn i {
    font-size: 0.8rem;
  }

  .search-wrapper {
    height: 44px;
  }

  .search-input {
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }
}

/* Animation for filter buttons */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(242, 194, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(242, 194, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(242, 194, 0, 0);
  }
}

.filter-btn.active {
  animation: pulse 2s infinite;
}

/* Focus states for accessibility */
.filter-btn:focus-visible {
  outline: none;
  border-color: #F2C200;
  box-shadow: 0 0 0 3px rgba(242, 194, 0, 0.3);
}

.search-input:focus-visible {
  outline: none;
}

/* Print styles */
@media print {
  .gallery-controls {
    display: none;
  }
}
</style>