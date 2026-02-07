<template>
  <div class="min-h-screen bg-gradient">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <RatesHero />

    <!-- Rates Image Carousel -->
    <section class="bg-white">
      <div class="w-full h-screen px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div class="relative w-full h-full">
          <div class="overflow-hidden rounded-xl shadow-lg border border-gray-200 bg-white h-full flex items-center justify-center">
            <img
              :src="slides[currentSlide].src"
              :alt="slides[currentSlide].alt"
              class="w-full h-full object-contain bg-white"
              loading="lazy"
            />
          </div>

          <!-- Manual Controls -->
          <button
            class="carousel-btn left-4"
            @click="prevSlide"
            aria-label="Previous image"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            class="carousel-btn right-4"
            @click="nextSlide"
            aria-label="Next image"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <!-- Dots -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
          <button
            v-for="(slide, index) in slides"
            :key="slide.src"
            class="dot"
            :class="{ active: index === currentSlide }"
            @click="goToSlide(index)"
            :aria-label="`Go to slide ${index + 1}`"
          ></button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />

    <!-- Chatbot -->
    <ChatbotModal />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'
import RatesHero from '../../components/RatesHero.vue'

const sidebarOpen = ref(false)
const slides = [
  {
    src: '/rates/rates1.jpg',
    alt: 'Eduardo’s Resort rates poster'
  },
  {
    src: '/rates/rates2.jpg',
    alt: 'Eduardo’s Resort rates poster'
  }
]

const currentSlide = ref(0)
let autoSlideInterval

const goToSlide = (index) => {
  currentSlide.value = index
}

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

const startAutoSlide = () => {
  if (slides.length <= 1) return
  autoSlideInterval = setInterval(() => {
    nextSlide()
  }, 5000)
}

const stopAutoSlide = () => {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval)
  }
}

onMounted(() => {
  startAutoSlide()
})

onBeforeUnmount(() => {
  stopAutoSlide()
})
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(to bottom, #E0F7FA, white);
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(15, 23, 42, 0.6);
  color: white;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.carousel-btn:hover {
  background: rgba(15, 23, 42, 0.8);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: none;
  background: #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dot.active {
  width: 20px;
  background: #2B6CB0;
}
</style>