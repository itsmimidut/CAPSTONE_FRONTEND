<template>
  <header 
    :class="['sticky top-0 z-[100] bg-gradient-to-r from-blue-900/95 to-blue-800/95 backdrop-blur-lg shadow-lg transition-all duration-300', 
             isVisible ? 'translate-y-0' : '-translate-y-full']"
  >
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <a href="#" class="flex items-center space-x-3 group">
          <img
            src="/Eduardos Resort Logo.jpg"
            alt="Eduardos Resort"
            class="h-12 w-auto max-w-[200px] drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-10 items-center">
          <router-link
            v-for="link in mainNavLinks"
            :key="link.name"
            :to="link.path"
            class="font-semibold text-white hover:text-yellow-300 transition-all duration-300 relative
                  after:content-[''] after:absolute after:bottom-[-8px] after:left-0
                  after:w-0 after:h-[2px] after:bg-yellow-400 after:transition-all
                  after:duration-300 hover:after:w-full"
            active-class="text-yellow-300 after:w-full"
          >
            {{ link.name }}
          </router-link>

          <!-- Dropdown Menu -->
          <div class="relative dropdown-menu">
            <button 
              @click="dropdownOpen = !dropdownOpen"
              @mouseenter="dropdownOpen = true"
              class="font-semibold text-white hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2 group"
            >
              About Us
              <i :class="['fas fa-chevron-down text-xs transition-transform duration-300', 
                         dropdownOpen ? 'rotate-180 text-yellow-300' : 'text-white group-hover:text-yellow-300']"></i>
            </button>
            
            <div 
              v-if="dropdownOpen"
              class="absolute top-full mt-3 w-56 bg-gradient-to-b from-blue-800 to-blue-900 rounded-xl shadow-2xl border border-blue-700/50 py-3 z-50"
              @mouseleave="dropdownOpen = false"
            >
              <router-link
                v-for="link in dropdownLinks"
                :key="link.name"
                :to="link.path"
                class="block px-5 py-3 hover:bg-blue-700/50 hover:text-yellow-300 transition-all duration-300 font-medium text-white border-b border-blue-700/30 last:border-b-0"
                @click="dropdownOpen = false"
              >
                <i class="fas fa-caret-right text-yellow-400/70 mr-3 text-xs"></i>
                {{ link.name }}
              </router-link>
            </div>
          </div>
        </nav>

        <!-- Desktop Auth Buttons -->
        <div class="flex items-center space-x-5">
          <router-link
            to="/login"
            class="hidden md:flex items-center gap-2 px-5 py-2.5 border-2 border-yellow-400 text-yellow-400 rounded-xl hover:bg-yellow-400/10 hover:border-yellow-300 hover:text-yellow-300 transition-all duration-300 font-semibold group"
          >
            <i class="fas fa-sign-in-alt text-sm"></i>
            Login
          </router-link>

          <router-link
            to="/signup"
            class="hidden md:flex items-center gap-2 px-6 py-2.5 bg-yellow-300 text-blue-900 rounded-xl hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 font-bold group"
          >
            <i class="fas fa-user-plus text-sm"></i>
            Sign Up
          </router-link>
                    
          <!-- Mobile Menu Button -->
          <button @click="$emit('toggle-sidebar')" class="md:hidden text-2xl text-yellow-400 hover:text-yellow-300 hover:scale-110 transition-all duration-300">
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

<style scoped>
/* Enhanced shadow for better visibility */
.shadow-lg {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Golden accent colors for resort theme */
.text-yellow-300 {
  color: #fcd34d;
}

.text-yellow-400 {
  color: #fbbf24;
}

.bg-yellow-500 {
  background-color: #f59e0b;
}

.hover\:bg-yellow-400:hover {
  background-color: #fbbf24;
}

.border-yellow-400 {
  border-color: #fbbf24;
}

.hover\:border-yellow-300:hover {
  border-color: #fcd34d;
}

/* Dark blue gradient for header */
.from-blue-900\/95 {
  --tw-gradient-from: rgb(30 58 138 / 0.95);
}

.to-blue-800\/95 {
  --tw-gradient-to: rgb(30 64 175 / 0.95);
}

.bg-blue-800 {
  background-color: rgb(30 64 175);
}

.bg-blue-900 {
  background-color: rgb(30 58 138);
}
</style>