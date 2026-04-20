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

    <!-- Entrance Rates Section -->
    <section class="entrance-section">
      <div class="container mx-auto px-4 max-w-7xl">
        <div class="text-center mb-12">
          <div class="flex justify-center items-center mb-6">
            <div class="h-1 w-16 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
            <div class="mx-4">
              <div class="w-4 h-4 bg-gradient-to-br from-yellow-400 to-blue-400 rounded-full animate-spin-slow"></div>
            </div>
            <div class="h-1 w-16 bg-gradient-to-l from-blue-400 to-transparent rounded-full"></div>
          </div>
          <h2 class="section-header">
            <span class="inline-block bg-gradient-to-r from-blue-800 via-blue-700 to-yellow-600 bg-clip-text text-transparent">
              Calculate Your Entrance Fee
            </span>
          </h2>
          <p class="section-subtitle">
            <span class="inline-block px-4 py-2 bg-gradient-to-r from-blue-50 to-yellow-50/50 rounded-full border border-blue-100 shadow-sm">
              Select your visit date and guest count
            </span>
          </p>
        </div>

        <div class="entrance-content">
          <EntranceFeeCalculator 
            @fee-calculated="onFeeCalculated"
            @add-to-booking="onAddToBooking"
          >
            <template #action="{ total }">
              <router-link to="/websitereservation" class="btn-continue-booking">
                <i class="fas fa-calendar-check"></i> 
                Continue to Booking (₱{{ formatPrice(total) }})
              </router-link>
            </template>
          </EntranceFeeCalculator>
        </div>
      </div>
    </section>

    <!-- Entrance Rates Table (Info Display) -->
    <section class="rates-info-section" v-if="allRates.length > 0">
      <div class="container mx-auto px-4 max-w-7xl">
        <div class="text-center mb-10">
          <h2 class="section-header">
            <span class="inline-block bg-gradient-to-r from-blue-800 via-blue-700 to-yellow-600 bg-clip-text text-transparent">
              Current Entrance Rates
            </span>
          </h2>
        </div>

        <div class="rates-table-wrapper">
          <table class="rates-table">
            <thead>
              <tr>
                <th>Rate Category</th>
                <th>Day Type</th>
                <th>Price (PHP)</th>
                <th>Age Eligibility</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rate in allRates" :key="rate.id" v-if="rate.status === 'active'">
                <td>
                  <span class="rate-category">{{ rate.name }}</span>
                </td>
                <td>
                  <span class="day-badge" :class="`day-${rate.day_type}`">
                    {{ formatDayType(rate.day_type) }}
                  </span>
                </td>
                <td>
                  <span class="price">₱{{ formatPrice(rate.price) }}</span>
                </td>
                <td>
                  <span v-if="rate.age_min || rate.age_max" class="age-range">
                    {{ rate.age_min || 0 }} - {{ rate.age_max || '∞' }} years
                  </span>
                  <span v-else class="age-range">All ages</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />
    <ChatbotModal />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'
import EntranceFeeCalculator from '../../components/EntranceFeeCalculator.vue'
import { useEntranceRatesStore } from '../../stores/entranceRatesStore'

const router = useRouter()
const store = useEntranceRatesStore()

const sidebarOpen = ref(false)
const calculatedFee = ref(null)
const loading = ref(false)

const slides = [
  { src: '/rates/rates1.jpg', alt: "Eduardo's Resort rates poster 1" },
  { src: '/rates/rates2.jpg', alt: "Eduardo's Resort rates poster 2" }
]

const previewSrc = ref(null)

const allRates = computed(() => store.rates || [])

const formatPrice = (price) => {
  return parseFloat(price).toFixed(2)
}

const formatDayType = (dayType) => {
  const labels = {
    weekday: 'Weekday',
    weekend: 'Weekend',
    holiday: 'Holiday'
  }
  return labels[dayType] || dayType
}

const openPreview = (src) => {
  previewSrc.value = src
  document.body.style.overflow = 'hidden'
}

const closePreview = () => {
  previewSrc.value = null
  document.body.style.overflow = ''
}

const onFeeCalculated = (result) => {
  calculatedFee.value = result
  console.log('Fee calculated:', result)
}

const onAddToBooking = (feeData) => {
  // Store the entrance fee in a temporary location or pass it to booking page
  sessionStorage.setItem('entranceFeeData', JSON.stringify(feeData))
  // Navigate will be done by the button link to /websitereservation
}

// Load entrance rates on page mount
onMounted(async () => {
  loading.value = true
  try {
    await store.fetchRates(1)
  } catch (error) {
    console.error('Failed to load entrance rates:', error)
  } finally {
    loading.value = false
  }
})
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

/* ── Entrance Rates Section ── */
.entrance-section {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 4rem 0;
  position: relative;
  overflow: hidden;
}

.entrance-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(3, 105, 161, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.entrance-section::after {
  content: '';
  position: absolute;
  bottom: -50%;
  left: -50%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(244, 196, 0, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.entrance-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
}

.btn-continue-booking {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(3, 105, 161, 0.2);
}

.btn-continue-booking:hover {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, #015a8a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(3, 105, 161, 0.3);
}

/* ── Entrance Rates Info Section ── */
.rates-info-section {
  background: white;
  padding: 4rem 0;
  border-top: 1px solid var(--color-gray-border);
}

.rates-table-wrapper {
  border-radius: 12px;
  border: 1px solid var(--color-gray-border);
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.rates-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.rates-table thead {
  background: linear-gradient(135deg, rgba(3, 105, 161, 0.05) 0%, rgba(244, 196, 0, 0.05) 100%);
  border-bottom: 2px solid var(--color-gray-border);
}

.rates-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  color: var(--color-navy);
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
}

.rates-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-gray-border);
  color: var(--color-text-dark);
}

.rates-table tbody tr:hover {
  background: rgba(3, 105, 161, 0.02);
  transition: background 0.2s ease;
}

.rates-table tbody tr:last-child td {
  border-bottom: none;
}

.rate-category {
  font-weight: 700;
  color: var(--color-primary);
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(3, 105, 161, 0.1);
  border-radius: 4px;
}

.day-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.day-weekday {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.day-weekend {
  background: rgba(244, 63, 94, 0.1);
  color: #991b1b;
  border: 1px solid rgba(244, 63, 94, 0.2);
}

.day-holiday {
  background: rgba(249, 115, 22, 0.1);
  color: #92400e;
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.price {
  font-weight: 700;
  color: var(--color-primary);
  font-family: 'Courier New', monospace;
  font-size: 1.05rem;
}

.age-range {
  color: var(--color-text-light);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .entrance-section {
    padding: 3rem 0;
  }

  .rates-table {
    font-size: 0.85rem;
  }

  .rates-table th,
  .rates-table td {
    padding: 0.75rem 0.5rem;
  }

  .rate-category {
    font-size: 0.85rem;
    padding: 0.2rem 0.5rem;
  }

  .day-badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.5rem;
  }

  .price {
    font-size: 0.95rem;
  }
}
</style>