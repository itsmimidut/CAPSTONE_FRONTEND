<template>
  <div class="lightbox-overlay" @click="$emit('close')">
    <div class="lightbox-container" @click.stop>
      <!-- Close Button -->
      <button class="lightbox-close" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>

      <!-- Main Image -->
      <div class="lightbox-main">
        <img 
          :src="images[currentIndex].url" 
          :alt="images[currentIndex].caption"
          class="lightbox-image"
        />
        <div class="lightbox-caption">
          {{ images[currentIndex].caption }}
        </div>
      </div>

      <!-- Navigation Buttons -->
      <button 
        class="lightbox-nav lightbox-prev"
        @click="$emit('prev')"
        :disabled="images.length <= 1"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <button 
        class="lightbox-nav lightbox-next"
        @click="$emit('next')"
        :disabled="images.length <= 1"
      >
        <i class="fas fa-chevron-right"></i>
      </button>

      <!-- Image Counter -->
      <div class="lightbox-counter">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>

      <!-- Thumbnail Strip -->
      <div class="lightbox-thumbnails">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="thumbnail"
          :class="{ active: index === currentIndex }"
          @click="updateImage(index)"
          :style="{ backgroundImage: `url(${image.url})` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true
  },
  currentIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'next', 'prev'])

const updateImage = (index) => {
  // Emit custom event to update parent's currentIndex
  // Parent will handle the update
  const newIndex = index
  const direction = newIndex > props.currentIndex ? 'next' : 'prev'
  
  let steps = Math.abs(newIndex - props.currentIndex)
  for (let i = 0; i < steps; i++) {
    if (direction === 'next') {
      emit('next')
    } else {
      emit('prev')
    }
  }
}

// Handle keyboard navigation
const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft') {
    emit('prev')
  } else if (e.key === 'ArrowRight') {
    emit('next')
  } else if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.lightbox-container {
  position: relative;
  width: 90%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-main {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
}

.lightbox-image {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 0.5rem;
  animation: slideIn 0.3s ease;
}

.lightbox-caption {
  margin-top: 1rem;
  text-align: center;
  color: white;
  font-size: 1.125rem;
  font-weight: 500;
}

.lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  z-index: 100;
}

.lightbox-close:hover {
  transform: scale(1.1);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  z-index: 10;
}

.lightbox-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.lightbox-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.lightbox-prev {
  left: -70px;
}

.lightbox-next {
  right: -70px;
}

.lightbox-counter {
  position: absolute;
  top: -50px;
  left: 0;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
}

.lightbox-thumbnails {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  width: 100%;
  padding: 1rem 0;
  justify-content: center;
  flex-wrap: wrap;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  background-size: cover;
  background-position: center;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.thumbnail:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.5);
}

.thumbnail.active {
  border-color: #63B3ED;
  box-shadow: 0 0 15px rgba(99, 179, 237, 0.5);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .lightbox-nav {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .lightbox-prev {
    left: -55px;
  }

  .lightbox-next {
    right: -55px;
  }

  .lightbox-close {
    top: -40px;
  }

  .lightbox-counter {
    top: -40px;
  }

  .thumbnail {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 480px) {
  .lightbox-nav {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .lightbox-prev {
    left: -45px;
  }

  .lightbox-next {
    right: -45px;
  }

  .lightbox-image {
    max-height: 60vh;
  }

  .lightbox-thumbnails {
    gap: 0.5rem;
  }

  .thumbnail {
    width: 50px;
    height: 50px;
  }
}
</style>