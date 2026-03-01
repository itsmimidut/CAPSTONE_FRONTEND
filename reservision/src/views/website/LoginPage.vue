<template>
  <div class="h-screen bg-gradient-to-br from-blue-900/5 via-white/95 to-yellow-500/10 overflow-hidden">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Interactive Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Floating bubbles -->
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-yellow-400/5 rounded-full blur-3xl animate-float-1"></div>
      <div class="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-tr from-blue-300/5 to-yellow-300/10 rounded-full blur-3xl animate-float-2"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-200/5 to-yellow-200/5 rounded-full blur-3xl animate-pulse-slow"></div>
      
      <!-- Animated lines -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-scan"></div>
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-scan-delayed"></div>
    </div>

    <!-- Main Content - Full width with minimal padding -->
    <div class="flex h-[calc(100vh-80px)] p-0">
      <!-- Visual Section - 70% -->
      <section class="w-[70%] relative overflow-hidden cursor-none group"
               @mousemove="handleMouseMove"
               :style="visualBgStyle">
        
        <!-- Gradient Overlay - More subtle -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-blue-700/20 to-yellow-500/30" 
             :style="gradientStyle"></div>
        
        <!-- Interactive Particles -->
        <div class="absolute inset-0" ref="particlesContainer"></div>
        
        <!-- Parallax Content -->
        <div class="absolute inset-0 flex items-center justify-center" :style="contentTransform">
          <div class="text-center text-white max-w-3xl px-4">
            <!-- Decorative header with interaction -->
            <div>
              <div class="flex justify-center mb-4">
                <div class="h-1 w-20 bg-gradient-to-r from-blue-400 to-transparent rounded-full transform group-hover:w-24 transition-all duration-500"></div>
                <div class="h-5 w-5 bg-gradient-to-br from-yellow-400 to-blue-400 rounded-full mx-3 transform group-hover:scale-125 group-hover:rotate-180 transition-all duration-500 shadow-lg shadow-yellow-400/30"></div>
                <div class="h-1 w-20 bg-gradient-to-l from-blue-400 to-transparent rounded-full transform group-hover:w-24 transition-all duration-500"></div>
              </div>
              
              <!-- Main Title - Smaller text -->
              <h2 class="text-4xl font-black leading-tight mb-3">
                <span class="block relative">
                  <span class="relative z-10">WELCOME BACK TO</span>
                  <span class="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500">WELCOME BACK TO</span>
                </span>
                <span class="block text-4xl mt-1 relative">
                  <span class="relative z-10">EDUARDO'S RESORT</span>
                  <span class="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-blue-300 blur opacity-0 group-hover:opacity-70 transition-opacity duration-700 animate-gradient-flow">EDUARDO'S RESORT</span>
                </span>
              </h2>
              
              <!-- Description Text - Smaller -->
              <div class="mt-4 max-w-2xl mx-auto">
                <p class="text-lg font-medium leading-relaxed opacity-95">
                  Log in and continue exploring exclusive resorts, personalized stays, and unforgettable experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Water Ripple Effect -->
        <div class="absolute inset-0 pointer-events-none" ref="rippleContainer"></div>
      </section>

      <!-- Form Section - 30% with transparent background -->
      <section class="w-[30%] min-w-[360px] relative flex items-center justify-center p-0" ref="formSection">
        <!-- Vertical accent line - Thinner -->
        <div class="absolute top-4 left-0 w-0.5 h-[calc(100%-32px)] bg-gradient-to-b from-blue-400 via-transparent to-yellow-400"></div>
        
        <!-- Form Card - Single wrapper with minimal padding and transparent background -->
        <div class="w-full h-full max-h-[calc(100%-20px)] bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-[0_20px_40px_-15px_#2563EB30,0_15px_30px_-10px_#FBBF2430] border border-white/30 relative flex flex-col justify-center transform transition-all duration-1000 overflow-hidden"
             :class="{'translate-x-0 opacity-100': formVisible, 'translate-x-10 opacity-0': !formVisible}">
          
          <!-- Corner Accents - Smaller -->
          <div class="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-yellow-400 rounded-tl-md"></div>
          <div class="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400 rounded-tr-md"></div>
          <div class="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400 rounded-bl-md"></div>
          <div class="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-yellow-400 rounded-br-md"></div>
          
          <!-- Animated Border - Subtle -->
          <div class="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-r from-blue-400/50 via-transparent to-yellow-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div class="w-full h-full bg-white/90 rounded-xl"></div>
          </div>
          
          <!-- Main Form Content -->
          <LoginForm />
          
          <!-- Glowing Effect - Subtle -->
          <div class="absolute -z-10 -inset-2 bg-gradient-to-r from-blue-400/5 via-transparent to-yellow-400/5 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import LoginForm from '../../components/LoginForm.vue'

const sidebarOpen = ref(false)
const formVisible = ref(false)
const mousePosition = reactive({ x: 0.5, y: 0.5 })
const particlesContainer = ref(null)
const rippleContainer = ref(null)
const formSection = ref(null)

