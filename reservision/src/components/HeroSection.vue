<template>
<section class="relative flex items-center justify-center min-h-[300px] sm:min-h-[400px] hero-bg text-center px-4">
  <div class="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-blue-700/20 to-gold-500/20"></div>
  <div class="relative z-10 max-w-2xl bg-gradient-to-br from-white/95 via-white/90 to-blue-50/80 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl mx-4 flex flex-col justify-center border border-white/30">

    <h1 class="text-[25px] sm:text-[30px] md:text-[36px] font-bold mb-5 sm:mb-6 leading-tight">
      <span class="text-blue-800">ReserVision</span> 
      <span class="text-blue-600">Waterpark & Wellness Resort</span>
    </h1>

    <p class="text-sm sm:text-base md:text-lg text-black mb-6 leading-relaxed">
      Where elegant relaxation meets family fun. Enjoy thrilling slides, serene pools, curated dining,
      and a personal smart assistant to plan your stay.
    </p>

    <div class="flex flex-wrap justify-center gap-3 sm:gap-4 mb-4">
      <a 
        href="/reservation" 
        class="px-8 sm:px-10 md:px-12 
               py-3 sm:py-4 
               bg-gradient-to-r from-yellow-500 to-yellow-400 
               text-blue-900 font-extrabold 
               rounded-xl 
               transition-all duration-300 
               shadow-lg hover:shadow-2xl hover:scale-105 
               text-base sm:text-lg md:text-xl 
               relative overflow-hidden group"
      >
        <span class="relative z-10 group-hover:text-white transition-colors duration-300">
          Book Your Escape
        </span>

        <div class="absolute inset-0 
                    bg-blue-600 
                    opacity-0 
                    group-hover:opacity-100 
                    transition-opacity duration-300">
        </div>
      </a>
    </div>

    <div class="mt-6 pt-4 border-t border-blue-200/50">
      <div class="flex justify-center gap-6 text-xs sm:text-sm">
        <div class="flex items-center gap-1 text-blue-700"></div>
        <div class="flex items-center gap-1 text-blue-700"></div>
        <div class="flex items-center gap-1 text-blue-700"></div>
      </div>
    </div>
  </div>
</section>
</template>

<style scoped>
.hero-bg {
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(212, 175, 55, 0.2) 100%),
    url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-size: cover;
  background-blend-mode: overlay;
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.gradient-text {
  background: linear-gradient(90deg, #1e40af, #d4af37, #1e40af);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}

/* Add gold color if not in your tailwind config */
.bg-gold-500 {
  background-color: #d4af37;
}
.bg-gold-600 {
  background-color: #b8941f;
}
.from-gold-500 {
  --tw-gradient-from: #d4af37;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(212, 175, 55, 0));
}
.to-gold-500 {
  --tw-gradient-to: #d4af37;
}
.to-gold-600 {
  --tw-gradient-to: #b8941f;
}
.border-gold-500 {
  border-color: #d4af37;
}
.text-gold-600 {
  color: #b8941f;
}


</style>