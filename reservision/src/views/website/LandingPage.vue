<template>
  <div class="bg-slate-50 text-slate-800 overflow-x-hidden min-h-screen">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <section id="home" class="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
        alt="Resort background"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-slate-900/45"></div>

      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 sm:pt-28 pb-12">
        <div class="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white text-sm font-medium mb-5 sm:mb-6">
          Waterpark & Wellness Resort
        </div>
        <h2 class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] sm:leading-tight mb-4 sm:mb-6 max-w-[320px] sm:max-w-2xl lg:max-w-3xl mx-auto">
          Experience a More
          <span class="text-yellow-300 block sm:inline">Professional Resort Booking</span>
        </h2>
        <p class="text-slate-100 text-[15px] sm:text-base md:text-lg leading-8 sm:leading-relaxed max-w-[310px] sm:max-w-xl md:max-w-2xl mx-auto mb-6 sm:mb-8 px-1 sm:px-2">
          Relax, swim, celebrate, and reserve with ease. A cleaner, modern homepage design that feels more
          premium and guest-friendly.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <button 
            @click="goToBooking"
            class="w-full sm:w-auto px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-yellow-400 text-sky-900 text-base font-bold shadow-xl hover:-translate-y-1 transition"
          >
            Book Your Escape
          </button>
          <button 
            @click="goToAmenities"
            class="w-full sm:w-auto px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white/15 border border-white text-white text-base font-semibold backdrop-blur hover:bg-white/25 transition"
          >
            Explore Amenities
          </button>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="amenities" class="py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-10 sm:mb-12 lg:mb-14">
          <p class="text-sky-700 font-semibold mb-2 text-sm sm:text-base">Why Guests Choose Us</p>
          <h3 class="text-2xl sm:text-3xl md:text-4xl font-bold">Welcome to Eduardo's Resort</h3>
          <p class="text-slate-600 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Instead of a long paragraph, use feature cards so visitors can understand your resort faster.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          <div class="bg-slate-50 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition">
            <div class="text-4xl mb-4">🏊</div>
            <h4 class="text-lg sm:text-xl font-bold mb-3">Olympic-Size Pool</h4>
            <p class="text-slate-600 text-sm sm:text-base">
              Enjoy swimming lessons, training sessions, and family-friendly water activities in a clean and
              spacious environment.
            </p>
          </div>

          <div class="bg-slate-50 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition">
            <div class="text-4xl mb-4">🌴</div>
            <h4 class="text-lg sm:text-xl font-bold mb-3">Relaxing Atmosphere</h4>
            <p class="text-slate-600 text-sm sm:text-base">
              A refreshing escape with open spaces, fresh air, and a peaceful setting ideal for family bonding and
              rest.
            </p>
          </div>

          <div class="bg-slate-50 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition md:col-span-2 xl:col-span-1">
            <div class="text-4xl mb-4">🎉</div>
            <h4 class="text-lg sm:text-xl font-bold mb-3">Events & Celebrations</h4>
            <p class="text-slate-600 text-sm sm:text-base">
              Perfect for birthdays, team building, reunions, and private gatherings with booking options made
              simple.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Strip -->
    <section class="px-4 sm:px-6 lg:px-10 py-5 sm:py-6 bg-sky-100">
      <div class="max-w-7xl mx-auto bg-gradient-to-r from-sky-700 to-sky-500 rounded-3xl px-5 sm:px-8 py-6 sm:py-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 shadow-lg">
        <div>
          <h4 class="text-xl sm:text-2xl font-bold text-white mb-2">Plan Your Perfect Getaway</h4>
          <p class="text-sky-100 text-sm sm:text-base">
            Reserve tickets, private cottages, or special event packages with a smoother booking experience.
          </p>
        </div>
        <button 
          @click="goToBooking"
          class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-yellow-400 text-sky-900 font-bold hover:scale-105 transition"
        >
          Reserve Now
        </button>
      </div>
    </section>

    <!-- Gallery -->
    <section id="gallery" class="py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 bg-slate-50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-10 sm:mb-12 lg:mb-14">
          <p class="text-sky-700 font-semibold mb-2 text-sm sm:text-base">Gallery</p>
          <h3 class="text-2xl sm:text-3xl md:text-4xl font-bold">Moments at ReserVision</h3>
          <p class="text-slate-600 mt-4 text-sm sm:text-base">
            Use a clean photo grid instead of images floating on top of the page.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <img
            class="w-full h-64 sm:h-72 object-cover rounded-3xl shadow-md hover:scale-[1.02] transition"
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80"
            alt="Poolside view"
          />
          <img
            class="w-full h-64 sm:h-72 object-cover rounded-3xl shadow-md hover:scale-[1.02] transition"
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80"
            alt="Resort room"
          />
          <img
            class="w-full h-64 sm:h-72 object-cover rounded-3xl shadow-md hover:scale-[1.02] transition sm:col-span-2 xl:col-span-1"
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80"
            alt="Swimming pool"
          />
        </div>
      </div>
    </section>

    <!-- Reviews -->
    <section class="py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-10 sm:mb-12 lg:mb-14">
          <p class="text-sky-700 font-semibold mb-2 text-sm sm:text-base">Guest Reviews</p>
          <h3 class="text-2xl sm:text-3xl md:text-4xl font-bold">What Visitors Say</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          <div class="p-6 sm:p-8 rounded-3xl bg-slate-50 shadow-sm">
            <p class="text-yellow-500 text-xl mb-4">★★★★★</p>
            <p class="text-slate-600 mb-4 text-sm sm:text-base">
              "The place is clean, family-friendly, and the booking process feels easy and modern."
            </p>
            <h5 class="font-bold">Maria S.</h5>
          </div>
          <div class="p-6 sm:p-8 rounded-3xl bg-slate-50 shadow-sm">
            <p class="text-yellow-500 text-xl mb-4">★★★★★</p>
            <p class="text-slate-600 mb-4 text-sm sm:text-base">
              "Perfect for swimming events and weekend relaxation. The website design feels more professional."
            </p>
            <h5 class="font-bold">John R.</h5>
          </div>
          <div class="p-6 sm:p-8 rounded-3xl bg-slate-50 shadow-sm md:col-span-2 xl:col-span-1">
            <p class="text-yellow-500 text-xl mb-4">★★★★★</p>
            <p class="text-slate-600 mb-4 text-sm sm:text-base">
              "A great place for celebrations. I like how clear the sections and buttons are."
            </p>
            <h5 class="font-bold">Angela D.</h5>
          </div>
        </div>
      </div>
    </section>

    <!-- Location -->
    <section id="location" class="py-14 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-10 bg-sky-50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-10 sm:mb-12 lg:mb-14">
          <p class="text-sky-700 font-semibold mb-2 text-sm sm:text-base">Find Us</p>
          <h3 class="text-[20px] sm:text-3xl md:text-4xl font-bold leading-tight px-2">Visit Eduardo's Resort</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-8">
          <div class="bg-white rounded-3xl p-5 sm:p-6 shadow-sm">
            <h4 class="font-bold text-lg mb-2">📍 Location</h4>
            <p class="text-slate-600 text-[15px] sm:text-base leading-8 sm:leading-relaxed">
              Barangay Masipit, Calapan City, Oriental Mindoro
            </p>
          </div>
          <div class="bg-white rounded-3xl p-5 sm:p-6 shadow-sm">
            <h4 class="font-bold text-lg mb-2">🕐 Opening Hours</h4>
            <p class="text-slate-600 text-[15px] sm:text-base leading-8 sm:leading-relaxed">8:00 AM - 8:00 PM</p>
          </div>
          <div class="bg-white rounded-3xl p-5 sm:p-6 shadow-sm md:col-span-2 xl:col-span-1">
            <h4 class="font-bold text-lg mb-2">📞 Contact</h4>
            <p class="text-slate-600 text-[15px] sm:text-base leading-8 sm:leading-relaxed break-words">
              +63 928 8906 708 / Eduardosreservation@gmail.com
            </p>
          </div>
        </div>

        <div class="overflow-hidden rounded-3xl shadow-lg border border-slate-200">
          <iframe
            src="https://www.google.com/maps?q=Eduardo%27s%20Resort%20Calapan%20City&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="320"
            class="sm:h-[380px] lg:h-[420px]"
            style="border: 0"
            allowfullscreen
            loading="lazy"
            title="Eduardo's Resort Location Map"
          ></iframe>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />

    <!-- Chatbot -->
    <ChatbotModal />

    <!-- Menu Modal -->
    <MenuModal :is-open="menuOpen" @close="menuOpen = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'
import MenuModal from '../../components/MenuModal.vue'

const router = useRouter()
const sidebarOpen = ref(false)
const menuOpen = ref(false)

const goToBooking = () => {
  router.push('/customer')
}

const goToAmenities = () => {
  router.push('/amenities')
}
</script>

<style scoped>
:global(body) {
  font-family: 'Poppins', sans-serif;
}
</style>
