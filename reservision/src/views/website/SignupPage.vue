<template>
  <div class="h-screen bg-gradient-to-br from-[#0C3B5E]/5 via-white/95 to-[#F4C400]/10 overflow-hidden">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Interactive Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-[#1F8DBF]/10 to-[#F4C400]/5 rounded-full blur-3xl animate-float-1"></div>
      <div class="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-tr from-[#1F8DBF]/5 to-[#F4C400]/10 rounded-full blur-3xl animate-float-2"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-[#1F8DBF]/5 to-[#F4C400]/5 rounded-full blur-3xl animate-pulse-slow"></div>
      
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#1F8DBF]/20 to-transparent animate-scan"></div>
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F4C400]/20 to-transparent animate-scan-delayed"></div>
    </div>

    <!-- Main Content - Flex row with no overflow -->
    <div class="flex h-[calc(100vh-80px)]">
      <!-- Form Section - 30% with 0.5 spacing -->
      <section class="w-[30%] min-w-[380px] p-0.5 bg-gradient-to-br from-white/95 to-white/98 flex items-center justify-center" ref="formSection">
        <!-- Single Form Wrapper - No nesting after this -->
        <div class="w-full h-full bg-white rounded-2xl p-6 shadow-[0_30px_60px_-20px_#1F8DBF4D,0_20px_40px_-15px_#F4C40033] border border-[#1F8DBF]/10 relative flex flex-col justify-center transform transition-all duration-1000"
             :class="{'translate-x-0 opacity-100': formVisible, 'translate-x-20 opacity-0': !formVisible}">
          
          <!-- Corner Accents - Direct children of wrapper -->
          <div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#F4C400] rounded-tl-xl z-5"></div>
          <div class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#1F8DBF] rounded-tr-xl z-5"></div>
          <div class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#1F8DBF] rounded-bl-xl z-5"></div>
          <div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#F4C400] rounded-br-xl z-5"></div>
          
          <!-- SignupForm Component - Fully Functional -->
          <SignupForm />
          
        </div>
      </section>

      <!-- Visual Section - 70% -->
      <section class="w-[70%] relative overflow-hidden cursor-none"
               @mousemove="handleMouseMove"
               :style="visualBgStyle">
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-[#0C3B5E]/70 via-[#1F8DBF]/50 to-[#F4C400]/40" 
             :style="gradientStyle"></div>
        
        <!-- Interactive Particles -->
        <div class="absolute inset-0" ref="particlesContainer"></div>
        
        <!-- Parallax Content -->
        <div class="absolute inset-0 flex items-center justify-center" :style="contentTransform">
          <div class="text-center text-white max-w-3xl px-8">
            <div class="flex justify-center mb-6">
              <div class="h-1 w-24 bg-gradient-to-r from-[#1F8DBF] to-transparent rounded-full transform group-hover:w-32 transition-all duration-500"></div>
              <div class="h-5 w-5 bg-gradient-to-br from-[#F4C400] to-[#1F8DBF] rounded-full mx-4 transform group-hover:scale-125 group-hover:rotate-180 transition-all duration-500 shadow-lg shadow-[#F4C400]/30"></div>
              <div class="h-1 w-24 bg-gradient-to-l from-[#1F8DBF] to-transparent rounded-full transform group-hover:w-32 transition-all duration-500"></div>
            </div>
            
            <h2 class="text-5xl font-black leading-tight mb-4">
              <span class="block relative">
                <span class="relative z-10">WELCOME TO YOUR</span>
                <span class="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-[#1F8DBF] to-[#F4C400] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500">WELCOME TO YOUR</span>
              </span>
              <span class="block text-5xl mt-2 relative">
                <span class="relative z-10">NEXT GREAT EXPERIENCE</span>
                <span class="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-[#F4C400] via-white to-[#1F8DBF] blur opacity-0 group-hover:opacity-70 transition-opacity duration-700 animate-gradient-flow">NEXT GREAT EXPERIENCE</span>
              </span>
            </h2>
            
            <p class="text-xl font-medium leading-relaxed max-w-2xl mx-auto opacity-95">
              Join our community and discover a world of possibilities tailored just for you.
            </p>
          </div>
        </div>
        
        <!-- Ripple Container -->
        <div class="absolute inset-0 pointer-events-none" ref="rippleContainer"></div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import SignupForm from '../../components/SignupForm.vue'

const sidebarOpen = ref(false)
const formVisible = ref(false)
const mousePosition = reactive({ x: 0.5, y: 0.5 })
const particlesContainer = ref(null)
const rippleContainer = ref(null)
const formSection = ref(null)

const gradientStyle = computed(() => ({
  backgroundPosition: `${50 + (mousePosition.x - 0.5) * 10}% ${50 + (mousePosition.y - 0.5) * 10}%`
}))

const contentTransform = computed(() => ({
  transform: `translate(${(mousePosition.x - 0.5) * 30}px, ${(mousePosition.y - 0.5) * 30}px)`
}))

const visualBgStyle = computed(() => ({
  backgroundImage: `
    radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(31, 141, 191, 0.3) 0%, transparent 50%),
    radial-gradient(circle at ${100 - mousePosition.x * 100}% ${100 - mousePosition.y * 100}%, rgba(244, 196, 0, 0.25) 0%, transparent 50%),
    linear-gradient(135deg, rgba(12, 59, 94, 0.6) 0%, rgba(31, 141, 191, 0.4) 50%, rgba(244, 196, 0, 0.4) 100%),
    url('https://www.eduardosresort.com/images/IMG_0643.JPG')
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
  particle.className = 'absolute w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#1F8DBF]/60 to-[#F4C400]/60'
  particle.style.left = `${x}px`
  particle.style.top = `${y}px`
  particle.style.pointerEvents = 'none'
  
  particlesContainer.value.appendChild(particle)
  
  requestAnimationFrame(() => {
    particle.style.transform = `translate(${(Math.random() - 0.5) * 80}px, ${(Math.random() - 0.5) * 80}px)`
    particle.style.opacity = '0'
    particle.style.transition = 'all 1s ease-out'
    
    setTimeout(() => {
      if (particlesContainer.value?.contains(particle)) {
        particlesContainer.value.removeChild(particle)
      }
    }, 1000)
  })
}

const createRipple = (x, y) => {
  if (!rippleContainer.value || Math.random() > 0.15) return
  
  const ripple = document.createElement('div')
  ripple.className = 'absolute w-3 h-3 rounded-full bg-white/10 border border-white/30'
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  ripple.style.pointerEvents = 'none'
  
  rippleContainer.value.appendChild(ripple)
  
  requestAnimationFrame(() => {
    ripple.style.transform = 'scale(30)'
    ripple.style.opacity = '0'
    ripple.style.transition = 'all 1.2s ease-out'
    
    setTimeout(() => {
      if (rippleContainer.value?.contains(ripple)) {
        rippleContainer.value.removeChild(ripple)
      }
    }, 1200)
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
/* No custom styles needed - all handled by Tailwind utilities */

/* Animations */
@keyframes float-1 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(-20px) translateX(15px); }
  66% { transform: translateY(10px) translateX(-10px); }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(15px) translateX(-20px); }
  66% { transform: translateY(-10px) translateX(10px); }
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
  0%, 100% { opacity: 0.7; }
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
</style>