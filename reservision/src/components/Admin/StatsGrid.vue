<template>
  <div class="stats-grid">
    <div
      v-for="(stat, index) in stats"
      :key="stat.label"
      class="stat-card"
      :class="`stat-card--${colorMap[stat.type] || 'blue'}`"
      :style="{ '--index': index }"
    >
      <!-- Top accent bar (via ::before) -->

      <!-- Icon -->
      <div class="stat-icon-wrap" :class="`stat-icon--${colorMap[stat.type] || 'blue'}`">
        <i :class="stat.icon || defaultIcons[stat.type]"></i>
      </div>

      <!-- Info -->
      <div class="stat-info">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>

        <!-- Progress bar -->
        <div class="progress-bar">
          <div
            class="progress-fill"
            :class="`fill--${colorMap[stat.type] || 'blue'}`"
            :style="{ width: stat.progress + '%' }"
          ></div>
        </div>

        <!-- Trend footer -->
        <div class="stat-footer">
          <span class="trend" :class="stat.trend > 0 ? 'trend--up' : 'trend--down'">
            <i :class="stat.trend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ Math.abs(stat.trend) }}%
          </span>
          <span class="vs">vs last month</span>
        </div>
      </div>

      <!-- Watermark -->
      <div class="stat-watermark">
        <i :class="stat.icon || defaultIcons[stat.type]"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Array,
    default: () => [
      { label: 'Total Revenue', value: '₱1,250,000', progress: 75, type: 'revenue',   trend: 12.5, icon: 'fas fa-peso-sign'      },
      { label: 'Bookings',      value: '350',         progress: 65, type: 'bookings',  trend: 8.3,  icon: 'fas fa-calendar-check' },
      { label: 'Occupancy',     value: '78%',         progress: 78, type: 'occupancy', trend: 5.2,  icon: 'fas fa-bed'            },
      { label: 'Guests',        value: '280',         progress: 70, type: 'guests',    trend: -3.1, icon: 'fas fa-users'          },
    ]
  }
})

const colorMap = {
  revenue:   'green',
  bookings:  'blue',
  occupancy: 'yellow',
  guests:    'navy',
}

const defaultIcons = {
  revenue:   'fas fa-peso-sign',
  bookings:  'fas fa-calendar-check',
  occupancy: 'fas fa-bed',
  guests:    'fas fa-users',
}
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.stats-grid {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-gray-bg:       #EEF5FB;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

/* ── Keyframes ── */
@keyframes cardIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes barGrow {
  from { width: 0; }
}

/* ── Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}
@media (min-width: 768px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}

/* ── Base Card ── */
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.4rem;
  background: var(--color-white);
  border-radius: 16px;
  border: 0.5px solid var(--color-gray-border);
  box-shadow: 0 2px 10px rgba(3, 105, 161, 0.07);
  overflow: hidden;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  animation: cardIn 0.4s ease both;
  animation-delay: calc(var(--index) * 70ms);
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(3, 105, 161, 0.14);
}

/* ── Top accent bar ── */
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 16px 16px 0 0;
}
.stat-card--blue::before   { background: var(--color-primary-light); }
.stat-card--green::before  { background: #16a34a; }
.stat-card--orange::before { background: #ea580c; }
.stat-card--yellow::before { background: var(--color-gold); }
.stat-card--navy::before   { background: var(--color-navy); }
.stat-card--gold::before   { background: var(--color-gold-dark); }
.stat-card--red::before    { background: #dc2626; }

/* ── Icon wrapper ── */
.stat-icon-wrap {
  width: 52px; height: 52px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  transition: transform 0.22s ease;
}
.stat-card:hover .stat-icon-wrap { transform: scale(1.1) rotate(-4deg); }

.stat-icon--blue   { background: rgba(31, 141, 191, 0.12); color: var(--color-primary-light); }
.stat-icon--green  { background: rgba(22, 163, 74, 0.12);  color: #16a34a; }
.stat-icon--orange { background: rgba(234, 88, 12, 0.1);   color: #ea580c; }
.stat-icon--yellow { background: rgba(244, 196, 0, 0.15);  color: #92700a; }
.stat-icon--navy   { background: rgba(12, 59, 94, 0.1);    color: var(--color-navy); }
.stat-icon--gold   { background: rgba(242, 194, 0, 0.15);  color: #7a5200; }
.stat-icon--red    { background: rgba(220, 38, 38, 0.1);   color: #dc2626; }

/* ── Info ── */
.stat-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 1.85rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-text-dark);
}

.stat-card--blue   .stat-value { color: var(--color-primary-light); }
.stat-card--green  .stat-value { color: #16a34a; }
.stat-card--orange .stat-value { color: #ea580c; }
.stat-card--yellow .stat-value { color: #92700a; }
.stat-card--navy   .stat-value { color: var(--color-navy); }
.stat-card--gold   .stat-value { color: #7a5200; }
.stat-card--red    .stat-value { color: #dc2626; }

.stat-label {
  font-size: 0.7rem;
  color: var(--color-text-light);
  margin-top: 0.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

/* ── Progress bar ── */
.progress-bar {
  height: 4px;
  border-radius: 2px;
  background: var(--color-gray-border);
  overflow: hidden;
  margin-top: 10px;
  margin-bottom: 7px;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  animation: barGrow 0.8s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  animation-delay: calc(var(--index) * 70ms + 200ms);
}

.fill--blue   { background: var(--color-primary-light); }
.fill--green  { background: #16a34a; }
.fill--orange { background: #ea580c; }
.fill--yellow { background: var(--color-gold); }
.fill--navy   { background: var(--color-navy); }
.fill--gold   { background: var(--color-gold-dark); }
.fill--red    { background: #dc2626; }

/* ── Trend footer ── */
.stat-footer {
  display: flex;
  align-items: center;
  gap: 6px;
}

.trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
}
.trend--up   { background: rgba(22, 163, 74, 0.12);  color: #15803d; }
.trend--down { background: rgba(220, 38, 38, 0.1);   color: #dc2626; }

.vs {
  font-size: 0.62rem;
  color: var(--color-text-light);
  font-weight: 500;
}

/* ── Watermark ── */
.stat-watermark {
  position: absolute;
  right: -10px;
  bottom: -10px;
  font-size: 4rem;
  opacity: 0.04;
  pointer-events: none;
  transition: opacity 0.22s ease;
}
.stat-card:hover .stat-watermark { opacity: 0.08; }

/* ── Responsive ── */
@media (max-width: 480px) {
  .stat-value    { font-size: 1.45rem; }
  .stat-icon-wrap { width: 42px; height: 42px; font-size: 1.1rem; }
}
</style>