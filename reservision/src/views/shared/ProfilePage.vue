<template>
  <div class="profile-layout">
    <CustomerSidebar
      v-if="isCustomer"
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      :items="customerMenuItems"
      :active-section="'profile'"
      brand="Eduardo's Resort"
      :user-name="displayName"
      user-role="Customer"
      @select="handleCustomerSidebarSelect"
      @close="sidebarOpen = false"
    />

    <AdminSidebar
      v-else
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      @close="sidebarOpen = false"
    />

    <main class="main-content" :class="{ shifted: sidebarCollapsed }">
      <header class="compact-header">
        <div class="header-left">
          <button class="hamburger-btn" @click="sidebarOpen = !sidebarOpen">
            <i class="fas fa-bars"></i>
          </button>
          <div class="header-text">
            <h1>Profile Settings</h1>
            <p>Manage your account information</p>
          </div>
        </div>
      </header>

      <div class="content-wrap">
        <CustomerProfileSection
          :profile="profile"
          @profile-updated="onProfileUpdated"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import CustomerSidebar from '../../components/Customer/CustomerSidebar.vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'
import CustomerProfileSection from '../../components/Customer/CustomerProfileSection.vue'

const apiBase = 'http://localhost:8000/api'
const auth = useAuthStore()
const router = useRouter()

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const profile = ref({
  fullName: 'Guest',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  postalCode: '',
  profileImage: ''
})

const normalizedRole = computed(() => String(auth.user?.role || '').toLowerCase())
const isCustomer = computed(() => normalizedRole.value === 'customer')

const displayName = computed(() => {
  const user = auth.user || {}
  return String(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User')
})

const customerMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
  { id: 'book', label: 'Book a Room', icon: 'fa-bed' },
  { id: 'reservations', label: 'My Reservations', icon: 'fa-calendar-alt' },
  { id: 'esop', label: 'Resort E-Shop', icon: 'fa-shopping-cart' },
  { id: 'orders', label: 'My Orders', icon: 'fa-receipt' },
  { id: 'profile', label: 'Profile', icon: 'fa-user' }
]

const handleCustomerSidebarSelect = (id) => {
  if (id === 'profile') return
  router.push({ path: '/customer', query: { section: id } })
}

const onProfileUpdated = (updated) => {
  profile.value = { ...profile.value, ...updated }

  const currentStored = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  })()

  const nextUser = {
    ...currentStored,
    ...(auth.user || {}),
    firstName: updated.firstName ?? auth.user?.firstName ?? currentStored.firstName ?? '',
    lastName: updated.lastName ?? auth.user?.lastName ?? currentStored.lastName ?? '',
    name: updated.fullName ?? auth.user?.name ?? currentStored.name ?? '',
    email: updated.email ?? auth.user?.email ?? currentStored.email ?? '',
    phone: updated.phone ?? auth.user?.phone ?? currentStored.phone ?? '',
    role: auth.user?.role ?? currentStored.role ?? 'customer',
    profileImage: updated.profileImage ?? auth.user?.profileImage ?? currentStored.profileImage ?? ''
  }

  localStorage.setItem('user', JSON.stringify(nextUser))
  auth.setUser(nextUser)
}

const fetchProfile = async () => {
  const user = auth.user || {}
  const email = String(user.email || '').trim()
  if (!email) return

  try {
    const res = await fetch(`${apiBase}/customers/profile/${encodeURIComponent(email)}`)
    if (!res.ok) {
      profile.value = {
        ...profile.value,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'User',
        email: user.email || '',
        phone: user.phone || ''
      }
      return
    }

    const payload = await res.json()
    const customer = payload?.customer || {}
    profile.value = {
      fullName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || user.name || 'User',
      firstName: customer.firstName || user.firstName || '',
      lastName: customer.lastName || user.lastName || '',
      email: customer.email || user.email || '',
      phone: customer.phone || user.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || '',
      postalCode: customer.postalCode || '',
      profileImage: customer.profileImage || user.profileImage || ''
    }
  } catch {
    profile.value = {
      ...profile.value,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'User',
      email: user.email || '',
      phone: user.phone || ''
    }
  }
}

onMounted(() => {
  auth.initFromStorage()
  fetchProfile()
})
</script>

<style scoped>
.profile-layout {
  min-height: 100vh;
  display: flex;
  background: #f0f9ff;
}

/* Main Content */
.main-content {
  flex: 1;
  min-width: 0;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-content.shifted {
  margin-left: 70px;
}

/* Compact Header */
.compact-header {
  background: linear-gradient(135deg, #0C3B5E 0%, #0369a1 100%);
  border-bottom: 3px solid #F4C400;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hamburger-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.hamburger-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.header-text h1 {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0 0 2px 0;
}

.header-text p {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

/* Content Wrap - No Scroll */
.content-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

/* Hide scrollbar for cleaner look */
.content-wrap::-webkit-scrollbar {
  width: 6px;
}

.content-wrap::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.content-wrap::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.content-wrap::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 767px) {
  .main-content {
    margin-left: 0 !important;
  }
  
  .compact-header {
    padding: 0 16px;
    height: 56px;
  }
  
  .hamburger-btn {
    display: flex;
  }
  
  .header-text h1 {
    font-size: 16px;
  }
  
  .header-text p {
    font-size: 10px;
  }
  
  .content-wrap {
    padding: 16px;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .main-content {
    margin-left: 240px;
  }
  
  .main-content.shifted {
    margin-left: 65px;
  }
  
  .content-wrap {
    padding: 20px;
  }
}

@media (min-width: 1025px) {
  .content-wrap {
    padding: 24px 32px;
  }
}
</style>