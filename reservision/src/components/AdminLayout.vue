<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="flex min-h-screen">
    <AdminSidebar
      :collapsed="sidebarCollapsed"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      :mobile-open="mobileSidebarOpen"
      @close-mobile="mobileSidebarOpen = false"
    />

    <div class="overlay" :class="{ active: mobileSidebarOpen }" @click="mobileSidebarOpen = false" />

    <main class="flex-1" :class="{ 'md:ml-[260px]': !sidebarCollapsed, 'md:ml-[70px]': sidebarCollapsed }">
      <PageHeader @open-mobile-menu="mobileSidebarOpen = true" />
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminSidebar from '../components/Admin/AdminSidebar.vue'
import PageHeader from '../components/Admin/AdminHeader.vue'

const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)
</script>