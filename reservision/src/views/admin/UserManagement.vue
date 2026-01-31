<template>
  <div class="user-management">
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

      <div class="header-container">
        <AdminHeader 
          title="User Management"
          subtitle="Manage roles, permissions & accounts"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

    <UserStatsGrid :stats="userStats" />

    <UserControls
      v-model:searchQuery="searchQuery"
      v-model:roleFilter="roleFilter"
      @add-user="openAddUserModal"
      @export="exportUsers"
    />

    <UserTable
      :users="paginatedUsers"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :totalUsers="filteredUsers.length"
      @edit="openEditModal"
      @delete="openDeleteModal"
      @role-change="handleRoleChange"
      @page-change="handlePageChange"
    />

    <UserModal
      v-model:show="showUserModal"
      :user="editingUser"
      :isEditing="isEditing"
      @save="handleSaveUser"
    />

    <ConfirmModal
      v-model:show="showConfirmModal"
      title="Deactivate Account?"
      message="This will remove the user from the list. You can re-add later if needed."
      confirmText="Deactivate"
      @confirm="handleDeleteUser"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminHeader from '../../components/admin/AdminHeader.vue';
import UserStatsGrid from '../../components/admin/users/UserStatsGrid.vue';
import UserControls from '../../components/admin/users/UserControls.vue';
import UserTable from '../../components/admin/users/UserTable.vue';
import UserModal from '../../components/admin/users/UserModal.vue';
import ConfirmModal from '../../components/admin/users/ConfirmModal.vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
const STORAGE_KEY = 'reservision_users_v1';
const PER_PAGE = 6;

const SAMPLE_USERS = [
  { id: generateId(), name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: generateId(), name: 'Jane Smith', email: 'jane@example.com', role: 'Staff' },
  { id: generateId(), name: 'Mark Reyes', email: 'mark@example.com', role: 'Customer' },
  { id: generateId(), name: 'Liza Cruz', email: 'liza@example.com', role: 'Customer' },
  { id: generateId(), name: 'Carlos Dela Torre', email: 'carlos@example.com', role: 'Staff' },
  { id: generateId(), name: 'Anna Santos', email: 'anna@example.com', role: 'Customer' },
  { id: generateId(), name: 'David Tan', email: 'david@example.com', role: 'Customer' },
  { id: generateId(), name: 'Maria Lopez', email: 'maria@example.com', role: 'Staff' },
  { id: generateId(), name: 'Peter Lim', email: 'peter@example.com', role: 'Admin' },
  { id: generateId(), name: 'Rosa Domingo', email: 'rosa@example.com', role: 'Customer' },
  { id: generateId(), name: 'Gina Flores', email: 'gina@example.com', role: 'Staff' },
  { id: generateId(), name: 'Alex Cruz', email: 'alex@example.com', role: 'Customer' }
];

const users = ref([]);
const searchQuery = ref('');
const roleFilter = ref('all');
const currentPage = ref(1);
const showUserModal = ref(false);
const showConfirmModal = ref(false);
const editingUser = ref(null);
const deletingUserId = ref(null);

const isEditing = computed(() => editingUser.value?.id != null);

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const role = roleFilter.value;

  return users.value.filter(user => {
    const matchesQuery = !query || 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query);
    const matchesRole = role === 'all' || user.role === role;
    return matchesQuery && matchesRole;
  });
});

const totalPages = computed(() => 
  Math.max(1, Math.ceil(filteredUsers.value.length / PER_PAGE))
);

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * PER_PAGE;
  return filteredUsers.value.slice(start, start + PER_PAGE);
});

const userStats = computed(() => ({
  total: users.value.length,
  admins: users.value.filter(u => u.role === 'Admin').length,
  staff: users.value.filter(u => u.role === 'Staff').length,
  customers: users.value.filter(u => u.role === 'Customer').length
}));

function generateId() {
  return 'u' + Math.random().toString(36).slice(2, 9);
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_USERS));
      return SAMPLE_USERS.slice();
    }
    return JSON.parse(raw);
  } catch (e) {
    return SAMPLE_USERS.slice();
  }
}

function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users.value));
}

function openAddUserModal() {
  editingUser.value = { name: '', email: '', role: 'Customer' };
  showUserModal.value = true;
}

function openEditModal(user) {
  editingUser.value = { ...user };
  showUserModal.value = true;
}

function openDeleteModal(userId) {
  deletingUserId.value = userId;
  showConfirmModal.value = true;
}

function handleSaveUser(userData) {
  if (userData.id) {
    // Edit existing user
    const index = users.value.findIndex(u => u.id === userData.id);
    if (index !== -1) {
      users.value[index] = userData;
    }
  } else {
    // Add new user
    users.value.unshift({ ...userData, id: generateId() });
  }
  saveUsers();
  showUserModal.value = false;
}

function handleDeleteUser() {
  users.value = users.value.filter(u => u.id !== deletingUserId.value);
  saveUsers();
  showConfirmModal.value = false;
  
  // Adjust page if needed
  if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
    currentPage.value--;
  }
}

function handleRoleChange({ userId, newRole }) {
  const user = users.value.find(u => u.id === userId);
  if (user) {
    user.role = newRole;
    saveUsers();
  }
}

function handlePageChange(page) {
  currentPage.value = page;
}

function exportUsers() {
  const csv = [
    'name,email,role',
    ...users.value.map(u => 
      `"${u.name.replace(/"/g, '""')}","${u.email.replace(/"/g, '""')}",${u.role}`
    )
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'users.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

onMounted(() => {
  users.value = loadUsers();
});
</script>

<style scoped>
.user-management {
  padding: 20px;
  margin-left: 260px;
  transition: padding 0.3s ease;
}

@media (max-width: 767px) {
  .user-management {
    margin-left: 0;
    padding: 20px;
  }
}

/* Ensure sidebar stays fixed */
.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background-color: #fff;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  z-index: 1000;
}

/* Optional: prevent content from overlapping sidebar */
body {
  overflow-x: hidden;
}

.header-container {
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  top: 0;
  z-index: 50;
  margin-bottom: 10px;
}

</style>
