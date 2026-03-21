<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-yellow-50/30 overflow-x-hidden">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <section class="amenities-hero" :style="heroStyle">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">{{ pageConfig.hero.badge }}</div>
        <h1 class="hero-heading">
          <span class="heading-white">{{ pageConfig.hero.titleLine1 }}</span>
          <span class="heading-gold">{{ pageConfig.hero.titleLine2 }}</span>
        </h1>
        <p class="hero-subtext">{{ pageConfig.hero.subtitle }}</p>
      </div>
    </section>

    <section id="amenity-grid" class="relative py-20">
      <div class="container mx-auto px-4 max-w-7xl relative z-10">
        <div
          v-for="(category, categoryIndex) in pageConfig.categories"
          :key="category.id || categoryIndex"
          class="relative"
          :class="{ 'mb-16': categoryIndex < pageConfig.categories.length - 1 }"
        >
          <div class="flex justify-center items-center mb-10">
            <div
              class="h-1 w-16 rounded-full"
              :class="categoryIndex % 2 === 0 ? 'bg-gradient-to-r from-blue-400 to-transparent' : 'bg-gradient-to-r from-yellow-400 to-transparent'"
            ></div>
            <div class="mx-4">
              <div
                class="w-4 h-4 rounded-full animate-spin-slow"
                :class="categoryIndex % 2 === 0 ? 'bg-gradient-to-br from-yellow-400 to-blue-400' : 'bg-gradient-to-br from-blue-400 to-yellow-400'"
              ></div>
            </div>
            <div
              class="h-1 w-16 rounded-full"
              :class="categoryIndex % 2 === 0 ? 'bg-gradient-to-l from-blue-400 to-transparent' : 'bg-gradient-to-l from-yellow-400 to-transparent'"
            ></div>
          </div>

          <h2 class="category-header reveal text-center">
            <span
              class="inline-block bg-clip-text text-transparent"
              :class="categoryIndex % 2 === 0
                ? 'bg-gradient-to-r from-blue-800 via-blue-700 to-yellow-600'
                : 'bg-gradient-to-r from-yellow-600 via-blue-700 to-blue-800'"
            >
              {{ category.heading }}
            </span>
          </h2>

          <p class="amenity-list reveal text-center">
            <span
              class="inline-block px-4 py-2 rounded-full shadow-sm"
              :class="categoryIndex % 2 === 0
                ? 'bg-gradient-to-r from-blue-50 to-yellow-50/50 border border-blue-100'
                : 'bg-gradient-to-r from-yellow-50 to-blue-50/50 border border-yellow-100'"
            >
              {{ category.listText }}
            </span>
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            <article
              v-for="(amenity, cardIndex) in category.cards"
              :key="`${category.id || categoryIndex}-${amenity.title}-${cardIndex}`"
              class="amenity-card reveal group"
              :style="`transition-delay: ${(categoryIndex * 200 + cardIndex * 100)}ms`"
            >
              <div class="carousel-container">
                <div
                  class="carousel-track"
                  :style="{ transform: `translateX(-${currentSlides[cardKey(categoryIndex, cardIndex)] * 100}%)` }"
                >
                  <div
                    v-for="(image, imageIndex) in amenity.images"
                    :key="imageIndex"
                    class="carousel-slide"
                  >
                    <img :src="image" :alt="`${amenity.title} ${imageIndex + 1}`" />
                  </div>
                </div>

                <button
                  class="carousel-arrow prev"
                  @click="prevSlide(cardKey(categoryIndex, cardIndex), amenity.images.length)"
                  aria-label="Previous image"
                  type="button"
                >&lt;</button>
                <button
                  class="carousel-arrow next"
                  @click="nextSlide(cardKey(categoryIndex, cardIndex), amenity.images.length)"
                  aria-label="Next image"
                  type="button"
                >&gt;</button>
                <button class="see-more-btn" @click="toggleInfo(cardKey(categoryIndex, cardIndex))" type="button">
                  {{ showInfo[cardKey(categoryIndex, cardIndex)] ? 'See Less' : 'See More' }}
                </button>

                <div class="info-overlay" :class="{ show: showInfo[cardKey(categoryIndex, cardIndex)] }">
                  <div class="info-title">{{ amenity.title }}</div>
                  <div class="info-desc">{{ amenity.description }}</div>
                  <router-link v-if="amenity.bookable" :to="amenity.buttonLink || '/reservation'" class="add-btn">
                    Book {{ amenity.title }}
                  </router-link>
                </div>
              </div>

              <div class="card-body">
                <h3 class="card-title">{{ amenity.title }}</h3>
                <p class="card-desc">{{ amenity.description }}</p>
                <router-link
                  v-if="amenity.bookable"
                  :to="amenity.buttonLink || '/reservation'"
                  class="hidden sm:inline-flex add-btn"
                >
                  Book {{ amenity.title }}
                </router-link>
              </div>
            </article>
          </div>

          <div
            v-if="categoryIndex < pageConfig.categories.length - 1"
            class="my-20 flex justify-center"
          >
            <div class="w-24 h-1 bg-gradient-to-r from-blue-400 via-yellow-400 to-blue-400 rounded-full animate-pulse-slow"></div>
          </div>
        </div>

        <div class="mt-20 text-center reveal">
          <div class="inline-block relative group">
            <router-link :to="pageConfig.cta.buttonLink || '/reservation'" class="cta-btn">
              <i class="fas fa-calendar-check text-lg"></i>
              {{ pageConfig.cta.buttonText }}
            </router-link>
          </div>
          <p class="mt-6 text-gray-600 text-sm max-w-md mx-auto">
            {{ pageConfig.cta.helperText }}
          </p>
        </div>
      </div>
    </section>

    <AppFooter />
    <ChatbotModal />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import axios from 'axios'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'

