<template>
  <div class="section-card reveal">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-lg font-bold text-text-dark">Booking Summary</h2>
      <a
        href="/reservation"
        class="text-primary-blue text-xs font-medium flex items-center gap-1 hover:underline"
      >
        <i class="fas fa-edit"></i> Edit
      </a>
    </div>

    <!-- Items -->
    <div class="space-y-2 text-sm">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="flex justify-between items-start p-2 bg-blue-50 rounded-lg text-xs"
      >
        <div class="flex-1">
          <div class="font-medium">{{ item.item.name }}</div>
          <div class="text-text-muted text-xs">
            ×{{ item.qty }} • {{ item.guests }} Guest{{ item.guests > 1 ? 's' : '' }}
            <span v-if="item.item.perNight && nights > 0">
              • {{ nights }} night{{ nights > 1 ? 's' : '' }}
            </span>
          </div>
        </div>
        <div class="text-right ml-2">
          <div class="font-medium">₱{{ getLineTotal(item).toLocaleString() }}</div>
          <div v-if="item.item.perNight" class="text-text-muted text-xs">
            ₱{{ item.item.price.toLocaleString() }}/night
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="text-center py-8 text-gray-400">
      <i class="fas fa-inbox text-3xl mb-2"></i>
      <p class="text-sm">No items in booking</p>
    </div>

    <!-- Totals -->
    <div class="border-t pt-3 mt-4 space-y-1.5 text-sm">
      <div class="flex justify-between">
        <span class="text-text-muted">Subtotal</span>
        <span>₱{{ subtotal.toLocaleString() }}</span>
      </div>
      <div class="flex justify-between text-xs">
        <span class="text-text-muted">Taxes & Fees</span>
        <span>Included</span>
      </div>
      <div class="border-t pt-2 flex justify-between items-center">
        <span class="font-bold text-base">Total</span>
        <span class="text-xl font-bold text-primary-blue">₱{{ total.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  checkIn: {
    type: Date,
    default: null
  },
  checkOut: {
    type: Date,
    default: null
  },
  subtotal: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  }
})

// ✅ Compute number of nights
const nights = computed(() => {
  if (!props.checkIn || !props.checkOut) return 0
  const diff = props.checkOut - props.checkIn
  return Math.ceil(diff / 86400000) // Convert milliseconds to days
})

// ✅ Calculate line total
const getLineTotal = (item) => {
  const n = item.item.perNight && nights.value > 0 ? nights.value : 1
  return item.item.price * item.qty * n
}
</script>

<style src="../assets/booking-styles.css"></style>
