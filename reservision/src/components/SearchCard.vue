<!-- components/SearchCard.vue -->
<template>
  <section class="max-w-7xl mx-auto px-4">
    <div class="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
      <!-- Desktop View -->
      <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="text-xs text-gray-600 block mb-1 font-medium">Check-in – Check-out</label>
          <button
            @click="$emit('date-click')"
            class="w-full rounded-xl border px-3 py-2.5 flex justify-between items-center text-left hover:border-blue-700 transition text-sm"
          >
            <span class="text-gray-700">{{ dateStr }}</span>
            <span class="text-blue-700">📅</span>
          </button>
        </div>

        <div>
          <label class="text-xs text-gray-600 block mb-1 font-medium">Guests</label>
          <button
            @click="$emit('guest-click')"
            class="w-full rounded-xl border px-3 py-2.5 flex justify-between items-center text-left hover:border-blue-700 transition text-sm"
          >
            <span class="text-gray-700">{{ guestStr }}</span>
            <span class="text-blue-700">👤</span>
          </button>
        </div>

        <div>
          <label class="text-xs text-gray-600 block mb-1 font-medium">Promo Code</label>
          <input
            placeholder="Optional"
            class="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-700"
          />
        </div>

        <div class="flex items-end">
          <button class="w-full rounded-xl py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition">
            🔍 Search
          </button>
        </div>
      </div>

      <!-- Mobile View -->
      <div class="md:hidden">
        <button
          @click="mobileOpen = !mobileOpen"
          class="w-full py-2.5 bg-blue-700 text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition"
        >
          Modify Search
        </button>

        <div v-if="mobileOpen" class="mt-4 space-y-3">
          <button
            @click="$emit('date-click')"
            class="w-full rounded-xl border px-3 py-2.5 flex justify-between items-center text-left hover:border-blue-700 bg-gray-50 transition"
          >
            <span class="text-sm text-gray-700">{{ dateStr }}</span>
            <span class="text-blue-700">📅</span>
          </button>

          <button
            @click="$emit('guest-click')"
            class="w-full rounded-xl border px-3 py-2.5 flex justify-between items-center text-left hover:border-blue-700 bg-gray-50 transition"
          >
            <span class="text-sm text-gray-700">{{ guestStr }}</span>
            <span class="text-blue-700">👤</span>
          </button>

          <input
            placeholder="Promo code"
            class="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
          />

          <div class="flex gap-3">
            <button class="flex-1 py-2.5 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition">
              Search
            </button>
            <button
              @click="mobileOpen = false"
              class="flex-1 py-2.5 border rounded-xl font-bold hover:bg-gray-50 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'SearchCard',
  props: {
    dateStr: { type: String, required: true },
    guestStr: { type: String, required: true }
  },
  emits: ['date-click', 'guest-click'],
  data() {
    return {
      mobileOpen: false
    }
  }
}
</script>