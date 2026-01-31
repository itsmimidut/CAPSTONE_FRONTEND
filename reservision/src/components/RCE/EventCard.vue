<template>
  <div class="room-card" :data-id="event.id">
    <!-- Event Image with badges overlay -->
    <div class="room-image" :style="{ backgroundImage: `url('${primaryImage}')` }">
      <div class="room-badges">
        <span v-if="event.status === 'Cancelled'" class="room-badge maintenance">Cancelled</span>
        <span class="room-badge event-badge">{{ event.category }}</span>
      </div>
    </div>

    <div class="room-details">
      <div class="room-header">
        <div>
          <div class="room-title">{{ event.name }}</div>
          <div class="room-type">{{ event.category }}</div>
          <div v-if="event.location" class="text-xs text-gray-500 mt-1">📍 {{ event.location }}</div>
        </div>
        <div class="status-badge" :class="statusBadgeClass">
          {{ event.status }}
        </div>
      </div>

      <p class="room-description">{{ event.description }}</p>

      <div class="room-meta">
        <span><i class="fas fa-calendar"></i> {{ formatDate(event.date) }}</span>
        <span><i class="fas fa-clock"></i> {{ event.time || 'TBA' }}</span>
        <span><i class="fas fa-image"></i> {{ event.images?.length || 0 }} Photos</span>
      </div>

      <div class="room-actions">
        <button class="btn btn-outline" @click="$emit('edit')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-outline">
          <i class="fas fa-images"></i> Images
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
  event: { type: Object, required: true }
})

const emit = defineEmits(['edit', 'delete'])

const BACKEND_URL = 'http://localhost:8000'

const primaryImage = computed(() => {
  if (!props.event.images?.length) {
    return 'https://via.placeholder.com/600x400?text=No+Image'
  }

  const idx = props.event.primaryImageIndex || 0
  const image = props.event.images[idx]

  if (image && image.startsWith('/')) {
    return `${BACKEND_URL}${image}`
  }

  return image
})

const statusBadgeClass = computed(() => {
  if (props.event.status === 'Upcoming') return 'status-upcoming'
  if (props.event.status === 'Completed') return 'status-completed'
  return 'status-cancelled'
})

const formatDate = (date) => {
  if (!date) return 'TBA'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.room-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.room-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.room-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.room-badges {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.room-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.9);
}

.room-badge.maintenance {
  background: #FEE2E2;
  color: #DC2626;
}

.room-badge.event-badge {
  background: #EEF2FF;
  color: #4338CA;
}

.room-details {
  padding: 16px;
}

.room-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.room-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 2px;
}

.room-type {
  font-size: 0.85rem;
  color: #6B7280;
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

.room-description {
  font-size: 0.9rem;
  color: #6B7280;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.room-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.85rem;
  color: #6B7280;
  margin-bottom: 12px;
}

.room-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.room-actions {
  display: flex;
  gap: 6px;
}

.btn {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #E5E7EB;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.btn-outline {
  border-color: #E5E7EB;
  color: #6B7280;
}

.btn-danger {
  border-color: #FEE2E2;
  color: #DC2626;
  background: #FEF2F2;
}

.btn-danger:hover {
  background: #FEE2E2;
}

.btn i {
  margin-right: 4px;
}
</style>
