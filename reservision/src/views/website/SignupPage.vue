<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900/5 via-white/95 to-yellow-500/10 overflow-hidden">
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

    <!-- Signup Container - 30% form, 70% visual -->
    <div class="signup-container">
      <!-- Form Section - 30% (LEFT on desktop) -->
      <section class="form-section" ref="formSection">
        <!-- Form Background Decoration -->
        <div class="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-yellow-50/30"></div>
        <div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-400 via-transparent to-yellow-400"></div>
        
        <!-- Animated Card Entrance -->
        <div class="form-card transform transition-all duration-1000" 
             :class="{'translate-x-0 opacity-100': formVisible, 'translate-x-20 opacity-0': !formVisible}">
          <!-- Corner Accents -->
          <div class="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-yellow-400 rounded-tl-lg"></div>
          <div class="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg"></div>
          <div class="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg"></div>
          <div class="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-yellow-400 rounded-br-lg"></div>
          
          <!-- Animated Border -->
          <div class="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-blue-400 via-transparent to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div class="w-full h-full bg-white rounded-3xl"></div>
          </div>
          
          <!-- Main Form Content -->
          <div class="relative z-10">
            <SignupForm />
          </div>
          
          <!-- Glowing Effect -->
          <div class="absolute -z-10 -inset-4 bg-gradient-to-r from-blue-400/10 via-transparent to-yellow-400/10 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </div>
      </section>

      <!-- Visual Section - 70% (RIGHT on desktop) -->
      <section class="visual-section group" @mousemove="handleMouseMove">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-blue-700/30 to-yellow-500/40" 
             :style="gradientStyle"></div>
        
        <!-- Interactive Particles -->
        <div class="absolute inset-0" ref="particlesContainer"></div>
        
        <!-- Parallax Content -->
        <div class="relative z-20 visual-content" :style="contentTransform">
          <!-- Decorative header with interaction -->
          <div class="relative">
            <div class="flex justify-center mb-8">
              <div class="h-1.5 w-32 bg-gradient-to-r from-blue-400 to-transparent rounded-full transform group-hover:w-40 transition-all duration-500"></div>
              <div class="h-6 w-6 bg-gradient-to-br from-yellow-400 to-blue-400 rounded-full mx-6 transform group-hover:scale-125 group-hover:rotate-180 transition-all duration-500 shadow-lg shadow-yellow-400/30"></div>
              <div class="h-1.5 w-32 bg-gradient-to-l from-blue-400 to-transparent rounded-full transform group-hover:w-40 transition-all duration-500"></div>
            </div>
            
            <!-- Main Title -->
            <h2 class="visual-title transform group-hover:scale-105 transition-transform duration-700">
              <span class="block text-white font-black tracking-wider relative">
                <span class="relative z-10">WELCOME TO YOUR</span>
                <span class="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500">WELCOME TO YOUR</span>
              </span>
              <span class="block text-white mt-4 font-black tracking-widest text-5xl relative">
                <span class="relative z-10">NEXT GREAT EXPERIENCE</span>
                <span class="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-blue-300 blur opacity-0 group-hover:opacity-70 transition-opacity duration-700 animate-gradient-flow">NEXT GREAT EXPERIENCE</span>
              </span>
            </h2>
            
            <!-- Description Text -->
            <div class="mt-8 max-w-2xl mx-auto">
              <p class="description-text text-white font-medium tracking-wide leading-relaxed">
                Join our community and discover a world of possibilities tailored just for you.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Water Ripple Effect -->
        <div class="absolute inset-0 pointer-events-none" ref="rippleContainer"></div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import SignupForm from '../../components/SignupForm.vue'

const sidebarOpen = ref(false)
const formVisible = ref(false)
const mousePosition = reactive({ x: 0, y: 0 })
const particlesContainer = ref(null)
const rippleContainer = ref(null)
const formSection = ref(null)

const gradientStyle = ref({})
const contentTransform = ref({})

const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  mousePosition.x = ((e.clientX - rect.left) / rect.width - 0.5) * 20
  mousePosition.y = ((e.clientY - rect.top) / rect.height - 0.5) * 20
  
  gradientStyle.value = {
    backgroundPosition: `${50 + mousePosition.x * 0.5}% ${50 + mousePosition.y * 0.5}%`
  }
  
  contentTransform.value = {
    transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`
  }
  
  createParticle(e.clientX, e.clientY)
  createRipple(e.clientX - rect.left, e.clientY - rect.top)
}

const createParticle = (x, y) => {
  if (!particlesContainer.value || Math.random() > 0.3) return
  
  const particle = document.createElement('div')
  particle.className = 'absolute w-2 h-2 rounded-full bg-gradient-to-br from-blue-400/50 to-yellow-400/50'
  particle.style.left = `${x}px`
  particle.style.top = `${y}px`
  
  particlesContainer.value.appendChild(particle)
  
  setTimeout(() => {
    particle.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px)`
    particle.style.opacity = '0'
    particle.style.transition = 'all 1s ease-out'
    
    setTimeout(() => {
      if (particlesContainer.value.contains(particle)) {
        particlesContainer.value.removeChild(particle)
      }
    }, 1000)
  }, 10)
}