const API_BASE = 'http://localhost:8000/api/website-config'

const defaultConfig = {
  hero: {
    badge: "Eduardo's Resort",
    titleLine1: 'World-Class',
    titleLine2: 'Amenities',
    subtitle:
      'From Olympic-sized pools to elegant dining and air-conditioned cottages - every detail is crafted for your ultimate relaxation, joy, and unforgettable memories.',
    backgroundImage: 'https://www.eduardosresort.com/images/IMG_4224.JPG'
  },
  categories: [
    {
      id: 'pools',
      heading: 'Aquatic Paradise',
      listText: 'MINI-OLYMPIC SIZE SWIMMING POOL • KIDDIE POOL w/ SLIDE • SWIMMING CLUB',
      cards: [
        {
          title: 'Mini-Olympic Size Swimming Pool',
          description: 'Dive into our expansive pool with crystal-clear, temperature-controlled water. Perfect for laps, family swims, or floating under the tropical sun.',
          images: ['/images/img1.jpg', '/images/img3.jpg', '/images/img5.jpg'],
          bookable: false,
          buttonLink: '/reservation'
        },
        {
          title: 'Kiddie Pool w/ Slide',
          description: 'A colorful, shallow splash zone with a twisting slide designed just for little ones. Safe, supervised, and endlessly entertaining.',
          images: ['/images/img1.jpg', '/images/img2.jpg'],
          bookable: false,
          buttonLink: '/reservation'
        },
        {
          title: 'Swimming Club',
          description: 'Join exclusive aqua-aerobics, swim lessons, or friendly competitions. Certified coaches ensure fun and fitness for all ages.',
          images: ['/images/img7.jpg', '/images/img1.jpg'],
          bookable: false,
          buttonLink: '/reservation'
        }
      ]
    },
    {
      id: 'comfort',
      heading: 'Luxury Comfort & Dining',
      listText: 'BAR and RESTAURANT • FUNCTION HALL • AIR CONDITIONED ROOMS',
      cards: [
        {
          title: 'Bar and Restaurant',
          description: 'Savor tropical cocktails and gourmet Filipino-international fusion dishes while overlooking the pools. Open from sunrise to midnight.',
          images: ['/images/img8.jpg', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'],
          bookable: false,
          buttonLink: '/reservation'
        },
        {
          title: 'Function Hall',
          description: 'Elegant, air-conditioned venue for weddings, corporate events, or birthdays. State-of-the-art AV and catering services included.',
          images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80'],
          bookable: false,
          buttonLink: '/reservation'
        },
        {
          title: 'Air-Conditioned Cottages',
          description: 'Private, stylish cottages with plush beds, en-suite bathrooms, and scenic views. Your serene home-away-from-home.',
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', '/images/img10.jpg'],
          bookable: true,
          buttonLink: '/reservation'
        }
      ]
    }
  ],
  cta: {
    buttonText: 'Book Your Experience Today',
    buttonLink: '/reservation',
    helperText: 'Experience world-class amenities designed for unforgettable moments with family and friends.'
  }
}

const sidebarOpen = ref(false)
const pageConfig = ref(structuredClone(defaultConfig))
const currentSlides = ref({})
const showInfo = ref({})

let autoplayIntervals = []
let observer = null
let cardBindings = []

const heroStyle = computed(() => ({
  backgroundImage: `url('${pageConfig.value.hero.backgroundImage}')`
}))

const allCards = computed(() =>
  (pageConfig.value.categories || []).flatMap((category, cIndex) =>
    (category.cards || []).map((card, cardIndex) => ({ cIndex, cardIndex, ...card }))
  )
)

const cardKey = (categoryIndex, cardIndex) => `${categoryIndex}-${cardIndex}`

const sanitizeConfig = (raw) => {
  const source = raw && typeof raw === 'object' ? raw : defaultConfig
  const categories = Array.isArray(source.categories) ? source.categories : []

  return {
    hero: {
      badge: String(source.hero?.badge || defaultConfig.hero.badge),
      titleLine1: String(source.hero?.titleLine1 || defaultConfig.hero.titleLine1),
      titleLine2: String(source.hero?.titleLine2 || defaultConfig.hero.titleLine2),
      subtitle: String(source.hero?.subtitle || defaultConfig.hero.subtitle),
      backgroundImage: String(source.hero?.backgroundImage || defaultConfig.hero.backgroundImage)
    },
    categories: categories.map((category, cIndex) => ({
      id: String(category?.id || `category-${cIndex + 1}`),
      heading: String(category?.heading || ''),
      listText: String(category?.listText || ''),
      cards: Array.isArray(category?.cards)
        ? category.cards.map((card) => ({
            title: String(card?.title || ''),
            description: String(card?.description || ''),
            images: Array.isArray(card?.images) ? card.images.filter(Boolean) : [],
            bookable: Boolean(card?.bookable),
            buttonLink: String(card?.buttonLink || '/reservation')
          }))
        : []
    })),
    cta: {
      buttonText: String(source.cta?.buttonText || defaultConfig.cta.buttonText),
      buttonLink: String(source.cta?.buttonLink || defaultConfig.cta.buttonLink),
      helperText: String(source.cta?.helperText || defaultConfig.cta.helperText)
    }
  }
}

const initializeSlideState = () => {
  const slideState = {}
  const infoState = {}

  allCards.value.forEach((card) => {
    const key = cardKey(card.cIndex, card.cardIndex)
    slideState[key] = 0
    infoState[key] = false
  })

  currentSlides.value = slideState
  showInfo.value = infoState
}

const nextSlide = (key, length) => {
  if (!length || length < 1) return
  currentSlides.value[key] = ((currentSlides.value[key] || 0) + 1) % length
}

const prevSlide = (key, length) => {
  if (!length || length < 1) return
  currentSlides.value[key] = ((currentSlides.value[key] || 0) - 1 + length) % length
}

const toggleInfo = (key) => {
  showInfo.value[key] = !showInfo.value[key]
}

const stopAutoplay = () => {
  autoplayIntervals.forEach(clearInterval)
  autoplayIntervals = []
}

const startAutoplay = () => {
  stopAutoplay()
  autoplayIntervals = allCards.value.map((card) =>
    setInterval(() => nextSlide(cardKey(card.cIndex, card.cardIndex), card.images.length), 4000)
  )
}

const setupRevealAndTilt = async () => {
  await nextTick()

  if (observer) observer.disconnect()

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

  cardBindings.forEach(({ el, moveHandler, leaveHandler }) => {
    el.removeEventListener('mousemove', moveHandler)
    el.removeEventListener('mouseleave', leaveHandler)
  })
  cardBindings = []

  document.querySelectorAll('.group').forEach((card) => {
    const moveHandler = (e) => {
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10
      card.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-8px)`
    }
    const leaveHandler = () => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0)'
    }

    card.addEventListener('mousemove', moveHandler)
    card.addEventListener('mouseleave', leaveHandler)
    cardBindings.push({ el: card, moveHandler, leaveHandler })
  })
}

const loadAmenitiesConfig = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/amenities`)
    pageConfig.value = sanitizeConfig(data?.config)
  } catch {
    pageConfig.value = sanitizeConfig(defaultConfig)
  }

  initializeSlideState()
  startAutoplay()
  await setupRevealAndTilt()
}

onMounted(async () => {
  await loadAmenitiesConfig()
})

onUnmounted(() => {
  stopAutoplay()
  if (observer) observer.disconnect()

  cardBindings.forEach(({ el, moveHandler, leaveHandler }) => {
    el.removeEventListener('mousemove', moveHandler)
    el.removeEventListener('mouseleave', leaveHandler)
  })
  cardBindings = []
})
</script>

<style scoped>
* {
  --color-primary: #0369a1;
  --color-primary-light: #1f8dbf;
  --color-primary-dark: #1e88b6;
  --color-gold: #f4c400;
  --color-gold-dark: #f2c200;
  --color-navy: #0c3b5e;
  --color-white: #ffffff;
  --color-gray-bg: #f9fafb;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;
}

.amenities-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
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
  max-width: 840px;
  width: 100%;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #ffffff;
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
  color: #ffffff;
  display: block;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.heading-gold {
  font-size: clamp(2rem, 4.5vw, 3.8rem);
  font-weight: 800;
  color: #f4c400;
  display: block;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.hero-subtext {
  font-size: clamp(0.88rem, 1.3vw, 1rem);
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.75;
  font-weight: 400;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
}

.category-header {
  font-weight: 900;
  font-size: 2.5rem;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.amenity-list {
  color: #0369a1;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  letter-spacing: 0.3px;
}

.reveal {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.amenity-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.1);
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e5e7eb;
}

.amenity-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 16px 40px rgba(3, 105, 161, 0.18);
}

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
  background: #f4c400;
  color: #0c3b5e;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 18px rgba(244, 196, 0, 0.35);
}

