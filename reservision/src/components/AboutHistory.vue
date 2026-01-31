<template>
  <section class="section bg-white">
    <div class="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div class="img-placeholder">
        <i class="fas fa-image"></i>
        <p>Add Founder Image</p>
      </div>
      <div class="space-y-6">
        <h2 class="text-3xl font-bold text-text-dark">Founded with a Vision</h2>
        <p class="text-text-muted leading-relaxed">
          In 1998, <strong>Eduardo Mendoza</strong> transformed a quiet beachfront into a sanctuary for families seeking authentic Filipino warmth.
        </p>
        <p class="text-text-muted">
          Today, we continue his legacy — blending modern comfort with the timeless beauty of Oriental Mindoro.
        </p>
        <div class="flex items-center gap-3 text-warm-brown font-semibold">
          <i class="fas fa-heart"></i>
          <span>25+ Years of Unforgettable Memories</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding: 4rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.img-placeholder {
  background: #e5e7eb;
  border-radius: 16px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  min-height: 300px;
}

.img-placeholder i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.text-text-dark {
  color: #2D3748;
}

.text-text-muted {
  color: #718096;
}

.text-warm-brown {
  color: #C19A6B;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.leading-relaxed {
  line-height: 1.625;
}
</style>