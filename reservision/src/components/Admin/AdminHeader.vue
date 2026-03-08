<template>
  <!-- ══ POS MODE ════════════════════════════════════════════ -->
  <div v-if="posMode" class="page-header pos-mode">

    <!-- LEFT: Brand -->
    <div class="header-left">
      <button class="mobile-menu-btn" @click="$emit('toggle-sidebar')">
        <i class="fas fa-bars"></i>
      </button>
      <div class="pos-brand">
        <span class="pos-brand-name">Eduardo's Resort</span>
        <span class="pos-brand-pill"><i class="fas fa-cash-register"></i> POS</span>
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
      <button v-if="searchQuery" class="pos-search-clear" @click="$emit('update:searchQuery', ''); $emit('search')">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- RIGHT: Quick Actions -->
    <div class="header-right">
      <!-- Scan -->
      <button class="pos-action-btn pos-action-scan" @click="$emit('scan')" title="Check-in Scanner">
        <i class="fas fa-qrcode"></i>
        <span class="pos-action-label">Scan</span>
      </button>

      <!-- Category buttons -->
      <div class="pos-cat-group">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['pos-cat-btn', currentCategory === cat.id ? 'pos-cat-btn--active' : '']"
          @click="$emit('category-change', cat.id)"
          :title="cat.name"
        >
          <i :class="`fas fa-${cat.icon}`"></i>
          <span class="pos-cat-label">{{ cat.name }}</span>
        </button>
      </div>

      <div class="pos-divider"></div>

      <!-- Transaction History -->
      <button
        :class="['pos-action-btn', showTransaction ? 'pos-action-btn--active' : '']"
        @click="$emit('toggle-transaction')"
        title="Transaction History"
      >
        <i class="fas fa-history"></i>
        <span v-if="eshopPendingCount > 0" class="pos-badge">{{ eshopPendingCount > 9 ? '9+' : eshopPendingCount }}</span>
      </button>

      <!-- Fullscreen -->
      <button class="pos-action-btn" @click="$emit('toggle-fullscreen')" :title="isFullscreen ? 'Exit Fullscreen (Ctrl+F12)' : 'Fullscreen (Ctrl+F12)'">
        <i :class="isFullscreen ? 'fas fa-compress-arrows-alt' : 'fas fa-expand-arrows-alt'"></i>
      </button>

      <!-- User avatar -->
      <div class="user-initial" :title="userName">{{ userInitial }}</div>
    </div>

  </div>

  <!-- ══ NORMAL MODE ══════════════════════════════════════════ -->
  <div v-else class="page-header">
    <div class="header-left">
      <button @click="$emit('toggle-sidebar')" class="mobile-menu-btn">
        <i class="fas fa-bars"></i>
      </button>
      <div class="header-title">
        <h1 tabindex="-1" class="no-highlight">{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
    </div>

    <div class="header-right">
      <button class="notification-bell" :class="{ 'has-notifications': hasNotifications }">
        <i class="fas fa-bell"></i>
        <span v-if="hasNotifications" class="notification-badge">
          {{ pendingCount > 9 ? '9+' : pendingCount }}
        </span>
      </button>
      <div class="user-initial">{{ userInitial }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // shared
  title:             { type: String,  default: 'Dashboard' },
  subtitle:          { type: String,  default: 'Welcome back, Admin' },
  userName:          { type: String,  default: 'Admin User' },
  hasNotifications:  { type: Boolean, default: false },
  pendingCount:      { type: Number,  default: 0 },
  // POS mode
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

const userInitial = computed(() => props.userName.charAt(0).toUpperCase())
</script>

<style scoped>
/* ========================================
   Base header (shared)
======================================== */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 3px solid #F4C400;
  border-bottom: 1px solid rgba(31, 141, 191, 0.1);
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);
  padding: 0.4rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 200;
  transition: margin-left 0.3s ease;
}

@media (min-width: 768px) {
  .page-header { margin-left: 260px; }
}

/* ── Shared elements ─────────────── */
.header-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
}

