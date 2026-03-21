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
      <header v-if="isCustomer" class="customer-header">
        <div class="header-left">
          <button class="hamburger-btn" @click="sidebarOpen = !sidebarOpen">
            <i class="fas fa-bars"></i>
          </button>
          <div>
            <h1 class="header-title">Profile Settings</h1>
            <p class="header-subtitle">Manage your account information</p>
          </div>
        </div>
      </header>

      <div v-else class="admin-header-wrap">
        <AdminHeader
          title="Profile Settings"
          subtitle="Manage your account information"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

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
import AdminHeader from '../../components/Admin/AdminHeader.vue'
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
      // For non-customer roles or missing customer record, fallback to auth user info.
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
  background: #eef5fb;
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  margin-left: 262px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.main-content.shifted {
  margin-left: 72px;
}

@media (max-width: 767px) {
  .main-content {
    margin-left: 0 !important;
  }
}

.customer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1.5rem;
  height: 64px;
  background: linear-gradient(135deg, #0c3b5e 0%, #0369a1 60%, #1f8dbf 100%);
  border-bottom: 3px solid #f4c400;
  box-shadow: 0 2px 14px rgba(12, 59, 94, 0.3);
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.95rem;
  cursor: pointer;
}

@media (min-width: 768px) {
  .hamburger-btn {
    display: none;
  }
}

.header-title {
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.header-subtitle {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0.2rem 0 0;
}

.admin-header-wrap {
  min-height: 60px;
}

.content-wrap {
  padding: 1.25rem 1.5rem;
}

@media (max-width: 640px) {
  .content-wrap {
    padding: 0.85rem;
  }
}
</style>
