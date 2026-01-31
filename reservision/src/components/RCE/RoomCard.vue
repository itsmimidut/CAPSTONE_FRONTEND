<!-- src/components/RoomCard.vue -->
<template>
  <div class="room-card" :data-id="room.item_id || room.id">
    <!-- Room/Event Image with badges overlay -->
    <div class="room-image" :style="{ backgroundImage: `url('${primaryImage}')` }">
      <div class="room-badges">
        <span v-if="isEvent && room.status === 'Cancelled'" class="room-badge maintenance">Cancelled</span>
        <span v-else-if="!isEvent && room.status === 'Under Maintenance'" class="room-badge maintenance">Maintenance</span>
        <span v-if="hasSeasonalPricing && !isEvent" class="room-badge seasonal">Seasonal</span>
        <span v-if="room.promo && !isEvent" class="room-badge promo">Limited Offer</span>
        <span v-if="isEvent" class="room-badge event-badge">{{ room.category || 'Event' }}</span>
      </div>
    </div>

    <div class="room-details">
      <div class="room-header">
        <div>
          <div class="room-title">{{ room.name }}</div>
          <div class="room-type">{{ room.category }}</div>
          <div v-if="!isEvent && room.room_number" class="text-xs text-gray-500 mt-1">#{{ room.room_number }}</div>
          <div v-if="isEvent && room.room_number" class="text-xs text-gray-500 mt-1">📍 {{ room.room_number }}</div>
        </div>
        <div class="room-price">
          <div class="current">₱{{ displayPrice }}</div>
          <div v-if="hasSeasonalPricing && !isEvent" class="old">₱{{ room.price }}</div>
          <div v-else class="text-sm text-gray-500">{{ isEvent ? 'per event' : 'per night' }}</div>
        </div>
      </div>

      <p class="room-description">{{ room.description }}</p>

      <!-- First Row: Guests/Capacity, Photos, Status -->
      <div class="room-meta-row">
        <span v-if="!isEvent"><i class="fas fa-user-friends"></i> {{ room.max_guests }} Guests</span>
        <span v-if="isEvent && room.max_guests"><i class="fas fa-user-friends"></i> {{ room.max_guests }} Capacity</span>
        <span><i class="fas fa-image"></i> {{ room.images?.length || 0 }} Photos</span>
        <span>
          <span :class="statusClass" class="status-dot"></span>
          {{ room.status }}
        </span>
      </div>

      <!-- Second Row: Edit, Images, Delete Buttons -->
      <div class="room-actions">
        <button class="btn btn-outline" @click="$emit('edit')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-danger" @click="$emit('delete')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  room: { type: Object, required: true }
})

const emit = defineEmits(['edit', 'delete'])

const BACKEND_URL = 'http://localhost:8000'

// Determine if this is an event card based on category_type
const isEvent = computed(() => {
  return props.room.category_type === 'event' || props.room.category === 'Event'
})

const statusBadgeClass = computed(() => {
  if (props.room.status === 'Upcoming') return 'status-upcoming'
  if (props.room.status === 'Completed') return 'status-completed'
  return 'status-cancelled'
})

const formatDate = (date) => {
  if (!date) return 'TBA'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * primaryImage: Compute the URL of the primary image for display
 */
const primaryImage = computed(() => {
  if (!props.room.images?.length) {
    return 'https://via.placeholder.com/600x400?text=No+Image'
  }

  const idx = props.room.primaryImageIndex || 0
  const image = props.room.images[idx]

  if (image && image.startsWith('/')) {
    return `${BACKEND_URL}${image}`
  }

  return image
})

/**
 * displayPrice: Format price as integer (no decimals)
 */
const displayPrice = computed(() => {
  const price = props.room.price || 0
  return Math.round(price)
})

/**
 * statusClass: Determine CSS class based on room status
 */
const statusClass = computed(() => {
  if (props.room.status === 'Available') return 'status-available'
  if (props.room.status === 'Occupied') return 'status-occupied'
  return 'status-maintenance'
})

/**
 * hasSeasonalPricing: Check if room has seasonal pricing
 */
const hasSeasonalPricing = computed(() => {
  return false
})
</script>
<style scoped src="../../assets/room.css"></style>

<style scoped>
.room-badge.event-badge {
  background: #EEF2FF;
  color: #4338CA;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-upcoming {
  background: #DCFCE7;
  color: #16A34A;
}

.status-completed {
  background: #DBEAFE;
  color: #0284C7;
}

.status-cancelled {
  background: #F3F4F6;
  color: #6B7280;
}
</style>