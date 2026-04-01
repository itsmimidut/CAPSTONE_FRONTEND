<template>
  <section class="dashboard-section">

    <!-- ══════════════════════════════════════════ -->
    <!-- STATS GRID                                 -->
    <!-- ══════════════════════════════════════════ -->
    <div class="stats-grid">
      <div
        v-for="(card, i) in filteredSummaryCards"
        :key="card.title"
        class="stat-card"
        :class="`stat-card--${i % 4}`"
      >
        <div class="stat-icon-wrap">
          <i :class="getStatIcon(card.title)"></i>
        </div>
        <div class="stat-body">
          <p class="stat-label">{{ card.title }}</p>
          <p class="stat-value">{{ card.value }}</p>
        </div>
        <div class="stat-shimmer"></div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════ -->
    <!-- RECOMMENDATIONS                           -->
    <!-- ══════════════════════════════════════════ -->
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title-wrap">
          <span class="panel-title-icon gold-icon"><i class="fas fa-star"></i></span>
          <div>
            <h3 class="panel-title">Recommended for You</h3>
            <p class="panel-subtitle">{{ recommendationReason }}</p>
          </div>
        </div>
      </div>

      <div class="panel-body rec-sections">

        <!-- Rooms -->
        <div class="rec-section" v-if="smartRecommendations.rooms.length > 0">
          <div class="rec-section-header">
            <span class="rec-dot dot-navy"></span>
            <h4 class="rec-section-title"><i class="fas fa-bed"></i> Rooms</h4>
            <span class="rec-section-count">{{ smartRecommendations.rooms.length }}</span>
          </div>
          <div class="room-cards-grid">
            <RoomCard
              v-for="room in smartRecommendations.rooms"
              :key="room.title"
              v-bind="room"
            />
          </div>
        </div>

        <!-- Cottages -->
        <div class="rec-section" v-if="smartRecommendations.cottages.length > 0">
          <div class="rec-section-header">
            <span class="rec-dot dot-primary"></span>
            <h4 class="rec-section-title"><i class="fas fa-umbrella-beach"></i> Cottages</h4>
            <span class="rec-section-count">{{ smartRecommendations.cottages.length }}</span>
          </div>
          <div class="room-cards-grid">
            <RoomCard
              v-for="cottage in smartRecommendations.cottages"
              :key="cottage.title"
              v-bind="cottage"
            />
          </div>
        </div>

        <!-- Events -->
        <div class="rec-section" v-if="smartRecommendations.events.length > 0">
          <div class="rec-section-header">
            <span class="rec-dot dot-gold"></span>
            <h4 class="rec-section-title"><i class="fas fa-calendar-alt"></i> Events</h4>
            <span class="rec-section-count">{{ smartRecommendations.events.length }}</span>
          </div>
          <div class="feature-cards-grid">
            <div
              v-for="event in smartRecommendations.events"
              :key="event.title"
              class="feature-card"
            >
              <div class="feature-card-img-wrap">
                <img :src="event.imageUrl" :alt="event.title" class="feature-card-img" />
                <div class="feature-card-overlay"></div>
              </div>
              <div class="feature-card-body">
                <h4 class="feature-card-title">{{ event.title }}</h4>
                <p class="feature-card-meta"><i class="fas fa-calendar-day"></i> {{ event.date }}</p>
                <p class="feature-card-desc">{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Restaurant -->
        <div class="rec-section" v-if="smartRecommendations.restaurant.length > 0">
          <div class="rec-section-header">
            <span class="rec-dot dot-primary-light"></span>
            <h4 class="rec-section-title"><i class="fas fa-utensils"></i> Restaurant</h4>
            <span class="rec-section-count">{{ smartRecommendations.restaurant.length }}</span>
          </div>
          <div class="feature-cards-grid">
            <div
              v-for="item in smartRecommendations.restaurant"
              :key="item.title"
              class="feature-card"
            >
              <div class="feature-card-img-wrap">
                <img :src="item.imageUrl" :alt="item.title" class="feature-card-img" />
                <div class="feature-card-overlay"></div>
              </div>
              <div class="feature-card-body">
                <h4 class="feature-card-title">{{ item.title }}</h4>
                <p class="feature-card-price">{{ item.price }}</p>
                <p class="feature-card-desc">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div
          v-if="
            !smartRecommendations.rooms.length &&
            !smartRecommendations.cottages.length &&
            !smartRecommendations.events.length &&
            !smartRecommendations.restaurant.length
          "
          class="panel-empty"
        >
          <div class="panel-empty-icon"><i class="fas fa-door-open"></i></div>
          <p>No recommendations available right now</p>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════ -->
    <!-- RECENT ACTIVITY                           -->
    <!-- ══════════════════════════════════════════ -->
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title-wrap">
          <span class="panel-title-icon"><i class="fas fa-clock"></i></span>
          <h3 class="panel-title">Recent Activity</h3>
        </div>
        <span class="activity-count" v-if="recentActivity.length > 0">
          {{ recentActivity.length }} record{{ recentActivity.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <div v-if="recentActivity.length === 0" class="panel-empty">
        <div class="panel-empty-icon"><i class="fas fa-inbox"></i></div>
        <p>No recent activity yet</p>
      </div>

      <div v-else class="table-wrap">
        <table class="activity-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in recentActivity"
              :key="row.date + row.activity + i"
              class="table-row"
              :style="`animation-delay: ${i * 0.05}s`"
            >
              <td class="date-cell">
                <i class="fas fa-calendar-day date-icon"></i>
                {{ row.date }}
              </td>
              <td class="activity-cell">{{ row.activity }}</td>
              <td>
                <span class="status-chip" :class="row.statusClass">{{ row.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </section>
</template>

<script setup>
import { computed } from 'vue'
import RoomCard from './RoomCard.vue'

const props = defineProps({
  summaryCards:          { type: Array,  default: () => [] },
  recentActivity:        { type: Array,  default: () => [] },
  recommendedRooms:      { type: Array,  default: () => [] },
  allRooms:              { type: Array,  default: () => [] },
  recommendedCottages:   { type: Array,  default: () => [] },
  recommendedEvents:     { type: Array,  default: () => [] },
  recommendedRestaurant: { type: Array,  default: () => [] },
  customerName:          { type: String, default: 'Guest' },
})

const filteredSummaryCards = computed(() => {
  const blocked = new Set(['Loyalty Points', 'Unread Messages'])
  return (props.summaryCards || []).filter(c => !blocked.has(String(c?.title || '')))
})

const getStatIcon = (title) => {
  const t = (title || '').toLowerCase()
  if (t.includes('booking') || t.includes('reserv')) return 'fas fa-calendar-check'
  if (t.includes('spend') || t.includes('total') || t.includes('amount')) return 'fas fa-peso-sign'
  if (t.includes('stay') || t.includes('night')) return 'fas fa-moon'
  if (t.includes('visit') || t.includes('trip')) return 'fas fa-suitcase-rolling'
  if (t.includes('order') || t.includes('food')) return 'fas fa-utensils'
  if (t.includes('point') || t.includes('reward')) return 'fas fa-star'
  return 'fas fa-chart-bar'
}

// Normalize text
const normalizeText = (value) => String(value || '').trim().toLowerCase()

// Detect which category the activity belongs to
const detectActivityCategory = (activityText) => {
  const text = normalizeText(activityText)

  if (
    text.includes('room') ||
    text.includes('check-in') ||
    text.includes('check in') ||
    text.includes('overnight') ||
    text.includes('stay') ||
    text.includes('suite') ||
    text.includes('deluxe') ||
    text.includes('family room') ||
    text.includes('studio')
  ) return 'rooms'

  if (
    text.includes('cottage') ||
    text.includes('hut') ||
    text.includes('table') ||
    text.includes('gazebo') ||
    text.includes('umbrella')
  ) return 'cottages'

  if (
    text.includes('event') ||
    text.includes('function hall') ||
    text.includes('venue') ||
    text.includes('wedding') ||
    text.includes('birthday') ||
    text.includes('conference') ||
    text.includes('meeting')
  ) return 'events'

  if (
    text.includes('food') ||
    text.includes('restaurant') ||
    text.includes('meal') ||
    text.includes('dinner') ||
    text.includes('lunch') ||
    text.includes('breakfast') ||
    text.includes('order') ||
    text.includes('menu')
  ) return 'restaurant'

  return 'unknown'
}

// Related-category scoring
const getRelatedCategoryWeights = (primaryCategory) => {
  switch (primaryCategory) {
    case 'rooms':
      return { rooms: 5, cottages: 2, events: 1, restaurant: 3 }
    case 'cottages':
      return { rooms: 2, cottages: 5, events: 1, restaurant: 3 }
    case 'events':
      return { rooms: 3, cottages: 1, events: 5, restaurant: 4 }
    case 'restaurant':
      return { rooms: 2, cottages: 2, events: 1, restaurant: 5 }
    default:
      return { rooms: 2, cottages: 2, events: 1, restaurant: 2 }
  }
}

// Build weighted activity score
const recommendationScores = computed(() => {
  const base = {
    rooms: 0,
    cottages: 0,
    events: 0,
    restaurant: 0
  }

  const activities = Array.isArray(props.recentActivity) ? props.recentActivity : []

  if (!activities.length) {
    return { rooms: 2, cottages: 2, events: 1, restaurant: 2 }
  }

  activities.forEach((entry, index) => {
    const activity = entry?.activity || ''
    const category = detectActivityCategory(activity)

    // more recent rows get higher weight
    const recencyWeight = Math.max(1, activities.length - index)

    if (category !== 'unknown') {
      const related = getRelatedCategoryWeights(category)

      base.rooms += related.rooms * recencyWeight
      base.cottages += related.cottages * recencyWeight
      base.events += related.events * recencyWeight
      base.restaurant += related.restaurant * recencyWeight
    }
  })

  return base
})

// Sort helper
const sortByScore = (items, categoryKey) => {
  const score = recommendationScores.value[categoryKey] || 0

  return [...(items || [])]
    .map((item, index) => {
      const title = normalizeText(item?.title)
      let itemBoost = 0

      if (categoryKey === 'rooms') {
        if (title.includes('family')) itemBoost += 1.2
        if (title.includes('deluxe')) itemBoost += 1
        if (title.includes('studio')) itemBoost += 0.8
      }

      if (categoryKey === 'cottages') {
        if (title.includes('family')) itemBoost += 1
        if (title.includes('large')) itemBoost += 0.8
      }

      if (categoryKey === 'events') {
        if (title.includes('hall')) itemBoost += 1
        if (title.includes('event')) itemBoost += 0.8
      }

      if (categoryKey === 'restaurant') {
        if (title.includes('bundle')) itemBoost += 1
        if (title.includes('best')) itemBoost += 0.8
        if (title.includes('special')) itemBoost += 0.8
      }

      return {
        ...item,
        __rank: score + itemBoost - (index * 0.01)
      }
    })
    .sort((a, b) => b.__rank - a.__rank)
    .map(({ __rank, ...item }) => item)
}

// Main recommendations
const smartRecommendations = computed(() => {
  const sortedRooms = sortByScore(
    props.recommendedRooms?.length ? props.recommendedRooms : props.allRooms,
    'rooms'
  )

  const sortedCottages = sortByScore(props.recommendedCottages, 'cottages')
  const sortedEvents = sortByScore(props.recommendedEvents, 'events')
  const sortedRestaurant = sortByScore(props.recommendedRestaurant, 'restaurant')

  const scores = recommendationScores.value

  const orderedCategories = [
    { key: 'rooms', score: scores.rooms },
    { key: 'cottages', score: scores.cottages },
    { key: 'events', score: scores.events },
    { key: 'restaurant', score: scores.restaurant }
  ].sort((a, b) => b.score - a.score)

  const topCategory = orderedCategories[0]?.key

  return {
    rooms: topCategory === 'rooms' ? sortedRooms.slice(0, 4) : sortedRooms.slice(0, 2),
    cottages: topCategory === 'cottages' ? sortedCottages.slice(0, 4) : sortedCottages.slice(0, 2),
    events: topCategory === 'events' ? sortedEvents.slice(0, 3) : sortedEvents.slice(0, 1),
    restaurant: topCategory === 'restaurant' ? sortedRestaurant.slice(0, 4) : sortedRestaurant.slice(0, 2),
  }
})

const recommendationReason = computed(() => {
  const activities = Array.isArray(props.recentActivity) ? props.recentActivity : []
  if (!activities.length) {
    return 'Popular picks based on what guests usually book.'
  }

  const top = Object.entries(recommendationScores.value)
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  if (top === 'rooms') return 'Based on your recent room-related activity.'
  if (top === 'cottages') return 'Based on your recent cottage-related activity.'
  if (top === 'events') return 'Based on your recent event-related activity.'
  if (top === 'restaurant') return 'Based on your recent food and dining activity.'

  return 'Picked based on your recent activity.'
})
</script>

<style scoped>
:root {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #f9fafb;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #1f2937;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

@media (min-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}

.stat-card {
  position: relative;
  border-radius: 12px;
  padding: 1.1rem 1.15rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  overflow: hidden;
  cursor: default;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(12,59,94,0.18);
}

.stat-card--0 { background: linear-gradient(135deg, #0C3B5E 0%, #0369a1 100%); color: #fff; }
.stat-card--1 { background: linear-gradient(135deg, #0369a1 0%, #1F8DBF 100%); color: #fff; }
.stat-card--2 { background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%); color: #fff; }
.stat-card--3 { background: linear-gradient(135deg, #F4C400 0%, #F2C200 100%); color: #0C3B5E; }

.stat-icon-wrap {
  width: 42px; height: 42px; border-radius: 10px;
  background: rgba(255,255,255,0.18);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; flex-shrink: 0;
}

.stat-card--3 .stat-icon-wrap { background: rgba(12,59,94,0.12); }
.stat-body { flex: 1; min-width: 0; }

.stat-label {
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; opacity: 0.75; line-height: 1.2;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.stat-value {
  font-size: 1.45rem; font-weight: 800;
  line-height: 1.15; margin-top: 0.2rem; letter-spacing: -0.3px;
}

.stat-shimmer {
  position: absolute; top: -20px; right: -20px;
  width: 80px; height: 80px; border-radius: 50%;
  background: rgba(255,255,255,0.08); pointer-events: none;
}

.stat-card--3 .stat-shimmer { background: rgba(12,59,94,0.07); }

.panel {
  background: #fff;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(3,105,161,0.06);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.25rem;
  border-bottom: 2px solid #F4C400;
  background: #fff;
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.panel-title-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: #eff6ff; color: #0369a1;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.panel-title-icon.gold-icon {
  background: #F4C400;
  color: #0C3B5E;
}

.panel-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0C3B5E;
}

.panel-subtitle {
  font-size: 0.74rem;
  color: #6b7280;
  margin-top: 0.15rem;
}

.activity-count {
  font-size: 0.72rem; font-weight: 700; color: #0369a1;
  background: #eff6ff; padding: 0.2rem 0.65rem; border-radius: 20px;
}

.panel-body {
  padding: 1.1rem 1.25rem;
}

.room-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.1rem;
}

@media (max-width: 700px) {
  .room-cards-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 480px) {
  .room-cards-grid { grid-template-columns: 1fr; }
}

.rec-sections { display: flex; flex-direction: column; gap: 1.5rem; }
.rec-section { display: flex; flex-direction: column; gap: 0.85rem; }

.rec-section-header {
  display: flex; align-items: center; gap: 0.55rem;
  padding-bottom: 0.6rem;
  border-bottom: 1.5px solid #dbeafe;
}

.rec-dot {
  width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
}

.dot-navy          { background: #0C3B5E; }
.dot-primary       { background: #0369a1; }
.dot-primary-light { background: #1F8DBF; }
.dot-gold          { background: #F4C400; }

.rec-section-title {
  font-size: 0.85rem; font-weight: 800; color: #0C3B5E; flex: 1;
  display: flex; align-items: center; gap: 0.4rem;
}

.rec-section-count {
  background: #eff6ff; color: #0369a1;
  padding: 0.1rem 0.5rem; border-radius: 20px;
  font-size: 0.68rem; font-weight: 700; border: 1px solid #dbeafe;
}

.feature-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.feature-card {
  background: #fff; border: 1.5px solid #e5e7eb;
  border-radius: 10px; overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.18s;
}

.feature-card:hover {
  border-color: #0369a1; box-shadow: 0 4px 12px rgba(3,105,161,0.1); transform: translateY(-2px);
}

.feature-card-img-wrap { position: relative; height: 130px; overflow: hidden; }

.feature-card-img {
  width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease;
}

.feature-card:hover .feature-card-img { transform: scale(1.04); }

.feature-card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(12,59,94,0.25) 0%, transparent 60%);
  pointer-events: none;
}

.feature-card-body { padding: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
.feature-card-title { font-size: 0.88rem; font-weight: 700; color: #0C3B5E; line-height: 1.3; }
.feature-card-meta  { font-size: 0.72rem; color: #6b7280; display: flex; align-items: center; gap: 0.35rem; }
.feature-card-price { font-size: 0.85rem; font-weight: 700; color: #0369a1; }
.feature-card-desc  { font-size: 0.75rem; color: #6b7280; line-height: 1.45; margin-top: 0.1rem; }

.panel-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; padding: 2.5rem 1.5rem; color: #6b7280; font-size: 0.85rem;
}

.panel-empty-icon {
  width: 44px; height: 44px; border-radius: 10px; background: #f9fafb;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; color: #d1d5db;
}

.table-wrap { overflow-x: auto; }
.activity-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
.activity-table thead tr { background: #eff6ff; }

.activity-table thead th {
  padding: 0.65rem 1.1rem;
  font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.07em;
  color: #0C3B5E; text-align: left; white-space: nowrap;
  border-bottom: 1.5px solid #dbeafe;
}

.table-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
  animation: rowFadeIn 0.3s ease both;
}

.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #f0f7ff; }

@keyframes rowFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.activity-table td { padding: 0.65rem 1.1rem; color: #1f2937; }

.date-cell {
  color: #6b7280 !important; white-space: nowrap;
  display: flex; align-items: center; gap: 0.45rem;
}

.date-icon      { color: #0369a1; font-size: 0.72rem; }
.activity-cell  { font-weight: 500; color: #1f2937 !important; }

.status-chip {
  display: inline-flex; align-items: center;
  padding: 0.2rem 0.65rem; border-radius: 20px;
  font-size: 0.7rem; font-weight: 700; white-space: nowrap;
}

.status-chip.text-green-600, .status-chip.text-green-700 { background: #d1fae5; color: #065f46; }
.status-chip.text-yellow-600, .status-chip.text-yellow-700 { background: #fef9c3; color: #854d0e; }
.status-chip.text-red-600, .status-chip.text-red-700 { background: #fee2e2; color: #991b1b; }
.status-chip.text-blue-600, .status-chip.text-blue-700 { background: #eff6ff; color: #0369a1; }
.status-chip.text-gray-500, .status-chip.text-gray-600 { background: #f3f4f6; color: #6b7280; }
.status-chip:not([class*="text-"]) { background: #f9fafb; color: #0369a1; border: 1px solid #dbeafe; }

@media (max-width: 640px) {
  .stats-grid          { grid-template-columns: 1fr 1fr; }
  .stat-value          { font-size: 1.2rem; }
  .feature-cards-grid  { grid-template-columns: 1fr; }
  .activity-table      { font-size: 0.78rem; }
}

@media (max-width: 380px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>