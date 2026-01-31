<!-- components/ViewMoreModal.vue -->
<template>
  <div
    v-if="isOpen && item"
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    @click="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200"
      @click.stop
    >
      <!-- Sticky Header -->
      <div class="sticky top-0 bg-white flex justify-between items-center p-6 border-b-2 border-gray-200">
        <h3 class="text-2xl font-bold text-gray-900">{{ item.name }}</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-900 text-xl font-bold">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4">
        <!-- Description -->
        <p class="text-sm text-gray-600 mb-4">{{ item.desc }}</p>

        <!-- Amenities -->
        <div class="space-y-2">
          <div v-for="amenity in item.amenities" :key="amenity" class="flex items-center gap-2 text-sm">
            <i class="fas fa-check text-blue-700 font-bold text-xs"></i>
            <span class="text-gray-700">{{ amenity }}</span>
          </div>
        </div>

        <!-- Images Grid -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <img
            v-for="(img, idx) in item.imgs"
            :key="idx"
            :src="img"
            :alt="`${item.name} - View ${idx + 1}`"
            class="w-full h-32 object-cover rounded-lg shadow-sm"
          />
        </div>

        <!-- Details -->
        <div class="mt-6 grid grid-cols-2 gap-4">
          <div class="text-center">
            <p class="text-gray-600 text-sm font-bold uppercase tracking-wider">Max Guests</p>
            <p class="text-2xl font-bold text-blue-700 mt-2">{{ item.maxGuests }}</p>
          </div>
          <div class="text-center">
            <p class="text-gray-600 text-sm font-bold uppercase tracking-wider">Price</p>
            <div class="text-2xl font-bold text-amber-700 mt-2">₱{{ item.price.toLocaleString() }}</div>
            <p v-if="item.perNight" class="text-xs text-gray-600">per night</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewMoreModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    item: {
      type: Object,
      default: null
    }
  },
  emits: ['close']
}
</script>