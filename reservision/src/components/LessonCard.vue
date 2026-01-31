<template>
  <div class="lesson-card" :class="premium && 'premium'">
    <div class="icon"><i :class="icon"></i></div>
    <h3>{{ title }}</h3>
    <p class="desc">{{ description }}</p>
    <p class="price">{{ price }}</p>
    <button @click="$emit('enroll')">Enroll Now</button>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  price: String,
  icon: String,
  premium: Boolean
})
</script>

<style scoped>
.lesson-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,.08);
}
.lesson-card.premium { border: 2px solid #C19A6B; }
.icon {
  width: 60px; height: 60px; margin: 0 auto 1rem;
  border-radius: 50%; background: linear-gradient(135deg,#2B6CB0,#63B3ED);
  color: white; display:flex; align-items:center; justify-content:center;
}
button {
  margin-top: 1rem; background:#2B6CB0; color:white;
  padding:.75rem 1.5rem; border-radius:9999px;
}
</style>
