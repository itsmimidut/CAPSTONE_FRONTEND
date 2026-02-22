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
        <h1 class="hero-title animate-fade-in">
          <span class="text-blue-800">Swimming</span> 
          <span class="text-blue-600">Lessons</span>
        </h1>
        <p class="hero-subtitle animate-slide-up">
          Learn to swim with certified instructors in a safe, fun environment
        </p>
        <div class="hero-actions animate-slide-up">
          <button @click="revealEnrollmentForm" class="btn-primary">
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
          <h2 class="section-title">
            <span class="text-blue-800">Why Choose Our</span> 
            <span class="text-blue-600">Swimming Lessons?</span>
          </h2>
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
    <section class="bg-gradient-to-b from-blue-50 to-white py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title">
            <span class="text-blue-800">Our</span> 
            <span class="text-blue-600">Programs</span>
          </h2>
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
                @click="revealEnrollmentForm"
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
          <h2 class="section-title">
            <span class="text-blue-800">Our</span> 
            <span class="text-blue-600">Facilities</span>
          </h2>
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
    <section class="bg-gradient-to-br from-blue-50 to-blue-100 py-16">
      <div class="max-w-4xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title">
            <span class="text-blue-800">Class</span> 
            <span class="text-blue-600">Schedule</span>
          </h2>
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
          <button @click="openClassBookingModal()" class="class-session-btn">
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
          <span class="text-yellow-300">Ready to Make a Splash?</span>
        </h2>
        <p class="text-xl text-blue-100 mb-8">
          Join hundreds of students who've learned to swim with us
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <button @click="revealEnrollmentForm" class="btn-yellow">
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

    <!-- Enrollment Form Modal -->
    <Teleport to="body">
      <div v-if="showEnrollmentForm" class="modal-overlay" @click.self="closeEnrollmentForm">
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <h2 class="section-title">
                <span class="text-blue-800">Registration</span> 
                <span class="text-blue-600">Form</span>
              </h2>
              <p class="section-subtitle">Please complete all required fields</p>
            </div>
            <button class="modal-close" @click="closeEnrollmentForm" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="text-center text-sm text-blue-600 mb-6">
            Nautical Highway, Bayanan II, Calapan City, Oriental Mindoro 5200
          </div>

          <nav class="form-nav">
            <a class="form-nav-link" href="#section-basic">Basic Info</a>
            <a class="form-nav-link" href="#section-personal">Personal Details</a>
            <a class="form-nav-link" href="#section-contact">Contact</a>
            <a class="form-nav-link" href="#section-guardian">Guardian</a>
          </nav>

          <form class="space-y-8" @submit.prevent="submitEnrollmentForm">
            <div id="section-basic" class="form-section">
              <h3 class="form-section-title text-sm md:text-base">Basic Info</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <label class="form-label text-xs md:text-sm">Name</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input type="text" class="form-input text-sm md:text-base" placeholder="Family" v-model="formData.familyName" />
                      <p class="form-hint text-xs md:text-sm">Family</p>
                    </div>
                    <div>
                      <input type="text" class="form-input text-sm md:text-base" placeholder="First" v-model="formData.firstName" />
                      <p class="form-hint text-xs md:text-sm">First</p>
                    </div>
                    <div>
                      <input type="text" class="form-input text-sm md:text-base" placeholder="Middle" v-model="formData.middleName" />
                      <p class="form-hint text-xs md:text-sm">Middle</p>
                    </div>
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label class="form-label text-xs md:text-sm">Date of Birth</label>
                  <input type="date" class="form-input text-sm md:text-base" v-model="formData.dateOfBirth" />
                </div>
              </div>
            </div>

            <div id="section-personal" class="form-section">
              <h3 class="form-section-title text-sm md:text-base">Personal Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label text-xs md:text-sm">Lesson Type</label>
                  <select class="form-input text-sm md:text-base" v-model="formData.lessonType">
                    <option value="" disabled selected>Select Lesson Type</option>
                    <option value="Group Lessons">Group Lessons</option>
                    <option value="Private Lessons">Private Lessons</option>
                  </select>
                </div>
                <div>
                  <label class="form-label text-xs md:text-sm">Sex</label>
                  <select class="form-input text-sm md:text-base" v-model="formData.sex">
                    <option value="" disabled selected>Sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <label class="form-label text-xs md:text-sm">Height (cm)</label>
                  <select class="form-input text-sm md:text-base" v-model="formData.height">
                    <option value="" disabled selected>Select Height</option>
                    <option value="140">140 cm</option>
                    <option value="145">145 cm</option>
                    <option value="150">150 cm</option>
                    <option value="155">155 cm</option>
                    <option value="160">160 cm</option>
                    <option value="165">165 cm</option>
                    <option value="170">170 cm</option>
                    <option value="175">175 cm</option>
                    <option value="180">180 cm</option>
                    <option value="185">185 cm</option>
                    <option value="190">190 cm</option>
                    <option value="195">195 cm</option>
                    <option value="200">200 cm</option>
                  </select>
                </div>
                <div>
                  <label class="form-label text-xs md:text-sm">Weight (kg)</label>
                  <select class="form-input text-sm md:text-base" v-model="formData.weight">
                    <option value="" disabled selected>Select Weight</option>
                    <option value="30">30 kg</option>
                    <option value="35">35 kg</option>
                    <option value="40">40 kg</option>
                    <option value="45">45 kg</option>
                    <option value="50">50 kg</option>
                    <option value="55">55 kg</option>
                    <option value="60">60 kg</option>
                    <option value="65">65 kg</option>
                    <option value="70">70 kg</option>
                    <option value="75">75 kg</option>
                    <option value="80">80 kg</option>
                    <option value="85">85 kg</option>
                    <option value="90">90 kg</option>
                    <option value="95">95 kg</option>
                    <option value="100">100 kg</option>
                    <option value="105">105 kg</option>
                    <option value="110">110 kg</option>
                  </select>
                </div>
                <div>
                  <label class="form-label text-xs md:text-sm">Name of Coach</label>
                  <select class="form-input text-sm md:text-base" v-model="formData.preferredCoach">
                    <option value="" disabled selected>Select a Coach</option>
                    <option v-for="coach in coaches" :key="coach.coach_id" :value="coach.coach_id">
                      {{ coach.name }} - {{ coach.specialization }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div id="section-contact" class="form-section">
              <h3 class="form-section-title text-sm md:text-base">Contact Information</h3>
              <div>
                <label class="form-label text-xs md:text-sm">Student's Address</label>
                <input type="text" class="form-input text-sm md:text-base" v-model="formData.address" />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="form-label text-xs md:text-sm">Mobile Phone</label>
                  <input type="text" class="form-input text-sm md:text-base" v-model="formData.mobilePhone" />
                </div>
                <div>
                  <label class="form-label text-xs md:text-sm">Email Address</label>
                  <input type="email" class="form-input text-sm md:text-base" v-model="formData.email" />
                </div>
              </div>
            </div>

            <div id="section-guardian" class="form-section">
              <h3 class="form-section-title text-sm md:text-base">Guardian Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label text-xs md:text-sm">Father's Name</label>
                  <input type="text" class="form-input text-sm md:text-base" v-model="formData.fatherName" />
                </div>
                <div>
                  <label class="form-label text-xs md:text-sm">Mother's Name</label>
                  <input type="text" class="form-input text-sm md:text-base" v-model="formData.motherName" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="form-label text-xs md:text-sm">School or Employer Name</label>
                  <input type="text" class="form-input text-sm md:text-base" v-model="formData.schoolOrEmployerName" />
                </div>
                <div>
                  <label class="form-label text-xs md:text-sm">School or Employer Address</label>
                  <input type="text" class="form-input text-sm md:text-base" v-model="formData.schoolOrEmployerAddress" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="form-label text-xs md:text-sm">Contact Person</label>
                  <input type="text" class="form-input text-sm md:text-base" v-model="formData.contactPerson" />
                </div>
                <div>
                  <label class="form-label text-xs md:text-sm">Contact Number</label>
                  <input type="text" class="form-input text-sm md:text-base" v-model="formData.contactNumber" />
                </div>
              </div>
            </div>

            <div class="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button class="btn-yellow w-full sm:w-auto" type="submit" :disabled="isSubmittingForm">
                {{ isSubmittingForm ? 'Submitting...' : 'Submit Enrollment' }}
              </button>
              <button class="btn-outline-white w-full sm:w-auto" type="button" @click="closeEnrollmentForm">
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'
import EnrollmentModal from '../../components/EnrollmentModal.vue'
import SwimmingClassBookingModal from '../../components/SwimmingClassBookingModal.vue'
import ImageLightbox from '../../components/ImageLightBox.vue'
const sidebarOpen = ref(false)
const router = useRouter()
const showEnrollmentForm = ref(false)
const showEnrollmentModal = ref(false)
const selectedLessonType = ref(null)
const showClassBookingModal = ref(false)
const selectedBookingLessonType = ref(null)
const showLightbox = ref(false)
const currentImageIndex = ref(0)
const coaches = ref([])
const selectedCoach = ref('')
const isSubmittingForm = ref(false)

// Form data object
const formData = ref({
  // Basic Info
  familyName: '',
  firstName: '',
  middleName: '',
  dateOfBirth: '',
  lessonType: '',
  
  // Personal Details
  sex: '',
  height: '',
  weight: '',
  preferredCoach: '',
  
  // Contact Information
  address: '',
  mobilePhone: '',
  email: '',
  
  // Guardian Details
  fatherName: '',
  motherName: '',
  schoolOrEmployerName: '',
  schoolOrEmployerAddress: '',
  contactPerson: '',
  contactNumber: ''
})

const features = [
  { icon: 'fas fa-user-tie', title: 'Certified Instructors', description: 'Learn from experienced, certified swimming coaches with years of teaching experience', colorClass: 'bg-blue-100 text-blue-600' },
  { icon: 'fas fa-shield-alt', title: 'Safety First', description: 'State-of-the-art facilities with lifeguards on duty and safety equipment available', colorClass: 'bg-blue-100 text-blue-600' },
  { icon: 'fas fa-users', title: 'All Skill Levels', description: 'From beginners to advanced swimmers, we have programs tailored to your needs', colorClass: 'bg-blue-100 text-blue-600' }
]

const lessonTypes = [
  { 
    type: '7 Years Old & Above', 
    subtitle: 'Teen & Adult Program', 
    icon: 'fas fa-star', 
    badgeClass: 'bg-blue-100 text-blue-600', 
    price: 3000, 
    duration: 'package', 
    features: [
      '10 sessions program',
      '1 hour per session',
      'Expert instruction',
      'Progressive skill building',
      'Flexible scheduling'
    ] 
  },
  { 
    type: '6 Years Old & Below', 
    subtitle: 'Kids Swimming Program', 
    icon: 'fas fa-swimmer', 
    badgeClass: 'bg-blue-100 text-blue-600', 
    price: 4000, 
    duration: 'package', 
    features: [
      '10 sessions program',
      '1 hour per session',
      'Fun & safe learning',
      'Age-appropriate methods',
      'Parental involvement welcome'
    ] 
  }
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

const revealEnrollmentForm = () => {
  showEnrollmentForm.value = true
  document.body.style.overflow = 'hidden'
}

const closeEnrollmentForm = () => {
  showEnrollmentForm.value = false
  document.body.style.overflow = ''
}

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

const handleClassBooking = async (payload) => {
  try {
    const response = await fetch('http://localhost:8000/api/swimming/class-bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to submit class booking')
    }

    closeClassBookingModal()

    await router.push({
      path: '/confirmation',
      query: {
        bookingId: result.data.bookingId,
        bookingRef: result.data.bookingReference,
        email: payload.email,
        service: 'swimming',
        lessonType: payload.lessonType
      }
    })
  } catch (error) {
    console.error('Error submitting swimming class booking:', error)
    alert(error.message || 'Failed to submit class booking. Please try again.')
  }
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
  const pdfUrl = '/brochures/eduardos resort foundation benificiary form.pdf'; // PDF path
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

// Submit enrollment form
const submitEnrollmentForm = async () => {
  try {
    isSubmittingForm.value = true

    // Validate required fields
    if (!formData.value.firstName || !formData.value.dateOfBirth || !formData.value.email || !formData.value.preferredCoach || !formData.value.address || !formData.value.lessonType) {
      alert('Please fill in all required fields')
      return
    }

    // Prepare data for backend
    const enrollmentData = {
      firstName: formData.value.firstName,
      middleName: formData.value.middleName,
      lastName: formData.value.familyName,
      dateOfBirth: formData.value.dateOfBirth,
      lessonType: formData.value.lessonType,
      sex: formData.value.sex,
      height: formData.value.height,
      weight: formData.value.weight,
      preferredCoach: formData.value.preferredCoach,
      address: formData.value.address,
      mobilePhone: formData.value.mobilePhone,
      email: formData.value.email,
      fatherName: formData.value.fatherName,
      motherName: formData.value.motherName,
      emergencyContactName: formData.value.contactPerson,
      emergencyContactPhone: formData.value.contactNumber
    }

    const response = await fetch('http://localhost:8000/api/swimming/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(enrollmentData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit enrollment')
    }

    // Success!
    alert(`✅ Enrollment Successful!\n\nEnrollment ID: #${result.enrollment.enrollment_id}\n\nWe will contact you within 24-48 hours to confirm your enrollment.`)
    
    // Reset form
    formData.value = {
      familyName: '',
      firstName: '',
      middleName: '',
      dateOfBirth: '',
      lessonType: '',
      sex: '',
      height: '',
      weight: '',
      preferredCoach: '',
      address: '',
      mobilePhone: '',
      email: '',
      fatherName: '',
      motherName: '',
      schoolOrEmployerName: '',
      schoolOrEmployerAddress: '',
      contactPerson: '',
      contactNumber: ''
    }

    closeEnrollmentForm()
  } catch (error) {
    console.error('Error submitting enrollment:', error)
    alert(`❌ Error: ${error.message}`)
  } finally {
    isSubmittingForm.value = false
  }
}

// Fetch coaches from database
const fetchCoaches = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/swimming/coaches')
    const data = await response.json()
    // Handle both formats: array or {success, data}
    if (Array.isArray(data)) {
      coaches.value = data
    } else if (data.success && data.data) {
      coaches.value = data.data
    } else {
      console.warn('Unexpected API response format:', data)
    }
  } catch (error) {
    console.error('Error fetching coaches:', error)
  }
}

