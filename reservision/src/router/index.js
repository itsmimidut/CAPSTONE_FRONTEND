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
 * - Role-based access control (roles: ['admin', 'restaurantstaff', 'receptionist'])
 * - Automatic redirection for unauthorized access
 * - Scroll-to-top on route change
 * 
 * Usage: Import this router in main.js and use app.use(router)
 */

import { createRouter, createWebHistory } from 'vue-router'
import { storeToRefs } from 'pinia'
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
import ConfirmationModal from '../components/ConfirmationModal.vue'
import ConfirmationPage from '../views/ConfirmationPage.vue'
import ContactBillingForm from '../components/ContactBillingForm.vue'
import ConfirmationBooking from '../views/website/ConfirmationBooking.vue'
import BookingConfirmationModal from '../components/BookingConfirmation.vue'
import PaymentReturn from '../views/PaymentReturn.vue'

// ============================================================
// CUSTOMER PAGES IMPORTS
// ============================================================
// Pages for authenticated customers only
// 👤 Customer
import CustomerDashboard from '../views/customer/CustomerDashboard.vue'
import ReservationSection from '../components/Customer/ReservationSection.vue'
import CustomerBookingConfirmation from '../components/Customer/CustomerBookingConfirmation.vue'
import MyOrders from '../views/website/MyOrders.vue'

// ============================================================
// ADMIN PAGES IMPORTS
// ============================================================
// Pages accessible to admin/restaurantstaff/receptionist roles only
// 🧑‍💼 Shared Dashboard (Admin + Staff)
import Dashboard from '../views/admin/AdminDashboard.vue'
import POS from '../views/admin/POS.vue'

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
import WebsiteReservation from '../views/website/Reservation.vue'
import SalesReport from '../views/admin/SalesReport.vue'
import LandingPage from '../views/website/LandingPage.vue'
// import CustomerDashboard from '../views/customer/CustomerDashboard.vue'

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
//     roles: ['admin', 'restaurantstaff', 'receptionist']  // Allowed user roles (if requiresAuth true)
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
  { path: '/reservation', name: 'ReservationLegacy', redirect: '/websitereservation' },
  { path: '/websitereservation', name: 'WebsiteReservation', component: WebsiteReservation, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/booking', name: 'ConfirmationBooking', component: ConfirmationBooking },
  { path: '/confirmation', name: 'Confirmation', component: ConfirmationPage },
  { path: '/booking-confirmation', name: 'BookingConfirmationModal', component: BookingConfirmationModal },
  { path: '/payment-return', name: 'PaymentReturn', component: PaymentReturn },

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
    path: '/customer/reservations',
    name: 'CustomerReservations',
    component: ReservationSection,
    meta: { requiresAuth: true, role: 'customer' }
  },
  {
    path: '/customer/booking-confirmation',
    name: 'CustomerBookingConfirmation',
    component: CustomerBookingConfirmation,
    meta: { requiresAuth: true, role: 'customer' }
  },
  {
    path: '/customer/orders',
    name: 'MyOrders',
    component: MyOrders,
    meta: { requiresAuth: true, role: 'customer' }
  },
  // {
  //   path: '/reservation',
  //   name: 'Reservation',
  //   component: Reservation,
  //   meta: { requiresAuth: true, role: 'customer' }
  // },

  // ────────────────────────────────────────────────────────
  // ADMIN/STAFF SHARED ROUTES
  // ────────────────────────────────────────────────────────
  // 🧑‍💼 Admin + Staff (SAME dashboard)
  // Accessible to admin, restaurant staff, and reception roles
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, roles: ['admin', 'receptionist', 'restaurantstaff'] }
  },
  {
    path: '/pos',
    name: 'POS',
    component: POS,
    meta: { requiresAuth: true, roles: ['admin', 'receptionist', 'restaurantstaff'] }
  },

  // Sales Report (Admin + Staff)
  {
    path: '/admin/sales-report',
    name: 'SalesReport',
    component: SalesReport,
    meta: { requiresAuth: true, roles: ['admin', 'receptionist', 'restaurantstaff'] }
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
    meta: { requiresAuth: true, roles: ['admin', 'receptionist'] }
  },

  // Reservation Management (shared with staff)
  {
    path: '/admin/reservations',
    name: 'ReservationManagement',
    component: ReservationManagement,
    meta: { requiresAuth: true, roles: ['admin', 'receptionist'] }
  },

  // Restaurant Management
  {
    path: '/admin/restaurants',
    name: 'RestaurantManagement',
    component: RestaurantManagement,
    meta: { requiresAuth: true, roles: ['admin', 'restaurantstaff'] }
  },
  {
    path: '/admin/restaurants/tables',
    name: 'RestaurantTables',
    component: RestaurantTables,
    meta: { requiresAuth: true, roles: ['admin', 'restaurantstaff'] }
  },
  {
    path: '/admin/restaurants/menu',
    name: 'RestaurantMenu',
    component: RestaurantMenu,
    meta: { requiresAuth: true, roles: ['admin', 'restaurantstaff'] }
  },
  {
    path: '/admin/restaurants/inventory',
    name: 'RestaurantInventory',
    component: RestaurantInventory,
    meta: { requiresAuth: true, roles: ['admin', 'restaurantstaff'] }
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

  // ─────────────────────────────────────────────────────────────────────────
  // Timing-safe state hydration
  //
  // Root cause of "need to refresh before the page shows" bug:
  //   After login (especially Google renderButton popup), router.push() can be
  //   called from an async callback that fires outside Vue's synchronous update
  //   cycle.  In that window the Pinia `isAuthenticated` ref may still read as
  //   false even though localStorage was already updated by loginWithGoogle().
  //
  // Fix: if Pinia says the user is not authenticated, ask initFromStorage() to
  //   try reading the token+user from localStorage right now (before we apply
  //   any guard logic).  This is side-effect-free when no valid session exists,
  //   and synchronously sets isAuthenticated = true when a valid one is found.
  // ─────────────────────────────────────────────────────────────────────────
  if (!auth.isAuthenticated) {
    auth.initFromStorage()
  }

  const { isAuthenticated, role } = storeToRefs(auth)
  const currentRole = String(role.value || '').toLowerCase()

  /**
   * Check 1: Authentication requirement
   * If route requires auth (requiresAuth: true) but user is not logged in,
   * redirect to login page with the intended destination as a query param so
   * we can redirect back after a successful login.
   */
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  /**
   * Check 2: Role-based access control (array form — used by admin routes)
   * If route specifies allowed roles and user's role is not in the list,
   * redirect to home page.
   */
  if (to.meta.roles) {
    const allowedRoles = to.meta.roles.map((item) => String(item).toLowerCase())
    if (!allowedRoles.includes(currentRole)) {
      return next('/')
    }
  }

  /**
   * Check 3: Single-role access control (string form — used by customer routes)
   */
  if (to.meta.role) {
    const requiredRole = String(to.meta.role).toLowerCase()
    if (requiredRole !== currentRole) {
      return next('/')
    }
  }

  /**
   * All checks passed — allow navigation
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
