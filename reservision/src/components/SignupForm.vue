<template>
  <div class="min-h-screen bg-gradient-to-br from-[#1F8DBF]/5 via-white/95 to-[#F4C400]/10 flex items-center justify-center p-4">
    <!-- Single Form Wrapper - With 0.5 inch gap from outline -->
    <div class="w-full max-w-md bg-white/98 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-[#1F8DBF]/10 animate-fade-in">
      <h2 class="text-2xl font-extrabold text-[#1F8DBF] mb-1 tracking-tight">Create Account</h2>
      <p class="text-[#1F8DBF]/70 mb-6 text-xs font-medium">Join us today and start your journey.</p>
      
      <form @submit.prevent="handleSubmit" autocomplete="off" class="space-y-4">
        <!-- Full Name -->
        <div>
          <label for="fullName" class="block mb-1.5 font-semibold text-[#1F8DBF] text-xs">Full Name</label>
          <div class="relative">
            <i class="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-[#1F8DBF] text-sm"></i>
            <input 
              type="text" 
              id="fullName" 
              v-model="formData.fullName"
              class="w-full py-3 pl-10 pr-3 rounded-lg text-sm bg-white border border-[#1F8DBF]/20 shadow-sm transition focus:outline-none focus:ring-1 focus:ring-[#F4C400] focus:border-[#F4C400] placeholder:text-gray-400"
              placeholder="Enter your full name" 
              required
            >
          </div>
        </div>

        <!-- Contact Number -->
        <div>
          <label for="contactNumber" class="block mb-1.5 font-semibold text-[#1F8DBF] text-xs">Contact Number</label>
          <div class="relative">
            <i class="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-[#1F8DBF] text-sm"></i>
            <input 
              type="tel" 
              id="contactNumber" 
              v-model="formData.contactNumber"
              class="w-full py-3 pl-10 pr-3 rounded-lg text-sm bg-white border border-[#1F8DBF]/20 shadow-sm transition focus:outline-none focus:ring-1 focus:ring-[#F4C400] focus:border-[#F4C400] placeholder:text-gray-400"
              placeholder="09XXXXXXXXX" 
              required
            >
          </div>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block mb-1.5 font-semibold text-[#1F8DBF] text-xs">Email Address</label>
          <div class="relative">
            <i class="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-[#1F8DBF] text-sm"></i>
            <input 
              type="email" 
              id="email" 
              v-model="formData.email"
              class="w-full py-3 pl-10 pr-3 rounded-lg text-sm bg-white border border-[#1F8DBF]/20 shadow-sm transition focus:outline-none focus:ring-1 focus:ring-[#F4C400] focus:border-[#F4C400] placeholder:text-gray-400"
              placeholder="Enter your email" 
              required
            >
          </div>
        </div>
        
        <!-- Password -->
        <div>
          <label for="password" class="block mb-1.5 font-semibold text-[#1F8DBF] text-xs">Password</label>
          <div class="relative">
            <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-[#1F8DBF] text-sm"></i>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="formData.password"
              class="w-full py-3 pl-10 pr-10 rounded-lg text-sm bg-white border border-[#1F8DBF]/20 shadow-sm transition focus:outline-none focus:ring-1 focus:ring-[#F4C400] focus:border-[#F4C400] placeholder:text-gray-400"
              placeholder="Enter your password" 
              required
            >
            <span 
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[#1F8DBF] text-sm transition-colors"
              :title="showPassword ? 'Hide password' : 'Show password'"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold">
          <i class="fas fa-exclamation-circle mr-1"></i> {{ authStore.error }}
        </div>
        
        <!-- Create Account Button -->
        <button 
          type="submit" 
          :disabled="authStore.isLoading"
          @click="createRipple"
          class="relative overflow-hidden w-full py-3 rounded-lg text-sm font-bold cursor-pointer
                 bg-gradient-to-r from-[#1F8DBF] to-[#1E88B6] text-white shadow-md hover:shadow-lg
                 hover:from-[#1F8DBF] hover:to-[#1E88B6] hover:scale-[1.02]
                 active:scale-[0.98]
                 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="authStore.isLoading" class="flex items-center justify-center gap-2">
            <i class="fas fa-spinner fa-spin"></i> Creating Account...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <i class="fas fa-user-plus"></i> Create Account
          </span>
          
          <!-- Ripple effect element -->
          <span class="ripple-container absolute inset-0 pointer-events-none"></span>
        </button>
        
        <!-- Divider -->
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-[#1F8DBF]/20"></div>
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="px-2 bg-white text-[#1F8DBF]/50">or</span>
          </div>
        </div>
        
        <!-- Google Button -->
        <button 
          type="button"
          @click="handleGoogleLogin"
          :disabled="authStore.isLoading"
          class="w-full py-3 bg-white border border-[#1F8DBF]/20 text-[#1F8DBF] rounded-lg flex items-center justify-center gap-2 text-sm font-semibold
                 hover:bg-[#1F8DBF]/5 hover:border-[#1F8DBF] hover:shadow-md
                 transition-all duration-300"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" class="w-4 h-4" />
          <span>Continue with Google</span>
        </button>
        
        <div class="text-center text-xs text-[#1F8DBF]/70 font-semibold">
          <p>
            Already have an account?
            <router-link
              to="/login"
              class="text-[#F4C400] hover:text-[#F4C400]/80 hover:underline transition-colors font-bold"
            >
              Login here
            </router-link>
          </p>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const showPassword = ref(false)
const formData = reactive({
  fullName: '',
  email: '',
  password: '',
  contactNumber: ''
})

const handleSubmit = async () => {
  // Split fullName into first and last name
  const [firstName, ...rest] = formData.fullName.trim().split(' ');
  const lastName = rest.join(' ') || '';

  const payload = {
    firstName,
    lastName,
    email: formData.email,
    password: formData.password,
    contactNumber: formData.contactNumber
  };

  try {
    authStore.setLoading(true);
    authStore.clearError();

    const response = await fetch('http://localhost:8000/api/customers/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Store the token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      // Store user data
      if (data.customer) {
        localStorage.setItem('user', JSON.stringify(data.customer));
      }

      // Show success message
      alert('Account created successfully! Redirecting to dashboard...');
      
      // Redirect to customer dashboard
      window.location.href = '/customer';
    } else {
      authStore.setError(data.error || 'Signup failed. Please try again.');
    }
  } catch (err) {
    console.error('Signup error:', err);
    authStore.setError('Server error. Please try again later.');
  } finally {
    authStore.setLoading(false);
  }
}

const handleGoogleLogin = async () => {
  const result = await authStore.loginWithGoogle()
  
  if (result.success) {
    // Handle successful Google sign-up
    if (result.role === 'customer') {
      router.push('/customer')
    } else if (result.role === 'admin' || result.role === 'restaurantstaff' || result.role === 'receptionist') {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }
}

const createRipple = (e) => {
  const button = e.currentTarget
  const container = button.querySelector('.ripple-container')
  if (!container) return
  
  const ripple = document.createElement('span')
  ripple.className = 'absolute rounded-full bg-white/30 animate-ripple pointer-events-none'
  
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = e.clientX - rect.left - size / 2
  const y = e.clientY - rect.top - size / 2
  
  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  
  container.innerHTML = '' // Clear previous ripples
  container.appendChild(ripple)
  
  setTimeout(() => {
    if (ripple.parentNode) ripple.remove()
  }, 600)
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease;
}

@keyframes ripple {
  to {
    transform: scale(2.5);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 0.6s linear;
}

/* Ensure the form takes most of the space */
.min-h-screen {
  min-height: 100vh;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .max-w-md {
    max-width: 100%;
    margin: 0 0.5rem;
  }
}
</style>