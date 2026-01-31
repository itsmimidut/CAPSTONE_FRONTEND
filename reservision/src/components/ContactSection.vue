<template>
  <section class="py-16 bg-neutral-gray">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold text-text-dark mb-6">Contact & Reservations</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <!-- Phone -->
        <div class="contact-card">
          <div class="icon-wrapper">
            <i class="fas fa-phone"></i>
          </div>
          <p class="font-semibold mb-3 text-lg">Call Us</p>
          <div class="contact-details">
            <p>(043) 288-7153</p>
            <p>0928-890-6708</p>
            <p>0918-322-7201</p>
            <p>0921-507-4378</p>
            <p class="mt-3">
              <i class="fab fa-viber text-purple-600 mr-2"></i>
              Viber: 0961-217-3287
            </p>
          </div>
        </div>

        <!-- Email & Social -->
        <div class="contact-card">
          <div class="icon-wrapper">
            <i class="fas fa-envelope"></i>
          </div>
          <p class="font-semibold mb-3 text-lg">Email & Social</p>
          <div class="contact-details">
            <p class="break-words">eduardosresortreservation@gmail.com</p>
            <p class="mt-2">
              <i class="fas fa-globe text-primary-blue mr-2"></i>
              www.eduardosresort.com
            </p>
            <p>
              <i class="fab fa-facebook text-blue-600 mr-2"></i>
              Eduardo's Resort
            </p>
          </div>
        </div>
      </div>
      <p class="mt-8 text-sm text-text-muted max-w-2xl mx-auto">
        <i class="fas fa-map-marker-alt mr-2 text-primary-blue"></i>
        Location: Nautical Highway, Bayanan II, Calapan City, Oriental Mindoro 5200
      </p>
    </div>
  </section>
</template>

<style scoped>
.contact-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #2B6CB0, #63B3ED);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.contact-details {
  font-size: 0.95rem;
  color: #4a5568;
}

.contact-details p {
  margin: 0.25rem 0;
}
</style>