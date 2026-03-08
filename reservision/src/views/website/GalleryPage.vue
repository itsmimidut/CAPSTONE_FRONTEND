<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-yellow-50/30 overflow-x-hidden">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <section
      class="relative flex items-center justify-center min-h-[450px] sm:min-h-[550px] gallery-hero text-center px-4 overflow-hidden pt-[78px]"
    >
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-10 left-10 w-32 h-32 bg-[#1F8DBF]/20 rounded-full blur-3xl animate-pulse-hero"></div>
        <div class="absolute bottom-10 right-10 w-40 h-40 bg-[#F4C400]/20 rounded-full blur-3xl animate-pulse-hero delay-1000"></div>
      </div>

      <div class="absolute inset-0 bg-gradient-to-br from-[#1F8DBF]/20 via-[#F4C400]/10 to-[#F4C400]/20"></div>

      <div class="relative z-10 max-w-4xl w-full backdrop-blur-md bg-white/50 rounded-2xl p-8 sm:p-10 md:p-12 shadow-2xl mx-4 flex flex-col justify-center border border-white/40 my-12">
        <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-[#F4C400]/5 to-[#1F8DBF]/10 rounded-2xl pointer-events-none"></div>

        <div class="relative z-20 flex flex-col items-center justify-center">
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-[#F4C400]/30 rounded-full blur-2xl animate-pulse-slow-hero"></div>

          <h1 class="text-[32px] sm:text-[40px] md:text-[48px] font-bold leading-tight relative mb-2">
            <span class="text-[#0C3B5E] drop-shadow-lg">Explore Our Gallery</span>
          </h1>

          <div class="mt-4 mb-2">
            <p class="text-xs sm:text-sm text-[#0C3B5E]/80 leading-relaxed drop-shadow-md font-medium max-w-2xl mx-auto">
              Discover the beauty, comfort, and unforgettable moments at Eduardo's Resort.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Floating decorative background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-yellow-400/10 rounded-full blur-3xl animate-float-1"></div>
      <div class="absolute bottom-1/3 right-10 w-40 h-40 bg-gradient-to-tr from-blue-300/5 to-yellow-300/10 rounded-full blur-3xl animate-float-2"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-blue-200/5 to-yellow-200/5 rounded-full blur-3xl animate-pulse-soft"></div>
    </div>

    <!-- Controls -->
    <section class="relative py-10 sm:py-12">
      <div class="container mx-auto px-4 max-w-7xl relative z-10">
        <!-- Decorative divider -->
        <div class="flex justify-center items-center mb-8">
          <div class="h-1 w-16 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
          <div class="mx-4">
            <div class="w-4 h-4 bg-gradient-to-br from-yellow-400 to-blue-400 rounded-full animate-spin-slow"></div>
          </div>
          <div class="h-1 w-16 bg-gradient-to-l from-blue-400 to-transparent rounded-full"></div>
        </div>

        <div class="text-center mb-8 reveal visible">
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
            <!-- Search -->
            <div class="search-wrapper">
              <i class="fas fa-search search-icon"></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search images (e.g., 'pool', 'cottage')..."
                class="search-input"
              />
            </div>

            <!-- Filters -->
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
            class="gallery-item reveal visible"
            :class="`category-${item.category}`"
            @click="openLightbox(index)"
          >
            <div class="image-wrapper">
              <img
                :src="item.image"
                :alt="item.caption"
                @error="handleImageError"
                loading="lazy"
              />
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

        <button
          class="lightbox-nav prev"
          @click.stop="prevImage"
          :disabled="currentImageIndex === 0"
          type="button"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <div class="lightbox-content" @click.stop>
          <img
            :src="filteredImages[currentImageIndex]?.image"
            :alt="filteredImages[currentImageIndex]?.caption"
          />
          <div class="lightbox-caption">
            <i :class="getCategoryIcon(filteredImages[currentImageIndex]?.category)" class="caption-icon"></i>
            {{ filteredImages[currentImageIndex]?.caption }}
          </div>
        </div>

        <button
          class="lightbox-nav next"
          @click.stop="nextImage"
          :disabled="currentImageIndex === filteredImages.length - 1"
          type="button"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </transition>

    <!-- Footer -->
    <AppFooter />

    <!-- Chatbot -->
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

  if (activeFilter.value !== 'all') {
    result = result.filter(img => img.category === activeFilter.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(img =>
      img.caption.toLowerCase().includes(query) ||
      img.category.toLowerCase().includes(query)
    )
  }

  return result
})

const getCategoryIcon = (category) => {
  const icons = {
    resort: 'fas fa-hotel',
    rooms: 'fas fa-bed',
    pool: 'fas fa-swimming-pool',
    restaurant: 'fas fa-utensils',
    events: 'fas fa-calendar-alt'
  }
  return icons[category] || 'fas fa-image'
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'
}

const openLightbox = (index) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

const nextImage = () => {
  if (currentImageIndex.value < filteredImages.value.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const handleKeydown = (e) => {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.gallery-hero {
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

.gallery-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.2) 100%);
  pointer-events: none;
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.category-header {
  font-weight: 900;
  font-size: 2.5rem;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.amenity-list {
  color: rgb(30, 64, 175);
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  letter-spacing: 0.3px;
}

.gallery-controls {
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(12px);
  padding: 1.5rem 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(31, 141, 191, 0.08);
  border: 1px solid rgba(31, 141, 191, 0.12);
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
  background: #F9FAFB;
  border-radius: 12px;
  border: 2px solid rgba(30, 136, 182, 0.16);
  transition: all 0.3s ease;
  padding: 0 0.9rem;
  height: 50px;
}

.search-wrapper:focus-within {
  border-color: #F2C200;
  box-shadow: 0 0 0 3px rgba(242, 194, 0, 0.15);
}

.search-icon {
  color: #F2C200;
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
  color: #1E88B6;
  font-weight: 500;
  height: 100%;
}

.search-input::placeholder {
  color: rgba(30, 136, 182, 0.4);
}

.filter-categories {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-btn {
  padding: 0.7rem 1.4rem;
  background: white;
  border: 2px solid rgba(30, 136, 182, 0.15);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
  font-size: 0.92rem;
  color: #1E88B6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(31, 141, 191, 0.04);
}

.filter-btn i {
  color: #F2C200;
  font-size: 0.9rem;
}

.filter-btn:hover {
  border-color: #F2C200;
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(242, 194, 0, 0.15);
  background: rgba(242, 194, 0, 0.04);
}

.filter-btn.active {
  background: linear-gradient(135deg, #1E88B6 0%, #1F8DBF 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 6px 16px rgba(30, 136, 182, 0.26);
}

.filter-btn.active i {
  color: #F4C400;
}

.gallery-container {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
}

.gallery-item {
  background: rgba(255,255,255,0.94);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(31, 141, 191, 0.08);
  transition: all 0.35s ease;
  cursor: pointer;
  border: 1px solid rgba(31, 141, 191, 0.1);
  display: flex;
  flex-direction: column;
}

.gallery-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 36px rgba(31, 141, 191, 0.14);
  border-color: #F4C400;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: rgba(31, 141, 191, 0.05);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  display: block;
}

.gallery-item:hover img {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(31, 141, 191, 0.25), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-item:hover .image-overlay {
  opacity: 1;
}

.overlay-icon {
  color: white;
  font-size: 2.4rem;
  text-shadow: 0 2px 8px rgba(31, 141, 191, 0.5);
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.gallery-item:hover .overlay-icon {
  transform: translateY(0);
}

.image-caption {
  padding: 1.15rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border-top: 2px solid rgba(244, 196, 0, 0.15);
  color: #1F8DBF;
  font-weight: 700;
  font-size: 0.98rem;
}

.caption-icon {
  color: #F4C400;
  font-size: 1rem;
  width: 1.5rem;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  border: 2px dashed #F4C400;
  box-shadow: 0 10px 24px rgba(31, 141, 191, 0.08);
}

.empty-icon {
  font-size: 4rem;
  color: #F4C400;
  opacity: 0.5;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F8DBF;
  margin: 0 0 0.5rem 0;
}

.empty-subtitle {
  color: #1E88B6;
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(31, 141, 191, 0.95);
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
  color: #1F8DBF;
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

.lightbox-close:hover {
  background: #F4C400;
  transform: rotate(90deg);
}

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
  box-shadow: 0 20px 40px rgba(31, 141, 191, 0.3);
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
  background: rgba(31, 141, 191, 0.3);
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
  color: #1F8DBF;
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

.lightbox-nav:hover:not(:disabled) {
  background: #F4C400;
  transform: translateY(-50%) scale(1.08);
}

.lightbox-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.lightbox-nav.prev {
  left: 2rem;
}

.lightbox-nav.next {
  right: 2rem;
}

.reveal {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

@media (min-width: 640px) {
  .gallery-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .gallery-container {
    grid-template-columns: repeat(3, 1fr);
  }

  .controls-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

@media (min-width: 1280px) {
  .gallery-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .category-header {
    font-size: 1.8rem;
  }

  .amenity-list {
    font-size: 0.95rem;
  }

  .gallery-controls {
    padding: 1.25rem;
  }

  .search-wrapper {
    max-width: 100%;
    min-width: auto;
  }

  .filter-categories {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    margin-bottom: -0.5rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: #F2C200 rgba(30, 136, 182, 0.1);
    flex-wrap: nowrap;
  }

  .gallery-container {
    gap: 1.25rem;
  }

  .image-caption {
    padding: 1rem;
    font-size: 0.95rem;
  }

  .lightbox-nav {
    width: 48px;
    height: 48px;
    font-size: 1.1rem;
  }

  .lightbox-nav.prev {
    left: 1rem;
  }

  .lightbox-nav.next {
    right: 1rem;
  }

  .lightbox-close {
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .lightbox-caption {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }
}

@media (max-width: 640px) {
  .gallery-hero {
    min-height: 450px;
  }

  .text-\[32px\] {
    font-size: 28px;
  }

  .max-w-2xl {
    max-width: 100%;
  }

  .category-header {
    font-size: 1.5rem;
  }

  .amenity-list {
    font-size: 0.85rem;
  }

  .search-input {
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }

  .search-wrapper {
    height: 44px;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    gap: 0.35rem;
    flex-shrink: 0;
  }

  .filter-btn i {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .gallery-controls {
    padding: 1rem;
  }

  .gallery-container {
    gap: 1rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-title {
    font-size: 1.25rem;
  }

  .lightbox {
    padding: 1rem;
  }

  .lightbox-content img {
    max-height: 70vh;
  }
}
</style>