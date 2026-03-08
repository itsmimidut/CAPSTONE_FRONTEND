<template>
  <div class="min-h-screen page-bg overflow-x-hidden">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <section class="contact-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">Eduardo's Resort</div>
        <h1 class="hero-heading">
          <span class="heading-white">Get In</span>
          <span class="heading-gold">Touch</span>
        </h1>
        <p class="hero-subtext">
          We're here to assist with bookings, inquiries, or any questions about your stay.
        </p>
        <div class="hero-buttons">
          <a href="tel:0432887153" class="hero-btn hero-btn-primary">
            <i class="fas fa-phone-alt"></i>
            (043) 288-7153
          </a>
          <a href="mailto:info@eduardoresort.com" class="hero-btn hero-btn-outline">
            <i class="fas fa-envelope"></i>
            info@eduardoresort.com
          </a>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact-section">
      <div class="contact-grid">
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

          <div class="map-placeholder">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1590.25514554911!2d121.16796624914198!3d13.358207851080001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bceeada8b79937%3A0xfc0dbcdcb9ffd431!2sEduardo%27s%20Resort!5e0!3m2!1sen!2sph!4v1760877039190!5m2!1sen!2sph"
              width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div class="contact-methods">
            <h3>Other Ways to Reach Us</h3>
            <div v-for="method in methods" :key="method.label" class="method-item">
              <div class="method-icon"><i :class="method.icon"></i></div>
              <div>
                <p class="method-label">{{ method.label }}</p>
                <p class="method-value">{{ method.value }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
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

const form = ref({ name: '', email: '', phone: '', subject: '', message: '' })
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
      form.value = { name: '', email: '', phone: '', subject: '', message: '' }
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
* {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-gold: #F4C400;
  --color-gold-dark: #F2C200;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;
  --color-gray-bg: #f9fafb;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;
}

.page-bg { background: #f9fafb; min-height: 100vh; }

/* ── Hero ── */
.contact-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  background-image: url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
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
  color: #FFFFFF;
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
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 800;
  color: #FFFFFF;
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.heading-gold {
  font-size: clamp(2rem, 4.5vw, 3.8rem);
  font-weight: 800;
  color: #F4C400;
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
  gap: 12px;
  justify-content: center;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0.875rem 1.75rem;
  font-weight: 700;
  font-size: 0.95rem;
  border-radius: 10px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  text-decoration: none;
  cursor: pointer;
}

.hero-btn-primary {
  background: #F4C400;
  color: #0C3B5E;
  border-color: #F4C400;
  box-shadow: 0 4px 14px rgba(244, 196, 0, 0.35);
}

.hero-btn-primary:hover {
  background: #F2C200;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(244, 196, 0, 0.5);
}

.hero-btn-outline {
  background: rgba(255,255,255,0.12);
  color: #FFFFFF;
  border-color: rgba(255,255,255,0.5);
  backdrop-filter: blur(8px);
}

.hero-btn-outline:hover {
  background: rgba(255,255,255,0.22);
  transform: translateY(-2px);
}

/* ── Contact Section ── */
.contact-section {
  padding: 4rem 1rem;
  background: #f9fafb;
}

.contact-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

/* ── Form Card ── */
.form-card {
  background: white;
  border-radius: 22px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(3, 105, 161, 0.10);
  border: 1px solid rgba(3, 105, 161, 0.08);
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.form-card h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #0C3B5E;
  margin-bottom: 0.5rem;
}

.form-card p {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 2rem;
}

.form-group { margin-bottom: 1.25rem; }

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

input, select, textarea {
  width: 100%;
  padding: 0.875rem 1.1rem;
  border: 1.5px solid rgba(3, 105, 161, 0.2);
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1f2937;
  outline: none;
  transition: all 0.3s ease;
  background: white;
}

input::placeholder, textarea::placeholder { color: #9ca3af; }

input:focus, select:focus, textarea:focus {
  border-color: #0369a1;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.12);
}

textarea { resize: vertical; min-height: 140px; }

.btn-send {
  background: #F4C400;
  color: #0C3B5E;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  box-shadow: 0 4px 14px rgba(244, 196, 0, 0.3);
  transition: all 0.3s ease;
}

.btn-send:hover { background: #F2C200; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(244, 196, 0, 0.45); }
.btn-send:disabled { opacity: 0.7; cursor: not-allowed; }

/* ── Info Cards ── */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.info-card {
  background: linear-gradient(135deg, #0C3B5E, #0369a1);
  color: white;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 14px rgba(3, 105, 161, 0.18);
  display: flex;
  flex-direction: column;
  min-height: 120px;
}

.info-card.warm-card {
  background: linear-gradient(135deg, #0369a1, #1F8DBF);
}

.info-card .icon {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.info-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
.info-card p { opacity: 0.9; font-size: 0.8rem; line-height: 1.4; }

/* ── Map ── */
.map-placeholder {
  height: 220px;
  background: #e5e7eb;
  border-radius: 16px;
  margin-top: 1.25rem;
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.10);
  overflow: hidden;
  border: 1px solid rgba(3, 105, 161, 0.10);
}

/* ── Contact Methods ── */
.contact-methods {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 14px rgba(3, 105, 161, 0.08);
  border: 1px solid rgba(3, 105, 161, 0.08);
  margin-top: 1.25rem;
}

.contact-methods h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0C3B5E;
  margin-bottom: 0.75rem;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.method-item:last-child { margin-bottom: 0; }

.method-icon {
  width: 36px;
  height: 36px;
  background: rgba(3, 105, 161, 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0369a1;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.method-label { font-weight: 600; color: #0C3B5E; font-size: 0.9rem; }
.method-value { font-size: 0.82rem; color: #6b7280; }

/* ── Responsive ── */
@media (min-width: 640px) { .form-row { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .contact-grid { grid-template-columns: 1fr 1fr; } }

@media (max-width: 640px) {
  .contact-hero { height: 100svh; min-height: 100svh; max-height: 100svh; }
  .hero-content { padding: 32px 16px; }
  .hero-btn { width: 100%; font-size: 0.9rem; }
  .form-card { padding: 1.5rem; }
  .form-card h2 { font-size: 1.6rem; }
  .info-grid { grid-template-columns: 1fr; }
  .map-placeholder { height: 200px; }
}
</style>