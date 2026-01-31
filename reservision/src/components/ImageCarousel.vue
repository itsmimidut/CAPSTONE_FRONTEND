<!-- components/ImageCarousel.vue -->
<template>
  <div class="relative w-full h-48 md:h-56 bg-gray-200 rounded-xl overflow-hidden group">
    <!-- Current Image -->
    <img
      :src="validImages[currentIdx]"
      :alt="title"
      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />

    <!-- Navigation Buttons -->
    <template v-if="validImages.length > 1">
      <button
        @click="prev"
        class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center z-10 transition"
      >
        ←
      </button>
      <button
        @click="next"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center z-10 transition"
      >
        →
      </button>

      <!-- Thumbnail Navigation -->
      <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 px-2 py-1 rounded-full z-10">
        <button
          v-for="(_, idx) in validImages"
          :key="idx"
          @click="currentIdx = idx"
          :class="[
            'w-2 h-2 rounded-full transition',
            idx === currentIdx ? 'bg-white' : 'bg-white/50'
          ]"
        />
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ImageCarousel',
  props: {
    images: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      currentIdx: 0
    }
  },
  computed: {
    validImages() {
      return Array.isArray(this.images) && this.images.length > 0
        ? this.images
        : ['https://via.placeholder.com/800x600/2B6CB0/ffffff?text=No+Image']
    }
  },
  methods: {
    next() {
      this.currentIdx = (this.currentIdx + 1) % this.validImages.length
    },
    prev() {
      this.currentIdx = (this.currentIdx - 1 + this.validImages.length) % this.validImages.length
    }
  }
}
</script>