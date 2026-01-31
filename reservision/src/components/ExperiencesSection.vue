<template>
  <section class="py-16">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4 gradient-border section-head-center">
          Designed for Flow — Adventure & Calm
        </h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Transitions between thrill and rest are at the heart of ReserVision. Choose your rhythm and we'll take care of the rest.
        </p>
      </div>
      <div class="relative">
        <div class="flex overflow-x-auto pb-6 space-x-6 carousel-track">
          <div 
            v-for="experience in experiences" 
            :key="experience.title"
            class="flex-none w-80 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div 
              class="h-48 bg-cover bg-center" 
              :style="{ backgroundImage: `url(${experience.image})` }"
            ></div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-primary-blue mb-2">{{ experience.title }}</h3>
              <p class="text-gray-600">{{ experience.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const experiences = [
  {
    title: 'High-Speed Water Slides',
    description: 'Feel the adrenaline rush with multi-lane slides designed for both kids and thrill-seekers.',
    image: '/images/img7.jpg'
  },
  {
    title: 'Wave Pool & Lazy River',
    description: 'Enjoy gentle waves or drift peacefully down the river — the perfect balance of excitement and calm.',
    image: '/images/img3.jpg'
  },
  {
    title: 'Private Cabanas',
    description: 'Relax in shaded cabanas by the poolside, perfect for family gatherings or quiet moments.',
    image: '/images/img4.jpg'
  },
  {
    title: 'Evening Glow',
    description: 'Experience ReserVision at dusk, where the pools shimmer under the soft resort lighting.',
    image: '/images/img5.jpg'
  }
]
</script>

<style scoped>
.carousel-track {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.carousel-track::-webkit-scrollbar {
  display: none;
}

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