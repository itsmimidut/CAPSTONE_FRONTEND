<template> 
  <header 
    :class="[
      'sticky top-0 z-[100] bg-gradient-to-r from-[#1E88B6]/95 to-[#1F8DBF]/95 backdrop-blur-lg shadow-lg transition-all duration-300', 
      isVisible ? 'translate-y-0' : '-translate-y-full'
    ]"
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
            class="font-semibold text-white hover:text-[#F4C400] transition-all duration-300 relative
                  after:content-[''] after:absolute after:bottom-[-8px] after:left-0
                  after:w-0 after:h-[2px] after:bg-[#F2C200] after:transition-all
                  after:duration-300 hover:after:w-full"
            active-class="text-[#F4C400] after:w-full"
          >
            {{ link.name }}
          </router-link>

          <!-- Dropdown Menu -->
          <div class="relative dropdown-menu">
            <button 
              @click="dropdownOpen = !dropdownOpen"
              @mouseenter="dropdownOpen = true"
              class="font-semibold text-white hover:text-[#F4C400] transition-colors duration-300 flex items-center gap-2 group"
            >
              About Us
              <i :class="['fas fa-chevron-down text-xs transition-transform duration-300', 
                         dropdownOpen ? 'rotate-180 text-[#F4C400]' : 'text-white group-hover:text-[#F4C400]']"></i>
            </button>
            
            <div 
              v-if="dropdownOpen"
              class="absolute top-full mt-3 w-56 bg-gradient-to-b from-[#1F8DBF] to-[#1E88B6] rounded-xl shadow-2xl border border-[#1E88B6]/50 py-3 z-50"
              @mouseleave="dropdownOpen = false"
            >
              <router-link
                v-for="link in dropdownLinks"
                :key="link.name"
                :to="link.path"
                class="block px-5 py-3 hover:bg-[#1E88B6]/50 hover:text-[#F4C400] transition-all duration-300 font-medium text-white border-b border-[#1E88B6]/30 last:border-b-0"
                @click="dropdownOpen = false"
              >
                <i class="fas fa-caret-right text-[#F2C200]/70 mr-3 text-xs"></i>
                {{ link.name }}
              </router-link>
            </div>
          </div>
        </nav>

        <!-- Desktop Auth Buttons -->
        <div class="flex items-center space-x-5">
          <!-- Login Button - Now with ReserVision dark blue text (#0C3B5E) -->
          <router-link
            to="/login"
            class="hidden md:flex items-center gap-2 px-5 py-2.5 border-2 border-[#F2C200] text-[#0C3B5E] rounded-xl hover:bg-[#F4C400]/10 hover:border-[#F4C400] hover:text-[#0C3B5E]/80 transition-all duration-300 font-semibold group"
          >
            <i class="fas fa-sign-in-alt text-sm"></i>
            Login
          </router-link>

          <!-- Sign Up Button -->
          <router-link
            to="/signup"
            class="hidden md:flex items-center gap-2 px-6 py-2.5 bg-[#F4C400] text-[#1E88B6] rounded-xl hover:bg-[#F2C200] hover:shadow-lg hover:shadow-[#F4C400]/30 transition-all duration-300 font-bold group"
          >
            <i class="fas fa-user-plus text-sm"></i>
            Sign Up
          </router-link>
                    
          <!-- Mobile Menu Button -->
          <button @click="$emit('toggle-sidebar')" class="md:hidden text-2xl text-[#F4C400] hover:text-[#F2C200] hover:scale-110 transition-all duration-300">
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

/* ======================================================
   APPLIED POSTER PALETTE
   🔵 Blue #1: #1E88B6 (slightly deeper cerulean)
   🔵 Blue #2: #1F8DBF (brighter cerulean)
   🔵 ReserVision Blue: #0C3B5E (dark blue)
   🟡 Yellow #1: #F2C200 (rich golden yellow)
   🟡 Yellow #2: #F4C400 (brighter golden yellow)
   ====================================================== */

/* Text yellows */
.text-\[\#F4C400\] {
  color: #F4C400;
}
.text-\[\#F2C200\] {
  color: #F2C200;
}
.hover\:text-\[\#F4C400\]:hover {
  color: #F4C400;
}
.hover\:text-\[\#F2C200\]:hover {
  color: #F2C200;
}

/* Text blues */
.text-\[\#0C3B5E\] {
  color: #0C3B5E;
}
.text-\[\#1E88B6\] {
  color: #1E88B6;
}
.text-\[\#1F8DBF\] {
  color: #1F8DBF;
}
.hover\:text-\[\#0C3B5E\]\/80:hover {
  color: rgba(12, 59, 94, 0.8);
}

/* Button backgrounds */
.bg-\[\#F4C400\] {
  background-color: #F4C400;
}
.bg-\[\#F2C200\] {
  background-color: #F2C200;
}
.bg-\[\#1F8DBF\] {
  background-color: #1F8DBF;
}
.bg-\[\#1E88B6\] {
  background-color: #1E88B6;
}
.hover\:bg-\[\#F4C400\]\/10:hover {
  background-color: rgba(244, 196, 0, 0.1);
}
.hover\:bg-\[\#F2C200\]:hover {
  background-color: #F2C200;
}

/* Borders */
.border-\[\#F2C200\] {
  border-color: #F2C200;
}
.hover\:border-\[\#F4C400\]:hover {
  border-color: #F4C400;
}

/* Header gradient blues */
.from-\[\#1E88B6\]\/95 {
  --tw-gradient-from: rgba(30, 136, 182, 0.95);
}
.to-\[\#1F8DBF\]\/95 {
  --tw-gradient-to: rgba(31, 141, 191, 0.95);
}

/* Dropdown backgrounds */
.from-\[\#1F8DBF\] {
  --tw-gradient-from: #1F8DBF;
}
.to-\[\#1E88B6\] {
  --tw-gradient-to: #1E88B6;
}

/* Border / hover blues used in dropdown */
.border-\[\#1E88B6\]\/50 {
  border-color: rgba(30, 136, 182, 0.5);
}
.border-\[\#1E88B6\]\/30 {
  border-color: rgba(30, 136, 182, 0.3);
}
.hover\:bg-\[\#1E88B6\]\/50:hover {
  background-color: rgba(30, 136, 182, 0.5);
}

/* Underline color for nav */
.after\:bg-\[\#F2C200\]::after {
  background-color: #F2C200;
}

/* Caret highlight */
.text-\[\#F2C200\]\/70 {
  color: rgba(242, 194, 0, 0.7);
}

/* Shadow effects */
.hover\:shadow-\[\#F4C400\]\/30:hover {
  --tw-shadow-color: rgba(244, 196, 0, 0.3);
}
</style>