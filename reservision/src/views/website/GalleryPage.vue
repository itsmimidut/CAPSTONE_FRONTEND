<template>
  <div class="min-h-screen bg-gradient">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <GalleryHero />

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

    <!-- Footer -->
    <AppFooter />

    <!-- Chatbot -->
    <ChatbotModal />
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(to bottom, #E0F7FA, white);
}
</style>