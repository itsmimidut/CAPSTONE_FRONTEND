<!-- App.vue -->
<template>
  <div class="bg-gradient-to-b from-cyan-50 to-white min-h-screen">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Search Section -->
    <section class="max-w-7xl mx-auto px-4 py-8">
      <div class="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6 hover:shadow-lg transition">
        <!-- Desktop Search -->
        <div class="hidden md:grid md:grid-cols-4 gap-4">
          <div>
            <label class="text-xs text-gray-500 block mb-1 font-semibold">Check-in – Check-out</label>
            <button @click="showCalendar = true" class="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 flex justify-between items-center hover:border-blue-700 bg-gray-50 hover:bg-blue-50 transition text-left">
              <span class="text-sm font-semibold text-gray-700">{{ dateStr }}</span>
              <i class="fas fa-calendar-alt text-blue-700"></i>
            </button>
          </div>

          <div>
            <label class="text-xs text-gray-500 block mb-1 font-semibold">Guests</label>
            <button @click="showGuests = true" class="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 flex justify-between items-center hover:border-blue-700 bg-gray-50 hover:bg-blue-50 transition text-left">
              <span class="text-sm font-semibold text-gray-700">{{ guestStr }}</span>
              <i class="fas fa-user text-blue-700"></i>
            </button>
          </div>

          <div>
            <label class="text-xs text-gray-500 block mb-1 font-semibold">Promo Code</label>
            <input placeholder="Optional" class="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-700 bg-gray-50 transition" />
          </div>

          <div class="flex items-end">
            <button class="w-full py-2.5 bg-gradient-to-r from-blue-700 to-blue-400 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2">
              <i class="fas fa-search"></i> Search
            </button>
          </div>
        </div>

        <!-- Mobile Search -->
        <div class="md:hidden">
          <button @click="mobileSearchOpen = !mobileSearchOpen" class="w-full py-2.5 bg-blue-700 text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition">
            Modify Search
          </button>

          <div v-if="mobileSearchOpen" class="mt-4 space-y-3">
            <button @click="showCalendar = true" class="w-full rounded-xl border-2 border-gray-200 px-4 py-3 flex justify-between items-center text-left hover:border-blue-700 transition">
              <span class="text-sm font-semibold">{{ dateStr }}</span>
              <i class="fas fa-calendar-alt text-blue-700"></i>
            </button>

            <button @click="showGuests = true" class="w-full rounded-xl border-2 border-gray-200 px-4 py-3 flex justify-between items-center text-left hover:border-blue-700 transition">
              <span class="text-sm font-semibold">{{ guestStr }}</span>
              <i class="fas fa-user text-blue-700"></i>
            </button>

            <input placeholder="Promo code" class="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition" />

            <div class="flex gap-3">
              <button class="flex-1 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition">Search</button>
              <button @click="mobileSearchOpen = false" class="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition">Done</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 pb-16">
      <div class="lg:flex lg:gap-8">
        <!-- Items Section -->
        <section class="lg:w-2/3 space-y-8">
          <!-- Category Tabs -->
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="cat in Object.keys(itemData)"
              :key="cat"
              @click="currentCategory = cat; currentCategoryLabel = cat.charAt(0).toUpperCase() + cat.slice(1)"
              :class="[
                'px-4 py-2 rounded-full font-bold text-sm transition',
                currentCategory === cat
                  ? 'bg-blue-700 text-white shadow-md'
                  : ' text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
            </button>

            <div class="text-sm space-y-6 mt-2 text-gray-500 ml-auto">
              Showing: <span class="font-semibold text-gray-700">{{ currentCategoryLabel }}</span>
            </div>
          </div>

          <!-- Items List -->
          <div class="space-y-6">
            <ItemCard
              v-for="item in itemData[currentCategory]"
              :key="item.id"
              :item="item"
              @book="addToBooking"
              @view-more="openViewMore"
            />
          </div>
        </section>

        <!-- Booking Summary -->
        <aside class="lg:w-1/3 mt-8 lg:mt-0">
          <BookingSummary
            :booking="booking"
            :nights="nights"
            :total="total"
            :check-in="checkIn"
            :check-out="checkOut"
            @remove="removeFromBooking"
            @clear="booking = []"
          />
        </aside>
      </div>
    </main>

    <!-- Calendar Modal -->
    <CalendarModal
      :is-open="showCalendar"
      :check-in="checkIn"
      :check-out="checkOut"
      :current-month="currentMonth"
      @close="showCalendar = false"
      @select-date="selectDate"
      @prev-month="prevMonth"
      @next-month="nextMonth"
      @clear="clearDates"
    />

    <!-- Guests Modal -->
    <GuestsModal
      :is-open="showGuests"
      :adults="adults"
      :children="children"
      @close="showGuests = false"
      @change-adults="changeAdults"
      @change-children="changeChildren"
    />

    <!-- View More Modal -->
    <ViewMoreModal
      :is-open="showViewMore"
      :item="selectedItem"
      @close="showViewMore = false"
    />
  </div>
      <!-- Footer -->
    <div class="mt-16">
      <Footer />
    </div>
</template>

<script>
import { ref } from 'vue'
import ItemCard from '../../components/ItemCard.vue'
import BookingSummary from '../../components/BookingSummary.vue'
import CalendarModal from '../../components/CalendarModal.vue'
import GuestsModal from '../../components/GuestsModal.vue'
import ViewMoreModal from '../../components/ViewMoreModal.vue'
import Footer from '../../components/AppFooter.vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'

const sidebarOpen = ref(false)
const menuOpen = ref(false)

