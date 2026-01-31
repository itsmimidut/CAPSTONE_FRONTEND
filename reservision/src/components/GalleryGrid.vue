<template>
  <section class="image-gallery">
    <!-- Grid -->
    <div class="gallery-container">
      <div
        v-for="(item, index) in filteredImages"
        :key="index"
        @click="openLightbox(index)"
        class="gallery-item"
      >
        <img 
          :src="item.image" 
          :alt="item.caption"
          @error="handleImageError"
        />
        <div class="image-caption">
          <i :class="getCategoryIcon(item.category)" class="mr-2"></i>
          {{ item.caption }}
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="filteredImages.length === 0" class="no-results">
      <i class="fas fa-image text-6xl mb-4 text-gray-300"></i>
      <p class="text-xl text-gray-500">No images found</p>
      <p class="text-sm text-gray-400">Try a different search or filter</p>
    </div>

    <!-- Load More Button -->
    <div v-if="filteredImages.length > 0 && hasMore" class="gallery-pagination">
      <button @click="loadMore" class="load-more-btn">
        <i class="fas fa-images mr-2"></i>
        Load More Images
      </button>
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
import { ref, computed } from 'vue'

const props = defineProps({
  searchQuery: String,
  activeFilter: String,
  images: Array
})

const lightboxOpen = ref(false)
const currentImageIndex = ref(0)
const hasMore = ref(true)

const filteredImages = computed(() => {
  let result = props.images

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
    rooms: 'fas fa-home',
    pool: 'fas fa-swimming-pool',
    restaurant: 'fas fa-utensils',
    events: 'fas fa-calendar-alt'
  }
  return icons[category] || 'fas fa-image'
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  const placeholder = event.target.nextElementSibling
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
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
  alert('More stunning images coming soon!')
  hasMore.value = false
}

// Keyboard navigation
const handleKeydown = (e) => {
  if (!lightboxOpen.value) return
  
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>
.image-gallery {
  max-width: 1400px;
  margin: 0 auto 3rem;
  padding: 0 1rem;
}

.gallery-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .gallery-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .gallery-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

.gallery-item {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  cursor: pointer;
  position: relative;
}

.gallery-item:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 12px 28px rgba(0,0,0,0.15);
}

.gallery-item img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
  transition: transform 0.7s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.image-caption {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #2D3748;
  font-size: 1.05rem;
  background: white;
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
}

.gallery-pagination {
  text-align: center;
  margin-top: 3rem;
}

.load-more-btn {
  background: linear-gradient(135deg, #C19A6B, #8B5E3C);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(193, 154, 107, 0.3);
}

.load-more-btn:hover {
  background: linear-gradient(135deg, #8B5E3C, #6d4a2e);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(139, 94, 60, 0.4);
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
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
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  z-index: 10001;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.lightbox-caption {
  margin-top: 1.5rem;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: none;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  z-index: 10001;
}

.lightbox-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
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

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .lightbox-nav {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
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
  }
}
</style>