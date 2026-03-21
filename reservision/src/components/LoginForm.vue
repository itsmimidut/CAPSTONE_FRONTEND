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

        <button type="button" @click="openForgotModal" class="block w-full text-right text-xs text-[#F4C400] font-semibold hover:underline hover:text-[#F4C400]/80 transition-colors">
          Forgot Password?
        </button>
        
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
        <div class="w-full flex justify-center min-h-[44px]">
          <!-- Skeleton pulse shown while the GIS script loads.
               Kept as a sibling of googleButtonContainer so Vue's v-if
               comment anchors never compete with Google's injected iframe. -->
          <div
            v-if="!googleReady"
            class="w-full h-[44px] rounded-lg border border-[#1F8DBF]/20 bg-gray-50 animate-pulse
                   flex items-center justify-center gap-2 text-xs text-gray-400"
          >
            <i class="fas fa-circle-notch fa-spin text-[#1F8DBF]/40"></i>
            <span>Loading Google Sign-In…</span>
          </div>
          <!-- Google renderButton() injects its iframe here.
               Vue intentionally has no children in this div. -->
          <div ref="googleButtonContainer" class="w-full flex justify-center"></div>
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

  <!-- ─── Forgot Password Modal ─── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="forgotModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">

          <!-- Step 1: Enter Email -->
          <template v-if="forgotModal.step === 1">
            <h3 class="text-xl font-extrabold text-[#1F8DBF] mb-1">Forgot Password</h3>
            <p class="text-xs text-[#1F8DBF]/60 mb-5">Enter your registered email and we'll send a verification code.</p>
            <div class="mb-4">
              <label class="block mb-1.5 font-semibold text-[#1F8DBF] text-xs">Email Address</label>
              <div class="relative">
                <i class="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-[#1F8DBF] text-sm"></i>
                <input
                  v-model="forgotModal.email"
                  type="email"
                  placeholder="Enter your email"
                  class="w-full py-3 pl-10 pr-3 rounded-lg text-sm bg-white border border-[#1F8DBF]/20 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F4C400] focus:border-[#F4C400] placeholder:text-gray-400"
                />
              </div>
            </div>
            <div v-if="forgotModal.error" class="mb-3 p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold">
              <i class="fas fa-exclamation-circle mr-1"></i>{{ forgotModal.error }}
            </div>
            <div class="flex gap-2">
              <button type="button" @click="closeForgotModal" class="flex-1 py-2.5 rounded-lg border border-[#1F8DBF]/20 text-[#1F8DBF] text-sm font-semibold hover:bg-[#1F8DBF]/5 transition">Cancel</button>
              <button type="button" @click="sendForgotOtp" :disabled="forgotModal.loading" class="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#1F8DBF] to-[#1E88B6] text-white text-sm font-bold hover:shadow-md transition disabled:opacity-60">
                <span v-if="forgotModal.loading"><i class="fas fa-spinner fa-spin mr-1"></i>Sending…</span>
                <span v-else>Send Code</span>
              </button>
            </div>
          </template>

          <!-- Step 2: Enter OTP -->
          <template v-if="forgotModal.step === 2">
            <h3 class="text-xl font-extrabold text-[#1F8DBF] mb-1">Enter Verification Code</h3>
            <p class="text-xs text-[#1F8DBF]/60 mb-1">We sent a 6-digit code to</p>
            <p class="text-xs font-bold text-[#1F8DBF] mb-5 truncate">{{ forgotModal.email }}</p>
            <div class="mb-4">
              <label class="block mb-1.5 font-semibold text-[#1F8DBF] text-xs">Verification Code</label>
              <input
                v-model="forgotModal.otp"
                type="text"
                maxlength="6"
                placeholder="123456"
                class="w-full py-3 px-4 rounded-lg text-center text-2xl font-bold tracking-[0.4em] bg-white border border-[#1F8DBF]/20 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F4C400] focus:border-[#F4C400] placeholder:text-gray-300"
              />
            </div>
            <div v-if="forgotModal.error" class="mb-3 p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold">
              <i class="fas fa-exclamation-circle mr-1"></i>{{ forgotModal.error }}
            </div>
            <div class="flex gap-2 mb-3">
              <button type="button" @click="forgotModal.step = 1; forgotModal.error = ''" class="flex-1 py-2.5 rounded-lg border border-[#1F8DBF]/20 text-[#1F8DBF] text-sm font-semibold hover:bg-[#1F8DBF]/5 transition">Back</button>
              <button type="button" @click="verifyForgotOtp" :disabled="forgotModal.loading" class="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#1F8DBF] to-[#1E88B6] text-white text-sm font-bold hover:shadow-md transition disabled:opacity-60">
                <span v-if="forgotModal.loading"><i class="fas fa-spinner fa-spin mr-1"></i>Verifying…</span>
                <span v-else>Verify</span>
              </button>
            </div>
            <p class="text-center text-xs text-[#1F8DBF]/50">
              Didn't receive it?
              <button type="button" @click="sendForgotOtp" :disabled="forgotModal.countdown > 0" class="text-[#F4C400] font-semibold hover:underline disabled:opacity-50">
                {{ forgotModal.countdown > 0 ? `Resend in ${forgotModal.countdown}s` : 'Resend Code' }}
              </button>
            </p>
          </template>

          <!-- Step 3: Set New Password -->
          <template v-if="forgotModal.step === 3">
            <h3 class="text-xl font-extrabold text-[#1F8DBF] mb-1">Set New Password</h3>
            <p class="text-xs text-[#1F8DBF]/60 mb-5">Choose a strong password for your account.</p>
            <div class="mb-3">
              <label class="block mb-1.5 font-semibold text-[#1F8DBF] text-xs">New Password</label>
              <div class="relative">
                <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-[#1F8DBF] text-sm"></i>
                <input
                  :type="forgotModal.showPw ? 'text' : 'password'"
                  v-model="forgotModal.newPassword"
                  placeholder="Min. 6 characters"
                  class="w-full py-3 pl-10 pr-10 rounded-lg text-sm bg-white border border-[#1F8DBF]/20 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F4C400] focus:border-[#F4C400] placeholder:text-gray-400"
                />
                <span @click="forgotModal.showPw = !forgotModal.showPw" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[#1F8DBF] text-sm">
                  <i :class="forgotModal.showPw ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </span>
              </div>
            </div>
            <div class="mb-4">
              <label class="block mb-1.5 font-semibold text-[#1F8DBF] text-xs">Confirm Password</label>
              <div class="relative">
                <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-[#1F8DBF] text-sm"></i>
                <input
                  :type="forgotModal.showConfirmPw ? 'text' : 'password'"
                  v-model="forgotModal.confirmPassword"
                  placeholder="Repeat your password"
                  class="w-full py-3 pl-10 pr-10 rounded-lg text-sm bg-white border border-[#1F8DBF]/20 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F4C400] focus:border-[#F4C400] placeholder:text-gray-400"
                />
                <span @click="forgotModal.showConfirmPw = !forgotModal.showConfirmPw" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[#1F8DBF] text-sm">
                  <i :class="forgotModal.showConfirmPw ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </span>
              </div>
            </div>
            <div v-if="forgotModal.error" class="mb-3 p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold">
              <i class="fas fa-exclamation-circle mr-1"></i>{{ forgotModal.error }}
            </div>
            <button type="button" @click="doResetPassword" :disabled="forgotModal.loading" class="w-full py-3 rounded-lg bg-gradient-to-r from-[#1F8DBF] to-[#1E88B6] text-white text-sm font-bold hover:shadow-md transition disabled:opacity-60">
              <span v-if="forgotModal.loading"><i class="fas fa-spinner fa-spin mr-1"></i>Updating…</span>
              <span v-else><i class="fas fa-check-circle mr-1"></i>Reset Password</span>
            </button>
          </template>

          <!-- Step 4: Success -->
          <template v-if="forgotModal.step === 4">
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check-circle text-green-500 text-3xl"></i>
              </div>
              <h3 class="text-xl font-extrabold text-[#1F8DBF] mb-2">Password Updated!</h3>
              <p class="text-xs text-[#1F8DBF]/60 mb-6">Your password has been reset successfully. You can now log in with your new password.</p>
              <button type="button" @click="closeForgotModal" class="w-full py-3 rounded-lg bg-gradient-to-r from-[#1F8DBF] to-[#1E88B6] text-white text-sm font-bold hover:shadow-md transition">
                Back to Login
              </button>
            </div>
          </template>

        </div>
      </div>
    </Transition>
  </Teleport>

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
const googleButtonContainer = ref(null)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const formData = reactive({
  email: '',
  password: ''
})

// ─── Forgot Password State ───
const forgotModal = reactive({
  open: false,
  step: 1,       // 1=email, 2=otp, 3=new password, 4=success
  email: '',
  otp: '',
  newPassword: '',
  confirmPassword: '',
  loading: false,
  error: '',
  showPw: false,
  showConfirmPw: false,
  countdown: 0,
  _countdownTimer: null
})

const openForgotModal = () => {
  forgotModal.open = true
  forgotModal.step = 1
  forgotModal.email = formData.email  // prefill if user already typed email
  forgotModal.otp = ''
  forgotModal.newPassword = ''
  forgotModal.confirmPassword = ''
  forgotModal.error = ''
  forgotModal.loading = false
  forgotModal.countdown = 0
}

const closeForgotModal = () => {
  forgotModal.open = false
  clearInterval(forgotModal._countdownTimer)
}

const startCountdown = (seconds = 60) => {
  forgotModal.countdown = seconds
  clearInterval(forgotModal._countdownTimer)
  forgotModal._countdownTimer = setInterval(() => {
    if (forgotModal.countdown <= 1) {
      forgotModal.countdown = 0
      clearInterval(forgotModal._countdownTimer)
    } else {
      forgotModal.countdown--
    }
  }, 1000)
}

const sendForgotOtp = async () => {
  forgotModal.error = ''
  const email = (forgotModal.email || '').trim()
  if (!email) { forgotModal.error = 'Please enter your email address'; return }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) { forgotModal.error = 'Please enter a valid email address'; return }

  forgotModal.loading = true
  try {
    // Check account exists first
    const checkRes = await fetch(`${API_URL}/api/customers/check-email/${encodeURIComponent(email)}`)
    const checkData = await checkRes.json()
    if (!checkData.exists) {
      forgotModal.error = 'No account found with that email address'
      forgotModal.loading = false
      return
    }

    // Send OTP
    const otpRes = await fetch(`${API_URL}/api/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const otpData = await otpRes.json()
    if (otpData.success) {
      forgotModal.step = 2
      forgotModal.otp = ''
      startCountdown(60)
    } else {
      forgotModal.error = otpData.error || 'Failed to send code. Please try again.'
    }
  } catch {
    forgotModal.error = 'Network error. Please try again.'
  } finally {
    forgotModal.loading = false
  }
}

const verifyForgotOtp = async () => {
  forgotModal.error = ''
  if (!/^\d{6}$/.test(forgotModal.otp)) { forgotModal.error = 'Please enter the 6-digit code'; return }

  forgotModal.loading = true
  try {
    const res = await fetch(`${API_URL}/api/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotModal.email, otp: forgotModal.otp })
    })
    const data = await res.json()
    if (data.success) {
      clearInterval(forgotModal._countdownTimer)
      forgotModal.step = 3
      forgotModal.newPassword = ''
      forgotModal.confirmPassword = ''
    } else {
      forgotModal.error = data.error || (data.expired ? 'Code expired. Please request a new one.' : 'Invalid code')
    }
  } catch {
    forgotModal.error = 'Network error. Please try again.'
  } finally {
    forgotModal.loading = false
  }
}

const doResetPassword = async () => {
  forgotModal.error = ''
  if (forgotModal.newPassword.length < 6) { forgotModal.error = 'Password must be at least 6 characters'; return }
  if (forgotModal.newPassword !== forgotModal.confirmPassword) { forgotModal.error = 'Passwords do not match'; return }

  forgotModal.loading = true
  try {
    const res = await fetch(`${API_URL}/api/customers/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotModal.email, newPassword: forgotModal.newPassword })
    })
    const data = await res.json()
    if (data.success) {
      forgotModal.step = 4
    } else {
      forgotModal.error = data.error || 'Failed to reset password. Please try again.'
    }
  } catch {
    forgotModal.error = 'Network error. Please try again.'
  } finally {
    forgotModal.loading = false
  }
}
// ─── End Forgot Password ───

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

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
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