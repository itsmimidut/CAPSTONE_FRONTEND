<template>
  <section class="py-16 bg-neutral-gray">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4 gradient-border section-head-center">Dining & Refreshments</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Poolside grills, family platters, and seasonal menus inspired by local produce.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Slideshow -->
        <div class="relative h-96 rounded-2xl overflow-hidden shadow-xl">
          <!-- Loading State -->
          <div v-if="loading" class="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
              <p class="text-gray-600 mt-2">Loading menu...</p>
            </div>
          </div>

          <!-- Slides -->
          <div 
            v-for="(dish, index) in displayDishes" 
            :key="index"
            class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            :class="currentSlide === index ? 'opacity-100' : 'opacity-0'"
            :style="{ backgroundImage: `url(${dish.image})` }"
          ></div>

          <!-- Mobile Info Overlay -->
          <div class="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white p-6 lg:hidden">
            <h3 class="text-2xl font-bold mb-3">{{ displayDishes[currentSlide].name }}</h3>
            <div 
              class="transition-all duration-300 ease-in-out"
              :class="showMore ? 'block' : 'hidden'"
            >
              <p class="text-gray-200 mb-3">{{ displayDishes[currentSlide].desc }}</p>
              <p class="text-lg font-semibold mb-1">{{ displayDishes[currentSlide].price }}</p>
              <p class="text-gray-300 mb-4">{{ displayDishes[currentSlide].persons }}</p>
              <div class="flex justify-center gap-3">
                <a href="/reservation" class="px-4 py-2 bg-warm-brown text-white rounded-md hover:bg-deep-brown transition">
                  Reserve
                </a>
                <button 
                  @click="$emit('open-menu')"
                  class="px-4 py-2 border border-white text-white rounded-md hover:bg-white/20 transition"
                >
                  View Menu
                </button>
              </div>
            </div>
            <button 
              @click="showMore = !showMore"
              class="mt-3 text-sm text-blue-300 underline"
            >
              {{ showMore ? 'See Less' : 'See More' }}
            </button>
          </div>
        </div>

        <!-- Desktop Info -->
        <div class="hidden lg:block">
          <h3 class="text-2xl font-bold text-primary-blue mb-4">{{ displayDishes[currentSlide].name }}</h3>
          <p class="text-gray-600 mb-6">{{ displayDishes[currentSlide].desc }}</p>
          <p class="text-xl font-bold text-warm-brown mb-2">{{ displayDishes[currentSlide].price }}</p>
          <p class="text-gray-500 mb-8">{{ displayDishes[currentSlide].persons }}</p>
          <div class="flex flex-row gap-4 justify-start">
            <a 
              href="/reservation" 
              class="px-6 py-3 bg-warm-brown text-white font-semibold rounded-lg hover:bg-deep-brown transition-colors duration-300"
            >
              Order Now
            </a>
            <button 
              @click="$emit('open-menu')"
              class="px-6 py-3 border border-primary-blue text-primary-blue font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-300"
            >
              View Full Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useMenu } from '../composables/useMenu'

defineEmits(['open-menu'])

const currentSlide = ref(0)
const showMore = ref(false)
let slideInterval = null

// Use menu composable
const { items, availableItems, loading, error, fetchAll, formatPrice, getMenuImage } = useMenu()

// Build menu items for the slideshow
const dishes = computed(() => {
  const source = availableItems.value.length > 0 ? availableItems.value : items.value
  return source.map(item => ({
    id: item.menu_id,
    name: item.name || 'Menu Item',
    desc: item.description || 'Delicious menu item available for ordering',
    price: formatPrice(item.price || 0),
    persons: 'Individual serving',
    image: getMenuImage(item) || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    status: item.available
  }))
})

// Fallback dishes if API doesn't return any
const fallbackDishes = [
  {
    name: "Poolside Grill & Café",
    desc: "Fresh flavors, kid-friendly menus, and evening specials with live acoustic sessions.",
    price: "₱1,200 – ₱2,000 per platter",
    persons: "Good for 3–5 persons",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Tropical Seafood Feast",
    desc: "A combination of grilled prawns, tuna belly, and squid served with tangy citrus sauce.",
    price: "₱2,500 – ₱3,000 per set",
    persons: "Good for 4–6 persons",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Island Pasta Bowl",
    desc: "Creamy coconut seafood pasta topped with basil and local spices.",
    price: "₱900 per bowl",
    persons: "Good for 1–2 persons",
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80"
  }
]

// Display dishes - use API data if available, fallback to mockups
const displayDishes = computed(() => {
  return dishes.value.length > 0 ? dishes.value : fallbackDishes
})

onMounted(async () => {
  // Fetch all items from inventory API
  try {
    await fetchAll()
  } catch (err) {
    console.warn('Failed to fetch menu items:', err)
  }
  
  // Start auto-rotation
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % displayDishes.value.length
  }, 5000)
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})
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