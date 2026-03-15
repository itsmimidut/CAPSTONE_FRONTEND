<template>
  <!-- ══ POS MODE ══ -->
  <div v-if="posMode" class="page-header pos-mode">

    <!-- LEFT: Brand -->
    <div class="header-left">
      <button class="menu-btn" @click="$emit('toggle-sidebar')">
        <i class="fas fa-bars"></i>
      </button>
      <div class="pos-brand">
        <span class="pos-brand-name">Eduardo's Resort</span>
        <span class="pos-brand-pill">
          <i class="fas fa-cash-register"></i> POS
        </span>
      </div>
    </div>

    <!-- CENTER: Search -->
    <div class="pos-search-wrap">
      <i class="fas fa-search pos-search-icon"></i>
      <input
        type="text"
        class="pos-search-input"
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value); $emit('search')"
        placeholder="Search food, drinks, services…"
        autocomplete="off"
      />
      <transition name="fade">
        <button
          v-if="searchQuery"
          class="pos-search-clear"
          @click="$emit('update:searchQuery', ''); $emit('search')"
        >
          <i class="fas fa-times"></i>
        </button>
      </transition>
    </div>

    <!-- RIGHT: Quick Actions -->
    <div class="header-right">

      <!-- Scan -->
      <button class="pos-action-btn pos-action-scan" @click="$emit('scan')" title="QR Check-in Scanner">
        <i class="fas fa-qrcode"></i>
        <span class="action-label">Scan</span>
      </button>

      <!-- Category tabs -->
      <div class="pos-cat-group">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['pos-cat-btn', currentCategory === cat.id ? 'pos-cat-btn--active' : '']"
          @click="$emit('category-change', cat.id)"
          :title="cat.name"
        >
          <i :class="`fas fa-${cat.icon}`"></i>
          <span class="cat-label">{{ cat.name }}</span>
        </button>
      </div>

      <span class="pos-divider"></span>

      <!-- Transaction History -->
      <button
        :class="['pos-action-btn', showTransaction ? 'pos-action-btn--active' : '']"
        @click="$emit('toggle-transaction')"
        title="Transaction History"
      >
        <i class="fas fa-history"></i>
        <span
          v-if="eshopPendingCount > 0"
          class="pos-badge"
        >{{ eshopPendingCount > 9 ? '9+' : eshopPendingCount }}</span>
      </button>

      <!-- Fullscreen -->
      <button
        class="pos-action-btn"
        @click="$emit('toggle-fullscreen')"
        :title="isFullscreen ? 'Exit Fullscreen (Ctrl+F12)' : 'Fullscreen (Ctrl+F12)'"
      >
        <i :class="isFullscreen ? 'fas fa-compress-arrows-alt' : 'fas fa-expand-arrows-alt'"></i>
      </button>

      <!-- Avatar -->
      <div class="header-avatar" :title="userName">
        {{ userInitial }}
        <span class="avatar-ring"></span>
      </div>

    </div>
  </div>

  <!-- ══ NORMAL MODE ══ -->
  <div v-else class="page-header">

    <div class="header-left">
      <button class="menu-btn" @click="$emit('toggle-sidebar')">
        <i class="fas fa-bars"></i>
      </button>
      <div class="header-title-block">
        <h1 class="header-title">{{ title }}</h1>
        <p class="header-subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div class="header-right">
      <button
        class="notif-btn"
        :class="{ 'notif-btn--active': hasNotifications }"
        title="Notifications"
      >
        <i class="fas fa-bell"></i>
        <span v-if="hasNotifications" class="notif-badge">
          {{ pendingCount > 9 ? '9+' : pendingCount }}
        </span>
      </button>
      <div class="header-avatar" :title="userName">
        {{ userInitial }}
        <span class="avatar-ring"></span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title:             { type: String,  default: 'Dashboard' },
  subtitle:          { type: String,  default: 'Welcome back, Admin' },
  userName:          { type: String,  default: 'Admin User' },
  hasNotifications:  { type: Boolean, default: false },
  pendingCount:      { type: Number,  default: 0 },
  posMode:           { type: Boolean, default: false },
  categories:        { type: Array,   default: () => [] },
  currentCategory:   { type: String,  default: '' },
  searchQuery:       { type: String,  default: '' },
  eshopPendingCount: { type: Number,  default: 0 },
  showTransaction:   { type: Boolean, default: false },
  isFullscreen:      { type: Boolean, default: false },
})

defineEmits([
  'toggle-sidebar',
  'update:searchQuery',
  'search',
  'scan',
  'category-change',
  'toggle-transaction',
  'toggle-fullscreen',
])

