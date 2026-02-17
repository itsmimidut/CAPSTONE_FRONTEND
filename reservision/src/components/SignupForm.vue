<template>
  <div class="max-w-[380px] w-full animate-fade-in bg-white/98 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-gray-100">
    <h2 class="text-2xl font-extrabold text-blue-800 mb-1 tracking-tight">Create Account</h2>
    <p class="text-blue-700 mb-6 text-xs font-medium">Join us today and start your journey.</p>
    
    <form @submit.prevent="handleSubmit" autocomplete="off" class="space-y-4">
      <!-- Full Name -->
      <div>
        <label for="fullName" class="block mb-1.5 font-semibold text-blue-800 text-xs">Full Name</label>
        <div class="relative">
          <i class="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm"></i>
          <input 
            type="text" 
            id="fullName" 
            v-model="formData.fullName"
            class="w-full py-2.5 pl-10 pr-3 rounded-lg text-xs bg-white border border-gray-200 shadow-sm transition focus:outline-none focus:ring-1 focus:ring-yellow-300 focus:border-yellow-500 placeholder:text-gray-400"
            placeholder="Enter your full name" 
            required
          >
        </div>
      </div>

      <!-- Contact Number -->
      <div class="mb-4">
        <label for="contactNumber" class="block mb-1.5 font-medium text-gray-800 text-sm">Contact Number</label>
        <div class="relative">
          <i class="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-primary-blue text-lg"></i>
          <input 
            type="tel" 
            id="contactNumber" 
            v-model="formData.contactNumber"
            class="w-full py-2.5 pl-11 pr-4 border border-gray-200 rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/20"
            placeholder="09XXXXXXXXX" 
            required
          >
        </div>
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block mb-1.5 font-semibold text-blue-800 text-xs">Email Address</label>
        <div class="relative">
          <i class="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm"></i>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email"
            class="w-full py-2.5 pl-10 pr-3 rounded-lg text-xs bg-white border border-gray-200 shadow-sm transition focus:outline-none focus:ring-1 focus:ring-yellow-300 focus:border-yellow-500 placeholder:text-gray-400"
            placeholder="Enter your email" 
            required
          >
        </div>
      </div>
      
      <!-- Password -->
      <div>
        <label for="password" class="block mb-1.5 font-semibold text-blue-800 text-xs">Password</label>
        <div class="relative">
          <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm"></i>
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            v-model="formData.password"
            class="w-full py-2.5 pl-10 pr-10 rounded-lg text-xs bg-white border border-gray-200 shadow-sm transition focus:outline-none focus:ring-1 focus:ring-yellow-300 focus:border-yellow-500 placeholder:text-gray-400"
            placeholder="Enter your password" 
            required
          >
          <span 
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500 text-sm transition-colors"
            title="Toggle password visibility"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </span>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="authStore.error" class="p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold">
        {{ authStore.error }}
      </div>
      
      <!-- Create Account Button -->
      <button 
        type="submit" 
        :disabled="authStore.isLoading"
        @click="createRipple"
        class="relative overflow-hidden w-full py-2.5 rounded-lg text-sm font-bold cursor-pointer
               bg-yellow-500 text-blue-900 shadow-md hover:shadow-lg
               hover:bg-yellow-600 hover:text-blue-900
               active:scale-[0.98]
               transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span v-if="authStore.isLoading" class="flex items-center justify-center gap-1.5">
          <i class="fas fa-spinner fa-spin text-blue-900"></i> Creating Account...
        </span>
        <span v-else class="flex items-center justify-center gap-1.5">
          <i class="fas fa-user-plus text-blue-900"></i> Create Account
        </span>
      </button>
      
      <!-- Google Button -->
      <button 
        type="button"
        @click="handleGoogleLogin"
        :disabled="authStore.isLoading"
        class="w-full py-2.5 bg-blue-700 text-white border border-blue-700 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold
               hover:bg-blue-800 hover:text-white
               transition-all duration-300"
      >
        <i class="fab fa-google text-yellow-400 text-sm"></i> Continue with Google
      </button>
      
      <div class="text-center text-xs text-gray-700 font-semibold">
        <p>
          Already have an account?
          <router-link
            to="/login"
            class="text-yellow-600 hover:text-yellow-500 hover:underline transition-colors"
          >
            Login here
          </router-link>
        </p>
      </div>

    </form>
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
  const ripple = document.createElement('span')
  ripple.className = 'absolute rounded-full bg-white/70 animate-ripple pointer-events-none'
  
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = e.clientX - rect.left - size / 2
  const y = e.clientY - rect.top - size / 2
  
  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  
  button.appendChild(ripple)
  setTimeout(() => ripple.remove(), 600)
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

/* Button shadows */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.1), 0 2px 4px -1px rgba(245, 158, 11, 0.06);
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.1), 0 4px 6px -2px rgba(245, 158, 11, 0.05);
}
</style>