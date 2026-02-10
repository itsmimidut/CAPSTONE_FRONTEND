<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-yellow-50/30 overflow-hidden">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Floating gradient orbs -->
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-yellow-400/5 rounded-full blur-3xl animate-float-1"></div>
      <div class="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-tr from-blue-300/5 to-yellow-300/5 rounded-full blur-3xl animate-float-2"></div>
      <div class="absolute top-2/3 left-1/3 w-56 h-56 bg-gradient-to-r from-blue-200/5 to-yellow-200/5 rounded-full blur-3xl animate-pulse-slow"></div>
      
      <!-- Animated scanning lines -->
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-scan"></div>
      <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-scan-delayed"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10">
      <!-- Hero -->
      <GalleryHero />
      
      <!-- Interactive Controls -->
      <div class="container mx-auto px-4 max-w-7xl">
        <!-- Decorative Separator -->
        <div class="flex justify-center items-center my-12">
          <div class="h-1 w-32 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
          <div class="mx-6">
            <div class="w-4 h-4 bg-gradient-to-br from-yellow-400 to-blue-400 rounded-full animate-spin-slow"></div>
          </div>
          <div class="h-1 w-32 bg-gradient-to-l from-blue-400 to-transparent rounded-full"></div>
        </div>

        <!-- Interactive Filter Stats -->
        <div class="mb-8 text-center reveal">
          <div class="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-blue-50 to-yellow-50/50 rounded-full border border-blue-100 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span class="text-blue-800 font-semibold text-sm">
                {{ filteredImages.length }} Images
              </span>
            </div>
            <div class="h-4 w-px bg-blue-200"></div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-300"></div>
              <span class="text-blue-800 font-semibold text-sm">
                {{ activeFilter === 'all' ? 'All Categories' : activeFilter }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <GalleryControls 
        v-model:searchQuery="searchQuery"
        v-model:activeFilter="activeFilter"
      />

      <!-- Gallery Grid -->
      <GalleryGrid 
        :searchQuery="searchQuery"
        :activeFilter="activeFilter"
        :images="galleryImages"
      />

      <!-- Interactive Call to Action -->
      <div class="container mx-auto px-4 max-w-7xl py-16 text-center">
        <div class="inline-block relative group">
          <div class="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-yellow-400/20 to-blue-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <button 
            @click="scrollToTop"
            class="relative px-10 py-4 bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold rounded-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 text-lg shadow-lg flex items-center justify-center gap-3 mx-auto"
          >
            <i class="fas fa-images text-lg"></i>
            View More Photos
          </button>
        </div>
        <p class="mt-6 text-gray-600 text-sm max-w-md mx-auto">
          Experience our resort through these stunning visuals. Every picture tells a story of luxury and relaxation.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <AppFooter />

    <!-- Chatbot -->
    <ChatbotModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'
import GalleryHero from '../../components/GalleryHero.vue'
import GalleryControls from '../../components/GalleryControls.vue'
import GalleryGrid from '../../components/GalleryGrid.vue'

const sidebarOpen = ref(false)
const searchQuery = ref('')
const activeFilter = ref('all')

const galleryImages = [
  // Resort
  {
    image: 'https://images.unsplash.com/photo-1586375300773-8384e3e4916f?auto=format&fit=crop&w=800&q=80',
    caption: 'Grand Entrance',
    category: 'resort'
  },
  {
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
    caption: 'Tropical Gardens',
    category: 'resort'
  },
  {
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    caption: 'Resort Pathway',
    category: 'resort'
  },
  
  // Cottages/Rooms
  {
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
    caption: 'Ocean View Cottage',
    category: 'rooms'
  },
  {
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    caption: 'Deluxe Aircon Cottage',
    category: 'rooms'
  },
  {
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    caption: 'Family Suite',
    category: 'rooms'
  },
  {
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    caption: 'Premium Villa',
    category: 'rooms'
  },
  
  // Pool
  {
    image: 'images/img1.jpg',
    caption: 'Mini-Olympic Pool',
    category: 'pool'
  },
  {
    image: 'images/img7.jpg',
    caption: 'Kiddie Pool with Slide',
    category: 'pool'
  },
  {
    image: 'images/img3.jpg',
    caption: 'Pool Area at Sunset',
    category: 'pool'
  },
  {
    image: 'images/img5.jpg',
    caption: 'Evening Pool Glow',
    category: 'pool'
  },
  
  // Dining/Restaurant
  {
    image: 'images/img8.jpg',
    caption: 'Gourmet Restaurant',
    category: 'restaurant'
  },
  {
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    caption: 'Fine Dining Experience',
    category: 'restaurant'
  },
  {
    image: 'images/img4.jpg',
    caption: 'Poolside Bar',
    category: 'restaurant'
  },
  {
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    caption: 'Outdoor Dining',
    category: 'restaurant'
  },
  
  // Events
  {
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    caption: 'Elegant Function Hall',
    category: 'events'
  },
  {
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    caption: 'Dream Beach Wedding',
    category: 'events'
  },
  {
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    caption: 'Corporate Events',
    category: 'events'
  },
  {
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    caption: 'Celebration Venue',
    category: 'events'
  }
]

// Compute filtered images
const filteredImages = computed(() => {
  let filtered = galleryImages
  
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(img => img.category === activeFilter.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(img => 
      img.caption.toLowerCase().includes(query) || 
      img.category.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

// Scroll to top function
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Intersection Observer for reveal animations
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<style scoped>
/* Animations */
@keyframes float-1 {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  33% {
    transform: translateY(-20px) translateX(15px);
  }
  66% {
    transform: translateY(10px) translateX(-10px);
  }
}

@keyframes float-2 {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  33% {
    transform: translateY(15px) translateX(-20px);
  }
  66% {
    transform: translateY(-10px) translateX(10px);
  }
}

@keyframes scan {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-float-1 {
  animation: float-1 18s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 20s ease-in-out infinite;
  animation-delay: 3s;
}

.animate-scan {
  animation: scan 4s linear infinite;
}

.animate-scan-delayed {
  animation: scan 4s linear infinite;
  animation-delay: 2s;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse 5s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 12s linear infinite;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

/* Reveal animation */
.reveal {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), 
              transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Hover effects */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .py-16 {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }
  
  .px-10 {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
</style>