// Intersection Observer for reveal animations
onMounted(() => {
  // Fetch coaches on component mount
  fetchCoaches()

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
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(30, 64, 175, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(253, 224, 71, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, rgba(30, 64, 175, 0.3) 0%, rgba(253, 224, 71, 0.2) 100%),
    url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, rgba(30, 64, 175, 0.3), rgba(253, 224, 71, 0.2));
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 2rem;
  background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.hero-subtitle {
  font-size: 1rem;
  margin-bottom: 1.25rem;
  color: rgb(30, 41, 59);
  opacity: 0.95;
  font-weight: 500;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: nowrap;
}

/* Yellow-300 Primary Button - High Contrast */
.btn-primary {
  background: #fbbf24;
  color: #1e40af;
  padding: 0.85rem 1.5rem;
  border-radius: 50px;
  font-weight: 700;
  border: 3px solid #f59e0b;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
  white-space: nowrap;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
  background: #f59e0b;
  border-color: #d97706;
  color: #1e3a8a;
}

.btn-outline {
  background: transparent;
  color: #1e40af;
  padding: 0.85rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  border: 2px solid #1e40af;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-size: 0.95rem;
}

.btn-outline:hover {
  background: #1e40af;
  color: white;
}

.section-container {
  padding: 3rem 0;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
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
  border: 1px solid #E2E8F0;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-color: #2B6CB0;
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
  border: 1px solid #E2E8F0;
}

.lesson-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-4px);
  border-color: #2B6CB0;
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

/* White button with HIGH CONTRAST yellow outline - turns blue on hover */
.lesson-enroll-btn {
  width: 100%;
  background: white;
  color: #1e40af;
  padding: 1rem;
  border-radius: 0.75rem;
  font-weight: 700;
  border: 3px solid #f59e0b;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 1rem;
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.2);
}

