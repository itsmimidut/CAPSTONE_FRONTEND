<template>
  <div class="min-h-screen page-bg overflow-x-hidden">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero -->
    <section class="swimming-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge">Eduardo's Resort</div>
        <h1 class="hero-heading">
          <span class="heading-white">Swimming</span>
          <span class="heading-gold">Lessons</span>
        </h1>
        <p class="hero-subtext">
          Learn to swim with certified instructors in a safe, fun environment
        </p>
        <div class="hero-buttons">
          <button @click="revealEnrollmentForm" class="hero-btn hero-btn-primary" type="button">
            <i class="fas fa-swimming-pool mr-2"></i>
            Enroll Now
          </button>
          <button @click="downloadBrochure" class="hero-btn hero-btn-outline" type="button">
            <i class="fas fa-download mr-2"></i>
            View/Download Enrollment Form
          </button>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="section-container bg-white py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title">
            <span class="text-navy">Why Choose Our</span>
            <span class="text-primary"> Swimming Lessons?</span>
          </h2>
          <p class="section-subtitle">Professional instruction tailored to your skill level</p>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="feature-card reveal"
          >
            <div class="feature-icon">
              <i :class="feature.icon"></i>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Lesson Types -->
    <section class="programs-section py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title">
            <span class="text-navy">Our</span>
            <span class="text-primary"> Programs</span>
          </h2>
          <p class="section-subtitle">Choose the perfect lesson type for you</p>
        </div>
        <div class="grid md:grid-cols-2 gap-7 max-w-4xl mx-auto">
          <div
            v-for="lesson in lessonTypes"
            :key="lesson.type"
            class="lesson-card reveal"
          >
            <div class="lesson-image" v-if="lesson.image" @click="openLightboxByType(lesson.type)">
              <img :src="lesson.image" :alt="lesson.type" />
            </div>
            <div class="lesson-header">
              <div class="lesson-badge">
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
                  <i class="fas fa-check-circle check-icon mr-2"></i>
                  {{ feature }}
                </li>
              </ul>
              <button @click="openClassBookingModal(lesson.type)" class="hero-btn hero-btn-primary w-full text-sm" type="button">
                Book {{ lesson.type }} package
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Schedule -->
    <section class="schedule-section py-16">
      <div class="max-w-4xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title">
            <span class="text-navy">Class</span>
            <span class="text-primary"> Schedule</span>
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
                <td class="font-semibold text-navy">{{ slot.time }}</td>
                <td>{{ slot.weekday }}</td>
                <td>{{ slot.weekend }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- <div class="mt-8 text-center">
          <button @click="openClassBookingModal()" class="hero-btn hero-btn-primary" type="button">
            <i class="fas fa-calendar-plus mr-2"></i>
            Book a Class Session
          </button>
        </div> -->
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section py-16">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="cta-title">Ready to Make a Splash?</h2>
        <p class="cta-subtitle">Join hundreds of students who've learned to swim with us</p>
        <div class="flex flex-wrap justify-center gap-4">
          <button @click="revealEnrollmentForm" class="hero-btn hero-btn-primary" type="button">
            <i class="fas fa-user-plus mr-2"></i>
            Enroll Now
          </button>
          <a href="/contact" class="hero-btn hero-btn-white">
            <i class="fas fa-phone mr-2"></i>
            Contact Us
          </a>
        </div>
      </div>
    </section>

    <AppFooter />

    <!-- ENROLLMENT FORM MODAL -->
    <Teleport to="body">
      <div v-if="showEnrollmentForm" class="modal-overlay" @click.self="closeEnrollmentForm">
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <h2 class="modal-title">Registration Form</h2>
              <p class="modal-subtitle">Please complete all required fields <span class="text-gold font-semibold">*</span></p>
            </div>
            <button class="modal-close-btn" @click="closeEnrollmentForm" type="button">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="location-badge">
            <i class="fas fa-map-marker-alt mr-2 text-gold"></i>
            Nautical Highway, Bayanan II, Calapan City, Oriental Mindoro 5200
          </div>

          <div v-if="enrollmentMode === 'regular'" class="info-banner">
            <h3><i class="fas fa-info-circle mr-2 text-gold"></i>New Enrollment</h3>
            <p>Fill out the form below to register for swimming lessons. Payment and scheduling will be arranged after enrollment approval.</p>
          </div>

          <div v-if="enrollmentError" class="error-banner">
            <i class="fas fa-exclamation-circle mr-2"></i>{{ enrollmentError }}
          </div>

          <nav class="form-nav">
            <a class="form-nav-link" href="#section-basic">Basic Info</a>
            <a class="form-nav-link" href="#section-personal">Personal Details</a>
            <a class="form-nav-link" href="#section-contact">Contact</a>
            <a class="form-nav-link" href="#section-guardian">Guardian</a>
          </nav>

          <form class="space-y-6" @submit.prevent="submitEnrollmentForm">
            <div id="section-basic" class="form-section">
              <h3 class="form-section-title"><span class="title-bar"></span>Basic Info</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <label class="form-label">Name *</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><input type="text" class="form-input" placeholder="Family" v-model="formData.familyName" required /><p class="form-hint">Family</p></div>
                    <div><input type="text" class="form-input" placeholder="First" v-model="formData.firstName" required /><p class="form-hint">First</p></div>
                    <div><input type="text" class="form-input" placeholder="Middle" v-model="formData.middleName" /><p class="form-hint">Middle</p></div>
                  </div>
                </div>
                <div class="md:col-span-2">
                  <label class="form-label">Date of Birth *</label>
                  <input type="date" class="form-input" v-model="formData.dateOfBirth" required />
                </div>
              </div>
            </div>

            <div id="section-personal" class="form-section">
              <h3 class="form-section-title"><span class="title-bar"></span>Personal Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">Lesson Type *</label>
                  <select class="form-input" v-model="formData.lessonType" required>
                    <option value="" disabled>Select Lesson Type</option>
                    <option value="Group Lessons">Group Lessons</option>
                    <option value="Private Lessons">Private Lessons</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Sex *</label>
                  <select class="form-input" v-model="formData.sex" required>
                    <option value="" disabled>Sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div><label class="form-label">Height (cm) *</label><input class="form-input" v-model="formData.height" placeholder="e.g. 150" required /></div>
                <div><label class="form-label">Weight (kg) *</label><input class="form-input" v-model="formData.weight" placeholder="e.g. 45" required /></div>
                <div>
                  <label class="form-label">Name of Coach *</label>
                  <select class="form-input" v-model="formData.preferredCoach" required>
                    <option value="" disabled>Select a Coach</option>
                    <option v-for="coach in coaches" :key="coach.coach_id" :value="coach.name">{{ coach.name }} - {{ coach.specialization }}</option>
                  </select>
                </div>
              </div>
            </div>

            <div id="section-contact" class="form-section">
              <h3 class="form-section-title"><span class="title-bar"></span>Contact Information</h3>
              <div><label class="form-label">Student's Address *</label><input type="text" class="form-input" v-model="formData.address" required /></div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div><label class="form-label">Mobile Phone *</label><input type="text" class="form-input" v-model="formData.mobilePhone" required /></div>
                <div><label class="form-label">Email Address *</label><input type="email" class="form-input" v-model="formData.email" required /></div>
              </div>
            </div>

            <div id="section-guardian" class="form-section">
              <h3 class="form-section-title"><span class="title-bar"></span>Guardian Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label class="form-label">Father's Name *</label><input type="text" class="form-input" v-model="formData.fatherName" required /></div>
                <div><label class="form-label">Mother's Name *</label><input type="text" class="form-input" v-model="formData.motherName" required /></div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div><label class="form-label">School or Employer Name</label><input type="text" class="form-input" v-model="formData.schoolOrEmployerName" /></div>
                <div><label class="form-label">School or Employer Address</label><input type="text" class="form-input" v-model="formData.schoolOrEmployerAddress" /></div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div><label class="form-label">Contact Person *</label><input type="text" class="form-input" v-model="formData.contactPerson" required /></div>
                <div><label class="form-label">Contact Number *</label><input type="text" class="form-input" v-model="formData.contactNumber" required /></div>
              </div>

              <div v-if="enrollmentMode === 'booking'" class="booking-ref-box mt-6">
                <h4 class="booking-ref-title"><i class="fas fa-ticket-alt mr-2 text-gold"></i>Booking Reference</h4>
                <div>
                  <label class="form-label">Booking Reference *</label>
                  <div class="flex gap-2">
                    <input type="text" v-model="bookingReference" placeholder="e.g., SWM12345678" class="flex-1 form-input" @input="bookingValidated = false" required />
                    <button type="button" @click="validateBookingReference" :disabled="!bookingReference || validatingBooking" class="validate-btn">
                      <i v-if="validatingBooking" class="fas fa-spinner fa-spin mr-1"></i>
                      {{ validatingBooking ? 'Checking...' : 'Validate' }}
                    </button>
                  </div>
                  <p class="form-hint mt-2"><i class="fas fa-info-circle mr-1 text-gold"></i>Get your booking reference from the Reservation page after booking and payment</p>
                  <div v-if="bookingValidationMessage" :class="['mt-2 p-2 rounded text-xs', bookingValidated ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700']">
                    <i :class="bookingValidated ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="mr-1"></i>{{ bookingValidationMessage }}
                  </div>
                  <div v-if="bookingValidated && bookingInfo" class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
                    <div class="flex items-center gap-2 mb-1"><i class="fas fa-check-circle text-green-500"></i><span class="font-semibold text-green-700">Booking Verified!</span></div>
                    <p class="text-gray-700 ml-5">{{ bookingInfo.package_name }} - {{ bookingInfo.available_slots || 0 }} slot(s) available ({{ bookingInfo.enrolled_count || 0 }}/{{ bookingInfo.paid_slots }} enrolled)</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button class="hero-btn hero-btn-primary w-full sm:w-auto" type="submit" :disabled="enrollmentSubmitting">
                <i class="fas fa-paper-plane mr-2"></i>
                {{ enrollmentSubmitting ? 'Submitting...' : 'Submit Enrollment' }}
              </button>
              <button type="button" @click="closeEnrollmentForm" class="hero-btn hero-btn-outline w-full sm:w-auto">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- CLASS BOOKING MODAL -->
    <Teleport to="body">
      <div v-if="showClassBookingModal" class="modal-overlay" @click.self="closeClassBookingModal">
        <div class="class-modal-card">
          <div class="class-modal-header">
            <div>
              <h2 class="class-modal-title">Book a Swimming Class</h2>
              <p class="class-modal-subtitle">Reserve a specific class session</p>
            </div>
            <button class="class-close-btn" type="button" @click="closeClassBookingModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form class="class-modal-body" @submit.prevent="submitClassBooking">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label class="form-label">Full Name *</label><input v-model="classBookingForm.fullName" type="text" class="form-input" placeholder="Juan Dela Cruz" required /></div>
              <div><label class="form-label">Email *</label><input v-model="classBookingForm.email" type="email" class="form-input" placeholder="name@email.com" required /></div>
              <div><label class="form-label">Phone *</label><input v-model="classBookingForm.phone" type="tel" class="form-input" placeholder="09xx xxx xxxx" required /></div>
              <div>
                <label class="form-label">Lesson Type *</label>
                <select v-model="classBookingForm.lessonType" class="form-input" required>
                  <option value="">Select lesson type</option>
                  <option value="Group Lessons">Group Lessons</option>
                  <option value="Private Lessons">Private Lessons</option>
                  <option value="Kids Lessons">Kids Lessons</option>
                  <option value="Advanced Training">Advanced Training</option>
                </select>
              </div>
              <div>
                <label class="form-label">Skill Level</label>
                <select v-model="classBookingForm.skillLevel" class="form-input">
                  <option value="">Select skill level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div><label class="form-label">Preferred Date *</label><input v-model="classBookingForm.preferredDate" type="date" class="form-input" required /></div>
              <div>
                <label class="form-label">Preferred Time Slot *</label>
                <select v-model="classBookingForm.preferredTime" class="form-input" required>
                  <option value="">Select time slot</option>
                  <option value="6:00 AM - 7:00 AM">6:00 AM - 7:00 AM</option>
                  <option value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                  <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                </select>
              </div>
              <div><label class="form-label">Number of Participants</label><input v-model.number="classBookingForm.participants" type="number" min="1" class="form-input" /></div>
            </div>
            <div class="mt-4"><label class="form-label">Special Requests</label><textarea v-model="classBookingForm.notes" class="form-input" rows="3" placeholder="Any notes or preferences"></textarea></div>
            <label class="checkbox-field mt-4"><input v-model="classBookingForm.agree" type="checkbox" /><span>I agree to be contacted about my booking request.</span></label>
            <p v-if="classBookingError" class="error-banner mt-4">{{ classBookingError }}</p>
            <div class="flex justify-end gap-3 mt-6">
              <button type="button" class="btn-cancel" @click="closeClassBookingModal">Cancel</button>
              <button type="submit" class="btn-submit">Submit Booking</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- LIGHTBOX -->
    <Teleport to="body">
      <div v-if="showLightbox" class="lightbox-overlay" @click="closeLightbox">
        <div class="lightbox-container" @click.stop>
          <button class="lightbox-close" @click="closeLightbox" type="button"><i class="fas fa-times"></i></button>
          <div class="lightbox-main">
            <img :src="galleryImages[currentImageIndex]?.url" :alt="galleryImages[currentImageIndex]?.caption" class="lightbox-image" />
            <div class="lightbox-caption">{{ galleryImages[currentImageIndex]?.caption }}</div>
          </div>
          <button class="lightbox-nav lightbox-prev" @click="prevImage" :disabled="galleryImages.length <= 1" type="button"><i class="fas fa-chevron-left"></i></button>
          <button class="lightbox-nav lightbox-next" @click="nextImage" :disabled="galleryImages.length <= 1" type="button"><i class="fas fa-chevron-right"></i></button>
          <div class="lightbox-counter">{{ currentImageIndex + 1 }} / {{ galleryImages.length }}</div>
          <div class="lightbox-thumbnails">
            <div v-for="(image, index) in galleryImages" :key="index" class="thumbnail" :class="{ active: index === currentImageIndex }" @click="currentImageIndex = index" :style="{ backgroundImage: `url(${image.url})` }"></div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSwimmingEnrollmentStore } from '../../stores/swimmingEnrollment'
