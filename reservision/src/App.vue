<script>
/**
 * ============================================================
 * App.vue - Root Application Component
 * ============================================================
 * 
 * Purpose:
 * - Root Vue component for the entire Reservision application
 * - Entry point for all routes
 * - Sets up application-wide context and layout
 * 
 * Features:
 * - <router-view /> renders the current route component
 * - Supports all pages (home, login, admin, customer, etc.)
 * - Works with Vue Router for SPA (Single Page Application) navigation
 * 
 * Structure:
 * - No global layout wrapper (each page defines its own layout)
 * - Router manages navigation and page transitions
 * - Pinia stores provide global state management
 * 
 * Usage Flow:
 * 1. main.js loads this component
 * 2. <router-view /> displays matched route component
 * 3. Router guard (in router/index.js) checks authentication
 * 4. User navigates → route changes → new component rendered
 * 
 * Styling:
 * - Global styles are in style.css
 * - Component-specific styles in individual .vue files
 * 
 * Related Files:
 * - src/router/index.js: Route definitions and guards
 * - src/main.js: Application initialization
 * - src/stores/: Global state (auth, user data, etc.)
 */
</script>

<template>
  <!-- 
    Router View Component
    
    Purpose: Renders the component corresponding to current route
    - Changes based on navigation (e.g., / → HomePage, /login → LoginPage)
    - Route matches determined by router/index.js
    - Route guards enforced before rendering (authentication, authorization)
    
    Example Flow:
    - User accesses /login → LoginPage component rendered
    - User logs in → redirect to /dashboard → Dashboard component rendered
    - User clicks "Logout" → redirect to / → HomePage rendered
  -->
  <router-view />

</template>

<script setup>
/**
 * Setup Block
 * 
 * Currently empty - could add:
 * - Global component listeners
 * - Application-wide initialization
 * - Global error handlers
 * - Global loading states
 * 
 * If needed in future, examples:
 * - const auth = useAuthStore() - Check if user logged in on app load
 * - Emit global events for notifications
 * - Handle app-wide keyboard shortcuts
 */
</script> 
