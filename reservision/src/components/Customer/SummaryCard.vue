<template>
  <div class="bg-white rounded-xl shadow-sm p-6 border">
    <h3 class="text-gray-800 font-semibold text-lg">{{ title }}</h3>
    <p class="text-emerald-600 text-2xl font-bold mt-3">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});
</script>
