<!-- components/ViewMoreModal.vue -->
<template>
  <Transition name="modal">
    <div
      v-if="isOpen && item"
      class="modal-backdrop"
      @click="$emit('close')"
    >
      <div class="modal-container" @click.stop>

        <!-- ── TWO-COLUMN LAYOUT ── -->
        <div class="modal-layout">

          <!-- LEFT: Image Carousel -->
          <div class="carousel-col">
            <div class="carousel-track">
              <img
                v-if="item.imgs && item.imgs.length"
                :src="item.imgs[activeImg]"
                :alt="`${item.name} photo ${activeImg + 1}`"
                class="carousel-img"
              />
              <div v-else class="carousel-placeholder">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.3">
                  <rect x="4" y="10" width="40" height="28" rx="3" stroke="white" stroke-width="2"/>
                  <circle cx="16" cy="20" r="4" stroke="white" stroke-width="2"/>
                  <path d="M4 32L14 22L22 30L30 22L44 34" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            </div>

            <!-- Carousel Arrows -->
            <button
              v-if="item.imgs && item.imgs.length > 1"
              class="carousel-arrow carousel-arrow--left"
              @click.stop="prevImg"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button
              v-if="item.imgs && item.imgs.length > 1"
              class="carousel-arrow carousel-arrow--right"
              @click.stop="nextImg"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <!-- Dots -->
            <div v-if="item.imgs && item.imgs.length > 1" class="carousel-dots">
              <span
                v-for="(_, i) in item.imgs"
                :key="i"
                class="dot"
                :class="{ 'dot--active': i === activeImg }"
                @click.stop="activeImg = i"
              />
            </div>
          </div>

          <!-- RIGHT: Content -->
          <div class="content-col">

            <!-- Eyebrow + Title + Guest Pill -->
            <div class="content-header">
              <p class="room-eyebrow">Accommodation</p>
              <div class="title-row">
                <h2 class="room-title">{{ item.name }}</h2>
                <div class="stat-pill">
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" style="flex-shrink:0">
                    <path d="M2 13V17H18V13M2 13H18M2 13V9C2 8.4 2.6 8 3 8H17C17.4 8 18 8.4 18 9V13M7 8V5C7 3.3 8.3 2 10 2C11.7 2 13 3.3 13 5V8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Up to <strong>{{ item.maxGuests }}</strong> guests
                </div>
              </div>
            </div>

            <!-- Description label + text -->
            <div class="desc-block" v-if="item.desc || item.name">
              <p class="section-label">{{ item.name }} Room Inclusions:</p>
              <div class="room-desc" v-html="item.desc"></div>
            </div>

            <!-- Two-col: Amenities + Extra Person -->
            <div class="mid-row">
              <!-- Amenities -->
              <div v-if="item.amenities && item.amenities.length" class="amenities-block">
                <p class="section-label">What's included</p>
                <div class="amenities-list">
                  <div
                    v-for="amenity in item.amenities"
                    :key="amenity"
                    class="amenity-item"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="amenity-icon">
                      <path d="M2 6L4.5 8.5L10 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>{{ amenity }}</span>
                  </div>
                </div>
              </div>

              <!-- Extra Person Policy -->
              <div v-if="item.extraPerson" class="extra-person-block">
                <p class="section-label">Extra Person:</p>
                <div class="extra-list">
                  <p v-for="(ep, i) in item.extraPerson" :key="i" class="extra-item">{{ ep }}</p>
                </div>
              </div>
            </div>

            <!-- Policy Strip -->
            <div class="policy-strip">
              <div class="policy-item">
                <span class="policy-label">Check-in</span>
                <span class="policy-value">{{ item.checkIn || '2:00 PM' }}</span>
              </div>
              <div class="policy-divider" />
              <div class="policy-item">
                <span class="policy-label">Check-out</span>
                <span class="policy-value">{{ item.checkOut || '11:00 AM' }}</span>
              </div>
            </div>

            <!-- Footer CTA -->
            <div class="modal-footer">
              <div class="price-block">
                <span class="price-amount">₱{{ item.price.toLocaleString() }}</span>
                <span class="price-per" v-if="item.perNight">per night</span>
              </div>
              <button class="book-btn" @click="$emit('book', item)">
                Reserve now
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="margin-left:6px">
                  <path d="M1 7H13M8 2L13 7L8 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

          </div>
          <!-- /content-col -->
        </div>
        <!-- /modal-layout -->

      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'ViewMoreModal',
  props: {
    isOpen: { type: Boolean, required: true },
    item:   { type: Object, default: null }
  },
  emits: ['close', 'book'],
  data() {
    return { activeImg: 0 }
  },
  watch: {
    item() { this.activeImg = 0 }
  },
  methods: {
    prevImg() {
      if (!this.item?.imgs?.length) return
      this.activeImg = (this.activeImg - 1 + this.item.imgs.length) % this.item.imgs.length
    },
    nextImg() {
      if (!this.item?.imgs?.length) return
      this.activeImg = (this.activeImg + 1) % this.item.imgs.length
    }
  }
}
</script>

<style scoped>
/* ── Transition ── */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal-container, .modal-leave-active .modal-container { transition: transform 0.25s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-container, .modal-leave-to .modal-container { transform: translateY(14px) scale(0.98); opacity: 0; }

/* ── Backdrop ── */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(12, 59, 94, 0.65);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}

/* ── Container ── */
.modal-container {
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 8px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06);
  max-width: 860px; width: 100%;
  max-height: 92vh; overflow: hidden;
}

