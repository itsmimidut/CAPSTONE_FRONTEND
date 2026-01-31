<template>
  <div class="min-h-screen">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <AmenitiesHero />

    <!-- Amenities Grid -->
    <section id="amenity-grid" class="py-16 bg-white">
      <div class="container mx-auto px-4 max-w-7xl">
        
        <!-- Category 1: Pools -->
        <h2 class="category-header reveal">Amenities:</h2>
        <p class="amenity-list reveal">
          MINI-OLYMPIC SIZE SWIMMING POOL • KIDDIE POOL w/ SLIDE • SWIMMING CLUB
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AmenityCard
            v-for="amenity in poolAmenities"
            :key="amenity.title"
            :title="amenity.title"
            :description="amenity.description"
            :images="amenity.images"
            class="reveal"
          />
        </div>

        <!-- Category 2: Dining & Events -->
        <h2 class="category-header reveal mt-16">Amenities:</h2>
        <p class="amenity-list reveal">
          BAR and RESTAURANT • FUNCTION HALL • AIR CONDITIONED ROOMS
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AmenityCard
            v-for="amenity in eventAmenities"
            :key="amenity.title"
            :title="amenity.title"
            :description="amenity.description"
            :images="amenity.images"
            :bookable="amenity.bookable"
            class="reveal"
          />
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
  }, { threshold: 0.15 })

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>

<style scoped>
.category-header {
  color: #000080;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  font-size: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 1rem;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0,0,0,.1);
}

.amenity-list {
  color: rgb(4, 2, 47);
  padding: 0.75rem 1rem;
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: center;
}

.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 640px) {
  .category-header {
    font-size: 1.1rem;
    padding: 0.6rem 1rem;
  }
  
  .amenity-list {
    font-size: 0.9rem;
    padding: 0.6rem;
  }
}
</style>