import { useAuthStore } from '../../stores/auth'
import AppHeader from '../../components/AppHeader.vue'
import AppSidebar from '../../components/AppSidebar.vue'
import AppFooter from '../../components/AppFooter.vue'

const sidebarOpen = ref(false)
const router = useRouter()
const enrollmentStore = useSwimmingEnrollmentStore()
const authStore = useAuthStore()

const showEnrollmentForm = ref(false)
const showClassBookingModal = ref(false)
const showLightbox = ref(false)
const currentImageIndex = ref(0)

const enrollmentMode = ref('booking')
const bookingReference = ref('')
const bookingValidated = ref(false)
const validatingBooking = ref(false)
const bookingValidationMessage = ref('')
const bookingInfo = ref(null)
const classBookingError = ref('')

const coaches = computed(() => enrollmentStore.coaches || [])
const enrollmentSubmitting = computed(() => enrollmentStore.submitting)
const enrollmentError = computed(() => enrollmentStore.submitError || enrollmentStore.error || '')

const formData = ref({
  familyName: '', firstName: '', middleName: '', dateOfBirth: '',
  lessonType: '', sex: '', height: '', weight: '', preferredCoach: '',
  address: '', mobilePhone: '', email: '', fatherName: '', motherName: '',
  schoolOrEmployerName: '', schoolOrEmployerAddress: '', contactPerson: '', contactNumber: ''
})

