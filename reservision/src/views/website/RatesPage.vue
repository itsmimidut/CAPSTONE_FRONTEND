<template>
  <div class="min-h-screen bg-rates-gradient overflow-x-hidden">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <section class="rates-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">Eduardo's Resort</div>
        <h1 class="hero-heading">
          <span class="heading-white">Rates &</span>
          <span class="heading-gold">Packages</span>
        </h1>
        <p class="hero-subtext">
          Enjoy, relax, and have fun in our cool and therapeutic waters.<br/>
          Explore entrance fees, room rates, and exclusive packages tailored for a memorable getaway.
        </p>
      </div>
    </section>

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

    <!-- Lightbox -->
    <div v-if="previewSrc" class="lightbox" @click="closePreview">
      <button class="lightbox-close" @click.stop="closePreview" type="button">
        <i class="fas fa-times"></i>
      </button>
      <img :src="previewSrc" class="lightbox-img" alt="Rates preview" />
    </div>

    <!-- Footer -->
    <AppFooter />
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
/* ── Variables ── */
.rates-hero,
.rate-card,
.lightbox {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark: #1E88B6;
  --color-gold: #F4C400;
  --color-gold-dark: #F2C200;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;
  --color-white-soft: rgba(255, 255, 255, 0.1);
  --color-gray-bg: #f9fafb;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;
}

/* ── Page Background ── */
.bg-rates-gradient {
  background: #f9fafb;
  min-height: 100vh;
}

/* ── Hero ── */
.rates-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  background-image: url('/images/herobg.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
  flex-grow: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 30, 50, 0.52);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 24px;
  max-width: 780px;
  width: 100%;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: var(--color-white);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 6px 18px;
  border-radius: 999px;
}

.hero-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.15;
}

.heading-white {
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 800;
  color: var(--color-white);
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.heading-gold {
  font-size: clamp(2rem, 4.5vw, 3.8rem);
  font-weight: 800;
  color: var(--color-gold);
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.hero-subtext {
  font-size: clamp(0.88rem, 1.3vw, 1rem);
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.75;
  font-weight: 400;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}

/* ── Section Headers ── */
.section-header {
  font-weight: 900;
  font-size: 2.5rem;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.section-subtitle {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0;
  letter-spacing: 0.3px;
}

/* ── Rate Card ── */
.rate-card {
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    0 6px 32px rgba(3, 105, 161, 0.12),
    0 2px 8px rgba(12, 59, 94, 0.07);
  padding: 10px;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.rate-card:hover {
  transform: translateY(-8px);
  box-shadow:
    0 16px 48px rgba(3, 105, 161, 0.18),
    0 4px 12px rgba(12, 59, 94, 0.10);
}

.rate-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 16px;
}

/* ── Preview Button ── */
.preview-btn {
  position: absolute;
  right: 18px;
  bottom: 18px;
  background: var(--color-primary);
  color: var(--color-gold);
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s ease;
  border: none;
  box-shadow: 0 6px 16px rgba(3, 105, 161, 0.3);
}

.preview-btn:hover {
  background: var(--color-gold);
  color: var(--color-navy);
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(244, 196, 0, 0.4);
}

/* ── Lightbox ── */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(12, 59, 94, 0.88);
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
  border: 2px solid var(--color-gold);
  background: var(--color-white);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lightbox-close:hover {
  background: var(--color-gold);
  color: var(--color-navy);
}

.lightbox-img {
  max-width: 92%;
  max-height: 92%;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  background: white;
}

/* ── Animations ── */
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 10s linear infinite;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .section-header { font-size: 1.8rem; }
  .section-subtitle { font-size: 0.95rem; }
}

@media (max-width: 640px) {
  .rates-hero {
    height: 100svh;
    min-height: 100svh;
    max-height: 100svh;
  }
  .hero-content { padding: 32px 16px; }
  .hero-subtext br { display: none; }
  .section-header { font-size: 1.5rem; }
  .section-subtitle { font-size: 0.85rem; }
  .preview-btn { width: 36px; height: 36px; right: 12px; bottom: 12px; font-size: 14px; }
}
</style>