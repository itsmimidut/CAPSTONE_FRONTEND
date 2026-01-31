<!-- components/GuestsModal.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    @click="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border-2 border-gray-200"
      @click.stop
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-gray-900">Guests</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-900 text-xl font-bold">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Guest Controls -->
      <div class="space-y-6 mb-6">
        <!-- Adults -->
        <div class="flex justify-between items-center">
          <div>
            <p class="font-bold text-gray-900">Adults</p>
            <p class="text-xs text-gray-500">Age 13+</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="$emit('change-adults', -1)"
              :disabled="adults <= 1"
              class="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg text-blue-700 transition flex items-center justify-center"
            >
              <i class="fas fa-minus text-xs"></i>
            </button>
            <span class="w-6 text-center font-bold text-lg text-gray-900">{{ adults }}</span>
            <button
              @click="$emit('change-adults', 1)"
              class="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-700 hover:bg-blue-50 font-bold text-lg text-blue-700 transition flex items-center justify-center"
            >
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Children -->
        <div class="flex justify-between items-center">
          <div>
            <p class="font-bold text-gray-900">Children</p>
            <p class="text-xs text-gray-500">Age 2–12</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="$emit('change-children', -1)"
              :disabled="children <= 0"
              class="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg text-blue-700 transition flex items-center justify-center"
            >
              <i class="fas fa-minus text-xs"></i>
            </button>
            <span class="w-6 text-center font-bold text-lg text-gray-900">{{ children }}</span>
            <button
              @click="$emit('change-children', 1)"
              class="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-blue-700 hover:bg-blue-50 font-bold text-lg text-blue-700 transition flex items-center justify-center"
            >
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Apply Button -->
      <button
        @click="$emit('close')"
        class="w-full py-2.5 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition shadow-md"
      >
        Apply
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuestsModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    adults: {
      type: Number,
      required: true
    },
    children: {
      type: Number,
      required: true
    }
  },
  emits: ['close', 'change-adults', 'change-children']
}
</script>