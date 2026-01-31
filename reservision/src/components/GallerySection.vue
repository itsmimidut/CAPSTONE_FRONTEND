<template>
  <section class="py-16 bg-neutral-gray">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4 gradient-border section-head-center">Moments at ReserVision</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Snapshots from daily life and special events at the resort.
        </p>
      </div>

      <div class="relative overflow-hidden mb-12">
        <div 
          class="flex transition-transform duration-700 ease-in-out"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div 
            v-for="image in images" 
            :key="image"
            class="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 p-2"
          >
            <div 
              class="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-64 bg-cover bg-center"
              :style="{ backgroundImage: `url(${image})` }"
            ></div>
          </div>
        </div>

        <!-- Navigation -->
        <button 
          @click="prev"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 bg-primary-blue text-white rounded-full p-2 hover:bg-blue-700 shadow-md transition-colors"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <button 
          @click="next"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary-blue text-white rounded-full p-2 hover:bg-blue-700 shadow-md transition-colors"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- CTA Card -->
      <div class="bg-gradient-to-r from-primary-blue to-accent-blue rounded-2xl p-6 text-white text-center mt-12 mx-6">
        <p class="text-sm mb-4">
          Plan your visit — reserve tickets, book lessons, or enjoy a private cabana at ReserVision.
        </p>
        <div class="flex flex-row justify-center gap-3 flex-wrap">
          <a 
            href="/reservation" 
            class="px-4 py-2 bg-white text-primary-blue font-semibold rounded-md hover:bg-gray-100 transition duration-300 text-sm w-auto"
          >
            Reserve Now
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const currentIndex = ref(0)

const images = [
  'images/img11.jpg',
  'images/img1.jpg',
  'images/img2.jpg',
  'images/img14.jpg'
]

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length
}
</script>

<style scoped>
.gradient-border {
  position: relative;
}
.gradient-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #2B6CB0, #C19A6B);
  border-radius: 3px;
}
.section-head-center::after {
  left: 50%;
  transform: translateX(-50%);
}
</style>