<template>
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-primary-blue mb-8 text-center">Our Suites</h2>
      <div class="relative overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="w-full h-80 bg-gray-200 flex items-center justify-center rounded-xl">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
            <p class="text-gray-600 mt-2">Loading rooms...</p>
          </div>
        </div>

        <!-- Carousel -->
        <div v-else class="flex transition-transform duration-700 ease-in-out"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div 
            v-for="suite in displaySuites" 
            :key="suite.name"
            class="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 p-2"
          >
            <div class="relative w-full h-80 cursor-pointer group perspective-1000">
              <div class="absolute w-full h-full transition-transform duration-700 transform-style-preserve-3d group-hover:rotate-y-180">
                <!-- Front -->
                <div class="absolute w-full h-full backface-hidden">
                  <img 
                    :src="suite.image" 
                    :alt="suite.name" 
                    class="w-full h-full object-cover rounded-xl shadow-md"
                  />
                  <!-- Overlay with info -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl flex flex-col justify-end p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 class="text-xl font-bold mb-2">{{ suite.name }}</h3>
                    <p class="text-sm text-gray-200 mb-3">{{ suite.description }}</p>
                    <p class="font-semibold text-warm-brown">{{ suite.price }}</p>
                    <p class="text-xs text-gray-300">Capacity: {{ suite.max_guests }} guests</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <button 
          @click="prev"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 bg-primary-blue text-white rounded-full p-2 hover:bg-blue-700 transition-colors z-10"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <button 
          @click="next"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary-blue text-white rounded-full p-2 hover:bg-blue-700 transition-colors z-10"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </section>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRooms } from '../composables/useRooms'

const currentIndex = ref(0)

// Use rooms composable
const { items, loading, error, fetchAll, getRoomImage, formatPrice } = useRooms()

/**
 * Computed property: Extract room/suite items from API
 * Filters items by category_type 'room' or 'cottage' and maps to suite display structure
 */
const rooms = computed(() => {
  return items.value
    .filter(item => item.category_type === 'room' || item.category_type === 'cottage' || item.category === 'room' || item.category === 'cottage')
    .map(item => ({
      id: item.item_id,
      name: item.name || item.room_number || 'Suite',
      description: item.description || `Beautiful ${item.name || 'suite'} with premium amenities`,
      image: getRoomImage(item) || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
      price: item.price ? formatPrice(item.price) : 'Contact for pricing',
      max_guests: item.max_guests || 2,
      status: item.status
    }))
})

/**
 * Fallback suites if API doesn't return any room data
 */
const fallbackSuites = [
  {
    name: 'Deluxe Suite',
    image: 'images/588883153_1392177598927172_3527689661236527003_n.jpg',
    description: 'Comfortable suite with modern amenities and scenic views',
    price: '₱3,500/night',
    max_guests: 2
  },
  {
    name: 'Family Suite',
    image: 'images/589620010_1592467378846157_7467610011731953093_n.webp',
    description: 'Spacious family-friendly suite perfect for groups',
    price: '₱5,500/night',
    max_guests: 4
  },
  {
    name: 'Presidential Suite',
    image: 'images/590126911_1875370976412302_7394242750170459675_n.jpg',
    description: 'Luxury suite with premium amenities and private balcony',
    price: '₱8,000/night',
    max_guests: 6
  }
]

/**
 * Computed property: Display suites - use API data if available, fallback to mockups
 */
const displaySuites = computed(() => {
  return rooms.value.length > 0 ? rooms.value : fallbackSuites
})

/**
 * Navigate to next suite
 */
const next = () => {
  currentIndex.value = (currentIndex.value + 1) % displaySuites.value.length
}

/**
 * Navigate to previous suite
 */
const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + displaySuites.value.length) % displaySuites.value.length
}

/**
 * Lifecycle hook: Fetch room data from API when component mounts
 */
onMounted(async () => {
  try {
    await fetchAll()
  } catch (err) {
    console.warn('Failed to fetch room data:', err)
  }
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>