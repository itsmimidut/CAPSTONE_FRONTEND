<template>
  <section class="rates-hero">
    <div class="hero-content">
      <h1 class="text-[25px] sm:text-[30px] md:text-[36px] font-bold mb-5 sm:mb-6 leading-tight animate-fade-in">
          <span class="text-blue-800">Rates</span> 
          <span class="text-blue-600">& Packages</span>
      </h1>
        <p>
        Enjoy, relax, and have fun in our cool and therapeutic waters. Explore entrance fees, 
        room rates, and exclusive packages tailored for a memorable getaway.
      </p>
    </div>
  </section>
</template>

<style scoped>
.rates-hero {
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(30, 64, 175, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(253, 224, 71, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, rgba(30, 64, 175, 0.25) 0%, rgba(253, 224, 71, 0.15) 100%),
    url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-size: cover;
  background-blend-mode: overlay;
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  padding: 1rem;
}

.rates-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, rgba(30, 64, 175, 0.3), rgba(253, 224, 71, 0.2));
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 2rem;
  background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
}

.hero-content h1 {
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-content p {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: rgb(30, 41, 59);
  line-height: 1.6;
  opacity: 0.95;
  padding: 0;
  font-weight: 500;
}

@keyframes fade-in {
  from { 
    opacity: 0; 
    transform: translateY(-20px) scale(0.98);
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
}

@keyframes slide-up {
  from { 
    transform: translateY(30px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out 0.2s both;
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out 0.5s both;
}


/* Responsive adjustments */
@media (max-width: 640px) {
  .rates-hero {
    min-height: 300px;
    padding: 0.75rem;
  }
  
  .hero-content {
    padding: 1.5rem;
  }
  
  .hero-content h1 {
    margin-bottom: 1rem;
  }
  
  .hero-content p {
    font-size: 1.05rem;
    line-height: 1.5;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .hero-content p {
    font-size: 1.15rem;
  }
}
</style>