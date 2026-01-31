<template>
  <section class="contact-hero">
    <div class="hero-content">
      <h1 class="animate-fade-in">Get In Touch</h1>
      <p class="animate-slide-up">
        We're here to assist with bookings, inquiries, or any questions about your stay.
      </p>
      <div class="contact-tags">
        <div class="contact-tag">
          <i class="fas fa-phone-alt"></i>
          <span>(043) 288-7153</span>
        </div>
        <div class="contact-tag">
          <i class="fas fa-envelope"></i>
          <span>info@eduardoresort.com</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-hero {
  background: linear-gradient(135deg, rgba(43,108,176,.75), rgba(193,154,107,.45)),
    url('https://images.unsplash.com/photo-1517248135467-3fb27b735e36?auto=format&fit=crop&w=1600&q=80') 
    center/cover no-repeat;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.hero-content h1 {
  font-size: 2.75rem;
  font-family: 'Dancing Script', cursive;
  margin-bottom: 0.75rem;
  text-shadow: 0 3px 8px rgba(0,0,0,.4);
}

.hero-content p {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
}

.contact-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.contact-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,.2);
  backdrop-filter: blur(8px);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.9375rem;
  font-weight: 500;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out;
}

@media (max-width: 640px) {
  .hero-content h1 { font-size: 2.25rem; }
  .hero-content p { font-size: 1rem; }
}
</style>