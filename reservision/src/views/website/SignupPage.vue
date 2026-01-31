<template>
  <div class="min-h-screen bg-neutral-gray">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Signup Container -->
    <div class="signup-container">
      <!-- Form Section (LEFT on desktop) -->
      <section class="form-section">
        <SignupForm />
      </section>

      <!-- Visual Section (RIGHT on desktop) -->
      <section class="visual-section">
        <div class="visual-content">
          <h2 class="visual-title">Welcome to Your Next Great Experience</h2>
          <p class="visual-text">Join our community and discover a world of possibilities tailored just for you.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import SignupForm from '../../components/SignupForm.vue'

const sidebarOpen = ref(false)
</script>

<style scoped>
.signup-container {
  display: flex;
  min-height: calc(100vh - 80px);
  flex-direction: row;
}

.form-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: var(--color-neutral-gray);
}

.visual-section {
  flex: 1;
  background: linear-gradient(rgba(43, 108, 176, 0.85), rgba(193, 154, 107, 0.7)),
    url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top-left-radius: 500px;
}

.visual-content {
  text-align: center;
  color: white;
  max-width: 500px;
  padding: 2rem;
}

.visual-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
}

.visual-text {
  font-size: 1.2rem;
  line-height: 1.6;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

/* RESPONSIVE: MOBILE - Visual on Top */
@media (max-width: 992px) {
  .signup-container {
    flex-direction: column;
    background: linear-gradient(rgba(43, 108, 176, 0.85), rgba(193, 154, 107, 0.7)),
      url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80');
    background-size: cover;
    background-position: center;
  }

  .visual-section {
    order: -1;
    height: 280px;
    border-radius: 0;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 2rem;
  }

  .form-section {
    min-height: 60vh;
    background: rgba(245, 245, 245, 0.97);
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
    margin-top: -40px;
    position: relative;
    z-index: 10;
    padding-top: 3rem;
  }

  .visual-content {
    max-width: 90%;
  }
}

@media (max-width: 768px) {
  .visual-title {
    font-size: 2rem;
  }
  
  .visual-text {
    font-size: 1rem;
  }
  
  .visual-section {
    height: 240px;
  }
}
</style>