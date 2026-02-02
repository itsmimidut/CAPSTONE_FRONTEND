<template>
  <div class="min-h-screen bg-gradient">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title animate-fade-in">Swimming Lessons</h1>
        <p class="hero-subtitle animate-slide-up">
          Learn to swim with certified instructors in a safe, fun environment
        </p>
        <div class="hero-actions animate-slide-up">
          <button @click="openEnrollmentModal()" class="btn-primary">
            <i class="fas fa-swimming-pool mr-2"></i>
            Enroll Now
          </button>
          <button @click="downloadBrochure" class="btn-outline">
            <i class="fas fa-download mr-2"></i>
            View/Download Enrollment Form
          </button>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="section-container bg-white">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title">Why Choose Our Swimming Lessons?</h2>
          <p class="section-subtitle">
            Professional instruction tailored to your skill level
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div 
            v-for="feature in features" 
            :key="feature.title"
            class="feature-card reveal"
          >
            <div :class="['feature-icon', feature.colorClass]">
              <i :class="feature.icon"></i>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Lesson Types -->
    <section class="bg-gradient-to-b from-gray-50 to-white py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title">Our Programs</h2>
          <p class="section-subtitle">Choose the perfect lesson type for you</p>
        </div>

        <div class="grid md:grid-cols-2 gap-7 max-w-4xl mx-auto">
          <div 
            v-for="lesson in lessonTypes" 
            :key="lesson.type"
            class="lesson-card reveal"
          >
            <div class="lesson-header">
              <div :class="['lesson-badge', lesson.badgeClass]">
                <i :class="lesson.icon"></i>
              </div>
              <div>
                <h3 class="lesson-title">{{ lesson.type }}</h3>
                <p class="lesson-subtitle">{{ lesson.subtitle }}</p>
              </div>
            </div>
            <div class="lesson-body">
              <div class="lesson-price">
                <span class="price-amount">₱{{ lesson.price.toLocaleString() }}</span>
                <span class="price-duration">/ {{ lesson.duration }}</span>
              </div>
              <ul class="lesson-features">
                <li v-for="feature in lesson.features" :key="feature">
                  <i class="fas fa-check-circle text-green-500 mr-2"></i>
                  {{ feature }}
                </li>
              </ul>
              <button 
                @click="openEnrollmentModal(lesson.type)"
                class="lesson-enroll-btn"
              >
                Enroll in {{ lesson.type }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Image Gallery -->
    <section class="section-container bg-white">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title">Our Facilities</h2>
          <p class="section-subtitle">See where the magic happens</p>
        </div>

        <div class="gallery-grid">
          <div
            v-for="(image, index) in galleryImages"
            :key="index"
            @click="openLightbox(index)"
            class="gallery-item reveal"
            :style="{ backgroundImage: `url(${image.url})` }"
          >
            <div class="gallery-overlay">
              <i class="fas fa-search-plus text-3xl"></i>
            </div>
            <div class="gallery-caption">{{ image.caption }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Schedule Section -->
    <section class="bg-gradient-to-br from-blue-50 to-cyan-50 py-16">
      <div class="max-w-4xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title">Class Schedule</h2>
          <p class="section-subtitle">Find a time that works for you</p>
        </div>

        <div class="schedule-table-container reveal">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Monday - Friday</th>
                <th>Saturday - Sunday</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slot in schedule" :key="slot.time">
                <td class="font-semibold">{{ slot.time }}</td>
                <td>{{ slot.weekday }}</td>
                <td>{{ slot.weekend }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-6 text-center">
          <button @click="openClassBookingModal()" class="btn-primary">
            <i class="fas fa-calendar-plus mr-2"></i>
            Book a Class Session
          </button>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Make a Splash?
        </h2>
        <p class="text-xl text-blue-100 mb-8">
          Join hundreds of students who've learned to swim with us
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <button @click="openEnrollmentModal()" class="btn-white">
            <i class="fas fa-user-plus mr-2"></i>
            Enroll Now
          </button>
          <a href="/contact" class="btn-outline-white">
            <i class="fas fa-phone mr-2"></i>
            Contact Us
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />

    <!-- Enrollment Modal -->
    <Teleport to="body">
      <EnrollmentModal
        v-if="showEnrollmentModal"
        :preselected-type="selectedLessonType"
        @close="closeEnrollmentModal"
        @submit="handleEnrollment"
      />
    </Teleport>

    <!-- Class Booking Modal -->
    <Teleport to="body">
      <SwimmingClassBookingModal
        v-if="showClassBookingModal"
        :preselected-type="selectedBookingLessonType"
        @close="closeClassBookingModal"
        @submit="handleClassBooking"
      />
    </Teleport>

    <!-- Lightbox -->
    <Teleport to="body">
      <ImageLightbox
        v-if="showLightbox"
        :images="galleryImages"
        :current-index="currentImageIndex"
        @close="closeLightbox"
        @next="nextImage"
        @prev="prevImage"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import EnrollmentModal from '../../components/EnrollmentModal.vue'
import SwimmingClassBookingModal from '../../components/SwimmingClassBookingModal.vue'
import ImageLightbox from '../../components/ImageLightBox.vue'
const sidebarOpen = ref(false)
const showEnrollmentModal = ref(false)
const selectedLessonType = ref(null)
const showClassBookingModal = ref(false)
const selectedBookingLessonType = ref(null)
const showLightbox = ref(false)
const currentImageIndex = ref(0)

const features = [
  { icon: 'fas fa-user-tie', title: 'Certified Instructors', description: 'Learn from experienced, certified swimming coaches with years of teaching experience', colorClass: 'bg-blue-100 text-blue-600' },
  { icon: 'fas fa-shield-alt', title: 'Safety First', description: 'State-of-the-art facilities with lifeguards on duty and safety equipment available', colorClass: 'bg-green-100 text-green-600' },
  { icon: 'fas fa-users', title: 'All Skill Levels', description: 'From beginners to advanced swimmers, we have programs tailored to your needs', colorClass: 'bg-purple-100 text-purple-600' }
]

const lessonTypes = [
  { type: 'Group Lessons', subtitle: 'Learn with friends', icon: 'fas fa-users', badgeClass: 'bg-blue-100 text-blue-600', price: 1500, duration: 'month', features: ['4-6 students per group','8 sessions per month','1 hour per session','Basic to intermediate levels','Fun group activities'] },
  { type: 'Private Lessons', subtitle: 'One-on-one coaching', icon: 'fas fa-user', badgeClass: 'bg-purple-100 text-purple-600', price: 3500, duration: 'month', features: ['Personalized attention','8 sessions per month','1 hour per session','All skill levels','Flexible scheduling'] }
]

const galleryImages = [
  { url: '/images/swimming1.jpg', caption: 'Olympic-size Pool' },
  { url: '/images/swimming2.jpg', caption: 'Beginner Class' },
  { url: '/images/swimming3.jpg', caption: 'Private Coaching' },
  { url: '/images/swimming4.jpg', caption: 'Kids Learning' },
  { url: '/images/swimming5.jpg', caption: 'Advanced Training' },
  { url: '/images/swimming6.jpg', caption: 'Group Session' }
]

const schedule = [
  { time: '6:00 AM - 7:00 AM', weekday: 'Advanced Training', weekend: 'Private Sessions' },
  { time: '8:00 AM - 9:00 AM', weekday: 'Beginner Group', weekend: 'Family Sessions' },
  { time: '10:00 AM - 11:00 AM', weekday: 'Intermediate Group', weekend: 'Kids Group' },
  { time: '2:00 PM - 3:00 PM', weekday: 'Kids Group', weekend: 'Beginner Group' },
  { time: '4:00 PM - 5:00 PM', weekday: 'Private Sessions', weekend: 'Advanced Group' }
]

const openEnrollmentModal = (lessonType = null) => {
  // Check if lessonType is an event object, if so, set to null
  const actualLessonType = (typeof lessonType === 'object' && lessonType !== null) ? null : lessonType
  console.log('Modal opening - Lesson type:', actualLessonType)
  selectedLessonType.value = actualLessonType
  showEnrollmentModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeEnrollmentModal = () => {
  showEnrollmentModal.value = false
  selectedLessonType.value = null
  document.body.style.overflow = ''
}

const openClassBookingModal = (lessonType = null) => {
  const actualLessonType = (typeof lessonType === 'object' && lessonType !== null) ? null : lessonType
  selectedBookingLessonType.value = actualLessonType
  showClassBookingModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeClassBookingModal = () => {
  showClassBookingModal.value = false
  selectedBookingLessonType.value = null
  document.body.style.overflow = ''
}

const handleClassBooking = (payload) => {
  console.log('Class booking submitted:', payload)
  closeClassBookingModal()
  setTimeout(() => {
    alert(`✅ Booking Request Submitted!\n\nName: ${payload.fullName}\nLesson: ${payload.lessonType}\nDate: ${payload.preferredDate}\nTime: ${payload.preferredTime}\n\nWe will contact you to confirm your class schedule.`)
  }, 200)
}

const handleEnrollment = (response) => {
  console.log('Enrollment submitted successfully:', response)
  
  closeEnrollmentModal()
  
  // Show success message with better formatting
  setTimeout(() => {
    const enrollment = response.enrollment
    alert(`🎉 Enrollment Successful!

✓ Your enrollment has been submitted

📋 Enrollment Details:
   • Enrollment ID: #${enrollment.enrollment_id}
   • Name: ${enrollment.first_name} ${enrollment.last_name}
   • Lesson Type: ${enrollment.lesson_type}
   • Coach: ${enrollment.preferred_coach}
   • Email: ${enrollment.email}
   • Status: ${enrollment.enrollment_status}

📧 Next Steps:
We will contact you within 24-48 hours to:
   • Confirm your enrollment
   • Schedule your first lesson
   • Provide payment details

Thank you for choosing our swimming program!`)
  }, 300)
}

// ✅ Updated function to open PDF
const downloadBrochure = () => {
  const pdfUrl = '/brochures/Eduardos_Resort_Swimming_Enrollment_Form.pdf'; // PDF path
  window.open(pdfUrl, '_blank'); // opens in new tab for preview & download
}

const openLightbox = (index) => {
  currentImageIndex.value = index
  showLightbox.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  showLightbox.value = false
  document.body.style.overflow = ''
}

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % galleryImages.length
}

const prevImage = () => {
  currentImageIndex.value = (currentImageIndex.value - 1 + galleryImages.length) % galleryImages.length
}

// Intersection Observer for reveal animations
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})
</script>
<style scoped>
.bg-gradient {
  background: linear-gradient(to bottom, #E0F7FA, white);
}

.hero-section {
  position: relative;
  height: 320px;
  background: linear-gradient(135deg, rgba(43,108,176,0.9), rgba(99,179,237,0.8)),
              url('https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=1600&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 0 1rem;
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 1rem;
  margin-bottom: 1.25rem;
  opacity: 0.95;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #C19A6B, #8B5E3C);
  color: white;
  padding: 0.85rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(193, 154, 107, 0.3);
  white-space: nowrap;
  font-size: 0.95rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(193, 154, 107, 0.4);
}

.btn-outline {
  background: transparent;
  color: white;
  padding: 0.85rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  border: 2px solid white;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-size: 0.95rem;
}

.btn-outline:hover {
  background: white;
  color: #2B6CB0;
}

.section-container {
  padding: 3rem 0;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2D3748;
  margin-bottom: 0.25rem;
}

.section-subtitle {
  font-size: 0.95rem;
  color: #718096;
  margin-bottom: 2rem;
}

.feature-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.feature-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 0.5rem;
}

.feature-description {
  color: #718096;
  line-height: 1.6;
  font-size: 0.95rem;
}

.lesson-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}

.lesson-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-4px);
}

