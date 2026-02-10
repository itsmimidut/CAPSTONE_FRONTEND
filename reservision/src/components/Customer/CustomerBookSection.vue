<template>
  <CustomerBookingConfirmation @view-reservations="$emit('view-reservations')" />
</template>

<script setup>
import CustomerBookingConfirmation from './CustomerBookingConfirmation.vue';

defineEmits(['view-reservations']);
</script>
