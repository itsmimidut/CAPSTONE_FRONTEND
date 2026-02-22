<template>
  <div class="min-h-screen bg-rates-gradient">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <RatesHero />

    <!-- Rates Images Side-by-Side -->
    <section class="px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center items-start">
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="relative rounded-2xl shadow-2xl overflow-hidden border border-white/30 bg-gradient-to-br from-white/95 to-blue-50/80 backdrop-blur-lg"
        >
          <!-- Image -->
          <img
            :src="slide.src"
            :alt="slide.alt"
            class="w-full h-auto object-contain"
            loading="lazy"
          />

          <!-- Preview Icon -->
          <button
            class="preview-btn"
            @click="openPreview(slide.src)"
            aria-label="Preview image"
          >
            <i class="fas fa-search-plus"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Lightbox Preview -->
    <div v-if="previewSrc" class="lightbox" @click="closePreview">
      <img :src="previewSrc" class="lightbox-img" />
    </div>

    <!-- Footer -->
    <AppFooter />

    <!-- Chatbot -->
    <ChatbotModal />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'
import RatesHero from '../../components/RatesHero.vue'

const sidebarOpen = ref(false)
const slides = [
  { src: '/rates/rates1.jpg', alt: 'Eduardo’s Resort rates poster 1' },
  { src: '/rates/rates2.jpg', alt: 'Eduardo’s Resort rates poster 2' }
]

// Preview state
const previewSrc = ref(null)
const openPreview = (src) => previewSrc.value = src
const closePreview = () => previewSrc.value = null
</script>

<style scoped>
/* Background gradient */
.bg-rates-gradient {
  background: linear-gradient(135deg, rgba(30,64,175,0.15), rgba(212,175,55,0.08));
  min-height: 100vh;
}

/* Glass-card styling for images */
.grid > div {
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
  backdrop-filter: blur(15px);
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  padding: 8px;
  position: relative;
}

/* Ensure full content visible */
img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 16px;
}

/* Preview button */
.preview-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(30,64,175,0.85);
  color: #facc15;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.preview-btn:hover {
  background: rgba(30,64,175,1);
  transform: scale(1.1);
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  cursor: zoom-out;
}

.lightbox-img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 16px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>