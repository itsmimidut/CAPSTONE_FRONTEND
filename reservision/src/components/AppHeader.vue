<template>
  <header 
    :class="['sticky top-0 z-[100] bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300', 
             isVisible ? 'translate-y-0' : '-translate-y-full']"
  >
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <a href="#" class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-blue to-accent-blue flex items-center justify-center text-white font-bold text-lg">
            Ed
          </div>
          <div class="text-xl font-bold text-primary-blue">Eduardo's</div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8 items-center">
          <router-link
            v-for="link in mainNavLinks"
            :key="link.name"
            :to="link.path"
            class="font-medium hover:text-primary-blue transition-colors duration-300 relative
                  after:content-[''] after:absolute after:bottom-[-5px] after:left-0
                  after:w-0 after:h-0.5 after:bg-primary-blue after:transition-all
                  after:duration-300 hover:after:w-full"
            active-class="text-primary-blue after:w-full"
          >
            {{ link.name }}
          </router-link>

          <!-- Dropdown Menu -->
          <div class="relative dropdown-menu">
            <button 
              @click="dropdownOpen = !dropdownOpen"
              class="font-medium hover:text-primary-blue transition-colors duration-300 flex items-center gap-1"
            >
              More
              <i :class="['fas fa-chevron-down text-xs transition-transform', dropdownOpen ? 'rotate-180' : '']"></i>
            </button>
            
            <div 
              v-if="dropdownOpen"
              class="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
              @mouseleave="dropdownOpen = false"
            >
              <router-link
                v-for="link in dropdownLinks"
                :key="link.name"
                :to="link.path"
                class="block px-4 py-2 hover:bg-blue-50 hover:text-primary-blue transition-colors duration-300 font-medium"
                @click="dropdownOpen = false"
              >
                {{ link.name }}
              </router-link>
            </div>
          </div>
        </nav>


        <!-- Desktop Auth Buttons -->
        <div class="flex items-center space-x-4">
          <router-link
            to="/login"
            class="hidden md:block px-4 py-2 border border-primary-blue text-primary-blue rounded-lg hover:bg-blue-50 transition-colors duration-300 font-medium"
          >
            Login
          </router-link>

          <router-link
            to="/signup"
            class="hidden md:block px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
          >
            Signup
          </router-link>
                    
          <!-- Mobile Menu Button -->
          <button @click="$emit('toggle-sidebar')" class="md:hidden text-2xl text-primary-blue">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['toggle-sidebar'])

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Amenities', path: '/amenities' },
  { name: 'Rates', path: '/rates' },
  { name: 'Swimming', path: '/swimming' }
]

const mainNavLinks = navLinks

const dropdownLinks = [
  { name: 'Gallery', path: '/gallery' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' }
]

const dropdownOpen = ref(false)

const isVisible = ref(true)
let lastScrollY = 0

const handleScroll = () => {
  const currentScrollY = window.scrollY
  
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    isVisible.value = false
  } else {
    isVisible.value = true
  }
  
  lastScrollY = currentScrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>