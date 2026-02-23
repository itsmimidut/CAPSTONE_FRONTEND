<template>
  <div class="order-history-page">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />
    
    <main class="main-content">
      <OrderHistory @close="goBack" @reorder="handleReorder" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import OrderHistory from '../../components/Customer/OrderHistory.vue'

const router = useRouter()
const sidebarOpen = ref(false)

const goBack = () => {
  router.push('/eshop')
}

const handleReorder = (items) => {
  // Redirect to e-shop with items
  router.push({
    path: '/eshop',
    query: { reorder: JSON.stringify(items) }
  })
}
</script>

<style scoped>
.order-history-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
