<template>
  <div class="min-h-screen page-bg overflow-x-hidden">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <section class="gallery-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">Eduardo's Resort</div>
        <h1 class="hero-heading">
          <span class="heading-white">Explore Our</span>
          <span class="heading-gold">Gallery</span>
        </h1>
        <p class="hero-subtext">
          Discover the beauty, comfort, and unforgettable moments at Eduardo's Resort.
        </p>
      </div>
    </section>

    <!-- Controls -->
    <section class="relative py-10 sm:py-12">
      <div class="container mx-auto px-4 max-w-7xl relative z-10">
        <div class="flex justify-center items-center mb-8">
          <div class="h-1 w-16 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
          <div class="mx-4">
            <div class="w-4 h-4 bg-gradient-to-br from-yellow-400 to-blue-400 rounded-full animate-spin-slow"></div>
          </div>
          <div class="h-1 w-16 bg-gradient-to-l from-blue-400 to-transparent rounded-full"></div>
        </div>

        <div class="text-center mb-8">
          <h2 class="category-header">
            <span class="inline-block bg-gradient-to-r from-blue-800 via-blue-700 to-yellow-600 bg-clip-text text-transparent">
              Browse Resort Moments
            </span>
          </h2>
          <p class="amenity-list">
            <span class="inline-block px-4 py-2 bg-gradient-to-r from-blue-50 to-yellow-50/50 rounded-full border border-blue-100 shadow-sm">
              RESORT • COTTAGES • POOL • DINING • EVENTS
            </span>
          </p>
        </div>

        <div class="gallery-controls">
          <div class="controls-container">
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search images (e.g., 'pool', 'cottage')..."
                class="search-input"
              />
            </div>
            <div class="filter-categories">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="activeFilter = category.id"
                class="filter-btn"
                :class="{ active: activeFilter === category.id }"
                type="button"
              >
                <i :class="category.icon"></i>
                {{ category.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Gallery -->
    <section class="relative pb-20">
      <div class="container mx-auto px-4 max-w-7xl relative z-10">
        <div class="gallery-container">
          <div
            v-for="(item, index) in filteredImages"
            :key="index"
            class="gallery-item"
            :class="`category-${item.category}`"
            @click="openLightbox(index)"
          >
            <div class="image-wrapper">
              <img :src="item.image" :alt="item.caption" @error="handleImageError" loading="lazy" />
              <div class="image-overlay">
                <i :class="getCategoryIcon(item.category)" class="overlay-icon"></i>
              </div>
            </div>
            <div class="image-caption">
              <i :class="getCategoryIcon(item.category)" class="caption-icon"></i>
              <span>{{ item.caption }}</span>
            </div>
          </div>
        </div>

        <div v-if="filteredImages.length === 0" class="empty-state">
          <i class="fas fa-images empty-icon"></i>
          <p class="empty-title">No images found</p>
          <p class="empty-subtitle">Try adjusting your search or filter</p>
        </div>
      </div>
    </section>

    <!-- Lightbox -->
    <transition name="fade">
      <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox" type="button">
          <i class="fas fa-times"></i>
        </button>
        <button class="lightbox-nav prev" @click.stop="prevImage" :disabled="currentImageIndex === 0" type="button">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="lightbox-content" @click.stop>
          <img :src="filteredImages[currentImageIndex]?.image" :alt="filteredImages[currentImageIndex]?.caption" />
          <div class="lightbox-caption">
            <i :class="getCategoryIcon(filteredImages[currentImageIndex]?.category)" class="caption-icon"></i>
            {{ filteredImages[currentImageIndex]?.caption }}
          </div>
        </div>
        <button class="lightbox-nav next" @click.stop="nextImage" :disabled="currentImageIndex === filteredImages.length - 1" type="button">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </transition>

    <AppFooter />
    <ChatbotModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'

const sidebarOpen = ref(false)
const searchQuery = ref('')
const activeFilter = ref('all')
const lightboxOpen = ref(false)
const currentImageIndex = ref(0)

const categories = [
  { id: 'all', label: 'All', icon: 'fas fa-th' },
  { id: 'resort', label: 'Resort', icon: 'fas fa-hotel' },
  { id: 'rooms', label: 'Cottages', icon: 'fas fa-home' },
  { id: 'pool', label: 'Pool', icon: 'fas fa-swimming-pool' },
  { id: 'restaurant', label: 'Dining', icon: 'fas fa-utensils' },
  { id: 'events', label: 'Events', icon: 'fas fa-calendar-alt' }
]

const images = ref([
  { image: '/images/img1.jpg', caption: 'Resort Entrance View', category: 'resort' },
  { image: '/images/img2.jpg', caption: 'Air-Conditioned Cottage', category: 'rooms' },
  { image: '/images/img3.jpg', caption: 'Mini-Olympic Pool', category: 'pool' },
  { image: '/images/img4.jpg', caption: 'Dining Area Setup', category: 'restaurant' },
  { image: '/images/img5.jpg', caption: 'Special Event Venue', category: 'events' },
  { image: '/images/img6.jpg', caption: 'Poolside Relaxation', category: 'pool' },
  { image: '/images/img7.jpg', caption: 'Family Cottage Space', category: 'rooms' },
  { image: '/images/img8.jpg', caption: 'Restaurant Interior', category: 'restaurant' },
  { image: '/images/img9.jpg', caption: 'Resort Grounds', category: 'resort' },
  { image: '/images/img10.jpg', caption: 'Event Celebration Area', category: 'events' }
])

const filteredImages = computed(() => {
  let result = images.value
  if (activeFilter.value !== 'all') result = result.filter(img => img.category === activeFilter.value)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(img => img.caption.toLowerCase().includes(query) || img.category.toLowerCase().includes(query))
  }
  return result
})

const getCategoryIcon = (category) => {
  const icons = { resort: 'fas fa-hotel', rooms: 'fas fa-bed', pool: 'fas fa-swimming-pool', restaurant: 'fas fa-utensils', events: 'fas fa-calendar-alt' }
  return icons[category] || 'fas fa-image'
}

const handleImageError = (event) => { event.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found' }
const openLightbox = (index) => { currentImageIndex.value = index; lightboxOpen.value = true; document.body.style.overflow = 'hidden' }
const closeLightbox = () => { lightboxOpen.value = false; document.body.style.overflow = '' }
const nextImage = () => { if (currentImageIndex.value < filteredImages.value.length - 1) currentImageIndex.value++ }
const prevImage = () => { if (currentImageIndex.value > 0) currentImageIndex.value-- }

const handleKeydown = (e) => {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); document.body.style.overflow = '' })
</script>

