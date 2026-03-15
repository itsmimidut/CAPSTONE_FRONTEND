<!-- src/components/StatCard.vue -->
<template>
  <div class="stat-card" :class="`stat-card--${color}`">
    <div class="stat-icon-wrap" :class="`stat-icon--${color}`">
      <i :class="`fas ${icon}`"></i>
    </div>
    <div class="stat-info">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
    <div class="stat-watermark">
      <i :class="`fas ${icon}`"></i>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon:  { type: String,           required: true },
  color: { type: String,           required: true }, // blue, green, orange, yellow, navy, gold, red
  value: { type: [Number, String], required: true },
  label: { type: String,           required: true }
})
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.stat-card {
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
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  transition: transform 0.22s ease;
}
.stat-card:hover .stat-icon-wrap {
  transform: scale(1.1) rotate(-4deg);
}

.stat-icon--blue   { background: rgba(31, 141, 191, 0.12); color: var(--color-primary-light); }
.stat-icon--green  { background: rgba(22, 163, 74, 0.12);  color: #16a34a; }
.stat-icon--orange { background: rgba(234, 88, 12, 0.1);   color: #ea580c; }
.stat-icon--yellow { background: rgba(244, 196, 0, 0.15);  color: #92700a; }
.stat-icon--navy   { background: rgba(12, 59, 94, 0.1);    color: var(--color-navy); }
.stat-icon--gold   { background: rgba(242, 194, 0, 0.15);  color: #7a5200; }
.stat-icon--red    { background: rgba(220, 38, 38, 0.1);   color: #dc2626; }

/* ── Stat content ── */
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
  transition: color 0.2s;
}

/* Value color per variant */
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

/* ── Watermark background icon ── */
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
</style>