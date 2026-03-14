<template>
<section class="hero-section">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-badge">Waterpark & Wellness Resort</div>
    <h1 class="hero-heading">
      <span class="heading-white">ReserVision</span>
      <span class="heading-gold">Waterpark &<br/>Wellness Resort</span>
    </h1>
    <p class="hero-subtext">
      Where elegant relaxation meets family fun. Enjoy<br/>
      thrilling slides, serene pools, curated dining, and a<br/>
      personal smart assistant to plan your stay.
    </p>
    <div class="hero-buttons">
      <div v-if="showLoginPrompt" class="login-prompt">
        <i class="fas fa-lock mr-1"></i>Only customers can book. Please log in as a customer.
      </div>
      <button @click="handleBook" class="btn-primary">Book Your Escape</button>
    </div>
  </div>
</section>
</template>

<style scoped>
.hero-section {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark: #1E88B6;
  --color-gold: #F4C400;
  --color-gold-dark: #F2C200;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;

  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
  flex-grow: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 30, 50, 0.52);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 24px;
  max-width: 780px;
  width: 100%;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: var(--color-white);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 6px 18px;
  border-radius: 999px;
}

.hero-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.15;
}

.heading-white {
  font-size: clamp(3rem, 7vw, 5.5rem);  /* was clamp(2.2rem, 5vw, 3.8rem) */
  font-weight: 800;
  color: var(--color-white);
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.heading-gold {
  font-size: clamp(2rem, 4.5vw, 3.8rem);  /* was clamp(1.6rem, 3.2vw, 2.6rem) */
  font-weight: 800;
  color: var(--color-gold);
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.hero-subtext {
  font-size: clamp(0.88rem, 1.3vw, 1rem);
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.75;
  font-weight: 400;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.btn-primary {
  padding: 14px 36px;
  background: var(--color-gold);
  color: var(--color-navy);
  font-weight: 800;
  font-size: 0.97rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 18px rgba(244, 196, 0, 0.4);
}

.btn-primary:hover {
  background: var(--color-gold-dark);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 24px rgba(244, 196, 0, 0.5);
}

.login-prompt {
  width: 100%;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 8px 14px;
}

@media (max-width: 640px) {
  .hero-section {
    height: 100svh;
    min-height: 100svh;
    max-height: 100svh;
  }

  .hero-content {
    padding: 32px 16px;
  }

  .btn-primary {
    width: 100%;
    max-width: 280px;
  }
}
</style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const showLoginPrompt = ref(false)

const handleBook = () => {
  if (auth.isAuthenticated && auth.user?.role === 'customer') {
    router.push('/customer?section=book')
  } else if (auth.isAuthenticated) {
    showLoginPrompt.value = true
    setTimeout(() => { showLoginPrompt.value = false }, 4000)
  } else {
    router.push('/login?redirect=/customer?section=book')
  }
}
</script>