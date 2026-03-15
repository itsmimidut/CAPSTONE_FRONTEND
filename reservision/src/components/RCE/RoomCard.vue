<template>
  <div class="room-card" :data-id="room.item_id || room.id">

    <!-- ── Image Wrap ── -->
    <div class="room-image-wrap">
      <img :src="primaryImage" :alt="room.name" class="room-img" />

      <!-- Status badge — top-left, SINGLE location -->
      <div class="room-badges room-badges--left">
        <span v-if="isEvent && room.status === 'Cancelled'"               class="room-badge badge--red">Cancelled</span>
        <span v-else-if="!isEvent && room.status === 'Under Maintenance'"  class="room-badge badge--amber">Maintenance</span>
        <span v-else-if="room.status === 'Occupied'"                      class="room-badge badge--navy">Occupied</span>
        <span v-else                                                       class="room-badge badge--green">Available</span>
      </div>

      <!-- Promo / type — top-right -->
      <div class="room-badges room-badges--right">
        <span v-if="room.promo && !isEvent"          class="room-badge badge--gold">Limited Offer</span>
        <span v-if="hasSeasonalPricing && !isEvent"  class="room-badge badge--blue">Seasonal</span>
        <span v-if="isEvent"                         class="room-badge badge--navy">{{ room.category || 'Event' }}</span>
      </div>

      <!-- Zoom button — bottom-left -->
      <button class="preview-btn" @click.stop="openPreview" title="View full image">
        <i class="fas fa-expand-alt"></i>
      </button>

      <!-- Price — bottom-right overlaid on image -->
      <div class="image-price">
        <span class="price-amount">₱{{ displayPrice }}</span>
        <span class="price-unit">{{ isEvent ? '/ event' : '/ night' }}</span>
      </div>
    </div>

    <!-- ── Card Body ── -->
    <div class="room-body">

      <!-- Room name + meta chips -->
      <div class="room-identity">
        <h3 class="room-title">{{ room.name }}</h3>
        <div class="room-chips">
          <span class="chip chip--type">{{ room.category }}</span>
          <span v-if="room.room_number" class="chip chip--num">
            {{ isEvent ? '📍' : '#' }}{{ room.room_number }}
          </span>
        </div>
      </div>

      <!-- Key stats: guests + photos only (status removed from here) -->
      <div class="room-stats">
        <div class="stat-item">
          <i class="fas fa-user-friends stat-icon"></i>
          <span class="stat-val">{{ room.max_guests || '—' }}</span>
          <span class="stat-lbl">{{ isEvent ? 'Capacity' : 'Guests' }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <i class="fas fa-images stat-icon"></i>
          <span class="stat-val">{{ room.images?.length || 0 }}</span>
          <span class="stat-lbl">Photos</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <i class="fas fa-box stat-icon"></i>
          <span class="stat-val">{{ room.quantity ?? 1 }}</span>
          <span class="stat-lbl">Available</span>
        </div>
      </div>

      <!-- Description -->
      <p class="room-desc">{{ room.description || 'No description provided.' }}</p>

      <!-- Action buttons -->
      <div class="room-actions">
        <button class="btn-edit" @click="$emit('edit')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-delete" @click="$emit('delete')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>

    </div>

    <!-- ── Lightbox / Image Preview Modal ── -->
    <Teleport to="body">
      <div v-if="previewOpen" class="lightbox-overlay" @click.self="closePreview">
        <div class="lightbox-box">

          <!-- Header -->
          <div class="lightbox-head">
            <div class="lightbox-head-left">
              <span class="lightbox-title">{{ room.name }}</span>
              <span class="lightbox-count">{{ activeIdx + 1 }} / {{ allImages.length }}</span>
            </div>
            <button class="lightbox-close" @click="closePreview">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Main image -->
          <div class="lightbox-img-wrap">
            <img :src="allImages[activeIdx]" :alt="room.name" class="lightbox-img" />

            <!-- Prev / Next -->
            <button v-if="allImages.length > 1" class="lightbox-nav lightbox-nav--prev" @click="prevImg">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button v-if="allImages.length > 1" class="lightbox-nav lightbox-nav--next" @click="nextImg">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <!-- Thumbnail strip -->
          <div class="lightbox-thumbs" v-if="allImages.length > 1">
            <img
              v-for="(img, i) in allImages"
              :key="i"
              :src="img"
              :alt="`Photo ${i+1}`"
              class="lightbox-thumb"
              :class="{ active: i === activeIdx }"
              @click="activeIdx = i"
            />
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  room: { type: Object, required: true }
})

defineEmits(['edit', 'delete'])

const BACKEND_URL = 'http://localhost:8000'

// ── Computed ──────────────────────────────────
const isEvent = computed(() =>
  props.room.category_type === 'event' || props.room.category === 'Event'
)

const resolveImg = (img) =>
  img?.startsWith('/') ? `${BACKEND_URL}${img}` : img

