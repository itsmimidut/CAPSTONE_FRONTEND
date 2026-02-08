<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h2 class="text-3xl font-semibold text-gray-900">My Reservations</h2>
        <p class="text-gray-500 mt-1">Track your current and past bookings.</p>
      </div>
      <div class="text-sm text-gray-500">Total: <span class="font-semibold text-gray-800">{{ reservations.length }}</span></div>
    </div>

    <div class="bg-white shadow-sm rounded-2xl border border-blue-100 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-blue-50 text-blue-900">
          <tr>
            <th class="px-6 py-3 text-xs uppercase tracking-wide">Room Type</th>
            <th class="px-6 py-3 text-xs uppercase tracking-wide">Check-in</th>
            <th class="px-6 py-3 text-xs uppercase tracking-wide">Check-out</th>
            <th class="px-6 py-3 text-xs uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="reservations.length === 0" class="border-b">
            <td colspan="4" class="px-6 py-8 text-center text-gray-400">No reservations found.</td>
          </tr>
          <tr v-for="row in reservations" :key="row.roomType + row.checkIn" class="border-b hover:bg-blue-50/40">
            <td class="px-6 py-4 font-medium text-gray-800">{{ row.roomType }}</td>
            <td class="px-6 py-4 text-gray-600">{{ row.checkIn }}</td>
            <td class="px-6 py-4 text-gray-600">{{ row.checkOut }}</td>
            <td class="px-6 py-4">
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700" :class="row.statusClass">
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
