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
        <span class="room-card__badge">Recommended</span>
      </div>
      <p class="room-card__price">{{ price }}</p>
      <button :class="['room-card__btn', buttonClass]">
        {{ buttonLabel }}
      </button>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div v-if="isPreviewOpen" class="lightbox" @click.self="closePreview">
        <div class="lightbox__dialog">
          <!-- Modal Header -->
          <div class="lightbox__header">
            <h5 class="lightbox__title">{{ title }}</h5>
            <button @click="closePreview" class="lightbox__close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <!-- Full Image -->
          <div class="lightbox__image-wrapper">
            <img :src="imageUrl" :alt="title" class="lightbox__image" />
          </div>
          <!-- Modal Footer -->
          <div class="lightbox__footer">
            <p class="lightbox__price">{{ price }}</p>
            <button :class="['lightbox__btn', buttonClass]">
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

const isPreviewOpen = ref(false);

function openPreview() {
  isPreviewOpen.value = true;
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  isPreviewOpen.value = false;
  document.body.style.overflow = '';
}
</script>

<style scoped>
/* ── Card ── */
.room-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.room-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* ── Image wrapper ── */
.room-card__image-wrapper {
  position: relative;
  width: 100%;
  background: #f3f4f6;
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
  background: rgba(0, 0, 0, 0.32);
}

/* ── Preview icon ── */
.room-card__preview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #1d4ed8;
  font-size: 1.1rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.room-card:hover .room-card__preview-icon {
  opacity: 1;
  transform: scale(1);
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
  color: #1f2937;
  margin: 0;
}
.room-card__badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: #2563eb;
  background: #eff6ff;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  white-space: nowrap;
}
.room-card__price {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.5rem 0 1rem;
}
.room-card__btn {
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.room-card__btn:hover {
  opacity: 0.88;
}

/* ── Lightbox backdrop ── */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
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
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
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
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.lightbox__title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
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
  background: #f3f4f6;
  color: #6b7280;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}
.lightbox__close:hover {
  background: #fee2e2;
  color: #ef4444;
}

/* ── Lightbox image ── */
.lightbox__image-wrapper {
  background: #f3f4f6;
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
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}
.lightbox__price {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}
.lightbox__btn {
  color: #ffffff;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.lightbox__btn:hover {
  opacity: 0.88;
}
</style>