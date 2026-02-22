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
            Contact & Billing Informationsx
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

    <!-- Swimming Booking Form Modal -->
    <div v-if="showSwimmingForm" class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 overflow-y-auto p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 rounded-t-2xl">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <i class="fas fa-swimmer"></i>
            Book Swimming Class
          </h2>
          <p class="text-blue-100 text-sm mt-1">{{ selectedSwimmingProgram?.name }}</p>
        </div>

        <!-- Form -->
        <div class="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <!-- Program Display -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-gray-700">{{ selectedSwimmingProgram?.name }}</p>
                <p class="text-sm text-gray-500">10 sessions, 1 hour per session</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Package Price</p>
                <p class="text-xl font-bold text-blue-700">₱{{ selectedSwimmingProgram?.price.toLocaleString() }}</p>
              </div>
            </div>
          </div>

          <!-- Number of Participants -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-users text-blue-600 mr-1"></i>
              Number of Participants *
            </label>
            <input 
              v-model.number="swimmingFormData.participants" 
              type="number" 
              min="1" 
              class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter number of participants"
            />
          </div>

          <!-- Selected Dates -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-calendar-check text-blue-600 mr-1"></i>
              Swimming Schedule Dates (Select up to 10 dates) *
            </label>
            
            <!-- Date Input with Add Button -->
            <div class="flex gap-2 mb-3">
              <input 
                v-model="swimmingFormData.newDate" 
                type="date" 
                :disabled="swimmingFormData.dates.length >= 10"
                class="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
              />
              <button
                @click="addSwimmingDate"
                :disabled="swimmingFormData.dates.length >= 10"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <i class="fas fa-plus mr-1"></i>Add
              </button>
            </div>

            <!-- Progress Indicator -->
            <div class="mb-3 flex items-center justify-between text-xs text-gray-600">
              <span>{{ swimmingFormData.dates.length }} of 10 sessions scheduled</span>
              <span class="px-2 py-1 rounded" :class="swimmingFormData.dates.length === 10 ? 'bg-green-100 text-green-700' : 'bg-gray-100'">
                {{ swimmingFormData.dates.length === 10 ? '✓ Complete' : `${10 - swimmingFormData.dates.length} more needed` }}
              </span>
            </div>

            <!-- Selected Dates List -->
            <div v-if="swimmingFormData.dates.length > 0" class="space-y-2 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div 
                v-for="(date, index) in swimmingFormData.dates" 
                :key="index"
                class="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
              >
                <span class="text-sm font-medium text-gray-700">
                  <i class="fas fa-calendar-day text-blue-600 mr-2"></i>
                  Session {{ index + 1 }}: {{ formatDateDisplay(date) }}
                </span>
                <button
                  @click="removeSwimmingDate(index)"
                  class="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"
                >
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
            <p v-else class="text-xs text-gray-500 italic">No dates selected yet. Add up to 10 session dates above.</p>
          </div>

          <!-- Preferred Time -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-clock text-blue-600 mr-1"></i>
              Preferred Time Slot *
            </label>
            <select 
              v-model="swimmingFormData.time" 
              class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select time slot</option>
              <option value="6:00 AM - 7:00 AM">6:00 AM - 7:00 AM</option>
              <option value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</option>
              <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
              <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
              <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
            </select>
          </div>

          <!-- Total Price Breakdown -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-gray-600">
                <span>Package price (per person):</span>
                <span class="font-medium">₱{{ (selectedSwimmingProgram?.price || 0).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Sessions included:</span>
                <span class="font-medium">10 sessions × 1 hour</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Participants:</span>
                <span class="font-medium">{{ swimmingFormData.participants || 0 }}</span>
              </div>
              <div class="border-t-2 border-blue-300 pt-2 flex justify-between items-center">
                <span class="font-bold text-gray-800">Total Price:</span>
                <span class="text-2xl font-bold text-blue-700">₱{{ calculateSwimmingTotal().toLocaleString() }}</span>
              </div>
            </div>
            <p class="text-xs text-gray-600 mt-2">
              <i class="fas fa-info-circle mr-1"></i>
              {{ (selectedSwimmingProgram?.price || 0).toLocaleString() }} × {{ swimmingFormData.participants || 0 }} participant(s)
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="pt-4 flex gap-3">
            <button
              @click="closeSwimmingForm"
              class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              <i class="fas fa-times mr-2"></i>Cancel
            </button>
            <button
              @click="submitSwimmingBooking"
              class="flex-1 px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              <i class="fas fa-check mr-2"></i>Book Class
            </button>
          </div>
        </div>
      </div>
    </div>
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
import ConfirmationModal from '../../components/ConfirmationModal.vue'
import ContactBillingForm from '../../components/ContactBillingForm.vue'
import Footer from '../../components/AppFooter.vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import BookingConfirmation from '../../components/BookingConfirmation.vue'

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
    ConfirmationModal,
    ContactBillingForm,
    Footer,
    AppHeader,
    AppSidebar
  },
  data() {
    return {
      apiBaseUrl: 'http://localhost:8000/api',
      loading: false,
      sidebarOpen: false,
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
      occupiedDates: [],
      navItems: ['Home', 'Amenities', 'Rates', 'Reservation', 'Gallery', 'Contact', 'About'],
      itemData: {
        rooms: [],
        cottages: [],
        food: [],
        events: [],
        swimming: []
      },
      showSwimmingForm: false,
      selectedSwimmingProgram: null,
      swimmingFormData: {
        participants: 1,
        dates: [],
        time: '',
        newDate: ''
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
  // REMOVED: Duplicate mounted() hook - merged into the one below
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
      console.log('🔄 Fetching inventory items...')
      try {
        this.loading = true
        const response = await fetch(`${this.apiBaseUrl}/rooms`)
        const data = await response.json()
        
        console.log('📦 API Response:', data)
        
        // Check if data is array directly or wrapped in object
        let items = []
        if (Array.isArray(data)) {
          items = data
          console.log('✅ Data is direct array with', items.length, 'items')
        } else if (data.success && data.data) {
          items = data.data
          console.log('✅ Data is wrapped object with', items.length, 'items')
        } else {
          console.log('❌ Invalid data format')
          return
        }
        
        console.log('📊 Total items to process:', items.length)
        
        // Reset all categories
        this.itemData.rooms = []
        this.itemData.cottages = []
        this.itemData.events = []
        this.itemData.food = []

        
        console.log('🗑️ Cleared all arrays')
        
        items.forEach((item, index) => {
          console.log(`\n--- Processing item ${index + 1}/${items.length} ---`)
          // Parse images
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
          
          // Categorize using category_type field
          console.log(`📌 Item: ${item.name}, category_type: "${item.category_type}"`)
          
          if (categoryType === 'room') {
            this.itemData.rooms.push(formattedItem)
            console.log('  ➡️ Added to rooms')
          } else if (categoryType === 'cottage') {
            this.itemData.cottages.push(formattedItem)
            console.log('  ➡️ Added to cottages')
          } else if (categoryType === 'event') {
            this.itemData.events.push(formattedItem)
            console.log('  ➡️ Added to events')
          } else {
            console.log(`  ⚠️ No match for category_type: "${categoryType}"`)
          }
        })
        this.clearDates() // Clear dates after loading items
        console.log('\n✅ FINAL COUNTS:')
        console.log('Rooms:', this.itemData.rooms.length, this.itemData.rooms)
        console.log('Cottages:', this.itemData.cottages.length, this.itemData.cottages)
        console.log('Events:', this.itemData.events.length, this.itemData.events)
        
        console.log('\n🔍 Vue Reactive Check:')
        console.log('this.itemData:', this.itemData)
        console.log('Current category:', this.currentCategory)
        console.log('Items for current category:', this.itemData[this.currentCategory])
        
        // Fetch food items
        await this.fetchMenuItems()
      } catch (error) {
        console.error('❌ Error:', error)
        this.showNotification('Failed to load items', 'error')
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
          console.log('✅ Food:', this.itemData.food.length)
        }
      } catch (error) {
        console.error('Error fetching menu:', error)
      }
    },
    selectDate(date) {
      if (this.isAnySelectedRoomBookedOnDate(date)) {
        this.showNotification('Room fully booked for the selected date', 'error')
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
      this.selectedItem = [];
    },
    changeAdults(delta) {
      this.adults = Math.max(1, this.adults + delta)
    },
    changeChildren(delta) {
      this.children = Math.max(0, this.children + delta)
    },
    addToBooking(item, qty, guests) {
      // Check if it's a swimming item
      if (item.category === 'Swimming') {
        this.selectedSwimmingProgram = item
        this.swimmingFormData = {
          participants: 1,
          dates: [],
          time: '',
          newDate: ''
        }
        this.showSwimmingForm = true
        return
      }

      const existing = this.booking.find(b => b.item.id === item.id)
      if (existing) {
        existing.qty += qty
        existing.guests = guests
        this.showNotification(`Updated: ${item.name} (Qty: ${existing.qty})`, 'success')
      } else {
        this.booking.push({ item, qty, guests })
        this.showNotification(`Added: ${item.name} to booking`, 'success')
      }
      
      // Save to localStorage with complete booking data
      const bookingData = {
        items: this.booking,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        nights: this.nights,
        adults: this.adults,
        children: this.children
      }
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      console.log('💾 Saved booking to localStorage')
      
      // Scroll to booking summary
      setTimeout(() => {
        const summary = document.querySelector('.lg\\:w-1\\/3')
        if (summary && window.innerWidth >= 1024) {
          summary.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    },
    removeFromBooking(itemId) {
      const item = this.booking.find(b => b.item.id === itemId)
      this.booking = this.booking.filter(b => b.item.id !== itemId)
      if (item) {
        this.showNotification(`Removed: ${item.item.name}`, 'info')
      }
      
      // Update localStorage - remove if empty, otherwise update
      if (this.booking.length === 0) {
        localStorage.removeItem('pendingBooking')
        console.log('🗑️ Removed pendingBooking from localStorage (empty)')
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
        console.log('💾 Updated booking in localStorage:', this.booking.length, 'items')
      }
    },
    clearBooking() {
      this.booking = []
      localStorage.removeItem('pendingBooking')
      this.showNotification('Booking cleared', 'info')
      console.log('🗑️ Cleared all bookings and localStorage')
    },
    openViewMore(item) {
      this.selectedItem = item
      this.showViewMore = true
    },
    proceedToCheckout() {
      // Validate booking
      if (this.booking.length === 0) {
        this.showNotification('Please add items to your booking first', 'error')
        return
      }

      // Validate dates for items that require them
      const hasPerNightItems = this.booking.some(b => b.item.perNight)
      if (hasPerNightItems && (!this.checkIn || !this.checkOut)) {
        this.showNotification('Please select check-in and check-out dates', 'error')
        return
      }

      // Prepare booking data for the confirmation page
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

      // Save to localStorage for the booking confirmation page
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData))

      // Navigate directly to booking confirmation page
      this.$router.push('/booking-confirmation')
    },
    submitContactForm() {
      // Validate contact form
      if (!this.contactFirstName || !this.contactLastName || !this.contactPhone || 
          !this.contactEmail || !this.contactAddress || !this.contactCity || !this.contactPostal) {
        this.showNotification('Please fill in all required fields', 'error')
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.contactEmail)) {
        this.showNotification('Please enter a valid email address', 'error')
        return
      }

      // Validate phone (should be 10 digits)
      if (this.contactPhone.length !== 10 || !/^\d+$/.test(this.contactPhone)) {
        this.showNotification('Phone number should be 10 digits', 'error')
        return
      }

      // Prepare complete booking data
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

      // Save to localStorage
      localStorage.setItem('completedBooking', JSON.stringify(bookingData))

      // Generate booking ID
      const bookingId = 'BK' + Date.now().toString().slice(-8)
      
      // Set confirmation data
      this.confirmationEmail = this.contactEmail
      this.confirmationBookingId = bookingId

      // Hide contact form
      this.showContactForm = false

      // Show success notification
      this.showNotification('Booking confirmed!', 'success')

      // Redirect to booking confirmation page
      setTimeout(() => {
        this.$router.push({
          name: 'BookingConfirmation',
          query: {
            email: this.contactEmail,
            bookingId: bookingId
          }
        })
      }, 500)

      // Clear booking and contact form after confirmation
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
        this.swimmingFormData = { 
          participants: 1, 
          dates: [], 
          time: '', 
          newDate: '' 
        }
        
        // Clear localStorage
        localStorage.removeItem('pendingBooking')
        console.log('🗑️ Cleared booking from localStorage')
      }, 1000)
    },
    showNotification(message, type = 'success') {
      // Create notification element
      const notification = document.createElement('div')
      notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold animate-slide-in ${
        type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
      }`
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
          <span>${message}</span>
        </div>
      `
      document.body.appendChild(notification)
      
      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.animation = 'slide-out 0.3s ease-out'
        setTimeout(() => notification.remove(), 300)
      }, 3000)
    },
    addSwimmingDate() {
      if (!this.swimmingFormData.newDate) {
        this.showNotification('Please select a date first', 'error')
        return
      }
      
      // Check if date already added
      if (this.swimmingFormData.dates.includes(this.swimmingFormData.newDate)) {
        this.showNotification('This date is already added', 'error')
        return
      }
      
      this.swimmingFormData.dates.push(this.swimmingFormData.newDate)
      this.swimmingFormData.newDate = ''
    },
    
    removeSwimmingDate(index) {
      this.swimmingFormData.dates.splice(index, 1)
    },
    
    formatDateDisplay(dateStr) {
      const date = new Date(dateStr + 'T00:00:00')
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    },
    
    calculateSwimmingTotal() {
      const packagePrice = this.selectedSwimmingProgram?.price || 0
      const participants = this.swimmingFormData.participants || 0
      
      // Price is per participant for the full 10-session package
      return packagePrice * participants
    },
    
    closeSwimmingForm() {
      this.showSwimmingForm = false
      this.selectedSwimmingProgram = null
      this.swimmingFormData = {
        participants: 1,
        dates: [],
        time: '',
        newDate: ''
      }
    },
    
    async submitSwimmingBooking() {
      // Validate fields
      if (!this.swimmingFormData.participants || this.swimmingFormData.participants < 1) {
        this.showNotification('Please enter number of participants', 'error')
        return
      }
      if (this.swimmingFormData.dates.length === 0) {
        this.showNotification('Please select at least one date for your sessions', 'error')
        return
      }
      if (this.swimmingFormData.dates.length > 10) {
        this.showNotification('Maximum 10 session dates allowed', 'error')
        return
      }
      if (!this.swimmingFormData.time) {
        this.showNotification('Please select a time slot', 'error')
        return
      }

      // Calculate total price
      const totalPrice = this.calculateSwimmingTotal()

      // Add to booking
      this.booking.push({
        item: {
          ...this.selectedSwimmingProgram,
          price: totalPrice // Update price to total calculated price
        },
        qty: 1, // Quantity is 1 since we're bundling everything together
        guests: this.swimmingFormData.participants,
        swimmingDetails: {
          dates: [...this.swimmingFormData.dates],
          time: this.swimmingFormData.time,
          participants: this.swimmingFormData.participants,
          packagePrice: this.selectedSwimmingProgram.price,
          totalSessions: 10,
          selectedDates: this.swimmingFormData.dates.length
        }
      })

      this.showNotification(`Added: ${this.selectedSwimmingProgram.name} - ${this.swimmingFormData.participants} participant(s), 10 sessions package`, 'success')
      
      // Save to localStorage
      const bookingData = {
        items: this.booking,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        nights: this.nights,
        adults: this.adults,
        children: this.children
      }
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      console.log('💾 Saved swimming booking to localStorage')
      
      // Close form and reset
      this.closeSwimmingForm()
      this.swimmingFormData = { participants: 1, date: '', time: '' }
    }
  },
  mounted() {
    // Check if we're coming from Edit mode (activeSection='book' query parameter)
    const isEditMode = this.$route.query.activeSection === 'book';
    
    // Load booking from localStorage if we're in edit mode
    const savedBooking = localStorage.getItem('pendingBooking')
    if (savedBooking && isEditMode) {
      try {
        const data = JSON.parse(savedBooking)
        if (data.checkIn) this.checkIn = new Date(data.checkIn)
        if (data.checkOut) this.checkOut = new Date(data.checkOut)
        if (data.adults) this.adults = data.adults
        if (data.children) this.children = data.children
        if (data.items && data.items.length > 0) {
          this.booking = data.items
          console.log('📋 Loaded booking from localStorage (Edit mode):', this.booking.length, 'items')
        }
      } catch (e) {
        console.error('Error loading booking from localStorage:', e)
      }
    } else if (!isEditMode) {
      // Only clear localStorage if NOT in edit mode (fresh page load)
      localStorage.removeItem('pendingBooking')
      console.log('🗑️ Cleared previous booking from localStorage (Fresh load)')
    }
    
    // Initialize swimming programs
    this.itemData.swimming = [
      {
        id: 'swim_7up',
        name: '7 Years Old & Above',
        category: 'Swimming',
        price: 3000,
        desc: 'Teen & Adult Program - ₱3,000 (10 sessions, 1 hour per session)',
        description: 'Learn to Swim Program for teens and adults. Package includes 10 sessions, 1 hour per session. Choose your preferred schedule dates.',
        imgs: ['https://images.unsplash.com/photo-1576610616656-f72b27e84530?w=500'],
        perNight: false,
        icon: 'fas fa-star',
        sessions: 10
      },
      {
        id: 'swim_6below',
        name: '6 Years Old & Below',
        category: 'Swimming',
        price: 4000,
        desc: 'Kids Swimming Program - ₱4,000 (10 sessions, 1 hour per session)',
        description: 'Learn to Swim Program for kids 6 years and below. Package includes 10 sessions, 1 hour per session. Choose your preferred schedule dates.',
        imgs: ['https://images.unsplash.com/photo-1576610616656-f72b27e84530?w=500'],
        perNight: false,
        icon: 'fas fa-swimmer',
        sessions: 10
      }
    ]
    
    // Fetch data from API
    this.fetchInventoryItems()
    this.fetchOccupiedDates()
    
    // Setup scroll listener
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