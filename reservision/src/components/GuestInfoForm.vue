<template>
  <div class="section-card reveal">
    <h2 class="text-lg font-bold text-text-dark mb-3 flex items-center gap-2">
      <i class="fas fa-user-circle text-primary-blue text-lg"></i>
      Guest Information
    </h2>

    <!-- Name Fields -->
    <div class="mobile-grid grid-cols-1 sm:grid-cols-2">
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1.5">First Name *</label>
        <input
          type="text"
          :value="firstName"
          @input="$emit('update:firstName', $event.target.value)"
          class="form-input"
          placeholder="Juan"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1.5">Last Name *</label>
        <input
          type="text"
          :value="lastName"
          @input="$emit('update:lastName', $event.target.value)"
          class="form-input"
          placeholder="Dela Cruz"
        />
      </div>
    </div>

    <!-- Counters & Time -->
    <div class="mt-4 grid grid-cols-3 gap-3 text-center">
      <!-- Adults -->
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1.5">Adults</label>
        <div class="flex items-center justify-center gap-2 bg-neutral-gray rounded-xl p-2">
          <button
            @click="$emit('update:adults', Math.max(1, adults - 1))"
            class="counter-btn"
            type="button"
          >
            <i class="fas fa-minus"></i>
          </button>
          <span class="font-semibold text-sm w-6">{{ adults }}</span>
          <button
            @click="$emit('update:adults', adults + 1)"
            class="counter-btn"
            type="button"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>

      <!-- Children -->
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1.5">Children</label>
        <div class="flex items-center justify-center gap-2 bg-neutral-gray rounded-xl p-2">
          <button
            @click="$emit('update:children', Math.max(0, children - 1))"
            class="counter-btn"
            type="button"
          >
            <i class="fas fa-minus"></i>
          </button>
          <span class="font-semibold text-sm w-6">{{ children }}</span>
          <button
            @click="$emit('update:children', children + 1)"
            class="counter-btn"
            type="button"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>

      <!-- Arrival Time -->
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1.5">Arrival</label>
        <select
          :value="arrivalTime"
          @change="$emit('update:arrivalTime', $event.target.value)"
          class="form-input text-sm"
        >
          <option>2 PM</option>
          <option>3 PM</option>
          <option>4 PM</option>
          <option>5 PM</option>
        </select>
      </div>
    </div>

    <!-- Special Requests -->
    <div class="mt-4">
      <label class="block text-xs font-medium text-text-muted mb-1.5">Special Requests</label>
      <textarea
        :value="specialRequests"
        @input="$emit('update:specialRequests', $event.target.value)"
        class="form-input h-20 text-sm"
        placeholder="Late check-in, dietary needs..."
      ></textarea>
    </div>
  </div>
</template>

<script setup>
defineProps({
  firstName: String,
  lastName: String,
  adults: Number,
  children: Number,
  arrivalTime: String,
  specialRequests: String
})

defineEmits([
  'update:firstName',
  'update:lastName',
  'update:adults',
  'update:children',
  'update:arrivalTime',
  'update:specialRequests'
])
</script>

<style scoped>
@import '../assets/booking-styles.css';
</style>