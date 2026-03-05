<template>
  <section class="dashboard-section">
    <div class="stats-grid">
      <SummaryCard
        v-for="card in filteredSummaryCards"
        :key="card.title"
        :title="card.title"
        :value="card.value"
        :tone="card.tone"
      />
    </div>

    <div class="panel">
      <h3 class="panel-title">
        <i class="fas fa-clock panel-icon"></i>
        Recent Activity
      </h3>

      <div class="table-wrap">
        <table class="w-full border-collapse text-left">
          <thead class="table-head">
            <tr>
              <th class="px-4 py-2">Date</th>
              <th class="px-4 py-2">Activity</th>
              <th class="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in recentActivity"
              :key="row.date + row.activity"
              class="table-row"
            >
              <td class="px-4 py-2 text-sm text-gray-700">{{ row.date }}</td>
              <td class="px-4 py-2 text-sm text-gray-700">{{ row.activity }}</td>
              <td class="px-4 py-2 text-sm" :class="row.statusClass">{{ row.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="recommendations">
      <h3 class="rec-title">
        <i class="fas fa-star rec-icon"></i>
        Recommended for You
      </h3>

      <div v-if="recommendedRooms.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RoomCard
          v-for="room in recommendedRooms"
          :key="room.title"
          :title="room.title"
          :price="room.price"
          :image-url="room.imageUrl"
          button-class="bg-blue-600 hover:bg-blue-700"
        />
      </div>

      <div v-else class="grid gap-6">
        <div>
          <h4 class="sub-title"><i class="fas fa-bed"></i> Rooms</h4>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <RoomCard
              v-for="room in allRooms"
              :key="room.title"
              v-bind="room"
              button-class="bg-blue-600 hover:bg-blue-700"
            />
          </div>
        </div>

        <div>
          <h4 class="sub-title"><i class="fas fa-umbrella-beach"></i> Cottages</h4>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <RoomCard
              v-for="cottage in recommendedCottages"
              :key="cottage.title"
              v-bind="cottage"
              button-class="bg-blue-500 hover:bg-blue-700"
            />
          </div>
        </div>

        <div>
          <h4 class="sub-title"><i class="fas fa-calendar-alt"></i> Events</h4>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="event in recommendedEvents"
              :key="event.title"
              class="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <img :src="event.imageUrl" :alt="event.title" class="w-full h-36 object-cover" />
              <div class="p-4">
                <h4 class="text-base font-semibold text-gray-800">{{ event.title }}</h4>
                <p class="text-gray-500 text-sm mt-1">{{ event.date }}</p>
                <p class="text-gray-600 text-xs mt-2">{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="sub-title"><i class="fas fa-utensils"></i> Restaurant</h4>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="item in recommendedRestaurant"
              :key="item.title"
              class="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <img :src="item.imageUrl" :alt="item.title" class="w-full h-36 object-cover" />
              <div class="p-4">
                <h4 class="text-base font-semibold text-gray-800">{{ item.title }}</h4>
                <p class="text-blue-700 text-sm mt-1">{{ item.price }}</p>
                <p class="text-gray-600 text-xs mt-2">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
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

/**
 * ✅ Remove unwanted stats WITHOUT breaking props or parent logic.
 * Keeps layout stable even if parent still sends those cards.
 */
const filteredSummaryCards = computed(() => {
  const blocked = new Set(['Loyalty Points', 'Unread Messages']);
  return (props.summaryCards || []).filter((c) => !blocked.has(String(c?.title || '')));
});
</script>

<style scoped>
.dashboard-section {
  /* keeps the section tight but readable */
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ✅ Two main cards side-by-side on md+ (each ~half width) */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin: 0;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.panel {
  background: #ffffff;
  border: 1px solid #dbeafe; /* blue-100 */
  border-radius: 14px;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.panel-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e3a8a; /* blue-900 */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
}

.panel-icon {
  color: #2563eb; /* blue-600 */
}

.table-wrap {
  overflow-x: auto;
}

.table-head {
  background: #eff6ff; /* blue-50 */
  color: #1e3a8a; /* blue-900 */
}

.table-row {
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.15s ease;
}

.table-row:hover {
  background: rgba(59, 130, 246, 0.06);
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rec-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e3a8a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0 0;
}

.rec-icon {
  color: #2563eb;
}

.sub-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>