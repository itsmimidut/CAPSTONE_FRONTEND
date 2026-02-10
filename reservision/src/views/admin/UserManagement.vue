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