const createRipple = (x, y) => {
  if (!rippleContainer.value || Math.random() > 0.1) return
  
  const ripple = document.createElement('div')
  ripple.className = 'absolute w-4 h-4 rounded-full bg-white/10 border border-white/20'
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  
  rippleContainer.value.appendChild(ripple)
  
  setTimeout(() => {
    ripple.style.transform = 'scale(40)'
    ripple.style.opacity = '0'
    ripple.style.transition = 'all 1.5s ease-out'
    
    setTimeout(() => {
      if (rippleContainer.value.contains(ripple)) {
        rippleContainer.value.removeChild(ripple)
      }
    }, 1500)
  }, 10)
}

const handleIntersection = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      formVisible.value = true
    }
  })
}

onMounted(() => {
  const observer = new IntersectionObserver(handleIntersection, {
    threshold: 0.3
  })
  
  if (formSection.value) {
    observer.observe(formSection.value)
  }
  
  // Pre-warm animations
  setTimeout(() => {
    formVisible.value = true
  }, 300)
})

onUnmounted(() => {
  // Cleanup
  if (particlesContainer.value) {
    particlesContainer.value.innerHTML = ''
  }
  if (rippleContainer.value) {
    rippleContainer.value.innerHTML = ''
  }
})
</script>

<style scoped>
.signup-container {
  display: flex;
  height: calc(100vh - 80px); /* Fixed height - no scrolling */
  flex-direction: row;
  position: relative;
  overflow: hidden;
}

.form-section {
  flex: 3; /* 30% */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  min-width: 380px;
}

.form-card {
  width: 100%;
  max-width: 360px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 
    0 30px 80px -20px rgba(37, 99, 235, 0.25),
    0 20px 60px -15px rgba(251, 191, 36, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
  height: auto;
  max-height: 95%;
}

.visual-section {
  flex: 7; /* 70% */
  position: relative;
  background: 
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.4) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.35) 0%, transparent 60%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 70%),
    linear-gradient(135deg, 
      rgba(30, 64, 175, 0.6) 0%, 
      rgba(59, 130, 246, 0.4) 25%, 
      rgba(251, 191, 36, 0.4) 75%, 
      rgba(245, 158, 11, 0.6) 100%),
    url('https://www.eduardosresort.com/images/IMG_0643.JPG');
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay, overlay, overlay, overlay, normal;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: none;
}

.visual-content {
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 2rem;
  position: relative;
  z-index: 20;
  transition: transform 0.1s ease-out;
  will-change: transform;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.visual-title {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 1px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.description-text {
  font-size: 1.4rem;
  line-height: 1.6;
  opacity: 0.95;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  margin: 0 auto;
}

/* Animations */
@keyframes float-1 {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  33% {
    transform: translateY(-20px) translateX(15px);
  }
  66% {
    transform: translateY(10px) translateX(-10px);
  }
}

@keyframes float-2 {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  33% {
    transform: translateY(15px) translateX(-20px);
  }
  66% {
    transform: translateY(-10px) translateX(10px);
  }
}

@keyframes scan {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes gradient-flow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
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

/* Responsive Design */
@media (max-width: 1400px) {
  .visual-title {
    font-size: 3rem;
  }
  
  .description-text {
    font-size: 1.2rem;
  }
  
  .text-5xl {
    font-size: 3.5rem;
  }
}

@media (max-width: 1200px) {
  .signup-container {
    flex-direction: column;
    height: auto; /* Allow scrolling on mobile */
    min-height: calc(100vh - 80px);
  }
  
  .form-section {
    flex: none;
    width: 100%;
    min-height: 500px;
    order: -1;
  }
  
  .visual-section {
    flex: none;
    height: 350px;
    width: 100%;
  }
  
  .visual-content {
    padding: 1.5rem;
    height: auto;
  }
  
  .form-card {
    max-width: 450px;
    margin-top: -30px;
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .visual-section {
    height: 300px;
  }
  
  .visual-content {
    padding: 1rem;
  }
  
  .visual-title {
    font-size: 2.2rem;
  }
  
  .description-text {
    font-size: 1rem;
    margin-top: 0.5rem;
  }
  
  .text-5xl {
    font-size: 2.5rem;
  }
  
  .form-section {
    min-height: 450px;
    padding: 1.5rem;
  }
  
  .form-card {
    padding: 1.75rem;
  }
}

@media (max-width: 480px) {
  .visual-section {
    height: 250px;
  }
  
  .visual-title {
    font-size: 1.8rem;
  }
  
  .description-text {
    font-size: 0.9rem;
  }
  
  .text-5xl {
    font-size: 2rem;
  }
  
  .form-section {
    padding: 1rem;
    min-height: 400px;
  }
  
  .form-card {
    padding: 1.5rem;
  }
}
</style>