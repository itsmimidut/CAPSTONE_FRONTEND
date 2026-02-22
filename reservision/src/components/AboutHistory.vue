<template>
  <section class="section bg-white">
    <div class="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      
      <!-- Founder Image Placeholder -->
      <div class="img-placeholder">
        <i class="fas fa-image"></i>
        <p>Add Founder Image</p>
      </div>

      <!-- Text Content -->
      <div class="space-y-6">
        <h2 class="text-4xl font-bold text-royal-blue">Founded with a Vision</h2>
        <p class="text-navy leading-relaxed">
          In 1998, <strong class="text-royal-blue">Eduardo Mendoza</strong> transformed a quiet beachfront into a sanctuary for families seeking authentic Filipino warmth.
        </p>
        <p class="text-navy">
          Today, we continue his legacy — blending modern comfort with the timeless beauty of Oriental Mindoro.
        </p>
        <div class="flex items-center gap-3 text-gold font-semibold">
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

/* Image placeholder styling */
.img-placeholder {
  background: #e0e7ff; /* soft royal blue tint */
  border-radius: 16px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #2c3e90; /* royal blue icon color */
  font-size: 1.2rem; /* slightly larger */
  box-shadow: 0 6px 20px rgba(44, 62, 144, 0.15);
  min-height: 300px;
}

.img-placeholder i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

/* Text Colors */
.text-royal-blue {
  color: #2C3E90; /* primary royal blue */
}

.text-navy {
  color: #1a2a5a; /* dark navy for readability */
}

.text-gold {
  color: #FFD700; /* gold accent */
}

/* Spacing & Typography */
.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.leading-relaxed {
  line-height: 1.75; /* increased for readability */
  font-size: 1.125rem; /* slightly bigger for easier reading */
}

.fa-heart {
  color: #FFD700;
}
</style>