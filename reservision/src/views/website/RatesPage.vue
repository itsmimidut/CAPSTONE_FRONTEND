<template>
  <div class="min-h-screen bg-rates-gradient overflow-x-hidden">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <section
      class="relative flex items-center justify-center min-h-[450px] sm:min-h-[550px] rates-hero text-center px-4 overflow-hidden pt-[78px]"
    >
      <!-- Animated background elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-10 left-10 w-32 h-32 bg-[#1F8DBF]/20 rounded-full blur-3xl animate-pulse-hero"></div>
        <div class="absolute bottom-10 right-10 w-40 h-40 bg-[#F4C400]/20 rounded-full blur-3xl animate-pulse-hero delay-1000"></div>
      </div>

      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#1F8DBF]/20 via-[#F4C400]/10 to-[#F4C400]/20"></div>

      <!-- Glass card -->
      <div class="relative z-10 max-w-4xl w-full backdrop-blur-md bg-white/50 rounded-2xl p-8 sm:p-10 md:p-12 shadow-2xl mx-4 flex flex-col justify-center border border-white/40 my-12">
        <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-[#F4C400]/5 to-[#1F8DBF]/10 rounded-2xl pointer-events-none"></div>

        <div class="relative z-20 flex flex-col items-center justify-center">
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-[#F4C400]/30 rounded-full blur-2xl animate-pulse-slow-hero"></div>

          <h1 class="text-[32px] sm:text-[40px] md:text-[48px] font-bold leading-tight relative mb-2">
            <span class="text-[#0C3B5E] drop-shadow-lg">Rates &amp; Packages</span>
          </h1>

          <div class="mt-4 mb-2">
            <p class="text-xs sm:text-sm text-[#0C3B5E]/80 leading-relaxed drop-shadow-md font-medium max-w-2xl mx-auto">
              Enjoy, relax, and have fun in our cool and therapeutic waters. Explore entrance fees,
              room rates, and exclusive packages tailored for a memorable getaway.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Decorative background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-yellow-400/10 rounded-full blur-3xl animate-float-1"></div>
      <div class="absolute bottom-1/3 right-10 w-40 h-40 bg-gradient-to-tr from-blue-300/5 to-yellow-300/10 rounded-full blur-3xl animate-float-2"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-blue-200/5 to-yellow-200/5 rounded-full blur-3xl animate-pulse-soft"></div>
    </div>

    <!-- Section intro -->
    <section class="relative py-10 sm:py-12">
      <div class="container mx-auto px-4 max-w-7xl relative z-10">
        <div class="flex justify-center items-center mb-8">
          <div class="h-1 w-16 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
          <div class="mx-4">
            <div class="w-4 h-4 bg-gradient-to-br from-yellow-400 to-blue-400 rounded-full animate-spin-slow"></div>
          </div>
          <div class="h-1 w-16 bg-gradient-to-l from-blue-400 to-transparent rounded-full"></div>
        </div>

        <div class="text-center mb-10">
          <h2 class="section-header">
            <span class="inline-block bg-gradient-to-r from-blue-800 via-blue-700 to-yellow-600 bg-clip-text text-transparent">
              Resort Pricing Guide
            </span>
          </h2>
          <p class="section-subtitle">
            <span class="inline-block px-4 py-2 bg-gradient-to-r from-blue-50 to-yellow-50/50 rounded-full border border-blue-100 shadow-sm">
              ENTRANCE FEES • ROOM RATES • EXCLUSIVE PACKAGES
            </span>
          </p>
        </div>
      </div>
    </section>

    <!-- Rates Images -->
    <section class="relative px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
      <div class="container mx-auto max-w-7xl relative z-10">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 items-start">
          <div
            v-for="(slide, index) in slides"
            :key="index"
            class="rate-card"
          >
            <img
              :src="slide.src"
              :alt="slide.alt"
              class="rate-image"
              loading="lazy"
            />

            <button
              class="preview-btn"
              @click="openPreview(slide.src)"
              aria-label="Preview image"
              type="button"
            >
              <i class="fas fa-search-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Lightbox Preview -->
    <div v-if="previewSrc" class="lightbox" @click="closePreview">
      <button class="lightbox-close" @click.stop="closePreview" type="button">
        <i class="fas fa-times"></i>
      </button>
      <img :src="previewSrc" class="lightbox-img" alt="Rates preview" />
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

const sidebarOpen = ref(false)

const slides = [
  { src: '/rates/rates1.jpg', alt: "Eduardo's Resort rates poster 1" },
  { src: '/rates/rates2.jpg', alt: "Eduardo's Resort rates poster 2" }
]

const previewSrc = ref(null)

const openPreview = (src) => {
  previewSrc.value = src
  document.body.style.overflow = 'hidden'
}

const closePreview = () => {
  previewSrc.value = null
  document.body.style.overflow = ''
}
</script>

<style scoped>
.bg-rates-gradient {
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.12), rgba(212, 175, 55, 0.08));
  min-height: 100vh;
}

.rates-hero {
  background-image:
    radial-gradient(circle at 30% 40%, rgba(31, 141, 191, 0.25) 0%, transparent 40%),
    radial-gradient(circle at 70% 60%, rgba(244, 196, 0, 0.2) 0%, transparent 40%),
    linear-gradient(125deg, rgba(31, 141, 191, 0.4) 0%, rgba(244, 196, 0, 0.3) 100%),
    url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-size: cover;
  background-blend-mode: overlay;
  position: relative;
}

.rates-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
  pointer-events: none;
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.section-header {
  font-weight: 900;
  font-size: 2.5rem;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-subtitle {
  color: rgb(30, 64, 175);
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0;
  letter-spacing: 0.3px;
}

.rate-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(239,246,255,0.85));
  backdrop-filter: blur(15px);
  box-shadow: 0 25px 50px rgba(0,0,0,0.18);
  padding: 8px;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.rate-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 28px 60px rgba(0,0,0,0.22);
}

