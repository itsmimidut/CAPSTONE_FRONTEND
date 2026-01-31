<template>
  <section class="rates-hero">
    <div class="hero-content">
      <h1 class="animate-fade-in">Rates & Packages</h1>
      <p class="animate-slide-up">
        Enjoy, relax, and have fun in our cool and therapeutic waters. Explore entrance fees, 
        room rates, and exclusive packages tailored for a memorable getaway.
      </p>
    </div>
  </section>
</template>

<style scoped>
.rates-hero {
  background: linear-gradient(135deg, rgba(43,108,176,.9), rgba(193,154,107,.8)), 
              url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80') center/cover;
  height: 380px;
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
  max-width: 800px;
  margin: 0 auto;
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
  .rates-hero {
    height: 300px;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-content p {
    font-size: 1.1rem;
  }
}
</style>