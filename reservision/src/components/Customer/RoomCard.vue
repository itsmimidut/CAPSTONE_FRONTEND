<template>
  <div class="room-card">

    <!-- Image — fills the full frame, no letterboxing -->
    <div class="room-card__img-wrap">
      <img :src="imageUrl" :alt="title" class="room-card__img" />

      <!-- Hover overlay -->
      <div class="room-card__overlay" @click="openPreview">
        <span class="room-card__expand-btn">
          <i class="fas fa-expand-alt"></i>
        </span>
      </div>

      <!-- Recommended badge -->
      <span class="room-card__badge">
        <i class="fas fa-star"></i> Recommended
      </span>

      <!-- Price floated on image bottom -->
      <span class="room-card__price-float">{{ price }}</span>
    </div>

    <!-- Body -->
    <div class="room-card__body">
      <h4 class="room-card__title">{{ title }}</h4>

      <button class="room-card__book-btn" @click="handleBookNow">
        <i class="fas fa-calendar-check"></i> {{ buttonLabel }}
      </button>
    </div>

    <!-- ── Lightbox ──────────────────────────────── -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div v-if="isPreviewOpen" class="lightbox" @click.self="closePreview">
          <div class="lightbox__dialog">

            <!-- Header -->
            <div class="lightbox__header">
              <div class="lightbox__header-left">
                <span class="lightbox__header-icon"><i class="fas fa-image"></i></span>
                <div>
                  <h5 class="lightbox__title">{{ title }}</h5>
                  <p class="lightbox__header-price">{{ price }}</p>
                </div>
              </div>
              <button class="lightbox__close" @click="closePreview">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Image — fills dialog width -->
            <div class="lightbox__img-wrap">
              <img :src="imageUrl" :alt="title" class="lightbox__img" />
            </div>

            <!-- Footer -->
            <div class="lightbox__footer">
              <p class="lightbox__footer-note">
                <i class="fas fa-info-circle"></i> Actual room may vary slightly from photo
              </p>
              <button class="lightbox__book-btn" @click="handleBookNow">
                <i class="fas fa-calendar-check"></i> {{ buttonLabel }}
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title:          { type: String,           required: true },
  price:          { type: String,           required: true },
  imageUrl:       { type: String,           required: true },
  buttonLabel:    { type: String,           default: 'Book Now' },
  roomId:         { type: [String, Number], default: null },
  redirectOnBook: { type: Boolean,          default: true },
})

const emit   = defineEmits(['book'])
const router = useRouter()
const isPreviewOpen = ref(false)

const parsePriceNumber = (value) => {
  const cleaned = String(value || '').replace(/[^\d.]/g, '')
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

const toSafeId = (value) => {
  const raw = String(value || '').trim().toLowerCase()
  return raw ? raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : `room-${Date.now()}`
}

const persistSelectedRoomToPendingBooking = () => {
  const numericRoomId = Number(props.roomId)
  const resolvedId = Number.isFinite(numericRoomId) ? numericRoomId : toSafeId(props.title)

  const item = {
    id: resolvedId,
    item_id: Number.isFinite(numericRoomId) ? numericRoomId : null,
    name: props.title,
    price: parsePriceNumber(props.price),
    desc: '',
    description: '',
    amenities: [],
    imgs: props.imageUrl ? [props.imageUrl] : [],
    perNight: true,
    maxGuests: 2,
    category: 'Room',
    categoryType: 'room',
    status: 'Available'
  }

  const payload = {
    items: [{ item, qty: 1, guests: 1 }],
    checkIn: null,
    checkOut: null,
    nights: 0,
    adults: 1,
    children: 0,
    source: 'dashboard-recommendation',
    updatedAt: new Date().toISOString()
  }

  localStorage.setItem('pendingBooking', JSON.stringify(payload))
}

function openPreview() {
  isPreviewOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closePreview() {
  isPreviewOpen.value = false
  document.body.style.overflow = ''
}

async function handleBookNow() {
  emit('book', { id: props.roomId, title: props.title, price: props.price, imageUrl: props.imageUrl })
  if (isPreviewOpen.value) closePreview()
  if (props.redirectOnBook) {
    try {
      persistSelectedRoomToPendingBooking()
    } catch (error) {
      console.warn('Unable to persist selected room for reservation redirect:', error)
    }

    await router.push({ path: '/customer', query: { activeSection: 'book', source: 'dashboard' } })
  }
}
</script>

<style scoped>
/* ── Card shell ─────────────────────────────────────────────── */
.room-card {
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(3,105,161,0.07);
  transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s;
  display: flex;
  flex-direction: column;
}

.room-card:hover {
  border-color: #0369a1;
  box-shadow: 0 10px 28px rgba(3,105,161,0.16);
  transform: translateY(-4px);
}

/* ── Image — full image always visible, no cropping ─────────── */
/* No fixed aspect-ratio here — the wrapper grows to fit
   whatever height the image naturally needs.
   object-fit: contain + auto height shows every pixel.       */
.room-card__img-wrap {
  position: relative;
  width: 100%;
  /* Let height follow the image's natural proportions */
  overflow: hidden;
  background: #0C3B5E;   /* dark navy fills any tiny letterbox gaps */
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;     /* prevents collapse while image loads */
}

.room-card__img {
  display: block;
  width: 100%;
  height: auto;            /* natural height — no cropping ever */
  object-fit: contain;     /* whole image always visible */
  transition: transform 0.38s ease;
}

.room-card:hover .room-card__img {
  transform: scale(1.03);  /* gentler scale so full image stays in frame */
}

/* Hover overlay */
.room-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(12, 59, 94, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.28s ease;
}

.room-card:hover .room-card__overlay {
  background: rgba(12, 59, 94, 0.38);
}

/* Expand circle */
.room-card__expand-btn {
  width: 50px; height: 50px;
  border-radius: 50%;
  background: rgba(255,255,255,0.96);
  color: #0369a1;
  font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(3,105,161,0.28);
  opacity: 0;
  transform: scale(0.65);
  transition: opacity 0.25s, transform 0.25s, background 0.18s, color 0.18s;
}

.room-card:hover .room-card__expand-btn {
  opacity: 1;
  transform: scale(1);
}

.room-card__expand-btn:hover {
  background: #F4C400;
  color: #0C3B5E;
}

/* Gold "Recommended" badge — top-left */
.room-card__badge {
  position: absolute;
  top: 10px; left: 10px;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #F4C400;
  color: #0C3B5E;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.28rem 0.7rem;
  border-radius: 20px;
  letter-spacing: 0.04em;
  box-shadow: 0 2px 8px rgba(244,196,0,0.4);
  pointer-events: none;
}

/* Price pill — bottom-right of image */
.room-card__price-float {
  position: absolute;
  bottom: 10px; right: 10px;
  background: rgba(12, 59, 94, 0.82);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.28rem 0.75rem;
  border-radius: 20px;
  backdrop-filter: blur(4px);
  pointer-events: none;
  letter-spacing: 0.02em;
}

/* ── Card body ──────────────────────────────────────────────── */
.room-card__body {
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  flex: 1;
}

.room-card__title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0C3B5E;
  margin: 0;
  line-height: 1.3;
}

.room-card__book-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  padding: 0.65rem;
  background: #0369a1;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: auto;
  transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
}

