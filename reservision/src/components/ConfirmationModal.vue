<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <i class="fas fa-check text-3xl text-green-600"></i>
      </div>

      <h3 class="text-xl font-bold text-text-dark mb-2">Payment Confirmed!</h3>

      <p class="text-sm text-text-muted mb-5">
        Your booking is secured. A confirmation email has been sent to
        <span class="font-medium text-text-dark">{{ email }}</span>.
      </p>

      <div v-if="bookingId" class="mb-5 p-3 bg-blue-50 rounded-lg">
        <div class="text-xs text-text-muted mb-1">Booking ID</div>
        <div class="text-lg font-bold text-primary-blue">{{ bookingId }}</div>
      </div>

      <div class="space-y-2">
        <a
          href="/"
          class="block w-full py-2.5 border border-primary-blue text-primary-blue rounded-lg font-medium text-sm hover:bg-blue-50 transition"
        >
          Back to Home
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  email: {
    type: String,
    required: true
  },
  bookingId: String
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 20rem;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(2, 8, 20, 0.12);
  text-align: center;
  animation: slideUp 0.4s ease;
}

@media (min-width: 640px) {
  .modal-content {
    padding: 2rem;
    max-width: 24rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>