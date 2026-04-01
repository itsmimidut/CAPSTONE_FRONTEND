<template>
  <div class="admin-dashboard">
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <AdminHeader 
      title="User Management"
      subtitle="Manage roles, permissions & accounts"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <main class="main-content">
      <div class="content-container">

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

      </div>
    </main>

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

    <div v-if="showExportPreview" class="sales-preview-overlay" @click.self="showExportPreview = false">
      <div class="sales-preview-modal">
        <div class="sales-preview-toolbar">
          <div>
            <h3>User Management Report</h3>
            <p>Review before downloading Excel</p>
          </div>
          <div class="sales-preview-actions">
            <button class="btn-download" @click="exportUsers">
              <i class="fas fa-download"></i>
              Download Excel
            </button>
            <button class="btn-preview" @click="printUserReportPreview">
              <i class="fas fa-print"></i>
              Print
            </button>
            <button class="btn-preview" @click="showExportPreview = false">
              <i class="fas fa-xmark"></i>
              Close
            </button>
          </div>
        </div>

        <div class="sales-preview-scroll">
          <article class="sales-report-print" id="user-report-print">
            <header class="srp-header">
              <div class="srp-logo">ER</div>
              <div>
                <h2>Eduardo's Resort</h2>
                <p>User Management Report</p>
              </div>
              <div class="srp-meta">
                <span>Generated</span>
                <strong>{{ reportGenAt }}</strong>
              </div>
            </header>

            <section class="srp-section">
              <div class="srp-title-row">
                <div>
                  <h3>User Report</h3>
                  <p>{{ exportPreviewRows.length }} users | Role: {{ roleFilter === 'all' ? 'All Roles' : toRoleLabel(roleFilter) }}</p>
                </div>
              </div>
            </section>

            <section class="srp-cards">
              <div class="srp-card">
                <span>Total</span>
                <strong>{{ exportPreviewRows.length }}</strong>
              </div>
              <div class="srp-card">
                <span>Admins</span>
                <strong>{{ userStats.admins }}</strong>
              </div>
              <div class="srp-card">
                <span>Staff</span>
                <strong>{{ userStats.staff }}</strong>
              </div>
              <div class="srp-card">
                <span>Customers</span>
                <strong>{{ userStats.customers }}</strong>
              </div>
            </section>

            <section class="srp-grid">
              <div class="srp-section">
                <h4>Role Breakdown</h4>
                <table class="srp-table">
                  <thead>
                    <tr><th>Role</th><th>Count</th><th>Percent</th></tr>
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
              </div>
              <div class="srp-section">
                <h4>Account Summary</h4>
                <table class="srp-table">
                  <thead>
                    <tr><th>Metric</th><th>Value</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Total Users</td><td>{{ exportPreviewRows.length }}</td></tr>
                    <tr><td>Admins</td><td>{{ userStats.admins }}</td></tr>
                    <tr><td>Staff</td><td>{{ userStats.staff }}</td></tr>
                    <tr><td>Customers</td><td>{{ userStats.customers }}</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="srp-section">
              <h4>Users List</h4>
              <table class="srp-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th></tr>
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
            </section>
          </article>
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
const reportGenAt = ref('');
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
  reportGenAt.value = new Date().toLocaleString('en-PH', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

function printUserReportPreview() {
  const el = document.getElementById('user-report-print');
  if (!el) return;
  const w = window.open('', '_blank', 'width=900,height=700');
  const styles = `
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #fff; color: #0f172a; margin: 0; padding: 8mm; }
    .sales-report-print { width: 100%; background: #fff; }
    .srp-header { display: grid; grid-template-columns: 52px 1fr auto; align-items: center; gap: 12px; padding: 10px 14px; background: #0c3b5e; color: #fff; border-radius: 6px 6px 0 0; margin-bottom: 10px; }
    .srp-logo { width: 44px; height: 44px; border-radius: 8px; background: #0c3b5e; color: #f4c400; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; border: 2px solid #f4c400; }
    .srp-header h2 { margin: 0; font-size: 15px; color: #fff; }
    .srp-header p { margin: 2px 0 0; font-size: 10px; color: #93c5fd; }
    .srp-meta { text-align: right; font-size: 9px; color: #93c5fd; }
    .srp-meta strong { display: block; color: #fde68a; }
    .srp-section { margin: 10px 0; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; }
    .srp-section h4 { margin: 0 0 8px; font-size: 11px; color: #0c3b5e; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .srp-title-row { display: flex; justify-content: space-between; align-items: flex-start; }
    .srp-title-row h3 { margin: 0; font-size: 12px; color: #0c3b5e; }
    .srp-title-row p { margin: 2px 0 0; font-size: 9px; color: #64748b; }
    .srp-cards { display: flex; gap: 8px; padding: 8px 0; margin: 8px 0; flex-wrap: wrap; }
    .srp-card { flex: 1; min-width: 140px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .srp-card span { display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 2px; }
    .srp-card strong { font-size: 16px; font-weight: 800; color: #1e293b; }
    .srp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
    .srp-table { width: 100%; border-collapse: collapse; font-size: 9px; }
    .srp-table th { background: #f0f6fb; color: #0c3b5e; font-weight: 700; font-size: 8px; text-transform: uppercase; padding: 5px 6px; border: 1px solid #e2e8f0; text-align: left; }
    .srp-table td { padding: 4px 6px; border: 1px solid #e2e8f0; color: #1e293b; font-size: 9px; }
    .srp-table tr:nth-child(even) td { background: #f8fafc; }
    @page { size: A4 portrait; margin: 8mm; }
  `;
  w.document.write(`<!DOCTYPE html><html><head><title>User Management Report</title><style>${styles}</style></head><body>${el.outerHTML}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
  w.close();
}

onMounted(async () => {
  await fetchUsers();
  await fetchStats();
});
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.admin-dashboard {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #EEF5FB;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

/* ── Layout ── */
.admin-dashboard {
  min-height: 100vh;
  background: var(--color-gray-bg);
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.main-content {
  margin-left: 0;
  padding-top: 64px;
  transition: margin-left 0.3s ease;
}
@media (min-width: 768px) {
  .main-content { margin-left: 262px; }
}

.content-container {
  padding: 1.5rem 1.75rem;
  max-width: 1400px;
  margin: 0 auto;
}
@media (max-width: 768px) {
  .content-container { padding: 0.85rem; }
}

/* ── srp-* shared print report classes ── */
.sales-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: .45rem;
  background: rgba(12,59,94,.55);
  backdrop-filter: blur(4px);
}
.sales-preview-modal {
  background: #fff;
  border: 2px solid #f4c400;
  border-radius: 10px;
  box-shadow: 0 20px 48px rgba(15,23,42,.35);
  width: min(1240px, 98vw);
  max-height: 96vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sales-preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .65rem 1rem;
  border-bottom: 2px solid #0c3b5e;
  background: #0c3b5e;
  color: #fff;
  flex-shrink: 0;
}
.sales-preview-toolbar h3 { margin: 0; font-size: .92rem; color: #f4c400; }
.sales-preview-toolbar p  { margin: 2px 0 0; font-size: .72rem; color: #93c5fd; }
.sales-preview-actions { display: flex; gap: .45rem; }
.sales-preview-scroll { flex: 1; overflow-y: auto; padding: 1rem; }
.sales-report-print { width: 100%; background: #fff; }
/* header */
.srp-header {
  display: grid;
  grid-template-columns: 52px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #0c3b5e;
  color: #fff;
  border-radius: 6px 6px 0 0;
  margin-bottom: 10px;
}
.srp-logo {
  width: 44px; height: 44px;
  border-radius: 8px;
  background: #0c3b5e;
  color: #f4c400;
  font-weight: 800; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #f4c400;
}
.srp-header h2 { margin: 0; font-size: 15px; color: #fff; }
.srp-header p  { margin: 2px 0 0; font-size: 10px; color: #93c5fd; }
.srp-meta { text-align: right; font-size: 9px; color: #93c5fd; }
.srp-meta strong { display: block; color: #fde68a; }
/* sections */
.srp-section { margin: 10px 0; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; }
.srp-section h4 { margin: 0 0 8px; font-size: 11px; color: #0c3b5e; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
.srp-title-row { display: flex; justify-content: space-between; align-items: flex-start; }
.srp-title-row h3 { margin: 0; font-size: 12px; color: #0c3b5e; }
.srp-title-row p  { margin: 2px 0 0; font-size: 9px; color: #64748b; }
.srp-applied { display: flex; gap: 18px; font-size: 9px; }
.srp-applied div { display: flex; flex-direction: column; }
.srp-applied span { color: #64748b; }
.srp-applied strong { color: #0c3b5e; }
/* cards */
.srp-cards { display: flex; gap: 8px; padding: 8px 0; margin: 8px 0; flex-wrap: wrap; }
.srp-card { flex: 1; min-width: 140px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
.srp-card span { display: block; font-size: 8px; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 2px; }
.srp-card strong { font-size: 16px; font-weight: 800; color: #1e293b; }
/* grid */
.srp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
/* table */
.srp-table { width: 100%; border-collapse: collapse; font-size: 9px; }
.srp-table th { background: #f0f6fb; color: #0c3b5e; font-weight: 700; font-size: 8px; text-transform: uppercase; padding: 5px 6px; border: 1px solid #e2e8f0; text-align: left; }
.srp-table td { padding: 4px 6px; border: 1px solid #e2e8f0; color: #1e293b; }
.srp-table tr:nth-child(even) td { background: #f8fafc; }
/* loading */
.srp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; gap: 1rem; color: #64748b; }
.srp-spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #0c3b5e; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
/* buttons */
.btn-download {
  display: inline-flex; align-items: center; gap: .4rem;
  background: #f4c400; color: #0c3b5e;
  border: none; border-radius: 7px;
  padding: .45rem .95rem; font-size: .8rem; font-weight: 700;
  cursor: pointer; transition: background .18s;
}
.btn-download:disabled { opacity: .55; cursor: not-allowed; }
.btn-download:not(:disabled):hover { background: #ffd700; }
.btn-preview {
  display: inline-flex; align-items: center; gap: .4rem;
  background: rgba(255,255,255,.12); color: #fff;
  border: 1px solid rgba(255,255,255,.28); border-radius: 7px;
  padding: .45rem .95rem; font-size: .8rem; font-weight: 600;
  cursor: pointer; transition: background .18s;
}
.btn-preview:disabled { opacity: .55; cursor: not-allowed; }
.btn-preview:not(:disabled):hover { background: rgba(255,255,255,.22); }
/* legacy export-preview-overlay — replaced, keep minimal for safety */
.export-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: .45rem;
  background: rgba(12, 59, 94, 0.55);
  backdrop-filter: blur(4px);
}

.export-preview-modal {
  background: #fff;
  border: 2px solid var(--color-gold);
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
  border-bottom: 2px solid var(--color-primary-light);
  padding: 0.6rem 0.85rem;
}

.export-preview-header h3 {
  margin: 0;
  color: var(--color-primary-light);
  font-size: 0.92rem;
}

.preview-close-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-gray-border);
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}
.preview-close-btn:hover { background: #f9fafb; }

.export-preview-body {
  padding: 0.65rem 0.85rem;
  overflow: hidden;
}

.export-preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-size: 0.72rem;
  color: var(--color-primary-dark);
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
  color: var(--color-primary-light);
  background: #f6fbff;
}

.preview-card--wide { min-width: 0; }

.preview-table-wrap { overflow: hidden; }

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
  color: var(--color-primary-light);
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

.btn-secondary {
  background: white;
  color: var(--color-primary-light);
  border: 1px solid var(--color-primary-light);
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
}
.btn-secondary:hover {
  background: var(--color-gold);
  color: var(--color-navy);
  border-color: var(--color-gold);
}

.btn-primary {
  background: var(--color-navy);
  color: var(--color-white);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 2px 8px rgba(12, 59, 94, 0.22);
}
.btn-primary:hover {
  background: var(--color-primary);
  box-shadow: 0 4px 14px rgba(3, 105, 161, 0.28);
}
.btn-primary i { color: var(--color-gold); }

@media (min-width: 1024px) {
  .export-preview-body { zoom: 0.8; }
}
@media (max-width: 900px) {
  .export-preview-grid { grid-template-columns: 1fr; }
}
</style>