<template>
  <div class=" min-h-screen">
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
    <main class="max-w-7xl mx-auto">
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
            :items="booking"
            :check-in="checkIn"
            :check-out="checkOut"
            :subtotal="total"
            :total="total"
            @remove="removeFromBooking"
            @clear="clearBooking"
            @checkout="proceedToCheckout"
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
      :occupied-dates="occupiedDates"
      :room-item-ids="roomItemIds"
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

    <!-- Contact & Billing Form Modal -->
    <div v-if="showContactForm" class="fixed inset-0  flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 z-99 bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 rounded-t-2xl">
          <h2 class="text-2xl font-bold flex items-center gap-3">
            <i class="fas fa-file-invoice"></i>
            Contact & Billing Information
          </h2>
          <p class="text-blue-100 text-sm mt-1">Please fill in your details to complete the booking</p>
        </div>

        <!-- Form Content -->
        <div class="p-6">
          <ContactBillingForm
            v-model:firstName="contactFirstName"
            v-model:lastName="contactLastName"
            v-model:phone="contactPhone"
            v-model:email="contactEmail"
            v-model:address="contactAddress"
            v-model:city="contactCity"
            v-model:country="contactCountry"
            v-model:postal="contactPostal"
            v-model:specialRequests="contactSpecialRequests"
            :items="booking"
            :check-in="checkIn"
            :check-out="checkOut"
            :subtotal="subtotal"
            :total="total"
          />

          <!-- Action Buttons -->
          <div class="mt-6 flex gap-3">
            <button
              @click="showContactForm = false"
              class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              <i class="fas fa-arrow-left mr-2"></i>Back
            </button>
            <button
              @click="submitContactForm"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              <i class="fas fa-check mr-2"></i>Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      v-if="showConfirmation"
      :email="confirmationEmail"
      :booking-id="confirmationBookingId"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import ItemCard from '../../components/ItemCard.vue'
import BookingSummary from '../../components/BookingSummary.vue'
import CalendarModal from '../../components/CalendarModal.vue'
import GuestsModal from '../../components/GuestsModal.vue'
import ViewMoreModal from '../../components/ViewMoreModal.vue'
import ConfirmationModal from '../../components/ConfirmationModal.vue'
import ContactBillingForm from '../../components/ContactBillingForm.vue'
import BookingConfirmation from '../../components/BookingConfirmation.vue'