const classBookingForm = reactive({
  fullName: '', email: '', phone: '', lessonType: '', skillLevel: '',
  preferredDate: '', preferredTime: '', participants: 1, notes: '', agree: false
})

const features = [
  { icon: 'fas fa-user-tie', title: 'Certified Instructors', description: 'Learn from experienced, certified swimming coaches with years of teaching experience' },
  { icon: 'fas fa-shield-alt', title: 'Safety First', description: 'State-of-the-art facilities with lifeguards on duty and safety equipment available' },
  { icon: 'fas fa-users', title: 'All Skill Levels', description: 'From beginners to advanced swimmers, we have programs tailored to your needs' }
]

const lessonTypes = [
  {
    type: '7 Years Old & Above', subtitle: 'Teen & Adult Program', icon: 'fas fa-star',
    price: 3000, duration: 'package', image: '/images/child.jpeg',
    features: ['10 sessions program', '1 hour per session', 'Expert instruction', 'Progressive skill building', 'Flexible scheduling']
  },
  {
    type: '6 Years Old & Below', subtitle: 'Kids Swimming Program', icon: 'fas fa-swimmer',
    price: 4000, duration: 'package', image: '/images/teen.jpg',
    features: ['10 sessions program', '1 hour per session', 'Fun & safe learning', 'Age-appropriate methods', 'Parental involvement welcome']
  }
]

