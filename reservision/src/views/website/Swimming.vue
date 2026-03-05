<template>
  <div class="min-h-screen bg-gradient">
    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Hero Section - Now matching RatesHero exactly -->
    <section class="relative flex items-center justify-center min-h-[450px] sm:min-h-[550px] swimming-hero text-center px-4 overflow-hidden">
      <!-- Animated background elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-10 left-10 w-32 h-32 bg-[#1F8DBF]/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-10 right-10 w-40 h-40 bg-[#F4C400]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <!-- Gradient overlay with more yellow presence -->
      <div class="absolute inset-0 bg-gradient-to-br from-[#1F8DBF]/20 via-[#F4C400]/10 to-[#F4C400]/20"></div>
      
      <!-- Glass card - horizontally elongated with ~50% opacity - EXACTLY like RatesHero -->
      <div class="relative z-10 max-w-4xl w-full backdrop-blur-md bg-white/50 rounded-2xl p-8 sm:p-10 md:p-12 shadow-2xl mx-4 flex flex-col justify-center border border-white/40 my-12">
        
        <!-- Inner glass layer for depth with yellow undertone -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/20 via-[#F4C400]/5 to-[#1F8DBF]/10 rounded-2xl pointer-events-none"></div>
        
        <!-- Content with relative positioning -->
        <div class="relative z-20 flex flex-col items-center justify-center">
          <!-- Yellow glow effect (background only) -->
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-[#F4C400]/30 rounded-full blur-2xl animate-pulse-slow"></div>
          
          <!-- Titles - Swimming Lessons in dark blue -->
          <h1 class="text-[32px] sm:text-[40px] md:text-[48px] font-bold leading-tight relative mb-2">
            <span class="text-[#0C3B5E] drop-shadow-lg">Swimming Lessons</span>
          </h1>

          <!-- Body text - exactly matching reference size and style -->
          <div class="mt-4 mb-2">
            <p class="text-xs sm:text-sm text-[#0C3B5E]/80 leading-relaxed drop-shadow-md font-medium max-w-2xl mx-auto">
              Learn to swim with certified instructors in a safe, fun environment
            </p>
          </div>

          <!-- CTA Buttons with updated colors -->
          <div class="flex flex-wrap justify-center gap-3 sm:gap-4 pt-4">
            <button @click="revealEnrollmentForm" class="px-10 sm:px-12 md:px-14 py-3 sm:py-4 bg-[#F4C400] text-[#0C3B5E] font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-sm sm:text-base md:text-lg relative overflow-hidden group border-2 border-[#F4C400] hover:border-[#F4C400]">
              <span class="relative z-10 group-hover:text-white transition-colors duration-300">
                <i class="fas fa-swimming-pool mr-2"></i>
                Enroll Now
              </span>
              <div class="absolute inset-0 bg-[#0A2F4A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <button @click="downloadBrochure" class="px-10 sm:px-12 md:px-14 py-3 sm:py-4 bg-transparent text-[#0C3B5E] font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-sm sm:text-base md:text-lg relative overflow-hidden group border-2 border-[#0C3B5E] hover:border-[#F4C400]">
              <span class="relative z-10 group-hover:text-white transition-colors duration-300">
                <i class="fas fa-download mr-2"></i>
                View/Download Enrollment Form
              </span>
              <div class="absolute inset-0 bg-[#0A2F4A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
            <div :class="['feature-icon w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl', 'bg-[#1F8DBF]/10 text-[#1F8DBF]']">
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
            <!-- Lesson Image -->
            <div class="lesson-image w-full h-48 overflow-hidden" v-if="lesson.image">
              <img :src="lesson.image" :alt="lesson.type" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            
            <div class="lesson-header p-5 flex items-center gap-3 bg-gradient-to-r from-[#1F8DBF]/10 to-[#F4C400]/10">
              <div :class="['lesson-badge w-14 h-14 rounded-full flex items-center justify-center text-xl', 'bg-[#1F8DBF]/20 text-[#1F8DBF]']">
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
                class="w-full px-6 py-3 bg-[#F4C400] text-[#0C3B5E] font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-sm relative overflow-hidden group border-2 border-[#F4C400] hover:border-[#F4C400]"
              >
                <span class="relative z-10 group-hover:text-white transition-colors duration-300">
                  Book {{ lesson.type }} package
                </span>
                <div class="absolute inset-0 bg-[#0A2F4A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Schedule Section -->
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
              <tr v-for="slot in schedule" :key="slot.time" class="border-b border-[#1F8DBF]/10 hover:bg-[#1F8DBF]/5 transition-colors">
                <td class="py-3 px-4 text-sm font-semibold text-[#0C3B5E]">{{ slot.time }}</td>
                <td class="py-3 px-4 text-sm text-[#0C3B5E]/80">{{ slot.weekday }}</td>
                <td class="py-3 px-4 text-sm text-[#0C3B5E]/80">{{ slot.weekend }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-8 text-center">
          <button @click="openClassBookingModal()" class="px-10 sm:px-12 md:px-14 py-3 sm:py-4 bg-[#F4C400] text-[#0C3B5E] font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-sm sm:text-base md:text-lg relative overflow-hidden group border-2 border-[#F4C400] hover:border-[#F4C400]">
            <span class="relative z-10 group-hover:text-white transition-colors duration-300">
              <i class="fas fa-calendar-plus mr-2"></i>
              Book a Class Session
            </span>
            <div class="absolute inset-0 bg-[#0A2F4A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section bg-gradient-to-r from-[#0C3B5E] to-[#1F8DBF] py-16">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
          <span class="text-[#F4C400]">Ready to Make a Splash?</span>
        </h2>
        <p class="text-base md:text-lg text-white/80 mb-8">
          Join hundreds of students who've learned to swim with us
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <button @click="revealEnrollmentForm" class="px-10 sm:px-12 md:px-14 py-3 sm:py-4 bg-[#F4C400] text-[#0C3B5E] font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-sm sm:text-base md:text-lg relative overflow-hidden group border-2 border-[#F4C400] hover:border-[#F4C400]">
            <span class="relative z-10 group-hover:text-white transition-colors duration-300">
              <i class="fas fa-user-plus mr-2"></i>
              Enroll Now
            </span>
            <div class="absolute inset-0 bg-[#0A2F4A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <a href="/contact" class="px-10 sm:px-12 md:px-14 py-3 sm:py-4 bg-transparent text-white font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-sm sm:text-base md:text-lg relative overflow-hidden group border-2 border-white hover:border-[#F4C400]">
            <span class="relative z-10 group-hover:text-white transition-colors duration-300">
              <i class="fas fa-phone mr-2"></i>
              Contact Us
            </span>
            <div class="absolute inset-0 bg-[#0A2F4A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

    <!-- Enrollment Form Modal - UPDATED WITH COLOR PALETTE -->
    <Teleport to="body">
      <div v-if="showEnrollmentForm" class="modal-overlay fixed inset-0 bg-[#0C3B5E]/60 flex items-center justify-center p-6 z-50" @click.self="closeEnrollmentForm">
        <div class="modal-card w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 md:p-8 shadow-2xl border-t-4 border-[#F4C400]">
          <div class="modal-header flex items-start justify-between gap-4 pb-4 border-b border-[#1F8DBF]/20 mb-6">
            <div>
              <h2 class="section-title text-xl md:text-2xl font-bold flex flex-wrap items-center gap-2">
                <span class="text-[#0C3B5E]">Registration Form</span> 
                
              </h2>
              <p class="section-subtitle text-xs md:text-sm text-[#0C3B5E]/70 mt-1">Please complete all required fields <span class="text-[#F4C400] font-semibold">*</span></p>
            </div>
            <button class="modal-close w-8 h-8 rounded-full bg-gray-100 hover:bg-[#F4C400]/20 flex items-center justify-center transition-colors" @click="closeEnrollmentForm" aria-label="Close">
              <i class="fas fa-times text-[#0C3B5E]"></i>
            </button>
          </div>

          <div class="text-center text-xs md:text-sm text-[#1F8DBF] mb-6 font-medium bg-[#1F8DBF]/5 py-2 px-4 rounded-full inline-block mx-auto">
            <i class="fas fa-map-marker-alt mr-2 text-[#F4C400]"></i>
            Nautical Highway, Bayanan II, Calapan City, Oriental Mindoro 5200
          </div>

          <!-- Info message for regular enrollment -->
          <div v-if="enrollmentMode === 'regular'" class="mb-6 p-4 bg-gradient-to-r from-[#1F8DBF]/10 to-[#F4C400]/10 border border-[#1F8DBF]/20 rounded-lg">
            <h3 class="text-sm md:text-base font-semibold text-[#0C3B5E] mb-2 flex items-center">
              <i class="fas fa-info-circle mr-2 text-[#F4C400]"></i>
              New Enrollment
            </h3>
            <p class="text-xs md:text-sm text-[#0C3B5E]/70">
              Fill out the form below to register for swimming lessons. Payment and scheduling will be arranged after enrollment approval.
            </p>
          </div>

          <nav class="form-nav flex flex-wrap gap-2 p-2 bg-gradient-to-r from-[#1F8DBF]/5 to-[#F4C400]/5 rounded-xl mb-6 sticky top-0 z-10">
            <a class="form-nav-link text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full border border-[#1F8DBF]/30 hover:bg-[#F4C400]/20 transition-colors text-[#0C3B5E]" href="#section-basic">Basic Info</a>
            <a class="form-nav-link text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full border border-[#1F8DBF]/30 hover:bg-[#F4C400]/20 transition-colors text-[#0C3B5E]" href="#section-personal">Personal Details</a>
            <a class="form-nav-link text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full border border-[#1F8DBF]/30 hover:bg-[#F4C400]/20 transition-colors text-[#0C3B5E]" href="#section-contact">Contact</a>
            <a class="form-nav-link text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full border border-[#1F8DBF]/30 hover:bg-[#F4C400]/20 transition-colors text-[#0C3B5E]" href="#section-guardian">Guardian</a>
          </nav>

          <form class="space-y-6" @submit.prevent="submitEnrollmentForm">
            <div id="section-basic" class="form-section border border-[#1F8DBF]/20 rounded-xl p-5 hover:border-[#1F8DBF]/40 transition-colors">
              <h3 class="form-section-title text-sm md:text-base font-bold text-[#0C3B5E] mb-4 flex items-center">
                <span class="w-1 h-5 bg-[#F4C400] rounded-full mr-2"></span>
                Basic Info
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Name</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input type="text" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" placeholder="Family" v-model="formData.familyName" required />
                      <p class="form-hint text-[10px] md:text-xs text-[#0C3B5E]/50 mt-1">Family</p>
                    </div>
                    <div>
                      <input type="text" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" placeholder="First" v-model="formData.firstName" required />
                      <p class="form-hint text-[10px] md:text-xs text-[#0C3B5E]/50 mt-1">First</p>
                    </div>
                    <div>
                      <input type="text" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" placeholder="Middle" v-model="formData.middleName" />
                      <p class="form-hint text-[10px] md:text-xs text-[#0C3B5E]/50 mt-1">Middle</p>
                    </div>
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Date of Birth</label>
                  <input type="date" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.dateOfBirth" required />
                </div>
              </div>
            </div>

            <div id="section-personal" class="form-section border border-[#1F8DBF]/20 rounded-xl p-5 hover:border-[#1F8DBF]/40 transition-colors">
              <h3 class="form-section-title text-sm md:text-base font-bold text-[#0C3B5E] mb-4 flex items-center">
                <span class="w-1 h-5 bg-[#F4C400] rounded-full mr-2"></span>
                Personal Details
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Lesson Type</label>
                  <select class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.lessonType" required>
                    <option value="" disabled selected>Select Lesson Type</option>
                    <option value="Group Lessons">Group Lessons</option>
                    <option value="Private Lessons">Private Lessons</option>
                  </select>
                </div>
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Sex</label>
                  <select class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.sex" required>
                    <option value="" disabled selected>Sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Height (cm)</label>
                  <select class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.height" required>
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
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Weight (kg)</label>
                  <select class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.weight" required>
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
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Name of Coach</label>
                  <select class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.preferredCoach" required>
                    <option value="" disabled selected>Select a Coach</option>
                    <option v-for="coach in coaches" :key="coach.coach_id" :value="coach.coach_id">
                      {{ coach.name }} - {{ coach.specialization }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div id="section-contact" class="form-section border border-[#1F8DBF]/20 rounded-xl p-5 hover:border-[#1F8DBF]/40 transition-colors">
              <h3 class="form-section-title text-sm md:text-base font-bold text-[#0C3B5E] mb-4 flex items-center">
                <span class="w-1 h-5 bg-[#F4C400] rounded-full mr-2"></span>
                Contact Information
              </h3>
              <div>
                <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Student's Address</label>
                <input type="text" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.address" required />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Mobile Phone</label>
                  <input type="text" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.mobilePhone" required />
                </div>
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Email Address</label>
                  <input type="email" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.email" required />
                </div>
              </div>
            </div>

            <div id="section-guardian" class="form-section border border-[#1F8DBF]/20 rounded-xl p-5 hover:border-[#1F8DBF]/40 transition-colors">
              <h3 class="form-section-title text-sm md:text-base font-bold text-[#0C3B5E] mb-4 flex items-center">
                <span class="w-1 h-5 bg-[#F4C400] rounded-full mr-2"></span>
                Guardian Details
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Father's Name</label>
                  <input type="text" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.fatherName" required />
                </div>
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Mother's Name</label>
                  <input type="text" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.motherName" required />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5">School or Employer Name</label>
                  <input type="text" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.schoolOrEmployerName" />
                </div>
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5">School or Employer Address</label>
                  <input type="text" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.schoolOrEmployerAddress" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Contact Person</label>
                  <input type="text" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.contactPerson" required />
                </div>
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Contact Number</label>
                  <input type="text" class="form-input w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all" v-model="formData.contactNumber" required />
                </div>
              </div>

              <!-- Booking Reference (Only for booking mode) -->
              <div v-if="enrollmentMode === 'booking'" class="mt-6 p-4 bg-gradient-to-r from-[#1F8DBF]/5 to-[#F4C400]/5 rounded-lg border border-[#F4C400]/20">
                <h4 class="text-sm font-semibold text-[#0C3B5E] mb-3 flex items-center">
                  <i class="fas fa-ticket-alt mr-2 text-[#F4C400]"></i>
                  Booking Reference
                </h4>
                <div>
                  <label class="form-label block text-xs md:text-sm font-semibold text-[#0C3B5E] mb-1.5 required">Booking Reference</label>
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      v-model="bookingReference" 
                      placeholder="e.g., SWM12345678"
                      class="flex-1 w-full px-4 py-2.5 text-sm border border-[#1F8DBF]/20 rounded-xl focus:outline-none focus:border-[#1F8DBF] focus:ring-2 focus:ring-[#1F8DBF]/20 transition-all"
                      @input="bookingValidated = false"
                      required
                    />
                    <button
                      type="button"
                      @click="validateBookingReference"
                      :disabled="!bookingReference || validatingBooking"
                      class="px-4 py-2.5 bg-[#F4C400] text-[#0C3B5E] font-bold rounded-xl hover:bg-[#F4C400]/80 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs md:text-sm whitespace-nowrap border-2 border-[#F4C400] hover:border-[#F4C400]"
                    >
                      <i v-if="validatingBooking" class="fas fa-spinner fa-spin mr-1"></i>
                      {{ validatingBooking ? 'Checking...' : 'Validate' }}
                    </button>
                  </div>
                  <p class="form-hint text-[10px] md:text-xs text-[#0C3B5E]/50 mt-2">
                    <i class="fas fa-info-circle mr-1 text-[#F4C400]"></i>
                    Get your booking reference from the Reservation page after booking and payment
                  </p>
                  
                  <!-- Validation Result -->
                  <div v-if="bookingValidationMessage" :class="[
                    'mt-2 p-2 rounded text-xs',
                    bookingValidated 
                      ? 'bg-green-50 border border-green-200 text-green-700' 
                      : 'bg-red-50 border border-red-200 text-red-700'
                  ]">
                    <i :class="bookingValidated ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="mr-1"></i>
                    {{ bookingValidationMessage }}
                  </div>
                  
                  <!-- Booking Info (compact) -->
                  <div v-if="bookingValidated && bookingInfo" class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
                    <div class="flex items-center gap-2 mb-1">
                      <i class="fas fa-check-circle text-green-500"></i>
                      <span class="font-semibold text-green-700">Booking Verified!</span>
                    </div>
                    <p class="text-gray-700 ml-5">{{ bookingInfo.package_name }} - {{ bookingInfo.available_slots || 0 }} slot(s) available ({{ bookingInfo.enrolled_count || 0 }}/{{ bookingInfo.paid_slots }} enrolled)</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button class="px-10 sm:px-12 md:px-14 py-3 sm:py-4 bg-[#F4C400] text-[#0C3B5E] font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-sm sm:text-base md:text-lg relative overflow-hidden group border-2 border-[#F4C400] hover:border-[#F4C400] w-full sm:w-auto" type="submit" :disabled="isSubmittingForm">
                <span class="relative z-10 group-hover:text-white transition-colors duration-300">
                  <i class="fas fa-paper-plane mr-2"></i>
                  {{ isSubmittingForm ? 'Submitting...' : 'Submit Enrollment' }}
                </span>
                <div class="absolute inset-0 bg-[#0A2F4A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button type="button" @click="closeEnrollmentForm" class="px-10 sm:px-12 md:px-14 py-3 sm:py-4 bg-transparent text-[#0C3B5E] font-extrabold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-sm sm:text-base md:text-lg relative overflow-hidden group border-2 border-[#0C3B5E] hover:border-[#F4C400] w-full sm:w-auto">
                <span class="relative z-10 group-hover:text-white transition-colors duration-300">
                  Cancel
                </span>
                <div class="absolute inset-0 bg-[#0A2F4A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

// Enrollment mode and booking reference validation
const enrollmentMode = ref('booking') // 'booking' or 'regular'
const bookingReference = ref('')
const bookingValidated = ref(false)
const validatingBooking = ref(false)
const bookingValidationMessage = ref('')
const bookingInfo = ref(null)

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
    badgeClass: 'bg-blue-100 text-blue-600', 
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

const galleryImages = [
  // Add your gallery images here
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
  router.push({ path: '/websitereservation', query: { service: 'swimming' } })
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

// Validate booking reference
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

// Submit enrollment form
const submitEnrollmentForm = async () => {
  try {
    isSubmittingForm.value = true

    // Validate booking reference if in booking mode
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

    // Validate required fields
    if (!formData.value.firstName || !formData.value.dateOfBirth || !formData.value.email || !formData.value.address) {
      alert('Please fill in all required fields (Name, Date of Birth, Email, Address)')
      return
    }

    // Prepare data for backend
    const enrollmentData = {
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

    // Use different endpoint based on mode
    const endpoint = enrollmentMode.value === 'booking' 
      ? 'http://localhost:8000/api/swimming/enroll'  // Booking-based enrollment
      : 'http://localhost:8000/api/swimming/enrollments'  // Regular enrollment

    const response = await fetch(endpoint, {
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
    if (enrollmentMode.value === 'booking') {
      const successMsg = `✅ Enrollment Successful!

Enrollment ID: #${result.enrollmentId}
Booking Reference: ${bookingReference.value}

${result.message}

Slots Used: ${result.slotsUsed}/${result.totalSlots}
${result.allSlotsFilled ? '\n🎉 All slots for this booking are now filled! Swimming schedules will be created soon.' : ''}

We will contact you with schedule details shortly.`
      alert(successMsg)
    } else {
      alert(`✅ Enrollment Successful!\n\nEnrollment ID: #${result.enrollment.enrollment_id}\n\nWe will contact you within 24-48 hours to confirm your enrollment and arrange payment.`)
    }
    
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

    // Reset booking reference fields
    bookingReference.value = ''
    bookingValidated.value = false
    bookingInfo.value = null
    bookingValidationMessage.value = ''

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

// Intersection Observer for reveal animations (keep for scroll animations)
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

/* Hero Section Styles - Updated with color palette */
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

/* Enhanced glass morphism effect with ~50% opacity */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Animation for background elements ONLY (not content) */
@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.2; transform: scale(1) translateX(-50%); }
  50% { opacity: 0.4; transform: scale(1.2) translateX(-50%); }
}

.animate-pulse {
  animation: pulse 4s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 6s ease-in-out infinite;
  left: 50% !important;
}

.delay-1000 {
  animation-delay: 1s;
}

/* Custom spacing for vertical elongation - matching reference exactly */
.min-h-\[450px\] {
  min-height: 450px;
}

@media (min-width: 640px) {
  .sm\:min-h-\[550px\] {
    min-height: 550px;
  }
}

/* Horizontal box padding - matching RatesHero */
.p-8 {
  padding: 2.5rem 2rem;
}

@media (min-width: 640px) {
  .sm\:p-10 {
    padding: 3rem 2.5rem;
  }
}

@media (min-width: 768px) {
  .md\:p-12 {
    padding: 3.5rem 3rem;
  }
}

.my-12 {
  margin-top: 3rem;
  margin-bottom: 3rem;
}

/* Fixed body text container - wider for horizontal layout */
.max-w-2xl {
  max-width: 42rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

/* Proper vertical spacing between elements */
.mb-2 {
  margin-bottom: 0.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

/* Section container */
.section-container {
  padding: 4rem 0;
}

/* Section title with responsive flex */
.section-title {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
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

.section-subtitle {
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .section-subtitle {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}

/* Feature card */
.feature-card {
  background: white;
  border-radius: 1rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(31, 141, 191, 0.2);
}

.feature-card:hover {
  border-color: #1F8DBF;
}

.feature-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 2rem;
  background-color: rgba(31, 141, 191, 0.1);
  color: #1F8DBF;
}

.feature-title {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #0C3B5E;
}

.feature-description {
  font-size: 0.875rem;
  line-height: 1.5rem;
  color: rgba(12, 59, 94, 0.7);
}

/* Lesson card */
.lesson-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(31, 141, 191, 0.2);
}

.lesson-card:hover {
  border-color: #1F8DBF;
}

.lesson-image {
  width: 100%;
  height: 12rem;
  overflow: hidden;
}

.lesson-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.lesson-card:hover .lesson-image img {
  transform: scale(1.05);
}

.lesson-header {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(to right, rgba(31, 141, 191, 0.1), rgba(244, 196, 0, 0.1));
}

.lesson-badge {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  line-height: 1.75rem;
  background-color: rgba(31, 141, 191, 0.2);
  color: #1F8DBF;
}

.lesson-title {
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 700;
  color: #0C3B5E;
}

.lesson-subtitle {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgba(12, 59, 94, 0.7);
}

.lesson-body {
  padding: 1.25rem;
}

.lesson-price {
  margin-bottom: 1rem;
}

.price-amount {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: #1F8DBF;
}

.price-duration {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgba(12, 59, 94, 0.6);
}

.lesson-features {
  list-style: none;
  padding: 0;
  margin: 1.25rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lesson-features li {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgba(12, 59, 94, 0.7);
  display: flex;
  align-items: flex-start;
}

/* Schedule table */
.schedule-table-container {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(31, 141, 191, 0.2);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table th {
  background-color: #0C3B5E;
  color: white;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
}

.schedule-table td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  border-bottom: 1px solid rgba(31, 141, 191, 0.1);
}

.schedule-table tr:last-child td {
  border-bottom: none;
}

.schedule-table tbody tr:hover {
  background-color: rgba(31, 141, 191, 0.05);
  transition: background-color 0.2s ease;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(to right, #0C3B5E, #1F8DBF);
  padding: 4rem 0;
}

/* Modal styles - UPDATED WITH COLOR PALETTE */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(12, 59, 94, 0.6);
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
  overflow-y: auto;
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-top: 4px solid #F4C400;
}

@media (min-width: 768px) {
  .modal-card {
    padding: 2rem;
  }
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(31, 141, 191, 0.2);
  margin-bottom: 1.5rem;
}

.modal-close {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;
}

.modal-close:hover {
  background-color: rgba(244, 196, 0, 0.2);
}

.modal-close i {
  color: #0C3B5E;
}

/* Form styles - UPDATED WITH COLOR PALETTE */
.form-label {
  display: block;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 600;
  color: #0C3B5E;
  margin-bottom: 0.375rem;
}

@media (min-width: 768px) {
  .form-label {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
}

.form-label.required::after {
  content: ' *';
  color: #F4C400;
  font-weight: 700;
}

.form-input {
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
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
  line-height: 1rem;
  margin-top: 0.25rem;
  color: rgba(12, 59, 94, 0.5);
}

.form-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  background: linear-gradient(to right, rgba(31, 141, 191, 0.05), rgba(244, 196, 0, 0.05));
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.form-nav-link {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(31, 141, 191, 0.3);
  color: #0C3B5E;
  text-decoration: none;
  transition: all 0.2s ease;
}

@media (min-width: 768px) {
  .form-nav-link {
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding: 0.375rem 1rem;
  }
}

.form-nav-link:hover {
  background-color: rgba(244, 196, 0, 0.2);
  border-color: #F4C400;
}

.form-section {
  border: 1px solid rgba(31, 141, 191, 0.2);
  border-radius: 0.75rem;
  padding: 1.25rem;
  background: white;
  transition: border-color 0.2s ease;
}

.form-section:hover {
  border-color: rgba(31, 141, 191, 0.4);
}

.form-section-title {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 700;
  color: #0C3B5E;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

@media (min-width: 768px) {
  .form-section-title {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}

/* Reveal animation */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Color palette */
:root {
  --reservision-blue: #0C3B5E;
  --darker-blue: #0A2F4A;
  --blue-1: #1E88B6;
  --blue-2: #1F8DBF;
  --yellow-1: #F2C200;
  --yellow-2: #F4C400;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .swimming-hero {
    min-height: 450px;
  }
  
  .mt-4 {
    margin-top: 0.75rem;
  }
  
  .max-w-2xl {
    max-width: 100%;
  }
  
  .text-\[32px\] {
    font-size: 28px;
  }
  
  .section-title {
    flex-direction: column;
    gap: 0.25rem;
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
  
  .lesson-image {
    height: 10rem;
  }
  
  .modal-card {
    padding: 1rem;
  }
  
  .form-section {
    padding: 1rem;
  }
}
</style>