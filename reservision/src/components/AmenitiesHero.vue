<template>
  <section class="hero-amenities">
    <div class="hero-content">
      <h1 class="animate-fade-in mt-5">Our World-Class Amenities</h1>
      <p class="animate-slide-up px-9">
        From Olympic-sized pools to elegant dining and air-conditioned cottages — every detail is crafted 
        for your ultimate relaxation, joy, and unforgettable memories.
      </p>
      <div class="flex justify-center gap-4 mt-6">
        <a 
          href="#amenity-grid" 
          class="px-6 py-3 bg-warm-brown text-white rounded-full font-semibold hover:bg-deep-brown transition shadow-lg"
        >
          Explore All
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-amenities {
  background: linear-gradient(135deg, rgba(43,108,176,.75), rgba(193,154,107,.45)), 
              url('https://images.unsplash.com/photo-1566073772328-0e76c0b1b5b9?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
  height: 300px;
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
    font-size: 1.5rem;
  }
  .hero-content p {
    font-size: 15px;
  }
}
</style>