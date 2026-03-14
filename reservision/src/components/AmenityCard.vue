<template>
<section class="amenities-hero">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-badge">Eduardo's Resort</div>
    <h1 class="hero-heading">
      <span class="heading-white">World-Class</span>
      <span class="heading-gold">Amenities</span>
    </h1>
    <p class="hero-subtext">
      From Olympic-sized pools to elegant dining and air-conditioned cottages —<br/>
      every detail is crafted for your ultimate relaxation, joy, and unforgettable memories.
    </p>
  </div>
</section>
</template>

<style scoped>
.amenities-hero {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark: #1E88B6;
  --color-gold: #F4C400;
  --color-gold-dark: #F2C200;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;
  --color-white-soft: rgba(255, 255, 255, 0.1);
  --color-gray-bg: #f9fafb;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;

  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;

  background-image: url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
  flex-grow: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 30, 50, 0.52);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 24px;
  max-width: 780px;
  width: 100%;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: var(--color-white);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 6px 18px;
  border-radius: 999px;
}

.hero-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.15;
}

.heading-white {
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 800;
  color: var(--color-white);
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.heading-gold {
  font-size: clamp(2rem, 4.5vw, 3.8rem);
  font-weight: 800;
  color: var(--color-gold);
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.hero-subtext {
  font-size: clamp(0.88rem, 1.3vw, 1rem);
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.75;
  font-weight: 400;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}

@media (max-width: 640px) {
  .amenities-hero {
    height: 100svh;
    min-height: 100svh;
    max-height: 100svh;
  }

  .hero-content {
    padding: 32px 16px;
  }

  .hero-subtext br {
    display: none;
  }
}
</style>