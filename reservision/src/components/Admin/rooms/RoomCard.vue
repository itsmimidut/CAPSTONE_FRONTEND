<template>
  <div class="room-card" :data-id="room.id">
    <div class="room-image" :style="{ backgroundImage: `url(${roomImage})` }">
      <div v-if="room.status === 'Under Maintenance'" class="room-promo bg-warning">MAINTENANCE</div>
      <div v-if="seasonalPrice !== room.price" class="room-promo bg-success">SEASONAL</div>
      <div v-if="room.promo" class="room-promo">Limited Offer</div>
    </div>
    <div class="room-details">
      <div class="room-header flex justify-between">
        <div>
          <div class="room-title">{{ room.name }}</div>
          <div class="room-type capitalize text-sm">{{ room.category }}</div>
          <div v-if="room.room_number" class="text-xs text-gray-500 mt-1">#{{ room.room_number }}</div>
        </div>
        <div class="room-price text-right">
          <div class="text-xl font-bold">${{ seasonalPrice }}</div>
          <div v-if="seasonalPrice !== room.price" class="text-sm text-gray-500 line-through">${{ room.price }}</div>
          <span v-else class="text-sm text-gray-500">/night</span>
        </div>
      </div>

      <p class="text-gray-600 text-sm mt-2">{{ room.description }}</p>
      <div class="room-features text-sm text-gray-600 mt-3 flex gap-4">
        <span><i class="fas fa-user-friends"></i> {{ room.max_guests }} Guests</span>
        <span><i class="fas fa-image"></i> {{ room.images.length }} Photos</span>
        <span>
          <i class="fas fa-circle" :class="statusColor"></i> {{ room.status }}
        </span>
      </div>

      <div class="room-actions mt-4 flex gap-2">
        <button class="btn btn-sm btn-outline" @click="$emit('edit-room', room)">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-sm btn-outline">
          <i class="fas fa-images"></i> Images
        </button>
        <button class="btn btn-sm btn-danger" @click="$emit('delete-room', room)">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  room: Object,
  seasonalPricing: Array
})

const seasonalPrice = computed(() => {
  const now = new Date()
  const season = props.seasonalPricing.find(s => {
    const start = new Date(s.startDate)
    const end = new Date(s.endDate)
    const applies = s.applyTo === 'all' || s.applyTo.split(',').map(r => r.trim()).includes(props.room.category.toLowerCase())
    return now >= start && now <= end && applies
  })
  return season ? Math.round(props.room.price * season.multiplier) : props.room.price
})

const roomImage = computed(() => props.room.images[props.room.primaryImageIndex || 0] || 'https://via.placeholder.com/600x400?text=No+Image')

const statusColor = computed(() => {
  return props.room.status === 'Available'
    ? 'text-green-500'
    : props.room.status === 'Occupied'
      ? 'text-red-500'
      : 'text-orange-500'
})
</script>

<style scoped>
/* copy your previous .room-card, .room-image, etc styles */
</style>