.mobile-menu-btn {
  font-size: 1.1rem;
  color: #1F8DBF;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.4rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}
.mobile-menu-btn:hover { background: rgba(244,196,0,0.1); color: #F4C400; transform: scale(1.05); }
.mobile-menu-btn:hover i { transform: rotate(90deg); }
.mobile-menu-btn i { transition: transform 0.2s; }

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* User Initial */
.user-initial {
  width: 2.5rem; height: 2.5rem;
  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: #ffffff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 1rem;
  box-shadow: 0 4px 12px rgba(31,141,191,0.3);
  border: 2px solid #F4C400;
  transition: all 0.2s;
  cursor: pointer;
  flex-shrink: 0;
}
.user-initial:hover { transform: scale(1.05); }

/* ══════════════════════════════════════
   NORMAL MODE
══════════════════════════════════════ */
.header-title { display: flex; flex-direction: column; gap: 0.25rem; }

.header-title h1 {
  margin: 0; font-size: 1.5rem; font-weight: 700; color: #1F8DBF; line-height: 1.2;
  background: rgba(31,141,191,0.05); border-radius: 0.5rem;
  padding: 0.25rem 0.75rem; outline: none;
  user-select: none; pointer-events: none;
  border-left: 3px solid #F4C400;
}
.no-highlight { user-select: none; pointer-events: none; }
.header-title p { margin: 0; font-size: 0.875rem; color: #1E88B6; font-weight: 500; }

.notification-bell {
  position: relative; padding: 0.5rem; border-radius: 50%;
  color: #1F8DBF; background: none; border: none; cursor: pointer;
  transition: all 0.2s; width: 2.5rem; height: 2.5rem;
  display: flex; align-items: center; justify-content: center;
}
.notification-bell:hover { background: rgba(244,196,0,0.1); color: #F4C400; transform: scale(1.05); }
.notification-bell.has-notifications { color: #F4C400; }
.notification-bell.has-notifications::after {
  content: ''; position: absolute; top: 0.3rem; right: 0.3rem;
  width: 8px; height: 8px; background: #F4C400;
  border-radius: 50%; border: 2px solid white;
}
.notification-badge {
  position: absolute; top: 0.1rem; right: 0.1rem;
  min-width: 1.2rem; height: 1.2rem;
  background: #F4C400; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #1F8DBF; font-weight: 700; font-size: 0.7rem;
  border: 2px solid #fff; box-shadow: 0 0 10px rgba(244,196,0,0.4);
}

/* ══════════════════════════════════════
   POS MODE
══════════════════════════════════════ */
.pos-mode {
  height: 72px;
  padding: 0 1rem;
  gap: 0.75rem;
}

/* Brand */
.pos-brand { display: flex; flex-direction: column; line-height: 1.1; }
.pos-brand-name { font-size: 0.78rem; font-weight: 700; color: #1F8DBF; white-space: nowrap; }
.pos-brand-pill {
  display: inline-flex; align-items: center; gap: 4px;
  background: #F4C400; color: #1a1a1a;
  font-size: 0.65rem; font-weight: 800;
  padding: 1px 7px; border-radius: 20px;
  width: fit-content;
}

/* Search */
.pos-search-wrap {
  flex: 1; min-width: 0; position: relative;
  display: flex; align-items: center;
}
.pos-search-icon {
  position: absolute; left: 12px; color: #94a3b8;
  font-size: 0.85rem; pointer-events: none;
}
.pos-search-input {
  width: 100%; height: 38px;
  padding: 0 36px 0 36px;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 0.875rem; color: #1e293b; background: #f8fafc;
  outline: none; transition: all 0.15s;
}
.pos-search-input:focus { border-color: #1F8DBF; background: #fff; box-shadow: 0 0 0 3px rgba(31,141,191,0.1); }
.pos-search-input::placeholder { color: #94a3b8; }
.pos-search-clear {
  position: absolute; right: 10px;
  background: none; border: none; color: #94a3b8;
  font-size: 0.75rem; cursor: pointer; padding: 4px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: color 0.15s;
}
.pos-search-clear:hover { color: #ef4444; }

/* Action buttons */
.pos-action-btn {
  position: relative;
  display: flex; align-items: center; gap: 5px;
  height: 36px; padding: 0 0.75rem;
  border: 1.5px solid #e2e8f0; background: #f8fafc;
  color: #475569; border-radius: 9px;
  font-size: 0.82rem; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: all 0.15s;
}
.pos-action-btn i { font-size: 0.9rem; }
.pos-action-btn:hover { border-color: #1F8DBF; color: #1F8DBF; background: #f0f8fd; }
.pos-action-btn--active { background: #1F8DBF; color: #fff; border-color: #1F8DBF; }
.pos-action-btn--active:hover { background: #1677a3; border-color: #1677a3; }
.pos-action-scan { border-color: #1F8DBF; color: #1F8DBF; }
.pos-action-scan:hover { background: #1F8DBF; color: #fff; }
.pos-action-label { font-size: 0.78rem; }

.pos-badge {
  position: absolute; top: -5px; right: -5px;
  background: #ef4444; color: #fff;
  font-size: 0.58rem; font-weight: 800;
  min-width: 16px; height: 16px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px; border: 1.5px solid #fff;
}

/* Divider */
.pos-divider { width: 1px; height: 28px; background: #e2e8f0; margin: 0 0.1rem; }

/* Category group */
.pos-cat-group { display: flex; align-items: center; gap: 0.3rem; }
.pos-cat-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; height: 40px; min-width: 52px; padding: 0 0.5rem;
  border: 1.5px solid #e2e8f0; background: #f8fafc;
  color: #475569; border-radius: 10px;
  font-size: 0.65rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.pos-cat-btn i { font-size: 0.95rem; }
.pos-cat-btn:hover { border-color: #1F8DBF; color: #1F8DBF; background: #f0f8fd; }
.pos-cat-btn--active { background: #1F8DBF; color: #fff; border-color: #1F8DBF; }
.pos-cat-btn--active:hover { background: #1677a3; }
.pos-cat-label { font-size: 0.6rem; line-height: 1; }

/* ── Responsive normal mode ─────── */
@media (max-width: 768px) {
  .page-header { padding: 0.4rem 1rem; }
  .header-title h1 { font-size: 1.25rem; padding: 0.2rem 0.5rem; }
  .header-title p { font-size: 0.8rem; }
  .user-initial { width: 2.25rem; height: 2.25rem; font-size: 0.9rem; }
  .notification-bell { width: 2.25rem; height: 2.25rem; }
}
@media (max-width: 480px) {
  .header-title h1 { font-size: 1rem; }
  .header-title p { font-size: 0.7rem; }
  .user-initial { width: 2rem; height: 2rem; font-size: 0.8rem; }
}

/* ── Responsive POS mode ────────── */
@media (max-width: 1100px) {
  .pos-action-label { display: none; }
  .pos-action-btn { padding: 0 0.6rem; }
  .pos-cat-label { display: none; }
  .pos-cat-btn { min-width: 38px; }
}
@media (max-width: 900px) {
  .pos-brand-name { display: none; }
  .pos-cat-group { display: none; }
}
</style>


<style scoped>
/* ========================================
   Tropical Resort Color Palette
   - Ocean Blue:     #1F8DBF (primary)
   - Ocean Deep:     #1E88B6 (secondary)
   - Ocean Pale:     rgba(31, 141, 191, 0.1)
   - Gold Accent:    #F4C400 (primary)
   - Gold Deep:      #F2C200 (secondary)
   - Gold Pale:      rgba(244, 196, 0, 0.1)
   - Text Dark:      #1F8DBF (primary text)
   - Text Light:     #1E88B6 (secondary text)
   ======================================== */

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;

  background: #ffffff;
  border-top: 3px solid #F4C400;
  border-bottom: 1px solid rgba(31, 141, 191, 0.1);
  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.08);

  padding: 0.4rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 200;
  transition: margin-left 0.3s ease;
}

@media (min-width: 768px) {
  .page-header {
    margin-left: 260px;
  }
}

/* ── Left ───────────────────────── */

.header-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.mobile-menu-btn {
  font-size: 1.1rem;
  color: #1F8DBF;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.4rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.mobile-menu-btn:hover {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  transform: scale(1.05);
}

.mobile-menu-btn i {
  transition: transform 0.2s;
}

.mobile-menu-btn:hover i {
  transform: rotate(90deg);
}

.header-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.header-title h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F8DBF;
  line-height: 1.2;

  background: rgba(31, 141, 191, 0.05);
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  outline: none;
  user-select: none;
  pointer-events: none;
  border-left: 3px solid #F4C400;
}

.no-highlight {
  user-select: none;
  pointer-events: none;
}

.header-title p {
  margin: 0;
  font-size: 0.875rem;
  color: #1E88B6;
  font-weight: 500;
}

/* ── Right ──────────────────────── */

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Notification Bell */
.notification-bell {
  position: relative;
  padding: 0.5rem;
  border-radius: 50%;
  color: #1F8DBF;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-bell:hover {
  background: rgba(244, 196, 0, 0.1);
  color: #F4C400;
  transform: scale(1.05);
}

.notification-bell.has-notifications {
  color: #F4C400;
}

.notification-bell.has-notifications::after {
  content: '';
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  width: 8px;
  height: 8px;
  background: #F4C400;
  border-radius: 50%;
  border: 2px solid white;
}

/* Badge */
.notification-badge {
  position: absolute;
  top: 0.1rem;
  right: 0.1rem;
  min-width: 1.2rem;
  height: 1.2rem;

  background: #F4C400;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  color: #1F8DBF;
  font-weight: 700;
  font-size: 0.7rem;
  border: 2px solid #ffffff;
  box-shadow: 0 0 10px rgba(244, 196, 0, 0.4);
}

/* User Initial Circle */
.user-initial {
  width: 2.5rem;
  height: 2.5rem;

  background: linear-gradient(135deg, #1F8DBF 0%, #1E88B6 100%);
  color: #ffffff;

  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;

  box-shadow: 0 4px 12px rgba(31, 141, 191, 0.3);
  border: 2px solid #F4C400;
  transition: all 0.2s;
}

.user-initial:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(31, 141, 191, 0.4);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    padding: 0.4rem 1rem;
  }

  .header-title h1 {
    font-size: 1.25rem;
    padding: 0.2rem 0.5rem;
  }

  .header-title p {
    font-size: 0.8rem;
  }

  .user-initial {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.9rem;
  }

  .notification-bell {
    width: 2.25rem;
    height: 2.25rem;
  }
}

@media (max-width: 480px) {
  .header-title h1 {
    font-size: 1rem;
  }

  .header-title p {
    font-size: 0.7rem;
  }

  .user-initial {
    width: 2rem;
    height: 2rem;
    font-size: 0.8rem;
  }
}
</style>