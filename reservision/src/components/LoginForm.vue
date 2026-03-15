<template>
  <div class="min-h-screen bg-gradient-to-br from-[#1F8DBF]/5 via-white/95 to-[#F4C400]/10 flex items-center justify-center p-0.5">
    <!-- Single Form Wrapper - Takes most of the screen with minimal spacing -->
    <div class="w-full max-w-md bg-white/98 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-[#1F8DBF]/10 animate-fade-in">
      <h2 class="text-2xl font-extrabold text-[#1F8DBF] mb-1 tracking-tight">Welcome Back</h2>
      <p class="text-[#1F8DBF]/70 mb-6 text-xs font-medium">Log in to continue your journey.</p>
      
      <form @submit.prevent="handleSubmit" autocomplete="off" class="space-y-4">
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

        <a href="#" class="block text-right text-xs text-[#F4C400] font-semibold hover:underline hover:text-[#F4C400]/80 transition-colors">
          Forgot Password?
        </a>
        
        <!-- Login Button -->
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
            <i class="fas fa-spinner fa-spin"></i> Logging in...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <i class="fas fa-sign-in-alt"></i> Login
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
        
        <!-- ─────────────────────────────────────────────────────────────── -->
        <!-- Google Sign-In Button (injected by Google Identity Services)      -->
        <!--                                                                    -->
        <!-- How it works:                                                      -->
        <!--  • onMounted calls initGoogleSignIn()                              -->
        <!--  • google.accounts.id.renderButton() inserts an <iframe> here     -->
        <!--  • Clicking the iframe opens a centred popup account selector      -->
        <!--  • No more prompt() → no more One-Tap corner overlay               -->
        <!-- ─────────────────────────────────────────────────────────────── -->
        <div ref="googleButtonContainer" class="w-full flex justify-center min-h-[44px]">
          <!-- Skeleton pulse shown while the GIS script loads (disappears once
               googleReady becomes true and renderButton() fires) -->
          <div
            v-if="!googleReady"
            class="w-full h-[44px] rounded-lg border border-[#1F8DBF]/20 bg-gray-50 animate-pulse
                   flex items-center justify-center gap-2 text-xs text-gray-400"
          >
            <i class="fas fa-circle-notch fa-spin text-[#1F8DBF]/40"></i>
            <span>Loading Google Sign-In…</span>
          </div>
        </div>
        
        <div class="text-center text-xs text-[#1F8DBF]/70 font-semibold">
          <p>
            Don't have an account?
            <router-link
              to="/signup"
              class="text-[#F4C400] hover:text-[#F4C400]/80 hover:underline transition-colors font-bold"
            >
              Create one
            </router-link>
          </p>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'  

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showPassword = ref(false)
const googleReady = ref(false)
// Template ref that points to the <div ref="googleButtonContainer"> element.
// renderButton() injects Google's iframe into this div after the GIS script loads.
const googleButtonContainer = ref(null)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
// Use the same API base URL as the auth store (configured via VITE_API_URL in .env)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const formData = reactive({
  email: '',
  password: ''
})

const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existingScript = document.getElementById('google-identity-script')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google script')))
      return
    }

    const script = document.createElement('script')
    script.id = 'google-identity-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google script'))
    document.head.appendChild(script)
  })
}

const initGoogleSignIn = async () => {
  if (!GOOGLE_CLIENT_ID) {
    return
  }

  try {
    await loadGoogleScript()

    // Step 1 — Initialize the Google Identity Services library.
    //
    // ux_mode: 'popup'
    //   Opens the account chooser as a standard centred popup window.
    //   This is the key change: previously the absence of this option
    //   (combined with prompt()) caused the One-Tap overlay to appear in
    //   the top-right corner of the screen, which looks unprofessional.
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      ux_mode: 'popup',
      callback: async (response) => {
        if (!response?.credential) {
          authStore.setError('Google login failed. No credential returned.')
          return
        }
        // The credential (ID token) is forwarded unchanged to the existing
        // backend endpoint. No server-side modifications required.
        const result = await authStore.loginWithGoogle(response.credential)
        if (result.success) {
          // redirectByRole is async and handles NavigationFailure fallback
          await redirectByRole(result.role)
        } else {
          authStore.setError(result.message || 'Google login failed. Please try again.')
        }
      }
    })

    // Step 2 — Render Google's official button inside the mount-point div.
    //
    // This completely replaces our custom <button> + prompt() approach:
    //   • Clicking the rendered button triggers the popup selector (no prompt())
    //   • The button uses Google's own branding — compliant with their UX policy
    //   • width is capped at 400px (Google's internal maximum) while still filling
    //     the form column on narrower screens
    if (googleButtonContainer.value) {
      window.google.accounts.id.renderButton(googleButtonContainer.value, {
        type: 'standard',        // icon + label (vs 'icon' for logo-only)
        theme: 'outline',        // white background with subtle border
        size: 'large',           // tallest option — visually matches form buttons
        text: 'continue_with',   // label reads "Continue with Google"
        shape: 'rectangular',    // consistent with the form's rounded-lg buttons
        logo_alignment: 'left',  // Google G on the left, text centred
        // Fill the container width; Google caps this at 400 px internally
        width: Math.min(googleButtonContainer.value.offsetWidth || 320, 400)
      })
    }

    googleReady.value = true
  } catch (error) {
    console.error('Google initialization error:', error)
    authStore.setError('Unable to initialize Google Sign-In. Please try again later.')
  }
}

const redirectByRole = async (role) => {
  // Choose the destination based on role, honouring any ?redirect= query param
  const savedRedirect = route.query.redirect
  let destination
  if (role === 'customer') {
    destination = (savedRedirect && typeof savedRedirect === 'string' && savedRedirect.startsWith('/'))
      ? savedRedirect
      : '/customer'
  } else if (role === 'admin' || role === 'restaurantstaff' || role === 'receptionist') {
    destination = '/dashboard'
  } else {
    destination = '/'
  }

  try {
    // router.push() returns a NavigationFailure (truthy) when the navigation
    // is rejected by a guard, or undefined when it succeeds.
    // If it is rejected for any reason (timing / guard edge-case), fall back to
    // a full-page replace which re-runs main.js and initFromStorage() so the
    // next guard always sees the correct auth state.
    const failure = await router.push(destination)
    if (failure) {
      // NavigationFailure — guard blocked the SPA navigation, hard-reload instead
      window.location.replace(destination)
    }
  } catch {
    // Unexpected router error — hard-reload as a safe fallback
    window.location.replace(destination)
  }
}

const handleSubmit = async () => {
  try {
    authStore.setLoading(true);
    authStore.clearError();

    const response = await fetch(`${API_URL}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: formData.email, 
        password: formData.password 
      })
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
        
        // Update auth store with user info
        authStore.setUser(data.customer);
      }

      // Redirect by role
      const role = data.customer?.role || 'customer';
      await redirectByRole(role);
    } else {
      authStore.setError(data.error || 'Login failed. Please check your credentials.');
    }
  } catch (err) {
    console.error('Login error:', err);
    authStore.setError('Server error. Please try again later.');
  } finally {
    authStore.setLoading(false);
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

onMounted(async () => {
  if (GOOGLE_CLIENT_ID) {
    await initGoogleSignIn()
  }
})
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
    margin: 0 0.25rem;
  }
}
</style>