const allImages = computed(() => {
  if (!props.room.images?.length) return ['https://via.placeholder.com/800x500?text=No+Image']
  return props.room.images.map(resolveImg)
})

const primaryImage = computed(() => {
  const idx = props.room.primaryImageIndex || 0
  return allImages.value[idx] || allImages.value[0]
})

const displayPrice = computed(() =>
  Math.round(props.room.price || 0).toLocaleString()
)

const statusClass = computed(() => {
  if (props.room.status === 'Available') return 'status-available'
  if (props.room.status === 'Occupied')  return 'status-occupied'
  return 'status-maintenance'
})

const hasSeasonalPricing = computed(() => false)

// ── Lightbox ──────────────────────────────────
const previewOpen = ref(false)
const activeIdx   = ref(0)

const openPreview = () => {
  activeIdx.value = props.room.primaryImageIndex || 0
  previewOpen.value = true
  document.body.style.overflow = 'hidden'
}
const closePreview = () => {
  previewOpen.value = false
  document.body.style.overflow = ''
}
const prevImg = () => {
  activeIdx.value = (activeIdx.value - 1 + allImages.value.length) % allImages.value.length
}
const nextImg = () => {
  activeIdx.value = (activeIdx.value + 1) % allImages.value.length
}
</script>

<style scoped src="../../assets/room.css"></style>

<style scoped>
/* ── Eduardo's Resort Color Palette ── */
.room-card {
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

/* ── Hard-override any border room.css adds ── */
.room-card,
.room-card *:not(.lightbox-overlay):not(.lightbox-overlay *) {
  border-left-color:  transparent !important;
  border-right-color: transparent !important;
}

/* ────────────────────────────────────────────
   CARD SHELL
──────────────────────────────────────────── */
.room-card {
  background: var(--color-white);
  border-radius: 16px;
  border: none !important;
  box-shadow: 0 2px 12px rgba(3,105,161,0.09);
  overflow: visible; /* needed for Teleport — lightbox mounts on body */
  display: flex;
  flex-direction: column;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.room-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(3,105,161,0.14);
}

/* ────────────────────────────────────────────
   IMAGE WRAP
   Fixed 210px height, full image visible via
   object-fit: contain on #dbeafe bg.
──────────────────────────────────────────── */
.room-image-wrap {
  position: relative;
  height: 210px;
  background: #dbeafe;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Gradient for price / badge legibility */
.room-image-wrap::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(12,59,94,0.18) 0%,
    transparent 35%,
    transparent 55%,
    rgba(12,59,94,0.55) 100%
  );
  pointer-events: none;
}

/* ── Status / promo badges ── */
.room-badges {
  position: absolute; top: 0.65rem;
  display: flex; flex-wrap: wrap; gap: 0.3rem;
  z-index: 2;
}
.room-badges--left  { left: 0.65rem; }
.room-badges--right { right: 0.65rem; }