<style scoped>
/* ── Variables ── */
* {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-gold: #F4C400;
  --color-gold-dark: #F2C200;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;
  --color-gray-bg: #f9fafb;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;
}

/* ── Page ── */
.page-bg { background: #f9fafb; min-height: 100vh; }

/* ── Hero ── */
.gallery-hero {
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
  color: #FFFFFF;
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
  color: #FFFFFF;
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.heading-gold {
  font-size: clamp(2rem, 4.5vw, 3.8rem);
  font-weight: 800;
  color: #F4C400;
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
.category-header {
  font-weight: 900;
  font-size: 2.5rem;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.amenity-list {
  color: #0369a1;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  letter-spacing: 0.3px;
}

/* ── Gallery Controls ── */
.gallery-controls {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 1.5rem 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 28px rgba(3, 105, 161, 0.10);
  border: 1px solid rgba(3, 105, 161, 0.12);
}

.controls-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-wrapper {
  flex: 1;
  min-width: 280px;
  max-width: 420px;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid rgba(3, 105, 161, 0.14);
  transition: all 0.3s ease;
  padding: 0 0.9rem;
  height: 50px;
}

.search-wrapper:focus-within {
  border-color: #F4C400;
  box-shadow: 0 0 0 3px rgba(244, 196, 0, 0.15);
}

.search-icon {
  color: #F4C400;
  font-size: 0.95rem;
  margin-right: 0.75rem;
  width: 16px;
  text-align: center;
}

.search-input {
  border: none;
  background: transparent;
  padding: 0.75rem 0;
  flex: 1;
  font-size: 0.95rem;
  outline: none;
  color: #0369a1;
  font-weight: 500;
  height: 100%;
}

.search-input::placeholder { color: rgba(3, 105, 161, 0.4); }

/* ── Filter Buttons ── */
.filter-categories {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-btn {
  padding: 0.7rem 1.4rem;
  background: white;
  border: 2px solid rgba(3, 105, 161, 0.14);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
  font-size: 0.92rem;
  color: #0369a1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(3, 105, 161, 0.06);
}

.filter-btn i { color: #F4C400; font-size: 0.9rem; }

.filter-btn:hover {
  border-color: #F4C400;
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(244, 196, 0, 0.18);
  background: rgba(244, 196, 0, 0.04);
}

.filter-btn.active {
  background: #0369a1;
  color: white;
  border-color: transparent;
  box-shadow: 0 6px 16px rgba(3, 105, 161, 0.28);
}

.filter-btn.active i { color: #F4C400; }

/* ── Gallery Grid ── */
.gallery-container {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
}

.gallery-item {
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(3, 105, 161, 0.08);
  transition: all 0.35s ease;
  cursor: pointer;
  border: 1px solid rgba(3, 105, 161, 0.10);
  display: flex;
  flex-direction: column;
}

.gallery-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 40px rgba(3, 105, 161, 0.16);
  border-color: #F4C400;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: rgba(3, 105, 161, 0.05);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  display: block;
}

.gallery-item:hover img { transform: scale(1.08); }

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(12, 59, 94, 0.4), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-item:hover .image-overlay { opacity: 1; }

.overlay-icon {
  color: white;
  font-size: 2.4rem;
  text-shadow: 0 2px 8px rgba(12, 59, 94, 0.5);
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.gallery-item:hover .overlay-icon { transform: translateY(0); }

.image-caption {
  padding: 1.1rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border-top: 2px solid rgba(244, 196, 0, 0.2);
  color: #0C3B5E;
  font-weight: 700;
  font-size: 0.95rem;
}

.caption-icon {
  color: #F4C400;
  font-size: 1rem;
  width: 1.5rem;
  text-align: center;
}

/* ── Empty State ── */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  border: 2px dashed #F4C400;
  box-shadow: 0 8px 24px rgba(3, 105, 161, 0.08);
}

.empty-icon { font-size: 4rem; color: #F4C400; opacity: 0.5; margin-bottom: 1.5rem; }
.empty-title { font-size: 1.5rem; font-weight: 700; color: #0369a1; margin: 0 0 0.5rem 0; }
.empty-subtitle { color: #6b7280; font-size: 1rem; margin: 0; }

/* ── Lightbox ── */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(12, 59, 94, 0.95);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.lightbox-close {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: white;
  border: 2px solid #F4C400;
  color: #0369a1;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close:hover { background: #F4C400; color: #0C3B5E; transform: rotate(90deg); }

.lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(12, 59, 94, 0.4);
  border: 3px solid #F4C400;
  background: white;
}

.lightbox-caption {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: rgba(12, 59, 94, 0.4);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  border: 1px solid rgba(244, 196, 0, 0.3);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 2px solid #F4C400;
  color: #0369a1;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-nav:hover:not(:disabled) { background: #F4C400; color: #0C3B5E; transform: translateY(-50%) scale(1.08); }
.lightbox-nav:disabled { opacity: 0.3; cursor: not-allowed; }
.lightbox-nav.prev { left: 2rem; }
.lightbox-nav.next { right: 2rem; }

/* ── Animations ── */
@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pulse-soft { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }

.animate-spin-slow { animation: spin-slow 10s linear infinite; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.reveal { opacity: 0; transform: translateY(40px) scale(0.95); transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.reveal.visible { opacity: 1; transform: translateY(0) scale(1); }

/* ── Responsive ── */
@media (min-width: 640px) { .gallery-container { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) {
  .gallery-container { grid-template-columns: repeat(3, 1fr); }
  .controls-container { flex-direction: row; justify-content: space-between; align-items: center; }
}
@media (min-width: 1280px) { .gallery-container { grid-template-columns: repeat(4, 1fr); } }

@media (max-width: 768px) {
  .category-header { font-size: 1.8rem; }
  .amenity-list { font-size: 0.95rem; }
  .gallery-controls { padding: 1.25rem; }
  .search-wrapper { max-width: 100%; min-width: auto; }
  .filter-categories { width: 100%; justify-content: flex-start; overflow-x: auto; padding-bottom: 0.5rem; flex-wrap: nowrap; }
  .lightbox-nav { width: 48px; height: 48px; font-size: 1.1rem; }
  .lightbox-nav.prev { left: 1rem; }
  .lightbox-nav.next { right: 1rem; }
  .lightbox-close { top: 1rem; right: 1rem; width: 40px; height: 40px; font-size: 1rem; }
}

@media (max-width: 640px) {
  .gallery-hero { height: 100svh; min-height: 100svh; max-height: 100svh; }
  .hero-content { padding: 32px 16px; }
  .category-header { font-size: 1.5rem; }
  .amenity-list { font-size: 0.85rem; }
  .filter-btn { padding: 0.5rem 1rem; font-size: 0.85rem; flex-shrink: 0; }
  .gallery-container { gap: 1.25rem; }
}

@media (max-width: 480px) {
  .gallery-controls { padding: 1rem; }
  .gallery-container { gap: 1rem; }
  .lightbox { padding: 1rem; }
  .lightbox-content img { max-height: 70vh; }
}
</style>