<template>
  <section>
    <h2 class="text-3xl font-semibold text-gray-800 mb-2">My Reservations</h2>
    <p class="text-gray-500 mb-6">Here are your current and past bookings.</p>

    <div class="bg-white shadow-sm rounded-xl border overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-emerald-700 text-white">
          <tr>
            <th class="px-6 py-3">Room Type</th>
            <th class="px-6 py-3">Check-in</th>
            <th class="px-6 py-3">Check-out</th>
            <th class="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in reservations" :key="row.roomType + row.checkIn" class="border-b hover:bg-gray-50">
            <td class="px-6 py-3">{{ row.roomType }}</td>
            <td class="px-6 py-3">{{ row.checkIn }}</td>
            <td class="px-6 py-3">{{ row.checkOut }}</td>
            <td class="px-6 py-3" :class="row.statusClass">{{ row.status }}</td>
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
