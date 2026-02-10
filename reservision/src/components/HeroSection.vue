<template>
  <section class="relative flex items-center justify-center min-h-[350px] sm:min-h-[450px] hero-bg text-center px-4">
    <div class="absolute inset-0 bg-black/40"></div>
    <div class="relative z-10 max-w-3xl bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg mx-4 flex flex-col justify-center">
      <h1 class="text-[25px] sm:text-[30px] md:text-[40px] font-bold text-primary-blue mb-3 sm:mb-4">
        ReserVision Waterpark & Wellness Resort
      </h1>
      <p class="text-sm sm:text-base md:text-lg text-gray-700 mb-4 sm:mb-6">
        Where elegant relaxation meets family fun. Enjoy thrilling slides, serene pools, curated dining,
        and a personal smart assistant to plan your stay.
      </p>
      <div class="flex flex-wrap justify-center gap-3 sm:gap-4">
        <a 
          href="/websitereservation" 
          class="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-warm-brown text-white font-semibold rounded-lg hover:bg-deep-brown transition-colors duration-300 shadow-md text-sm sm:text-base"
        >
          Book Your Escape
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-bg {
  background-image: linear-gradient(135deg, rgba(43, 108, 176, 0.7), rgba(193, 154, 107, 0.4)),
                    url('https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=1600&q=80');
  background-position: center;
  background-size: cover;
}
</style>