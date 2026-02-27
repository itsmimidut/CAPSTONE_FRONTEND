<template>
  <!-- Overlay -->
  <div 
    v-show="isOpen"
    @click="$emit('close')"
    class="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300"
    :class="isOpen ? 'opacity-100' : 'opacity-0'"
  ></div>

  <!-- Sidebar -->
  <div 
    class="fixed top-0 right-0 w-[300px] h-full bg-white shadow-[-8px_0_25px_rgba(0,0,0,0.15)] z-[70] p-6 flex flex-col transition-transform duration-400"
    :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
  >
    <!-- Header -->
    <div class="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
      <a href="#" class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-blue to-accent-blue flex items-center justify-center text-white font-bold text-lg">
          Ed
        </div>
        <div class="text-xl font-bold text-primary-blue">Eduardo's</div>
      </a>
      <button @click="$emit('close')" class="text-gray-600 hover:text-gray-900">
        <i class="fas fa-times text-xl"></i>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1">
      <a v-for="link in navLinks" 
         :key="link.name"
         :href="link.path"
         class="block py-3 font-medium text-gray-700 text-center hover:text-primary-blue transition-colors">
        {{ link.name }}
      </a>
    </nav>

<!-- Actions -->
  <div class="flex flex-col gap-3 mt-auto">
    <router-link
      to="/login"
      class="block text-center px-4 py-2 border border-primary-blue text-primary-blue rounded-lg hover:bg-blue-50 transition-colors font-medium"
    >
      Login
    </router-link>

    <router-link
      to="/signup"
      class="block text-center px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      Sign Up
    </router-link>
  </div>

  </div>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Amenities', path: '/amenities' },
  { name: 'Rates', path: '/rates' },
  { name: 'Swimming', path: '/swimming' },
  // { name: 'E-Shop', path: '/eshop' },
  // { name: 'My Orders', path: '/my-orders' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
  { name: 'About', path: '/about' }
]
</script>