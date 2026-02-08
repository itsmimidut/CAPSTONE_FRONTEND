<template>
  <div :class="['rounded-xl shadow-sm p-6 border', toneClasses.container]">
    <div class="flex items-center gap-2 text-sm text-gray-600">
      <span :class="['h-2 w-2 rounded-full', toneClasses.dot]"></span>
      <span class="font-medium">{{ title }}</span>
    </div>
    <p :class="['text-2xl font-bold mt-4', toneClasses.value]">{{ value }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: 'blue',
  },
});

const toneClasses = computed(() => {
  const palette = {
    blue: { container: 'bg-blue-50/70 border-blue-200', value: 'text-blue-700', dot: 'bg-blue-500' },
    red: { container: 'bg-red-50/70 border-red-200', value: 'text-red-600', dot: 'bg-red-500' },
    orange: { container: 'bg-orange-50/70 border-orange-200', value: 'text-orange-600', dot: 'bg-orange-500' },
    yellow: { container: 'bg-yellow-50/70 border-yellow-200', value: 'text-yellow-700', dot: 'bg-yellow-400' },
    green: { container: 'bg-green-50/70 border-green-200', value: 'text-green-700', dot: 'bg-green-500' },
  };

  return palette[props.tone] || palette.blue;
});
</script>
