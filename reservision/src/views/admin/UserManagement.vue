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

const API_URL = 'http://localhost:8000/api';
const PER_PAGE = 6;

const users = ref([]);
const searchQuery = ref('');
const roleFilter = ref('all');
const currentPage = ref(1);
const showUserModal = ref(false);
const showConfirmModal = ref(false);
const editingUser = ref(null);
const deletingUserId = ref(null);
const loading = ref(false);
const stats = ref({ total: 0, admins: 0, staff: 0, customers: 0 });
const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);

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
  total: stats.value.total,
  admins: stats.value.admins || stats.value.byRole?.admin || 0,
  staff: (stats.value.byRole?.restaurantstaff || 0) + (stats.value.byRole?.receptionist || 0),
  customers: stats.value.customers || stats.value.byRole?.customer || 0
}));

// API Functions
async function fetchUsers() {
  try {
    loading.value = true;
    const response = await fetch(`${API_URL}/users`);
    const data = await response.json();
    
    if (data.success) {
      users.value = data.data.users.map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role, // Use DB role directly (admin, customer, restaurantstaff, receptionist)
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        postalCode: user.postalCode,
        profileImage: user.profileImage
      }));
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
    alert('Failed to load users. Please try again.');
  } finally {
    loading.value = false;
  }
}

