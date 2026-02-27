<template>
  <section>
    <div class="flex flex-wrap items-center justify-end gap-3 mb-3">
      <div class="text-sm text-gray-500">
        Total: <span class="font-semibold text-gray-800">{{ reservations.length }}</span>
      </div>
    </div>

    <div class="bg-white shadow-sm rounded-2xl border border-blue-100 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-blue-50 text-blue-900">
          <tr>
            <th class="px-4 sm:px-6 py-2.5 text-xs uppercase tracking-wide font-extrabold">Room Type</th>
            <th class="px-4 sm:px-6 py-2.5 text-xs uppercase tracking-wide font-extrabold">Check-in</th>
            <th class="px-4 sm:px-6 py-2.5 text-xs uppercase tracking-wide font-extrabold">Check-out</th>
            <th class="px-4 sm:px-6 py-2.5 text-xs uppercase tracking-wide font-extrabold">Status</th>
          </tr>
        </thead>

        <tbody class="bg-white">
          <tr v-if="reservations.length === 0">
            <td colspan="4" class="px-4 sm:px-6 py-8 text-center text-gray-400">No reservations found.</td>
          </tr>

          <tr
            v-for="row in reservations"
            :key="row.roomType + row.checkIn"
            class="border-b border-blue-100/70 bg-white hover:bg-blue-50/40 transition"
          >
            <td class="px-4 sm:px-6 py-2.5 font-semibold text-gray-900">
              {{ row.roomType }}
            </td>
            <td class="px-4 sm:px-6 py-2.5 text-gray-600 whitespace-nowrap">
              {{ row.checkIn }}
            </td>
            <td class="px-4 sm:px-6 py-2.5 text-gray-600 whitespace-nowrap">
              {{ row.checkOut }}
            </td>
            <td class="px-4 sm:px-6 py-2.5">
              <span
                class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700"
                :class="row.statusClass"
              >
                {{ row.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  reservations: {
    type: Array,
    default: () => [],
  },
});
</script>