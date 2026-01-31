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

    <div class="flex gap-2 items-end">
      <button @click="$emit('apply')" class="btn">
        <i class="fas fa-filter mr-1"></i>Apply
      </button>
      <button @click="$emit('reset')" class="btn btn-outline">
        <i class="fas fa-redo mr-1"></i>Reset
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
</style>