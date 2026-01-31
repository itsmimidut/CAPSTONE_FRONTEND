<template>
  <div class="section-card reveal">
    <h2 class="text-lg font-bold text-text-dark mb-3 flex items-center gap-2">
      <i class="fas fa-address-book text-primary-blue text-lg"></i>
      Contact & Billing
    </h2>

    <!-- Phone & Email -->
    <div class="mobile-grid grid-cols-1">
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1.5">Phone Number *</label>
        <div class="flex gap-2">
          <span class="flex items-center justify-center w-16 bg-gray-100 rounded-l-xl border border-r-0 border-gray-300 text-sm font-medium">
            +63
          </span>
          <input
            type="tel"
            :value="phone"
            @input="$emit('update:phone', $event.target.value)"
            class="form-input rounded-l-none flex-1"
            placeholder="912 345 6789"
            maxlength="10"
          />
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1.5">Email *</label>
        <input
          type="email"
          :value="email"
          @input="$emit('update:email', $event.target.value)"
          class="form-input"
          placeholder="juan@example.com"
        />
      </div>
    </div>

    <!-- Address & City -->
    <div class="mt-4 mobile-grid grid-cols-1">
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1.5">Street Address *</label>
        <input
          type="text"
          :value="address"
          @input="$emit('update:address', $event.target.value)"
          class="form-input"
          placeholder="123 Resort St."
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1.5">City *</label>
        <input
          type="text"
          :value="city"
          @input="$emit('update:city', $event.target.value)"
          class="form-input"
          placeholder="Calapan"
        />
      </div>
    </div>

    <!-- Country & Postal -->
    <div class="mt-4 mobile-grid grid-cols-1 sm:grid-cols-2">
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1.5">Country *</label>
        <select
          :value="country"
          @change="$emit('update:country', $event.target.value)"
          class="form-input text-sm"
        >
          <option>Philippines</option>
          <option>United States</option>
          <option>Singapore</option>
          <option>Japan</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1.5">Postal Code *</label>
        <input
          type="text"
          :value="postal"
          @input="$emit('update:postal', $event.target.value)"
          class="form-input"
          placeholder="5200"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  phone: String,
  email: String,
  address: String,
  city: String,
  country: String,
  postal: String
})

defineEmits([
  'update:phone',
  'update:email',
  'update:address',
  'update:city',
  'update:country',
  'update:postal'
])
</script>

<style scoped>
@import '../assets/booking-styles.css';
</style>