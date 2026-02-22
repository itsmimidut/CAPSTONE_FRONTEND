<template>
  <section class="about-hero">
    <div class="overlay"></div>

    <div class="hero-card">
      <h1>
        <span class="text-blue">Our</span>
        <span class="text-gold shimmer"> Story</span>
      </h1>

      <p>
        A legacy of warmth, nature, and Filipino hospitality since 1998.
      </p>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&display=swap');

.about-hero {
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

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom right,
    rgba(30,64,175,0.25),
    rgba(212,175,55,0.2)
  );
}

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

/* Strong bold heading */
.hero-card h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 3rem;
  font-weight: 900; /* stronger bold */
  letter-spacing: -0.5px;
  margin-bottom: 18px;
}

/* Blue part */
.text-blue {
  color: #1e40af;
  font-weight: 900;
}

/* Gold shimmer part */
.text-gold {
  font-weight: 900;
}

/* Improved shimmer with stronger visibility */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    #b8941f,
    #facc15,
    #b8941f
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

.hero-card p {
  font-family: 'Poppins', sans-serif;
  font-size: 1.15rem;
  font-weight: 500;
  line-height: 1.6;
  color: #1e293b;
}

@media (max-width: 640px) {
  .hero-card h1 {
    font-size: 2.1rem;
  }
}
</style>