<template>
  <header
    class="fixed top-0 left-0 w-full z-[100] backdrop-blur-lg shadow-lg bg-sky-700/95"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-[72px] sm:h-[78px]">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 min-w-0 group">
          <img
            src="/Eduardos Resort Logo.jpg"
            alt="Eduardos Resort"
            class="h-10 sm:h-11 md:h-12 w-auto max-w-[160px] sm:max-w-[190px] object-contain drop-shadow-md group-hover:scale-[1.03] transition-transform duration-300"
          />
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-7 xl:gap-9">
          <router-link
            v-for="link in mainNavLinks"
            :key="link.name"
            :to="link.path"
            class="relative font-semibold text-white hover:text-[#F4C400] transition-all duration-300
                   after:content-[''] after:absolute after:left-0 after:-bottom-2
                   after:h-[2px] after:w-0 after:bg-[#F2C200] after:transition-all after:duration-300
                   hover:after:w-full"
            active-class="text-[#F4C400] after:w-full"
          >
            {{ link.name }}
          </router-link>

          <!-- Dropdown -->
          <div
            class="relative"
            @mouseenter="dropdownOpen = true"
            @mouseleave="dropdownOpen = false"
          >
            <button
              class="flex items-center gap-2 font-semibold text-white hover:text-[#F4C400] transition-colors duration-300"
              type="button"
            >
              About Us
              <i
                :class="[
                  'fas fa-chevron-down text-xs transition-transform duration-300',
                  dropdownOpen ? 'rotate-180 text-[#F4C400]' : 'text-white'
                ]"
              ></i>
            </button>

            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div
                v-if="dropdownOpen"
                class="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-white/20 bg-gradient-to-b from-[#1F8DBF] to-[#1E88B6] shadow-2xl py-2 overflow-hidden"
              >
                <router-link
                  v-for="link in dropdownLinks"
                  :key="link.name"
                  :to="link.path"
                  class="flex items-center px-5 py-3 text-white font-medium hover:bg-white/10 hover:text-[#F4C400] transition-all duration-300"
                  @click="dropdownOpen = false"
                >
                  <i class="fas fa-caret-right text-[#F2C200]/70 mr-3 text-xs"></i>
                  {{ link.name }}
                </router-link>
              </div>
            </transition>
          </div>
        </nav>

        <!-- Right Side -->
        <div class="flex items-center gap-2 sm:gap-3">
          <router-link
            to="/login"
            class="hidden md:inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-xl border border-[#F2C200] text-white hover:bg-[#F4C400]/10 hover:border-[#F4C400] hover:text-[#F4C400] transition-all duration-300 font-semibold"
          >
            <i class="fas fa-sign-in-alt text-sm"></i>
            Login
          </router-link>

          <router-link
            to="/signup"
            class="hidden md:inline-flex items-center gap-2 px-5 lg:px-6 py-2.5 rounded-xl bg-[#F4C400] text-[#0C3B5E] hover:bg-[#F2C200] hover:shadow-lg hover:shadow-[#F4C400]/30 transition-all duration-300 font-bold"
          >
            <i class="fas fa-user-plus text-sm"></i>
            Sign Up
          </router-link>

          <button
            @click="$emit('toggle-sidebar')"
            class="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-[#F4C400] hover:bg-white/10 hover:text-[#F2C200] transition-all duration-300"
            aria-label="Open menu"
            type="button"
          >
            <i class="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

defineEmits(['toggle-sidebar'])

const mainNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'Amenities', path: '/amenities' },
  { name: 'Rates', path: '/rates' },
  { name: 'Swimming', path: '/swimming' }
]

const dropdownLinks = [
  { name: 'Gallery', path: '/gallery' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' }
]

const dropdownOpen = ref(false)
</script>

<style scoped>
header {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
</style>