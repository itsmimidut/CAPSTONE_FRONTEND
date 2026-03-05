<template>
<section class="relative flex items-center justify-center min-h-[450px] sm:min-h-[550px] hero-bg text-center px-4 overflow-hidden">
  <!-- Animated background elements -->
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute top-10 left-10 w-32 h-32 bg-[#1F8DBF]/20 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-10 right-10 w-40 h-40 bg-[#F4C400]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
  </div>
  
  <!-- Gradient overlay with more yellow presence -->
  <div class="absolute inset-0 bg-gradient-to-br from-[#1F8DBF]/20 via-[#F4C400]/10 to-[#F4C400]/20"></div>
  
  <!-- Glass card - vertically elongated with ~50% opacity -->
  <div class="relative z-10 max-w-md w-full backdrop-blur-md bg-white/50 rounded-2xl p-8 sm:p-10 shadow-2xl mx-4 flex flex-col justify-center border border-white/40 my-12">
    
    <!-- Inner glass layer for depth with yellow undertone -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-[#F4C400]/5 to-[#1F8DBF]/10 rounded-2xl pointer-events-none"></div>
    
    <!-- Content with relative positioning -->
    <div class="relative z-20 space-y-5">
      <!-- Yellow glow effect -->
      <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-[#F4C400]/30 rounded-full blur-2xl animate-pulse-slow"></div>
      
      <!-- Titles - ReserVision in dark blue, waterpark & Wellness Resort in matching darker blue -->
      <h1 class="text-[32px] sm:text-[40px] md:text-[48px] font-bold leading-tight relative">
        <span class="text-[#0C3B5E] drop-shadow-lg block">ReserVision</span> 
        <span class="text-[#0C3B5E]/90 text-[24px] sm:text-[28px] md:text-[32px] block mt-1 drop-shadow-md">Waterpark &</span>
        <span class="text-[#0C3B5E]/90 text-[24px] sm:text-[28px] md:text-[32px] block drop-shadow-md">Wellness Resort</span>
      </h1>

      <!-- Body text - slightly smaller for balance, in dark blue -->
      <p class="text-xs sm:text-sm text-[#0C3B5E]/80 leading-relaxed drop-shadow-md font-medium max-w-sm mx-auto">
        Where elegant relaxation meets family fun. Enjoy<br />
        thrilling slides, serene pools, curated dining, and a<br />
        personal smart assistant to plan your stay.
      </p>

      <!-- CTA Button - yellow with darker blue hover and yellow outline -->
      <div class="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2">
        <a 
          href="/websitereservation" 
          class="px-10 sm:px-12 md:px-14 
                 py-3 sm:py-4 
                 bg-[#F4C400]
                 text-[#0C3B5E] font-extrabold 
                 rounded-xl 
                 transition-all duration-300 
                 shadow-lg hover:shadow-2xl hover:scale-105 
                 text-sm sm:text-base md:text-lg 
                 relative overflow-hidden group
                 border-2 border-[#F4C400] hover:border-[#F4C400]"
        >
          <span class="relative z-10 group-hover:text-white transition-colors duration-300">
            Book Your Escape
          </span>
          <div class="absolute inset-0 
                      bg-[#0A2F4A]
                      opacity-0 
                      group-hover:opacity-100 
                      transition-opacity duration-300">
          </div>
        </a>
      </div>
    </div>
  </div>
</section>
</template>

<style scoped>
.hero-bg {
  background-image: 
    radial-gradient(circle at 30% 40%, rgba(31, 141, 191, 0.25) 0%, transparent 40%),
    radial-gradient(circle at 70% 60%, rgba(244, 196, 0, 0.2) 0%, transparent 40%),
    linear-gradient(125deg, rgba(31, 141, 191, 0.4) 0%, rgba(244, 196, 0, 0.3) 100%),
    url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-size: cover;
  background-blend-mode: overlay;
  position: relative;
}

.hero-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.2) 100%);
  pointer-events: none;
}

/* Enhanced glass morphism effect with ~50% opacity */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Animation for background elements */
@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.2; transform: scale(1) translateX(-50%); }
  50% { opacity: 0.4; transform: scale(1.2) translateX(-50%); }
}

.animate-pulse {
  animation: pulse 4s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 6s ease-in-out infinite;
  left: 50% !important;
}

.delay-1000 {
  animation-delay: 1s;
}

/* Custom spacing for vertical elongation */
.p-8 {
  padding: 2.5rem 2rem;
}

@media (min-width: 640px) {
  .sm\:p-10 {
    padding: 3rem 2.5rem;
  }
}

/* Ensure container is tall enough */
.min-h-\[450px\] {
  min-height: 450px;
}

@media (min-width: 640px) {
  .sm\:min-h-\[550px\] {
    min-height: 550px;
  }
}

/* Color palette */
:root {
  --reservision-blue: #0C3B5E;
  --darker-blue: #0A2F4A;
  --yellow: #F4C400;
}
</style>