.carousel-arrow.prev { left: 1rem; }
.carousel-arrow.next { right: 1rem; }

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.see-more-btn:hover {
  background: rgba(244, 196, 0, 0.35);
  border-color: #f4c400;
  transform: translateX(-50%) translateY(-3px);
}

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
  color: #0c3b5e;
}

.card-desc {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.7;
  flex: 1;
}

.add-btn {
  background: #f4c400;
  color: #0c3b5e;
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
  background: #f2c200;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(244, 196, 0, 0.45);
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 36px;
  background: #f4c400;
  color: #0c3b5e;
  font-weight: 800;
  font-size: 1rem;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(244, 196, 0, 0.35);
}

.cta-btn:hover {
  background: #f2c200;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 10px 28px rgba(244, 196, 0, 0.5);
}

@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pulse-soft { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }

.animate-spin-slow { animation: spin-slow 10s linear infinite; }
.animate-pulse-slow { animation: pulse-soft 3s ease-in-out infinite; }

.group {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 768px) {
  .category-header { font-size: 1.8rem; }
  .amenity-list { font-size: 0.95rem; }
}

@media (max-width: 640px) {
  .amenities-hero { height: 100svh; min-height: 100svh; max-height: 100svh; }
  .hero-content { padding: 32px 16px; }
  .category-header { font-size: 1.5rem; }
  .amenity-list { font-size: 0.85rem; }
  .carousel-container { height: 220px; }
  .amenity-card:hover { transform: translateY(-6px); }
}

@media (min-width: 641px) {
  .see-more-btn,
  .info-overlay { display: none !important; }
}
</style>
