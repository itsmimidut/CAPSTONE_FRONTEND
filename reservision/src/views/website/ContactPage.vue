<template>
  <div>
    <AppHeader />
    <AppSidebar />
    
    <ContactHero />
    
    <section class="contact-section">
      <div class="contact-grid">
        <ContactForm />
        <div>
          <ContactInfoCards />
          <ContactMap />
          <ContactMethods />
        </div>
      </div>
    </section>

    <AppFooter />
    <ChatbotModal />
  </div>
</template>

<script setup>
import AppHeader from '../../components/AppHeader.vue';
import AppSidebar from '../../components/AppSidebar.vue';
import AppFooter from '../../components/AppFooter.vue';
import ChatbotModal from '../../components/ChatbotModal.vue';
import ContactHero from '../../components/ContactHero.vue';
import ContactForm from '../../components/ContactForm.vue';
import ContactInfoCards from '../../components/ContactInfoCards.vue';
import ContactMap from '../../components/ContactMap.vue';
import ContactMethods from '../../components/ContactMethods.vue';
</script>

<style scoped>
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

@media (min-width: 1024px) {
  .contact-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>