export default {
  name: 'App',
  components: {
    ItemCard,
    BookingSummary,
    CalendarModal,
    GuestsModal,
    ViewMoreModal,
    Footer,
    AppHeader,
    AppSidebar
  },
  data() {
    return {
      sidebarOpen: false,
      mobileSearchOpen: false,
      showCalendar: false,
      showGuests: false,
      showViewMore: false,
      selectedItem: null,
      headerVisible: true,
      lastScrollY: 0,
      currentCategory: 'rooms',
      currentCategoryLabel: 'Rooms',
      currentMonth: new Date(),
      checkIn: null,
      checkOut: null,
      adults: 2,
      children: 0,
      booking: [],
      navItems: ['Home', 'Amenities', 'Rates', 'Reservation', 'Gallery', 'Contact', 'About'],
      itemData: {
        rooms: [
          { id: 'r1', name: 'Garden Glass Villa', price: 18500, originalPrice: 25000, desc: 'Experience a perfect blend of elegance and nature...', amenities: ['Free WiFi', 'Private Hot Tub', 'Beach Access', 'Breakfast Included'], imgs: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'], perNight: true, maxGuests: 2 },
          { id: 'r2', name: 'Deluxe Room', price: 9500, desc: 'A comfortable, modern room with garden views...', amenities: ['Free WiFi', 'Smart TV', 'Garden View'], imgs: ['https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?auto=format&fit=crop&w=1200&q=80'], perNight: true, maxGuests: 2 },
          { id: 'r3', name: 'Family Suite', price: 22000, desc: 'Spacious two-bedroom suite...', amenities: ['Two Bedrooms', 'Kitchenette'], imgs: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'], perNight: true, maxGuests: 6 }
        ],
        cottages: [
          { id: 'c1', name: 'Beachfront Cottage', price: 8200, desc: 'Wake up to the sound of the ocean...', amenities: ['Ocean View', 'Outdoor Seating'], imgs: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'], perNight: true, maxGuests: 4 },
          { id: 'c2', name: 'Garden Cottage', price: 7500, desc: 'A tranquil hideaway...', amenities: ['Private Cottage', 'Garden View'], imgs: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'], perNight: true, maxGuests: 3 }
        ],
        food: [
          { id: 'f1', name: 'Beachfront Dinner Set', price: 1800, desc: 'Enjoy a romantic three-course dinner...', amenities: ['3-Course Dinner for Two'], imgs: ['https://images.unsplash.com/photo-1541542684-3b05a8f9c4c8?auto=format&fit=crop&w=1200&q=80'], perNight: false, maxGuests: 2 },
          { id: 'f2', name: 'Group Buffet Package', price: 3500, desc: 'Ideal for families or large groups...', amenities: ['All-You-Can-Eat Buffet'], imgs: ['https://images.unsplash.com/photo-1541542684-3b05a8f9c4c8?auto=format&fit=crop&w=1200&q=80'], perNight: false, maxGuests: 10 }
        ],
        events: [
          { id: 'e1', name: 'Small Wedding Package', price: 45000, desc: 'Celebrate your dream wedding...', amenities: ['Venue Setup', 'Full Catering'], imgs: ['https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80'], perNight: false, maxGuests: 50 },
          { id: 'e2', name: 'Corporate Event', price: 30000, desc: 'Host your next company retreat...', amenities: ['Function Hall', 'AV Equipment'], imgs: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'], perNight: false, maxGuests: 100 }
        ]
      }
    }
  },
  computed: {
    nights() {
      if (!this.checkIn || !this.checkOut) return 0
      return Math.ceil((this.checkOut - this.checkIn) / 86400000)
    },
    total() {
      return this.booking.reduce((sum, b) => {
        const isNight = b.item.perNight
        const base = b.item.price * b.qty
        return sum + (isNight && this.nights ? base * this.nights : base)
      }, 0)
    },
    dateStr() {
      if (this.checkIn && this.checkOut) {
        const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        return `${fmt(this.checkIn)} – ${fmt(this.checkOut)}`
      }
      if (this.checkIn) {
        return this.checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      }
      return 'Select Dates'
    },
    guestStr() {
      let str = `${this.adults} Adult${this.adults > 1 ? 's' : ''}`
      if (this.children) {
        str += `, ${this.children} Child${this.children > 1 ? 'ren' : ''}`
      }
      return str
    }
  },
  methods: {
    selectDate(date) {
      if (!this.checkIn || (this.checkIn && this.checkOut)) {
        this.checkIn = date
        this.checkOut = null
      } else if (date > this.checkIn) {
        this.checkOut = date
      } else {
        this.checkIn = date
        this.checkOut = null
      }
    },
    prevMonth() {
      this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1)
    },
    nextMonth() {
      this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1)
    },
    clearDates() {
      this.checkIn = null
      this.checkOut = null
    },
    changeAdults(delta) {
      this.adults = Math.max(1, this.adults + delta)
    },
    changeChildren(delta) {
      this.children = Math.max(0, this.children + delta)
    },
    addToBooking(item, qty, guests) {
      const existing = this.booking.find(b => b.item.id === item.id)
      if (existing) {
        existing.qty += qty
        existing.guests = guests
      } else {
        this.booking.push({ item, qty, guests })
      }
    },
    removeFromBooking(itemId) {
      this.booking = this.booking.filter(b => b.item.id !== itemId)
    },
    openViewMore(item) {
      this.selectedItem = item
      this.showViewMore = true
    }
  },
  mounted() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > this.lastScrollY && window.scrollY > 100) {
        this.headerVisible = false
      } else {
        this.headerVisible = true
      }
      this.lastScrollY = window.scrollY
    })
  }
}
</script>