async function fetchStats() {
  try {
    const response = await fetch(`${API_URL}/users/stats`);
    const data = await response.json();
    
    if (data.success) {
      stats.value = data.stats;
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
}

function openAddUserModal() {
  editingUser.value = { name: '', email: '', role: 'customer', password: '' };
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

async function handleSaveUser(userData) {
  try {
    loading.value = true;
    
    // Split name into first and last name
    const nameParts = userData.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    if (userData.id) {
      // Edit existing user
      const response = await fetch(`${API_URL}/users/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: userData.email,
          phone: userData.phone || null,
          address: userData.address || null,
          city: userData.city || null,
          country: userData.country || null,
          postalCode: userData.postalCode || null
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update user');
      }
    } else {
      // Add new user
      if (!userData.password) {
        alert('Password is required for new users');
        return;
      }

      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: userData.email,
          phone: userData.phone || null,
          password: userData.password,
          role: userData.role // Use DB role directly
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }
    }

    // Refresh user list and stats
    await fetchUsers();
    await fetchStats();
    showUserModal.value = false;
  } catch (error) {
    console.error('Save user error:', error);
    alert(error.message || 'Failed to save user. Please try again.');
  } finally {
    loading.value = false;
  }
}

async function handleDeleteUser() {
  try {
    loading.value = true;
    
    const response = await fetch(`${API_URL}/users/${deletingUserId.value}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete user');
    }

    // Refresh user list and stats
    await fetchUsers();
    await fetchStats();
    showConfirmModal.value = false;
    
    // Adjust page if needed
    if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch (error) {
    console.error('Delete user error:', error);
    alert(error.message || 'Failed to delete user. Please try again.');
  } finally {
    loading.value = false;
  }
}

async function handleRoleChange({ userId, newRole }) {
  try {
    loading.value = true;
    
    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: newRole // Use DB role directly
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to change role');
    }

    // Refresh user list and stats
    await fetchUsers();
    await fetchStats();
  } catch (error) {
    console.error('Change role error:', error);
    alert(error.message || 'Failed to change user role. Please try again.');
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page) {
  currentPage.value = page;
}

function exportUsers() {
  const csv = [
    'name,email,role,phone',
    ...users.value.map(u => 
      `"${u.name.replace(/"/g, '""')}","${u.email.replace(/"/g, '""')}",${u.role},"${u.phone || ''}"`
    )
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

onMounted(async () => {
  await fetchUsers();
  await fetchStats();
});
</script>

<style scoped>
.user-management {
  padding: 20px;
  margin-left: 260px;
  margin-top: 90px; /* keeps content below fixed header */
  transition: padding 0.3s ease;
  background: linear-gradient(135deg, #1F8DBF/5 0%, #F4C400/5 100%);
  min-height: calc(100vh - 90px);
}

@media (max-width: 767px) {
  .user-management {
    margin-left: 0;
    padding: 20px;
    margin-top: 90px;
  }
}

/* Remove the extra white box styling */
.header-container {
  padding: 0;
  background: transparent;
  border: none;
  margin: 0;
}

/* Sidebar */
.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background: linear-gradient(165deg, #1F8DBF 0%, #1E88B6 100%);
  box-shadow: 2px 0 10px rgba(31, 141, 191, 0.2);
  border-right: 2px solid #F4C400;
  z-index: 1000;
}

body {
  overflow-x: hidden;
  background: #ffffff;
}

/* Stats Cards - Will be applied via the component */
:global(.stats-card) {
  background: white;
  border: 1px solid #1F8DBF/20;
  border-radius: 8px;
}

:global(.stats-card .stat-value) {
  color: #1F8DBF;
}

:global(.stats-card .stat-label) {
  color: #1E88B6/80;
}

/* Table Styles */
:global(.user-table) {
  border: 1px solid #1F8DBF/20;
}

:global(.user-table th) {
  background: #1F8DBF/10;
  color: #1F8DBF;
  font-weight: 600;
}

:global(.user-table td) {
  color: #1E88B6;
}

:global(.user-table tr:hover) {
  background: #F4C400/5;
}

/* Buttons */
:global(.btn-primary) {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  border: none;
  border-radius: 4px;
  transition: all 0.3s ease;
}

:global(.btn-primary:hover) {
  background: linear-gradient(135deg, #1E88B6 0%, #1F8DBF 100%);
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.3);
}

:global(.btn-secondary) {
  background: white;
  color: #1F8DBF;
  border: 1px solid #1F8DBF;
  border-radius: 4px;
  transition: all 0.3s ease;
}

:global(.btn-secondary:hover) {
  background: #F4C400;
  color: #1F8DBF;
  border-color: #F4C400;
}

/* Form Controls */
:global(.form-input) {
  border: 1px solid #1F8DBF/20;
  border-radius: 4px;
  color: #1E88B6;
}

:global(.form-input:focus) {
  border-color: #F4C400;
  outline: none;
  box-shadow: 0 0 0 2px #F4C400/20;
}

:global(.form-label) {
  color: #1F8DBF;
  font-weight: 500;
}

/* Badges/Role Tags */
:global(.role-badge) {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

:global(.role-badge.admin) {
  background: #1F8DBF/10;
  color: #1F8DBF;
  border: 1px solid #1F8DBF/30;
}

:global(.role-badge.staff) {
  background: #F4C400/10;
  color: #F4C400;
  border: 1px solid #F4C400/30;
}

:global(.role-badge.customer) {
  background: #1E88B6/10;
  color: #1E88B6;
  border: 1px solid #1E88B6/30;
}

/* Pagination */
:global(.pagination-button) {
  border: 1px solid #1F8DBF/20;
  color: #1F8DBF;
  background: white;
  border-radius: 4px;
}

:global(.pagination-button:hover) {
  background: #F4C400;
  color: #1F8DBF;
  border-color: #F4C400;
}

:global(.pagination-button.active) {
  background: #1F8DBF;
  color: white;
  border-color: #1F8DBF;
}

/* Modal */
:global(.modal-overlay) {
  background: rgba(31, 141, 191, 0.5);
  backdrop-filter: blur(4px);
}

:global(.modal-content) {
  background: white;
  border: 2px solid #F4C400;
  border-radius: 8px;
}

:global(.modal-header) {
  border-bottom: 2px solid #1F8DBF;
  color: #1F8DBF;
}

:global(.modal-footer) {
  border-top: 1px solid #1F8DBF/20;
}

/* Search/Filter Controls */
:global(.search-input) {
  border: 1px solid #1F8DBF/20;
  border-radius: 4px;
  color: #1E88B6;
}

:global(.search-input:focus) {
  border-color: #F4C400;
  outline: none;
}

:global(.filter-select) {
  border: 1px solid #1F8DBF/20;
  border-radius: 4px;
  color: #1F8DBF;
  background: white;
}

/* Export Button */
:global(.export-button) {
  background: #F4C400;
  color: #1F8DBF;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:global(.export-button:hover) {
  background: #1F8DBF;
  color: white;
}

/* Add User Button */
:global(.add-user-button) {
  background: #1F8DBF;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:global(.add-user-button:hover) {
  background: #F4C400;
  color: #1F8DBF;
}
</style>