.room-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.65rem; font-weight: 700;
  letter-spacing: 0.2px;
  backdrop-filter: blur(6px);
}
.badge--green { background: rgba(16,185,129,0.88); color: #fff; }
.badge--gold  { background: rgba(244,196,0,0.92);  color: var(--color-navy); }
.badge--blue  { background: rgba(31,141,191,0.88); color: #fff; }
.badge--navy  { background: rgba(12,59,94,0.85);   color: #fff; }
.badge--red   { background: rgba(239,68,68,0.88);  color: #fff; }
.badge--amber { background: rgba(217,119,6,0.88);  color: #fff; }

/* ── Zoom / preview button ── */
.preview-btn {
  position: absolute;
  bottom: 0.6rem; left: 0.65rem;
  z-index: 2;
  width: 30px; height: 30px;
  border-radius: 8px;
  background: rgba(12,59,94,0.65);
  border: 1px solid rgba(255,255,255,0.25);
  color: var(--color-white);
  font-size: 0.75rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
  backdrop-filter: blur(4px);
}
.preview-btn:hover {
  background: var(--color-primary-light);
  transform: scale(1.1);
}

/* ── Price overlay ── */
.image-price {
  position: absolute;
  bottom: 0.65rem; right: 0.75rem;
  z-index: 2;
  display: flex; align-items: baseline; gap: 0.22rem;
}
.price-amount {
  font-size: 1.25rem; font-weight: 800;
  color: var(--color-gold);
  line-height: 1;
  text-shadow: 0 1px 4px rgba(0,0,0,0.35);
}
.price-unit {
  font-size: 0.68rem; font-weight: 600;
  color: rgba(255,255,255,0.85);
}

/* ────────────────────────────────────────────
   CARD BODY
──────────────────────────────────────────── */
.room-body {
  background: #eff6ff;
  padding: 1rem 1.1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  flex: 1;
  border-radius: 0 0 16px 16px;
}

/* ── Room identity ── */
.room-identity { display: flex; flex-direction: column; gap: 0.3rem; }

.room-title {
  font-size: 1.05rem; font-weight: 700;
  color: var(--color-navy); line-height: 1.25;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.room-chips { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.chip {
  display: inline-flex; align-items: center;
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
  font-size: 0.68rem; font-weight: 700;
}
.chip--type {
  background: rgba(31,141,191,0.12);
  color: var(--color-primary);
}
.chip--num {
  background: rgba(12,59,94,0.07);
  color: var(--color-text-light);
}

/* ── Stats row: #dbeafe chips, no status ── */
.room-stats {
  display: flex;
  align-items: center;
  gap: 0;
  background: #dbeafe;
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  overflow: hidden;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: rgba(3,105,161,0.15);
  flex-shrink: 0;
  margin: 0 0.25rem;
}

.stat-icon {
  font-size: 0.8rem;
  color: var(--color-primary-light);
  margin-bottom: 1px;
}
.stat-val {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-navy);
  line-height: 1;
}
.stat-lbl {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.35px;
}

/* ── Description ── */
.room-desc {
  font-size: 0.78rem;
  color: var(--color-text-light);
  line-height: 1.55;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Action buttons ── */
.room-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.1rem;
}

.btn-edit, .btn-delete {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center;
  gap: 0.4rem;
  padding: 0.52rem 0.75rem;
  border-radius: 9px;
  font-size: 0.8rem; font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-edit {
  background: var(--color-white);
  color: var(--color-primary);
  border: 1.5px solid rgba(3,105,161,0.22);
}
.btn-edit:hover {
  background: var(--color-primary-light);
  color: var(--color-white);
  border-color: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(31,141,191,0.22);
}

.btn-delete {
  background: rgba(239,68,68,0.06);
  color: #dc2626;
  border: 1.5px solid rgba(239,68,68,0.2);
}
.btn-delete:hover {
  background: #ef4444;
  color: var(--color-white);
  border-color: #ef4444;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(239,68,68,0.22);
}

/* ────────────────────────────────────────────
   LIGHTBOX / IMAGE PREVIEW MODAL
──────────────────────────────────────────── */
.lightbox-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(12,59,94,0.88);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;   /* 1rem gives breathing room on all sides */
  box-sizing: border-box;
  animation: fadeIn 0.18s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.lightbox-box {
  background: var(--color-white);
  border-radius: 18px;
  width: 100%; max-width: 900px;
  /* Fixed to exactly fit viewport — header ~57px + thumbs ~70px + padding = ~130px reserved */
  height: calc(100vh - 2rem);
  max-height: calc(100vh - 2rem);
  overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 60px rgba(12,59,94,0.35);
  animation: slideUp 0.22s ease;
}
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* Lightbox header */
.lightbox-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.9rem 1.25rem;
  background: var(--color-navy);
  border-bottom: 3px solid var(--color-gold);
  flex-shrink: 0;
}
.lightbox-head-left { display: flex; align-items: center; gap: 0.75rem; }
.lightbox-title {
  font-size: 0.95rem; font-weight: 700;
  color: var(--color-white);
}
.lightbox-count {
  font-size: 0.72rem; font-weight: 600;
  color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.1);
  padding: 0.15rem 0.5rem; border-radius: 20px;
}
.lightbox-close {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  color: var(--color-white);
  font-size: 0.9rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.lightbox-close:hover { background: rgba(255,255,255,0.28); }

/* Main image — fills all space between header and thumbs */
.lightbox-img-wrap {
  position: relative;
  flex: 1;
  min-height: 0; /* critical for flex child to shrink */
  background: #0a1628;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.lightbox-img {
  /* fill the available box entirely, whole image visible */
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

/* Prev / Next nav arrows */
.lightbox-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(12,59,94,0.65);
  border: 1px solid rgba(255,255,255,0.2);
  color: var(--color-white); font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
  z-index: 2;
}
.lightbox-nav:hover { background: var(--color-primary-light); transform: translateY(-50%) scale(1.08); }
.lightbox-nav--prev { left: 0.75rem; }
.lightbox-nav--next { right: 0.75rem; }

/* Thumbnail strip */
.lightbox-thumbs {
  display: flex;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: #f0f6fb;
  overflow-x: auto;
  flex-shrink: 0;   /* never grows — image takes the rest */
  height: 62px;     /* fixed so image area is predictable */
  align-items: center;
  scrollbar-width: thin;
  scrollbar-color: var(--color-gray-border) transparent;
}
.lightbox-thumb {
  width: 58px; height: 44px;
  object-fit: cover;
  border-radius: 7px;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px solid transparent;
  opacity: 0.65;
  transition: all 0.15s ease;
}
.lightbox-thumb:hover { opacity: 0.9; border-color: var(--color-primary-light); }
.lightbox-thumb.active {
  opacity: 1;
  border-color: var(--color-gold);
  box-shadow: 0 0 0 1px var(--color-gold-dark);
}
</style>