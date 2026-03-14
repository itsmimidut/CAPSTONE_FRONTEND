<template>
  <div class="min-h-screen bg-gradient overflow-x-hidden">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero Section -->
    <section class="relative flex items-center justify-center min-h-[450px] sm:min-h-[550px] swimming-hero text-center px-4 overflow-hidden pt-[78px]">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-10 left-10 w-32 h-32 bg-[#1F8DBF]/20 rounded-full blur-3xl animate-pulse-hero"></div>
        <div class="absolute bottom-10 right-10 w-40 h-40 bg-[#F4C400]/20 rounded-full blur-3xl animate-pulse-hero delay-1000"></div>
      </div>

      <div class="absolute inset-0 bg-gradient-to-br from-[#1F8DBF]/20 via-[#F4C400]/10 to-[#F4C400]/20"></div>

      <div class="relative z-10 max-w-4xl w-full backdrop-blur-md bg-white/50 rounded-2xl p-8 sm:p-10 md:p-12 shadow-2xl mx-4 flex flex-col justify-center border border-white/40 my-12">
        <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-[#F4C400]/5 to-[#1F8DBF]/10 rounded-2xl pointer-events-none"></div>

        <div class="relative z-20 flex flex-col items-center justify-center">
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-[#F4C400]/30 rounded-full blur-2xl animate-pulse-slow-hero"></div>

          <h1 class="text-[32px] sm:text-[40px] md:text-[48px] font-bold leading-tight relative mb-2">
            <span class="text-[#0C3B5E] drop-shadow-lg">Swimming Lessons</span>
          </h1>

          <div class="mt-4 mb-2">
            <p class="text-xs sm:text-sm text-[#0C3B5E]/80 leading-relaxed drop-shadow-md font-medium max-w-2xl mx-auto">
              Learn to swim with certified instructors in a safe, fun environment
            </p>
          </div>

          <div class="flex flex-wrap justify-center gap-3 sm:gap-4 pt-4 w-full max-w-4xl">
            <button
              @click="revealEnrollmentForm"
              class="hero-btn hero-btn-primary"
              type="button"
            >
              <span class="relative z-10 group-hover:text-white transition-colors duration-300">
                <i class="fas fa-swimming-pool mr-2"></i>
                Enroll Now
              </span>
              <div class="hero-btn-overlay"></div>
            </button>

            <button
              @click="downloadBrochure"
              class="hero-btn hero-btn-secondary"
              type="button"
            >
              <span class="relative z-10 group-hover:text-white transition-colors duration-300">
                <i class="fas fa-download mr-2"></i>
                View/Download Enrollment Form
              </span>
              <div class="hero-btn-overlay"></div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="section-container bg-white py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title text-2xl md:text-3xl lg:text-4xl font-bold mb-2 flex flex-col md:flex-row items-center justify-center gap-2">
            <span class="text-[#0C3B5E]">Why Choose Our</span>
            <span class="text-[#1F8DBF]">Swimming Lessons?</span>
          </h2>
          <p class="section-subtitle text-sm md:text-base text-[#0C3B5E]/70 max-w-2xl mx-auto">
            Professional instruction tailored to your skill level
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="feature-card bg-white p-6 rounded-xl border border-[#1F8DBF]/20 hover:border-[#1F8DBF] transition-all duration-300 hover:translate-y-[-8px] hover:shadow-xl reveal"
          >
            <div class="feature-icon w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl bg-[#1F8DBF]/10 text-[#1F8DBF]">
              <i :class="feature.icon"></i>
            </div>
            <h3 class="feature-title text-lg font-semibold mb-2 text-[#0C3B5E]">{{ feature.title }}</h3>
            <p class="feature-description text-sm text-[#0C3B5E]/70 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Lesson Types -->
    <section class="bg-gradient-to-b from-[#1F8DBF]/5 to-white py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title text-2xl md:text-3xl lg:text-4xl font-bold mb-2 flex flex-col md:flex-row items-center justify-center gap-2">
            <span class="text-[#0C3B5E]">Our</span>
            <span class="text-[#1F8DBF]">Programs</span>
          </h2>
          <p class="section-subtitle text-sm md:text-base text-[#0C3B5E]/70">Choose the perfect lesson type for you</p>
        </div>

        <div class="grid md:grid-cols-2 gap-7 max-w-4xl mx-auto">
          <div
            v-for="lesson in lessonTypes"
            :key="lesson.type"
            class="lesson-card bg-white rounded-xl overflow-hidden border border-[#1F8DBF]/20 hover:border-[#1F8DBF] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl reveal"
          >
            <div class="lesson-image w-full h-48 overflow-hidden" v-if="lesson.image" @click="openLightboxByType(lesson.type)">
              <img :src="lesson.image" :alt="lesson.type" class="w-full h-full object-cover transition-transform duration-300 cursor-pointer" />
            </div>

            <div class="lesson-header p-5 flex items-center gap-3 bg-gradient-to-r from-[#1F8DBF]/10 to-[#F4C400]/10">
              <div class="lesson-badge w-14 h-14 rounded-full flex items-center justify-center text-xl bg-[#1F8DBF]/20 text-[#1F8DBF]">
                <i :class="lesson.icon"></i>
              </div>
              <div>
                <h3 class="lesson-title text-xl font-bold text-[#0C3B5E]">{{ lesson.type }}</h3>
                <p class="lesson-subtitle text-sm text-[#0C3B5E]/70">{{ lesson.subtitle }}</p>
              </div>
            </div>

            <div class="lesson-body p-5">
              <div class="lesson-price mb-4">
                <span class="price-amount text-2xl font-bold text-[#1F8DBF]">₱{{ lesson.price.toLocaleString() }}</span>
                <span class="price-duration text-sm text-[#0C3B5E]/60">/ {{ lesson.duration }}</span>
              </div>

              <ul class="lesson-features space-y-2 mb-5">
                <li v-for="feature in lesson.features" :key="feature" class="text-sm text-[#0C3B5E]/70 flex items-start">
                  <i class="fas fa-check-circle text-[#F4C400] mr-2 mt-0.5"></i>
                  {{ feature }}
                </li>
              </ul>

              <button
                @click="openClassBookingModal(lesson.type)"
                class="hero-btn hero-btn-primary w-full text-sm"
                type="button"
              >
                <span class="relative z-10 group-hover:text-white transition-colors duration-300">
                  Book {{ lesson.type }} package
                </span>
                <div class="hero-btn-overlay"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Schedule -->
    <section class="bg-gradient-to-br from-[#1F8DBF]/5 to-[#F4C400]/5 py-16">
      <div class="max-w-4xl mx-auto px-4">
        <div class="text-center mb-10">
          <h2 class="section-title text-2xl md:text-3xl lg:text-4xl font-bold mb-2 flex flex-col md:flex-row items-center justify-center gap-2">
            <span class="text-[#0C3B5E]">Class</span>
            <span class="text-[#1F8DBF]">Schedule</span>
          </h2>
          <p class="section-subtitle text-sm md:text-base text-[#0C3B5E]/70">Find a time that works for you</p>
        </div>

        <div class="schedule-table-container bg-white rounded-xl overflow-hidden shadow-lg border border-[#1F8DBF]/20 reveal">
          <table class="schedule-table w-full border-collapse">
            <thead class="bg-[#0C3B5E] text-white">
              <tr>
                <th class="py-3 px-4 text-left text-sm font-semibold">Time</th>
                <th class="py-3 px-4 text-left text-sm font-semibold">Monday - Friday</th>
                <th class="py-3 px-4 text-left text-sm font-semibold">Saturday - Sunday</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="slot in schedule"
                :key="slot.time"
                class="border-b border-[#1F8DBF]/10 hover:bg-[#1F8DBF]/5 transition-colors"
              >
                <td class="py-3 px-4 text-sm font-semibold text-[#0C3B5E]">{{ slot.time }}</td>
                <td class="py-3 px-4 text-sm text-[#0C3B5E]/80">{{ slot.weekday }}</td>
                <td class="py-3 px-4 text-sm text-[#0C3B5E]/80">{{ slot.weekend }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- <div class="mt-8 text-center">
          <button @click="openClassBookingModal()" class="hero-btn hero-btn-primary" type="button">
            <span class="relative z-10 group-hover:text-white transition-colors duration-300">
              <i class="fas fa-calendar-plus mr-2"></i>
              Book a Class Session
            </span>
            <div class="hero-btn-overlay"></div>
          </button>
        </div> -->
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section bg-gradient-to-r from-[#0C3B5E] to-[#1F8DBF] py-16">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
          <span class="text-[#F4C400]">Ready to Make a Splash?</span>
        </h2>
        <p class="text-base md:text-lg text-white/80 mb-8">
          Join hundreds of students who've learned to swim with us
        </p>

        <div class="flex flex-wrap justify-center gap-4">
          <button @click="revealEnrollmentForm" class="hero-btn hero-btn-primary" type="button">
            <span class="relative z-10 group-hover:text-white transition-colors duration-300">
              <i class="fas fa-user-plus mr-2"></i>
              Enroll Now
            </span>
            <div class="hero-btn-overlay"></div>
          </button>

          <a href="/contact" class="hero-btn hero-btn-white">
            <span class="relative z-10 group-hover:text-white transition-colors duration-300">
              <i class="fas fa-phone mr-2"></i>
              Contact Us
            </span>
            <div class="hero-btn-overlay"></div>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <AppFooter />

    <!-- ENROLLMENT FORM MODAL -->
    <Teleport to="body">
      <div
        v-if="showEnrollmentForm"
        class="modal-overlay fixed inset-0 bg-[#0C3B5E]/60 flex items-center justify-center p-6 z-[9999]"
        @click.self="closeEnrollmentForm"
      >
        <div class="modal-card w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 md:p-8 shadow-2xl border-t-4 border-[#F4C400]">
          <div class="modal-header flex items-start justify-between gap-4 pb-4 border-b border-[#1F8DBF]/20 mb-6">
            <div>
              <h2 class="section-title text-xl md:text-2xl font-bold flex flex-wrap items-center gap-2">
                <span class="text-[#0C3B5E]">Registration Form</span>
              </h2>
              <p class="section-subtitle text-xs md:text-sm text-[#0C3B5E]/70 mt-1">
                Please complete all required fields <span class="text-[#F4C400] font-semibold">*</span>
              </p>
            </div>
            <button class="modal-close w-8 h-8 rounded-full bg-gray-100 hover:bg-[#F4C400]/20 flex items-center justify-center transition-colors" @click="closeEnrollmentForm" aria-label="Close" type="button">
              <i class="fas fa-times text-[#0C3B5E]"></i>
            </button>
          </div>

          <div class="text-center text-xs md:text-sm text-[#1F8DBF] mb-6 font-medium bg-[#1F8DBF]/5 py-2 px-4 rounded-full inline-block mx-auto">
            <i class="fas fa-map-marker-alt mr-2 text-[#F4C400]"></i>
            Nautical Highway, Bayanan II, Calapan City, Oriental Mindoro 5200
          </div>

          <div v-if="enrollmentMode === 'regular'" class="mb-6 p-4 bg-gradient-to-r from-[#1F8DBF]/10 to-[#F4C400]/10 border border-[#1F8DBF]/20 rounded-lg">
            <h3 class="text-sm md:text-base font-semibold text-[#0C3B5E] mb-2 flex items-center">
              <i class="fas fa-info-circle mr-2 text-[#F4C400]"></i>
              New Enrollment
            </h3>
            <p class="text-xs md:text-sm text-[#0C3B5E]/70">
              Fill out the form below to register for swimming lessons. Payment and scheduling will be arranged after enrollment approval.
            </p>
          </div>

          <div
            v-if="enrollmentError"
            class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <i class="fas fa-exclamation-circle mr-2"></i>
            {{ enrollmentError }}
          </div>

          <nav class="form-nav flex flex-wrap gap-2 p-2 bg-gradient-to-r from-[#1F8DBF]/5 to-[#F4C400]/5 rounded-xl mb-6 sticky top-0 z-10">
            <a class="form-nav-link" href="#section-basic">Basic Info</a>
            <a class="form-nav-link" href="#section-personal">Personal Details</a>
            <a class="form-nav-link" href="#section-contact">Contact</a>
            <a class="form-nav-link" href="#section-guardian">Guardian</a>
          </nav>

          <form class="space-y-6" @submit.prevent="submitEnrollmentForm">
            <div id="section-basic" class="form-section">
              <h3 class="form-section-title">
                <span class="w-1 h-5 bg-[#F4C400] rounded-full mr-2"></span>
                Basic Info
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <label class="form-label required">Name</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input type="text" class="form-input" placeholder="Family" v-model="formData.familyName" required />
                      <p class="form-hint">Family</p>
                    </div>
                    <div>
                      <input type="text" class="form-input" placeholder="First" v-model="formData.firstName" required />
                      <p class="form-hint">First</p>
                    </div>
                    <div>
                      <input type="text" class="form-input" placeholder="Middle" v-model="formData.middleName" />
                      <p class="form-hint">Middle</p>
                    </div>
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label class="form-label required">Date of Birth</label>
                  <input type="date" class="form-input" v-model="formData.dateOfBirth" required />
                </div>
              </div>
            </div>

            <div id="section-personal" class="form-section">
              <h3 class="form-section-title">
                <span class="w-1 h-5 bg-[#F4C400] rounded-full mr-2"></span>
                Personal Details
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label required">Lesson Type</label>
                  <select class="form-input" v-model="formData.lessonType" required>
                    <option value="" disabled>Select Lesson Type</option>
                    <option value="Group Lessons">Group Lessons</option>
                    <option value="Private Lessons">Private Lessons</option>
                  </select>
                </div>
                <div>
                  <label class="form-label required">Sex</label>
                  <select class="form-input" v-model="formData.sex" required>
                    <option value="" disabled>Sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <label class="form-label required">Height (cm)</label>
                  <input class="form-input" v-model="formData.height" placeholder="e.g. 150" required />
                </div>
                <div>
                  <label class="form-label required">Weight (kg)</label>
                  <input class="form-input" v-model="formData.weight" placeholder="e.g. 45" required />
                </div>
                <div>
                  <label class="form-label required">Name of Coach</label>
                  <select class="form-input" v-model="formData.preferredCoach" required>
                    <option value="" disabled>Select a Coach</option>
                    <option v-for="coach in coaches" :key="coach.coach_id" :value="coach.name">
                      {{ coach.name }} - {{ coach.specialization }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div id="section-contact" class="form-section">
              <h3 class="form-section-title">
                <span class="w-1 h-5 bg-[#F4C400] rounded-full mr-2"></span>
                Contact Information
              </h3>

              <div>
                <label class="form-label required">Student's Address</label>
                <input type="text" class="form-input" v-model="formData.address" required />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="form-label required">Mobile Phone</label>
                  <input type="text" class="form-input" v-model="formData.mobilePhone" required />
                </div>
                <div>
                  <label class="form-label required">Email Address</label>
                  <input type="email" class="form-input" v-model="formData.email" required />
                </div>
              </div>
            </div>

            <div id="section-guardian" class="form-section">
              <h3 class="form-section-title">
                <span class="w-1 h-5 bg-[#F4C400] rounded-full mr-2"></span>
                Guardian Details
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label required">Father's Name</label>
                  <input type="text" class="form-input" v-model="formData.fatherName" required />
                </div>
                <div>
                  <label class="form-label required">Mother's Name</label>
                  <input type="text" class="form-input" v-model="formData.motherName" required />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="form-label">School or Employer Name</label>
                  <input type="text" class="form-input" v-model="formData.schoolOrEmployerName" />
                </div>
                <div>
                  <label class="form-label">School or Employer Address</label>
                  <input type="text" class="form-input" v-model="formData.schoolOrEmployerAddress" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="form-label required">Contact Person</label>
                  <input type="text" class="form-input" v-model="formData.contactPerson" required />
                </div>
                <div>
                  <label class="form-label required">Contact Number</label>
                  <input type="text" class="form-input" v-model="formData.contactNumber" required />
                </div>
              </div>

              <div v-if="enrollmentMode === 'booking'" class="mt-6 p-4 bg-gradient-to-r from-[#1F8DBF]/5 to-[#F4C400]/5 rounded-lg border border-[#F4C400]/20">
                <h4 class="text-sm font-semibold text-[#0C3B5E] mb-3 flex items-center">
                  <i class="fas fa-ticket-alt mr-2 text-[#F4C400]"></i>
                  Booking Reference
                </h4>

                <div>
                  <label class="form-label required">Booking Reference</label>
                  <div class="flex gap-2">
                    <input
                      type="text"
                      v-model="bookingReference"
                      placeholder="e.g., SWM12345678"
                      class="flex-1 form-input"
                      @input="bookingValidated = false"
                      required
                    />
                    <button
                      type="button"
                      @click="validateBookingReference"
                      :disabled="!bookingReference || validatingBooking"
                      class="px-4 py-2.5 bg-[#F4C400] text-[#0C3B5E] font-bold rounded-xl hover:bg-[#F4C400]/80 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs md:text-sm whitespace-nowrap border-2 border-[#F4C400]"
                    >
                      <i v-if="validatingBooking" class="fas fa-spinner fa-spin mr-1"></i>
                      {{ validatingBooking ? 'Checking...' : 'Validate' }}
                    </button>
                  </div>

                  <p class="form-hint mt-2">
                    <i class="fas fa-info-circle mr-1 text-[#F4C400]"></i>
                    Get your booking reference from the Reservation page after booking and payment
                  </p>

                  <div
                    v-if="bookingValidationMessage"
                    :class="[
                      'mt-2 p-2 rounded text-xs',
                      bookingValidated
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    ]"
                  >
                    <i :class="bookingValidated ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="mr-1"></i>
                    {{ bookingValidationMessage }}
                  </div>

                  <div v-if="bookingValidated && bookingInfo" class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
                    <div class="flex items-center gap-2 mb-1">
                      <i class="fas fa-check-circle text-green-500"></i>
                      <span class="font-semibold text-green-700">Booking Verified!</span>
                    </div>
                    <p class="text-gray-700 ml-5">
                      {{ bookingInfo.package_name }} - {{ bookingInfo.available_slots || 0 }} slot(s) available
                      ({{ bookingInfo.enrolled_count || 0 }}/{{ bookingInfo.paid_slots }} enrolled)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button class="hero-btn hero-btn-primary w-full sm:w-auto" type="submit" :disabled="enrollmentSubmitting">
                <span class="relative z-10 group-hover:text-white transition-colors duration-300">
                  <i class="fas fa-paper-plane mr-2"></i>
                  {{ enrollmentSubmitting ? 'Submitting...' : 'Submit Enrollment' }}
                </span>
                <div class="hero-btn-overlay"></div>
              </button>

              <button type="button" @click="closeEnrollmentForm" class="hero-btn hero-btn-secondary w-full sm:w-auto">
                <span class="relative z-10 group-hover:text-white transition-colors duration-300">
                  Cancel
                </span>
                <div class="hero-btn-overlay"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- CLASS BOOKING MODAL -->
    <Teleport to="body">
      <div v-if="showClassBookingModal" class="modal-overlay-dark" @click.self="closeClassBookingModal">
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
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input v-model="classBookingForm.fullName" type="text" class="form-input" placeholder="Juan Dela Cruz" required />
              </div>

              <div class="form-group">
                <label class="form-label">Email *</label>
                <input v-model="classBookingForm.email" type="email" class="form-input" placeholder="name@email.com" required />
              </div>

              <div class="form-group">
                <label class="form-label">Phone *</label>
                <input v-model="classBookingForm.phone" type="tel" class="form-input" placeholder="09xx xxx xxxx" required />
              </div>

              <div class="form-group">
                <label class="form-label">Lesson Type *</label>
                <select v-model="classBookingForm.lessonType" class="form-input" required>
                  <option value="">Select lesson type</option>
                  <option value="Group Lessons">Group Lessons</option>
                  <option value="Private Lessons">Private Lessons</option>
                  <option value="Kids Lessons">Kids Lessons</option>
                  <option value="Advanced Training">Advanced Training</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Skill Level</label>
                <select v-model="classBookingForm.skillLevel" class="form-input">
                  <option value="">Select skill level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Preferred Date *</label>
                <input v-model="classBookingForm.preferredDate" type="date" class="form-input" required />
              </div>

              <div class="form-group">
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

              <div class="form-group">
                <label class="form-label">Number of Participants</label>
                <input v-model.number="classBookingForm.participants" type="number" min="1" class="form-input" />
              </div>
            </div>

            <div class="form-group mt-4">
              <label class="form-label">Special Requests</label>
              <textarea v-model="classBookingForm.notes" class="form-input" rows="3" placeholder="Any notes or preferences"></textarea>
            </div>

            <label class="checkbox-field mt-4">
              <input v-model="classBookingForm.agree" type="checkbox" />
              <span>I agree to be contacted about my booking request.</span>
            </label>

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
          <button class="lightbox-close" @click="closeLightbox" type="button">
            <i class="fas fa-times"></i>
          </button>

          <div class="lightbox-main">
            <img
              :src="galleryImages[currentImageIndex]?.url"
              :alt="galleryImages[currentImageIndex]?.caption"
              class="lightbox-image"
            />
            <div class="lightbox-caption">
              {{ galleryImages[currentImageIndex]?.caption }}
            </div>
          </div>

          <button class="lightbox-nav lightbox-prev" @click="prevImage" :disabled="galleryImages.length <= 1" type="button">
            <i class="fas fa-chevron-left"></i>
          </button>

          <button class="lightbox-nav lightbox-next" @click="nextImage" :disabled="galleryImages.length <= 1" type="button">
            <i class="fas fa-chevron-right"></i>
          </button>

          <div class="lightbox-counter">
            {{ currentImageIndex + 1 }} / {{ galleryImages.length }}
          </div>

          <div class="lightbox-thumbnails">
            <div
              v-for="(image, index) in galleryImages"
              :key="index"
              class="thumbnail"
              :class="{ active: index === currentImageIndex }"
              @click="currentImageIndex = index"
              :style="{ backgroundImage: `url(${image.url})` }"
            ></div>
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
})

const classBookingForm = reactive({
  fullName: '',
  email: '',
  phone: '',
  lessonType: '',
  skillLevel: '',
  preferredDate: '',
  preferredTime: '',
  participants: 1,
  notes: '',
  agree: false
})

const features = [
  {
    icon: 'fas fa-user-tie',
    title: 'Certified Instructors',
    description: 'Learn from experienced, certified swimming coaches with years of teaching experience'
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Safety First',
    description: 'State-of-the-art facilities with lifeguards on duty and safety equipment available'
  },
  {
    icon: 'fas fa-users',
    title: 'All Skill Levels',
    description: 'From beginners to advanced swimmers, we have programs tailored to your needs'
  }
]

const lessonTypes = [
  {
    type: '7 Years Old & Above',
    subtitle: 'Teen & Adult Program',
    icon: 'fas fa-star',
    price: 3000,
    duration: 'package',
    image: '/images/child.jpeg',
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
    price: 4000,
    duration: 'package',
    image: '/images/teen.jpg',
    features: [
      '10 sessions program',
      '1 hour per session',
      'Fun & safe learning',
      'Age-appropriate methods',
      'Parental involvement welcome'
    ]
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

  if (!classBookingForm.fullName.trim()) {
    classBookingError.value = 'Full name is required.'
    return
  }
  if (!classBookingForm.email.trim()) {
    classBookingError.value = 'Email is required.'
    return
  }
  if (!classBookingForm.phone.trim()) {
    classBookingError.value = 'Phone number is required.'
    return
  }
  if (!classBookingForm.lessonType) {
    classBookingError.value = 'Please select a lesson type.'
    return
  }
  if (!classBookingForm.preferredDate) {
    classBookingError.value = 'Please choose a preferred date.'
    return
  }
  if (!classBookingForm.preferredTime) {
    classBookingError.value = 'Please choose a preferred time slot.'
    return
  }
  if (!classBookingForm.agree) {
    classBookingError.value = 'You must agree to be contacted.'
    return
  }

  try {
    const payload = { ...classBookingForm }

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
    classBookingError.value = error.message || 'Failed to submit class booking. Please try again.'
  }
}

const downloadBrochure = () => {
  const pdfUrl = '/brochures/eduardos resort foundation benificiary form.pdf'
  window.open(pdfUrl, '_blank')
}

const openLightboxByType = (type) => {
  const index = galleryImages.value.findIndex(img => img.caption === type)
  currentImageIndex.value = index >= 0 ? index : 0
  showLightbox.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  showLightbox.value = false
  document.body.style.overflow = ''
}

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % galleryImages.value.length
}

const prevImage = () => {
  currentImageIndex.value = (currentImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
}

const validateBookingReference = async () => {
  if (!bookingReference.value) {
    bookingValidationMessage.value = 'Please enter a booking reference'
    bookingValidated.value = false
    return
  }

  validatingBooking.value = true
  bookingValidationMessage.value = ''
  bookingInfo.value = null

  try {
    const response = await fetch('http://localhost:8000/api/swimming/validate-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingReference: bookingReference.value })
    })

    const result = await response.json()

    if (result.success && result.canEnroll) {
      bookingValidated.value = true
      bookingInfo.value = result.booking
      const enrolledCount = result.booking.enrolled_count || 0
      const availableSlots = result.booking.available_slots || 0
      bookingValidationMessage.value = `✓ Booking verified! ${availableSlots} slot(s) available (${enrolledCount} already enrolled out of ${result.booking.paid_slots} paid slots)`
    } else {
      bookingValidated.value = false
      bookingValidationMessage.value = result.error || 'Invalid booking reference or booking is full'
    }
  } catch (error) {
    console.error('Error validating booking:', error)
    bookingValidated.value = false
    bookingValidationMessage.value = 'Failed to validate booking reference. Please try again.'
  } finally {
    validatingBooking.value = false
  }
}

const submitEnrollmentForm = async () => {
  try {
    if (enrollmentMode.value === 'booking') {
      if (!bookingReference.value) {
        alert('Please enter a booking reference')
        return
      }

      if (!bookingValidated.value) {
        alert('Please validate your booking reference first')
        return
      }
    }

    if (
      !formData.value.firstName ||
      !formData.value.dateOfBirth ||
      !formData.value.email ||
      !formData.value.address
    ) {
      alert('Please fill in all required fields (Name, Date of Birth, Email, Address)')
      return
    }

    const payload = {
      bookingReference: enrollmentMode.value === 'booking' ? bookingReference.value : null,
      bookingId: enrollmentMode.value === 'booking' && bookingInfo.value ? bookingInfo.value.booking_id : null,
      firstName: formData.value.firstName,
      middleName: formData.value.middleName,
      lastName: formData.value.familyName,
      dateOfBirth: formData.value.dateOfBirth,
      lessonType: formData.value.lessonType || (bookingInfo.value ? bookingInfo.value.package_name : null),
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

    let result = null

    if (enrollmentMode.value === 'booking') {
      const response = await fetch('http://localhost:8000/api/swimming/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit enrollment')
      }

      alert(`✅ Enrollment Successful!

Enrollment ID: #${result.enrollmentId}
Booking Reference: ${bookingReference.value}

${result.message}`)
    } else {
      result = await enrollmentStore.submitEnrollment(payload)

      if (!result) {
        throw new Error(enrollmentError.value || 'Failed to submit enrollment')
      }

      const enrollment = result.enrollment || result

      alert(`✅ Enrollment Successful!

Enrollment ID: #${enrollment.enrollment_id || enrollment.id || 'N/A'}

We will contact you within 24-48 hours to confirm your enrollment and arrange payment.`)
    }

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

    bookingReference.value = ''
    bookingValidated.value = false
    bookingInfo.value = null
    bookingValidationMessage.value = ''

    closeEnrollmentForm()
  } catch (error) {
    console.error('Error submitting enrollment:', error)
    alert(`❌ Error: ${error.message}`)
  }
}

const fetchCoaches = async () => {
  try {
    await enrollmentStore.fetchCoaches()
  } catch (error) {
    console.error('Error fetching coaches:', error)
  }
}

const handleKeydown = (e) => {
  if (!showLightbox.value) return
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'Escape') closeLightbox()
}

onMounted(() => {
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
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(to bottom, #E0F7FA, white);
}

.swimming-hero {
  background-image:
    radial-gradient(circle at 30% 40%, rgba(31, 141, 191, 0.25) 0%, transparent 40%),
    radial-gradient(circle at 70% 60%, rgba(244, 196, 0, 0.2) 0%, transparent 40%),
    linear-gradient(125deg, rgba(31, 141, 191, 0.4) 0%, rgba(244, 196, 0, 0.3) 100%),
    url('https://www.eduardosresort.com/images/IMG_4224.JPG');
  background-position: center;
  background-size: cover;
  background-blend-mode: overlay;
  position: relative;
}

.swimming-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.2) 100%);
  pointer-events: none;
}

.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.section-container {
  padding: 4rem 0;
}

.section-title {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-bottom: 2rem;
}

.feature-card,
.lesson-card,
.schedule-table-container,
.form-section {
  transition: all 0.3s ease;
}

.feature-icon,
.lesson-badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lesson-image img {
  transition: transform 0.3s ease;
}

.lesson-card:hover .lesson-image img {
  transform: scale(1.05);
}

.lesson-features {
  list-style: none;
  padding: 0;
  margin: 1.25rem 0;
}

.schedule-table th,
.schedule-table td {
  border-bottom: 1px solid rgba(31, 141, 191, 0.1);
}

.cta-section {
  background: linear-gradient(to right, #0C3B5E, #1F8DBF);
  padding: 4rem 0;
}

.hero-btn {
  padding: 0.75rem 2.5rem;
  border-radius: 0.75rem;
  font-weight: 800;
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
  border: 2px solid;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.hero-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.hero-btn-primary {
  background: #F4C400;
  color: #0C3B5E;
  border-color: #F4C400;
}

.hero-btn-secondary {
  background: transparent;
  color: #0C3B5E;
  border-color: #0C3B5E;
}

.hero-btn-white {
  background: transparent;
  color: white;
  border-color: white;
}

.hero-btn-overlay {
  position: absolute;
  inset: 0;
  background: #0A2F4A;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hero-btn:hover .hero-btn-overlay {
  opacity: 1;
}

.hero-btn:hover span,
.hero-btn:hover i {
  color: white;
}

.modal-overlay,
.modal-overlay-dark {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 1rem;
  overflow-y: auto;
}

.modal-overlay-dark {
  background: rgba(0, 0, 0, 0.5);
}

.class-modal-card {
  width: 100%;
  max-width: 820px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.class-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem;
  background: linear-gradient(135deg, #2b6cb0, #63b3ed);
  color: #fff;
}

.class-modal-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.class-modal-subtitle {
  font-size: 0.95rem;
  opacity: 0.9;
}

.class-close-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.25rem;
  cursor: pointer;
}

.class-modal-body {
  padding: 1.75rem;
}

.modal-card {
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.modal-close {
  border: none;
  cursor: pointer;
}

.form-label.required::after {
  content: ' *';
  color: #F4C400;
  font-weight: 700;
}

.form-label,
.checkbox-field {
  font-size: 0.875rem;
  color: #0C3B5E;
}

.form-input {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  border: 1px solid rgba(31, 141, 191, 0.2);
  border-radius: 0.75rem;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1F8DBF;
  box-shadow: 0 0 0 2px rgba(31, 141, 191, 0.2);
}

.form-hint {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  color: rgba(12, 59, 94, 0.5);
}

.form-nav-link {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(31, 141, 191, 0.3);
  color: #0C3B5E;
  text-decoration: none;
  transition: all 0.2s ease;
}

.form-nav-link:hover {
  background-color: rgba(244, 196, 0, 0.2);
  border-color: #F4C400;
}

.form-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0C3B5E;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-banner {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  font-weight: 600;
}

.btn-cancel,
.btn-submit {
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-submit {
  background: linear-gradient(135deg, #2b6cb0, #1e40af);
  color: #fff;
}

.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
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

.lightbox-main {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
}

.lightbox-image {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 0.5rem;
}

.lightbox-caption {
  margin-top: 1rem;
  text-align: center;
  color: white;
  font-size: 1.125rem;
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
  z-index: 100;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
}

.lightbox-prev {
  left: -70px;
}

.lightbox-next {
  right: -70px;
}

.lightbox-counter {
  position: absolute;
  top: -50px;
  left: 0;
  color: white;
}

.lightbox-thumbnails {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  width: 100%;
  padding: 1rem 0;
  justify-content: center;
  flex-wrap: wrap;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  background-size: cover;
  background-position: center;
  border: 3px solid transparent;
  cursor: pointer;
}

.thumbnail.active {
  border-color: #63B3ED;
  box-shadow: 0 0 15px rgba(99, 179, 237, 0.5);
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

@keyframes pulseHero {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes pulseSlowHero {
  0%, 100% { opacity: 0.2; transform: scale(1) translateX(-50%); }
  50% { opacity: 0.4; transform: scale(1.2) translateX(-50%); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-pulse-hero {
  animation: pulseHero 4s ease-in-out infinite;
}

.animate-pulse-slow-hero {
  animation: pulseSlowHero 6s ease-in-out infinite;
  left: 50% !important;
}

.delay-1000 {
  animation-delay: 1s;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}

@media (min-width: 1024px) {
  .section-title {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }
}

@media (max-width: 900px) {
  .lightbox-prev,
  .lightbox-next {
    position: static;
    margin: 0 0.25rem;
  }
}

@media (max-width: 640px) {
  .swimming-hero {
    min-height: 450px;
  }

  .text-\[32px\] {
    font-size: 28px;
  }

  .hero-btn {
    width: 100%;
    font-size: 0.9rem;
    padding: 0.875rem 1.25rem;
  }

  .feature-card,
  .lesson-body,
  .lesson-header,
  .form-section,
  .modal-card,
  .class-modal-body {
    padding: 1rem;
  }

  .lesson-image {
    height: 10rem;
  }

  .lightbox-image {
    max-height: 60vh;
  }

  .thumbnail {
    width: 50px;
    height: 50px;
  }
}
</style>