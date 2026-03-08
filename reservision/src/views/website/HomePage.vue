<template>
  <div class="homepage-bg min-h-screen">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main Content -->
    <main>
      <HeroSection />
       <OverviewSection />
      <!-- <ExperiencesSection /> -->
      <!-- <RestaurantSection @open-menu="menuOpen = true" /> -->
      <!-- <SuitesSection /> -->
      <GallerySection />
      <MapSection />
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Chatbot -->
    <ChatbotModal />

    <!-- Menu Modal -->
    <MenuModal :is-open="menuOpen" @close="menuOpen = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'
// import MenuModal from '../../components/MenuModal.vue'
import HeroSection from '../../components/HeroSection.vue'
import OverviewSection from '../../components/OverviewSection.vue'
// import ExperiencesSection from '../../components/ExperiencesSection.vue'
// import RestaurantSection from '../../components/RestaurantSection.vue'
// import SuitesSection from '../../components/SuitesSection.vue'
import GallerySection from '../../components/GallerySection.vue'
import MapSection from '../../components/MapSection.vue'

const sidebarOpen = ref(false)
const menuOpen = ref(false)
</script>

<style scoped>
.homepage-bg {
  background-image: url('/images/hero_bg.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>