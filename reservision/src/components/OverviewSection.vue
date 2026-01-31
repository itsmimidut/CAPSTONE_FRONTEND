<template>
  <section class="py-12 bg-neutral-gray text-center">
    <h2 class="text-3xl font-bold mb-4 gradient-border section-head-center">Experience ReserVision</h2>
    <p class="text-gray-700 max-w-2xl mx-auto mb-10 px-4">
      Eduardo's Resort blends refined design and family-first recreation — elegant spaces, playful attractions, 
      and smooth digital booking for your perfect getaway.
    </p>
    <div class="px-12 flex flex-row justify-center gap-20">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="text-center transform hover:-translate-y-1 transition-transform duration-300"
      >
        <div class="text-3xl font-bold text-primary-blue">{{ stat.value }}</div>
        <p class="text-gray-600 text-sm">{{ stat.label }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const stats = [
  { value: '10+', label: 'Attractions & Activities' },
  { value: '50+', label: 'Luxury Rooms & Villas' },
  { value: '24/7', label: 'Smart Assistance' }
]
</script>

<style scoped>
.gradient-border {
  position: relative;
}
.gradient-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #2B6CB0, #C19A6B);
  border-radius: 3px;
}
.section-head-center::after {
  left: 50%;
  transform: translateX(-50%);
}
</style>