.rate-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 18px;
}

.preview-btn {
  position: absolute;
  right: 14px;
  bottom: 14px;
  background: rgba(30, 64, 175, 0.88);
  color: #facc15;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s ease;
  border: none;
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.preview-btn:hover {
  background: rgba(30, 64, 175, 1);
  transform: scale(1.08);
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  cursor: zoom-out;
  padding: 1rem;
}

.lightbox-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 2px solid #facc15;
  background: white;
  color: #1e40af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
}

.lightbox-img {
  max-width: 92%;
  max-height: 92%;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  background: white;
}

@keyframes pulseHero {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes pulseSlowHero {
  0%, 100% { opacity: 0.2; transform: scale(1) translateX(-50%); }
  50% { opacity: 0.4; transform: scale(1.2) translateX(-50%); }
}

@keyframes float-1 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(-15px) translateX(10px); }
  66% { transform: translateY(10px) translateX(-10px); }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(10px) translateX(-15px); }
  66% { transform: translateY(-10px) translateX(10px); }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.animate-pulse-hero {
  animation: pulseHero 4s ease-in-out infinite;
}

.animate-pulse-slow-hero {
  animation: pulseSlowHero 6s ease-in-out infinite;
  left: 50% !important;
}

.animate-float-1 {
  animation: float-1 12s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 15s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-spin-slow {
  animation: spin-slow 10s linear infinite;
}

.animate-pulse-soft {
  animation: pulse-soft 3s ease-in-out infinite;
}

.delay-1000 {
  animation-delay: 1s;
}

@media (max-width: 768px) {
  .section-header {
    font-size: 1.8rem;
  }

  .section-subtitle {
    font-size: 0.95rem;
  }
}

@media (max-width: 640px) {
  .rates-hero {
    min-height: 450px;
  }

  .text-\[32px\] {
    font-size: 28px;
  }

  .max-w-2xl {
    max-width: 100%;
  }

  .section-header {
    font-size: 1.5rem;
  }

  .section-subtitle {
    font-size: 0.85rem;
  }

  .preview-btn {
    width: 36px;
    height: 36px;
    right: 10px;
    bottom: 10px;
    font-size: 14px;
  }
}
</style>