/* ── Two-column layout ── */
.modal-layout {
  display: grid;
  grid-template-columns: 42% 58%;
  min-height: 520px;
}

/* ── LEFT: Carousel ── */
.carousel-col {
  position: relative;
  background: #1a1a1a;
  border-radius: 18px 0 0 18px;
  overflow: hidden;
  min-height: 500px;
}
.carousel-track {
  width: 100%; height: 100%; min-height: 500px;
}
.carousel-img {
  width: 100%; height: 100%; min-height: 500px;
  object-fit: cover; display: block;
}
.carousel-placeholder {
  width: 100%; height: 100%; min-height: 500px;
  display: flex; align-items: center; justify-content: center;
  background: #2a2a2a;
}

/* Arrows */
.carousel-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.92);
  border: none; cursor: pointer; color: #1a1a1a;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: background 0.15s, transform 0.15s;
  z-index: 2;
}
.carousel-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.05); }
.carousel-arrow--left { left: 12px; }
.carousel-arrow--right { right: 12px; }

/* Dots */
.carousel-dots {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 6px; z-index: 2;
}
.dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.45); cursor: pointer;
  transition: background 0.15s, transform 0.15s;
}
.dot--active { background: #fff; transform: scale(1.3); }

/* ── RIGHT: Content ── */
.content-col {
  display: flex; flex-direction: column;
  padding: 28px 30px 24px;
  overflow-y: auto;
  max-height: 92vh;
  scrollbar-width: thin;
  scrollbar-color: #e0dbd3 transparent;
}

/* Header */
.content-header { margin-bottom: 6px; }
.room-eyebrow {
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; color: #8b7355; margin: 0 0 6px;
}
.title-row {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
}
.room-title {
  font-size: 26px; font-weight: 800; color: #1a1a1a;
  margin: 0; line-height: 1.1; letter-spacing: -0.5px;
  text-transform: uppercase; flex: 1; min-width: 0;
}
.stat-pill {
  flex-shrink: 0; margin-top: 4px;
  display: flex; align-items: center; gap: 5px;
  background: #f5f3ef; border-radius: 100px;
  padding: 5px 11px; font-size: 12px; color: #5a5248;
  border: 1px solid #e8e4de; white-space: nowrap;
}
.stat-pill strong { color: #1a1a1a; }

/* Description */
.desc-block { margin: 10px 0 14px; }
.section-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.07em;
  text-transform: uppercase; color: #1a1a1a; margin: 0 0 6px;
}
.room-desc {
  font-size: 13px; line-height: 1.6; color: #5c5c5c;
  margin: 0; padding-left: 10px;
  border-left: 2px solid #e8e4de;
}

.room-desc ul {
  list-style: disc;
  margin: 0;
  padding-left: 20px;
}

.room-desc li {
  margin-bottom: 5px;
  color: #3a3a3a;
  font-size: 12.5px;
}

.room-desc ul li {
  list-style-position: inside;
  margin-left: 0;
}

/* Mid row: amenities + extra person side by side */
.mid-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  margin-bottom: 16px;
}
/* .amenities-block { } */
.amenities-list { display: flex; flex-direction: column; gap: 5px; }
.amenity-item {
  display: flex; align-items: center; gap: 7px;
  font-size: 12.5px; color: #3a3a3a; line-height: 1.3;
}
.amenity-icon { flex-shrink: 0; color: #2e8b57; }

/* Extra person */
/* .extra-person-block { } */
.extra-list { display: flex; flex-direction: column; gap: 3px; }
.extra-item { font-size: 12.5px; color: #3a3a3a; margin: 0; line-height: 1.45; }

/* Policy strip */
.policy-strip {
  display: flex; align-items: center;
  background: #f8f6f2; border: 1px solid #e8e3db;
  border-radius: 10px; padding: 12px 18px;
  margin-bottom: 18px;
}
.policy-item { flex: 1; text-align: center; }
.policy-label {
  display: block; font-size: 10px; font-weight: 700;
  letter-spacing: 0.07em; text-transform: uppercase;
  color: #9e9287; margin-bottom: 3px;
}
.policy-value { font-size: 14px; font-weight: 700; color: #1a1a1a; }
.policy-divider { width: 1px; height: 32px; background: #ddd6cc; }

/* Footer */
.modal-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 16px; border-top: 1px solid #f0ede8;
  margin-top: auto;
}
.price-block { display: flex; flex-direction: column; gap: 1px; }
.price-amount { font-size: 28px; font-weight: 800; color: #1a1a1a; letter-spacing: -0.5px; line-height: 1; }
.price-per { font-size: 11px; color: #9e9287; margin-top: 2px; }

.book-btn {
  display: inline-flex; align-items: center;
  background: #1a1a1a; color: #fff;
  border: none; border-radius: 100px;
  padding: 13px 26px; font-size: 14px; font-weight: 700;
  cursor: pointer; letter-spacing: 0.01em;
  transition: background 0.15s, transform 0.1s;
}
.book-btn:hover { background: #333; }
.book-btn:active { transform: scale(0.98); }

/* ── Responsive: stack on mobile ── */
@media (max-width: 640px) {
  .modal-layout { grid-template-columns: 1fr; }
  .carousel-col { border-radius: 18px 18px 0 0; min-height: 220px; }
  .carousel-track, .carousel-img { min-height: 220px; }
  .content-col { padding: 20px 20px 20px; }
  .mid-row { grid-template-columns: 1fr; }
}
</style>