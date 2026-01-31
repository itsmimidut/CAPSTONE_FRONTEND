<template>
  <div class="min-h-screen bg-gradient">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <RatesHero />

    <!-- Tabs Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4 max-w-6xl">
        
        <!-- Tab Buttons -->
        <div class="tab-buttons">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Tab Content -->
        <transition name="fade" mode="out-in">
          <!-- Entrance Fees -->
          <div v-if="activeTab === 'entrance'" key="entrance">
            <RateCard
              title="Day Pass & Entrance"
              icon="fas fa-ticket-alt"
              :tableData="entranceRates"
              :tableHeaders="['Category', 'Rate']"
              note="Proper swimwear required. One exit only."
              ctaText="Book Day Pass"
              image="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80"
            />
          </div>

          <!-- Rooms -->
          <div v-else-if="activeTab === 'rooms'" key="rooms">
            <RateCard
              title="Rooms"
              icon="fas fa-bed"
              :tableData="roomRates"
              :tableHeaders="['Type', 'Rate']"
              note="Good for multiple pax. Contact for availability."
              ctaText="Book Room"
              image="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80"
            />
          </div>

          <!-- Cottages -->
          <div v-else-if="activeTab === 'cottages'" key="cottages">
            <RateCard
              title="Cottages (6 hours)"
              icon="fas fa-umbrella-beach"
              :tableData="cottageRates"
              :tableHeaders="['Type', 'Rate']"
              note="Max 15 pax. No alcohol. Swimwear required."
              ctaText="Reserve Cottage"
              image="https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80"
            />
          </div>

          <!-- Function Hall -->
          <div v-else-if="activeTab === 'function'" key="function">
            <RateCard
              :title="functionCard.title"
              :price="functionCard.price"
              :capacity="functionCard.capacity"
              :features="functionFeatures"
              :icon="functionCard.icon"
              :ctaText="functionCard.cta_text"
              :ctaLink="functionCard.cta_link"
              :ctaIcon="functionCard.cta_icon"
              :image="functionCard.image"
            />
          </div>
        </transition>
      </div>
    </section>

    <!-- Contact Section -->
    <ContactSection />

    <!-- Footer -->
    <AppFooter />

    <!-- Chatbot -->
    <ChatbotModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'
import RatesHero from '../../components/RatesHero.vue'
import RateCard from '../../components/RateCard.vue'
import ContactSection from '../../components/ContactSection.vue'
import { useRooms } from '../../composables/useRooms'

const sidebarOpen = ref(false)
const activeTab = ref('entrance')

const tabs = [
  { id: 'entrance', label: 'Entrance', icon: 'fas fa-ticket-alt' },
  { id: 'rooms', label: 'Rooms', icon: 'fas fa-bed' },
  { id: 'cottages', label: 'Cottages', icon: 'fas fa-umbrella-beach' },
  { id: 'function', label: 'Function Hall', icon: 'fas fa-building' }
]

const { items: roomItems, fetchAll: fetchRooms, getRoomImage, formatPrice } = useRooms()

// Hardcoded entrance fees
const entranceRates = [
  { label: 'Adults', value: '₱150' },
  { label: 'Children (below 4ft)', value: '₱100' },
  { label: 'Senior Citizen/PWD', value: '₱120' }
]

// Rooms from inventory - Table format
const roomRates = computed(() => {
  return roomItems.value
    .filter(item => item.category_type?.toLowerCase() === 'room' || item.category?.toLowerCase() === 'room')
    .map(item => ({
      label: item.name || 'Room',
      value: item.price ? `${formatPrice(item.price)} / night` : 'Contact for pricing'
    }))
})

// Cottages from inventory
const cottageRates = computed(() => {
  return roomItems.value
    .filter(item => item.category_type?.toLowerCase() === 'cottage')
    .map(item => ({
      label: item.name || 'Cottage',
      value: item.price ? formatPrice(item.price) : 'Contact for pricing'
    }))
})

// Hardcoded function hall
const functionCard = {
  title: 'Function Hall',
  price: '₱25,000 / 6 hrs',
  capacity: 'Up to 70 pax',
  features: [
    'Air-conditioned venue',
    'Tables and chairs included',
    'Sound system available',
    'Catering services can be arranged',
    'Ideal for events, seminars, and celebrations'
  ],
  icon: 'fas fa-building',
  cta_text: 'Inquire Now',
  cta_link: '/contact',
  cta_icon: 'fas fa-envelope',
  image: 'https://images.unsplash.com/photo-1519167758481-83f29da8c686?w=800&q=80'
}

const functionFeatures = computed(() => functionCard.features)

onMounted(async () => {
  await fetchRooms()
})
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(to bottom, #E0F7FA, white);
}

.tab-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0;
}

@media (max-width: 1024px) {
  .tab-buttons {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .tab-buttons {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
}

.tab-btn {
  padding: 1rem;
  font-weight: 600;
  color: #718096;
  border-radius: 12px 12px 0 0;
  background: #f8fafc;
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
  font-size: 0.95rem;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn i {
  font-size: 1.25rem;
}

.tab-btn span {
  display: block;
}

.tab-btn:hover {
  background: #e2e8f0;
  color: #2B6CB0;
}

.tab-btn.active {
  background: linear-gradient(135deg, #2B6CB0, #1e40af);
  color: white;
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

@media (max-width: 640px) {
  .tab-btn {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
  
  .tab-btn i {
    font-size: 1rem;
  }
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>