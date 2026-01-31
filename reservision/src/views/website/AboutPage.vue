<template>
  <div>
    <AppHeader />
    <AppSidebar />
    
    <AboutHero />
    <AboutHistory />
    <AboutValues />
    <AboutLeadership />
    <AboutCTA />

    <AppFooter />
    <ChatbotModal />
  </div>
</template>

<script setup>
import AppHeader from '../../components/AppHeader.vue';
import AppSidebar from '../../components/AppSidebar.vue';
import AppFooter from '../../components/AppFooter.vue';
import ChatbotModal from '../../components/ChatbotModal.vue';
import AboutHero from '../../components/AboutHero.vue';
import AboutHistory from '../../components/AboutHistory.vue';
import AboutValues from '../../components/AboutValues.vue';
import AboutLeadership from '../../components/AboutLeadership.vue';
import AboutCTA from '../../components/AboutCTA.vue';
</script>