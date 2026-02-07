<template>
  <div class="customer-layout">
    <CustomerSidebar
      :is-open="sidebarOpen"
      :is-collapsed="sidebarCollapsed"
      :items="menuItems"
      :active-section="activeSection"
      brand="Reservision"
      user-name="Charles"
      user-role="Customer"
      @select="setActiveSection"
      @close="sidebarOpen = false"
    />

    <main class="main-content" :class="{ shifted: sidebarCollapsed }">
      <div class="header-container">
        <AdminHeader
          title="Customer Dashboard"
          subtitle="Welcome back, Charles"
          user-name="Charles"
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
      </div>

      <div class="content-wrapper">
        <CustomerDashboardSection
          v-show="activeSection === 'dashboard'"
          :summary-cards="summaryCards"
          :recent-activity="recentActivity"
          :recommended-rooms="recommendedRooms"
          customer-name="Charles"
        />

        <CustomerBookSection
          v-show="activeSection === 'book'"
          :rooms="bookRooms"
        />

        <CustomerReservationsSection
          v-show="activeSection === 'reservations'"
          :reservations="reservations"
        />

        <CustomerProfileSection
          v-show="activeSection === 'profile'"
          :profile="profile"
        />

        <CustomerSupportSection
          v-show="activeSection === 'support'"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminHeader from '../../components/admin/AdminHeader.vue';
import CustomerSidebar from '../../components/Customer/CustomerSidebar.vue';
import CustomerDashboardSection from '../../components/Customer/CustomerDashboardSection.vue';
import CustomerBookSection from '../../components/Customer/CustomerBookSection.vue';
import CustomerReservationsSection from '../../components/Customer/CustomerReservationsSection.vue';
import CustomerProfileSection from '../../components/Customer/CustomerProfileSection.vue';
import CustomerSupportSection from '../../components/Customer/CustomerSupportSection.vue';

const activeSection = ref('dashboard');

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
  { id: 'book', label: 'Book a Room', icon: 'fa-bed' },
  { id: 'reservations', label: 'My Reservations', icon: 'fa-calendar-alt' },
  { id: 'profile', label: 'Profile', icon: 'fa-user' },
  { id: 'support', label: 'Support', icon: 'fa-comment-dots' },
];

const summaryCards = [
  { title: 'Upcoming Stay', value: '2 Nights' },
  { title: 'Total Bookings', value: '6' },
  { title: 'Loyalty Points', value: '340' },
  { title: 'Unread Messages', value: '3' },
];

const recentActivity = [
  { date: 'Nov 2, 2025', activity: 'Booked Family Room', status: 'Confirmed', statusClass: 'text-emerald-600 font-semibold' },
  { date: 'Oct 29, 2025', activity: 'Profile Updated', status: 'Completed', statusClass: 'text-gray-600' },
  { date: 'Oct 15, 2025', activity: 'Stayed in Deluxe Suite', status: 'Completed', statusClass: 'text-gray-600' },
];

const recommendedRooms = [
  {
    title: 'Sea View Room',
    price: 'PHP 3,200 / night',
    imageUrl: 'https://images.unsplash.com/photo-1600585154356-596af9009d99?auto=format&fit=crop&w=800&q=60',
  },
  {
    title: 'Mountain Cabin',
    price: 'PHP 2,900 / night',
    imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60',
  },
];

const bookRooms = [
  {
    title: 'Deluxe Suite',
    price: 'PHP 2,500 / night',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60',
  },
  {
    title: 'Family Room',
    price: 'PHP 3,800 / night',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60',
  },
  {
    title: 'Executive Room',
    price: 'PHP 4,200 / night',
    imageUrl: 'https://images.unsplash.com/photo-1600585154207-3b1e8e8b1d75?auto=format&fit=crop&w=800&q=60',
  },
];

const reservations = [
  {
    roomType: 'Deluxe Suite',
    checkIn: 'Nov 5, 2025',
    checkOut: 'Nov 7, 2025',
    status: 'Confirmed',
    statusClass: 'text-emerald-600 font-semibold',
  },
  {
    roomType: 'Family Room',
    checkIn: 'Oct 15, 2025',
    checkOut: 'Oct 18, 2025',
    status: 'Completed',
    statusClass: 'text-gray-500 font-medium',
  },
];

const profile = {
  fullName: 'John Doe',
  email: 'johndoe@email.com',
  phone: '+63 912 345 6789',
};

const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);

const setActiveSection = (sectionId) => {
  activeSection.value = sectionId;
};
</script>

<style scoped>
.customer-layout {
  min-height: 100vh;
  background: linear-gradient(to bottom, #F8F7F4, #FFFFFF);
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
}

@media (min-width: 768px) {
  .customer-layout {
    grid-template-columns: 260px 1fr;
    grid-template-rows: 1fr;
  }
}

.customer-layout > :nth-child(1) {
  grid-column: 1;
  grid-row: 1;
  z-index: 30;
}

@media (min-width: 768px) {
  .customer-layout > :nth-child(1) {
    grid-row: 1 / -1;
  }
}

.main-content {
  margin-left: 0;
  min-height: 100vh;
  background-color: #F8F7F4;
  transition: margin-left 0.3s ease;
  padding: 0.75rem;
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
}

.header-container {
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  top: 0;
  z-index: 50;
  margin-bottom: 10px;
}

.content-wrapper {
  padding-top: 4.5rem;
}

@media (min-width: 768px) {
  .main-content {
    grid-column: 2;
    grid-row: 1;
    padding: 1.5rem;
  }

  .main-content.shifted {
    grid-column: 2;
  }

  .content-wrapper {
    padding-top: 5rem;
  }
}
</style>