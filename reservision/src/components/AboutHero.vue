<template>
  <section class="about-hero">
    <div class="hero-content">
      <h1 class="animate-fade-in">Our Story</h1>
      <p class="animate-slide-up">
        A legacy of warmth, nature, and Filipino hospitality since 1998.
      </p>
    </div>
  </section>
</template>

<style scoped>
.about-hero {
  background: linear-gradient(135deg, rgba(43,108,176,.85), rgba(193,154,107,.65)),
    url('https://images.unsplash.com/photo-1517248135467-3fb27b735e36?auto=format&fit=crop&w=1600&q=80') 
    center/cover no-repeat;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.hero-content h1 {
  font-family: 'Dancing Script', cursive;
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 3px 8px rgba(0,0,0,.4);
}

.hero-content p {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto;
  opacity: 0.95;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out;
}

@media (max-width: 640px) {
  .about-hero {
    height: 320px;
  }
  .hero-content h1 {
    font-size: 2.5rem;
  }
  .hero-content p {
    font-size: 1.1rem;
  }
}
</style>