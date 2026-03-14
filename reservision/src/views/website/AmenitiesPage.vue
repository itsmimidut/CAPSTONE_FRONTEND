<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-yellow-50/30 overflow-x-hidden">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <section class="amenities-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">Eduardo's Resort</div>
        <h1 class="hero-heading">
          <span class="heading-white">World-Class</span>
          <span class="heading-gold">Amenities</span>
        </h1>
        <p class="hero-subtext">
          From Olympic-sized pools to elegant dining and air-conditioned cottages —<br/>
          every detail is crafted for your ultimate relaxation, joy, and unforgettable memories.
        </p>
      </div>
    </section>

    <!-- Amenities Grid -->
    <section id="amenity-grid" class="relative py-20">
      <div class="container mx-auto px-4 max-w-7xl relative z-10">

        <!-- Category 1: Pools -->
        <div class="mb-16 relative">
          <div class="flex justify-center items-center mb-10">
            <div class="h-1 w-16 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
            <div class="mx-4">
              <div class="w-4 h-4 bg-gradient-to-br from-yellow-400 to-blue-400 rounded-full animate-spin-slow"></div>
            </div>
            <div class="h-1 w-16 bg-gradient-to-l from-blue-400 to-transparent rounded-full"></div>
          </div>

          <h2 class="category-header reveal text-center">
            <span class="inline-block bg-gradient-to-r from-blue-800 via-blue-700 to-yellow-600 bg-clip-text text-transparent">
              Aquatic Paradise
            </span>
          </h2>

          <p class="amenity-list reveal text-center">
            <span class="inline-block px-4 py-2 bg-gradient-to-r from-blue-50 to-yellow-50/50 rounded-full border border-blue-100 shadow-sm">
              MINI-OLYMPIC SIZE SWIMMING POOL • KIDDIE POOL w/ SLIDE • SWIMMING CLUB
            </span>
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            <article
              v-for="(amenity, index) in poolAmenities"
              :key="amenity.title"
              class="amenity-card reveal group"
              :style="`transition-delay: ${index * 100}ms`"
            >
              <div class="carousel-container">
                <div
                  class="carousel-track"
                  :style="{ transform: `translateX(-${currentSlides[amenity.title] * 100}%)` }"
                >
                  <div
                    v-for="(image, imageIndex) in amenity.images"
                    :key="imageIndex"
                    class="carousel-slide"
                  >
                    <img :src="image" :alt="`${amenity.title} ${imageIndex + 1}`" />
                  </div>
                </div>

                <button class="carousel-arrow prev" @click="prevSlide(amenity.title)" aria-label="Previous image" type="button">&lt;</button>
                <button class="carousel-arrow next" @click="nextSlide(amenity.title, amenity.images.length)" aria-label="Next image" type="button">&gt;</button>
                <button class="see-more-btn" @click="toggleInfo(amenity.title)" type="button">
                  {{ showInfo[amenity.title] ? 'See Less' : 'See More' }}
                </button>

                <div class="info-overlay" :class="{ show: showInfo[amenity.title] }">
                  <div class="info-title">{{ amenity.title }}</div>
                  <div class="info-desc">{{ amenity.description }}</div>
                </div>
              </div>

              <div class="card-body">
                <h3 class="card-title">{{ amenity.title }}</h3>
                <p class="card-desc">{{ amenity.description }}</p>
              </div>
            </article>
          </div>
        </div>

        <!-- Decorative Separator -->
        <div class="my-20 flex justify-center">
          <div class="w-24 h-1 bg-gradient-to-r from-blue-400 via-yellow-400 to-blue-400 rounded-full animate-pulse-slow"></div>
        </div>

        <!-- Category 2: Dining & Events -->
        <div class="relative">
          <div class="flex justify-center items-center mb-10">
            <div class="h-1 w-16 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
            <div class="mx-4">
              <div class="w-4 h-4 bg-gradient-to-br from-blue-400 to-yellow-400 rounded-full animate-spin-slow"></div>
            </div>
            <div class="h-1 w-16 bg-gradient-to-l from-yellow-400 to-transparent rounded-full"></div>
          </div>

          <h2 class="category-header reveal text-center">
            <span class="inline-block bg-gradient-to-r from-yellow-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Luxury Comfort & Dining
            </span>
          </h2>

          <p class="amenity-list reveal text-center">
            <span class="inline-block px-4 py-2 bg-gradient-to-r from-yellow-50 to-blue-50/50 rounded-full border border-yellow-100 shadow-sm">
              BAR and RESTAURANT • FUNCTION HALL • AIR CONDITIONED ROOMS
            </span>
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            <article
              v-for="(amenity, index) in eventAmenities"
              :key="amenity.title"
              class="amenity-card reveal group"
              :style="`transition-delay: ${index * 100 + 300}ms`"
            >
              <div class="carousel-container">
                <div
                  class="carousel-track"
                  :style="{ transform: `translateX(-${currentSlides[amenity.title] * 100}%)` }"
                >
                  <div
                    v-for="(image, imageIndex) in amenity.images"
                    :key="imageIndex"
                    class="carousel-slide"
                  >
                    <img :src="image" :alt="`${amenity.title} ${imageIndex + 1}`" />
                  </div>
                </div>

                <button class="carousel-arrow prev" @click="prevSlide(amenity.title, amenity.images.length)" aria-label="Previous image" type="button">&lt;</button>
                <button class="carousel-arrow next" @click="nextSlide(amenity.title, amenity.images.length)" aria-label="Next image" type="button">&gt;</button>
                <button class="see-more-btn" @click="toggleInfo(amenity.title)" type="button">
                  {{ showInfo[amenity.title] ? 'See Less' : 'See More' }}
                </button>

                <div class="info-overlay" :class="{ show: showInfo[amenity.title] }">
                  <div class="info-title">{{ amenity.title }}</div>
                  <div class="info-desc">{{ amenity.description }}</div>
                  <router-link v-if="amenity.bookable" to="/reservation" class="add-btn">
                    Book {{ amenity.title }}
                  </router-link>
                </div>
              </div>

              <div class="card-body">
                <h3 class="card-title">{{ amenity.title }}</h3>
                <p class="card-desc">{{ amenity.description }}</p>
                <router-link v-if="amenity.bookable" to="/reservation" class="hidden sm:inline-flex add-btn">
                  Book {{ amenity.title }}
                </router-link>
              </div>
            </article>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="mt-20 text-center reveal">
          <div class="inline-block relative group">
            <router-link
              to="/reservation"
              class="cta-btn"
            >
              <i class="fas fa-calendar-check text-lg"></i>
              Book Your Experience Today
            </router-link>
          </div>
          <p class="mt-6 text-gray-600 text-sm max-w-md mx-auto">
            Experience world-class amenities designed for unforgettable moments with family and friends.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />
    <ChatbotModal />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'

