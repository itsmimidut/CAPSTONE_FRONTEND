<template>
  <div class="min-h-screen page-bg overflow-x-hidden">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <section class="about-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">Eduardo's Resort</div>
        <h1 class="hero-heading">
          <span class="heading-white">Our</span>
          <span class="heading-gold">Story</span>
        </h1>
        <p class="hero-subtext">
          A legacy of warmth, nature, and Filipino hospitality since 1998.
        </p>
      </div>
    </section>

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
          <h2 class="section-title">Founded with a Vision</h2>
          <p class="text-body leading-relaxed text-base sm:text-lg">
            In 1998, <strong class="text-primary">Eduardo Mendoza</strong> transformed a quiet beachfront into a sanctuary for families seeking authentic Filipino warmth.
          </p>
          <p class="text-body text-base sm:text-lg leading-relaxed">
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
    <section class="about-section bg-gray-section relative">
      <div class="container-custom relative z-10">
        <div class="text-center mb-10">
          <h2 class="section-title">Our Core Values</h2>
        </div>
        <div class="values-grid">
          <div v-for="value in values" :key="value.title" class="value-card">
            <div class="value-icon" :style="{ background: value.gradient }">
              <i :class="value.icon + ' text-xl'"></i>
            </div>
            <h3 class="value-title">{{ value.title }}</h3>
            <p class="value-desc">{{ value.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Leadership -->
    <section class="about-section bg-white relative">
      <div class="container-custom relative z-10">
        <div class="text-center mb-10">
          <h2 class="section-title">Our Leadership</h2>
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
    <section class="cta-section">
      <div class="container-custom text-center relative z-10">
        <h2 class="cta-title">Be Part of Our Story</h2>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/reservation" class="cta-btn-primary">Book Your Stay</router-link>
          <router-link to="/gallery" class="cta-btn-outline">View Gallery</router-link>
        </div>
      </div>
    </section>

    <AppFooter />
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
    gradient: 'linear-gradient(135deg, #0369a1, #1F8DBF)'
  },
  {
    icon: 'fas fa-hands-helping',
    title: 'Hospitality',
    description: 'Warm, genuine service that feels like home.',
    gradient: 'linear-gradient(135deg, #0C3B5E, #0369a1)'
  },
  {
    icon: 'fas fa-gem',
    title: 'Excellence',
    description: 'Uncompromising quality in every detail.',
    gradient: 'linear-gradient(135deg, #0369a1, #1F8DBF)'
  }
]
</script>

<style scoped>
* {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-gold: #F4C400;
  --color-gold-dark: #F2C200;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;
  --color-gray-bg: #f9fafb;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;
}

.page-bg { background: #f9fafb; min-height: 100vh; }
.text-primary { color: #0369a1; }
.text-gold { color: #F4C400; }

/* ── Hero ── */
.about-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  background-image: url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  flex-shrink: 0;
  flex-grow: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 30, 50, 0.52);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 24px;
  max-width: 780px;
  width: 100%;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #FFFFFF;
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 6px 18px;
  border-radius: 999px;
}

.hero-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.15;
}

.heading-white {
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 800;
  color: #FFFFFF;
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.heading-gold {
  font-size: clamp(2rem, 4.5vw, 3.8rem);
  font-weight: 800;
  color: #F4C400;
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.hero-subtext {
  font-size: clamp(0.88rem, 1.3vw, 1rem);
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.75;
  font-weight: 400;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}

/* ── Sections ── */
.container-custom { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.about-section { padding: 4rem 1rem; }
.bg-gray-section { background: #f5f5f5; }

.section-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0C3B5E;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.text-body { color: #1f2937; }

/* ── Image Placeholders ── */
.about-image-card { border-radius: 20px; overflow: hidden; }

.img-placeholder {
  background: rgba(3, 105, 161, 0.08);
  border: 2px dashed rgba(3, 105, 161, 0.2);
  border-radius: 16px;
  width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #0369a1;
  font-size: 1.1rem;
  text-align: center;
  padding: 1.5rem;
}

.img-placeholder i { font-size: 3rem; margin-bottom: 0.5rem; opacity: 0.6; }

.leadership-placeholder {
  background: #f3f4f6;
  border-color: #e5e7eb;
  color: #6b7280;
  min-height: 16rem;
}

.leadership-placeholder i { font-size: 2.5rem; opacity: 0.5; }

/* ── Values ── */
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.value-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 14px rgba(3, 105, 161, 0.08);
  border: 1px solid rgba(3, 105, 161, 0.08);
  transition: all 0.35s ease;
  text-align: center;
}

.value-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 14px 32px rgba(3, 105, 161, 0.14);
  border-color: #F4C400;
}

.value-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1rem;
}

.value-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0C3B5E;
  margin-bottom: 0.5rem;
}

.value-desc { font-size: 0.875rem; color: #6b7280; line-height: 1.6; }

/* ── CTA ── */
.cta-section {
  padding: 4rem 1rem;
  background: linear-gradient(to right, #0C3B5E, #0369a1);
  position: relative;
  overflow: hidden;
}

.cta-title {
  font-size: 2rem;
  font-weight: 800;
  color: #F4C400;
  margin-bottom: 1.5rem;
}

.cta-btn-primary {
  background: #F4C400;
  color: #0C3B5E;
  padding: 0.875rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(244, 196, 0, 0.35);
}

.cta-btn-primary:hover {
  background: #F2C200;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(244, 196, 0, 0.5);
}

.cta-btn-outline {
  border: 2px solid white;
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
}

.cta-btn-outline:hover {
  background: white;
  color: #0369a1;
  transform: translateY(-2px);
}

.space-y-6 > * + * { margin-top: 1.5rem; }
.leading-relaxed { line-height: 1.75; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .values-grid { grid-template-columns: 1fr; gap: 0.75rem; }
  .section-title { font-size: 1.8rem; }
}

@media (max-width: 640px) {
  .about-hero { height: 100svh; min-height: 100svh; max-height: 100svh; }
  .hero-content { padding: 32px 16px; }
  .section-title { font-size: 1.5rem; }
  .img-placeholder { min-height: 240px; }
}
</style>