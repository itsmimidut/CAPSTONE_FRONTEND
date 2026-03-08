<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-yellow-50/30 overflow-x-hidden">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <section
      class="relative flex items-center justify-center min-h-[450px] sm:min-h-[550px] contact-hero text-center px-4 overflow-hidden pt-[78px]"
    >
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-10 left-10 w-32 h-32 bg-[#1F8DBF]/20 rounded-full blur-3xl animate-pulse-hero"></div>
        <div class="absolute bottom-10 right-10 w-40 h-40 bg-[#F4C400]/20 rounded-full blur-3xl animate-pulse-hero delay-1000"></div>
      </div>

      <div class="absolute inset-0 bg-gradient-to-br from-[#1F8DBF]/20 via-[#F4C400]/10 to-[#F4C400]/20"></div>

      <div class="relative z-10 max-w-4xl w-full backdrop-blur-md bg-white/50 rounded-2xl p-8 sm:p-10 md:p-12 shadow-2xl mx-4 flex flex-col justify-center border border-white/40 my-12">
        <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-[#F4C400]/5 to-[#1F8DBF]/10 rounded-2xl pointer-events-none"></div>

        <div class="relative z-20 flex flex-col items-center justify-center">
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-[#F4C400]/30 rounded-full blur-2xl animate-pulse-slow-hero"></div>

          <h1 class="text-[32px] sm:text-[40px] md:text-[48px] font-bold leading-tight relative mb-4">
            <span class="text-[#0C3B5E] drop-shadow-lg">Get In Touch</span>
          </h1>

          <div class="mt-2 mb-6">
            <p class="text-xs sm:text-sm text-[#0C3B5E]/80 leading-relaxed drop-shadow-md font-medium max-w-2xl mx-auto">
              We're here to assist with bookings, inquiries, or any questions about your stay.
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-4 mt-2 w-full max-w-3xl">
            <a
              href="tel:0432887153"
              class="hero-contact-btn hero-contact-btn-primary"
            >
              <span class="relative z-10 flex items-center gap-3 transition-colors duration-300">
                <i class="fas fa-phone-alt"></i>
                (043) 288-7153
              </span>
              <div class="hero-btn-overlay"></div>
            </a>

            <a
              href="mailto:info@eduardoresort.com"
              class="hero-contact-btn hero-contact-btn-secondary"
            >
              <span class="relative z-10 flex items-center gap-3 transition-colors duration-300">
                <i class="fas fa-envelope"></i>
                info@eduardoresort.com
              </span>
              <div class="hero-btn-overlay"></div>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Decorative background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-yellow-400/10 rounded-full blur-3xl animate-float-1"></div>
      <div class="absolute bottom-1/3 right-10 w-40 h-40 bg-gradient-to-tr from-blue-300/5 to-yellow-300/10 rounded-full blur-3xl animate-float-2"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-blue-200/5 to-yellow-200/5 rounded-full blur-3xl animate-pulse-soft"></div>
    </div>

    <!-- Contact Section -->
    <section class="contact-section relative">
      <div class="contact-grid relative z-10">
        <!-- Form -->
        <div class="form-card">
          <h2>Send Us a Message</h2>
          <p>We'll respond within 24 hours.</p>

          <form @submit.prevent="handleSubmit">
            <div class="form-row">
              <div class="form-group">
                <input v-model="form.name" type="text" placeholder="Full Name" required />
              </div>
              <div class="form-group">
                <input v-model="form.email" type="email" placeholder="Email Address" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <input v-model="form.phone" type="tel" placeholder="Phone Number" />
              </div>
              <div class="form-group">
                <select v-model="form.subject" required>
                  <option value="">Select Subject</option>
                  <option>Booking Inquiry</option>
                  <option>Reservation</option>
                  <option>General Question</option>
                  <option>Feedback</option>
                  <option>Complaint</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <textarea v-model="form.message" placeholder="Your Message..." required></textarea>
            </div>

            <button type="submit" class="btn-send" :disabled="loading">
              <span>{{ loading ? 'Sending...' : 'Send Message' }}</span>
              <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"></i>
            </button>
          </form>
        </div>

        <!-- Right Column -->
        <div>
          <!-- Info cards -->
          <div class="info-grid">
            <div class="info-card">
              <div class="icon"><i class="fas fa-map-marker-alt"></i></div>
              <h3>Location</h3>
              <p>Nautical Highway Bayanan II, Calapan City, Oriental Mindoro, Philippines</p>
            </div>

            <div class="info-card warm-card">
              <div class="icon"><i class="fas fa-clock"></i></div>
              <h3>Hours</h3>
              <p>24/7 Front Desk</p>
              <p>Restaurant: 6AM - 11PM</p>
            </div>
          </div>

          <!-- Map -->
          <div class="map-placeholder">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1590.25514554911!2d121.16796624914198!3d13.358207851080001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bceeada8b79937%3A0xfc0dbcdcb9ffd431!2sEduardo%27s%20Resort!5e0!3m2!1sen!2sph!4v1760877039190!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style="border:0;"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <!-- Contact methods -->
          <div class="contact-methods">
            <h3>Other Ways to Reach Us</h3>

            <div v-for="method in methods" :key="method.label" class="method-item">
              <div class="method-icon"><i :class="method.icon"></i></div>
              <div>
                <p class="font-medium">{{ method.label }}</p>
                <p class="text-sm text-gray-600">{{ method.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />

    <!-- Chatbot -->
    <ChatbotModal />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import ChatbotModal from '../../components/ChatbotModal.vue'

const sidebarOpen = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const loading = ref(false)

const methods = [
  { icon: 'fas fa-phone', label: 'Phone', value: '(043) 288-7153' },
  { icon: 'fas fa-mobile-alt', label: 'Mobile', value: '0921 507 4378 / 0977 845 8144' },
  { icon: 'fas fa-envelope', label: 'Email', value: 'info@eduardoresort.com' }
]

const handleSubmit = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    if (response.ok) {
      alert(`Thank you, ${form.value.name}! Your message has been sent successfully!`)
      form.value = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      }
    } else {
      alert(data.error || 'Something went wrong. Please try again.')
    }
  } catch (err) {
    console.error(err)
    alert('No connection. Make sure server is running!')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.contact-hero {
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

.contact-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.2) 100%);
  pointer-events: none;
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.contact-section {
  padding: 4rem 1rem;
  background: linear-gradient(to bottom, #E0F7FA, #FFFFFF);
}

.contact-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.form-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(2, 8, 20, 0.15);
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.form-card h2 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #2C3E90;
  margin-bottom: 0.75rem;
}

.form-card p {
  color: #1a2a5a;
  font-size: 1.125rem;
  margin-bottom: 2rem;
  line-height: 1.75;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

input,
select,
textarea {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid #2C3E90;
  border-radius: 12px;
  font-size: 1.125rem;
  color: #1a2a5a;
  outline: none;
  transition: all 0.3s ease;
  background: white;
}

input::placeholder,
textarea::placeholder {
  color: #718096;
  opacity: 1;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #2C3E90;
  box-shadow: 0 0 0 3px rgba(44, 62, 144, 0.2);
}

textarea {
  resize: vertical;
  min-height: 150px;
}

.btn-send {
  background: #FFD700;
  color: #1a2a5a;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  box-shadow: 0 6px 16px rgba(44, 62, 144, 0.2);
  transition: all 0.3s ease;
}

.btn-send:hover {
  background: #FFC107;
  transform: translateY(-2px);
}

.btn-send:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-card {
  background: linear-gradient(135deg, #2B6CB0, #63B3ED);
  color: white;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  display: flex;
  flex-direction: column;
  min-height: 120px;
}

.info-card.warm-card {
  background: linear-gradient(135deg, #C19A6B, #d4a574);
}

.info-card .icon {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.info-card h3 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.info-card p {
  opacity: 0.9;
  font-size: 0.8rem;
  line-height: 1.4;
}

.map-placeholder {
  height: 220px;
  background: #e5e7eb;
  border-radius: 16px;
  margin-top: 1.5rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  overflow: hidden;
}

.contact-methods {
  background: #F5F5F5;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  margin-top: 1.5rem;
}

.contact-methods h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 0.75rem;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.method-item:last-child {
  margin-bottom: 0;
}

.method-icon {
  width: 36px;
  height: 36px;
  background: rgba(43,108,176,.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2B6CB0;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.font-medium {
  font-weight: 500;
  color: #2D3748;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-600 {
  color: #718096;
}

.hero-contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  font-weight: 800;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
  border: 2px solid;
  font-size: 0.95rem;
  min-height: 58px;
}

.hero-contact-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.hero-contact-btn-primary {
  background: #F4C400;
  color: #0C3B5E;
  border-color: #F4C400;
}

.hero-contact-btn-primary i {
  color: #1F8DBF;
}

.hero-contact-btn-secondary {
  background: transparent;
  color: #0C3B5E;
  border-color: #0C3B5E;
}

.hero-contact-btn-secondary i {
  color: #1F8DBF;
}

.hero-btn-overlay {
  position: absolute;
  inset: 0;
  background: #0A2F4A;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hero-contact-btn:hover .hero-btn-overlay {
  opacity: 1;
}

.hero-contact-btn:hover span,
.hero-contact-btn:hover i {
  color: white;
}

@keyframes pulseHero {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes pulseSlowHero {
  0%, 100% { opacity: 0.2; transform: scale(1) translateX(-50%); }
  50% { opacity: 0.4; transform: scale(1.2) translateX(-50%); }
}

@keyframes float-1 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(-15px) translateX(10px); }
  66% { transform: translateY(10px) translateX(-10px); }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(0) translateX(0); }
  33% { transform: translateY(10px) translateX(-15px); }
  66% { transform: translateY(-10px) translateX(10px); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.animate-pulse-hero {
  animation: pulseHero 4s ease-in-out infinite;
}

.animate-pulse-slow-hero {
  animation: pulseSlowHero 6s ease-in-out infinite;
  left: 50% !important;
}

.animate-float-1 {
  animation: float-1 12s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 15s ease-in-out infinite;
  animation-delay: 2s;
}

.animate-pulse-soft {
  animation: pulse-soft 3s ease-in-out infinite;
}

.delay-1000 {
  animation-delay: 1s;
}

@media (min-width: 640px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .contact-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .form-card h2 {
    font-size: 1.8rem;
  }

  .form-card p {
    font-size: 1rem;
  }
}

@media (max-width: 640px) {
  .contact-hero {
    min-height: 450px;
  }

  .text-\[32px\] {
    font-size: 28px;
  }

  .max-w-2xl {
    max-width: 100%;
  }

  .hero-contact-btn {
    width: 100%;
    font-size: 0.9rem;
    padding: 0.875rem 1.25rem;
  }

  .form-card {
    padding: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  input,
  select,
  textarea,
  .btn-send {
    font-size: 1rem;
  }

  .map-placeholder {
    height: 200px;
  }
}
</style>