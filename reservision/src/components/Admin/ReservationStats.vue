<template>
  <div class="stats-grid">
    <div
      v-for="(stat, index) in stats"
      :key="stat.label"
      class="stat-card"
      :class="`stat-card--${colorMap[stat.type] || stat.color || 'blue'}`"
      :style="{ '--index': index }"
    >
      <!-- Top accent bar (via ::before) -->

      <!-- Icon -->
      <div class="stat-icon-wrap" :class="`stat-icon--${colorMap[stat.type] || stat.color || 'blue'}`">
        <i :class="stat.icon"></i>
      </div>

      <!-- Info -->
      <div class="stat-info">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>

        <!-- Optional trend footer -->
        <div v-if="stat.trend !== undefined" class="stat-footer">
          <span class="trend" :class="stat.trend >= 0 ? 'trend--up' : 'trend--down'">
            <i :class="stat.trend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ Math.abs(stat.trend) }}%
          </span>
          <span class="vs">vs last month</span>
        </div>

        <!-- Optional sub label -->
        <p v-if="stat.sub" class="stat-sub">{{ stat.sub }}</p>
      </div>

      <!-- Watermark -->
      <div class="stat-watermark">
        <i :class="stat.icon"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Array,
    required: true
  }
})

// Maps the original type class names to the StatCard color system
const colorMap = {
  confirmed:  'green',
  pending:    'yellow',
  cancelled:  'red',
  blue:       'blue',
  green:      'green',
  amber:      'orange',
  navy:       'navy',
  gold:       'gold',
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

/* ── Trend footer ── */
.stat-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
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

/* ── Sub label ── */
.stat-sub {
  margin: 5px 0 0;
  font-size: 0.65rem;
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
  .stat-value     { font-size: 1.45rem; }
  .stat-icon-wrap { width: 42px; height: 42px; font-size: 1.1rem; }
}
</style>