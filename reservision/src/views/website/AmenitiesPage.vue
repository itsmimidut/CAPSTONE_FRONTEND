<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-yellow-50/30">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <AmenitiesHero />

    <!-- Animated Background Elements -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-yellow-400/10 rounded-full blur-3xl animate-float-1"></div>
      <div class="absolute bottom-1/3 right-10 w-40 h-40 bg-gradient-to-tr from-blue-300/5 to-yellow-300/10 rounded-full blur-3xl animate-float-2"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-blue-200/5 to-yellow-200/5 rounded-full blur-3xl animate-pulse-slow"></div>
    </div>

    <!-- Amenities Grid -->
    <section id="amenity-grid" class="relative py-20">
      <div class="container mx-auto px-4 max-w-7xl relative z-10">
        
        <!-- Category 1: Pools -->
        <div class="mb-16 relative">
          <!-- Decorative divider -->
          <div class="flex justify-center items-center mb-10">
            <div class="h-1 w-16 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
            <div class="mx-4">
              <div class="w-4 h-4 bg-gradient-to-br from-yellow-400 to-blue-400 rounded-full animate-spin-slow"></div>
            </div>
            <div class="h-1 w-16 bg-gradient-to-l from-blue-400 to-transparent rounded-full"></div>
          </div>
          
          <h2 class="category-header reveal text-center">
            <span class="inline-block bg-gradient-to-r from-blue-800 via-blue-700 to-yellow-600 bg-clip-text text-transparent">
              Aquatic Paradise
            </span>
          </h2>
          <p class="amenity-list reveal text-center">
            <span class="inline-block px-4 py-2 bg-gradient-to-r from-blue-50 to-yellow-50/50 rounded-full border border-blue-100 shadow-sm">
              MINI-OLYMPIC SIZE SWIMMING POOL • KIDDIE POOL w/ SLIDE • SWIMMING CLUB
            </span>
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            <AmenityCard
              v-for="(amenity, index) in poolAmenities"
              :key="amenity.title"
              :title="amenity.title"
              :description="amenity.description"
              :images="amenity.images"
              class="reveal group hover:transform hover:-translate-y-2 transition-all duration-500"
              :style="`transition-delay: ${index * 100}ms`"
            />
          </div>
        </div>

        <!-- Decorative Separator -->
        <div class="my-20 flex justify-center">
          <div class="w-24 h-1 bg-gradient-to-r from-blue-400 via-yellow-400 to-blue-400 rounded-full animate-pulse-slow"></div>
        </div>

        <!-- Category 2: Dining & Events -->
        <div class="relative">
          <!-- Decorative divider -->
          <div class="flex justify-center items-center mb-10">
            <div class="h-1 w-16 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
            <div class="mx-4">
              <div class="w-4 h-4 bg-gradient-to-br from-blue-400 to-yellow-400 rounded-full animate-spin-slow"></div>
            </div>
            <div class="h-1 w-16 bg-gradient-to-l from-yellow-400 to-transparent rounded-full"></div>
          </div>
          
          <h2 class="category-header reveal text-center">
            <span class="inline-block bg-gradient-to-r from-yellow-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Luxury Comfort & Dining
            </span>
          </h2>
          <p class="amenity-list reveal text-center">
            <span class="inline-block px-4 py-2 bg-gradient-to-r from-yellow-50 to-blue-50/50 rounded-full border border-yellow-100 shadow-sm">
              BAR and RESTAURANT • FUNCTION HALL • AIR CONDITIONED ROOMS
            </span>
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            <AmenityCard
              v-for="(amenity, index) in eventAmenities"
              :key="amenity.title"
              :title="amenity.title"
              :description="amenity.description"
              :images="amenity.images"
              :bookable="amenity.bookable"
              class="reveal group hover:transform hover:-translate-y-2 transition-all duration-500"
              :style="`transition-delay: ${index * 100 + 300}ms`"
            />
          </div>
        </div>

        <!-- Call to Action Section -->
        <div class="mt-20 text-center reveal">
          <div class="inline-block relative group">
            <div class="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-yellow-400/20 to-blue-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <router-link
              to="/reservation"
              class="relative px-10 py-4 bg-gradient-to-r from-blue-600 to-yellow-500 text-white font-bold rounded-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 text-lg shadow-lg flex items-center justify-center gap-3"
            >
              <i class="fas fa-calendar-check text-lg"></i>
              Book Your Experience Today
            </router-link>
          </div>
          <p class="mt-6 text-gray-600 text-sm max-w-md mx-auto">
            Experience world-class amenities designed for unforgettable moments with family and friends.
          </p>
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
import { ref, onMounted } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'
import AmenitiesHero from '../../components/AmenitiesHero.vue'
import AmenityCard from '../../components/AmenityCard.vue'

const sidebarOpen = ref(false)

const poolAmenities = [
  {
    title: 'Mini-Olympic Size Swimming Pool',
    description: 'Dive into our expansive pool with crystal-clear, temperature-controlled water. Perfect for laps, family swims, or floating under the tropical sun.',
    images: [
      '/images/img1.jpg',
      '/images/img3.jpg',
      '/images/img5.jpg'
    ]
  },
  {
    title: 'Kiddie Pool w/ Slide',
    description: 'A colorful, shallow splash zone with a twisting slide designed just for little ones. Safe, supervised, and endlessly entertaining.',
    images: [
      'images/img1.jpg',
      'images/img2.jpg'
    ]
  },
  {
    title: 'Swimming Club',
    description: 'Join exclusive aqua-aerobics, swim lessons, or friendly competitions. Certified coaches ensure fun and fitness for all ages.',
    images: [
      'images/img7.jpg',
      'images/img1.jpg'
    ]
  }
]

const eventAmenities = [
  {
    title: 'Bar and Restaurant',
    description: 'Savor tropical cocktails and gourmet Filipino-international fusion dishes while overlooking the pools. Open from sunrise to midnight.',
    images: [
      'images/img8.jpg',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    title: 'Function Hall',
    description: 'Elegant, air-conditioned venue for weddings, corporate events, or birthdays. State-of-the-art AV and catering services included.',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    title: 'Air-Conditioned Cottages',
    description: 'Private, stylish cottages with plush beds, en-suite bathrooms, and scenic views. Your serene home-away-from-home.',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'images/img10.jpg'
    ],
    bookable: true
  }
]

// Intersection Observer for scroll reveal
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
  
  // Add mouse move effect for amenity cards
  const cards = document.querySelectorAll('.group')
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10
      
      card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-8px)`
    })
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0)'
    })
  })
})
</script>

<style scoped>
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

/* Animations */
@keyframes float-1 {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  33% {
    transform: translateY(-15px) translateX(10px);
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
    transform: translateY(10px) translateX(-15px);
  }
  66% {
    transform: translateY(-10px) translateX(10px);
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

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
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

.animate-pulse-slow {
  animation: pulse 3s ease-in-out infinite;
}

/* Hover effects for cards */
.group {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.group:hover {
  box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.15),
              0 15px 30px -10px rgba(251, 191, 36, 0.15);
}

@media (max-width: 768px) {
  .category-header {
    font-size: 1.8rem;
  }
  
  .amenity-list {
    font-size: 0.95rem;
  }
  
  .grid {
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .category-header {
    font-size: 1.5rem;
  }
  
  .amenity-list {
    font-size: 0.85rem;
  }
  
  .py-20 {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }
}
</style>