/**
 * ============================================================
 * Auth Store (Pinia)
 * ============================================================
 * 
 * Purpose:
 * - Manages user authentication state globally
 * - Handles login/logout operations
 * - Stores user information and role
 * - Tracks authentication status and errors
 * 
 * State Management Pattern:
 * - Uses Pinia (Vue 3 state management)
 * - defineStore('auth', () => {...}) creates the store
 * - ref() creates reactive state variables
 * - computed() creates derived state
 * 
 * Available State:
 * - user: Current user object | null
 * - isAuthenticated: Boolean - whether user logged in
 * - isLoading: Boolean - whether auth request in progress
 * - error: Error message string | null
 * - role: Computed - user's role ('admin', 'restaurantstaff', 'receptionist', 'customer')
 * 
 * Mock Credentials (for development/testing):
 * - Admin: admin@resort.com / admin123
 * - Restaurant Staff: restaurant@resort.com / restaurant123
 * - Receptionist: reception@resort.com / reception123
 * - Customer: user@resort.com / user123
 * 
 * ⚠️ IMPORTANT:
 * This uses MOCK authentication - currently no backend API integration
 * To implement real authentication:
 * 1. Replace setTimeout with actual API call to backend
 * 2. Send credentials to auth endpoint
 * 3. Store JWT token in localStorage/sessionStorage
 * 4. Include token in all subsequent API requests
 * 
 * Usage:
 * - Import: import { useAuthStore } from '@/stores/auth'
 * - In component: const auth = useAuthStore()
 * - Check login: if (auth.isAuthenticated) { ... }
 * - Get role: if (auth.role === 'admin') { ... }
 * - Call login: auth.login(email, password)
 * - Call logout: auth.logout()
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * ============================================================
 * STORE DEFINITION
 * ============================================================
 * 
 * defineStore(id, state_function)
 * - id: 'auth' - unique identifier for this store
 * - state_function: returns state, getters, and actions
 */
