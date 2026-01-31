<template>
  <div class="info-grid">
    <div class="info-card">
      <div class="icon"><i class="fas fa-map-marker-alt"></i></div>
      <h3>Location</h3>
      <p>Nautical Highway Bayanan II, Calapan City, Oriental Mindoro, Philippines</p>
    </div>
    <div class="info-card warm-card">
      <div class="icon"><i class="fas fa-clock"></i></div>
      <h3>Hours</h3>
      <p>24/7 Front Desk</p>
      <p>Restaurant: 6AM - 11PM</p>
    </div>
  </div>
</template>

<style scoped>
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-card {
  background: linear-gradient(135deg, #2B6CB0, #63B3ED);
  color: white;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  display: flex;
  flex-direction: column;
  min-height: 120px;
}

.info-card.warm-card {
  background: linear-gradient(135deg, #C19A6B, #d4a574);
}

.info-card .icon {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.info-card h3 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.info-card p {
  opacity: 0.9;
  font-size: 0.8rem;
  line-height: 1.4;
}

@media (max-width: 480px) {
  .info-grid { gap: 0.75rem; }
  .info-card { padding: 0.875rem; }
  .info-card .icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  .info-card h3 { font-size: 0.95rem; }
  .info-card p { font-size: 0.75rem; }
}
</style>