const gradientStyle = computed(() => ({
  backgroundPosition: `${50 + (mousePosition.x - 0.5) * 8}% ${50 + (mousePosition.y - 0.5) * 8}%`
}))

const contentTransform = computed(() => ({
  transform: `translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px)`
}))

const visualBgStyle = computed(() => ({
  backgroundImage: `
    radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
    radial-gradient(circle at ${100 - mousePosition.x * 100}% ${100 - mousePosition.y * 100}%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, rgba(30, 64, 175, 0.4) 0%, rgba(59, 130, 246, 0.3) 50%, rgba(251, 191, 36, 0.3) 100%),
    url('https://www.eduardosresort.com/images/IMG_4224.JPG')
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundBlendMode: 'overlay, overlay, overlay, normal'
}))

const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  mousePosition.x = (e.clientX - rect.left) / rect.width
  mousePosition.y = (e.clientY - rect.top) / rect.height
  
  createParticle(e.clientX, e.clientY)
  createRipple(e.clientX - rect.left, e.clientY - rect.top)
}

const createParticle = (x, y) => {
  if (!particlesContainer.value || Math.random() > 0.3) return
  
  const particle = document.createElement('div')
  particle.className = 'absolute w-1 h-1 rounded-full bg-gradient-to-br from-blue-400/60 to-yellow-400/60'
  particle.style.left = `${x}px`
  particle.style.top = `${y}px`
  particle.style.pointerEvents = 'none'
  
  particlesContainer.value.appendChild(particle)
  
  requestAnimationFrame(() => {
    particle.style.transform = `translate(${(Math.random() - 0.5) * 60}px, ${(Math.random() - 0.5) * 60}px)`
    particle.style.opacity = '0'
    particle.style.transition = 'all 0.8s ease-out'
    
    setTimeout(() => {
      if (particlesContainer.value?.contains(particle)) {
        particlesContainer.value.removeChild(particle)
      }
    }, 800)
  })
}

const createRipple = (x, y) => {
  if (!rippleContainer.value || Math.random() > 0.15) return
  
  const ripple = document.createElement('div')
  ripple.className = 'absolute w-2 h-2 rounded-full bg-white/10 border border-white/20'
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  ripple.style.pointerEvents = 'none'
  
  rippleContainer.value.appendChild(ripple)
  
  requestAnimationFrame(() => {
    ripple.style.transform = 'scale(25)'
    ripple.style.opacity = '0'
    ripple.style.transition = 'all 1s ease-out'
    
    setTimeout(() => {
      if (rippleContainer.value?.contains(ripple)) {
        rippleContainer.value.removeChild(ripple)
      }
    }, 1000)
  })
}

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        formVisible.value = true
      }
    })
  }, { threshold: 0.3 })
  
  if (formSection.value) {
    observer.observe(formSection.value)
  }
  
  // Pre-warm animation
  setTimeout(() => {
    formVisible.value = true
  }, 300)
})

onUnmounted(() => {
  if (particlesContainer.value) {
    particlesContainer.value.innerHTML = ''
  }
  if (rippleContainer.value) {
    rippleContainer.value.innerHTML = ''
  }
})
</script>

<style scoped>
/* Animations */
@keyframes float-1 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(-15px) translateX(10px); }
  66% { transform: translateY(8px) translateX(-8px); }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(10px) translateX(-15px); }
  66% { transform: translateY(-8px) translateX(8px); }
}

@keyframes scan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes gradient-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.animate-float-1 {
  animation: float-1 15s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 18s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-scan {
  animation: scan 3s linear infinite;
}

.animate-scan-delayed {
  animation: scan 3s linear infinite;
  animation-delay: 1.5s;
}

.animate-gradient-flow {
  background-size: 300% auto;
  animation: gradient-flow 8s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse 4s ease-in-out infinite;
}

/* Ensure no scrollbars */
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

*::-webkit-scrollbar {
  display: none;
}

/* Responsive Design - Mobile stacking */
@media (max-width: 1200px) {
  .h-screen {
    height: auto;
    min-height: 100vh;
  }
  
  .flex.h-\[calc\(100vh-80px\)\] {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 80px);
  }
  
  .w-\[70\%\] {
    width: 100%;
    height: 300px;
  }
  
  .w-\[30\%\] {
    width: 100%;
    min-height: 450px;
  }
  
  .min-w-\[360px\] {
    min-width: 100%;
  }
}

@media (max-width: 768px) {
  .w-\[70\%\] {
    height: 250px;
  }
  
  .w-\[30\%\] {
    min-height: 400px;
  }
  
  .text-4xl {
    font-size: 2rem;
  }
  
  .text-lg {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .w-\[70\%\] {
    height: 200px;
  }
  
  .w-\[30\%\] {
    min-height: 380px;
  }
  
  .text-4xl {
    font-size: 1.6rem;
  }
  
  .p-5 {
    padding: 1rem;
  }
}
</style>