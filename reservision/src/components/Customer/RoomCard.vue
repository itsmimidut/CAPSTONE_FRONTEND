<template>
  <div class="room-card">
    <!-- Image with preview icon -->
    <div class="room-card__image-wrapper">
      <img :src="imageUrl" :alt="title" class="room-card__image" />
      <!-- Preview overlay button -->
      <button @click="openPreview" class="room-card__overlay">
        <span class="room-card__preview-icon">
          <i class="fas fa-expand"></i>
        </span>
      </button>
    </div>

    <div class="room-card__body">
      <div class="room-card__header">
        <h4 class="room-card__title">{{ title }}</h4>
        <span class="room-card__badge" :style="{ backgroundColor: '#FEF3E2', color: '#F2C200' }">Recommended</span>
      </div>
      <p class="room-card__price" :style="{ color: '#666' }">{{ price }}</p>
      <button 
        :class="['room-card__btn']" 
        @click="handleBookNow"
        :style="{ 
          background: 'linear-gradient(135deg, #F2C200, #1E88B6)',
          color: '#FFFFFF'
        }"
      >
        {{ buttonLabel }}
      </button>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div v-if="isPreviewOpen" class="lightbox" @click.self="closePreview">
        <div class="lightbox__dialog" :style="{ borderColor: '#1E88B6' }">
          <!-- Modal Header -->
          <div class="lightbox__header" :style="{ background: 'linear-gradient(135deg, #1E88B6, #1F8DBF)' }">
            <h5 class="lightbox__title text-white">{{ title }}</h5>
            <button @click="closePreview" class="lightbox__close" :style="{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <!-- Full Image -->
          <div class="lightbox__image-wrapper" :style="{ backgroundColor: '#F5F5F5' }">
            <img :src="imageUrl" :alt="title" class="lightbox__image" />
          </div>
          <!-- Modal Footer -->
          <div class="lightbox__footer" :style="{ borderColor: '#E0E0E0', backgroundColor: '#F9FAFB' }">
            <p class="lightbox__price" :style="{ color: '#666' }">{{ price }}</p>
            <button 
              :class="['lightbox__btn']" 
              @click="handleBookNow"
              :style="{ 
                background: 'linear-gradient(135deg, #F2C200, #1E88B6)',
                color: '#FFFFFF'
              }"
            >
              {{ buttonLabel }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
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
  roomId: {
    type: [String, Number],
    default: null
  },
  redirectOnBook: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['book']);
const router = useRouter();

const isPreviewOpen = ref(false);

function openPreview() {
  isPreviewOpen.value = true;
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  isPreviewOpen.value = false;
  document.body.style.overflow = '';
}

async function handleBookNow() {
  // Emit book event with room details
  emit('book', {
    id: props.roomId,
    title: props.title,
    price: props.price,
    imageUrl: props.imageUrl
  });
  
  // You can also add a toast notification here if needed
  console.log('Booking:', props.title);
  
  // Optionally close preview if open
  if (isPreviewOpen.value) {
    closePreview();
  }

  if (props.redirectOnBook) {
    await router.push({
      path: '/customer',
      query: { activeSection: 'book' }
    });
  }
}
</script>

<style scoped>
/* ── Card ── */
.room-card {
  background: #ffffff;
  border: 2px solid #E0E0E0;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}
.room-card:hover {
  box-shadow: 0 8px 24px rgba(30, 136, 182, 0.15);
  transform: translateY(-2px);
  border-color: #1E88B6;
}

/* ── Image wrapper ── */
.room-card__image-wrapper {
  position: relative;
  width: 100%;
  background: #F5F5F5;
  overflow: hidden;
}
.room-card__image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  transition: transform 0.3s ease;
}
.room-card:hover .room-card__image {
  transform: scale(1.03);
}

/* ── Hover overlay ── */
.room-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0);
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}
.room-card:hover .room-card__overlay {
  background: rgba(30, 136, 182, 0.32);
}

/* ── Preview icon ── */
.room-card__preview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #1E88B6;
  font-size: 1.1rem;
  box-shadow: 0 4px 14px rgba(30, 136, 182, 0.3);
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.room-card:hover .room-card__preview-icon {
  opacity: 1;
  transform: scale(1);
}
.room-card__preview-icon:hover {
  background: #F2C200;
  color: #FFFFFF;
}

/* ── Card body ── */
.room-card__body {
  padding: 1rem;
}
.room-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}
.room-card__title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1E88B6;
  margin: 0;
}
.room-card__badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  white-space: nowrap;
}
.room-card__price {
  font-size: 0.875rem;
  margin: 0.5rem 0 1rem;
}
.room-card__btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}
.room-card__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(242, 194, 0, 0.3);
}
.room-card__btn:active {
  transform: translateY(0);
}

/* ── Lightbox backdrop ── */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 136, 182, 0.8);
  backdrop-filter: blur(4px);
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── Lightbox dialog ── */
.lightbox__dialog {
  position: relative;
  width: 100%;
  max-width: 56rem;
  background: #ffffff;
  border-radius: 1rem;
  overflow: hidden;
  border: 2px solid;
  box-shadow: 0 25px 60px rgba(30, 136, 182, 0.4);
  animation: slideUp 0.25s ease;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Lightbox header ── */
.lightbox__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.lightbox__title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}
.lightbox__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.lightbox__close:hover {
  background: #F2C200 !important;
  transform: scale(1.1);
}

/* ── Lightbox image ── */
.lightbox__image-wrapper {
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.lightbox__image {
  max-height: 75vh;
  width: auto;
  object-fit: contain;
  border-radius: 0.5rem;
}

/* ── Lightbox footer ── */
.lightbox__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid;
}
.lightbox__price {
  font-size: 0.875rem;
  margin: 0;
}
.lightbox__btn {
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
.lightbox__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(242, 194, 0, 0.3);
}
.lightbox__btn:active {
  transform: translateY(0);
}
</style>