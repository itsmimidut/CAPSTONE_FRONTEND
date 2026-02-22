<template>
  <section class="gallery-hero">
    <div class="overlay"></div>

    <div class="hero-card">
      <h1>
        <span class="text-blue">Explore Our</span>
        <span class="text-gold shimmer"> Gallery</span>
      </h1>

      <p>
        Discover the beauty, comfort, and unforgettable moments at Eduardo's Resort.
      </p>
    </div>
  </section>
</template>

<style scoped>
.gallery-hero {
  position: relative;
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  overflow: hidden;

  background-image:
    radial-gradient(circle at 20% 80%, rgba(59,130,246,0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(212,175,55,0.15) 0%, transparent 50%),
    linear-gradient(135deg, rgba(30,64,175,0.35), rgba(212,175,55,0.25)),
    url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-size: cover;
  background-blend-mode: overlay;
}

/* Soft overlay depth */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom right,
    rgba(30,64,175,0.25),
    rgba(212,175,55,0.2)
  );
}

/* Glass Card */
.hero-card {
  position: relative;
  z-index: 2;
  max-width: 700px;
  padding: 35px 40px;
  border-radius: 22px;
  backdrop-filter: blur(18px);
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.95),
    rgba(255,255,255,0.85)
  );
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
}

/* Heading */
.hero-card h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 18px;
}

.text-blue {
  color: #1e40af;
}

.text-gold {
  color: #d4af37;
}

/* Shimmer animation */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    #d4af37,
    #facc15,
    #d4af37
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

/* Paragraph */
.hero-card p {
  font-size: 1.15rem;
  line-height: 1.6;
  color: #1e293b;
}

/* Responsive */
@media (max-width: 640px) {
  .hero-card {
    padding: 25px 20px;
  }

  .hero-card h1 {
    font-size: 2.1rem;
  }

  .hero-card p {
    font-size: 1rem;
  }
}
</style>