const userInitial = computed(() => (props.userName?.charAt(0) || 'A').toUpperCase())
</script>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.page-header {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark:  #1E88B6;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-white:         #FFFFFF;
  --color-white-soft:    rgba(255, 255, 255, 0.1);
  --color-gray-bg:       #f9fafb;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

/* ── Keyframes ── */
@keyframes ringPulse {
  0%, 100% { opacity: 0.5;  transform: scale(1); }
  50%       { opacity: 0.9;  transform: scale(1.07); }
}
@keyframes bellShake {
  0%, 85%, 100% { transform: rotate(0deg); }
  88%  { transform: rotate(-12deg); }
  91%  { transform: rotate(12deg); }
  94%  { transform: rotate(-8deg); }
  97%  { transform: rotate(8deg); }
}
@keyframes badgePop {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.2); }
}
@keyframes shimmer {
  0%   { left: -60%; }
  100% { left: 110%; }
}

/* ── Base header shell ── */
.page-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 64px;
  /* Navy matches the sidebar's body color for a unified frame */
  background: var(--color-navy);
  /* Gold bottom border — same weight & color as sidebar's right border */
  border-bottom: 3px solid var(--color-gold);
  box-shadow: 0 2px 16px rgba(12, 59, 94, 0.35);
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 200;
  transition: margin-left 0.3s ease;
  overflow: hidden;
}

/* Shimmer sweep — uses gold tint for palette consistency */
.page-header::after {
  content: '';
  position: absolute;
  top: 0; left: -60%;
  width: 35%; height: 100%;
  background: rgba(244, 196, 0, 0.04);
  transform: skewX(-15deg);
  animation: shimmer 6s ease-in-out infinite;
  pointer-events: none;
}

@media (min-width: 768px) {
  .page-header { margin-left: 262px; }
}

/* ── Layout helpers ── */
.header-left {
  display: flex; align-items: center; gap: 0.65rem;
  flex-shrink: 0;
}
.header-right {
  display: flex; align-items: center; gap: 0.4rem;
  flex-shrink: 0;
}

/* ── Hamburger button ── */
.menu-btn {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: var(--color-white-soft);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--color-white);
  font-size: 0.95rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.18s ease, border-color 0.18s ease;
  flex-shrink: 0;
}
.menu-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--color-gold);
}
.menu-btn i { transition: transform 0.28s ease, color 0.18s ease; }
.menu-btn:hover i { transform: rotate(90deg); color: var(--color-gold); }

/* ── Normal header title block ── */
.header-title-block { display: flex; flex-direction: column; gap: 0.05rem; }

.header-title {
  margin: 0;
  font-size: 1rem; font-weight: 800;
  color: var(--color-white);
  line-height: 1.2;
  display: flex; align-items: center; gap: 0.5rem;
}
/* Gold left accent bar — mirrors the sidebar active-link indicator */
.header-title::before {
  content: '';
  display: inline-block;
  width: 3px; height: 1em;
  background: var(--color-gold);
  border-radius: 2px; flex-shrink: 0;
}

.header-subtitle {
  margin: 0;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  padding-left: 0.55rem;
}

/* ── Notification bell ── */
.notif-btn {
  position: relative;
  width: 34px; height: 34px;
  border-radius: 10px;
  background: var(--color-white-soft);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--color-white);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.notif-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--color-gold);
}
.notif-btn:hover i { color: var(--color-gold); }

.notif-btn--active {
  background: rgba(244, 196, 0, 0.15);
  border-color: rgba(244, 196, 0, 0.5);
  animation: bellShake 4s ease-in-out infinite;
}
.notif-btn--active i { color: var(--color-gold); }

/* Gold badge (navy text) — matches brand pill in POS & sidebar badge style */
.notif-badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 1.1rem; height: 1.1rem;
  background: var(--color-gold);
  color: var(--color-navy);
  border-radius: 20px;
  font-weight: 800; font-size: 0.58rem;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--color-navy);
  animation: badgePop 2s ease-in-out infinite;
}

/* ── Avatar ── */
.header-avatar {
  position: relative;
  width: 34px; height: 34px;
  border-radius: 10px;
  background: var(--color-gold);
  color: var(--color-navy);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.9rem;
  cursor: pointer; flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.header-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 14px rgba(244, 196, 0, 0.4);
}
.avatar-ring {
  position: absolute; inset: -3px;
  border-radius: 12px;
  border: 2px solid var(--color-gold-dark);
  opacity: 0.5;
  animation: ringPulse 3s ease-in-out infinite;
  pointer-events: none;
}

/* ═════════════════════════════════════
   POS MODE
═════════════════════════════════════ */
.pos-mode {
  height: 64px;
  padding: 0 1rem;
  gap: 0.6rem;
}

/* ── POS Brand ── */
.pos-brand { display: flex; flex-direction: column; line-height: 1.15; }
.pos-brand-name {
  font-size: 0.76rem; font-weight: 700;
  color: rgba(255, 255, 255, 0.85); white-space: nowrap;
}
/* Gold pill — same palette as sidebar role badge */
.pos-brand-pill {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--color-gold);
  color: var(--color-navy);
  font-size: 0.6rem; font-weight: 800;
  padding: 2px 7px; border-radius: 20px;
  width: fit-content; letter-spacing: 0.3px;
}

