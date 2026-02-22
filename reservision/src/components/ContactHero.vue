<template>
  <section class="contact-hero">
    <div class="overlay"></div>

    <div class="hero-card">
      <h1>
        <span class="text-blue">Get In</span>
        <span class="text-gold">Touch</span>
      </h1>

      <p>
        We're here to assist with bookings, inquiries, or any questions about your stay.
      </p>

      <div class="contact-buttons">
        <a href="tel:0432887153" class="btn btn-blue">
          <i class="fas fa-phone-alt"></i>
          (043) 288-7153
        </a>

        <a href="mailto:info@eduardoresort.com" class="btn btn-gold">
          <i class="fas fa-envelope"></i>
          info@eduardoresort.com
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-hero {
  position: relative;
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  overflow: hidden;
  color: #0f172a;

  background-image:
    radial-gradient(circle at 20% 80%, rgba(59,130,246,0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(212,175,55,0.15) 0%, transparent 50%),
    linear-gradient(135deg, rgba(30,64,175,0.35), rgba(212,175,55,0.25)),
    url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-size: cover;
  background-blend-mode: overlay;
}

/* Soft overlay depth */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom right,
    rgba(30,64,175,0.25),
    rgba(212,175,55,0.2)
  );
}

/* Glass Card */
.hero-card {
  position: relative;
  z-index: 2;
  max-width: 650px;
  width: 100%;
  padding: 35px 30px;
  border-radius: 20px;
  backdrop-filter: blur(18px);
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.95),
    rgba(255,255,255,0.85)
  );
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
}

/* Heading */
.hero-card h1 {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 18px;
}

.text-blue {
  color: #1e40af;
}

.text-gold {
  color: #d4af37;
}

/* Paragraph */
.hero-card p {
  font-size: 1.1rem;
  margin-bottom: 28px;
  line-height: 1.6;
  color: #1e293b;
}

/* Buttons */
.contact-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
}

/* Base Button */
.btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 26px;
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

/* BLUE BUTTON */
.btn-blue {
  background: linear-gradient(to right, #1e40af, #2563eb);
  color: white;
}

.btn-blue:hover {
  background: linear-gradient(to right, #1e3a8a, #1d4ed8); /* darker pure blue */
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(30,64,175,0.45);
}

/* GOLD BUTTON */
.btn-gold {
  background: linear-gradient(to right, #d4af37, #facc15);
  color: #1e3a8a;
}

.btn-gold:hover {
  background: linear-gradient(to right, #b8941f, #eab308); /* deeper gold, no green */
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(212,175,55,0.5);
}

/* Responsive */
@media (max-width: 640px) {
  .hero-card h1 {
    font-size: 2.1rem;
  }

  .hero-card {
    padding: 25px 20px;
  }
}
</style>