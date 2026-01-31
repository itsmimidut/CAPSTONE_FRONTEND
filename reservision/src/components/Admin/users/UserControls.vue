<template>
  <div class="controls">
    <div class="search-filter">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="search"
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          placeholder="Search users by name or email..."
        />
      </div>
      <select
        :value="roleFilter"
        @change="$emit('update:roleFilter', $event.target.value)"
        class="filter-select"
      >
        <option value="all">All Roles</option>
        <option value="Admin">Admin</option>
        <option value="Staff">Staff</option>
        <option value="Customer">Customer</option>
      </select>
    </div>
    <div class="action-buttons">
      <button class="btn btn-primary" @click="$emit('add-user')">
        <i class="fas fa-user-plus"></i> Add User
      </button>
      <button class="btn btn-secondary" @click="$emit('export')">
        <i class="fas fa-file-export"></i> Export
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  roleFilter: {
    type: String,
    default: 'all'
  }
});

defineEmits(['update:searchQuery', 'update:roleFilter', 'add-user', 'export']);
</script>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-filter {
  display: flex;
  gap: 0.75rem;
  flex: 1;
  min-width: 260px;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-box input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.search-box i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
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
  background: #63B3ED;
}

.btn-secondary {
  background: white;
  color: #1A2E28;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e6ebee;
}

@media (max-width: 768px) {
  .search-filter {
    flex-direction: column;
    width: 100%;
  }
  
  .action-buttons {
    width: 100%;
  }
  
  .action-buttons .btn {
    flex: 1;
  }
}
</style>