/* ── Search ── */
.pos-search-wrap {
  flex: 1; min-width: 0;
  position: relative; display: flex; align-items: center;
}
.pos-search-icon {
  position: absolute; left: 11px;
  color: var(--color-text-light); font-size: 0.82rem; pointer-events: none;
}
.pos-search-input {
  width: 100%; height: 38px;
  padding: 0 36px 0 34px;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  font-size: 0.875rem;
  color: var(--color-text-dark);
  background: rgba(255, 255, 255, 0.92);
  outline: none; transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
.pos-search-input:focus {
  border-color: var(--color-gold);
  background: var(--color-white);
  box-shadow: 0 0 0 3px rgba(244, 196, 0, 0.2);
}
.pos-search-input::placeholder { color: var(--color-text-light); }
.pos-search-clear {
  position: absolute; right: 9px;
  background: none; border: none;
  color: var(--color-text-light); font-size: 0.72rem;
  cursor: pointer; padding: 4px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: color 0.15s, background 0.15s;
}
.pos-search-clear:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* ── POS action buttons ── */
.pos-action-btn {
  position: relative;
  display: flex; align-items: center; gap: 5px;
  height: 36px; padding: 0 0.75rem;
  background: var(--color-white-soft);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-white);
  border-radius: 10px;
  font-size: 0.8rem; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}
.pos-action-btn i { font-size: 0.88rem; transition: transform 0.18s, color 0.18s; }
.pos-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--color-gold);
  transform: translateY(-1px);
}
.pos-action-btn:hover i { color: var(--color-gold); transform: scale(1.15); }

/* Active state uses palette gold tint */
.pos-action-btn--active {
  background: rgba(244, 196, 0, 0.15);
  border-color: var(--color-gold);
  box-shadow: 0 0 0 1px rgba(244, 196, 0, 0.3);
}
.pos-action-btn--active i { color: var(--color-gold); }
.pos-action-btn--active:hover { transform: none; }

/* Scan = gold CTA — uses palette tokens */
.pos-action-scan {
  background: rgba(244, 196, 0, 0.18);
  border-color: rgba(244, 196, 0, 0.5);
}
.pos-action-scan:hover {
  background: var(--color-gold);
  border-color: var(--color-gold-dark);
  color: var(--color-navy);
}
.pos-action-scan:hover i       { color: var(--color-navy); }
.pos-action-scan:hover .action-label { color: var(--color-navy); }
.action-label { font-size: 0.75rem; color: var(--color-white); }

/* Red pending badge — consistent with sidebar nav-badge */
.pos-badge {
  position: absolute; top: -5px; right: -5px;
  background: #ef4444;
  color: var(--color-white);
  font-size: 0.56rem; font-weight: 800;
  min-width: 15px; height: 15px;
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px;
  border: 1.5px solid var(--color-navy);
  animation: badgePop 2s ease-in-out infinite;
}

/* Divider — uses white-soft palette token */
.pos-divider {
  width: 1px; height: 24px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 0.1rem; flex-shrink: 0;
}

/* ── Category group ── */
.pos-cat-group { display: flex; align-items: center; gap: 0.22rem; }

.pos-cat-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; height: 40px; min-width: 52px; padding: 0 0.5rem;
  background: var(--color-white-soft);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--color-white); border-radius: 10px;
  font-size: 0.62rem; font-weight: 600; cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}
.pos-cat-btn i { font-size: 0.9rem; transition: transform 0.18s, color 0.18s; }
.pos-cat-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(244, 196, 0, 0.5);
  transform: translateY(-1px);
}
.pos-cat-btn:hover i { color: var(--color-gold); transform: scale(1.12); }

/* Active category — gold tint matching pos-action-btn--active */
.pos-cat-btn--active {
  background: rgba(244, 196, 0, 0.15);
  border-color: var(--color-gold);
  box-shadow: 0 0 0 1px rgba(244, 196, 0, 0.25);
}
.pos-cat-btn--active i { color: var(--color-gold); }
.pos-cat-btn--active:hover { transform: none; }
.cat-label { font-size: 0.58rem; line-height: 1; color: var(--color-white); }

/* ── Search clear transition ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 1100px) {
  .action-label, .cat-label { display: none; }
  .pos-action-btn { padding: 0 0.55rem; }
  .pos-cat-btn    { min-width: 38px; }
}
@media (max-width: 900px) {
  .pos-brand-name { display: none; }
  .pos-cat-group  { display: none; }
}
@media (max-width: 768px) {
  .page-header    { padding: 0 1rem; margin-left: 0 !important; }
  .header-title   { font-size: 0.9rem; }
  .header-subtitle{ display: none; }
}
@media (max-width: 480px) {
  .pos-brand { display: none; }
}
</style>