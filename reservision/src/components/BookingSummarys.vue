<!-- components/BookingSummary.vue -->
<template>
  <div class="bg-white rounded-2xl shadow-md border-2 border-blue-100 p-6 sticky top-24">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-gray-900">Your Reservation</h3>
      <button
        @click="$emit('clear')"
        class="text-gray-500 hover:text-red-600 transition font-bold text-xl"
      >
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>

    <!-- Stay Duration -->
    <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-4">
      <div class="flex justify-between items-center">
        <span class="font-bold text-blue-900">Stay Duration</span>
        <span class="text-lg font-bold text-blue-700">
          {{ nights ? `${nights} night${nights > 1 ? 's' : ''}` : '—' }}
        </span>
      </div>
      <div class="text-xs text-blue-600 mt-1">
        {{ checkInOutStr }}
      </div>
    </div>

    <!-- Booking Items or Empty -->
    <template v-if="booking.length === 0">
      <div class="bg-gray-50 rounded-lg p-4 mb-4 text-center text-gray-500">
        <i class="fas fa-bed text-2xl mb-2 block"></i>
        <div class="text-sm">No items selected</div>
      </div>
    </template>

    <template v-else>
      <div class="space-y-3 mb-4">
        <div
          v-for="b in booking"
          :key="b.item.id"
          class="bg-gray-50 p-3 rounded-lg border-2 border-gray-200 flex justify-between items-start gap-2"
        >
          <div class="flex-1 min-w-0">
            <div class="font-bold text-blue-700 text-sm">{{ b.item.name }}</div>
            <div class="text-xs text-gray-500 mt-1">
              × {{ b.qty }} {{ b.item.perNight && nights ? `× ${nights} night${nights > 1 ? 's' : ''}` : '' }}
              • {{ b.guests }} guest{{ b.guests > 1 ? 's' : '' }}
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <div class="font-bold text-amber-700 text-sm">₱{{ calculateLineTotal(b).toLocaleString() }}</div>
            <button
              @click="$emit('remove', b.item.id)"
              class="text-red-600 hover:text-red-800 text-xs font-bold mt-1 transition"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Pricing -->
    <div class="border-t-2 border-gray-200 pt-2">
      <div class="flex justify-between text-sm mb-1">
        <span class="text-gray-600 font-semibold">Subtotal</span>
        <span class="font-bold text-gray-900">₱{{ total.toLocaleString() }}</span>
      </div>
      <div class="flex justify-between text-xs mb-9">
        <span class="text-gray-600">Taxes & fees</span>
        <span class="text-gray-600">Included</span>
      </div>

      <div class="border-t-2 border-gray-200 pt-2">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-bold">Total</span>
          <span class="text-2xl font-bold text-blue-700">
            ₱{{ total.toLocaleString() }}
          </span>
        </div>
        <button
          :disabled="booking.length === 0 || !checkIn || !checkOut"
          class="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-400 text-white rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookingSummary',
  props: {
    booking: {
      type: Array,
      required: true
    },
    nights: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    checkIn: {
      type: Date,
      default: null
    },
    checkOut: {
      type: Date,
      default: null
    }
  },
  emits: ['remove', 'clear'],
  computed: {
    checkInOutStr() {
      if (this.checkIn && this.checkOut) {
        const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        return `${fmt(this.checkIn)} – ${this.checkOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
      }
      return 'Select check-in & check-out'
    }
  },
  methods: {
    calculateLineTotal(b) {
      const isNight = b.item.perNight
      const base = b.item.price * b.qty
      return isNight && this.nights ? base * this.nights : base
    }
  }
}
</script>