/**
 * ============================================================
 * Vue Router Configuration
 * ============================================================
 * 
 * Purpose: Central routing configuration for the Reservision App
 * This file defines:
 * - All application routes (public, customer, admin)
 * - Route access control via meta properties
 * - Global route guards for authentication & authorization
 * 
 * Key Features:
 * - Authentication-required routes (requiresAuth: true)
 * - Role-based access control (roles: ['admin', 'staff'])
 * - Automatic redirection for unauthorized access
 * - Scroll-to-top on route change
 * 
 * Usage: Import this router in main.js and use app.use(router)
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// ============================================================
// PUBLIC PAGES IMPORTS
// ============================================================
// These pages are accessible without authentication
// 🌍 Public pages
import HomePage from '../views/website/HomePage.vue'
import AboutPage from '../views/website/AboutPage.vue'
import AmenitiesPage from '../views/website/AmenitiesPage.vue'
import RatesPage from '../views/website/RatesPage.vue'
import GalleryPage from '../views/website/GalleryPage.vue'
import ContactPage from '../views/website/ContactPage.vue'
import Swimming from '../views/website/Swimming.vue'
import LoginPage from '../views/website/LoginPage.vue'
import SignupPage from '../views/website/SignupPage.vue'

// ============================================================
// CUSTOMER PAGES IMPORTS
// ============================================================
// Pages for authenticated customers only
// 👤 Customer
import CustomerDashboard from '../views/customer/CustomerDashboard.vue'
import Reservation from '../views/website/Reservation.vue'

// ============================================================
// ADMIN PAGES IMPORTS
// ============================================================
// Pages accessible to admin and/or staff roles only
// 🧑‍💼 Shared Dashboard (Admin + Staff)
import Dashboard from '../views/admin/AdminDashboard.vue'

// 🛠 Admin-only pages
import UserManagement from '../views/admin/UserManagement.vue'
import ReservationManagement from '../views/admin/ReservationManagement.vue'
import RestaurantManagement from '../views/admin/RestaurantManagement.vue'
import RestaurantTables from '../views/admin/RestaurantTables.vue'
import RestaurantMenu from '../views/admin/RestaurantMenu.vue'
import RestaurantInventory from '../views/admin/RestaurantInventory.vue'
import RoomsOnly from '../views/admin/RoomsOnly.vue'
import CottagesOnly from '../views/admin/CottagesOnly.vue'
import EventsOnly from '../views/admin/EventsOnly.vue'
import SwimmingManagement from '../views/admin/SwimmingManagement.vue'
import RoomandCottageManagement from '../views/admin/RoomAndCottage.vue'

// ============================================================
// ROUTES DEFINITION
// ============================================================
// Route structure:
// {
//   path: '/url-path',           // URL path in browser
//   name: 'RouteName',           // Unique route identifier
//   component: ComponentName,    // Vue component to render
//   meta: {                      // Route metadata for guards
//     requiresAuth: boolean,     // Requires user to be logged in
//     roles: ['admin', 'staff']  // Allowed user roles (if requiresAuth true)
//   }
// }
const routes = [
  // ────────────────────────────────────────────────────────
  // PUBLIC ROUTES - No authentication required
  // ────────────────────────────────────────────────────────
  // 🌍 Public
  { path: '/', name: 'Home', component: HomePage },
  { path: '/amenities', name: 'Amenities', component: AmenitiesPage },
  { path: '/rates', name: 'Rates', component: RatesPage },
  { path: '/gallery', name: 'Gallery', component: GalleryPage },
  { path: '/contact', name: 'Contact', component: ContactPage },
  { path: '/about', name: 'About', component: AboutPage },
  { path: '/swimming', name: 'Swimming', component: Swimming },

  // ────────────────────────────────────────────────────────
  // AUTHENTICATION ROUTES
  // ────────────────────────────────────────────────────────
  // 🔐 Auth
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/signup', name: 'Signup', component: SignupPage },

  // ────────────────────────────────────────────────────────
  // CUSTOMER ROUTES - Requires authentication + 'customer' role
  // ────────────────────────────────────────────────────────
  // 👤 Customer
  {
    path: '/customer',
    name: 'CustomerDashboard',
    component: CustomerDashboard,
    meta: { requiresAuth: true, role: 'customer' }
  },
  {
    path: '/reservation',
    name: 'Reservation',
    component: Reservation,
    meta: { requiresAuth: true, role: 'customer' }
  },

  // ────────────────────────────────────────────────────────
  // ADMIN/STAFF SHARED ROUTES
  // ────────────────────────────────────────────────────────
  // 🧑‍💼 Admin + Staff (SAME dashboard)
  // Accessible to both admin and staff roles
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, roles: ['admin', 'staff'] }
  },

  // ────────────────────────────────────────────────────────
  // ADMIN-ONLY ROUTES - Requires 'admin' role
  // ────────────────────────────────────────────────────────
  // 🛠 Admin ONLY
  // User Management
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, roles: ['admin'] }
  },

  // Rooms & Cottages Management
  {
    path: '/admin/rooms',
    name: 'RoomandCottageManagement',
    component: RoomandCottageManagement,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/rooms/rooms',
    name: 'RoomsOnly',
    component: RoomsOnly,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/rooms/cottages',
    name: 'CottagesOnly',
    component: CottagesOnly,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/rooms/events',
    name: 'EventsOnly',
    component: EventsOnly,
    meta: { requiresAuth: true, roles: ['admin'] }
  },

  // Swimming Management
  {
    path: '/admin/swimming',
    name: 'SwimmingManagement',
    component: SwimmingManagement,
    meta: { requiresAuth: true, roles: ['admin'] }
  },

  // Reservation Management (shared with staff)
  {
    path: '/admin/reservations',
    name: 'ReservationManagement',
    component: ReservationManagement,
    meta: { requiresAuth: true, roles: ['admin', 'staff'] }
  },

  // Restaurant Management
  {
    path: '/admin/restaurants',
    name: 'RestaurantManagement',
    component: RestaurantManagement,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/restaurants/tables',
    name: 'RestaurantTables',
    component: RestaurantTables,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/restaurants/menu',
    name: 'RestaurantMenu',
    component: RestaurantMenu,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/restaurants/inventory',
    name: 'RestaurantInventory',
    component: RestaurantInventory,
    meta: { requiresAuth: true, roles: ['admin'] }
  }
]

// ============================================================
// ROUTER INSTANCE CREATION
// ============================================================
// Purpose: Creates and configures the Vue Router instance
// 
// Parameters:
// - history: createWebHistory() - Uses browser History API for URL management
// - routes: Route definitions array (defined above)
// - scrollBehavior: Automatically scroll to top on route change
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// ============================================================
// GLOBAL ROUTE GUARD - beforeEach
// ============================================================
// Purpose: Protect routes by enforcing authentication & authorization
// Executes BEFORE each route navigation
// 
// Logic Flow:
// 1. Check if route requires authentication (requiresAuth: true)
// 2. If required but user not logged in → Redirect to /login
// 3. Check if route has role restrictions (roles: [...])
// 4. If user doesn't have required role → Redirect to home (/)
// 5. Otherwise allow navigation (next())
// 
// Usage: Automatically applied to all routes
// Meta Properties Used:
// - to.meta.requiresAuth: Boolean - Whether authentication is required
// - to.meta.roles: Array - Allowed user roles (['admin', 'staff', 'customer'])
// - auth.isAuthenticated: Boolean - Whether user is logged in
// - auth.role: String - Current user's role
/* 🔐 GLOBAL ROUTE GUARD */
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  /**
   * Check 1: Authentication requirement
   * If route requires auth (requiresAuth: true) but user is not logged in,
   * redirect to login page
   */
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }

  /**
   * Check 2: Role-based access control
   * If route specifies allowed roles and user's role is not in the list,
   * redirect to home page (or could use '/403' for forbidden page)
   */
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return next('/') // Could redirect to '/403' instead
  }

  /**
   * All checks passed - Allow navigation
   */
  next()
})

// ============================================================
// EXPORT ROUTER
// ============================================================
// Export the configured router instance to be used in main.js
// Usage in main.js:
// import router from './router'
// app.use(router)
export default router