const sidebarOpen = ref(false)

const poolAmenities = [
  {
    title: 'Mini-Olympic Size Swimming Pool',
    description: 'Dive into our expansive pool with crystal-clear, temperature-controlled water. Perfect for laps, family swims, or floating under the tropical sun.',
    images: ['/images/img1.jpg', '/images/img3.jpg', '/images/img5.jpg']
  },
  {
    title: 'Kiddie Pool w/ Slide',
    description: 'A colorful, shallow splash zone with a twisting slide designed just for little ones. Safe, supervised, and endlessly entertaining.',
    images: ['/images/img1.jpg', '/images/img2.jpg']
  },
  {
    title: 'Swimming Club',
    description: 'Join exclusive aqua-aerobics, swim lessons, or friendly competitions. Certified coaches ensure fun and fitness for all ages.',
    images: ['/images/img7.jpg', '/images/img1.jpg']
  }
]

const eventAmenities = [
  {
    title: 'Bar and Restaurant',
    description: 'Savor tropical cocktails and gourmet Filipino-international fusion dishes while overlooking the pools. Open from sunrise to midnight.',
    images: ['/images/img8.jpg', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80']
  },
  {
    title: 'Function Hall',
    description: 'Elegant, air-conditioned venue for weddings, corporate events, or birthdays. State-of-the-art AV and catering services included.',
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80']
  },
  {
    title: 'Air-Conditioned Cottages',
    description: 'Private, stylish cottages with plush beds, en-suite bathrooms, and scenic views. Your serene home-away-from-home.',
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', '/images/img10.jpg'],
    bookable: true
  }
]

const currentSlides = ref({})
const showInfo = ref({})
let autoplayIntervals = []
const allAmenities = [...poolAmenities, ...eventAmenities]

allAmenities.forEach((amenity) => {
  currentSlides.value[amenity.title] = 0
  showInfo.value[amenity.title] = false
})

const nextSlide = (title, length) => { currentSlides.value[title] = (currentSlides.value[title] + 1) % length }
const prevSlide = (title, length) => { currentSlides.value[title] = (currentSlides.value[title] - 1 + length) % length }
const toggleInfo = (title) => { showInfo.value[title] = !showInfo.value[title] }

const startAutoplay = () => {
  stopAutoplay()
  autoplayIntervals = allAmenities.map((amenity) =>
    setInterval(() => nextSlide(amenity.title, amenity.images.length), 4000)
  )
}

const stopAutoplay = () => {
  autoplayIntervals.forEach((interval) => clearInterval(interval))
  autoplayIntervals = []
}

onMounted(() => {
  startAutoplay()

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

  const cards = document.querySelectorAll('.group')
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10
      card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-8px)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0)'
    })
  })
})

