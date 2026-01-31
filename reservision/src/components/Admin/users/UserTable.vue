<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="users.length === 0">
          <td colspan="4" class="empty-state">No users found</td>
        </tr>
        <tr v-for="user in users" :key="user.id">
          <td>
            <div class="user-info">
              <div class="user-avatar">{{ getInitials(user.name) }}</div>
              <div class="user-details">
                <div class="title">{{ user.name }}</div>
                <div class="muted">{{ user.email }}</div>
              </div>
            </div>
          </td>
          <td>{{ user.email }}</td>
          <td>
            <select
              :value="user.role"
              @change="handleRoleChange(user.id, $event.target.value)"
              class="role-select"
            >
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Customer">Customer</option>
            </select>
          </td>
          <td>
            <div class="action-buttons">
              <div class="action-btn edit-btn" @click="$emit('edit', user)" title="Edit">
                <i class="fas fa-edit"></i>
              </div>
              <div class="action-btn delete-btn" @click="$emit('delete', user.id)" title="Deactivate">
                <i class="fas fa-trash"></i>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="totalPages > 1" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="$emit('page-change', currentPage - 1)"
      >
        Prev
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPage }"
        @click="$emit('page-change', page)"
      >
        {{ page }}
      </button>

      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="$emit('page-change', currentPage + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  users: {
    type: Array,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  totalUsers: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete', 'role-change', 'page-change']);

const visiblePages = computed(() => {
  const start = Math.max(1, props.currentPage - 2);
  const end = Math.min(props.totalPages, start + 4);
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

function getInitials(name) {
  return (name || '')
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';
}

function handleRoleChange(userId, newRole) {
  emit('role-change', { userId, newRole });
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(45, 74, 67, 0.08);
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 40rem;
}

th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

tr:hover {
  background: #f8fafc;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.user-avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.5rem;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #2B6CB0;
}

.user-details .title {
  font-weight: 500;
  font-size: 0.9375rem;
}

.user-details .muted {
  color: #6B8A7E;
  font-size: 0.8125rem;
}

.role-select {
  padding: 0.375rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 0.375rem;
}

.action-btn {
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.edit-btn {
  background: rgba(78, 205, 196, 0.1);
  color: #63B3ED;
}

.edit-btn:hover {
  background: #63B3ED;
  color: white;
}

.delete-btn {
  background: rgba(255, 107, 107, 0.1);
  color: #EF4444;
}

.delete-btn:hover {
  background: #EF4444;
  color: white;
}

.pagination {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e2e8f0;
}

.page-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;
}

.page-btn.active {
  background: #2B6CB0;
  color: white;
  border-color: #2B6CB0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>