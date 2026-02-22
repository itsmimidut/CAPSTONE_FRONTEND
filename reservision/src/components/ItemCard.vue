<!-- components/ItemCard.vue -->
<template>
  <div class="bg-white rounded-2xl shadow-md border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg hover:-translate-y-2 transition overflow-hidden">
    <div class="md:flex">
      <!-- Image Carousel -->
      <div class="md:w-1/3 relative h-56 md:h-auto bg-gray-200 overflow-hidden group">
        <div class="relative h-full w-full">
          <img
            v-for="(img, idx) in item.imgs"
            :key="idx"
            :src="img"
            :alt="`${item.name} - View ${idx + 1}`"
            :class="[
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
              idx === currentImgIdx ? 'opacity-100' : 'opacity-0'
            ]"
          />
        </div>

        <!-- Carousel Arrows -->
        <template v-if="item.imgs.length > 1">
          <button
            @click="prevImage"
            class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center z-10 transition hover:shadow-md text-blue-700 font-bold"
          >
            &lt;
          </button>
          <button
            @click="nextImage"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center z-10 transition hover:shadow-md text-blue-700 font-bold"
          >
            &gt;
          </button>

          <!-- Thumbnail Navigation -->
          <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 px-2 py-1 rounded-full z-10">
            <button
              v-for="(_, idx) in item.imgs"
              :key="idx"
              @click="currentImgIdx = idx"
              :class="[
                'w-2.5 h-2.5 rounded transition',
                idx === currentImgIdx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white'
              ]"
            />
          </div>
        </template>
      </div>

      <!-- Content -->
      <div class="p-5 md:p-6 flex flex-col flex-1">
        <!-- Header -->
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-lg md:text-xl font-bold text-gray-900">{{ item.name }}</h3>
          <div class="text-right">
            <div v-if="item.originalPrice" class="text-sm text-gray-400 line-through">
              ₱{{ item.originalPrice.toLocaleString() }}
            </div>
            <div class="text-lg md:text-xl font-bold text-amber-700">
              ₱{{ item.price.toLocaleString() }}{{ item.perNight ? '/night' : '' }}
            </div>
          </div>
        </div>

        <!-- Description -->
        <p class="text-sm text-gray-600 line-clamp-2 mb-2">{{ item.desc }}</p>

        <!-- View More -->
        <button
          @click="$emit('view-more', item)"
          class="text-blue-700 text-sm font-bold hover:underline mb-1"
        >
          View More
        </button>

        <!-- Selectors & Button -->
        <div class="mt-auto pt-4 border-t-2 border-gray-200 space-y-3">
          <!-- Only show Qty & Guests for non-swimming items -->
          <div v-if="item.category !== 'Swimming'" class="flex items-center gap-3 flex-wrap">
            <label class="text-sm text-gray-600 font-semibold whitespace-nowrap">Qty:</label>
            <select
              v-model.number="qty"
              class="border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-700 transition"
            >
              <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>

            <label class="text-sm text-gray-600 font-semibold whitespace-nowrap ml-2">Guests:</label>
            <select
              v-model.number="guests"
              class="border-2 border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-700 transition"
            >
              <option v-for="n in item.maxGuests" :key="n" :value="n">
                {{ n }} Guest{{ n > 1 ? 's' : '' }}
              </option>
            </select>
          </div>

          <button
            @click="handleBook"
            class="w-full px-5 py-1.5 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2 hover:shadow-lg"
          >
            Book Now <i class="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ItemCard',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  emits: ['book', 'view-more'],
  data() {
    return {
      currentImgIdx: 0,
      qty: 1,
      guests: 1
    }
  },
  methods: {
    nextImage() {
      this.currentImgIdx = (this.currentImgIdx + 1) % this.item.imgs.length
    },
    prevImage() {
      this.currentImgIdx = (this.currentImgIdx - 1 + this.item.imgs.length) % this.item.imgs.length
    },
    handleBook() {
      this.$emit('book', this.item, this.qty, this.guests)
      this.qty = 1
      this.guests = 1
    }
  }
}
</script>