const schedule = [
  { time: '6:00 AM - 7:00 AM', weekday: 'Advanced Training', weekend: 'Private Sessions' },
  { time: '8:00 AM - 9:00 AM', weekday: 'Beginner Group', weekend: 'Family Sessions' },
  { time: '10:00 AM - 11:00 AM', weekday: 'Intermediate Group', weekend: 'Kids Group' },
  { time: '2:00 PM - 3:00 PM', weekday: 'Kids Group', weekend: 'Beginner Group' },
  { time: '4:00 PM - 5:00 PM', weekday: 'Private Sessions', weekend: 'Advanced Group' }
]

const galleryImages = ref([
  { url: '/images/child.jpeg', caption: '7 Years Old & Above' },
  { url: '/images/teen.jpg', caption: '6 Years Old & Below' }
])

const revealEnrollmentForm = () => {
  showEnrollmentForm.value = true
  document.body.style.overflow = 'hidden'
}

const closeEnrollmentForm = () => {
  showEnrollmentForm.value = false
  document.body.style.overflow = ''
}

const openClassBookingModal = (lessonType = '') => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: '/customer?activeSection=book&service=swimming' } })
    return
  }
  router.push({ name: 'WebsiteReservation', query: { activeSection: 'book', service: 'swimming' } })
}

