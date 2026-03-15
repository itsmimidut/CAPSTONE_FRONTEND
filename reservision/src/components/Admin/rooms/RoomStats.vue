<template>
  <div class="stats-grid">

    <div class="stat-card stat-card--blue">
      <div class="stat-icon icon--blue">
        <i class="fas fa-bed"></i>
      </div>
      <div class="stat-info">
        <h3>{{ roomStore.totalRooms }}</h3>
        <p>Total Rooms</p>
      </div>
    </div>

    <div class="stat-card stat-card--green">
      <div class="stat-icon icon--green">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="stat-info">
        <h3>{{ roomStore.availableRooms }}</h3>
        <p>Available</p>
      </div>
    </div>

    <div class="stat-card stat-card--amber">
      <div class="stat-icon icon--amber">
        <i class="fas fa-user-friends"></i>
      </div>
      <div class="stat-info">
        <h3>{{ roomStore.occupiedRooms }}</h3>
        <p>Occupied</p>
      </div>
    </div>

    <div class="stat-card stat-card--navy">
      <div class="stat-icon icon--navy">
        <i class="fas fa-tools"></i>
      </div>
      <div class="stat-info">
        <h3>{{ roomStore.maintenanceRooms }}</h3>
        <p>Under Maintenance</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useRoomStore } from '@/stores/roomStore'
const roomStore = useRoomStore()
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
  --color-gray-bg:       #f9fafb;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
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

/* ── Shared card base
   #dbeafe — slightly darker than #eff6ff section bg,
   consistent with RestaurantMenu, MenuSection, InventorySection
── */
.stat-card {
  background: #dbeafe;
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border: none;
  box-shadow: 0 2px 8px rgba(3,105,161,0.07);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  /* Left accent bar per card type — structural, not noisy */
  border-left: 3px solid transparent;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(3,105,161,0.12);
}
.stat-card:hover .stat-icon { transform: scale(1.1) rotate(-4deg); }

/* Per-card accent colours */
.stat-card--blue  { border-left-color: var(--color-primary-light); }
.stat-card--green { border-left-color: #10b981; }
.stat-card--amber { border-left-color: #f59e0b; }
.stat-card--navy  { border-left-color: var(--color-navy); }

/* ── Icons ── */
.stat-icon {
  width: 46px; height: 46px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; flex-shrink: 0;
  transition: transform 0.2s ease;
}

.icon--blue  { background: rgba(31,141,191,0.15); color: var(--color-primary-light); }
.icon--green { background: rgba(16,185,129,0.15); color: #15803d; }
.icon--amber { background: rgba(245,158,11,0.15); color: #b45309; }
.icon--navy  { background: rgba(12,59,94,0.12);   color: var(--color-navy); }

/* ── Text ── */
.stat-info h3 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--color-text-dark);
}

/* Value colours per card */
.stat-card--blue  .stat-info h3 { color: var(--color-primary-light); }
.stat-card--green .stat-info h3 { color: #15803d; }
.stat-card--amber .stat-info h3 { color: #b45309; }
.stat-card--navy  .stat-info h3 { color: var(--color-navy); }

.stat-info p {
  margin: 0.2rem 0 0;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
</style>