export const useAuthStore = defineStore('auth', () => {
  // ──────────────────────────────────────────────────────
  // STATE VARIABLES
  // ──────────────────────────────────────────────────────
  /**
   * user: Current logged-in user object
   * 
   * Structure when logged in:
   * {
   *   id: number,
   *   name: string,
   *   email: string,
  *   role: 'admin' | 'restaurantstaff' | 'receptionist' | 'customer'
   * }
   * 
   * Value: null - when logged out
   */
  const user = ref(null)

  /**
   * isAuthenticated: Whether user is currently logged in
   * 
   * Used by:
   * - Router guards to protect routes
   * - Components to show/hide auth-only content
   * - To check if need to redirect to login
   */
  const isAuthenticated = ref(false)

  /**
   * isLoading: Whether login request is in progress
   * 
   * Used to:
   * - Disable login button while request pending
   * - Show loading spinner
   * - Prevent multiple simultaneous login attempts
   */
  const isLoading = ref(false)

  /**
   * error: Current error message (if any)
   * 
   * Set when:
   * - Invalid credentials
   * - Network error
   * - Server error
   * 
   * Cleared when:
   * - New login attempt starts
   * - User logs out
   */
  const error = ref(null)

  // ──────────────────────────────────────────────────────
  // COMPUTED STATE (Derived from reactivestate)
  // ──────────────────────────────────────────────────────
  /**
   * role: Computed property - user's role or null
   * 
  * Returns: 'admin' | 'restaurantstaff' | 'receptionist' | 'customer' | null
   * 
   * Usage:
   * - Check permissions: if (role.value === 'admin')
   * - Route guards use this for RBAC (Role-Based Access Control)
   * - Conditional rendering: v-if="role === 'admin'"
   */
  const role = computed(() => user.value?.role || null)

  // ──────────────────────────────────────────────────────
  // ACTIONS (Functions that modify state)
  // ──────────────────────────────────────────────────────

  /**
   * ============================================================
   * LOGIN ACTION
   * ============================================================
   * 
   * Purpose: Authenticate user with email and password
   * 
   * Parameters:
   * - email: string - user's email address
   * - password: string - user's password
   * 
   * Flow:
   * 1. Set isLoading to true (disable button)
   * 2. Clear previous errors
   * 3. Wait 1 second (simulates network delay)
   * 4. Check credentials against MOCK_USERS
   * 5. If match: set user, set isAuthenticated to true
   * 6. If no match: set error message
   * 7. Set isLoading to false (re-enable button)
   * 
   * Return Value:
   * {
   *   success: boolean,
   *   role?: string (if successful),
   *   message?: string (if failed)
   * }
   * 
   * Usage in Component:
   * const result = await auth.login(email, password)
   * if (result.success) {
   *   router.push('/dashboard')
   * } else {
   *   showError(result.message)
   * }
   * 
   * ⚠️ IMPORTANT:
   * This is MOCK implementation - replace with actual API call:
   * 
   * // Future real implementation:
   * const response = await fetch('http://backend/api/auth/login', {
   *   method: 'POST',
   *   body: JSON.stringify({ email, password })
   * })
   * const data = await response.json()
   * localStorage.setItem('token', data.token)
   * user.value = data.user
   */
  const login = async (email, password) => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      /**
       * 🔐 MOCK USERS
       * 
       * For testing different roles:
      * - Admin: admin@resort.com / admin123
      * - Restaurant Staff: restaurant@resort.com / restaurant123
      * - Receptionist: reception@resort.com / reception123
      * - Customer: user@resort.com / user123
       * 
       * Any other email/password combination → Invalid credentials error
       */
      if (email === 'admin@resort.com' && password === 'admin123') {
        user.value = {
          id: 1,
          name: 'Admin User',
          email,
          role: 'admin'
        }
      } else if (email === 'restaurant@resort.com' && password === 'restaurant123') {
        user.value = {
          id: 2,
          name: 'Restaurant Staff',
          email,
          role: 'restaurantstaff'
        }
      } else if (email === 'reception@resort.com' && password === 'reception123') {
        user.value = {
          id: 3,
          name: 'Receptionist',
          email,
          role: 'receptionist'
        }
      } else if (email === 'user@resort.com' && password === 'user123') {
        user.value = {
          id: 4,
          name: 'Customer User',
          email,
          role: 'customer'
        }
      } else {
        throw new Error('Invalid email or password')
      }

      // Set authenticated flag and return success
      isAuthenticated.value = true
      return { success: true, role: user.value.role }

    } catch (err) {
      // Capture error message for display to user
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      // Always reset loading flag when done
      isLoading.value = false
    }
  }

  /**
   * ============================================================
   * LOGOUT ACTION
   * ============================================================
   * 
   * Purpose: Clear user session and reset auth state
   * 
   * Actions:
   * - Clear user object
   * - Set isAuthenticated to false
   * - Clear any error messages
   * 
   * Future Enhancement:
   * - Call backend logout endpoint
   * - Remove JWT token from localStorage
   * - Clear any server-side sessions
   * 
   * Usage in Component:
   * function handleLogout() {
   *   auth.logout()
   *   router.push('/login')
   * }
   */
  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    error.value = null
    // Clear stored auth data
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  /**
   * ============================================================
   * HELPER METHODS
   * ============================================================
   */

  /**
   * setLoading - Manually set loading state
   * Used by signup/login forms
   */
  const setLoading = (value) => {
    isLoading.value = value
  }

  /**
   * clearError - Clear error message
   * Used before new login/signup attempts
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * setError - Set error message
   * Used to display validation or server errors
   */
  const setError = (message) => {
    error.value = message
  }

  /**
   * setUser - Set user data
   * Used after successful signup/login from backend
   */
  const setUser = (userData) => {
    user.value = userData
    isAuthenticated.value = true
  }

  /**
   * initFromStorage - Initialize auth state from localStorage
   * Called on app startup to restore session
   */
  const initFromStorage = () => {
    const token = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        user.value = JSON.parse(storedUser)
        isAuthenticated.value = true
      } catch (err) {
        console.error('Failed to parse stored user data:', err)
        logout()
      }
    }
  }

  // ──────────────────────────────────────────────────────
  // RETURN PUBLIC API
  // ──────────────────────────────────────────────────────
  /**
   * Exported state and methods available to components
   * 
   * Access in component:
   * const auth = useAuthStore()
   * 
   * Then use:
   * - auth.user - current user object
   * - auth.role - current user's role
   * - auth.isAuthenticated - whether logged in
   * - auth.isLoading - whether login in progress
   * - auth.error - current error message
   * - auth.login(email, password) - perform login
   * - auth.logout() - perform logout
   * - auth.setLoading(value) - set loading state
   * - auth.clearError() - clear error message
   * - auth.setError(message) - set error message
   * - auth.setUser(userData) - set user data
   * - auth.initFromStorage() - restore session from localStorage
   */
  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setLoading,
    clearError,
    setError,
    setUser,
    initFromStorage
  }
})
