<template>
  <section>
    <h2 class="text-3xl font-semibold text-gray-800 mb-2">Welcome Back, {{ customerName }}!</h2>
    <p class="text-gray-500 mb-6">Here's an overview of your stay experience and recent activity.</p>

    <div class="grid md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      <SummaryCard
        v-for="card in summaryCards"
        :key="card.title"
        :title="card.title"
        :value="card.value"
      />
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-clock text-emerald-600"></i> Recent Activity
      </h3>
      <table class="w-full border-collapse text-left">
        <thead class="bg-emerald-700 text-white">
          <tr>
            <th class="px-4 py-3">Date</th>
            <th class="px-4 py-3">Activity</th>
            <th class="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in recentActivity" :key="row.date + row.activity" class="border-b hover:bg-gray-50">
            <td class="px-4 py-3">{{ row.date }}</td>
            <td class="px-4 py-3">{{ row.activity }}</td>
            <td class="px-4 py-3" :class="row.statusClass">{{ row.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-star text-emerald-600"></i> Recommended for You
      </h3>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <RoomCard
          v-for="room in recommendedRooms"
          :key="room.title"
          :title="room.title"
          :price="room.price"
          :image-url="room.imageUrl"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import RoomCard from './RoomCard.vue';
import SummaryCard from './SummaryCard.vue';

defineProps({
  summaryCards: {
    type: Array,
    default: () => [],
  },
  recentActivity: {
    type: Array,
    default: () => [],
  },
  recommendedRooms: {
    type: Array,
    default: () => [],
  },
  customerName: {
    type: String,
    default: 'Guest',
  },
});
</script>
