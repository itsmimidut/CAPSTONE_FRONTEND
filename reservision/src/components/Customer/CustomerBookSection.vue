<template>
  <section>
    <h2 class="text-3xl font-semibold text-gray-800 mb-2">Book a Room</h2>
    <p class="text-gray-500 mb-6">Select from our available room types below.</p>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <RoomCard
        v-for="room in rooms"
        :key="room.title"
        :title="room.title"
        :price="room.price"
        :image-url="room.imageUrl"
      />
    </div>
  </section>
</template>

<script setup>
import RoomCard from './RoomCard.vue';

defineProps({
  rooms: {
    type: Array,
    default: () => [],
  },
});
</script>
