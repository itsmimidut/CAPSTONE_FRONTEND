<template>
  <div class="max-w-[400px] w-full animate-fade-in">
    <h2 class="text-3xl font-semibold text-deep-brown mb-1">Create Account</h2>
    <p class="text-gray-500 mb-5 text-sm">Join us today and start your journey.</p>
    
    <form @submit.prevent="handleSubmit">
      <!--Full Name-->
      <div class="mb-4">
        <label for="fullName" class="block mb-1.5 font-medium text-gray-800 text-sm">Full Name</label>
        <div class="relative">
          <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-primary-blue text-lg"></i>
          <input 
            type="text" 
            id="fullName" 
            v-model="formData.fullName"
            class="w-full py-2.5 pl-11 pr-4 border border-gray-200 rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/20"
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
      <div class="mb-4">
        <label for="email" class="block mb-1.5 font-medium text-gray-800 text-sm">Email Address</label>
        <div class="relative">
          <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-primary-blue text-lg"></i>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email"
            class="w-full py-2.5 pl-11 pr-4 border border-gray-200 rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/20"
            placeholder="Enter your email" 
            required
          >
        </div>
      </div>
      
      <!-- Password -->
      <div class="mb-4">
        <label for="password" class="block mb-1.5 font-medium text-gray-800 text-sm">Password</label>
        <div class="relative">
          <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-primary-blue text-lg"></i>
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            v-model="formData.password"
            class="w-full py-2.5 pl-11 pr-12 border border-gray-200 rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/20"
            placeholder="Enter your password" 
            required
          >
          <span 
            @click="showPassword = !showPassword"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-primary-blue text-lg"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </span>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="authStore.error" class="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
        {{ authStore.error }}
      </div>

      <a href="#" class="block text-right mb-3 text-xs text-primary-blue font-medium hover:underline">
        Forgot Password?
      </a>
      
      <!-- Login Button -->
      <button 
        type="submit" 
        :disabled="authStore.isLoading"
        @click="createRipple"
        class="relative overflow-hidden w-full py-2.5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all bg-warm-brown text-white shadow-[0_4px_12px_rgba(193,154,107,0.3)] hover:bg-deep-brown hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(193,154,107,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="authStore.isLoading">
          <i class="fas fa-spinner fa-spin mr-2"></i>Creating Account...
        </span>
        <span v-else>Create Account</span>
      </button>
      
      <!-- Google Button -->
      <button 
        type="button"
        @click="handleGoogleLogin"
        :disabled="authStore.isLoading"
        class="w-full mt-3 py-2.5 bg-white text-gray-800 border border-gray-200 rounded-lg flex items-center justify-center gap-3 text-sm transition-all hover:bg-gray-50 hover:border-accent-blue disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i class="fab fa-google"></i> Continue with Google
      </button>
      
      <div class="text-center mt-4 text-xs">
        <p>
          Don't have an account?
          <router-link
            to="/login"
            class="text-primary-blue font-medium hover:underline"
          >
            Login
          </router-link>
        </p>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'

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
    alert('Google sign in successful! Redirecting to dashboard...')
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease;
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
</style>