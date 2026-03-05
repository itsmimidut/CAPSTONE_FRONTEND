<template>
  <section class="relative flex items-center justify-center min-h-[450px] sm:min-h-[550px] gallery-hero text-center px-4 overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-10 left-10 w-32 h-32 bg-[#1F8DBF]/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-10 right-10 w-40 h-40 bg-[#F4C400]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
    
    <!-- Gradient overlay with yellow presence -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#1F8DBF]/20 via-[#F4C400]/10 to-[#F4C400]/20"></div>
    
    <!-- Glass card - horizontally elongated with ~50% opacity -->
    <div class="relative z-10 max-w-4xl w-full backdrop-blur-md bg-white/50 rounded-2xl p-8 sm:p-10 md:p-12 shadow-2xl mx-4 flex flex-col justify-center border border-white/40 my-12">
      
      <!-- Inner glass layer for depth with yellow undertone -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-[#F4C400]/5 to-[#1F8DBF]/10 rounded-2xl pointer-events-none"></div>
      
      <!-- Content with relative positioning -->
      <div class="relative z-20 flex flex-col items-center justify-center">
        <!-- Yellow glow effect -->
        <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-[#F4C400]/30 rounded-full blur-2xl animate-pulse-slow"></div>
        
        <!-- Titles - Explore Our Gallery in one line -->
        <h1 class="text-[32px] sm:text-[40px] md:text-[48px] font-bold leading-tight relative mb-2">
          <span class="text-[#0C3B5E] drop-shadow-lg">Explore Our Gallery</span>
        </h1>

        <!-- Body text - matching reference style with proper spacing -->
        <div class="mt-4 mb-2">
          <p class="text-xs sm:text-sm text-[#0C3B5E]/80 leading-relaxed drop-shadow-md font-medium max-w-2xl mx-auto">
            Discover the beauty, comfort, and unforgettable moments at Eduardo's Resort.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery-hero {
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

.gallery-hero::before {
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

/* Animation for background elements only */
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

/* Custom spacing - matching reference exactly */
.min-h-\[450px\] {
  min-height: 450px;
}

@media (min-width: 640px) {
  .sm\:min-h-\[550px\] {
    min-height: 550px;
  }
}

/* Horizontal box padding */
.p-8 {
  padding: 2.5rem 2rem;
}

@media (min-width: 640px) {
  .sm\:p-10 {
    padding: 3rem 2.5rem;
  }
}

@media (min-width: 768px) {
  .md\:p-12 {
    padding: 3.5rem 3rem;
  }
}

.my-12 {
  margin-top: 3rem;
  margin-bottom: 3rem;
}

/* Fixed body text container - wider for horizontal layout */
.max-w-2xl {
  max-width: 42rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

/* Proper vertical spacing between elements */
.mb-2 {
  margin-bottom: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

/* Color palette */
:root {
  --reservision-blue: #0C3B5E;
  --darker-blue: #0A2F4A;
  --blue-1: #1E88B6;
  --blue-2: #1F8DBF;
  --yellow-1: #F2C200;
  --yellow-2: #F4C400;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .gallery-hero {
    min-height: 450px;
  }
  
  /* Ensure proper spacing on mobile */
  .mt-4 {
    margin-top: 0.75rem;
  }
  
  /* Full width on mobile */
  .max-w-2xl {
    max-width: 100%;
  }
  
  /* Adjust font size for mobile one-liner */
  .text-\[32px\] {
    font-size: 28px;
  }
}
</style>