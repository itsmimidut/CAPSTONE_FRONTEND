<template>
  <div class="section-card reveal">
    <h2 class="text-lg font-bold text-text-dark mb-3">Payment Method</h2>

    <!-- Payment Options -->
    <div class="space-y-2.5">
      <div
        v-for="method in paymentMethods"
        :key="method.id"
        @click="$emit('update:selectedMethod', method.id)"
        class="payment-option"
        :class="{ selected: selectedMethod === method.id }"
      >
        <div class="flex items-center">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
            :class="method.bgClass"
          >
            <i :class="method.icon + ' text-lg'"></i>
          </div>
          <div class="flex-1">
            <div class="font-medium text-text-dark text-sm">{{ method.name }}</div>
            <div class="text-xs text-text-muted">{{ method.type }}</div>
          </div>
        </div>
        <i class="fas fa-check-circle text-primary-blue text-lg check-icon"></i>
      </div>
    </div>

    <!-- Terms & Conditions -->
    <div class="mt-4 flex items-start">
      <input
        type="checkbox"
        :checked="termsAccepted"
        @change="$emit('update:termsAccepted', $event.target.checked)"
        class="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue mt-0.5 mr-2"
      />
      <label class="text-xs text-text-muted leading-tight">
        I agree to the
        <a href="#" class="text-primary-blue hover:underline font-medium">Terms & Conditions</a>
      </label>
    </div>

    <!-- Pay Button -->
    <button
      @click="$emit('pay')"
      :disabled="isProcessing"
      class="btn-primary mt-4 text-sm"
      :class="{ 'btn-loading': isProcessing }"
    >
      <span class="btn-text">
        <i class="fas fa-lock"></i> Pay Now & Confirm
      </span>
    </button>

    <!-- Cancellation Policy -->
    <div class="text-center mt-3 text-xs text-text-muted">
      <i class="fas fa-undo-alt mr-1"></i> Free cancellation until 24 hrs before
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedMethod: String,
  termsAccepted: Boolean,
  isProcessing: Boolean
})

defineEmits(['update:selectedMethod', 'update:termsAccepted', 'pay'])

const paymentMethods = [
  {
    id: 'paymaya',
    name: 'PayMaya',
    type: 'E-wallet',
    icon: 'fas fa-mobile-alt text-green-600',
    bgClass: 'bg-green-50'
  },
  {
    id: 'gcash',
    name: 'GCash',
    type: 'E-wallet',
    icon: 'fas fa-wallet text-green-600',
    bgClass: 'bg-green-50'
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    type: 'BDO, BPI, etc.',
    icon: 'fas fa-university text-blue-600',
    bgClass: 'bg-blue-50'
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    type: 'Visa, Mastercard',
    icon: 'fas fa-credit-card text-purple-600',
    bgClass: 'bg-purple-50'
  }
]
</script>

<style scoped>
@import '../assets/booking-styles.css';
</style>