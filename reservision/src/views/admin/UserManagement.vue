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
      @export="openExportPreview"
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

    <div v-if="showExportPreview" class="export-preview-overlay" @click.self="showExportPreview = false">
      <div class="export-preview-modal">
        <div class="export-preview-header">
          <h3>User Report Preview</h3>
          <button class="preview-close-btn" @click="showExportPreview = false" aria-label="Close preview">×</button>
        </div>

        <div class="export-preview-body">
          <div class="export-preview-meta">
            <span><strong>{{ exportPreviewRows.length }}</strong> users</span>
            <span>Role: <strong>{{ roleFilter === 'all' ? 'All Roles' : toRoleLabel(roleFilter) }}</strong></span>
            <span>Search: <strong>{{ searchQuery || 'None' }}</strong></span>
          </div>

          <div class="export-preview-grid">
            <section class="preview-card">
              <h4>Role Breakdown</h4>
              <table class="preview-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Count</th>
                    <th>Percent</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in exportRoleRows" :key="row.role">
                    <td>{{ row.role }}</td>
                    <td>{{ row.count }}</td>
                    <td>{{ row.percent }}</td>
                  </tr>
                  <tr v-if="!exportRoleRows.length">
                    <td colspan="3">No users found for current filters.</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section class="preview-card preview-card--wide">
              <h4>Users List</h4>
              <div class="preview-table-wrap">
                <table class="preview-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in exportPreviewRows" :key="user.id">
                      <td>{{ user.name || 'N/A' }}</td>
                      <td>{{ user.email || 'N/A' }}</td>
                      <td>{{ toRoleLabel(user.role) }}</td>
                      <td>{{ user.phone || '-' }}</td>
                    </tr>
                    <tr v-if="!exportPreviewRows.length">
                      <td colspan="4">No users found for current filters.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <div class="export-preview-footer">
          <button class="btn-secondary" @click="showExportPreview = false">Cancel</button>
          <button class="btn-primary" @click="exportUsers">Download Excel</button>
        </div>
      </div>
    </div>
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
const showExportPreview = ref(false);
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
    const name = String(user.name || '').toLowerCase();
    const email = String(user.email || '').toLowerCase();
    const matchesQuery = !query || name.includes(query) || email.includes(query);
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

const exportPreviewRows = computed(() => filteredUsers.value);

