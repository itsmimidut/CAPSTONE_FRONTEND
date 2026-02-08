<template>
  <section>
    <!-- <div class="rounded-2xl bg-white border border-blue-100 p-6 mb-8 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-blue-600">Customer Dashboard</p>
          <h2 class="text-3xl font-semibold text-gray-900 mt-2">Welcome Back, {{ customerName }}!</h2>
          <p class="text-gray-500 mt-2">Here's an overview of your stay experience and recent activity.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-orange-400"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-yellow-300"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-green-400"></span>
        </div>
      </div>
    </div> -->

    <div class="grid md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      <SummaryCard
        v-for="card in summaryCards"
        :key="card.title"
        :title="card.title"
        :value="card.value"
        :tone="card.tone"
      />
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-blue-100 mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-clock text-blue-600"></i> Recent Activity
      </h3>
      <table class="w-full border-collapse text-left">
        <thead class="bg-blue-50 text-blue-900">
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
      <h3 class="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
        <i class="fas fa-star text-blue-600"></i> Recommended for You
      </h3>
      <div v-if="recommendedRooms.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <RoomCard
          v-for="room in recommendedRooms"
          :key="room.title"
          :title="room.title"
          :price="room.price"
          :image-url="room.imageUrl"
          button-class="bg-blue-600 hover:bg-blue-700"
        />
      </div>
      <div v-else class="grid gap-8">
        <div>
          <h4 class="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2"><i class="fas fa-bed"></i> Rooms</h4>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <RoomCard v-for="room in allRooms" :key="room.title" v-bind="room" button-class="bg-blue-600 hover:bg-blue-700" />
          </div>
        </div>
        <div>
          <h4 class="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2"><i class="fas fa-umbrella-beach"></i> Cottages</h4>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <RoomCard v-for="cottage in recommendedCottages" :key="cottage.title" v-bind="cottage" button-class="bg-blue-500 hover:bg-blue-700" />
          </div>
        </div>
        <div>
          <h4 class="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2"><i class="fas fa-calendar-alt"></i> Events</h4>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="event in recommendedEvents" :key="event.title" class="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <img :src="event.imageUrl" :alt="event.title" class="w-full h-40 object-cover" />
              <div class="p-4">
                <h4 class="text-lg font-semibold text-gray-800">{{ event.title }}</h4>
                <p class="text-gray-500 text-sm mt-2 mb-2">{{ event.date }}</p>
                <p class="text-gray-600 text-xs">{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h4 class="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2"><i class="fas fa-utensils"></i> Restaurant</h4>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="item in recommendedRestaurant" :key="item.title" class="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <img :src="item.imageUrl" :alt="item.title" class="w-full h-40 object-cover" />
              <div class="p-4">
                <h4 class="text-lg font-semibold text-gray-800">{{ item.title }}</h4>
                <p class="text-blue-700 text-sm mt-2 mb-2">{{ item.price }}</p>
                <p class="text-gray-600 text-xs">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import RoomCard from './RoomCard.vue';
import SummaryCard from './SummaryCard.vue';

const props = defineProps({
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
  allRooms: {
    type: Array,
    default: () => [],
  },
  recommendedCottages: {
    type: Array,
    default: () => [],
  },
  recommendedEvents: {
    type: Array,
    default: () => [],
  },
  recommendedRestaurant: {
    type: Array,
    default: () => [],
  },
  customerName: {
    type: String,
    default: 'Guest',
  },
});
</script>