.room-card__book-btn:hover {
  background: #0C3B5E;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(3,105,161,0.25);
}

.room-card__book-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

/* ── Lightbox ───────────────────────────────────────────────── */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(12, 59, 94, 0.62);
  backdrop-filter: blur(6px);
  padding: 1rem;
}

.lightbox-fade-enter-active, .lightbox-fade-leave-active { transition: opacity 0.22s ease; }
.lightbox-fade-enter-from, .lightbox-fade-leave-to { opacity: 0; }

.lightbox__dialog {
  width: 100%;
  max-width: 820px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #dbeafe;
  box-shadow: 0 24px 60px rgba(12,59,94,0.38);
  animation: dialogIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  max-height: 92vh;
}

@keyframes dialogIn {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Lightbox header — navy gradient + gold border */
.lightbox__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #0C3B5E 0%, #0369a1 100%);
  border-bottom: 2px solid #F4C400;
  flex-shrink: 0;
}

.lightbox__header-left { display: flex; align-items: center; gap: 0.75rem; }

.lightbox__header-icon {
  width: 34px; height: 34px; border-radius: 8px;
  background: rgba(255,255,255,0.15); color: #F4C400;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.88rem; flex-shrink: 0;
}

.lightbox__title { font-size: 0.95rem; font-weight: 800; color: #fff; margin: 0; }
.lightbox__header-price { font-size: 0.72rem; color: rgba(255,255,255,0.7); margin: 2px 0 0; }

.lightbox__close {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(255,255,255,0.15); border: none;
  color: rgba(255,255,255,0.85); font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s, color 0.15s; flex-shrink: 0;
}
.lightbox__close:hover { background: rgba(239,68,68,0.8); color: #fff; }

/* Lightbox image — fills width, natural height */
.lightbox__img-wrap {
  flex: 1;
  background: #0C3B5E;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 0;
}

.lightbox__img {
  width: 100%;
  height: auto;
  max-height: 62vh;
  object-fit: contain;
  display: block;
}

/* Lightbox footer */
.lightbox__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.lightbox__footer-note {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.75rem; color: #6b7280; margin: 0; font-style: italic;
}
.lightbox__footer-note i { color: #0369a1; }

.lightbox__book-btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.65rem 1.4rem;
  background: #F4C400; color: #0C3B5E;
  border: none; border-radius: 8px;
  font-family: inherit; font-size: 0.85rem; font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
  white-space: nowrap;
}
.lightbox__book-btn:hover { background: #F2C200; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(244,196,0,0.32); }
.lightbox__book-btn:active { transform: translateY(0); box-shadow: none; }

@media (max-width: 640px) {
  .lightbox__footer { flex-direction: column; align-items: stretch; }
  .lightbox__book-btn { justify-content: center; }
}
</style>