export default {
  name: 'ReservationSection',
  components: {
    ItemCard,
    BookingSummary,
    CalendarModal,
    GuestsModal,
    ViewMoreModal,
    ConfirmationModal,
    ContactBillingForm
  },
  data() {
    return {
      apiBaseUrl: 'http://localhost:8000/api',
      loading: false,
      mobileSearchOpen: false,
      showCalendar: false,
      showGuests: false,
      showViewMore: false,
      showContactForm: false,
      showConfirmation: false,
      confirmationEmail: '',
      confirmationBookingId: '',
      contactFirstName: '',
      contactLastName: '',
      contactPhone: '',
      contactEmail: '',
      contactAddress: '',
      contactCity: '',
      contactCountry: 'Philippines',
      contactPostal: '',
      contactSpecialRequests: '',
      selectedItem: null,
      currentCategory: 'rooms',
      currentCategoryLabel: 'Rooms',
      currentMonth: new Date(),
      checkIn: null,
      checkOut: null,
      adults: 2,
      children: 0,
      booking: [],
      occupiedDates: [],
      itemData: {
        rooms: [],
        cottages: [],
        food: [],
        events: []
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
    },
    roomItemIds() {
      return this.itemData.rooms.map(room => room.item_id).filter(Boolean)
    }
  },
  methods: {
    async fetchOccupiedDates() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/bookings/occupied-dates`)
        const data = await response.json()
        if (data.success) {
          this.occupiedDates = data.data.map(item => ({
            inventoryItemId: item.inventory_item_id,
            occupiedDate: item.occupied_date
          }))
        }
      } catch (error) {
        console.error('Error fetching occupied dates:', error)
        this.occupiedDates = []
      }
    },
    async fetchInventoryItems() {
      try {
        this.loading = true
        const response = await fetch(`${this.apiBaseUrl}/rooms`)
        const data = await response.json()
        let items = []
        if (Array.isArray(data)) {
          items = data
        } else if (data.success && data.data) {
          items = data.data
        } else {
          return
        }
        this.itemData.rooms = []
        this.itemData.cottages = []
        this.itemData.events = []
        this.itemData.food = []
        items.forEach((item) => {
          let images = []
          try {
            images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images || []
            if (!Array.isArray(images) || images.length === 0) {
              images = ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500']
            }
          } catch (e) {
            images = ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500']
          }
          const categoryType = (item.category_type || '').toLowerCase()
          const formattedItem = {
            id: item.item_id,
            item_id: item.item_id,
            name: item.name || 'Unnamed',
            price: parseFloat(item.price) || 0,
            desc: item.description || '',
            description: item.description || '',
            amenities: [],
            imgs: images,
            perNight: true,
            maxGuests: item.max_guests || 2,
            category: item.category,
            status: item.status,
            categoryType
          }
          if (categoryType === 'room') {
            this.itemData.rooms.push(formattedItem)
          } else if (categoryType === 'cottage') {
            this.itemData.cottages.push(formattedItem)
          } else if (categoryType === 'event') {
            this.itemData.events.push(formattedItem)
          }
        })
        await this.fetchMenuItems()
      } catch (error) {
        console.error('❌ Error:', error)
      } finally {
        this.loading = false
      }
    },
    async fetchMenuItems() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/restaurant/menu`)
        const data = await response.json()
        if (data.success && data.data) {
          data.data.slice(0, 5).forEach(item => {
            let images = []
            try {
              images = typeof item.image === 'string' ? JSON.parse(item.image) : item.image || []
              if (!Array.isArray(images) || images.length === 0) {
                images = ['https://images.unsplash.com/photo-1541542684-3b05a8f9c4c8?w=500']
              }
            } catch (e) {
              images = ['https://images.unsplash.com/photo-1541542684-3b05a8f9c4c8?w=500']
            }
            this.itemData.food.push({
              id: 'm' + item.item_id,
              item_id: item.item_id,
              name: item.name,
              price: parseFloat(item.price),
              desc: item.description,
              description: item.description,
              amenities: [],
              imgs: images,
              perNight: false,
              maxGuests: 1,
              category: 'Food'
            })
          })
        }
      } catch (error) {
        console.error('Error fetching menu:', error)
      }
    },
    selectDate(date) {
      if (this.isAnySelectedRoomBookedOnDate(date)) {
        return
      }
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
    isRoomBookedOnDate(roomItemId, date) {
      const dateStr = new Date(date).toDateString()
      const roomId = Number(roomItemId)
      return this.occupiedDates.some(entry => {
        const inventoryId = Number(entry.inventoryItemId ?? entry.inventory_item_id)
        if (inventoryId !== roomId) return false
        const occupiedDate = new Date(entry.occupiedDate ?? entry.occupied_date)
        return occupiedDate.toDateString() === dateStr
      })
    },
    clearBooking() {
      this.booking = [];
      this.checkIn = null;
      this.checkOut = null;
      localStorage.removeItem('pendingBooking');
    },
    isAnySelectedRoomBookedOnDate(date) {
      const selectedRooms = this.booking.filter(b => {
        const categoryType = (b.item.categoryType || b.item.category || '').toLowerCase()
        return categoryType === 'room' || categoryType === 'rooms'
      })
      if (selectedRooms.length === 0) return false
      return selectedRooms.some(b => this.isRoomBookedOnDate(b.item.item_id, date))
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
      const bookingData = {
        items: this.booking,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        nights: this.nights,
        adults: this.adults,
        children: this.children
      }
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
    },
    removeFromBooking(itemId) {
      const item = this.booking.find(b => b.item.id === itemId)
      this.booking = this.booking.filter(b => b.item.id !== itemId)
      if (this.booking.length === 0) {
        this.checkIn = null;
        this.checkOut = null;
        localStorage.removeItem('pendingBooking')
      } else {
        const bookingData = {
          items: this.booking,
          checkIn: this.checkIn,
          checkOut: this.checkOut,
          nights: this.nights,
          adults: this.adults,
          children: this.children
        }
        localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      }
    },
    openViewMore(item) {
      this.selectedItem = item
      this.showViewMore = true
    },
    proceedToCheckout() {
      if (this.booking.length === 0) {
        return
      }
      const hasPerNightItems = this.booking.some(b => b.item.perNight)
      if (hasPerNightItems && (!this.checkIn || !this.checkOut)) {
        return
      }
      const bookingData = {
        items: this.booking,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        nights: this.nights,
        adults: this.adults,
        children: this.children,
        total: this.total,
        subtotal: this.subtotal
      }
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      this.$router.push('/booking-confirmation')
    },
    submitContactForm() {
      if (!this.contactFirstName || !this.contactLastName || !this.contactPhone || 
          !this.contactEmail || !this.contactAddress || !this.contactCity || !this.contactPostal) {
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.contactEmail)) {
        return
      }
      if (this.contactPhone.length !== 10 || !/^\d+$/.test(this.contactPhone)) {
        return
      }
      const bookingData = {
        items: this.booking,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        nights: this.nights,
        adults: this.adults,
        children: this.children,
        total: this.total,
        customer: {
          firstName: this.contactFirstName,
          lastName: this.contactLastName,
          fullName: `${this.contactFirstName} ${this.contactLastName}`
        },
        contact: {
          phone: '+63' + this.contactPhone,
          email: this.contactEmail,
          address: this.contactAddress,
          city: this.contactCity,
          country: this.contactCountry,
          postal: this.contactPostal
        },
        specialRequests: this.contactSpecialRequests
      }
      localStorage.setItem('completedBooking', JSON.stringify(bookingData))
      const bookingId = 'BK' + Date.now().toString().slice(-8)
      this.confirmationEmail = this.contactEmail
      this.confirmationBookingId = bookingId
      this.showContactForm = false
      setTimeout(() => {
        this.$router.push({
          name: 'BookingConfirmation',
          query: {
            email: this.contactEmail,
            bookingId: bookingId
          }
        })
      }, 500)
      setTimeout(() => {
        this.booking = []
        this.checkIn = null
        this.checkOut = null
        this.contactFirstName = ''
        this.contactLastName = ''
        this.contactPhone = ''
        this.contactEmail = ''
        this.contactAddress = ''
        this.contactCity = ''
        this.contactCountry = 'Philippines'
        this.contactPostal = ''
        this.contactSpecialRequests = ''
        localStorage.removeItem('pendingBooking')
      }, 1000)
    }
  },
  mounted() {
    const savedBooking = localStorage.getItem('pendingBooking')
    if (savedBooking) {
      try {
        const data = JSON.parse(savedBooking)
        if (data.checkIn) this.checkIn = new Date(data.checkIn)
        if (data.checkOut) this.checkOut = new Date(data.checkOut)
        if (data.adults) this.adults = data.adults
        if (data.children) this.children = data.children
        if (data.items && data.items.length > 0) {
          this.booking = data.items
        }
      } catch (e) {}
    }
    this.fetchInventoryItems()
    this.fetchOccupiedDates()
  }
}
</script>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