.lesson-enroll-btn:hover {
  background: #1e40af;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(30, 64, 175, 0.3);
  border-color: #1e40af;
  border-width: 3px;
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
  background: rgba(30, 64, 175, 0.8);
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
  background: linear-gradient(to top, rgba(30, 64, 175, 0.8), transparent);
  color: white;
  font-weight: 600;
}

.schedule-table-container {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid #E2E8F0;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table thead {
  background: #1e40af;
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

/* White button with HIGH CONTRAST yellow outline - turns blue on hover */
.class-session-btn {
  background: white;
  color: #1e40af;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 700;
  border: 3px solid #f59e0b;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 1rem;
}

.class-session-btn:hover {
  background: #1e40af;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 64, 175, 0.3);
  border-color: #1e40af;
  border-width: 3px;
}

.class-session-btn i {
  transition: transform 0.3s ease;
}

.class-session-btn:hover i {
  transform: rotate(15deg);
}

.cta-section {
  background: linear-gradient(135deg, #2B6CB0, #1e40af);
  padding: 2rem 0;
}

/* Yellow-300 Button for CTA - High Contrast */
.btn-yellow {
  background: #fbbf24;
  color: #1e40af;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 700;
  border: 3px solid #f59e0b;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-yellow:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
  background: #f59e0b;
  border-color: #d97706;
  color: #1e3a8a;
}

.btn-yellow:disabled {
  background: #d1d5db;
  color: #6b7280;
  border-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-yellow:disabled:hover {
  transform: none;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
  background: #d1d5db;
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

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 0.35rem;
}

.form-input {
  width: 100%;
  border: 1px solid #E2E8F0;
  border-radius: 0.75rem;
  padding: 0.65rem 0.9rem;
  font-size: 0.95rem;
  background: white;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2B6CB0;
  box-shadow: 0 0 0 3px rgba(43, 108, 176, 0.15);
}

.form-hint {
  font-size: 0.75rem;
  color: #A0AEC0;
  margin-top: 0.25rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 9999;
}

.modal-card {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: auto;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E2E8F0;
}

.form-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 0.75rem;
  padding: 0.5rem;
  margin-bottom: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 1;
}

.form-nav-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2B6CB0;
  background: white;
  border: 1px solid #CBD5E0;
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.form-nav-link:hover {
  background: #EBF8FF;
  border-color: #90CDF4;
}

.form-section {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 0.75rem;
  padding: 1rem;
}

.form-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2D3748;
  margin-bottom: 1rem;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: none;
  background: #EDF2F7;
  color: #2D3748;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: #E2E8F0;
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
  
  .hero-content {
    padding: 1.5rem;
    width: 95%;
  }
  
  .hero-title {
    font-size: 1.75rem;
    flex-direction: column;
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
    flex-direction: column;
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
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary, .btn-outline {
    width: 100%;
    max-width: 300px;
  }
}
</style>