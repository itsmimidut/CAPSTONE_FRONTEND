<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center border-b">
        <div>
          <h3 class="text-2xl font-bold"><i :class="['mr-2', isCottage ? 'fas fa-home' : 'fas fa-bed']"></i>{{ itemName }}</h3>
          <p class="text-blue-100 text-sm mt-1">₱{{ itemPrice.toLocaleString() }} {{ isCottage ? 'per day-use' : 'per night' }}</p>
        </div>
        <button @click="closeModal" class="text-2xl hover:bg-blue-600 p-2 rounded transition-colors">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Form Content -->
      <div class="p-6 space-y-6">
        <!-- Guest Information -->
        <div class="border rounded-lg p-4 bg-gray-50">
          <h4 class="font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-user mr-2 text-blue-600"></i>Guest Information
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">First Name *</label>
              <input 
                v-model="form.firstName" 
                type="text" 
                class="w-full border rounded px-3 py-2 focus:border-blue-600 focus:outline-none"
                placeholder="John"
              >
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">Last Name *</label>
              <input 
                v-model="form.lastName" 
                type="text" 
                class="w-full border rounded px-3 py-2 focus:border-blue-600 focus:outline-none"
                placeholder="Doe"
              >
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">Phone</label>
              <input 
                v-model="form.phone" 
                type="tel" 
                class="w-full border rounded px-3 py-2 focus:border-blue-600 focus:outline-none"
                placeholder="09123456789"
              >
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">Email</label>
              <input 
                v-model="form.email" 
                type="email" 
                class="w-full border rounded px-3 py-2 focus:border-blue-600 focus:outline-none"
                placeholder="guest@example.com"
              >
            </div>
          </div>
        </div>

        <!-- Guest Count -->
        <div class="border rounded-lg p-4 bg-gray-50">
          <h4 class="font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-users mr-2 text-blue-600"></i>Guest Count
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-3 block">Adults *</label>
              <div class="flex items-center gap-3">
                <button 
                  @click="decrementAdults" 
                  class="w-10 h-10 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <span class="text-2xl font-bold text-gray-800 w-8 text-center">{{ form.adults }}</span>
                <button 
                  @click="incrementAdults" 
                  class="w-10 h-10 rounded-full border-2 border-blue-600 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-3 block">Children</label>
              <div class="flex items-center gap-3">
                <button 
                  @click="decrementChildren" 
                  class="w-10 h-10 rounded-full border-2 border-green-600 text-green-600 flex items-center justify-center hover:bg-green-50 transition-colors"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <span class="text-2xl font-bold text-gray-800 w-8 text-center">{{ form.children }}</span>
                <button 
                  @click="incrementChildren" 
                  class="w-10 h-10 rounded-full border-2 border-green-600 text-green-600 flex items-center justify-center hover:bg-green-50 transition-colors"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Date Selection -->
        <div class="border rounded-lg p-4 bg-gray-50">
          <h4 class="font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-calendar mr-2 text-blue-600"></i>Duration
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">Check-in Date *</label>
              <input 
                v-model="form.checkIn" 
                type="date" 
                class="w-full border rounded px-3 py-2 focus:border-blue-600 focus:outline-none"
                :min="minDate"
              >
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">Check-out Date *</label>
              <input 
                v-model="form.checkOut" 
                type="date" 
                class="w-full border rounded px-3 py-2 focus:border-blue-600 focus:outline-none"
                :min="checkOutMinDate"
              >
            </div>
          </div>
          <div v-if="durationCount > 0" class="mt-3 p-3 bg-blue-50 rounded border border-blue-200 text-sm">
            <i class="fas fa-info-circle text-blue-600 mr-2"></i>
            <span class="font-semibold text-blue-700">{{ durationCount }} {{ isCottage ? `Day${durationCount > 1 ? 's' : ''}` : `Night${durationCount > 1 ? 's' : ''}` }} • Total: ₱{{ lineTotal.toLocaleString() }}</span>
          </div>
          <div v-if="form.checkIn && form.checkOut && !isDateRangeValid" class="mt-3 p-3 bg-red-50 rounded border border-red-200 text-sm text-red-700">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            {{ isCottage ? 'For cottages, check-out cannot be earlier than check-in.' : 'For rooms, check-out must be later than check-in.' }}
          </div>
        </div>

        <!-- Special Requests -->
        <div class="border rounded-lg p-4 bg-gray-50">
          <h4 class="font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-sticky-note mr-2 text-blue-600"></i>Special Requests
          </h4>
          <textarea 
            v-model="form.specialRequests" 
            class="w-full border rounded px-3 py-2 focus:border-blue-600 focus:outline-none text-sm"
            placeholder="Any special requests? (e.g., high floor, quiet room, etc.)"
            rows="3"
          ></textarea>
        </div>

        <!-- Price Summary -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-700">Price per night:</span>
              <span class="font-semibold">₱{{ itemPrice.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-700">{{ durationCount }} {{ isCottage ? `day${durationCount > 1 ? 's' : ''}` : `night${durationCount > 1 ? 's' : ''}` }}:</span>
              <span class="font-semibold">₱{{ (itemPrice * durationCount).toLocaleString() }}</span>
            </div>
            <div class="border-t border-blue-300 pt-2 flex justify-between text-lg">
              <span class="font-bold text-gray-800">Total:</span>
              <span class="font-bold text-blue-600">₱{{ lineTotal.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="sticky bottom-0 bg-gray-100 p-6 flex gap-3 justify-end border-t">
        <button 
          @click="closeModal" 
          class="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
        >
          <i class="fas fa-times mr-2"></i>Cancel
        </button>
        <button 
          @click="confirmBooking" 
          :disabled="!isFormValid"
          class="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <i class="fas fa-check-circle mr-2"></i>Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'POSRoomBookingModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    itemPrice: {
      type: Number,
      required: true
    },
    itemCategory: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        adults: 2,
        children: 0,
        checkIn: '',
        checkOut: '',
        specialRequests: ''
      }
    };
  },
  computed: {
    isCottage() {
      return String(this.itemCategory || '').toLowerCase() === 'cottage';
    },
    minDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    checkOutMinDate() {
      if (!this.form.checkIn) return this.minDate;
      if (this.isCottage) return this.form.checkIn;

      const date = new Date(this.form.checkIn);
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    },
    durationCount() {
      if (!this.form.checkIn || !this.form.checkOut) return 0;
      const checkIn = new Date(this.form.checkIn);
      const checkOut = new Date(this.form.checkOut);
      const diffTime = checkOut - checkIn;

      if (diffTime < 0) return 0;

      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return this.isCottage ? diffDays + 1 : diffDays;
    },
    isDateRangeValid() {
      if (!this.form.checkIn || !this.form.checkOut) return false;
      const checkIn = new Date(this.form.checkIn);
      const checkOut = new Date(this.form.checkOut);
      return this.isCottage ? checkOut >= checkIn : checkOut > checkIn;
    },
    lineTotal() {
      return this.itemPrice * this.durationCount;
    },
    isFormValid() {
      return (
        this.form.firstName.trim() &&
        this.form.lastName.trim() &&
        this.form.checkIn &&
        this.form.checkOut &&
        this.isDateRangeValid &&
        this.durationCount > 0 &&
        this.form.adults > 0
      );
    }
  },
  methods: {
    incrementAdults() {
      this.form.adults++;
    },
    decrementAdults() {
      if (this.form.adults > 1) {
        this.form.adults--;
      }
    },
    incrementChildren() {
      this.form.children++;
    },
    decrementChildren() {
      if (this.form.children > 0) {
        this.form.children--;
      }
    },
    confirmBooking() {
      if (!this.isFormValid) return;
      
      this.$emit('confirm', {
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        phone: this.form.phone,
        email: this.form.email,
        adults: this.form.adults,
        children: this.form.children,
        checkIn: this.form.checkIn,
        checkOut: this.form.checkOut,
        specialRequests: this.form.specialRequests,
        nights: this.durationCount,
        lineTotal: this.lineTotal
      });
      
      this.resetForm();
      this.closeModal();
    },
    resetForm() {
      this.form = {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        adults: 2,
        children: 0,
        checkIn: '',
        checkOut: '',
        specialRequests: ''
      };
    },
    closeModal() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
input:disabled,
textarea:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

input[type="date"] {
  background-color: white;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(0.8);
}
</style>
