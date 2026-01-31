<template>
  <section class="section bg-white">
    <div class="container">
      <h2 class="text-3xl font-bold text-center text-text-dark mb-8">
        Our Leadership
      </h2>
      <div class="img-placeholder">
        <i class="fas fa-sitemap"></i>
        <p>Add Organizational Chart</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  padding: 4rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.text-text-dark {
  color: #2D3748;
}

.img-placeholder {
  background: #e5e7eb;
  border-radius: 16px;
  width: 100%;
  height: 16rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
}

.img-placeholder i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}
</style>