onUnmounted(() => stopAutoplay())
</script>

<style scoped>
/* ── Variables ── */
* {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark: #1E88B6;
  --color-gold: #F4C400;
  --color-gold-dark: #F2C200;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;
  --color-gray-bg: #f9fafb;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;
}

/* ── Hero ── */
.amenities-hero {
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
  box-sizing: border-box;
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

/* ── Category Headers ── */
.category-header {
  font-weight: 900;
  font-size: 2.5rem;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.amenity-list {
  color: #0369a1;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  letter-spacing: 0.3px;
}

/* ── Reveal animation ── */
.reveal {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ── Amenity Card ── */
.amenity-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.10);
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e5e7eb;
}

.amenity-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 16px 40px rgba(3, 105, 161, 0.18);
}

/* ── Carousel ── */
.carousel-container {
  position: relative;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  height: 220px;
}

@media (min-width: 641px) {
  .carousel-container { height: 260px; }
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease;
  height: 100%;
}

.carousel-slide {
  min-width: 100%;
  position: relative;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.amenity-card:hover .carousel-slide img {
  transform: scale(1.08);
}

/* ── Arrows ── */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #0369a1;
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.15);
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s ease;
  border: none;
  font-weight: 700;
}

.carousel-arrow:hover {
  background: #F4C400;
  color: #0C3B5E;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 18px rgba(244, 196, 0, 0.35);
}

.carousel-arrow.prev { left: 1rem; }
.carousel-arrow.next { right: 1rem; }

/* ── See More (mobile) ── */
.see-more-btn {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border-radius: 50px;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  cursor: pointer;
}

.see-more-btn:hover {
  background: rgba(244, 196, 0, 0.35);
  border-color: #F4C400;
  transform: translateX(-50%) translateY(-3px);
}

/* ── Info Overlay (mobile) ── */
.info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1.5rem 1.5rem;
  background: linear-gradient(to top, rgba(12, 59, 94, 0.97), rgba(12, 59, 94, 0.88) 70%, transparent);
  color: white;
  transform: translateY(100%);
  transition: transform 0.4s ease;
  z-index: 15;
  border-radius: 0 0 16px 16px;
}

.info-overlay.show { transform: translateY(0); }

.info-title {
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: white;
}

.info-desc {
  font-size: 0.88rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  line-height: 1.55;
}

/* ── Card Body ── */
.card-body {
  padding: 20px 22px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0C3B5E;
}

.card-desc {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.7;
  flex: 1;
}

/* ── Buttons ── */
.add-btn {
  background: #F4C400;
  color: #0C3B5E;
  padding: 0.6rem 1.4rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.88rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(244, 196, 0, 0.3);
  display: inline-block;
  text-decoration: none;
  text-align: center;
}

.add-btn:hover {
  background: #F2C200;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(244, 196, 0, 0.45);
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 36px;
  background: #F4C400;
  color: #0C3B5E;
  font-weight: 800;
  font-size: 1rem;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(244, 196, 0, 0.35);
}

.cta-btn:hover {
  background: #F2C200;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 10px 28px rgba(244, 196, 0, 0.5);
}

/* ── Animations ── */
@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pulse-soft { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }

.animate-spin-slow { animation: spin-slow 10s linear infinite; }
.animate-pulse-slow { animation: pulse-soft 3s ease-in-out infinite; }

.group {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .category-header { font-size: 1.8rem; }
  .amenity-list { font-size: 0.95rem; }
}

@media (max-width: 640px) {
  .amenities-hero { height: 100svh; min-height: 100svh; max-height: 100svh; }
  .hero-content { padding: 32px 16px; }
  .hero-subtext br { display: none; }
  .category-header { font-size: 1.5rem; }
  .amenity-list { font-size: 0.85rem; }
  .carousel-container { height: 220px; }
  .amenity-card:hover { transform: translateY(-6px); }
}

@media (min-width: 641px) {
  .see-more-btn, .info-overlay { display: none !important; }
}
</style>