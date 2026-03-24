<template>
  <div class="filters">
    <div class="filter-group">
      <label>From</label>
      <input
        type="date"
        :value="from"
        @input="$emit('update:from', $event.target.value)"
      />
    </div>

    <div class="filter-group">
      <label>To</label>
      <input
        type="date"
        :value="to"
        @input="$emit('update:to', $event.target.value)"
      />
    </div>

    <div class="filter-group">
      <label>Status</label>
      <select
        :value="status"
        @change="$emit('update:status', $event.target.value)"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="checked_in">Checked In</option>
        <option value="checked_out">Checked Out</option>
        <option value="cancelled">Cancelled</option>
        <option value="no_show">No Show</option>
      </select>
    </div>

    <div class="filter-group search-box">
      <label>Search</label>
      <i class="fas fa-search"></i>
      <input
        type="text"
        :value="search"
        @input="$emit('update:search', $event.target.value)"
        placeholder="Name, email, code..."
      />
    </div>

    <div class="action-buttons">
      <button @click="$emit('apply')" class="btn btn-apply">
        <i class="fas fa-filter"></i>
        <span>Apply</span>
      </button>

      <button @click="$emit('reset')" class="btn btn-reset">
        <i class="fas fa-rotate-left"></i>
        <span>Reset</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  search: String,
  status: String,
  from: String,
  to: String
})

defineEmits(['update:search', 'update:status', 'update:from', 'update:to', 'apply', 'reset'])
</script>

<style scoped>
.filters {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .filters {
    grid-template-columns: repeat(5, 1fr);
  }
}

.filter-group label {
  display: block;
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  transition: all 0.3s;
  
}

.filter-group i{
  position: absolute;
  left: 1rem;
  top: 65%;
  transform: translateY(-50%);
  color: #9CA3AF;
  pointer-events: none;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #63B3ED;
  box-shadow: 0 0 0 2px rgba(99, 179, 237, 0.2);
}

n

.btn {
  background: #2B6CB0;
  color: white;
  border: none;
  padding: 0.625rem 1rem;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn:hover {
  background: #1e40af;
}

.btn-outline {
  background: transparent;
  border: 1px solid #2B6CB0;
  color: #2B6CB0;
}

.btn-outline:hover {
  background: #EFF6FF;
}

/* BUTTON CONTAINER */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

/* BASE BUTTON */
.btn {
  padding: 0.65rem 1.2rem;
  border-radius: 0.7rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

/* APPLY BUTTON (PRIMARY) */
.btn-apply {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-apply:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);
  background: linear-gradient(135deg, #2563EB, #1D4ED8);
}

/* RESET BUTTON (SOFT / OUTLINE STYLE) */
.btn-reset {
  background: #F9FAFB;
  color: #374151;
  border: 1px solid #E5E7EB;
}

.btn-reset:hover {
  background: #EEF2FF;
  color: #1D4ED8;
  border-color: #C7D2FE;
  transform: translateY(-1px);
}

/* ICON STYLE */
.btn i {
  font-size: 0.8rem;
}

/* CLICK EFFECT */
.btn:active {
  transform: scale(0.97);
}
</style>