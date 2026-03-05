<template>
  <section class="image-gallery">
    <!-- Grid -->
    <div class="gallery-container">
      <div
        v-for="(item, index) in filteredImages"
        :key="index"
        @click="openLightbox(index)"
        class="gallery-item"
        :class="`category-${item.category}`"
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

    <!-- No Results -->
    <div v-if="filteredImages.length === 0" class="empty-state">
      <i class="fas fa-images empty-icon"></i>
      <p class="empty-title">No images found</p>
      <p class="empty-subtitle">Try adjusting your search or filter</p>
    </div>

    <!-- Lightbox -->
    <transition name="fade">
      <div v-if="lightboxOpen" class="lightbox" @click="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox">
          <i class="fas fa-times"></i>
        </button>
        
        <button 
          class="lightbox-nav prev" 
          @click.stop="prevImage"
          :disabled="currentImageIndex === 0"
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
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  searchQuery: String,
  activeFilter: String,
  images: Array
})

const lightboxOpen = ref(false)
const currentImageIndex = ref(0)
const hasMore = ref(true)

const filteredImages = computed(() => {
  let result = props.images || []

  // Filter by category
  if (props.activeFilter && props.activeFilter !== 'all') {
    result = result.filter(img => img.category === props.activeFilter)
  }

  // Filter by search
  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase()
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
    events: 'fas fa-calendar-alt',
    spa: 'fas fa-spa',
    beach: 'fas fa-umbrella-beach'
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

const loadMore = () => {
  // Simulate loading more images
  setTimeout(() => {
    alert('More stunning images coming soon!')
    hasMore.value = false
  }, 500)
}

// Keyboard navigation
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
.image-gallery {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;
}

/* Gallery Grid */
.gallery-container {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
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
}

@media (min-width: 1280px) {
  .gallery-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Gallery Item */
.gallery-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(31, 141, 191, 0.1);
  display: flex;
  flex-direction: column;
}

.gallery-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(31, 141, 191, 0.15);
  border-color: #F4C400;
}

/* Category-specific hover effects */
.gallery-item.category-resort:hover {
  border-color: #1F8DBF;
}
.gallery-item.category-rooms:hover {
  border-color: #1F8DBF;
}
.gallery-item.category-pool:hover {
  border-color: #F4C400;
}
.gallery-item.category-restaurant:hover {
  border-color: #F4C400;
}
.gallery-item.category-events:hover {
  border-color: #1F8DBF;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
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
  background: linear-gradient(to top, rgba(31, 141, 191, 0.2), transparent);
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
  font-size: 2.5rem;
  text-shadow: 0 2px 8px rgba(31, 141, 191, 0.5);
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.gallery-item:hover .overlay-icon {
  transform: translateY(0);
}

.image-caption {
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border-top: 2px solid rgba(244, 196, 0, 0.2);
  color: #1F8DBF;
  font-weight: 600;
  font-size: 1rem;
}

.caption-icon {
  color: #F4C400;
  font-size: 1rem;
  width: 1.5rem;
  text-align: center;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #F4C400;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
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

/* Gallery Footer */
.gallery-footer {
  text-align: center;
  margin-top: 3rem;
  padding-top: 1rem;
}

.btn-load-more {
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
  min-width: 240px;
}

.btn-load-more i {
  color: #F4C400;
  font-size: 1.1rem;
}

.btn-load-more:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(31, 141, 191, 0.3);
  background: linear-gradient(135deg, #1E88B6 0%, #1F8DBF 100%);
}

.btn-load-more:active {
  transform: translateY(0);
}

/* Lightbox */
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
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
}

.lightbox-close:hover {
  background: #F4C400;
  color: #1F8DBF;
  transform: rotate(90deg);
  border-color: #1F8DBF;
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
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(31, 141, 191, 0.3);
  border: 3px solid #F4C400;
  background: white;
}

.lightbox-caption {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(31, 141, 191, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 50px;
  border: 1px solid rgba(244, 196, 0, 0.3);
}

.lightbox-caption i {
  color: #F4C400;
  font-size: 1.1rem;
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
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.2);
}

.lightbox-nav:hover:not(:disabled) {
  background: #F4C400;
  color: #1F8DBF;
  transform: translateY(-50%) scale(1.1);
  border-color: #1F8DBF;
}

.lightbox-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: translateY(-50%) scale(0.9);
}

.lightbox-nav.prev {
  left: 2rem;
}

.lightbox-nav.next {
  right: 2rem;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .image-gallery {
    padding: 0 1rem;
    margin: 1.5rem auto;
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

  .btn-load-more {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .image-gallery {
    padding: 0 0.75rem;
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

/* Print Styles */
@media print {
  .image-gallery {
    margin: 1rem;
    padding: 0;
  }

  .gallery-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .gallery-item {
    box-shadow: none;
    border: 1px solid #ddd;
    page-break-inside: avoid;
  }

  .gallery-footer,
  .lightbox {
    display: none;
  }
}

/* Loading Animation */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.gallery-item.loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
</style>