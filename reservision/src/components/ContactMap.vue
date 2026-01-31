<template>
  <div class="map-placeholder">
    <iframe 
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1590.25514554911!2d121.16796624914198!3d13.358207851080001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bceeada8b79937%3A0xfc0dbcdcb9ffd431!2sEduardo%27s%20Resort!5e0!3m2!1sen!2sph!4v1760877039190!5m2!1sen!2sph"
      width="100%" 
      height="100%" 
      style="border:0;" 
      allowfullscreen 
      loading="lazy" 
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  </div>
</template>

<style scoped>
.map-placeholder {
  height: 220px;
  background: #e5e7eb;
  border-radius: 16px;
  margin-top: 1.5rem;
  box-shadow: 0 4px 12px rgba(2, 8, 20, 0.08);
  overflow: hidden;
}

@media (max-width: 768px) {
  .map-placeholder {
    height: 200px;
  }
}
</style>