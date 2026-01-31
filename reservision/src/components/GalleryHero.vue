<template>
  <section class="gallery-hero">
    <div class="hero-content">
      <h1 class="animate-fade-in">Explore Our Gallery</h1>
      <p class="animate-slide-up">
        Discover the beauty, comfort, and unforgettable moments at Eduardo's Resort.
      </p>
    </div>
  </section>
</template>

<style scoped>
.gallery-hero {
  background: linear-gradient(135deg, rgba(43,108,176,.75), rgba(193,154,107,.45)), 
              url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-family: 'Dancing Script', cursive;
  margin-bottom: 1rem;
  text-shadow: 0 3px 8px rgba(0,0,0,.4);
}

.hero-content p {
  font-size: 1.2rem;
  opacity: 0.95;
  padding: 0 1rem;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out;
}

@media (max-width: 640px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .hero-content p {
    font-size: 1rem;
  }
}
</style>