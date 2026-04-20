<template>
  <div class="admin-dashboard">
    <!-- Sidebar -->
    <AdminSidebar 
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <!-- Header -->
    <AdminHeader 
      title="Entrance Rates Configuration"
      subtitle="Manage resort entry fees and rates"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <!-- Main Content -->
    <main class="main-content" :class="{ shifted: sidebarCollapsed }">
      <div class="content-container">
        <EntranceRatesAdmin />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import EntranceRatesAdmin from '../../components/Admin/EntranceRatesAdmin.vue'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg, #EEF5FB);
}

/* ── Main Content ── */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  margin-left: 0;
  padding-top: 70px;
  transition: margin-left 0.3s ease;
  min-width: 0;
}

/* Desktop — sidebar visible */
@media (min-width: 768px) {
  .main-content {
    margin-left: 262px;
  }

  /* Collapsed sidebar */
  .main-content.shifted {
    margin-left: 72px;
  }
}

/* Mobile — no sidebar offset */
@media (max-width: 767px) {
  .main-content {
    margin-left: 0;
    padding-top: 60px;
  }

  .main-content.shifted {
    margin-left: 0;
  }
}

.content-container {
  padding: 1.5rem;
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .content-container {
    padding: 1rem;
  }
}
</style>