.lesson-header {
  background: linear-gradient(135deg, #F7FAFC, #EDF2F7);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.lesson-badge {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.lesson-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3748;
}

.lesson-subtitle {
  color: #718096;
  font-size: 0.875rem;
}

.lesson-body {
  padding: 1.25rem;
}

.lesson-price {
  margin-bottom: 1.5rem;
}

.price-amount {
  font-size: 1.875rem;
  font-weight: 700;
  color: #2B6CB0;
}

.price-duration {
  color: #718096;
  font-size: 1rem;
}

.lesson-features {
  list-style: none;
  padding: 0;
  margin: 1.25rem 0;
}

.lesson-features li {
  padding: 0.4rem 0;
  color: #4A5568;
  font-size: 0.95rem;
}

.lesson-enroll-btn {
  width: 100%;
  background: linear-gradient(135deg, #2B6CB0, #63B3ED);
  color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lesson-enroll-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

@media (min-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.gallery-item {
  position: relative;
  height: 180px;
  background-size: cover;
  background-position: center;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.05);
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  background: rgba(43, 108, 176, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
  font-weight: 600;
}

.schedule-table-container {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table thead {
  background: linear-gradient(135deg, #2B6CB0, #63B3ED);
  color: white;
}

.schedule-table th,
.schedule-table td {
  padding: 0.75rem;
  text-align: left;
  font-size: 0.9rem;
}

.schedule-table tbody tr {
  border-bottom: 1px solid #E5E7EB;
}

.schedule-table tbody tr:hover {
  background: #F7FAFC;
}

.cta-section {
  background: linear-gradient(135deg, #2B6CB0, #1e40af);
  padding: 2rem 0;
}

.btn-white {
  background: white;
  color: #2B6CB0;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.btn-outline-white {
  background: transparent;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  border: 2px solid white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-outline-white:hover {
  background: white;
  color: #2B6CB0;
}

.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 1s ease;
}

.animate-slide-up {
  animation: slide-up 0.8s ease 0.2s both;
}

@media (max-width: 768px) {
  .hero-section {
    height: 280px;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-subtitle {
    font-size: 0.875rem;
  }
  
  .section-container {
    padding: 1.5rem 0;
  }
  
  .section-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .section-subtitle {
    margin-bottom: 1.5rem;
  }
  
  .feature-card {
    padding: 1rem;
  }
  
  .lesson-header {
    padding: 1rem;
  }
  
  .lesson-body {
    padding: 1rem;
  }
  
  .gallery-item {
    height: 150px;
  }
  
  .cta-section {
    padding: 1.5rem 0;
  }
}
</style>