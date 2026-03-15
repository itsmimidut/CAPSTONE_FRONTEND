<template>
  <div class="summary-card" :class="toneClasses.container">
    <div class="card-top">
      <span class="card-dot" :class="toneClasses.dot"></span>
      <span class="card-title">{{ title }}</span>
    </div>
    <p class="card-value" :class="toneClasses.value">{{ value }}</p>
    <div class="card-shimmer"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: String, required: true },
  tone:  { type: String, default: 'blue' },
})

const toneClasses = computed(() => {
  const palette = {
    blue: {
      container: 'tone-blue',
      value:     'val-blue',
      dot:       'dot-blue',
    },
    navy: {
      container: 'tone-navy',
      value:     'val-navy',
      dot:       'dot-navy',
    },
    gold: {
      container: 'tone-gold',
      value:     'val-gold',
      dot:       'dot-gold',
    },
    green: {
      container: 'tone-green',
      value:     'val-green',
      dot:       'dot-green',
    },
    red: {
      container: 'tone-red',
      value:     'val-red',
      dot:       'dot-red',
    },
    orange: {
      container: 'tone-orange',
      value:     'val-orange',
      dot:       'dot-orange',
    },
    yellow: {
      container: 'tone-gold',
      value:     'val-gold',
      dot:       'dot-gold',
    },
  }
  return palette[props.tone] || palette.blue
})
</script>

<style scoped>
/* ── Design Tokens ──────────────────────────────────────────── */
:root {
  --color-primary:       #0369a1;
  --color-primary-light: #1F8DBF;
  --color-gold:          #F4C400;
  --color-gold-dark:     #F2C200;
  --color-navy:          #0C3B5E;
  --color-gray-border:   #e5e7eb;
  --color-text-dark:     #1f2937;
  --color-text-light:    #6b7280;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Base Card ──────────────────────────────────────────────── */
.summary-card {
  position: relative;
  border-radius: 12px;
  padding: 1.1rem 1.2rem;
  border: 1.5px solid transparent;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(3,105,161,0.12);
}

/* Decorative shimmer circle — top-right */
.card-shimmer {
  position: absolute;
  top: -18px; right: -18px;
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  pointer-events: none;
}

/* ── Top Row (dot + title) ──────────────────────────────────── */
.card-top {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.card-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.card-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(255,255,255,0.82);
  line-height: 1.2;
}

/* ── Value ──────────────────────────────────────────────────── */
.card-value {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.3px;
}

/* ── Tone: Blue (primary) ───────────────────────────────────── */
.tone-blue {
  background: linear-gradient(135deg, #0369a1 0%, #1F8DBF 100%);
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 2px 10px rgba(3,105,161,0.2);
}
.val-blue  { color: #ffffff; }
.dot-blue  { background: #F4C400; box-shadow: 0 0 0 3px rgba(244,196,0,0.25); }

/* ── Tone: Navy ─────────────────────────────────────────────── */
.tone-navy {
  background: linear-gradient(135deg, #0C3B5E 0%, #0369a1 100%);
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 2px 10px rgba(12,59,94,0.22);
}
.val-navy  { color: #ffffff; }
.dot-navy  { background: #F4C400; box-shadow: 0 0 0 3px rgba(244,196,0,0.25); }

/* ── Tone: Gold ─────────────────────────────────────────────── */
.tone-gold {
  background: linear-gradient(135deg, #F4C400 0%, #F2C200 100%);
  border-color: rgba(12,59,94,0.12);
  box-shadow: 0 2px 10px rgba(244,196,0,0.3);
}
.tone-gold .card-title { color: rgba(12,59,94,0.75); }
.val-gold  { color: #0C3B5E; }
.dot-gold  { background: #0C3B5E; box-shadow: 0 0 0 3px rgba(12,59,94,0.15); }
.tone-gold .card-shimmer { background: rgba(12,59,94,0.07); }

/* ── Tone: Green ────────────────────────────────────────────── */
.tone-green {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 2px 10px rgba(5,150,105,0.2);
}
.val-green  { color: #ffffff; }
.dot-green  { background: #d1fae5; box-shadow: 0 0 0 3px rgba(209,250,229,0.3); }

/* ── Tone: Red ──────────────────────────────────────────────── */
.tone-red {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 2px 10px rgba(220,38,38,0.2);
}
.val-red  { color: #ffffff; }
.dot-red  { background: #fecaca; box-shadow: 0 0 0 3px rgba(254,202,202,0.3); }

/* ── Tone: Orange ───────────────────────────────────────────── */
.tone-orange {
  background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 2px 10px rgba(234,88,12,0.2);
}
.val-orange  { color: #ffffff; }
.dot-orange  { background: #fed7aa; box-shadow: 0 0 0 3px rgba(254,215,170,0.3); }
</style>