<template>
  <section class="py-16 bg-gradient-to-r from-primary-blue to-accent-blue text-white">
    <div class="container text-center">
      <h2 class="text-3xl font-bold mb-6">Be Part of Our Story</h2>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link 
          to="/reservation" 
          class="bg-white text-primary-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Book Your Stay
        </router-link>
        <router-link 
          to="/gallery" 
          class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-blue transition"
        >
          View Gallery
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.bg-gradient-to-r {
  background: linear-gradient(to right, #2B6CB0, #63B3ED);
}

.from-primary-blue {
  --tw-gradient-from: #2B6CB0;
}

.to-accent-blue {
  --tw-gradient-to: #63B3ED;
}

.text-primary-blue {
  color: #2B6CB0;
}

a {
  text-decoration: none;
  display: inline-block;
}

@media (max-width: 640px) {
  .flex-col {
    flex-direction: column;
  }
}
</style>