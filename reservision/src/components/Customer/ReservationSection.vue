<template>
  <div class="reservation-page">

    <!-- ══════════════════════════════════════════ -->
    <!-- SEARCH BAR                                 -->
    <!-- ══════════════════════════════════════════ -->
    <section v-if="!showBookingConfirmation" class="search-section">
      <div class="search-bar">

        <!-- Single-row search — always visible, no Modify Search toggle -->
        <div class="search-row">
          <div class="search-field">
            <label class="search-label"><i class="fas fa-calendar-alt sl-icon"></i> Check-in – Check-out</label>
            <button class="search-btn" @click="showCalendar = true">
              <span class="search-btn-text">{{ dateStr }}</span>
              <i class="fas fa-calendar-alt search-btn-icon"></i>
            </button>
          </div>

          <div class="search-divider"></div>

          <div class="search-field">
            <label class="search-label"><i class="fas fa-users sl-icon"></i> Guests</label>
            <button class="search-btn" @click="showGuests = true">
              <span class="search-btn-text">{{ guestStr }}</span>
              <i class="fas fa-user search-btn-icon"></i>
            </button>
          </div>

          <div class="search-divider"></div>

          <div class="search-field">
            <label class="search-label"><i class="fas fa-tag sl-icon"></i> Promo Code</label>
            <div class="search-input-wrap">
              <i class="fas fa-tag search-input-icon"></i>
              <input
                v-model.trim="promoCode"
                placeholder="Optional"
                class="search-input"
                @keyup.enter="handleSearch"
              />
            </div>

            <p v-if="promoError" class="promo-message promo-error">{{ promoError }}</p>
            <p v-else-if="appliedPromo" class="promo-message promo-success">
              Promo applied:
              <strong>{{ appliedPromo.code }}</strong>
              <span v-if="appliedPromo.type === 'percent'"> — {{ appliedPromo.value }}% off</span>
              <span v-else-if="appliedPromo.type === 'fixed'"> — ₱{{ Number(appliedPromo.value || 0).toLocaleString() }} off</span>
            </p>
          </div>

          <button class="search-go-btn" @click="handleSearch">
            <i class="fas fa-search"></i>
            <span class="search-go-text">Apply</span>
          </button>
        </div>

      </div>
    </section>

    <!-- ══════════════════════════════════════════ -->
    <!-- MAIN CONTENT                               -->
    <!-- ══════════════════════════════════════════ -->
    <main v-if="!showBookingConfirmation" class="main-layout">

      <!-- LEFT: Items + Category tabs -->
      <section class="items-col">

        <!-- Category Tabs -->
        <div class="category-bar">
          <div class="category-tabs">
            <button
              v-for="cat in Object.keys(itemData)"
              :key="cat"
              class="cat-tab"
              :class="{ active: currentCategory === cat }"
              @click="currentCategory = cat; currentCategoryLabel = cat.charAt(0).toUpperCase() + cat.slice(1)"
            >
              <i :class="getCatIcon(cat)"></i>
              {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
            </button>
          </div>

          <div class="category-meta">
            <span class="showing-label">Showing:</span>
            <strong class="showing-cat">{{ currentCategoryLabel }}</strong>
            <span v-if="hiddenFullyBookedCount > 0" class="booked-hidden">
              {{ hiddenFullyBookedCount }} fully booked hidden
            </span>
          </div>
        </div>

        <!-- Items List -->
        <div class="items-list">
          <ItemCard
            v-for="item in visibleCategoryItems"
            :key="item.id"
            :item="item"
            @book="addToBooking"
            @view-more="openViewMore"
          />
        </div>

      </section>

      <!-- RIGHT: Booking Summary -->
      <aside class="summary-col">
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

    </main>

    <!-- ══════════════════════════════════════════ -->
    <!-- MODALS — Calendar, Guests, ViewMore        -->
    <!-- ══════════════════════════════════════════ -->
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

    <GuestsModal
      :is-open="showGuests"
      :adults="adults"
      :children="children"
      @close="showGuests = false"
      @change-adults="changeAdults"
      @change-children="changeChildren"
    />

    <ViewMoreModal
      :is-open="showViewMore"
      :item="selectedItem"
      @close="showViewMore = false"
    />

    <!-- ══════════════════════════════════════════ -->
    <!-- IMAGE PREVIEW LIGHTBOX                     -->
    <!-- triggered by openImagePreview()            -->
    <!-- ══════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div v-if="imagePreview.show" class="img-lightbox" @click.self="closeImagePreview">
          <div class="img-lightbox__dialog">

            <div class="img-lightbox__header">
              <div class="img-lightbox__header-left">
                <span class="img-lightbox__icon"><i class="fas fa-image"></i></span>
                <div>
                  <h5 class="img-lightbox__title">{{ imagePreview.title }}</h5>
                  <p class="img-lightbox__sub">
                    {{ imagePreview.current + 1 }} / {{ imagePreview.imgs.length }}
                  </p>
                </div>
              </div>
              <button class="img-lightbox__close" @click="closeImagePreview">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="img-lightbox__stage">
              <!-- Prev -->
              <button
                v-if="imagePreview.imgs.length > 1"
                class="img-lightbox__arrow arrow-left"
                @click="prevPreviewImg"
              ><i class="fas fa-chevron-left"></i></button>

              <img
                :src="imagePreview.imgs[imagePreview.current]"
                :alt="imagePreview.title"
                class="img-lightbox__img"
              />

              <!-- Next -->
              <button
                v-if="imagePreview.imgs.length > 1"
                class="img-lightbox__arrow arrow-right"
                @click="nextPreviewImg"
              ><i class="fas fa-chevron-right"></i></button>
            </div>

            <!-- Thumbnail strip -->
            <div v-if="imagePreview.imgs.length > 1" class="img-lightbox__thumbs">
              <img
                v-for="(img, i) in imagePreview.imgs"
                :key="i"
                :src="img"
                :alt="`Photo ${i + 1}`"
                class="img-lightbox__thumb"
                :class="{ active: i === imagePreview.current }"
                @click="imagePreview.current = i"
              />
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════ -->
    <!-- CONTACT & BILLING MODAL                    -->
    <!-- ══════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showContactForm" class="modal-overlay" @click.self="showContactForm = false">
        <div class="modal-box">
          <div class="modal-header">
            <span class="modal-header-icon"><i class="fas fa-file-invoice"></i></span>
            <div>
              <h2 class="modal-title">Contact &amp; Billing</h2>
              <p class="modal-subtitle">Fill in your details to complete the booking</p>
            </div>
            <button class="modal-close-btn" @click="showContactForm = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
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

            <div class="modal-actions">
              <button class="ghost-btn" @click="showContactForm = false">
                <i class="fas fa-arrow-left"></i> Back
              </button>
              <button class="primary-btn" @click="submitContactForm">
                <i class="fas fa-check"></i> Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══════════════════════════════════════════ -->
    <!-- SWIMMING BOOKING MODAL                     -->
    <!-- ══════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="showSwimmingForm" class="modal-overlay" @click.self="closeSwimmingForm">
        <div class="modal-box swim-modal">
          <div class="modal-header swim-header">
            <span class="modal-header-icon swim-icon"><i class="fas fa-swimmer"></i></span>
            <div>
              <h2 class="modal-title white-title">Book Swimming Class</h2>
              <p class="modal-subtitle light-sub">{{ selectedSwimmingProgram?.name }}</p>
            </div>
            <button class="modal-close-btn light-close" @click="closeSwimmingForm">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body swim-body">

            <!-- Program summary -->
            <div class="swim-summary-strip">
              <div>
                <p class="swim-program-name">{{ selectedSwimmingProgram?.name }}</p>
                <p class="swim-program-meta">10 sessions · 1 hour per session</p>
              </div>
              <div class="swim-price-block">
                <p class="swim-price-label">Package Price</p>
                <p class="swim-price">₱{{ (selectedSwimmingProgram?.price || 0).toLocaleString() }}</p>
              </div>
            </div>

            <!-- Participants -->
            <div class="swim-field">
              <label class="swim-label">Number of Participants <span class="req">*</span></label>
              <div class="input-wrap">
                <i class="fas fa-users fi"></i>
                <input
                  v-model.number="swimmingFormData.participants"
                  type="number" min="1"
                  class="swim-input"
                  placeholder="Enter number of participants"
                />
              </div>
            </div>

            <!-- Date picker -->
            <div class="swim-field">
              <div class="swim-dates-header">
                <label class="swim-label">Schedule Dates (select up to 10) <span class="req">*</span></label>
                <span class="session-progress" :class="{ complete: swimmingFormData.dates.length === 10 }">
                  <i :class="swimmingFormData.dates.length === 10 ? 'fas fa-check-circle' : 'fas fa-circle-notch'"></i>
                  {{ swimmingFormData.dates.length }}/10
                </span>
              </div>

              <div class="swim-calendar">
                <div class="swim-cal-nav">
                  <button type="button" class="swim-cal-btn" @click="prevSwimmingMonth">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <span class="swim-cal-month">{{ getSwimmingMonthYear() }}</span>
                  <button type="button" class="swim-cal-btn" @click="nextSwimmingMonth">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>

                <div class="swim-weekdays">
                  <span v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d">{{ d }}</span>
                </div>

                <div class="swim-days-grid">
                  <button
                    v-for="day in getSwimmingCalendarDays()"
                    :key="day.dateString + day.date"
                    type="button"
                    class="swim-day"
                    :class="{
                      'other-month': !day.isCurrentMonth,
                      'past':        day.isPast,
                      'selected':    day.isSelected,
                      'disabled':    !day.isCurrentMonth || day.isPast || (swimmingFormData.dates.length >= 10 && !day.isSelected)
                    }"
                    :disabled="!day.isCurrentMonth || day.isPast || (swimmingFormData.dates.length >= 10 && !day.isSelected)"
                    @click="toggleSwimmingDate(day.dateString)"
                  >{{ day.date }}</button>
                </div>
              </div>

              <!-- Selected dates list -->
              <div v-if="swimmingFormData.dates.length > 0" class="selected-dates-list">
                <div v-for="(date, idx) in sortedSwimmingDates" :key="idx" class="selected-date-row">
                  <span class="sd-num">{{ idx + 1 }}</span>
                  <i class="fas fa-calendar-day sd-icon"></i>
                  <span class="sd-text">{{ formatDateDisplay(date) }}</span>
                  <button type="button" class="sd-remove" @click="toggleSwimmingDate(date)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <p v-else class="swim-date-hint">
                <i class="fas fa-hand-pointer"></i> Click dates above to schedule your sessions
              </p>
            </div>

            <!-- Time slot -->
            <div class="swim-field">
              <label class="swim-label">Preferred Time Slot <span class="req">*</span></label>
              <div class="input-wrap">
                <i class="fas fa-clock fi"></i>
                <select v-model="swimmingFormData.time" class="swim-input swim-select">
                  <option value="">Select time slot</option>
                  <option value="6:00 AM - 7:00 AM">6:00 AM – 7:00 AM</option>
                  <option value="8:00 AM - 9:00 AM">8:00 AM – 9:00 AM</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM – 11:00 AM</option>
                  <option value="2:00 PM - 3:00 PM">2:00 PM – 3:00 PM</option>
                  <option value="4:00 PM - 5:00 PM">4:00 PM – 5:00 PM</option>
                </select>
              </div>
            </div>

            <!-- Price breakdown -->
            <div class="swim-price-breakdown">
              <div class="pb-row"><span>Package price (per person)</span><span>₱{{ (selectedSwimmingProgram?.price || 0).toLocaleString() }}</span></div>
              <div class="pb-row"><span>Sessions included</span><span>10 × 1 hour</span></div>
              <div class="pb-row"><span>Participants</span><span>{{ swimmingFormData.participants || 0 }}</span></div>
              <div class="pb-divider"></div>
              <div class="pb-row pb-total">
                <span>Total</span>
                <span class="pb-total-val">₱{{ calculateSwimmingTotal().toLocaleString() }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button class="ghost-btn" @click="closeSwimmingForm">
                <i class="fas fa-times"></i> Cancel
              </button>
              <button class="gold-btn" @click="submitSwimmingBooking">
                <i class="fas fa-check"></i> Book Class
              </button>
            </div>

          </div>
        </div>
      </div>
    </Transition>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      v-if="showConfirmation"
      :email="confirmationEmail"
      :booking-id="confirmationBookingId"
    />

    <!-- Customer Booking Confirmation -->
    <div v-if="showBookingConfirmation" class="confirmation-wrap">
      <CustomerBookingConfirmation
        @view-reservations="handleViewReservations"
        @close="showBookingConfirmation = false"
      />
    </div>

  </div>
</template>

<script>
import { ref, reactive } from 'vue'
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
  components: { ItemCard, BookingSummary, CalendarModal, GuestsModal, ViewMoreModal, ConfirmationModal, ContactBillingForm, CustomerBookingConfirmation },
  data() {
    return {
      apiBaseUrl: 'http://localhost:8000/api',
      apiRoot: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, ''),
      fallbackRoomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500',
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
      contactFirstName: '', contactLastName: '', contactPhone: '',
      contactEmail: '', contactAddress: '', contactCity: '',
      contactCountry: 'Philippines', contactPostal: '', contactSpecialRequests: '',
      selectedItem: null,
      currentCategory: 'rooms',
      currentCategoryLabel: 'Rooms',
      currentMonth: new Date(),
      checkIn: null, checkOut: null,
      adults: 2, children: 0,
      booking: [],
      occupiedDates: [],
      calendarValidationError: '',
      itemData: { rooms: [], cottages: [], events: [], swimming: [] },
      showSwimmingForm: false,
      selectedSwimmingProgram: null,
      swimmingFormData: { participants: 1, dates: [], time: '', newDate: '' },
      swimmingCalendarMonth: new Date(),
      // Image preview lightbox state
      imagePreview: {
        show: false,
        imgs: [],
        current: 0,
        title: ''
      },
      promoCode: '',
      appliedPromo: null,
      promoError: '',
      isPromoChecking: false
    }
  },
    computed: {
    nights() {
      if (!this.checkIn || !this.checkOut) return 0
      return Math.ceil((this.checkOut - this.checkIn) / 86400000)
    },

    subtotal() {
      return this.booking.reduce((sum, b) => {
        const base = Number(b.item.price || 0) * Number(b.qty || 0)
        return sum + (b.item.perNight && this.nights ? base * this.nights : base)
      }, 0)
    },

    discountAmount() {
      if (!this.appliedPromo) return 0

      const type = String(this.appliedPromo.type || '').toLowerCase()
      const value = Number(this.appliedPromo.value || 0)

      if (type === 'percent') {
        return Math.min(this.subtotal, this.subtotal * (value / 100))
      }

      if (type === 'fixed') {
        return Math.min(this.subtotal, value)
      }

      return 0
    },

    total() {
      return Math.max(0, this.subtotal - this.discountAmount)
    },

    dateStr() {
      const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      if (this.checkIn && this.checkOut) return `${fmt(this.checkIn)} – ${fmt(this.checkOut)}`
      if (this.checkIn) return fmt(this.checkIn)
      return 'Select Dates'
    },

    guestStr() {
      let s = `${this.adults} Adult${this.adults > 1 ? 's' : ''}`
      if (this.children) s += `, ${this.children} Child${this.children > 1 ? 'ren' : ''}`
      return s
    },

    totalGuests() {
      return Number(this.adults || 0) + Number(this.children || 0)
    },

    bookedDateItems() {
      return this.booking.filter(b => b?.item?.perNight)
        .map(b => ({ item_id: b.item.item_id, category: b.item.category, name: b.item.name }))
    },

    dateSensitiveRooms() {
      return [...this.itemData.rooms, ...this.itemData.cottages, ...this.itemData.events].filter(i => i?.perNight)
    },

    groupedCategoryItems() {
      return this.groupItemsByAvailability(this.itemData[this.currentCategory] || [])
    },

    visibleCategoryItems() {
      const guests = this.totalGuests
      const hasDateRange = !!this.checkIn && !!this.checkOut

      return this.groupedCategoryItems.filter(item => {
        const fitsGuests = !item?.perNight || Number(item.maxGuests || 0) >= guests

        // If no dates yet, allow browsing all per-night items
        const isAvailable = !item?.perNight || !hasDateRange || (item.availableQuantity || 0) > 0

        return fitsGuests && isAvailable
      })
    },

    hiddenFullyBookedCount() {
      const hasDateRange = !!this.checkIn && !!this.checkOut
      if (!hasDateRange) return 0

      return Math.max(0, this.groupedCategoryItems.length - this.visibleCategoryItems.length)
    },

    sortedSwimmingDates() {
      return [...this.swimmingFormData.dates].sort((a, b) => new Date(a) - new Date(b))
    }
  },
    methods: {
      parseImageArray(value) {
        if (!value) return []
        if (Array.isArray(value)) return value
        try {
          const parsed = JSON.parse(value)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      },
      resolveImageUrl(rawPath) {
        if (!rawPath) return ''
        const path = String(rawPath).trim()
        if (!path) return ''

        if (
          path.startsWith('http://') ||
          path.startsWith('https://') ||
          path.startsWith('data:') ||
          path.startsWith('blob:')
        ) return path

        if (path.startsWith('//')) return `${window.location.protocol}${path}`
        if (path.startsWith('/')) return `${this.apiRoot}${path}`
        return `${this.apiRoot}/${path.replace(/^\.?\//, '')}`
      },
      normalizeImages(rawImages, fallbackImage, primaryImageIndex = 0) {
        const resolved = this.parseImageArray(rawImages)
          .map(img => this.resolveImageUrl(img))
          .filter(Boolean)

        if (!resolved.length) return [fallbackImage]

        const idx = Number(primaryImageIndex)
        if (Number.isInteger(idx) && idx >= 0 && idx < resolved.length && idx !== 0) {
          const [primary] = resolved.splice(idx, 1)
          resolved.unshift(primary)
        }

        return resolved
      },
      getCatIcon(cat) {
        const icons = { rooms: 'fas fa-bed', cottages: 'fas fa-home', events: 'fas fa-calendar-alt', swimming: 'fas fa-swimmer' }
        return icons[cat] || 'fas fa-th'
      },
      getItemGroupKey(item) {
        return [item.categoryType || item.category || '', item.name || '', item.price || 0, item.maxGuests || 0].join('::')
      },
      getAvailableInventoryIds(item) {
        // Prefer pre-computed availableInventoryIds set by groupItemsByAvailability
        if (Array.isArray(item.availableInventoryIds)) return item.availableInventoryIds

        const candidateIds = Array.isArray(item.inventoryItemIds) && item.inventoryItemIds.length
          ? item.inventoryItemIds
          : (item.item_id ? [item.item_id] : [])

        if (!item?.perNight || !this.checkIn || !this.checkOut) return candidateIds

        return candidateIds.filter(id => !this.isItemBookedInRange(id, this.checkIn, this.checkOut))
      },
      groupItemsByAvailability(items) {
        if (!Array.isArray(items) || !items.length) return []
        if (['swimming'].includes(this.currentCategory)) return items

        const groups = new Map()

        items.forEach(item => {
          const itemStatus = String(item.status || '').toLowerCase()
          // Only exclude items under maintenance — 'Occupied' rooms can still be booked for future dates
          if (itemStatus === 'under maintenance' || itemStatus === 'maintenance') return

          const key = this.getItemGroupKey(item)

          if (!groups.has(key)) {
            groups.set(key, {
              ...item,
              groupKey: key,
              inventoryItemIds: [],
              // totalStock = count of non-maintenance unit rows for this room type
              totalStock: 0
            })
          }

          const groupedItem = groups.get(key)
          groupedItem.inventoryItemIds.push(item.item_id)
          // Each row represents exactly 1 physical unit
          groupedItem.totalStock += 1
        })

        return Array.from(groups.values()).map(groupedItem => {
          // availableQuantity = number of unit IDs that are NOT booked in selected date range
          const availableIds = groupedItem.perNight && this.checkIn && this.checkOut
            ? groupedItem.inventoryItemIds.filter(
                id => !this.isItemBookedInRange(id, this.checkIn, this.checkOut)
              )
            : groupedItem.inventoryItemIds
          return {
            ...groupedItem,
            totalInventoryQuantity: groupedItem.totalStock,
            // availableInventoryIds lets addToBooking pick real free unit IDs directly
            availableInventoryIds: availableIds,
            availableQuantity: availableIds.length
          }
        })
      },
      getSelectedInventoryIds(bookingItem) {
        if (Array.isArray(bookingItem?.selectedInventoryItemIds) && bookingItem.selectedInventoryItemIds.length) {
          return bookingItem.selectedInventoryItemIds
        }
        if (bookingItem?.item?.item_id) return [bookingItem.item.item_id]
        return []
      },

      // ── Image preview ──────────────────────────────
      openImagePreview(imgs, title, startIdx = 0) {
        this.imagePreview = { show: true, imgs: Array.isArray(imgs) ? imgs : [imgs], current: startIdx, title: title || '' }
        document.body.style.overflow = 'hidden'
      },
      closeImagePreview() {
        this.imagePreview.show = false
        document.body.style.overflow = ''
      },
      prevPreviewImg() {
        const len = this.imagePreview.imgs.length
        this.imagePreview.current = (this.imagePreview.current - 1 + len) % len
      },
      nextPreviewImg() {
        this.imagePreview.current = (this.imagePreview.current + 1) % this.imagePreview.imgs.length
      },

      // ── Date helpers ───────────────────────────────
      toLocalDateKey(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null
        const y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,'0'), d = String(date.getDate()).padStart(2,'0')
        return `${y}-${m}-${d}`
      },
      normalizeDateKey(dateLike) {
        if (!dateLike) return null
        if (dateLike instanceof Date) return this.toLocalDateKey(dateLike)
        const raw = String(dateLike).trim(), match = raw.match(/^(\d{4}-\d{2}-\d{2})/)
        if (match) return match[1]
        const p = new Date(raw)
        return Number.isNaN(p.getTime()) ? null : this.toLocalDateKey(p)
      },

      // ── API ────────────────────────────────────────
      async fetchOccupiedDates() {
        try {
          const res = await fetch(`${this.apiBaseUrl}/bookings/occupied-dates`)
          const data = await res.json()
          let records = []
          if (Array.isArray(data)) records = data
          else if (data && Array.isArray(data.data)) records = data.data
          else if (data?.data && typeof data.data === 'object') {
            for (const key of ['occupiedDates','rows','occupied_dates','dates']) {
              if (Array.isArray(data.data[key])) { records = data.data[key]; break }
            }
          } else if (data && Array.isArray(data.occupied_dates)) records = data.occupied_dates
          this.occupiedDates = records
            .filter(i => i && (i.inventory_item_id || i.inventoryItemId || i.inventory_id))
            .map(i => ({ inventoryItemId: i.inventory_item_id ?? i.inventoryItemId ?? i.inventory_id, occupiedDate: i.occupied_date ?? i.occupiedDate ?? i.date }))
        } catch { this.occupiedDates = [] }
      },

      async fetchInventoryItems() {
        try {
          this.loading = true
          const res = await fetch(`${this.apiBaseUrl}/rooms`)
          const data = await res.json()
          let items = Array.isArray(data) ? data : (data.success && data.data ? data.data : [])
          this.itemData.rooms = []; this.itemData.cottages = []; this.itemData.events = []
          items.forEach(item => {
            const images = this.normalizeImages(item.images, this.fallbackRoomImage, item.primaryImageIndex)
            const ct = (item.category_type || '').toLowerCase()
            const category = (item.category || '').toLowerCase()
            const fi = {
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
              categoryType: ct,
              // Each row is 1 physical unit — quantity column is no longer used for logic
              quantity: 1,
              unit_number: item.unit_number || 1,
              unit_label: item.unit_label || null
            }

            if (category === 'room' || ct === 'room' || ct.includes('room')) this.itemData.rooms.push(fi)
            else if (category === 'cottage' || ct === 'cottage' || ct.includes('cottage')) this.itemData.cottages.push(fi)
            else if (category === 'event' || ct === 'event' || ct.includes('event')) this.itemData.events.push(fi)
          })
        } catch (e) { console.error(e) } finally { this.loading = false }
      },

      // ── Booking logic ──────────────────────────────
      isRoomBookedOnDate(roomItemId, date) {
        const dk = this.normalizeDateKey(date)
        if (!dk) return false
        const rid = Number(roomItemId)
        return this.occupiedDates.some(e => {
          if (Number(e.inventoryItemId ?? e.inventory_item_id) !== rid) return false
          return this.normalizeDateKey(e.occupiedDate ?? e.occupied_date ?? e.date) === dk
        })
      },
      isItemBookedInRange(itemId, s, e) {
        if (!itemId || !s || !e || e <= s) return false
        const c = new Date(s)
        while (c < e) { if (this.isRoomBookedOnDate(itemId, c)) return true; c.setDate(c.getDate()+1) }
        return false
      },
      isAnySelectedRoomBookedOnDate(date) {
        const rooms = this.booking.filter(b => ['room', 'rooms', 'cottage', 'event'].includes((b.item.categoryType || b.item.category || '').toLowerCase()))
        return rooms.length > 0 && rooms.some(b => this.getSelectedInventoryIds(b).some(id => this.isRoomBookedOnDate(id, date)))
      },
      hasBookedDateInRange(s, e) {
        if (!s || !e || e <= s) return false
        const c = new Date(s)
        while (c < e) { if (this.isAnySelectedRoomBookedOnDate(c)) return true; c.setDate(c.getDate()+1) }
        return false
      },
      selectDate(date) {
        this.calendarValidationError = ''
        if (this.isAnySelectedRoomBookedOnDate(date)) { this.calendarValidationError = 'One of your selected rooms is occupied on this date.'; return }
        if (!this.checkIn || (this.checkIn && this.checkOut)) { this.checkIn = date; this.checkOut = null }
        else if (date > this.checkIn) {
          if (this.hasBookedDateInRange(this.checkIn, date)) { this.calendarValidationError = 'Your range includes occupied date(s).'; return }
          this.checkOut = date
        } else { this.checkIn = date; this.checkOut = null }
      },
      clearBooking() { this.booking = []; this.checkIn = null; this.checkOut = null; localStorage.removeItem('pendingBooking') },
      prevMonth() { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth()-1) },
      nextMonth() { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth()+1) },
      clearDates() { this.checkIn = null; this.checkOut = null; this.calendarValidationError = '' },
      changeAdults(d) { this.adults = Math.max(1, this.adults + d) },
      changeChildren(d) { this.children = Math.max(0, this.children + d) },

      addToBooking(item, qty, guests) {
        if (item.category === 'Swimming') {
          this.selectedSwimmingProgram = item
          this.swimmingFormData = { participants: 1, dates: [], time: '', newDate: '' }
          this.swimmingCalendarMonth = new Date()
          this.showSwimmingForm = true
          return
        }

        if (item.perNight && (!this.checkIn || !this.checkOut)) {
          this.showCalendar = true
          alert('Please select check-in and check-out dates first.')
          return
        }

        if (item.perNight && (!item.availableQuantity || item.availableQuantity < 1)) {
          alert(`No available ${item.name.toLowerCase()} left for the selected dates.`); return
        }

        const bookingKey = item.groupKey || this.getItemGroupKey(item)
        const requestedQty = Math.max(1, Number(qty || 1))
        const existing = this.booking.find(b => (b.item.groupKey || this.getItemGroupKey(b.item)) === bookingKey)

        if (item.perNight) {
          // Use pre-computed availableInventoryIds (already filtered by date conflicts)
          const availableIds = Array.isArray(item.availableInventoryIds)
            ? item.availableInventoryIds
            : (Array.isArray(item.inventoryItemIds) ? item.inventoryItemIds : [item.item_id])
          const alreadySelected = existing ? this.getSelectedInventoryIds(existing) : []
          // Remove already-selected IDs from the free pool
          const remainingIds = availableIds.filter(id => !alreadySelected.includes(id))

          if (existing && existing.qty + requestedQty > availableIds.length) {
            alert(`Only ${availableIds.length} ${item.name} unit(s) are available for your selected dates.`)
            return
          }

          if (!existing && requestedQty > availableIds.length) {
            alert(`Only ${availableIds.length} ${item.name} unit(s) are available for your selected dates.`)
            return
          }

          const reservedIds = remainingIds.slice(0, requestedQty)

          if (reservedIds.length < requestedQty) {
            alert(`Only ${availableIds.length} ${item.name} unit(s) are available for your selected dates.`)
            return
          }

          if (existing) {
            existing.qty += requestedQty
            existing.guests = guests
            existing.selectedInventoryItemIds = [...alreadySelected, ...reservedIds]
          } else {
            this.booking.push({
              item: { ...item },
              qty: requestedQty,
              guests,
              selectedInventoryItemIds: reservedIds
            })
          }
        } else {
          if (existing) {
            existing.qty += requestedQty
            existing.guests = guests
          } else {
            this.booking.push({ item, qty: requestedQty, guests })
          }
        }

        this.saveBookingToStorage()
      },
      removeFromBooking(itemId) {
        this.booking = this.booking.filter(b => b.item.id !== itemId)
        if (!this.booking.length) { this.checkIn = null; this.checkOut = null; localStorage.removeItem('pendingBooking') }
        else this.saveBookingToStorage()
      },
      openViewMore(item) { this.selectedItem = item; this.showViewMore = true },
      proceedToCheckout() {
        if (!this.booking.length) return
        if (this.booking.some(b => b.item.perNight) && (!this.checkIn || !this.checkOut)) return
        this.saveBookingToStorage()
        this.showBookingConfirmation = true
      },
      handleViewReservations() {
        this.showBookingConfirmation = false
        this.booking = []; this.checkIn = null; this.checkOut = null
        localStorage.removeItem('pendingBooking')
        alert('Booking completed! View your reservations in the Reservations tab.')
      },
      async handleSearch() {
        this.promoError = ''

        // Promo validation is optional, but if user entered one, validate it
        if (this.promoCode) {
          const promoOk = await this.validatePromoCode()
          if (!promoOk) return
        } else {
          this.appliedPromo = null
        }

        this.mobileSearchOpen = false

        this.$nextTick(() => {
          document.querySelector('.main-layout')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        })
      },

      // ── Swimming ───────────────────────────────────
      toggleSwimmingDate(ds) {
        if (!ds) return
        const i = this.swimmingFormData.dates.indexOf(ds)
        if (i > -1) this.swimmingFormData.dates.splice(i, 1)
        else {
          if (this.swimmingFormData.dates.length >= 10) { alert('Maximum 10 session dates'); return }
          this.swimmingFormData.dates.push(ds)
        }
      },
      getSwimmingCalendarDays() {
        const year = this.swimmingCalendarMonth.getFullYear(), month = this.swimmingCalendarMonth.getMonth()
        const first = new Date(year, month, 1), startDow = first.getDay()
        const dim = new Date(year, month+1, 0).getDate(), prev = new Date(year, month, 0).getDate()
        const today = new Date(); today.setHours(0,0,0,0)
        const days = []
        for (let i = startDow-1; i >= 0; i--) days.push({ date: prev-i, isCurrentMonth: false, dateString: '', isSelected: false, isPast: true })
        for (let d = 1; d <= dim; d++) {
          const dt = new Date(year, month, d)
          const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
          days.push({ date: d, isCurrentMonth: true, dateString: ds, isSelected: this.swimmingFormData.dates.includes(ds), isPast: dt < today })
        }
        for (let d = 1; days.length < 42; d++) days.push({ date: d, isCurrentMonth: false, dateString: '', isSelected: false, isPast: false })
        return days
      },
      getSwimmingMonthYear() { return this.swimmingCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
      prevSwimmingMonth() { this.swimmingCalendarMonth = new Date(this.swimmingCalendarMonth.getFullYear(), this.swimmingCalendarMonth.getMonth()-1) },
      nextSwimmingMonth() { this.swimmingCalendarMonth = new Date(this.swimmingCalendarMonth.getFullYear(), this.swimmingCalendarMonth.getMonth()+1) },
      formatDateDisplay(ds) { return new Date(ds+'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) },
      calculateSwimmingTotal() { return (this.selectedSwimmingProgram?.price || 0) * (this.swimmingFormData.participants || 0) },
      closeSwimmingForm() { this.showSwimmingForm = false; this.selectedSwimmingProgram = null; this.swimmingFormData = { participants: 1, dates: [], time: '', newDate: '' }; this.swimmingCalendarMonth = new Date() },
      submitSwimmingBooking() {
        if (!this.swimmingFormData.participants || this.swimmingFormData.participants < 1) { alert('Please enter number of participants'); return }
        if (!this.swimmingFormData.dates.length) { alert('Please select at least one date'); return }
        if (this.swimmingFormData.dates.length > 10) { alert('Maximum 10 session dates'); return }
        if (!this.swimmingFormData.time) { alert('Please select a time slot'); return }
        const total = this.calculateSwimmingTotal()
        this.booking.push({ item: { ...this.selectedSwimmingProgram, price: total }, qty: 1, guests: this.swimmingFormData.participants, swimmingDetails: { dates: [...this.swimmingFormData.dates], time: this.swimmingFormData.time, participants: this.swimmingFormData.participants, packagePrice: this.selectedSwimmingProgram.price, totalSessions: 10, selectedDates: this.swimmingFormData.dates.length } })
        this.saveBookingToStorage()
        this.closeSwimmingForm()
      },

      // ── Contact form ───────────────────────────────
      submitContactForm() {
        const required = ['contactFirstName','contactLastName','contactPhone','contactEmail','contactAddress','contactCity','contactPostal']
        if (required.some(k => !this[k]?.trim())) return
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.contactEmail)) return
        if (this.contactPhone.length !== 10 || !/^\d+$/.test(this.contactPhone)) return
        localStorage.setItem('completedBooking', JSON.stringify({
          items: this.booking, checkIn: this.checkIn, checkOut: this.checkOut,
          nights: this.nights, adults: this.adults, children: this.children, total: this.total,
          customer: { firstName: this.contactFirstName, lastName: this.contactLastName, fullName: `${this.contactFirstName} ${this.contactLastName}` },
          contact: { phone: '+63'+this.contactPhone, email: this.contactEmail, address: this.contactAddress, city: this.contactCity, country: this.contactCountry, postal: this.contactPostal },
          specialRequests: this.contactSpecialRequests
        }))
        const bookingId = 'BK' + Date.now().toString().slice(-8)
        this.confirmationEmail = this.contactEmail; this.confirmationBookingId = bookingId; this.showContactForm = false
        setTimeout(() => this.$router.push({ name: 'BookingConfirmation', query: { email: this.contactEmail, bookingId } }), 500)
        setTimeout(() => { this.booking = []; this.checkIn = null; this.checkOut = null; localStorage.removeItem('pendingBooking') }, 1000)
      },

      clearPromoState() {
    this.appliedPromo = null
    this.promoError = ''
  },

  normalizePromoPayload(promo) {
    if (!promo) return null

    return {
      code: promo.code || promo.promo_code || this.promoCode,
      type: String(promo.type || promo.discount_type || '').toLowerCase(),
      value: Number(promo.value || promo.discount_value || promo.amount || 0),
      category: promo.category || promo.applies_to_category || null,
      itemIds: Array.isArray(promo.item_ids) ? promo.item_ids : []
    }
  },

  async validatePromoCode() {
    this.promoError = ''
    this.appliedPromo = null

    if (!this.promoCode) return true

    this.isPromoChecking = true

    try {
      const res = await fetch(`${this.apiBaseUrl}/promos/validate?code=${encodeURIComponent(this.promoCode)}`)
      const data = await res.json()

      if (!res.ok || !data?.success || !data?.valid) {
        this.promoError = data?.message || 'Invalid or expired promo code.'
        return false
      }

      this.appliedPromo = this.normalizePromoPayload(data.promo || data.data || {})
      return true
    } catch (err) {
      console.error('Promo validation failed:', err)
      this.promoError = 'Failed to validate promo code.'
      return false
    } finally {
      this.isPromoChecking = false
    }
  },

  saveBookingToStorage() {
    localStorage.setItem('pendingBooking', JSON.stringify({
      items: this.booking,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      nights: this.nights,
      adults: this.adults,
      children: this.children,
      subtotal: this.subtotal,
      discountAmount: this.discountAmount,
      total: this.total,
      promoCode: this.promoCode,
      appliedPromo: this.appliedPromo
    }))
  },
  },

  mounted() {
    const saved = localStorage.getItem('pendingBooking')
    if (saved) {
      try {
        const d = JSON.parse(saved)
        if (d.checkIn) this.checkIn = new Date(d.checkIn)
        if (d.checkOut) this.checkOut = new Date(d.checkOut)
        if (d.adults) this.adults = d.adults
        if (d.children) this.children = d.children
        if (d.items?.length) this.booking = d.items
        if (d.promoCode) this.promoCode = d.promoCode
        if (d.appliedPromo) this.appliedPromo = d.appliedPromo
      } catch {}
    }
    this.fetchInventoryItems()
    this.fetchOccupiedDates()
    this.itemData.swimming = [
      { id: 'swim_7up', item_id: 'swim_7up', name: '7 Years Old & Above', category: 'Swimming', price: 3000, desc: 'Teen & Adult Program – ₱3,000 (10 sessions, 1 hour per session)', description: 'Learn to Swim Program for teens and adults.', imgs: ['/images/teen.jpg'], perNight: false, maxGuests: 1, sessions: 10 },
      { id: 'swim_6below', item_id: 'swim_6below', name: '6 Years Old & Below', category: 'Swimming', price: 4000, desc: 'Kids Swimming Program – ₱4,000 (10 sessions, 1 hour per session)', description: 'Learn to Swim Program for kids 6 years and below.', imgs: ['/images/child.jpeg'], perNight: false, maxGuests: 1, sessions: 10 }
    ]
    if (this.$route?.query?.service === 'swimming') { this.currentCategory = 'swimming'; this.currentCategoryLabel = 'Swimming' }

    // Keyboard navigation for lightbox
    window.addEventListener('keydown', (e) => {
      if (!this.imagePreview.show) return
      if (e.key === 'Escape') this.closeImagePreview()
      if (e.key === 'ArrowLeft') this.prevPreviewImg()
      if (e.key === 'ArrowRight') this.nextPreviewImg()
    })
  }
}
</script>

