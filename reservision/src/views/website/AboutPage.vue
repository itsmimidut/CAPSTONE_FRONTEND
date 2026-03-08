<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-yellow-50/30 overflow-x-hidden">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <section
      class="relative flex items-center justify-center min-h-[450px] sm:min-h-[550px] about-hero text-center px-4 overflow-hidden pt-[78px]"
    >
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-10 left-10 w-32 h-32 bg-[#1F8DBF]/20 rounded-full blur-3xl animate-pulse-hero"></div>
        <div class="absolute bottom-10 right-10 w-40 h-40 bg-[#F4C400]/20 rounded-full blur-3xl animate-pulse-hero delay-1000"></div>
      </div>

      <div class="absolute inset-0 bg-gradient-to-br from-[#1F8DBF]/20 via-[#F4C400]/10 to-[#F4C400]/20"></div>

      <div class="relative z-10 max-w-4xl w-full backdrop-blur-md bg-white/50 rounded-2xl p-8 sm:p-10 md:p-12 shadow-2xl mx-4 flex flex-col justify-center border border-white/40 my-12">
        <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-[#F4C400]/5 to-[#1F8DBF]/10 rounded-2xl pointer-events-none"></div>

        <div class="relative z-20 flex flex-col items-center justify-center">
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-[#F4C400]/30 rounded-full blur-2xl animate-pulse-slow-hero"></div>

          <h1 class="text-[32px] sm:text-[40px] md:text-[48px] font-bold leading-tight relative mb-2">
            <span class="text-[#0C3B5E] drop-shadow-lg">Our Story</span>
          </h1>

          <div class="mt-4 mb-2">
            <p class="text-xs sm:text-sm text-[#0C3B5E]/80 leading-relaxed drop-shadow-md font-medium max-w-2xl mx-auto">
              A legacy of warmth, nature, and Filipino hospitality since 1998.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Floating decorative background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-yellow-400/10 rounded-full blur-3xl animate-float-1"></div>
      <div class="absolute bottom-1/3 right-10 w-40 h-40 bg-gradient-to-tr from-blue-300/5 to-yellow-300/10 rounded-full blur-3xl animate-float-2"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-blue-200/5 to-yellow-200/5 rounded-full blur-3xl animate-pulse-soft"></div>
    </div>

    <!-- History -->
    <section class="about-section bg-white relative">
      <div class="container-custom grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div class="about-image-card">
          <div class="img-placeholder">
            <i class="fas fa-image"></i>
            <p>Add Founder Image</p>
          </div>
        </div>

        <div class="space-y-6">
          <h2 class="section-title text-royal-blue">Founded with a Vision</h2>
          <p class="text-navy leading-relaxed text-base sm:text-lg">
            In 1998, <strong class="text-royal-blue">Eduardo Mendoza</strong> transformed a quiet beachfront into a sanctuary for families seeking authentic Filipino warmth.
          </p>
          <p class="text-navy text-base sm:text-lg leading-relaxed">
            Today, we continue his legacy — blending modern comfort with the timeless beauty of Oriental Mindoro.
          </p>
          <div class="flex items-center gap-3 text-gold font-semibold">
            <i class="fas fa-heart"></i>
            <span>25+ Years of Unforgettable Memories</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="about-section bg-neutral-gray relative">
      <div class="container-custom relative z-10">
        <div class="text-center mb-10">
          <h2 class="section-title text-text-dark">Our Core Values</h2>
        </div>

        <div class="values-grid">
          <div
            v-for="value in values"
            :key="value.title"
            class="value-card"
          >
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white"
              :style="{ background: value.gradient }"
            >
              <i :class="value.icon + ' text-xl'"></i>
            </div>
            <h3 class="text-xl font-bold mb-2 text-text-dark">{{ value.title }}</h3>
            <p class="text-text-muted text-sm">{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Leadership -->
    <section class="about-section bg-white relative">
      <div class="container-custom relative z-10">
        <div class="text-center mb-10">
          <h2 class="section-title text-text-dark">Our Leadership</h2>
        </div>

        <div class="about-image-card">
          <div class="img-placeholder leadership-placeholder">
            <i class="fas fa-sitemap"></i>
            <p>Add Organizational Chart</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 bg-gradient-to-r from-primary-blue to-accent-blue text-white relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-6 left-10 w-28 h-28 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-6 right-10 w-36 h-36 bg-yellow-300/10 rounded-full blur-3xl"></div>
      </div>

      <div class="container-custom text-center relative z-10">
        <h2 class="text-3xl font-bold mb-6">Be Part of Our Story</h2>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/reservation"
            class="bg-white text-primary-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Book Your Stay
          </router-link>
          <router-link
            to="/gallery"
            class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-blue transition inline-block"
          >
            View Gallery
          </router-link>
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
import { ref } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'

const sidebarOpen = ref(false)

const values = [
  {
    icon: 'fas fa-leaf',
    title: 'Sustainability',
    description: 'Eco-friendly practices in every corner.',
    gradient: 'linear-gradient(135deg, #2B6CB0, #63B3ED)'
  },
  {
    icon: 'fas fa-hands-helping',
    title: 'Hospitality',
    description: 'Warm, genuine service that feels like home.',
    gradient: 'linear-gradient(135deg, #C19A6B, #d97706)'
  },
  {
    icon: 'fas fa-gem',
    title: 'Excellence',
    description: 'Uncompromising quality in every detail.',
    gradient: 'linear-gradient(135deg, #2B6CB0, #63B3ED)'
  }
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;900&display=swap');

.about-hero {
  background-image:
    radial-gradient(circle at 30% 40%, rgba(31, 141, 191, 0.25) 0%, transparent 40%),
    radial-gradient(circle at 70% 60%, rgba(244, 196, 0, 0.2) 0%, transparent 40%),
    linear-gradient(125deg, rgba(31, 141, 191, 0.4) 0%, rgba(244, 196, 0, 0.3) 100%),
    url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-size: cover;
  background-blend-mode: overlay;
  position: relative;
}

.about-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.2) 100%);
  pointer-events: none;
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.container-custom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.about-section {
  padding: 4rem 1rem;
}

.section-title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.2;
}

.about-image-card {
  border-radius: 20px;
  overflow: hidden;
}

.img-placeholder {
  background: #e0e7ff;
  border-radius: 16px;
  width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #2c3e90;
  font-size: 1.2rem;
  box-shadow: 0 6px 20px rgba(44, 62, 144, 0.15);
  text-align: center;
  padding: 1.5rem;
}

.img-placeholder i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

.leadership-placeholder {
  background: #e5e7eb;
  color: #6b7280;
  min-height: 16rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
}

.leadership-placeholder i {
  font-size: 2.5rem;
  opacity: 0.5;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.value-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  transition: all 0.35s ease;
  text-align: center;
}

.value-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 30px rgba(2, 8, 20, 0.12);
}

.text-royal-blue {
  color: #2C3E90;
}

.text-navy {
  color: #1a2a5a;
}

.text-gold {
  color: #FFD700;
}

.text-text-dark {
  color: #2D3748;
}

.text-text-muted {
  color: #718096;
}

.bg-neutral-gray {
  background: #F5F5F5;
}

.bg-gradient-to-r {
  background: linear-gradient(to right, #2B6CB0, #63B3ED);
}

.from-primary-blue {
  --tw-gradient-from: #2B6CB0;
}

.to-accent-blue {
  --tw-gradient-to: #63B3ED;
}

.text-primary-blue {
  color: #2B6CB0;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.leading-relaxed {
  line-height: 1.75;
}

@keyframes pulseHero {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes pulseSlowHero {
  0%, 100% { opacity: 0.2; transform: scale(1) translateX(-50%); }
  50% { opacity: 0.4; transform: scale(1.2) translateX(-50%); }
}

@keyframes float-1 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(-15px) translateX(10px); }
  66% { transform: translateY(10px) translateX(-10px); }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(10px) translateX(-15px); }
  66% { transform: translateY(-10px) translateX(10px); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.animate-pulse-hero {
  animation: pulseHero 4s ease-in-out infinite;
}

.animate-pulse-slow-hero {
  animation: pulseSlowHero 6s ease-in-out infinite;
  left: 50% !important;
}

.animate-float-1 {
  animation: float-1 12s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 15s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-pulse-soft {
  animation: pulse-soft 3s ease-in-out infinite;
}

.delay-1000 {
  animation-delay: 1s;
}

@media (max-width: 768px) {
  .values-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .value-card {
    padding: 1rem;
  }
}

@media (max-width: 640px) {
  .about-hero {
    min-height: 450px;
  }

  .text-\[32px\] {
    font-size: 28px;
  }

  .max-w-2xl {
    max-width: 100%;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .img-placeholder {
    min-height: 240px;
  }
}
</style>