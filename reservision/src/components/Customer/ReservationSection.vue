<template>
  <div class="min-h-screen" :style="{ backgroundColor: '#F0F9FF' }">
    <!-- Search Section -->
    <section v-if="!showBookingConfirmation" class="max-w-7xl mx-auto px-4 py-4">
      <div class="bg-white rounded-2xl shadow-md p-3 hover:shadow-lg transition" :style="{ border: '2px solid #1E88B6' }">
        <!-- Desktop Search -->
        <div class="hidden md:grid md:grid-cols-4 gap-4">
          <div>
            <label class="text-xs block mb-1 font-semibold" :style="{ color: '#1E88B6' }">Check-in – Check-out</label>
            <button @click="showCalendar = true" class="w-full rounded-xl border-2 px-3 py-2.5 flex justify-between items-center transition text-left" 
              :style="{ borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' }"
              @mouseover="e => e.currentTarget.style.borderColor = '#1E88B6'"
              @mouseleave="e => e.currentTarget.style.borderColor = '#E0E0E0'"
            >
              <span class="text-sm font-semibold" :style="{ color: '#1E88B6' }">{{ dateStr }}</span>
              <i class="fas fa-calendar-alt" :style="{ color: '#F2C200' }"></i>
            </button>
          </div>

          <div>
            <label class="text-xs block mb-1 font-semibold" :style="{ color: '#1E88B6' }">Guests</label>
            <button @click="showGuests = true" class="w-full rounded-xl border-2 px-3 py-2.5 flex justify-between items-center transition text-left"
              :style="{ borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' }"
              @mouseover="e => e.currentTarget.style.borderColor = '#1E88B6'"
              @mouseleave="e => e.currentTarget.style.borderColor = '#E0E0E0'"
            >
              <span class="text-sm font-semibold" :style="{ color: '#1E88B6' }">{{ guestStr }}</span>
              <i class="fas fa-user" :style="{ color: '#F2C200' }"></i>
            </button>
          </div>

          <div>
            <label class="text-xs block mb-1 font-semibold" :style="{ color: '#1E88B6' }">Promo Code</label>
            <input placeholder="Optional" class="w-full rounded-xl border-2 px-3 py-2.5 text-sm focus:outline-none transition"
              :style="{ borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' }"
              @focus="e => e.target.style.borderColor = '#1E88B6'"
              @blur="e => e.target.style.borderColor = '#E0E0E0'"
            />
          </div>

          <div class="flex items-end">
            <button @click="handleSearch" class="w-full py-2.5 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
              :style="{ background: 'linear-gradient(135deg, #F2C200, #1E88B6)' }"
            >
              <i class="fas fa-search"></i> Search
            </button>
          </div>
        </div>

        <!-- Mobile Search -->
        <div class="md:hidden">
          <button @click="mobileSearchOpen = !mobileSearchOpen" class="w-full py-2.5 text-white rounded-xl text-sm font-bold transition"
            :style="{ background: 'linear-gradient(135deg, #1E88B6, #1F8DBF)' }"
          >
            Modify Search
          </button>

          <div v-if="mobileSearchOpen" class="mt-4 space-y-3">
            <button @click="showCalendar = true" class="w-full rounded-xl border-2 px-4 py-3 flex justify-between items-center text-left transition"
              :style="{ borderColor: '#E0E0E0' }"
              @mouseover="e => e.currentTarget.style.borderColor = '#1E88B6'"
              @mouseleave="e => e.currentTarget.style.borderColor = '#E0E0E0'"
            >
              <span class="text-sm font-semibold" :style="{ color: '#1E88B6' }">{{ dateStr }}</span>
              <i class="fas fa-calendar-alt" :style="{ color: '#F2C200' }"></i>
            </button>

            <button @click="showGuests = true" class="w-full rounded-xl border-2 px-4 py-3 flex justify-between items-center text-left transition"
              :style="{ borderColor: '#E0E0E0' }"
              @mouseover="e => e.currentTarget.style.borderColor = '#1E88B6'"
              @mouseleave="e => e.currentTarget.style.borderColor = '#E0E0E0'"
            >
              <span class="text-sm font-semibold" :style="{ color: '#1E88B6' }">{{ guestStr }}</span>
              <i class="fas fa-user" :style="{ color: '#F2C200' }"></i>
            </button>

            <input placeholder="Promo code" class="w-full rounded-xl border-2 px-4 py-3 text-sm focus:outline-none transition"
              :style="{ borderColor: '#E0E0E0' }"
              @focus="e => e.target.style.borderColor = '#1E88B6'"
              @blur="e => e.target.style.borderColor = '#E0E0E0'"
            />

            <div class="flex gap-3">
              <button @click="handleSearch" class="flex-1 py-3 text-white rounded-xl font-bold transition"
                :style="{ background: 'linear-gradient(135deg, #F2C200, #1E88B6)' }"
              >Search</button>
              <button @click="mobileSearchOpen = false" class="flex-1 py-3 border-2 rounded-xl font-bold transition"
                :style="{ borderColor: '#E0E0E0', color: '#1E88B6' }"
                @mouseover="e => e.currentTarget.style.backgroundColor = '#E3F2FD'"
                @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'"
              >Done</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main v-if="!showBookingConfirmation" class="max-w-7xl mx-auto">
      <div class="lg:flex lg:gap-8">
        <!-- Items Section -->
        <section class="lg:w-2/3 space-y-8">
          <!-- Category Tabs -->
          <div class="flex gap-2 flex-wrap items-center">
            <button
              v-for="cat in Object.keys(itemData)"
              :key="cat"
              @click="currentCategory = cat; currentCategoryLabel = cat.charAt(0).toUpperCase() + cat.slice(1)"
              :class="['px-4 py-2 rounded-full font-bold text-sm transition transform hover:scale-105']"
              :style="{
                backgroundColor: currentCategory === cat ? '#1E88B6' : '#FFFFFF',
                color: currentCategory === cat ? '#FFFFFF' : '#1E88B6',
                border: currentCategory === cat ? 'none' : '2px solid #1E88B6'
              }"
            >
              {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
            </button>

            <div class="text-sm space-y-6 mt-2 ml-auto">
              <span :style="{ color: '#666' }">Showing:</span>
              <span class="font-semibold ml-1" :style="{ color: '#1E88B6' }">{{ currentCategoryLabel }}</span>
              <span
                v-if="hiddenFullyBookedCount > 0"
                class="ml-2 text-xs font-medium"
                :style="{ color: '#B45309' }"
              >
                ({{ hiddenFullyBookedCount }} fully booked hidden)
              </span>
            </div>
          </div>

          <!-- Items List -->
          <div class="space-y-6">
            <ItemCard
              v-for="item in visibleCategoryItems"
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
      :booked-items="bookedDateItems"
      :all-rooms="dateSensitiveRooms"
      :validation-error="calendarValidationError"
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
    <div v-if="showContactForm" class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
           :style="{ border: '2px solid #1E88B6' }">
        <!-- Header -->
        <div class="sticky top-0 z-10 p-6 rounded-t-2xl" :style="{ background: 'linear-gradient(135deg, #1E88B6, #1F8DBF)' }">
          <h2 class="text-2xl font-bold flex items-center gap-3 text-white">
            <i class="fas fa-file-invoice" :style="{ color: '#F2C200' }"></i>
            Contact & Billing Information
          </h2>
          <p class="text-sm mt-1" :style="{ color: '#E3F2FD' }">Please fill in your details to complete the booking</p>
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
            :subtotal="total"
            :total="total"
          />

          <!-- Action Buttons -->
          <div class="mt-6 flex gap-3">
            <button
              @click="showContactForm = false"
              class="flex-1 px-6 py-3 rounded-xl font-semibold transition"
              :style="{ 
                backgroundColor: '#F5F5F5',
                color: '#1E88B6',
                border: '2px solid #E0E0E0'
              }"
              @mouseover="e => e.currentTarget.style.backgroundColor = '#E3F2FD'"
              @mouseleave="e => e.currentTarget.style.backgroundColor = '#F5F5F5'"
            >
              <i class="fas fa-arrow-left mr-2"></i>Back
            </button>
            <button
              @click="submitContactForm"
              class="flex-1 px-6 py-3 text-white rounded-xl font-semibold transition transform hover:scale-105"
              :style="{ background: 'linear-gradient(135deg, #F2C200, #1E88B6)' }"
            >
              <i class="fas fa-check mr-2"></i>Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Swimming Booking Form Modal -->
    <div v-if="showSwimmingForm" class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 overflow-y-auto p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8">
        <!-- Header -->
        <div class="p-6 rounded-t-2xl" :style="{ background: 'linear-gradient(135deg, #1E88B6, #1F8DBF)' }">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <i class="fas fa-swimmer"></i> Book Swimming Class
          </h2>
          <p class="text-sm mt-1" :style="{ color: '#E3F2FD' }">{{ selectedSwimmingProgram?.name }}</p>
        </div>

        <!-- Form -->
        <div class="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <!-- Program summary -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-700">{{ selectedSwimmingProgram?.name }}</p>
              <p class="text-sm text-gray-500">10 sessions · 1 hour per session</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500">Package Price</p>
              <p class="text-xl font-bold" :style="{ color: '#1E88B6' }">₱{{ (selectedSwimmingProgram?.price || 0).toLocaleString() }}</p>
            </div>
          </div>

          <!-- Participants -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Number of Participants *</label>
            <input v-model.number="swimmingFormData.participants" type="number" min="1"
              class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter number of participants" />
          </div>

          <!-- Date picker -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Swimming Schedule Dates (Select up to 10) *</label>
            <div class="mb-2 flex items-center justify-between text-xs text-gray-600">
              <span>{{ swimmingFormData.dates.length }} of 10 sessions selected</span>
              <span class="px-2 py-1 rounded" :class="swimmingFormData.dates.length === 10 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'">
                {{ swimmingFormData.dates.length === 10 ? '✓ Complete' : `Select ${10 - swimmingFormData.dates.length} more` }}
              </span>
            </div>

            <!-- Inline calendar -->
            <div class="border-2 border-gray-200 rounded-lg p-3 bg-white mb-3">
              <div class="flex items-center justify-between mb-3">
                <button type="button" @click="prevSwimmingMonth" class="p-2 hover:bg-gray-100 rounded-lg transition"><i class="fas fa-chevron-left text-gray-600"></i></button>
                <span class="font-bold text-gray-800">{{ getSwimmingMonthYear() }}</span>
                <button type="button" @click="nextSwimmingMonth" class="p-2 hover:bg-gray-100 rounded-lg transition"><i class="fas fa-chevron-right text-gray-600"></i></button>
              </div>
              <div class="grid grid-cols-7 gap-1 mb-2">
                <div v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d" class="text-center text-xs font-semibold text-gray-500 py-1">{{ d }}</div>
              </div>
              <div class="grid grid-cols-7 gap-1">
                <button
                  v-for="day in getSwimmingCalendarDays()"
                  :key="day.dateString + day.date"
                  type="button"
                  @click="toggleSwimmingDate(day.dateString)"
                  :disabled="!day.isCurrentMonth || day.isPast || (swimmingFormData.dates.length >= 10 && !day.isSelected)"
                  :class="[
                    'aspect-square p-1 rounded-lg text-sm transition relative',
                    !day.isCurrentMonth || day.isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50',
                    day.isSelected ? 'bg-blue-600 text-white font-bold hover:bg-blue-700' : ''
                  ]"
                >
                  {{ day.date }}
                </button>
              </div>
            </div>

            <!-- Selected dates list -->
            <div v-if="swimmingFormData.dates.length > 0" class="space-y-1 max-h-36 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div v-for="(date, idx) in sortedSwimmingDates" :key="idx" class="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                <span class="text-sm text-gray-700"><i class="fas fa-calendar-day mr-2" :style="{ color: '#1E88B6' }"></i>Session {{ idx + 1 }}: {{ formatDateDisplay(date) }}</span>
                <button type="button" @click="toggleSwimmingDate(date)" class="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"><i class="fas fa-times text-sm"></i></button>
              </div>
            </div>
            <p v-else class="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-200">
              <i class="fas fa-hand-pointer mr-1"></i>Click on dates above to select your session dates.
            </p>
          </div>

          <!-- Time slot -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Preferred Time Slot *</label>
            <select v-model="swimmingFormData.time" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500">
              <option value="">Select time slot</option>
              <option value="6:00 AM - 7:00 AM">6:00 AM – 7:00 AM</option>
              <option value="8:00 AM - 9:00 AM">8:00 AM – 9:00 AM</option>
              <option value="10:00 AM - 11:00 AM">10:00 AM – 11:00 AM</option>
              <option value="2:00 PM - 3:00 PM">2:00 PM – 3:00 PM</option>
              <option value="4:00 PM - 5:00 PM">4:00 PM – 5:00 PM</option>
            </select>
          </div>

          <!-- Price breakdown -->
          <div class="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <div class="space-y-1 text-sm">
              <div class="flex justify-between text-gray-600"><span>Package price (per person):</span><span class="font-medium">₱{{ (selectedSwimmingProgram?.price || 0).toLocaleString() }}</span></div>
              <div class="flex justify-between text-gray-600"><span>Sessions included:</span><span class="font-medium">10 × 1 hour</span></div>
              <div class="flex justify-between text-gray-600"><span>Participants:</span><span class="font-medium">{{ swimmingFormData.participants || 0 }}</span></div>
              <div class="border-t-2 border-blue-300 pt-2 flex justify-between items-center">
                <span class="font-bold text-gray-800">Total:</span>
                <span class="text-2xl font-bold" :style="{ color: '#1E88B6' }">₱{{ calculateSwimmingTotal().toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button @click="closeSwimmingForm" class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
              <i class="fas fa-times mr-2"></i>Cancel
            </button>
            <button @click="submitSwimmingBooking" class="flex-1 px-4 py-3 text-white rounded-xl font-semibold transition" :style="{ background: 'linear-gradient(135deg, #F2C200, #1E88B6)' }">
              <i class="fas fa-check mr-2"></i>Book Class
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

    <!-- Customer Booking Confirmation -->
    <div v-if="showBookingConfirmation" class="max-w-7xl mx-auto px-4 py-8">
      <CustomerBookingConfirmation 
        @view-reservations="handleViewReservations"
        @close="showBookingConfirmation = false"
      />
    </div>
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
import CustomerBookingConfirmation from './CustomerBookingConfirmation.vue'

export default {
  name: 'ReservationSection',
  components: {
    ItemCard,
    BookingSummary,
    CalendarModal,
    GuestsModal,
    ViewMoreModal,
    ConfirmationModal,
    ContactBillingForm,
    CustomerBookingConfirmation
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
      showBookingConfirmation: false,
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
      calendarValidationError: '',
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
      },
      swimmingCalendarMonth: new Date()
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
    },
    bookedDateItems() {
      return this.booking
        .filter(b => b?.item?.perNight)
        .map(b => ({
          item_id: b.item.item_id,
          category: b.item.category,
          name: b.item.name
        }))
    },
    dateSensitiveRooms() {
      return [
        ...this.itemData.rooms,
        ...this.itemData.cottages,
        ...this.itemData.events
      ].filter(item => item?.perNight)
    },
    visibleCategoryItems() {
      const items = this.itemData[this.currentCategory] || []
      if (!this.checkIn || !this.checkOut) {
        return items
      }

      return items.filter(item => {
        if (!item?.perNight) return true
        return !this.isItemBookedInRange(item.item_id, this.checkIn, this.checkOut)
      })
    },
    hiddenFullyBookedCount() {
      const total = (this.itemData[this.currentCategory] || []).length
      const visible = this.visibleCategoryItems.length
      return Math.max(0, total - visible)
    },
    sortedSwimmingDates() {
      return [...this.swimmingFormData.dates].sort((a, b) => new Date(a) - new Date(b))
    }
  },
  methods: {
    toLocalDateKey(date) {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    normalizeDateKey(dateLike) {
      if (!dateLike) return null

      if (dateLike instanceof Date) {
        return this.toLocalDateKey(dateLike)
      }

      const raw = String(dateLike).trim()
      const ymdMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/)
      if (ymdMatch) {
        // Keep backend-provided date-only values as-is to avoid timezone shifting.
        return ymdMatch[1]
      }

      const parsed = new Date(raw)
      if (Number.isNaN(parsed.getTime())) return null
      return this.toLocalDateKey(parsed)
    },
    async fetchOccupiedDates() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/bookings/occupied-dates`)
        const data = await response.json()

        // Normalize different possible response shapes from backend
        let records = []
        if (Array.isArray(data)) {
          records = data
        } else if (data && Array.isArray(data.data)) {
          records = data.data
        } else if (data && typeof data.data === 'object' && data.data !== null) {
          // data.data is an object, check for inner arrays
          if (Array.isArray(data.data.occupiedDates)) {
            records = data.data.occupiedDates
          } else if (Array.isArray(data.data.rows)) {
            records = data.data.rows
          } else if (Array.isArray(data.data.occupied_dates)) {
            records = data.data.occupied_dates
          } else if (Array.isArray(data.data.dates)) {
            records = data.data.dates
          }
        } else if (data && Array.isArray(data.occupied_dates)) {
          records = data.occupied_dates
        }

        if (!Array.isArray(records) || records.length === 0) {
          this.occupiedDates = []
          return
        }

        this.occupiedDates = records
          .filter(item => item && (item.inventory_item_id || item.inventoryItemId || item.inventory_id))
          .map(item => ({
            inventoryItemId: item.inventory_item_id ?? item.inventoryItemId ?? item.inventory_id,
            occupiedDate: item.occupied_date ?? item.occupiedDate ?? item.date
          }))
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
    hasBookedDateInRange(startDate, endDate) {
      if (!startDate || !endDate || endDate <= startDate) return false

      const cursor = new Date(startDate)
      while (cursor < endDate) {
        if (this.isAnySelectedRoomBookedOnDate(cursor)) {
          return true
        }
        cursor.setDate(cursor.getDate() + 1)
      }
      return false
    },
    isItemBookedInRange(itemId, startDate, endDate) {
      if (!itemId || !startDate || !endDate || endDate <= startDate) return false

      const cursor = new Date(startDate)
      while (cursor < endDate) {
        if (this.isRoomBookedOnDate(itemId, cursor)) {
          return true
        }
        cursor.setDate(cursor.getDate() + 1)
      }
      return false
    },
    selectDate(date) {
      this.calendarValidationError = ''

      if (this.isAnySelectedRoomBookedOnDate(date)) {
        this.calendarValidationError = 'One of your selected rooms is occupied on this date. Please choose a different date.'
        return
      }

      if (!this.checkIn || (this.checkIn && this.checkOut)) {
        this.checkIn = date
        this.checkOut = null
      } else if (date > this.checkIn) {
        if (this.hasBookedDateInRange(this.checkIn, date)) {
          this.calendarValidationError = 'Your selected range includes occupied date(s) for the room(s) in your booking.'
          return
        }
        this.checkOut = date
      } else {
        this.checkIn = date
        this.checkOut = null
      }
    },
    isRoomBookedOnDate(roomItemId, date) {
      const dateKey = this.normalizeDateKey(date)
      if (!dateKey) return false

      const roomId = Number(roomItemId)
      return this.occupiedDates.some(entry => {
        const inventoryId = Number(entry.inventoryItemId ?? entry.inventory_item_id)
        if (inventoryId !== roomId) return false
        const occupiedDateKey = this.normalizeDateKey(entry.occupiedDate ?? entry.occupied_date ?? entry.date)
        return occupiedDateKey === dateKey
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
      this.calendarValidationError = ''
    },
    changeAdults(delta) {
      this.adults = Math.max(1, this.adults + delta)
    },
    changeChildren(delta) {
      this.children = Math.max(0, this.children + delta)
    },
    addToBooking(item, qty, guests) {
      // Intercept swimming items – open the dedicated swimming form instead
      if (item.category === 'Swimming') {
        this.selectedSwimmingProgram = item
        this.swimmingFormData = { participants: 1, dates: [], time: '', newDate: '' }
        this.swimmingCalendarMonth = new Date()
        this.showSwimmingForm = true
        return
      }

      if (item.perNight && this.checkIn && this.checkOut && this.isItemBookedInRange(item.item_id, this.checkIn, this.checkOut)) {
        alert(`${item.name} is occupied for the selected date range. Please choose different dates.`)
        return
      }

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
        subtotal: this.total
      }
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      // Show CustomerBookingConfirmation instead of redirecting
      this.showBookingConfirmation = true
    },
    handleViewReservations() {
      // Close the booking confirmation and clear data
      this.showBookingConfirmation = false
      this.booking = []
      this.checkIn = null
      this.checkOut = null
      localStorage.removeItem('pendingBooking')
      // Optionally refresh the page or show a success message
      alert('Booking completed! View your reservations in the Reservations tab.')
    },
    // ─── Swimming helpers ────────────────────────────────────────────
    toggleSwimmingDate(dateString) {
      const idx = this.swimmingFormData.dates.indexOf(dateString)
      if (idx > -1) {
        this.swimmingFormData.dates.splice(idx, 1)
      } else {
        if (this.swimmingFormData.dates.length >= 10) {
          alert('Maximum 10 session dates allowed')
          return
        }
        this.swimmingFormData.dates.push(dateString)
      }
    },
    getSwimmingCalendarDays() {
      const year = this.swimmingCalendarMonth.getFullYear()
      const month = this.swimmingCalendarMonth.getMonth()
      const firstDay = new Date(year, month, 1)
      const startDOW = firstDay.getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const prevMonthLastDay = new Date(year, month, 0).getDate()
      const today = new Date(); today.setHours(0,0,0,0)
      const days = []
      for (let i = startDOW - 1; i >= 0; i--) {
        days.push({ date: prevMonthLastDay - i, isCurrentMonth: false, dateString: '', isSelected: false, isPast: true })
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d)
        const y = dateObj.getFullYear()
        const m = String(dateObj.getMonth() + 1).padStart(2, '0')
        const dd = String(dateObj.getDate()).padStart(2, '0')
        const dateString = `${y}-${m}-${dd}`
        days.push({
          date: d,
          isCurrentMonth: true,
          dateString,
          isSelected: this.swimmingFormData.dates.includes(dateString),
          isPast: dateObj < today
        })
      }
      const remaining = 42 - days.length
      for (let d = 1; d <= remaining; d++) {
        days.push({ date: d, isCurrentMonth: false, dateString: '', isSelected: false, isPast: false })
      }
      return days
    },
    getSwimmingMonthYear() {
      return this.swimmingCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    },
    prevSwimmingMonth() {
      this.swimmingCalendarMonth = new Date(this.swimmingCalendarMonth.getFullYear(), this.swimmingCalendarMonth.getMonth() - 1)
    },
    nextSwimmingMonth() {
      this.swimmingCalendarMonth = new Date(this.swimmingCalendarMonth.getFullYear(), this.swimmingCalendarMonth.getMonth() + 1)
    },
    formatDateDisplay(dateStr) {
      const date = new Date(dateStr + 'T00:00:00')
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    },
    calculateSwimmingTotal() {
      return (this.selectedSwimmingProgram?.price || 0) * (this.swimmingFormData.participants || 0)
    },
    closeSwimmingForm() {
      this.showSwimmingForm = false
      this.selectedSwimmingProgram = null
      this.swimmingFormData = { participants: 1, dates: [], time: '', newDate: '' }
      this.swimmingCalendarMonth = new Date()
    },
    submitSwimmingBooking() {
      if (!this.swimmingFormData.participants || this.swimmingFormData.participants < 1) {
        alert('Please enter number of participants')
        return
      }
      if (this.swimmingFormData.dates.length === 0) {
        alert('Please select at least one date for your sessions')
        return
      }
      if (this.swimmingFormData.dates.length > 10) {
        alert('Maximum 10 session dates allowed')
        return
      }
      if (!this.swimmingFormData.time) {
        alert('Please select a time slot')
        return
      }
      const totalPrice = this.calculateSwimmingTotal()
      this.booking.push({
        item: { ...this.selectedSwimmingProgram, price: totalPrice },
        qty: 1,
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
      const bookingData = {
        items: this.booking, checkIn: this.checkIn, checkOut: this.checkOut,
        nights: this.nights, adults: this.adults, children: this.children
      }
      localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      this.closeSwimmingForm()
    },
    handleSearch() {
      if (!this.checkIn) {
        this.showCalendar = true
        return
      }
      this.mobileSearchOpen = false
      this.$nextTick(() => {
        const el = document.querySelector('.lg\\:flex.lg\\:gap-8')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
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

    // Initialise swimming programmes
    this.itemData.swimming = [
      {
        id: 'swim_7up',
        item_id: 'swim_7up',
        name: '7 Years Old & Above',
        category: 'Swimming',
        price: 3000,
        desc: 'Teen & Adult Program – ₱3,000 (10 sessions, 1 hour per session)',
        description: 'Learn to Swim Program for teens and adults. Package includes 10 sessions, 1 hour per session.',
        imgs: ['/images/teen.jpg'],
        perNight: false,
        maxGuests: 1,
        sessions: 10
      },
      {
        id: 'swim_6below',
        item_id: 'swim_6below',
        name: '6 Years Old & Below',
        category: 'Swimming',
        price: 4000,
        desc: 'Kids Swimming Program – ₱4,000 (10 sessions, 1 hour per session)',
        description: 'Learn to Swim Program for kids 6 years and below. Package includes 10 sessions, 1 hour per session.',
        imgs: ['/images/child.jpeg'],
        perNight: false,
        maxGuests: 1,
        sessions: 10
      }
    ]

    // Switch to swimming tab if coming from a deep-link
    if (this.$route?.query?.service === 'swimming') {
      this.currentCategory = 'swimming'
      this.currentCategoryLabel = 'Swimming'
    }
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

/* Custom scrollbar for the page */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #F0F9FF;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #1E88B6, #1F8DBF);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #1F8DBF, #1E88B6);
}
</style>