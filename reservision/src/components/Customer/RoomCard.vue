<template>
  <div class="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
    <img :src="imageUrl" :alt="title" class="w-full h-40 object-cover" />
    <div class="p-4">
      <div class="flex items-start justify-between gap-3">
        <h4 class="text-lg font-semibold text-gray-800">{{ title }}</h4>
        <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Recommended</span>
      </div>
      <p class="text-gray-500 text-sm mt-2 mb-4">{{ price }}</p>
      <button :class="['text-white px-4 py-2 rounded-lg text-sm', buttonClass]">
        {{ buttonLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  buttonLabel: {
    type: String,
    default: 'Book Now',
  },
  buttonClass: {
    type: String,
    default: 'bg-blue-600 hover:bg-blue-700',
  },
});
</script>
