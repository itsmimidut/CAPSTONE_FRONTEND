<template>
  <section class="welcome-section">
    <div class="section-overlay"></div>
    <div class="welcome-inner">

      <!-- Left: Text -->
      <div class="content-card">
        <h2 class="main-heading">
          Welcome to <span class="highlight">Eduardo's Resort</span>
        </h2>
        <p class="body-text">
          Eduardo's Resort Corporation founded by Dr. Elizalde M. Herrera located at Nautical Highway Bayanan II, Calapan City Oriental Mindoro which started operation on September 8, 2013. It complies with the mandate of and operates under the Philippine laws. Eduardo's Resort promotes tourism in the province, provides employment to local residents, helps the farmers maximize product of agricultural crops and supports swimmers and athletes. Establishment of Eduardo's Resort Swimming Foundation, Inc. aims to promote swimming as primary sports in Oriental Mindoro and the rest of MIMAROPA Region; to provide excellent training, state-of-the-art competition, facility and other athletic support to members and beneficiaries of the foundation; to extend pool access and swimming lesson for individuals who are eager and passionate to learn the sport of swimming; to create programs, incentives and scholarships opportunities for competitive swimmers, coaches and officials; to establish strong partnership and linkage with local, national and international both private and government which can provide opportunities for the members and beneficiaries of the foundation.
        </p>
      </div>

      <!-- Right: Image -->
      <div class="image-card">
        <img
          src="https://www.eduardosresort.com/images/IMG_4224.JPG"
          alt="Eduardo's Resort scenic view"
          class="resort-img"
          loading="lazy"
        />
        <div class="image-overlay">
          <span class="image-caption">📍 Nautical Highway, Bayanan II, Calapan City, Oriental Mindoro</span>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.welcome-section {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-primary-dark: #1E88B6;
  --color-gold: #F4C400;
  --color-gold-dark: #F2C200;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;

  width: 100%;
  min-height: calc(100vh - 68px);
  display: flex;
  align-items: center;
  padding: 24px 40px;
  box-sizing: border-box;
  background: transparent;
  position: relative;
}

.section-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 30, 50, 0.52);
  z-index: 0;
  pointer-events: none;
}

.welcome-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  display: grid;
  grid-template-columns: 55% 45%;
  gap: 20px;
  align-items: stretch;
  min-height: calc(100vh - 136px);
}

.content-card {
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 22px;
  padding: 36px 42px;
  box-shadow:
    0 6px 32px rgba(3, 105, 161, 0.12),
    0 2px 8px rgba(12, 59, 94, 0.07);
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

.main-heading {
  font-size: clamp(1.2rem, 1.8vw, 1.7rem);
  font-weight: 800;
  color: var(--color-navy);
  line-height: 1.2;
  margin-bottom: 20px;
  white-space: nowrap;
}

.highlight {
  color: var(--color-primary);
}

.body-text {
  color: var(--color-text-dark);
  line-height: 1.8;
  font-size: clamp(0.82rem, 1.1vw, 0.94rem);
  text-align: justify;
}

.image-card {
  border-radius: 22px;
  overflow: hidden;
  box-shadow:
    0 6px 32px rgba(3, 105, 161, 0.18),
    0 2px 8px rgba(12, 59, 94, 0.10);
  position: relative;
  min-height: 340px;
}

.resort-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.image-card:hover .resort-img {
  transform: scale(1.04);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 18px;
  background: linear-gradient(to top, rgba(12, 59, 94, 0.75), transparent);
  display: flex;
  align-items: center;
}

.image-caption {
  color: var(--color-white);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  opacity: 0.95;
}

@media (max-width: 900px) {
  .welcome-section {
    padding: 20px 20px;
    min-height: unset;
  }

  .welcome-inner {
    grid-template-columns: 1fr;
    min-height: unset;
  }

  .image-card {
    min-height: 260px;
  }

  .content-card {
    padding: 28px 24px;
  }

  .main-heading {
    white-space: normal;
  }
}
</style>