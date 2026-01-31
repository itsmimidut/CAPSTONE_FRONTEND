<template>
  <article class="amenity-card">
    <div class="carousel-container">
      <!-- Carousel Track -->
      <div 
        class="carousel-track"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <div 
          v-for="(image, index) in images" 
          :key="index"
          class="carousel-slide"
        >
          <img :src="image" :alt="`${title} ${index + 1}`">
        </div>
      </div>

      <!-- Navigation Arrows -->
      <button 
        class="carousel-arrow prev" 
        @click="prevSlide"
        aria-label="Previous image"
      >
        &lt;
      </button>
      <button 
        class="carousel-arrow next" 
        @click="nextSlide"
        aria-label="Next image"
      >
        &gt;
      </button>

      <!-- Mobile See More Button -->
      <button 
        class="see-more-btn" 
        @click="showInfo = !showInfo"
      >
        {{ showInfo ? 'See Less' : 'See More' }}
      </button>

      <!-- Mobile Info Overlay -->
      <div 
        class="info-overlay"
        :class="{ show: showInfo }"
      >
        <div class="info-title">{{ title }}</div>
        <div class="info-desc">{{ description }}</div>
        <a 
          v-if="bookable"
          href="/reservation" 
          class="add-btn"
        >
          Book {{ title }}
        </a>
      </div>
    </div>

    <!-- Desktop Description -->
    <div class="p-6 bg-white">
      <p class="text-gray-600 mb-5">{{ description }}</p>
    </div>
  </article>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: String,
  description: String,
  images: Array,
  bookable: {
    type: Boolean,
    default: false
  }
})

const currentSlide = ref(0)
const showInfo = ref(false)
let autoplayInterval = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % props.images.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + props.images.length) % props.images.length
}

const startAutoplay = () => {
  autoplayInterval = setInterval(nextSlide, 4000)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped>
.amenity-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  display: flex;
  flex-direction: column;
  background: white;
}

.amenity-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 10px 30px rgba(2, 8, 20, 0.12);
}

.carousel-container {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  height: 220px;
}

@media (min-width: 641px) {
  .carousel-container {
    height: 260px;
  }
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease;
  height: 100%;
}

.carousel-slide {
  min-width: 100%;
  position: relative;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.amenity-card:hover .carousel-slide img {
  transform: scale(1.12);
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  background: rgba(255,255,255,.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #2B6CB0;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s ease;
  border: none;
}

.carousel-arrow:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 18px rgba(0,0,0,.15);
}

.carousel-arrow.prev {
  left: 1rem;
}

.carousel-arrow.next {
  right: 1rem;
}

.see-more-btn {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,.25);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border-radius: 50px;
  border: 1.5px solid rgba(255,255,255,.4);
  transition: all 0.3s ease;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
  cursor: pointer;
}

.see-more-btn:hover {
  background: rgba(255,255,255,.4);
  transform: translateX(-50%) translateY(-3px);
}

.info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1.5rem 1.5rem;
  background: linear-gradient(to top, rgba(139,94,60,.98), rgba(139,94,60,.9) 70%, transparent);
  color: white;
  transform: translateY(100%);
  transition: transform 0.4s ease;
  z-index: 15;
  border-radius: 0 0 16px 16px;
}

.info-overlay.show {
  transform: translateY(0);
}

.info-title {
  font-weight: 700;
  font-size: 1.35rem;
  text-shadow: 0 1px 3px rgba(0,0,0,.7);
  margin-bottom: 0.5rem;
}

.info-desc {
  font-size: 0.92rem;
  margin-bottom: 1rem;
  opacity: 0.95;
  line-height: 1.5;
}

.add-btn {
  background: #C19A6B;
  color: white;
  padding: 0.65rem 1.4rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(193,154,107,.3);
  display: inline-block;
  text-decoration: none;
}

.add-btn:hover {
  background: #8B5E3C;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139,94,60,.4);
}

@media (max-width: 640px) {
  .carousel-container {
    height: 220px;
  }
  
  .info-title {
    font-size: 1.25rem;
  }
  
  .info-desc {
    font-size: 0.9rem;
  }
  
  .see-more-btn {
    font-size: 0.8rem;
    padding: 0.45rem 1rem;
  }
  
  .add-btn {
    padding: 0.6rem 1.3rem;
    font-size: 0.85rem;
  }
  
  .amenity-card:hover {
    transform: translateY(-6px);
  }
}

@media (min-width: 641px) {
  .see-more-btn,
  .info-overlay {
    display: none !important;
  }
}
</style>