<template>
  <div class="stats-section">
    <div class="stat-card stat-card--blue" style="--index: 0">
      <div class="stat-icon-wrap stat-icon--blue">
        <i class="fas fa-users"></i>
      </div>

      <div class="stat-info">
        <h3 class="stat-value">{{ stats.total }}</h3>
        <p class="stat-label">Total Users</p>
      </div>

      <div class="stat-watermark">
        <i class="fas fa-users"></i>
      </div>
    </div>

    <div class="stat-card stat-card--green" style="--index: 1">
      <div class="stat-icon-wrap stat-icon--green">
        <i class="fas fa-user-shield"></i>
      </div>

      <div class="stat-info">
        <h3 class="stat-value">{{ stats.admins }}</h3>
        <p class="stat-label">Admins</p>
      </div>

      <div class="stat-watermark">
        <i class="fas fa-user-shield"></i>
      </div>
    </div>

    <div class="stat-card stat-card--orange" style="--index: 2">
      <div class="stat-icon-wrap stat-icon--orange">
        <i class="fas fa-user-tie"></i>
      </div>

      <div class="stat-info">
        <h3 class="stat-value">{{ stats.staff }}</h3>
        <p class="stat-label">Staff</p>
      </div>

      <div class="stat-watermark">
        <i class="fas fa-user-tie"></i>
      </div>
    </div>

    <div class="stat-card stat-card--yellow" style="--index: 3">
      <div class="stat-icon-wrap stat-icon--yellow">
        <i class="fas fa-user"></i>
      </div>

      <div class="stat-info">
        <h3 class="stat-value">{{ stats.customers }}</h3>
        <p class="stat-label">Customers</p>
      </div>

      <div class="stat-watermark">
        <i class="fas fa-user"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      total: 0,
      admins: 0,
      staff: 0,
      customers: 0
    })
  }
})
</script>

<style scoped>
/* ── Color Palette ── */
.stats-section {
  --color-primary: #0369a1;
  --color-primary-light: #1f8dbf;
  --color-gold: #f4c400;
  --color-navy: #0c3b5e;
  --color-white: #ffffff;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;
}

/* ── Animation ── */
@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Grid ── */
.stats-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* ── Card ── */
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

/* top accent */
.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 16px 16px 0 0;
}

.stat-card--blue::before {
  background: var(--color-primary-light);
}
.stat-card--green::before {
  background: #16a34a;
}
.stat-card--orange::before {
  background: #ea580c;
}
.stat-card--yellow::before {
  background: var(--color-gold);
}

/* ── Icon ── */
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

.stat-icon--blue {
  background: rgba(31, 141, 191, 0.12);
  color: var(--color-primary-light);
}

.stat-icon--green {
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
}

.stat-icon--orange {
  background: rgba(234, 88, 12, 0.1);
  color: #ea580c;
}

.stat-icon--yellow {
  background: rgba(244, 196, 0, 0.15);
  color: #92700a;
}

/* ── Info ── */
.stat-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.stat-value {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-text-dark);
}

.stat-card--blue .stat-value {
  color: var(--color-primary-light);
}
.stat-card--green .stat-value {
  color: #16a34a;
}
.stat-card--orange .stat-value {
  color: #ea580c;
}
.stat-card--yellow .stat-value {
  color: #92700a;
}

.stat-label {
  margin: 0.3rem 0 0;
  font-size: 0.72rem;
  color: var(--color-text-light);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
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

.stat-card:hover .stat-watermark {
  opacity: 0.08;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .stat-value {
    font-size: 1.45rem;
  }

  .stat-icon-wrap {
    width: 42px;
    height: 42px;
    font-size: 1.1rem;
  }

  .stat-card {
    padding: 1rem;
    gap: 0.75rem;
  }
}
</style>