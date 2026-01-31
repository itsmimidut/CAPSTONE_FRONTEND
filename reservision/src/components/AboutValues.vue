<template>
  <section class="section bg-neutral-gray">
    <div class="container">
      <h2 class="text-3xl font-bold text-center text-text-dark mb-8">
        Our Core Values
      </h2>
      <div class="values-grid">
        <div v-for="value in values" :key="value.title" class="value-card">
          <div 
            class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white"
            :style="{ background: value.gradient }"
          >
            <i :class="value.icon + ' text-xl'"></i>
          </div>
          <h3 class="text-xl font-bold mb-2">{{ value.title }}</h3>
          <p class="text-text-muted text-sm">{{ value.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const values = [
  {
    icon: 'fas fa-leaf',
    title: 'Sustainability',
    description: 'Eco-friendly practices in every corner.',
    gradient: 'linear-gradient(135deg, #2B6CB0, #63B3ED)'
  },
  {
    icon: 'fas fa-hands-helping',
    title: 'Hospitality',
    description: 'Warm, genuine service that feels like home.',
    gradient: 'linear-gradient(135deg, #C19A6B, #d97706)'
  },
  {
    icon: 'fas fa-gem',
    title: 'Excellence',
    description: 'Uncompromising quality in every detail.',
    gradient: 'linear-gradient(135deg, #2B6CB0, #63B3ED)'
  }
];
</script>

<style scoped>
.section {
  padding: 4rem 1rem;
}

.bg-neutral-gray {
  background: #F5F5F5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.text-text-dark {
  color: #2D3748;
}

.text-text-muted {
  color: #718096;
}

.values-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.value-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
}

.value-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 30px rgba(2, 8, 20, 0.12);
}

@media (max-width: 768px) {
  .values-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .value-card {
    padding: 1rem;
    min-height: auto;
  }
  .value-card .w-16 {
    width: 3rem;
    height: 3rem;
  }
  .value-card .text-xl {
    font-size: 1.1rem;
  }
  .value-card p {
    font-size: 0.875rem;
  }
}
</style>