const exportRoleRows = computed(() => {
  const rows = exportPreviewRows.value;
  const roleCounts = rows.reduce((acc, user) => {
    const role = String(user.role || 'unknown').toLowerCase();
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(roleCounts)
    .map(([role, count]) => ({
      role: toRoleLabel(role),
      count,
      percent: rows.length ? `${((count / rows.length) * 100).toFixed(2)}%` : '0.00%'
    }))
    .sort((a, b) => b.count - a.count);
});

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

function openExportPreview() {
  if (!exportPreviewRows.value.length) {
    alert('No users found for current filters.');
    return;
  }
  showExportPreview.value = true;
}

function toRoleLabel(role) {
  const value = String(role || '').toLowerCase();
  if (value === 'restaurantstaff') return 'Restaurant Staff';
  if (value === 'receptionist') return 'Receptionist';
  if (value === 'admin') return 'Admin';
  if (value === 'customer') return 'Customer';
  return role || 'N/A';
}

async function exportUsers() {
  try {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Eduardo's Resort";
    workbook.created = new Date();

    const ws = workbook.addWorksheet('User Report', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 }
    });

    ws.columns = [
      { width: 24 },
      { width: 30 },
      { width: 22 },
      { width: 20 },
      { width: 18 },
      { width: 12 }
    ];

    const C_DARK_BLUE = 'FF0C3B5E';
    const C_LOGO_BG = 'FF0C3B5E';
    const C_HDR_BG = 'FFE8F4FD';
    const C_TBL_HDR = 'FFF0F6FB';
    const C_CARD_BDR = 'FFDCE8F3';
    const C_WHITE = 'FFFFFFFF';
    const C_ROW_ALT = 'FFF8FBFF';
    const C_GREY_TEXT = 'FF64748B';

    const bdr = c => ({ style: 'thin', color: { argb: c } });
    const cardBorder = { top: bdr(C_CARD_BDR), bottom: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR) };

    const secHdr = (cell, text) => {
      cell.value = text;
      cell.font = { bold: true, size: 10, color: { argb: C_DARK_BLUE }, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } };
      cell.border = cardBorder;
      cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    };

    const th = (cell, text, right = false) => {
      cell.value = text;
      cell.font = { bold: true, size: 10, color: { argb: C_DARK_BLUE }, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_TBL_HDR } };
      cell.border = cardBorder;
      cell.alignment = { horizontal: right ? 'right' : 'left', indent: right ? 0 : 1 };
    };

    const td = (cell, value, right = false, bold = false, alt = false) => {
      cell.value = value;
      cell.font = { size: 10, name: 'Calibri', bold };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: alt ? C_ROW_ALT : C_WHITE } };
      cell.border = cardBorder;
      cell.alignment = { horizontal: right ? 'right' : 'left', indent: right ? 0 : 1 };
    };

    const rows = filteredUsers.value;
    const roleCounts = rows.reduce((acc, user) => {
      const role = String(user.role || 'unknown').toLowerCase();
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const summaryCards = [
      { label: 'TOTAL USERS', value: String(rows.length) },
      { label: 'ADMINS', value: String(roleCounts.admin || 0) },
      { label: 'STAFF', value: String((roleCounts.restaurantstaff || 0) + (roleCounts.receptionist || 0)) },
      { label: 'CUSTOMERS', value: String(roleCounts.customer || 0) }
    ];

    let r = 1;

    ws.getCell(`A${r}`).value = 'ER';
    ws.getCell(`A${r}`).font = { bold: true, size: 14, color: { argb: C_WHITE }, name: 'Calibri' };
    ws.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_LOGO_BG } };
    ws.getCell(`A${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getCell(`A${r}`).border = cardBorder;

    ws.mergeCells(`B${r}:D${r}`);
    ws.getCell(`B${r}`).value = "Eduardo's Resort";
    ws.getCell(`B${r}`).font = { bold: true, size: 15, color: { argb: C_DARK_BLUE }, name: 'Calibri' };
    ws.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } };
    ws.getCell(`B${r}`).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    ws.getCell(`E${r}`).value = 'Generated';
    ws.getCell(`E${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' };
    ws.getCell(`E${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } };
    ws.getCell(`E${r}`).alignment = { horizontal: 'right' };

    ws.getCell(`F${r}`).value = new Date().toLocaleString('en-PH', {
      month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    ws.getCell(`F${r}`).font = { bold: true, size: 9, color: { argb: C_DARK_BLUE }, name: 'Calibri' };
    ws.getCell(`F${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } };
    ws.getCell(`F${r}`).alignment = { horizontal: 'right' };
    ws.getRow(r).height = 28;
    r++;

    ws.mergeCells(`A${r}:F${r}`);
    ws.getCell(`A${r}`).value = 'User Management Report';
    ws.getCell(`A${r}`).font = { italic: true, size: 10, color: { argb: C_GREY_TEXT }, name: 'Calibri' };
    ws.getCell(`A${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HDR_BG } };
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 };
    ws.getRow(r).height = 16;
    r++;

    ws.mergeCells(`A${r}:C${r}`);
    ws.getCell(`A${r}`).value = `Role Filter: ${roleFilter.value === 'all' ? 'All Roles' : toRoleLabel(roleFilter.value)}`;
    ws.getCell(`A${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' };
    ws.getCell(`A${r}`).alignment = { horizontal: 'left', indent: 1 };
    ws.mergeCells(`D${r}:F${r}`);
    ws.getCell(`D${r}`).value = `Search: ${searchQuery.value || 'None'}`;
    ws.getCell(`D${r}`).font = { size: 9, color: { argb: C_GREY_TEXT }, name: 'Calibri' };
    ws.getCell(`D${r}`).alignment = { horizontal: 'left', indent: 1 };
    r++;

    r++;

    const cardCols = ['A', 'B', 'C', 'D'];

    summaryCards.forEach(({ label }, i) => {
      const cell = ws.getCell(`${cardCols[i]}${r}`);
      cell.value = label;
      cell.font = { size: 8, color: { argb: C_GREY_TEXT }, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } };
      cell.border = { top: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR), bottom: { style: 'hair', color: { argb: C_CARD_BDR } } };
      cell.alignment = { horizontal: 'left', indent: 1 };
    });
    ws.getRow(r).height = 14;
    r++;

    summaryCards.forEach(({ value }, i) => {
      const cell = ws.getCell(`${cardCols[i]}${r}`);
      cell.value = value;
      cell.font = { bold: true, size: 12, color: { argb: C_DARK_BLUE }, name: 'Calibri' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_WHITE } };
      cell.border = { bottom: bdr(C_CARD_BDR), left: bdr(C_CARD_BDR), right: bdr(C_CARD_BDR), top: { style: 'hair', color: { argb: C_CARD_BDR } } };
      cell.alignment = { horizontal: 'left', indent: 1, vertical: 'middle' };
    });
    ws.getRow(r).height = 22;
    r++;

    r++;

    ws.mergeCells(`A${r}:F${r}`);
    secHdr(ws.getCell(`A${r}`), 'Role Breakdown');
    ws.getRow(r).height = 16;
    r++;

    th(ws.getCell(`A${r}`), 'Role');
    th(ws.getCell(`B${r}`), 'Count', true);
    th(ws.getCell(`C${r}`), 'Percent', true);
    r++;

    const roleRows = Object.entries(roleCounts)
      .map(([role, count]) => ({ role: toRoleLabel(role), count }))
      .sort((a, b) => b.count - a.count);

    roleRows.forEach((row, i) => {
      const alt = i % 2 === 1;
      const pct = rows.length ? `${((row.count / rows.length) * 100).toFixed(2)}%` : '0.00%';
      td(ws.getCell(`A${r}`), row.role, false, false, alt);
      td(ws.getCell(`B${r}`), row.count, true, false, alt);
      td(ws.getCell(`C${r}`), pct, true, false, alt);
      r++;
    });

    if (!roleRows.length) {
      td(ws.getCell(`A${r}`), 'No users found for current filters');
      ws.mergeCells(`A${r}:C${r}`);
      r++;
    }

    r++;

    ws.mergeCells(`A${r}:F${r}`);
    secHdr(ws.getCell(`A${r}`), 'Users List');
    ws.getRow(r).height = 16;
    r++;

    th(ws.getCell(`A${r}`), 'Name');
    th(ws.getCell(`B${r}`), 'Email');
    th(ws.getCell(`C${r}`), 'Role');
    th(ws.getCell(`D${r}`), 'Phone');
    r++;

    rows.forEach((user, i) => {
      const alt = i % 2 === 1;
      td(ws.getCell(`A${r}`), user.name || 'N/A', false, false, alt);
      td(ws.getCell(`B${r}`), user.email || 'N/A', false, false, alt);
      td(ws.getCell(`C${r}`), toRoleLabel(user.role), false, false, alt);
      td(ws.getCell(`D${r}`), user.phone || '-', false, false, alt);
      r++;
    });

    if (!rows.length) {
      td(ws.getCell(`A${r}`), 'No users found for current filters');
      ws.mergeCells(`A${r}:D${r}`);
      r++;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `User_Management_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showExportPreview.value = false;
  } catch (error) {
    console.error('Failed to export user report:', error);
    alert('Failed to export user report. Please try again.');
  }
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
  padding : 8px 16px;
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
  padding: 8px 16px;
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

.export-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: .45rem;
  background: rgba(31, 141, 191, 0.55);
  backdrop-filter: blur(4px);
}

.export-preview-modal {
  background: #fff;
  border: 2px solid #F4C400;
  border-radius: 10px;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.35);
  width: min(1240px, 98vw);
  max-height: 96vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.export-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #1F8DBF;
  padding: 0.6rem 0.85rem;
}

.export-preview-header h3 {
  margin: 0;
  color: #1F8DBF;
  font-size: 0.92rem;
}

.preview-close-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.preview-close-btn:hover {
  background: #f9fafb;
}

.export-preview-body {
  padding: 0.65rem 0.85rem;
  overflow: hidden;
}

.export-preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-size: 0.72rem;
  color: #1e88b6;
  margin-bottom: 0.55rem;
}

.export-preview-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 0.5rem;
}

.preview-card {
  border: 1px solid #dbe7f1;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.preview-card h4 {
  margin: 0;
  padding: 0.45rem 0.58rem;
  border-bottom: 1px solid #e5edf5;
  font-size: 0.72rem;
  color: #1f8dbf;
  background: #f6fbff;
}

.preview-card--wide {
  min-width: 0;
}

.preview-table-wrap {
  max-height: none;
  overflow: hidden;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.68rem;
}

.preview-table th,
.preview-table td {
  border-bottom: 1px solid #edf2f7;
  padding: 0.3rem 0.4rem;
  text-align: left;
  color: #1e3a4f;
}

.preview-table th {
  background: #f0f8ff;
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.35px;
  color: #1f8dbf;
  position: sticky;
  top: 0;
  z-index: 1;
}

.export-preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem 0.7rem;
  border-top: 1px solid #e5edf5;
}

@media (min-width: 1024px) {
  .export-preview-body {
    zoom: 0.8;
  }
}

@media (max-width: 900px) {
  .export-preview-grid {
    grid-template-columns: 1fr;
  }
}

</style>