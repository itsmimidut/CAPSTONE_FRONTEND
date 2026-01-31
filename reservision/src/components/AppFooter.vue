<template>
  <footer class="bg-gray-800 text-white py-12">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- About -->
        <div>
          <h3 class="text-xl font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-warm-brown">
            About Eduardo's Resort
          </h3>
          <p class="text-gray-300 text-sm">
            Eduardo's Resort blends refined design and family-first recreation — elegant spaces, 
            playful attractions, and smooth digital booking for your perfect getaway.
          </p>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-xl font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-warm-brown">
            Contact
          </h3>
          <ul class="space-y-2 text-gray-300 text-sm">
            <li>
              <strong>Email:</strong> 
              <a href="mailto:contact@reservision.com" class="hover:text-accent-blue transition-colors">
                contact@reservision.com
              </a>
            </li>
            <li>
              <strong>Phone:</strong> 
              <a href="tel:+639123456789" class="hover:text-accent-blue transition-colors">
                +63 912 345 6789
              </a>
            </li>
            <li>
              <strong>Address:</strong> Barangay Masipit, Calapan City, Oriental Mindoro
            </li>
          </ul>
        </div>

        <!-- Social -->
        <div>
          <h3 class="text-xl font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-warm-brown">
            Connect With Us
          </h3>
          <div class="flex space-x-4">
            <a 
              v-for="social in socials" 
              :key="social.name"
              :href="social.link" 
              class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary-blue transition-colors duration-300"
            >
              <i :class="social.icon"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
        <p>© 2025 Eduardo's Resort · All Rights Reserved</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const socials = [
  { name: 'Facebook', icon: 'fab fa-facebook-f', link: '#' },
  { name: 'Instagram', icon: 'fab fa-instagram', link: '#' },
  { name: 'Twitter', icon: 'fab fa-twitter', link: '#' },
  { name: 'Website', icon: 'fas fa-globe', link: '#' }
]
</script>