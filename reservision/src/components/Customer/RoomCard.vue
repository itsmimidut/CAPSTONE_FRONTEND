<template>
  <div class="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
    <img :src="imageUrl" :alt="title" class="w-full h-40 object-cover" />
    <div class="p-4">
      <h4 class="text-lg font-semibold text-gray-800">{{ title }}</h4>
      <p class="text-gray-500 text-sm mb-3">{{ price }}</p>
      <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm">
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
});
</script>