const closeClassBookingModal = () => {
  showClassBookingModal.value = false
  document.body.style.overflow = ''
}

const submitClassBooking = async () => {
  classBookingError.value = ''
  if (!classBookingForm.fullName.trim()) { classBookingError.value = 'Full name is required.'; return }
  if (!classBookingForm.email.trim()) { classBookingError.value = 'Email is required.'; return }
  if (!classBookingForm.phone.trim()) { classBookingError.value = 'Phone number is required.'; return }
  if (!classBookingForm.lessonType) { classBookingError.value = 'Please select a lesson type.'; return }
  if (!classBookingForm.preferredDate) { classBookingError.value = 'Please choose a preferred date.'; return }
  if (!classBookingForm.preferredTime) { classBookingError.value = 'Please choose a preferred time slot.'; return }
  if (!classBookingForm.agree) { classBookingError.value = 'You must agree to be contacted.'; return }
  try {
    const payload = { ...classBookingForm }
    const response = await fetch('http://localhost:8000/api/swimming/class-bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const result = await response.json()
    if (!response.ok || !result.success) throw new Error(result.error || 'Failed to submit class booking')
    closeClassBookingModal()
    await router.push({ path: '/confirmation', query: { bookingId: result.data.bookingId, bookingRef: result.data.bookingReference, email: payload.email, service: 'swimming', lessonType: payload.lessonType } })
  } catch (error) {
    classBookingError.value = error.message || 'Failed to submit class booking. Please try again.'
  }
}

const downloadBrochure = () => { window.open('/brochures/eduardos resort foundation benificiary form.pdf', '_blank') }
const openLightboxByType = (type) => { const index = galleryImages.value.findIndex(img => img.caption === type); currentImageIndex.value = index >= 0 ? index : 0; showLightbox.value = true; document.body.style.overflow = 'hidden' }
const closeLightbox = () => { showLightbox.value = false; document.body.style.overflow = '' }
const nextImage = () => { currentImageIndex.value = (currentImageIndex.value + 1) % galleryImages.value.length }
const prevImage = () => { currentImageIndex.value = (currentImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length }

const validateBookingReference = async () => {
  if (!bookingReference.value) { bookingValidationMessage.value = 'Please enter a booking reference'; bookingValidated.value = false; return }
  validatingBooking.value = true; bookingValidationMessage.value = ''; bookingInfo.value = null
  try {
    const response = await fetch('http://localhost:8000/api/swimming/validate-booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingReference: bookingReference.value }) })
    const result = await response.json()
    if (result.success && result.canEnroll) {
      bookingValidated.value = true; bookingInfo.value = result.booking
      bookingValidationMessage.value = `✓ Booking verified! ${result.booking.available_slots || 0} slot(s) available`
    } else {
      bookingValidated.value = false; bookingValidationMessage.value = result.error || 'Invalid booking reference or booking is full'
    }
  } catch (error) {
    bookingValidated.value = false; bookingValidationMessage.value = 'Failed to validate booking reference. Please try again.'
  } finally { validatingBooking.value = false }
}

const submitEnrollmentForm = async () => {
  try {
    if (enrollmentMode.value === 'booking') {
      if (!bookingReference.value) { alert('Please enter a booking reference'); return }
      if (!bookingValidated.value) { alert('Please validate your booking reference first'); return }
    }
    if (!formData.value.firstName || !formData.value.dateOfBirth || !formData.value.email || !formData.value.address) {
      alert('Please fill in all required fields'); return
    }
    const payload = {
      bookingReference: enrollmentMode.value === 'booking' ? bookingReference.value : null,
      bookingId: enrollmentMode.value === 'booking' && bookingInfo.value ? bookingInfo.value.booking_id : null,
      firstName: formData.value.firstName, middleName: formData.value.middleName, lastName: formData.value.familyName,
      dateOfBirth: formData.value.dateOfBirth, lessonType: formData.value.lessonType || (bookingInfo.value ? bookingInfo.value.package_name : null),
      sex: formData.value.sex, height: formData.value.height, weight: formData.value.weight,
      preferredCoach: formData.value.preferredCoach, address: formData.value.address,
      mobilePhone: formData.value.mobilePhone, email: formData.value.email,
      fatherName: formData.value.fatherName, motherName: formData.value.motherName,
      emergencyContactName: formData.value.contactPerson, emergencyContactPhone: formData.value.contactNumber
    }
    if (enrollmentMode.value === 'booking') {
      const response = await fetch('http://localhost:8000/api/swimming/enroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to submit enrollment')
      alert(`✅ Enrollment Successful!\n\nEnrollment ID: #${result.enrollmentId}\nBooking Reference: ${bookingReference.value}\n\n${result.message}`)
    } else {
      const result = await enrollmentStore.submitEnrollment(payload)
      if (!result) throw new Error(enrollmentError.value || 'Failed to submit enrollment')
      const enrollment = result.enrollment || result
      alert(`✅ Enrollment Successful!\n\nEnrollment ID: #${enrollment.enrollment_id || enrollment.id || 'N/A'}\n\nWe will contact you within 24-48 hours.`)
    }
    formData.value = { familyName: '', firstName: '', middleName: '', dateOfBirth: '', lessonType: '', sex: '', height: '', weight: '', preferredCoach: '', address: '', mobilePhone: '', email: '', fatherName: '', motherName: '', schoolOrEmployerName: '', schoolOrEmployerAddress: '', contactPerson: '', contactNumber: '' }
    bookingReference.value = ''; bookingValidated.value = false; bookingInfo.value = null; bookingValidationMessage.value = ''
    closeEnrollmentForm()
  } catch (error) { alert(`❌ Error: ${error.message}`) }
}

const fetchCoaches = async () => { try { await enrollmentStore.fetchCoaches() } catch (error) { console.error('Error fetching coaches:', error) } }
const handleKeydown = (e) => { if (!showLightbox.value) return; if (e.key === 'ArrowLeft') prevImage(); if (e.key === 'ArrowRight') nextImage(); if (e.key === 'Escape') closeLightbox() }

onMounted(() => {
  fetchCoaches()
  const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target) } }) }, { threshold: 0.1 })
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); document.body.style.overflow = '' })
</script>