<style scoped>
/* ── Design Tokens ──────────────────────────────────────────── */
:root {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #f9fafb;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.reservation-page {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #EEF5FB;
  min-height: 100vh;
  color: #1f2937;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #EEF5FB; }
::-webkit-scrollbar-thumb { background: #0369a1; border-radius: 6px; }
::-webkit-scrollbar-thumb:hover { background: #0C3B5E; }

/* ── Search Section ─────────────────────────────────────────── */
.search-section {
  padding: 0.65rem 1.25rem;
  position: sticky; top: 0; z-index: 10;
  background: #EEF5FB;
}

.search-bar {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #dbeafe;
  border-bottom: 2px solid #F4C400;
  box-shadow: 0 2px 12px rgba(3,105,161,0.1);
  padding: 0.75rem 1rem;
  transition: box-shadow 0.2s;
}

.search-bar:hover { box-shadow: 0 4px 18px rgba(3,105,161,0.14); }

/* ── Single-row layout — always visible ─────────────────────── */
.search-row {
  display: flex;
  align-items: center;
  gap: 0;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
  padding: 0 0.85rem;
}

/* First field — no left padding */
.search-field:first-child { padding-left: 0; }

.search-label {
  font-size: 0.62rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.07em; color: #0369a1;
  display: flex; align-items: center; gap: 0.3rem;
  white-space: nowrap;
}

.sl-icon { font-size: 0.6rem; }

.search-btn {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.5rem 0.7rem;
  background: #f0f7ff; border: 1.5px solid #dbeafe; border-radius: 8px;
  font-family: inherit; font-size: 0.83rem; cursor: pointer; width: 100%;
  transition: border-color 0.18s, background 0.18s; text-align: left;
  white-space: nowrap;
}
.search-btn:hover { border-color: #0369a1; background: #fff; }

.search-btn-text { font-weight: 600; color: #0C3B5E; overflow: hidden; text-overflow: ellipsis; }
.search-btn-icon { color: #F4C400; font-size: 0.82rem; flex-shrink: 0; margin-left: 0.4rem; }

/* Thin vertical divider between fields */
.search-divider {
  width: 1px;
  height: 36px;
  background: #dbeafe;
  flex-shrink: 0;
}

.search-input-wrap { position: relative; }
.search-input-icon { position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: #0369a1; font-size: 0.68rem; pointer-events: none; }

.search-input {
  width: 100%;
  padding: 0.5rem 0.7rem 0.5rem 2rem;
  border: 1.5px solid #dbeafe; border-radius: 8px;
  font-family: inherit; font-size: 0.83rem;
  background: #f0f7ff; color: #1f2937;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.18s; outline: none;
}
.search-input:focus { border-color: #0369a1; background: #fff; box-shadow: 0 0 0 3px rgba(3,105,161,0.1); }

/* Search button — self-aligned, not wrapped in a field */
.search-go-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.62rem 1.25rem;
  background: linear-gradient(135deg, #0C3B5E 0%, #0369a1 70%, #1F8DBF 100%);
  color: #fff; border: none; border-radius: 9px;
  font-family: inherit; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; flex-shrink: 0; margin-left: 0.75rem;
  transition: opacity 0.18s, transform 0.15s, box-shadow 0.18s;
  box-shadow: 0 3px 10px rgba(3,105,161,0.25);
  white-space: nowrap;
}
.search-go-btn:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 5px 14px rgba(3,105,161,0.3); }

.search-go-text { display: inline; }

/* ── Promo messages ─────────────────────────────────────────── */
.promo-message {
  margin-top: 0.35rem;
  font-size: 0.72rem;
}
.promo-success { color: #047857; }
.promo-error   { color: #b91c1c; }

/* On small screens stack the fields */
@media (max-width: 640px) {
  .search-row { flex-direction: column; align-items: stretch; gap: 0.6rem; }
  .search-divider { display: none; }
  .search-field { padding: 0; }
  .search-go-btn { margin-left: 0; }
  .search-go-text { display: inline; }
}

/* ── Main Layout ────────────────────────────────────────────── */
.main-layout {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 1.25rem 1.25rem;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
  align-items: start;
}

@media (min-width : 1025px) {
  .summary-col { position: sticky; top: 11.5rem; align-self: start; height: 1000px; }  
  .search-section { position: sticky; top: 4rem; }
  .category-bar { position: sticky; top: 6.5rem; }
}

@media (max-width: 1024px) { .main-layout { grid-template-columns: 1fr; } }

.items-col { display: flex; flex-direction: column; gap: 0.75rem; }

/* ── Category Bar ───────────────────────────────────────────── */
.category-bar {
  background: #fff; border-radius: 12px;
  padding: 0.65rem 1rem; border: 1px solid #dbeafe;
  box-shadow: 0 1px 6px rgba(3,105,161,0.06);
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.75rem; flex-wrap: wrap;
}

.category-tabs { display: flex; gap: 0.45rem; flex-wrap: wrap; }

.cat-tab {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.42rem 0.9rem; border-radius: 50px;
  font-family: inherit; font-size: 0.78rem; font-weight: 700;
  cursor: pointer; background: #f0f7ff;
  border: 1.5px solid #dbeafe; color: #0369a1;
  transition: all 0.2s;
}
.cat-tab:hover { background: #eff6ff; border-color: #0369a1; transform: translateY(-1px); }
.cat-tab.active { background: #0369a1; border-color: #0369a1; color: #fff; box-shadow: 0 3px 10px rgba(3,105,161,0.25); }

.category-meta { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: #6b7280; flex-shrink: 0; }
.showing-label { color: #9ca3af; }
.showing-cat   { color: #0C3B5E; font-weight: 800; }
.booked-hidden { background: #fef9c3; color: #854d0e; padding: 0.15rem 0.55rem; border-radius: 20px; font-size: 0.68rem; font-weight: 700; }

.items-list { display: flex; flex-direction: column; gap: 0.85rem; }

/* ── Shared Buttons ─────────────────────────────────────────── */
.ghost-btn {
  display: inline-flex; align-items: center; gap: 0.45rem; justify-content: center;
  padding: 0.7rem 1.2rem; flex: 1;
  background: #fff; color: #6b7280;
  border: 1.5px solid #e5e7eb; border-radius: 9px;
  font-family: inherit; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.ghost-btn:hover { border-color: #0369a1; color: #0369a1; background: #eff6ff; }

.primary-btn {
  display: inline-flex; align-items: center; gap: 0.45rem; justify-content: center;
  padding: 0.72rem 1.25rem; flex: 1;
  background: #0369a1; color: #fff;
  border: none; border-radius: 9px;
  font-family: inherit; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.primary-btn:hover { background: #0C3B5E; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(3,105,161,0.22); }

.gold-btn {
  display: inline-flex; align-items: center; gap: 0.45rem; justify-content: center;
  padding: 0.72rem 1.25rem; flex: 1;
  background: #F4C400; color: #0C3B5E;
  border: none; border-radius: 9px;
  font-family: inherit; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.gold-btn:hover { background: #F2C200; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(244,196,0,0.3); }

/* ── IMAGE PREVIEW LIGHTBOX ─────────────────────────────────── */
.img-lightbox {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  background: rgba(12, 59, 94, 0.85);
  backdrop-filter: blur(8px);
  padding: 1rem;
}

.lightbox-fade-enter-active, .lightbox-fade-leave-active { transition: opacity 0.22s ease; }
.lightbox-fade-enter-from, .lightbox-fade-leave-to { opacity: 0; }

.img-lightbox__dialog {
  width: 100%; max-width: 900px;
  background: #fff;
  border-radius: 16px; overflow: hidden;
  border: 1px solid #dbeafe;
  box-shadow: 0 24px 60px rgba(12,59,94,0.5);
  animation: dialogIn 0.28s cubic-bezier(0.34,1.56,0.64,1);
  display: flex; flex-direction: column;
  max-height: 92vh;
}

@keyframes dialogIn {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Header */
.img-lightbox__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.9rem 1.25rem;
  background: linear-gradient(135deg, #0C3B5E 0%, #0369a1 100%);
  border-bottom: 2px solid #F4C400;
  flex-shrink: 0;
}

.img-lightbox__header-left { display: flex; align-items: center; gap: 0.75rem; }

.img-lightbox__icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255,255,255,0.15); color: #F4C400;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; flex-shrink: 0;
}

.img-lightbox__title { font-size: 0.92rem; font-weight: 800; color: #fff; margin: 0; }
.img-lightbox__sub   { font-size: 0.7rem; color: rgba(255,255,255,0.65); margin: 1px 0 0; }

.img-lightbox__close {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(255,255,255,0.15); border: none;
  color: rgba(255,255,255,0.85); font-size: 0.78rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s; flex-shrink: 0;
}
.img-lightbox__close:hover { background: rgba(239,68,68,0.7); color: #fff; }

/* Stage */
.img-lightbox__stage {
  flex: 1; position: relative;
  background: #0C3B5E;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; min-height: 0;
}

.img-lightbox__img {
  display: block;
  width: 100%; height: auto;
  max-height: 62vh;
  object-fit: contain;
}

/* Arrows */
.img-lightbox__arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 42px; height: 42px; border-radius: 50%;
  background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.18s, transform 0.18s;
  z-index: 2;
}
.img-lightbox__arrow:hover { background: #F4C400; color: #0C3B5E; border-color: #F4C400; transform: translateY(-50%) scale(1.08); }
.arrow-left  { left: 0.85rem; }
.arrow-right { right: 0.85rem; }

/* Thumbnail strip */
.img-lightbox__thumbs {
  display: flex; gap: 0.5rem; padding: 0.75rem 1rem;
  background: #f9fafb; border-top: 1px solid #e5e7eb;
  overflow-x: auto; flex-shrink: 0;
}
.img-lightbox__thumbs::-webkit-scrollbar { height: 4px; }
.img-lightbox__thumbs::-webkit-scrollbar-thumb { background: #dbeafe; border-radius: 4px; }

.img-lightbox__thumb {
  width: 64px; height: 48px; object-fit: contain;
  border-radius: 6px; border: 2px solid #e5e7eb;
  cursor: pointer; flex-shrink: 0;
  transition: border-color 0.15s, transform 0.15s;
  background: #0C3B5E;
}
.img-lightbox__thumb:hover { border-color: #0369a1; }
.img-lightbox__thumb.active { border-color: #F4C400; transform: scale(1.06); }

/* ── Modals ─────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(12,59,94,0.55); backdrop-filter: blur(6px);
  z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1rem;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.22s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-box {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 600px; max-height: 90vh; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 50px rgba(12,59,94,0.25);
  animation: dialogIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
}

.swim-modal { max-width: 520px; }

.modal-header {
  display: flex; align-items: center; gap: 0.85rem;
  padding: 1.1rem 1.4rem;
  background: #fff; border-bottom: 2px solid #F4C400; flex-shrink: 0;
}

.swim-header { background: linear-gradient(135deg, #0C3B5E 0%, #0369a1 100%); }

.modal-header-icon {
  width: 36px; height: 36px; border-radius: 9px;
  background: #eff6ff; color: #0369a1;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; flex-shrink: 0;
}

.swim-icon { background: rgba(255,255,255,0.18); color: #F4C400; }

.modal-title { font-size: 1rem; font-weight: 800; color: #0C3B5E; }
.white-title { color: #fff; }
.modal-subtitle { font-size: 0.75rem; color: #6b7280; margin-top: 1px; }
.light-sub { color: rgba(255,255,255,0.7); }

.modal-close-btn {
  margin-left: auto; width: 30px; height: 30px; border-radius: 8px;
  background: #f3f4f6; border: none; color: #6b7280;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.78rem; cursor: pointer; transition: all 0.15s; flex-shrink: 0;
}
.modal-close-btn:hover { background: #fee2e2; color: #ef4444; }
.light-close { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8); }
.light-close:hover { background: rgba(255,255,255,0.25); color: #fff; }

.modal-body { padding: 1.25rem 1.4rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.swim-body  { gap: 0.9rem; }
.modal-actions { display: flex; gap: 0.7rem; margin-top: 0.25rem; }

/* Swimming modal internals */
.swim-summary-strip {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
  background: #eff6ff; border: 1px solid #dbeafe; border-radius: 10px; padding: 0.85rem 1rem;
}
.swim-program-name { font-size: 0.88rem; font-weight: 700; color: #0C3B5E; }
.swim-program-meta { font-size: 0.72rem; color: #6b7280; margin-top: 2px; }
.swim-price-block  { text-align: right; flex-shrink: 0; }
.swim-price-label  { font-size: 0.65rem; color: #6b7280; }
.swim-price        { font-size: 1.1rem; font-weight: 800; color: #0369a1; }

.swim-field { display: flex; flex-direction: column; gap: 0.4rem; }

.swim-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #0C3B5E; }
.req { color: #ef4444; margin-left: 2px; }

.input-wrap { position: relative; }
.fi { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #0369a1; font-size: 0.7rem; pointer-events: none; }

.swim-input {
  width: 100%; padding: 0.58rem 0.85rem 0.58rem 2.2rem;
  border: 1.5px solid #dbeafe; border-radius: 8px;
  font-family: inherit; font-size: 0.85rem;
  background: #f0f7ff; color: #1f2937;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.18s; outline: none;
}
.swim-input:focus { border-color: #0369a1; background: #fff; box-shadow: 0 0 0 3px rgba(3,105,161,0.1); }
.swim-select { appearance: none; cursor: pointer; }

.swim-dates-header { display: flex; align-items: center; justify-content: space-between; }

.session-progress {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: #eff6ff; color: #0369a1;
  padding: 0.18rem 0.65rem; border-radius: 20px;
  font-size: 0.68rem; font-weight: 700;
}
.session-progress.complete { background: #d1fae5; color: #065f46; }

.swim-calendar { background: #fff; border: 1.5px solid #dbeafe; border-radius: 10px; padding: 0.85rem; }

.swim-cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; }

.swim-cal-btn {
  width: 30px; height: 30px; border-radius: 8px;
  background: #f0f7ff; border: 1px solid #dbeafe; color: #0369a1; font-size: 0.72rem;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s;
}
.swim-cal-btn:hover { background: #0369a1; color: #fff; }

.swim-cal-month { font-size: 0.88rem; font-weight: 800; color: #0C3B5E; }

.swim-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 0.5rem; }
.swim-weekdays span { text-align: center; font-size: 0.62rem; font-weight: 700; color: #6b7280; padding: 0.3rem 0; }

.swim-days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }

.swim-day {
  aspect-ratio: 1; border: none; border-radius: 7px;
  background: transparent; font-family: inherit; font-size: 0.8rem;
  cursor: pointer; transition: background 0.15s, color 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.swim-day:hover:not(.disabled):not(.past):not(.other-month) { background: #eff6ff; color: #0369a1; }
.swim-day.selected { background: #0369a1; color: #fff; font-weight: 700; }
.swim-day.selected:hover { background: #0C3B5E; }
.swim-day.other-month, .swim-day.past { color: #d1d5db; cursor: not-allowed; }
.swim-day.disabled:not(.selected) { opacity: 0.4; cursor: not-allowed; }

.selected-dates-list {
  max-height: 150px; overflow-y: auto;
  background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.5rem;
  display: flex; flex-direction: column; gap: 0.4rem;
}
.selected-dates-list::-webkit-scrollbar { width: 4px; }
.selected-dates-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }

.selected-date-row {
  display: flex; align-items: center; gap: 0.55rem;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 7px; padding: 0.45rem 0.7rem;
  transition: background 0.15s;
}
.selected-date-row:hover { background: #eff6ff; border-color: #bfdbfe; }

.sd-num  { width: 20px; height: 20px; border-radius: 50%; background: #0369a1; color: #fff; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sd-icon { color: #0369a1; font-size: 0.72rem; flex-shrink: 0; }
.sd-text { flex: 1; font-size: 0.78rem; color: #1f2937; }
.sd-remove { margin-left: auto; background: none; border: none; color: #d1d5db; font-size: 0.7rem; cursor: pointer; padding: 3px; border-radius: 4px; transition: color 0.15s, background 0.15s; }
.sd-remove:hover { color: #ef4444; background: #fee2e2; }

.swim-date-hint {
  font-size: 0.75rem; color: #9ca3af; font-style: italic;
  background: #f9fafb; border: 1px dashed #e5e7eb; border-radius: 8px;
  padding: 0.7rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}

.swim-price-breakdown {
  background: #eff6ff; border: 1.5px solid #dbeafe; border-radius: 10px; padding: 0.9rem 1rem;
}

.pb-row { display: flex; justify-content: space-between; font-size: 0.82rem; color: #6b7280; padding: 0.3rem 0; }
.pb-row span:last-child { font-weight: 600; color: #1f2937; }
.pb-divider { height: 1px; background: #dbeafe; margin: 0.35rem 0; }
.pb-total { font-size: 0.92rem; font-weight: 700; color: #0C3B5E; padding-top: 0.45rem; }
.pb-total-val { font-size: 1.15rem; font-weight: 800; color: #0369a1; }

/* ── Confirmation wrap ──────────────────────────────────────── */
.confirmation-wrap { padding: 1.25rem; }

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 640px) {
  .main-layout    { padding: 0.85rem; gap: 0.85rem; }
  .search-section { padding: 0.75rem; }
  .category-tabs  { gap: 0.35rem; }
  .cat-tab        { padding: 0.38rem 0.7rem; font-size: 0.72rem; }
  .modal-body     { padding: 1rem; }
}
</style>