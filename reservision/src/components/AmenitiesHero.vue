<template>
  <section class="relative flex items-center justify-center min-h-[300px] sm:min-h-[400px] hero-amenities text-center px-4">
    <div class="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-blue-700/20 to-yellow-500/20"></div>
    <div class="relative z-10 max-w-2xl bg-gradient-to-br from-white/95 via-white/90 to-blue-50/80 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl mx-4 flex flex-col justify-center border border-white/30">

      <h1 class="text-[25px] sm:text-[30px] md:text-[36px] font-bold mb-5 sm:mb-6 leading-tight">
        <span class="text-blue-800">ReserVision</span> 
        <span class="text-blue-600">World-Class Amenities</span>
      </h1>

      <p class="text-sm sm:text-base md:text-lg text-black mb-6 leading-relaxed">
        From Olympic-sized pools to elegant dining and air-conditioned cottages — every detail is crafted 
        for your ultimate relaxation, joy, and unforgettable memories.
      </p>

      <div class="flex flex-wrap justify-center gap-3 sm:gap-4 mb-4">
        <a 
          href="#amenity-grid" 
          class="px-8 sm:px-10 md:px-12 
                 py-3 sm:py-4 
                 bg-gradient-to-r from-yellow-500 to-yellow-400 
                 text-blue-900 font-extrabold 
                 rounded-xl 
                 shadow-lg 
                 text-base sm:text-lg md:text-xl 
                 relative overflow-hidden"
        >
          Explore All Amenities
        </a>
      </div>

      <div class="mt-6 pt-4 border-t border-blue-200/50">
        <div class="flex justify-center gap-6 text-xs sm:text-sm">
          <div class="flex flex-col items-center">
          </div>
          <div class="flex flex-col items-center">
          </div>
          <div class="flex flex-col items-center">
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-amenities {
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(251, 191, 36, 0.2) 100%),
    url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-size: cover;
  background-blend-mode: overlay;
}

@media (max-width: 640px) {
  .hero-amenities {
    min-height: 250px;
  }
  
  .mt-6 {
    margin-top: 1rem;
  }
  
  .pt-4 {
    padding-top: 1rem;
  }
}
</style>