<style scoped>
/* ── Variables ── */
* {
  --color-primary: #0369a1;
  --color-primary-light: #1F8DBF;
  --color-gold: #F4C400;
  --color-gold-dark: #F2C200;
  --color-navy: #0C3B5E;
  --color-white: #FFFFFF;
  --color-gray-bg: #f9fafb;
  --color-gray-border: #e5e7eb;
  --color-text-dark: #1f2937;
  --color-text-light: #6b7280;
}

/* ── Page ── */
.page-bg { background: #f9fafb; }
.text-navy { color: #0C3B5E; }
.text-primary { color: #0369a1; }
.text-gold { color: #F4C400; }
.font-semibold { font-weight: 600; }

/* ── Hero ── */
.swimming-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  background-image: url('/images/herobg.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  flex-shrink: 0;
  flex-grow: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 30, 50, 0.52);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 24px;
  max-width: 780px;
  width: 100%;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #FFFFFF;
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 6px 18px;
  border-radius: 999px;
}

.hero-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.15;
}

.heading-white {
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 800;
  color: #FFFFFF;
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.heading-gold {
  font-size: clamp(2rem, 4.5vw, 3.8rem);
  font-weight: 800;
  color: #F4C400;
  display: block;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.hero-subtext {
  font-size: clamp(0.88rem, 1.3vw, 1rem);
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.75;
  font-weight: 400;
  text-shadow: 0 1px 6px rgba(0,0,0,0.3);
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

/* ── Buttons ── */
.hero-btn {
  padding: 0.75rem 2rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid transparent;
  text-decoration: none;
}

.hero-btn-primary {
  background: #F4C400;
  color: #0C3B5E;
  border-color: #F4C400;
  box-shadow: 0 4px 14px rgba(244, 196, 0, 0.35);
}

.hero-btn-primary:hover {
  background: #F2C200;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(244, 196, 0, 0.5);
}

.hero-btn-outline {
  background: rgba(255,255,255,0.12);
  color: #FFFFFF;
  border-color: rgba(255,255,255,0.5);
  backdrop-filter: blur(8px);
}

.hero-btn-outline:hover {
  background: rgba(255,255,255,0.22);
  transform: translateY(-2px);
}

.hero-btn-white {
  background: transparent;
  color: white;
  border-color: white;
}

.hero-btn-white:hover {
  background: rgba(255,255,255,0.15);
  transform: translateY(-2px);
}

/* ── Section Shared ── */
.section-title {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

/* ── Feature Cards ── */
.feature-card {
  background: white;
  padding: 1.5rem;
  border-radius: 14px;
  border: 1px solid rgba(3, 105, 161, 0.12);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(3, 105, 161, 0.06);
}

.feature-card:hover {
  border-color: #0369a1;
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(3, 105, 161, 0.14);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(3, 105, 161, 0.10);
  color: #0369a1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 1rem;
}

.feature-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0C3B5E;
  margin-bottom: 0.5rem;
  text-align: center;
}

.feature-desc {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  text-align: center;
}

/* ── Programs Section ── */
.programs-section {
  background: linear-gradient(to bottom, rgba(3, 105, 161, 0.04), white);
}

/* ── Lesson Cards ── */
.lesson-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(3, 105, 161, 0.12);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(3, 105, 161, 0.08);
}

.lesson-card:hover {
  border-color: #0369a1;
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(3, 105, 161, 0.16);
}

.lesson-image {
  width: 100%;
  height: 192px;
  overflow: hidden;
  cursor: pointer;
}

.lesson-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.lesson-card:hover .lesson-image img { transform: scale(1.05); }

.lesson-header {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(to right, rgba(3, 105, 161, 0.08), rgba(244, 196, 0, 0.08));
  border-bottom: 1px solid rgba(3, 105, 161, 0.08);
}

.lesson-badge {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(3, 105, 161, 0.12);
  color: #0369a1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.lesson-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0C3B5E;
}

.lesson-subtitle {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 2px;
}

.lesson-body { padding: 1.25rem; }

.lesson-price { margin-bottom: 1rem; }

.price-amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0369a1;
}

.price-duration {
  font-size: 0.8rem;
  color: #6b7280;
  margin-left: 4px;
}

.lesson-features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lesson-features li {
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: flex-start;
}

.check-icon { color: #F4C400; margin-top: 2px; }

/* ── Schedule Section ── */
.schedule-section {
  background: linear-gradient(135deg, rgba(3, 105, 161, 0.04), rgba(244, 196, 0, 0.04));
}

.schedule-table-container {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(3, 105, 161, 0.10);
  border: 1px solid rgba(3, 105, 161, 0.12);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table thead {
  background: #0C3B5E;
  color: white;
}

.schedule-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
}

.schedule-table td {
  padding: 12px 16px;
  font-size: 0.875rem;
  color: #6b7280;
  border-bottom: 1px solid rgba(3, 105, 161, 0.08);
}

.schedule-table tbody tr:hover { background: rgba(3, 105, 161, 0.04); }

/* ── CTA Section ── */
.cta-section {
  background: linear-gradient(to right, #0C3B5E, #1F8DBF);
}

.cta-title {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 800;
  color: #F4C400;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1rem;
  color: rgba(255,255,255,0.8);
  margin-bottom: 2rem;
}

/* ── Modals ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 59, 94, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 1rem;
  overflow-y: auto;
}

.modal-card {
  width: 100%;
  max-width: 860px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 25px 60px rgba(12, 59, 94, 0.3);
  border-top: 4px solid #F4C400;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(3, 105, 161, 0.15);
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0C3B5E;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 4px;
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0C3B5E;
  transition: background 0.2s;
  flex-shrink: 0;
}

.modal-close-btn:hover { background: rgba(244, 196, 0, 0.2); }

.location-badge {
  display: inline-block;
  font-size: 0.8rem;
  color: #0369a1;
  background: rgba(3, 105, 161, 0.06);
  padding: 6px 16px;
  border-radius: 999px;
  margin-bottom: 1.25rem;
  font-weight: 500;
}

.info-banner {
  background: linear-gradient(to right, rgba(3, 105, 161, 0.08), rgba(244, 196, 0, 0.08));
  border: 1px solid rgba(3, 105, 161, 0.15);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1.25rem;
}

.info-banner h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0C3B5E;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
}

.info-banner p {
  font-size: 0.82rem;
  color: #6b7280;
}

/* ── Class Booking Modal ── */
.class-modal-card {
  width: 100%;
  max-width: 820px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(12, 59, 94, 0.25);
  overflow: hidden;
}

.class-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem;
  background: linear-gradient(135deg, #0C3B5E, #0369a1);
  color: white;
}

.class-modal-title { font-size: 1.4rem; font-weight: 700; }
.class-modal-subtitle { font-size: 0.9rem; opacity: 0.85; }
.class-close-btn { background: transparent; border: none; color: white; font-size: 1.2rem; cursor: pointer; }
.class-modal-body { padding: 1.75rem; }

/* ── Form ── */
.form-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background: linear-gradient(to right, rgba(3, 105, 161, 0.05), rgba(244, 196, 0, 0.05));
  border-radius: 12px;
  margin-bottom: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.form-nav-link {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(3, 105, 161, 0.25);
  color: #0C3B5E;
  text-decoration: none;
  transition: all 0.2s ease;
}

.form-nav-link:hover {
  background: rgba(244, 196, 0, 0.2);
  border-color: #F4C400;
}

.form-section { margin-bottom: 1.5rem; }

.form-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0C3B5E;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-bar {
  display: inline-block;
  width: 4px;
  height: 20px;
  background: #F4C400;
  border-radius: 4px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  color: #0C3B5E;
  font-weight: 500;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  border: 1px solid rgba(3, 105, 161, 0.2);
  border-radius: 10px;
  background: white;
  transition: all 0.2s ease;
  color: #1f2937;
}

.form-input:focus {
  outline: none;
  border-color: #0369a1;
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.12);
}

.form-hint {
  font-size: 0.75rem;
  margin-top: 4px;
  color: rgba(12, 59, 94, 0.5);
}

.booking-ref-box {
  background: linear-gradient(to right, rgba(3, 105, 161, 0.05), rgba(244, 196, 0, 0.05));
  border: 1px solid rgba(244, 196, 0, 0.25);
  border-radius: 10px;
  padding: 1rem;
}

.booking-ref-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0C3B5E;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.validate-btn {
  padding: 0.6rem 1rem;
  background: #F4C400;
  color: #0C3B5E;
  font-weight: 700;
  border-radius: 10px;
  border: 2px solid #F4C400;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.validate-btn:hover { background: #F2C200; }
.validate-btn:disabled { background: #d1d5db; border-color: #d1d5db; cursor: not-allowed; color: #9ca3af; }

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #0C3B5E;
  cursor: pointer;
}

.error-banner {
  background: #fee2e2;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
}

.btn-cancel {
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  background: #e5e7eb;
  color: #1f2937;
  transition: background 0.2s;
}

.btn-cancel:hover { background: #d1d5db; }

.btn-submit {
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  background: #F4C400;
  color: #0C3B5E;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(244, 196, 0, 0.3);
}

.btn-submit:hover { background: #F2C200; transform: translateY(-1px); }

/* ── Lightbox ── */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 59, 94, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  animation: fadeIn 0.2s ease;
}

.lightbox-container {
  position: relative;
  width: 90%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-main { position: relative; width: 100%; margin-bottom: 1rem; }

.lightbox-image {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 12px;
}

.lightbox-caption {
  margin-top: 1rem;
  text-align: center;
  color: white;
  font-size: 1rem;
  font-weight: 500;
}

.lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.lightbox-nav:hover { background: rgba(244, 196, 0, 0.4); }
.lightbox-prev { left: -70px; }
.lightbox-next { right: -70px; }

.lightbox-counter {
  position: absolute;
  top: -50px;
  left: 0;
  color: rgba(255,255,255,0.7);
  font-size: 0.875rem;
}

.lightbox-thumbnails {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  width: 100%;
  padding: 1rem 0;
  justify-content: center;
  flex-wrap: wrap;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  border: 3px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s;
}

.thumbnail.active {
  border-color: #F4C400;
  box-shadow: 0 0 15px rgba(244, 196, 0, 0.5);
}

/* ── Reveal ── */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.visible { opacity: 1; transform: translateY(0); }

/* ── Animations ── */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ── Responsive ── */
@media (max-width: 640px) {
  .swimming-hero { height: 100svh; min-height: 100svh; max-height: 100svh; }
  .hero-content { padding: 32px 16px; }
  .hero-btn { width: 100%; font-size: 0.9rem; padding: 0.875rem 1.25rem; }
  .lesson-image { height: 160px; }
  .lightbox-image { max-height: 60vh; }
  .thumbnail { width: 50px; height: 50px; }
}

@media (max-width: 900px) {
  .lightbox-prev, .lightbox-next { position: static; margin: 0 4px; }
}
</style>