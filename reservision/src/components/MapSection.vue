<template>
  <section class="py-16">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4 gradient-border section-head-center">Find Us</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Visit Eduardo's Resort — a perfect getaway in Barangay Masipit, Calapan City, Oriental Mindoro.
        </p>
      </div>

      <div class="relative rounded-2xl overflow-hidden shadow-xl h-96">
        <!-- Info Card -->
        <div class="absolute left-5 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-xl p-6 max-w-xs">
          <h3 class="text-xl font-bold text-primary-blue mb-2">Eduardo's Resort</h3>
          <p class="text-gray-600 mb-4">Barangay Masipit, Calapan City, Oriental Mindoro</p>
          <a 
            href="https://maps.app.goo.gl/Sr4noCLiFPLVoA4i9" 
            target="_blank"
            class="inline-block px-2 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Locate Us
          </a>
        </div>

        <!-- Google Map -->
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1590.25514554911!2d121.16796624914198!3d13.358207851080001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bceeada8b79937%3A0xfc0dbcdcb9ffd431!2sEduardo%27s%20Resort!5e0!3m2!1sen!2sph!4v1760877039190!5m2!1sen!2sph"
          width="100%" 
          height="100%" 
          style="border:0;" 
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gradient-border {
  position: relative;
}
.gradient-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #2B6CB0, #C19A6B);
  border-radius: 3px;
}
.section-head-center::after {
  left: 50%;
  transform: translateX(-50%);
}
</style>